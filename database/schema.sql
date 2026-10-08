-- Smart Attendance System - database schema (SQLite)
-- Structure only. Generated from attendance.db.
-- Create a fresh DB with:  sqlite3 attendance.db < schema.sql

PRAGMA foreign_keys = ON;

CREATE TABLE academic_years (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            academic_year TEXT NOT NULL UNIQUE,
            is_active INTEGER DEFAULT 1
        );

CREATE TABLE attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            subject_id INTEGER NOT NULL,
            attendance_session_id INTEGER,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            method TEXT NOT NULL,
            confidence REAL DEFAULT 0,
            recognized_by TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY (attendance_session_id) REFERENCES attendance_sessions(id) ON DELETE SET NULL,
            UNIQUE (student_id, subject_id, date)
        );

CREATE TABLE attendance_correction_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            subject_id INTEGER,
            attendance_id INTEGER,
            reason TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            faculty_comment TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            resolved_at TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
            FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE SET NULL
        );

CREATE TABLE attendance_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            subject_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT,
            end_time TEXT,
            attendance_method TEXT,
            session_status TEXT DEFAULT 'OPEN',
            created_by INTEGER,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        );

CREATE TABLE attendance_sheet_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            version TEXT,
            settings TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

CREATE TABLE audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id INTEGER,
            old_value TEXT,
            new_value TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT
        );

CREATE TABLE classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            academic_year_id INTEGER NOT NULL,
            year TEXT NOT NULL,
            department TEXT NOT NULL,
            division TEXT NOT NULL, active INTEGER DEFAULT 1,
            FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
        );

CREATE TABLE faculty (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            faculty_code TEXT UNIQUE,
            department TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

CREATE TABLE faculty_class_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            faculty_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
        );

CREATE TABLE notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            class_id INTEGER,
            subject_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            priority TEXT DEFAULT 'NORMAL',
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
        );

CREATE TABLE students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_uid TEXT NOT NULL UNIQUE,
            roll_no TEXT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            class_id INTEGER,
            password_hash TEXT,
            profile_image TEXT,
            face_embedding TEXT,
            face_enrolled INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            active INTEGER DEFAULT 1,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
        );

CREATE TABLE subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_code TEXT NOT NULL,
            subject_name TEXT NOT NULL,
            faculty_id INTEGER,
            class_id INTEGER NOT NULL,
            lecture_type TEXT DEFAULT 'THEORY',
            total_hours INTEGER DEFAULT 0,
            active INTEGER DEFAULT 1,
            FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
        );

CREATE TABLE timetable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            subject_id INTEGER NOT NULL,
            day_of_week TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            room TEXT,
            faculty_id INTEGER,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
            FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
        );

CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT,
            password TEXT,
            role TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
