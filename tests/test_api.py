import io

import cv2
import numpy as np
import pytest

import app as application
import database

app = application.app


@pytest.fixture(autouse=True)
def isolated_database(tmp_path, monkeypatch):
    monkeypatch.setattr(database, 'DATABASE', str(tmp_path / 'attendance.db'))
    database.create_tables()
    database.seed_demo_data()


def create_class(client, department='Information Technology', year='3rd Year', division='B'):
    academic_year_id = client.get('/api/class-selection').get_json()['academic_years'][0]['id']
    response = client.post('/api/class-selection', json={
        'academic_year_id': academic_year_id,
        'year': year,
        'department': department,
        'division': division,
    })
    assert response.status_code == 200
    return response.get_json()['class_id']


def create_student(client, name='Test Student', email='test-student@example.edu', roll_no='101'):
    response = client.post('/api/students', json={
        'name': name,
        'roll_no': roll_no,
        'email': email,
        'phone': '5550100',
    })
    assert response.status_code == 201
    return response.get_json()['student_id']


def test_health_endpoint():
    client = app.test_client()
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.get_json()['status'] == 'ok'


def test_admin_can_read_class_options_but_cannot_create_class():
    client = app.test_client()
    login = client.post('/api/login', json={
        'identifier': 'admin@college.edu',
        'password': 'admin123',
        'role': 'admin',
    })
    assert login.status_code == 200
    academic_year_id = client.get('/api/class-selection').get_json()['academic_years'][0]['id']
    response = client.post('/api/class-selection', json={
        'academic_year_id': academic_year_id,
        'year': '1st Year',
        'department': 'Physics',
        'division': 'A',
    })
    assert response.status_code == 403
    assert client.get('/api/class-selection').get_json()['classes'] == []


def test_admin_can_select_existing_class_but_all_mutations_are_faculty_only():
    faculty_client = app.test_client()
    faculty_client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    class_id = create_class(faculty_client)

    admin_client = app.test_client()
    admin_client.post('/api/login', json={
        'identifier': 'admin@college.edu',
        'password': 'admin123',
        'role': 'admin',
    })
    class_row = next(row for row in admin_client.get('/api/class-selection').get_json()['classes'] if row['id'] == class_id)
    selection = admin_client.post('/api/class-selection', json={
        'academic_year_id': class_row['academic_year_id'],
        'year': class_row['year'],
        'department': class_row['department'],
        'division': class_row['division'],
    })
    assert selection.status_code == 200
    assert admin_client.get('/api/dashboard').status_code == 200
    assert admin_client.post('/api/students', json={'name': 'Blocked', 'roll_no': '8', 'email': 'blocked@example.edu'}).status_code == 403
    assert admin_client.post('/api/subjects', json={'subject_code': 'NOPE', 'subject_name': 'Blocked'}).status_code == 403
    assert admin_client.get('/api/faces').status_code == 403
    assert admin_client.post('/api/attendance', json={'subject_id': 1, 'date': '2026-09-30', 'records': [{'student_id': 1, 'status': 'Present'}]}).status_code == 403


def test_admin_dashboard_includes_class_analytics_and_enrollment():
    client = app.test_client()
    login = client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    assert login.status_code == 200

    create_class(client)
    create_student(client)
    client.post('/api/subjects', json={'subject_code': 'TST101', 'subject_name': 'Test Course'})

    dashboard = client.get('/api/dashboard').get_json()['dashboard']
    assert 'by_subject' in dashboard['analytics']
    assert 'recent_attendance' in dashboard
    assert 'password_hash' not in dashboard['students'][0]
    assert 'face_embedding' not in dashboard['students'][0]
    faces = client.get('/api/faces')
    assert faces.status_code == 200
    assert all('sample_count' in student for student in faces.get_json()['students'])


def test_student_dashboard_is_student_scoped_and_cannot_manage_faces():
    client = app.test_client()
    staff_login = client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    assert staff_login.status_code == 200
    create_class(client)
    student_id = create_student(client, 'Student One', 'student-one@example.edu', '12')
    connection = database.get_db_connection()
    student_uid = connection.execute('SELECT student_uid FROM students WHERE id = ?', (student_id,)).fetchone()['student_uid']
    connection.close()
    client.post('/api/logout')
    login = client.post('/api/login', json={
        'identifier': student_uid,
        'password': 'student123',
        'role': 'student',
    })
    assert login.status_code == 200

    dashboard = client.get('/api/dashboard').get_json()
    assert dashboard['role'] == 'student'
    assert dashboard['student']['student_uid'] == student_uid
    assert 'subjects' in dashboard
    assert 'recent_attendance' in dashboard
    assert client.get('/api/faces').status_code == 403


def test_faculty_can_open_assigned_class():
    client = app.test_client()
    login = client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    assert login.status_code == 200
    create_class(client)
    dashboard = client.get('/api/dashboard')
    assert dashboard.status_code == 200
    assert dashboard.get_json()['role'] == 'faculty'


def test_ocr_missing_tesseract_returns_manual_review_roster(monkeypatch):
    client = app.test_client()
    client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    create_class(client)
    create_student(client)
    subject_id = client.post('/api/subjects', json={'subject_code': 'TST101', 'subject_name': 'Test Course'}).get_json()['subject_id']
    image_ok, encoded_image = cv2.imencode('.jpg', np.zeros((100, 100, 3), dtype=np.uint8))
    assert image_ok

    def missing_tesseract(_image):
        raise application.pytesseract.TesseractNotFoundError()

    monkeypatch.setattr(application.pytesseract, 'image_to_string', missing_tesseract)
    response = client.post('/api/attendance-sheet', data={
        'subject_id': str(subject_id),
        'image': (io.BytesIO(encoded_image.tobytes()), 'sheet.jpg'),
    }, content_type='multipart/form-data')
    assert response.status_code == 200
    payload = response.get_json()
    assert payload['status'] == 'review_required'
    assert payload['results']
    assert all(row['status'] == 'Review' for row in payload['results'])


def test_csv_attendance_sheet_matches_roster_and_reconciles_duplicates():
    client = app.test_client()
    client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    create_class(client)
    student_id = create_student(client)
    subject_id = client.post('/api/subjects', json={
        'subject_code': 'TST101',
        'subject_name': 'Test Course',
    }).get_json()['subject_id']

    processed = client.post('/api/attendance-sheet', data={
        'subject_id': str(subject_id),
        'attendance_date': '2026-10-05',
        'image': (io.BytesIO(b'roll_no,attendance\n101,Present\n'), 'sheet.csv'),
    }, content_type='multipart/form-data')
    assert processed.status_code == 200
    result = processed.get_json()['results'][0]
    assert result['student_id'] == student_id
    assert result['status'] == 'Present'
    assert result['confidence'] == 100

    duplicate_rows = client.post('/api/attendance-sheet/confirm', json={
        'subject_id': subject_id,
        'attendance_date': '2026-10-05',
        'records': [
            {'student_id': student_id, 'status': 'Present', 'confidence': 100},
            {'student_id': student_id, 'status': 'Absent', 'confidence': 100},
        ],
    })
    assert duplicate_rows.status_code == 400
    assert 'Duplicate' in duplicate_rows.get_json()['message']

    saved = client.post('/api/attendance-sheet/confirm', json={
        'subject_id': subject_id,
        'attendance_date': '2026-10-05',
        'records': [{'student_id': student_id, 'status': 'Present', 'confidence': 100}],
    })
    assert saved.status_code == 200
    assert saved.get_json()['saved'] == 1

    updated = client.post('/api/attendance-sheet/confirm', json={
        'subject_id': subject_id,
        'attendance_date': '2026-10-05',
        'records': [{'student_id': student_id, 'status': 'Absent', 'confidence': 92}],
    })
    assert updated.status_code == 200
    connection = database.get_db_connection()
    attendance = connection.execute(
        'SELECT status, method, confidence FROM attendance WHERE student_id = ? AND subject_id = ? AND date = ?',
        (student_id, subject_id, '2026-10-05'),
    ).fetchone()
    connection.close()
    assert dict(attendance) == {'status': 'Absent', 'method': 'SHEET', 'confidence': 0.92}


def test_sheet_confirmation_requires_manual_verification_below_threshold():
    client = app.test_client()
    client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    create_class(client)
    student_id = create_student(client)
    subject_id = client.post('/api/subjects', json={
        'subject_code': 'TST101',
        'subject_name': 'Test Course',
    }).get_json()['subject_id']
    response = client.post('/api/attendance-sheet/confirm', json={
        'subject_id': subject_id,
        'attendance_date': '2026-10-05',
        'records': [{'student_id': student_id, 'status': 'Present', 'confidence': 84}],
    })
    assert response.status_code == 400
    assert 'manually verified' in response.get_json()['message']


def test_sheet_ocr_fuzzy_matches_handwritten_name_typos(monkeypatch):
    client = app.test_client()
    client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    create_class(client)
    student_id = create_student(client, 'Test Student', 'test-student@example.edu', '101')
    subject_id = client.post('/api/subjects', json={
        'subject_code': 'TST101',
        'subject_name': 'Test Course',
    }).get_json()['subject_id']
    monkeypatch.setattr(application, 'run_ocr_on_image', lambda _image: 'Test Studeht Present')
    image_ok, encoded_image = cv2.imencode('.jpg', np.full((100, 100, 3), 255, dtype=np.uint8))
    assert image_ok

    response = client.post('/api/attendance-sheet', data={
        'subject_id': str(subject_id),
        'image': (io.BytesIO(encoded_image.tobytes()), 'sheet.jpg'),
    }, content_type='multipart/form-data')
    assert response.status_code == 200
    row = response.get_json()['results'][0]
    assert row['student_id'] == student_id
    assert row['status'] == 'Present'
    assert row['confidence'] >= 85


def test_checkmark_detector_maps_present_and_absent_columns():
    image = np.full((300, 400, 3), 255, dtype=np.uint8)
    for y in (80, 180):
        cv2.rectangle(image, (250, y), (274, y + 24), (0, 0, 0), 2)
        cv2.rectangle(image, (330, y), (354, y + 24), (0, 0, 0), 2)
    cv2.line(image, (257, 93), (262, 99), (0, 0, 0), 2)
    cv2.line(image, (262, 99), (269, 86), (0, 0, 0), 2)
    cv2.line(image, (337, 193), (342, 199), (0, 0, 0), 2)
    cv2.line(image, (342, 199), (349, 186), (0, 0, 0), 2)

    assert application.detect_checkmark_statuses(image, 2) == {0: 'Present', 1: 'Absent'}


def test_faculty_can_create_class_manage_roster_subjects_and_mark_date(isolated_database):
    client = app.test_client()
    login = client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    assert login.status_code == 200
    selection = client.get('/api/class-selection').get_json()
    academic_year_id = selection['academic_years'][0]['id']

    created_class = client.post('/api/class-selection', json={
        'academic_year_id': academic_year_id,
        'year': '2nd Year',
        'department': 'Robotics Engineering',
        'division': 'C',
    })
    assert created_class.status_code == 200
    all_classes = client.get('/api/class-selection').get_json()['classes']
    assert any(row['department'] == 'Robotics Engineering' and row['division'] == 'C' for row in all_classes)

    student_response = client.post('/api/students', json={
        'name': 'Workflow Test Student',
        'roll_no': '9001',
        'email': 'workflow-student@example.edu',
        'phone': '5550101',
    })
    assert student_response.status_code == 201
    student_id = student_response.get_json()['student_id']
    assert client.put(f'/api/students/{student_id}', json={
        'name': 'Updated Workflow Student',
        'roll_no': '9001',
        'email': 'workflow-student@example.edu',
        'phone': '5550102',
    }).status_code == 200

    subject_response = client.post('/api/subjects', json={
        'subject_code': 'ROB201',
        'subject_name': 'Robotics Systems',
        'lecture_type': 'PRACTICAL',
        'total_hours': 36,
    })
    assert subject_response.status_code == 201
    subject_id = subject_response.get_json()['subject_id']
    assert client.put(f'/api/subjects/{subject_id}', json={
        'subject_code': 'ROB202',
        'subject_name': 'Robotics Lab',
        'lecture_type': 'LAB',
        'total_hours': 42,
    }).status_code == 200

    attendance_date = '2026-09-29'
    roster = client.get(f'/api/attendance?subject_id={subject_id}&date={attendance_date}').get_json()['students']
    assert len(roster) == 1
    saved = client.post('/api/attendance', json={
        'subject_id': subject_id,
        'date': attendance_date,
        'records': [{'student_id': student_id, 'status': 'Present'}],
    })
    assert saved.status_code == 200
    assert saved.get_json()['saved'] == 1
    reloaded = client.get(f'/api/attendance?subject_id={subject_id}&date={attendance_date}').get_json()['students']
    assert reloaded[0]['status'] == 'Present'

    assert client.delete(f'/api/students/{student_id}').status_code == 200
    assert client.post('/api/login', json={
        'identifier': 'workflow-student@example.edu',
        'password': 'student123',
        'role': 'student',
    }).status_code == 401
    assert client.delete(f'/api/subjects/{subject_id}').status_code == 200


def test_class_details_can_be_updated_and_empty_class_deleted(isolated_database):
    client = app.test_client()
    login = client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    assert login.status_code == 200
    academic_year_id = client.get('/api/class-selection').get_json()['academic_years'][0]['id']
    create_class(client, 'Cybersecurity', '1st Year', 'A')
    new_class = next(row for row in client.get('/api/class-selection').get_json()['classes'] if row['department'] == 'Cybersecurity')

    updated = client.put(f"/api/classes/{new_class['id']}", json={
        'academic_year_id': academic_year_id,
        'year': '2nd Year',
        'department': 'Information Security',
        'division': 'D',
    })
    assert updated.status_code == 200
    assert any(row['department'] == 'Information Security' and row['division'] == 'D' for row in client.get('/api/class-selection').get_json()['classes'])
    assert client.delete(f"/api/classes/{new_class['id']}").status_code == 200
    assert not any(row['id'] == new_class['id'] for row in client.get('/api/class-selection').get_json()['classes'])

    populated_class_id = create_class(client, 'Electrical Engineering', '4th Year', 'B')
    student_id = create_student(client, 'Preserved Student', 'preserved@example.edu', '404')
    assert client.delete(f"/api/classes/{populated_class_id}").status_code == 200
    assert not any(row['id'] == populated_class_id for row in client.get('/api/class-selection').get_json()['classes'])
    connection = database.get_db_connection()
    archived = connection.execute('SELECT active FROM classes WHERE id = ?', (populated_class_id,)).fetchone()
    preserved = connection.execute('SELECT class_id FROM students WHERE id = ?', (student_id,)).fetchone()
    connection.close()
    assert archived['active'] == 0
    assert preserved['class_id'] == populated_class_id


def test_archived_classes_and_students_can_be_restored():
    client = app.test_client()
    login = client.post('/api/login', json={
        'identifier': 'faculty@college.edu',
        'password': 'faculty123',
        'role': 'faculty',
    })
    assert login.status_code == 200

    class_id = create_class(client, 'Information Technology', '3rd Year', 'B')
    student_id = create_student(client, 'Previously Enrolled', 'previously-enrolled@example.edu', '23')
    assert client.delete(f'/api/students/{student_id}').status_code == 200

    archived_students = client.get('/api/students?include_inactive=true').get_json()['students']
    assert len(archived_students) == 1
    assert archived_students[0]['id'] == student_id
    assert archived_students[0]['active'] == 0
    assert client.get('/api/students').get_json()['students'] == []

    assert client.post(f'/api/students/{student_id}/restore').status_code == 200
    assert client.get('/api/students').get_json()['students'][0]['id'] == student_id

    assert client.delete(f'/api/classes/{class_id}').status_code == 200
    archived_classes = client.get('/api/class-selection').get_json()['archived_classes']
    assert any(class_row['id'] == class_id for class_row in archived_classes)
    assert client.post(f'/api/classes/{class_id}/restore').status_code == 200

    restored_class = next(
        class_row
        for class_row in client.get('/api/class-selection').get_json()['classes']
        if class_row['id'] == class_id
    )
    selection = client.post('/api/class-selection', json={
        'academic_year_id': restored_class['academic_year_id'],
        'year': restored_class['year'],
        'department': restored_class['department'],
        'division': restored_class['division'],
    })
    assert selection.status_code == 200
    dashboard = client.get('/api/dashboard').get_json()['dashboard']
    assert any(student['id'] == student_id for student in dashboard['students'])
