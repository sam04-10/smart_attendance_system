import { useEffect, useRef, useState } from 'react'
import './App.css'

const emptyCredentials = { identifier: '', password: '', role: 'admin' }
const localDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, { credentials: 'include', ...options })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'Request failed.')
  return payload
}

function AttendanceTable({ rows, studentView = false }) {
<<<<<<< HEAD
  if (!rows?.length) return <p className="empty-state">No attendance records yet.</p>
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Date</th>{!studentView && <th>Student</th>}<th>Subject</th><th>Status</th><th>Method</th></tr></thead>
        <tbody>{rows.map((row, index) => (
          <tr key={`${row.id || row.date}-${index}`}>
            <td>{row.date}</td>{!studentView && <td>{row.name}</td>}<td>{row.subject_name}</td>
            <td><span className={`tag ${row.status.toLowerCase()}`}>{row.status}</span></td><td>{row.method}</td>
          </tr>
        ))}</tbody>
      </table>
=======
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const sourceInfo = {
    OCR: ['📷', 'OCR scan'],
    CAMERA: ['📷', 'Camera recognition'],
    SHEET: ['📄', 'File upload'],
    RFID: ['💳', 'RFID'],
    MANUAL: ['👤', 'Manual edit'],
  }
  const filteredRows = (rows || []).filter((row) => {
    const text = `${row.name || ''} ${row.roll_no || ''} ${row.student_uid || ''} ${row.date || ''} ${row.status || ''}`.toLowerCase()
    return (!search || text.includes(search.toLowerCase()))
      && (!statusFilter || row.status === statusFilter)
      && (!dateFilter || row.date === dateFilter)
  })

  return (
    <div>
      <div className="attendance-filters">
        <input aria-label="Search attendance" placeholder="Search name, roll no, ID or status" value={search} onChange={(event) => setSearch(event.target.value)} />
        <input aria-label="Filter attendance by date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        <select aria-label="Filter attendance by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option><option>Present</option><option>Absent</option><option>Late</option></select>
      </div>
      {filteredRows.length ? <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th>{!studentView && <><th>Student</th><th>Roll / ID</th></>}<th>Subject</th><th>Status</th><th>Source</th></tr></thead>
          <tbody>{filteredRows.map((row, index) => {
            const [icon, label] = sourceInfo[row.method] || ['👤', row.method || 'Manual edit']
            return <tr key={`${row.id || row.date}-${index}`}>
              <td>{row.date}</td>{!studentView && <><td>{row.name}</td><td>{row.roll_no || row.student_uid || '—'}</td></>}<td>{row.subject_name}</td>
              <td><span className={`tag ${(row.status || '').toLowerCase()}`}>{row.status}</span></td>
              <td><span className="tag method" title={label}>{icon} {label}</span></td>
            </tr>
          })}</tbody>
        </table>
      </div> : <p className="empty-state">{rows?.length ? 'No records match these filters.' : 'No attendance records yet.'}</p>}
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
    </div>
  )
}

function StudentWorkspace({ data }) {
  const student = data.student || {}
  const summary = data.summary || {}
  const classInfo = data.class || {}
  const attendance = data.recent_attendance || []
  const subjects = data.subjects || []
  const notifications = data.notifications || []
  const rate = Math.max(0, Math.min(100, summary.percentage || 0))

  return (
    <>
      <header className="topbar">
        <div><p className="eyebrow">Student workspace</p><h1>Welcome, {student.name || 'student'}</h1><p className="subheading">{classInfo.department} · {classInfo.year} · Division {classInfo.division} · {classInfo.academic_year}</p></div>
        <span className="chip">{student.student_uid}</span>
      </header>
      <section className="student-hero">
        <div><span className="eyebrow">Overall attendance</span><strong>{rate}%</strong><p>{summary.present || 0} present of {summary.total || 0} recorded classes</p></div>
        <div className="progress-ring" style={{ '--progress': `${rate}%` }}><span>{rate}%</span></div>
      </section>
      <section className="stats-grid student-stats">
        <div className="stat-card"><span>Classes recorded</span><strong>{summary.total || 0}</strong></div>
        <div className="stat-card"><span>Present</span><strong>{summary.present || 0}</strong></div>
        <div className="stat-card"><span>Absent</span><strong>{summary.absent || 0}</strong></div>
        <div className="stat-card"><span>Late</span><strong>{summary.late || 0}</strong></div>
      </section>
      <section className="panel">
        <div className="section-heading"><div><p className="eyebrow">By course</p><h2>Subject attendance</h2></div></div>
        {subjects.length ? <div className="subject-grid">{subjects.map((subject) => (
          <article className="subject-row" key={subject.id}>
            <div className="subject-title"><div><span className="subject-code">{subject.subject_code}</span><h3>{subject.subject_name}</h3></div><strong>{subject.percentage}%</strong></div>
            <div className="bar-track"><span style={{ width: `${Math.min(subject.percentage, 100)}%` }} /></div>
            <p>{subject.present} present · {subject.absent} absent · {subject.total} recorded</p>
          </article>
        ))}</div> : <p className="empty-state">No subject attendance has been recorded.</p>}
      </section>
      <section className="panel two-column student-lower">
        <div><p className="eyebrow">Recent records</p><h2>Attendance history</h2><AttendanceTable rows={attendance} studentView /></div>
        <div><p className="eyebrow">Updates</p><h2>Notifications</h2>{notifications.length ? <ul className="notification-list">{notifications.map((item) => <li key={item.id}><span>{item.title}</span><p>{item.message}</p><time>{item.created_at}</time></li>)}</ul> : <p className="empty-state">You're all caught up.</p>}</div>
      </section>
    </>
  )
}

function Dashboard() {
  const [credentials, setCredentials] = useState(emptyCredentials)
  const [session, setSession] = useState(null)
  const [data, setData] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
<<<<<<< HEAD
=======
  const [archivedClasses, setArchivedClasses] = useState([])
  const [archivedStudents, setArchivedStudents] = useState([])
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
  const [academicYears, setAcademicYears] = useState([])
  const [classDraft, setClassDraft] = useState({ academic_year_id: '', year: '', department: '', division: '' })
  const [newClassDraft, setNewClassDraft] = useState({ academic_year_id: '', year: '', department: '', division: '' })
  const [editingClassId, setEditingClassId] = useState(null)
  const [studentForm, setStudentForm] = useState({ name: '', roll_no: '', email: '', phone: '' })
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [subjectForm, setSubjectForm] = useState({ subject_code: '', subject_name: '', lecture_type: 'THEORY', total_hours: '30' })
  const [editingSubjectId, setEditingSubjectId] = useState(null)
  const [attendanceSubject, setAttendanceSubject] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(localDate())
  const [attendanceRows, setAttendanceRows] = useState([])
  const [activeView, setActiveView] = useState('overview')
  const [attendanceMode, setAttendanceMode] = useState('manual')
  const [cameraSubject, setCameraSubject] = useState('')
  const [enrollStudent, setEnrollStudent] = useState('')
  const [enrollments, setEnrollments] = useState([])
  const [sheetFile, setSheetFile] = useState(null)
  const [sheetResults, setSheetResults] = useState([])
  const [sheetSubject, setSheetSubject] = useState('')
<<<<<<< HEAD
=======
  const [sheetRotation, setSheetRotation] = useState(0)
  const [sheetCrop, setSheetCrop] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [sheetPreviewUrl, setSheetPreviewUrl] = useState('')
  const [sheetCameraOn, setSheetCameraOn] = useState(false)
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
  const [cameraMessage, setCameraMessage] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [todayLabel, setTodayLabel] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
<<<<<<< HEAD
=======
  const sheetVideoRef = useRef(null)
  const sheetStreamRef = useRef(null)
  const sheetPreviewUrlRef = useRef('')
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c

  const isStaff = session?.role === 'admin' || session?.role === 'faculty'
  const isFaculty = session?.role === 'faculty'

  const loadStaffClassData = async (role = session?.role) => {
    const result = await apiRequest('/api/dashboard')
    setData(result.dashboard)
<<<<<<< HEAD
    const [subjectResult, faceResult] = await Promise.all([
      apiRequest('/api/subjects'),
      role === 'faculty' ? apiRequest('/api/faces') : Promise.resolve({ students: [] }),
    ])
    setSubjects(subjectResult.subjects || [])
    setEnrollments(faceResult.students || [])
=======
    const [subjectResult, faceResult, studentResult] = await Promise.all([
      apiRequest('/api/subjects'),
      role === 'faculty' ? apiRequest('/api/faces') : Promise.resolve({ students: [] }),
      apiRequest('/api/students?include_inactive=true'),
    ])
    setSubjects(subjectResult.subjects || [])
    setEnrollments(faceResult.students || [])
    setArchivedStudents((studentResult.students || []).filter((student) => !student.active))
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
    const firstSubjectId = String(subjectResult.subjects?.[0]?.id || '')
    const firstStudentId = String(faceResult.students?.[0]?.id || '')
    setCameraSubject((current) => subjectResult.subjects?.some((subject) => String(subject.id) === current) ? current : firstSubjectId)
    setSheetSubject((current) => subjectResult.subjects?.some((subject) => String(subject.id) === current) ? current : firstSubjectId)
    setAttendanceSubject((current) => subjectResult.subjects?.some((subject) => String(subject.id) === current) ? current : firstSubjectId)
    setEnrollStudent((current) => faceResult.students?.some((student) => String(student.id) === current) ? current : firstStudentId)
  }

  const initializeRole = async (role, name) => {
    setSession({ role, name })
    setError('')
    if (role === 'student') {
      const result = await apiRequest('/api/dashboard')
      setData(result)
      return
    }
    const selection = await apiRequest('/api/class-selection')
    setClasses(selection.classes || [])
<<<<<<< HEAD
=======
    setArchivedClasses(selection.archived_classes || [])
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
    setAcademicYears(selection.academic_years || [])
    if (!newClassDraft.academic_year_id && selection.academic_years?.length) setNewClassDraft((current) => ({ ...current, academic_year_id: String(selection.academic_years[0].id) }))
    if (!newClassDraft.academic_year_id && selection.academic_years?.length) {
      setNewClassDraft((current) => ({ ...current, academic_year_id: String(selection.academic_years[0].id) }))
    }
    const selected = selection.classes?.find((item) => item.id === selection.selected_class_id)
    if (selected) {
      setClassDraft({ academic_year_id: String(selected.academic_year_id), year: selected.year, department: selected.department, division: selected.division })
      await loadStaffClassData(role)
    } else {
      setData(null)
    }
  }

  useEffect(() => {
    let active = true
    apiRequest('/api/session').then(async (result) => {
      if (!active || !result.logged_in) return
      setTodayLabel(new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }))
      setSession({ role: result.role, name: result.name })
      try {
        if (result.role === 'student') {
          setData(await apiRequest('/api/dashboard'))
        } else {
          const selection = await apiRequest('/api/class-selection')
          setClasses(selection.classes || [])
<<<<<<< HEAD
=======
          setArchivedClasses(selection.archived_classes || [])
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
          setAcademicYears(selection.academic_years || [])
          if (selection.academic_years?.length) setNewClassDraft((current) => ({ ...current, academic_year_id: current.academic_year_id || String(selection.academic_years[0].id) }))
          const selected = selection.classes?.find((item) => item.id === selection.selected_class_id)
          if (selected) {
            setClassDraft({ academic_year_id: String(selected.academic_year_id), year: selected.year, department: selected.department, division: selected.division })
            const dashboardResult = await apiRequest('/api/dashboard')
            setData(dashboardResult.dashboard)
            const [subjectResult, faceResult] = await Promise.all([apiRequest('/api/subjects'), result.role === 'faculty' ? apiRequest('/api/faces') : Promise.resolve({ students: [] })])
            setSubjects(subjectResult.subjects || [])
            setEnrollments(faceResult.students || [])
<<<<<<< HEAD
=======
            const studentResult = await apiRequest('/api/students?include_inactive=true')
            setArchivedStudents((studentResult.students || []).filter((student) => !student.active))
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
          }
        }
      } catch (err) { if (active) setError(err.message) }
    }).catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
<<<<<<< HEAD
  }, [])

=======
    sheetStreamRef.current?.getTracks().forEach((track) => track.stop())
    if (sheetPreviewUrlRef.current) URL.revokeObjectURL(sheetPreviewUrlRef.current)
  }, [])

  useEffect(() => {
    if (sheetCameraOn && sheetVideoRef.current && sheetStreamRef.current) {
      sheetVideoRef.current.srcObject = sheetStreamRef.current
    }
  }, [sheetCameraOn])

>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
  const refresh = async () => {
    setError('')
    try {
      if (session?.role === 'student') {
        setData(await apiRequest('/api/dashboard'))
      } else if (isStaff && data) {
        await loadStaffClassData()
      }
    } catch (err) { setError(err.message) }
  }

  const login = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await apiRequest('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) })
      setTodayLabel(new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }))
      await initializeRole(result.role, credentials.identifier)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const logout = async () => {
    stopCamera()
<<<<<<< HEAD
=======
    stopSheetCamera()
    chooseSheetFile(null)
    setSheetResults([])
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
    await apiRequest('/api/logout', { method: 'POST' }).catch(() => {})
    setSession(null)
    setData(null)
    setSubjects([])
    setEnrollments([])
    setCredentials(emptyCredentials)
    setActiveView('overview')
    setNotice('')
    setError('')
  }

  const saveClass = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await apiRequest('/api/class-selection', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(classDraft) })
<<<<<<< HEAD
      setNotice('Class context updated.')
      const selection = await apiRequest('/api/class-selection')
      setClasses(selection.classes || [])
=======
      chooseSheetFile(null)
      setSheetResults([])
      setNotice('Class context updated.')
      const selection = await apiRequest('/api/class-selection')
      setClasses(selection.classes || [])
      setArchivedClasses(selection.archived_classes || [])
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
      await loadStaffClassData()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const chooseClass = (classId) => {
    const selected = classes.find((item) => String(item.id) === classId)
    if (selected) setClassDraft({ academic_year_id: String(selected.academic_year_id), year: selected.year, department: selected.department, division: selected.division })
  }

  const createClass = async (event) => {
    event.preventDefault()
    try {
      setBusy(true)
      await apiRequest(editingClassId ? `/api/classes/${editingClassId}` : '/api/class-selection', {
        method: editingClassId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClassDraft),
      })
      if (editingClassId) {
        await apiRequest('/api/class-selection', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newClassDraft) })
      }
      setClassDraft(newClassDraft)
      const selection = await apiRequest('/api/class-selection')
      setClasses(selection.classes || [])
<<<<<<< HEAD
=======
      setArchivedClasses(selection.archived_classes || [])
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
      setNotice(editingClassId ? 'Class details updated.' : 'Department, division, and class saved.')
      setEditingClassId(null)
      setNewClassDraft((current) => ({ ...current, year: '', department: '', division: '' }))
      await loadStaffClassData()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const beginClassEdit = (classRow) => {
    setEditingClassId(classRow.id)
    setNewClassDraft({ academic_year_id: String(classRow.academic_year_id), year: classRow.year, department: classRow.department, division: classRow.division })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelClassEdit = () => {
    setEditingClassId(null)
    setNewClassDraft((current) => ({ ...current, year: '', department: '', division: '' }))
  }

  const deleteClass = async (classRow) => {
    if (!window.confirm(`Archive ${classRow.department}, ${classRow.year}, division ${classRow.division}? Student and attendance history will be retained.`)) return
    try {
      await apiRequest(`/api/classes/${classRow.id}`, { method: 'DELETE' })
      const selection = await apiRequest('/api/class-selection')
      setClasses(selection.classes || [])
<<<<<<< HEAD
=======
      setArchivedClasses(selection.archived_classes || [])
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
      if (selection.selected_class_id == null) {
        setClassDraft({ academic_year_id: '', year: '', department: '', division: '' })
        setData(null)
      }
      setNotice('Empty class division deleted.')
    } catch (err) { setError(err.message) }
  }

<<<<<<< HEAD
=======
  const restoreClass = async (classRow) => {
    try {
      setBusy(true)
      await apiRequest(`/api/classes/${classRow.id}/restore`, { method: 'POST' })
      const selection = await apiRequest('/api/class-selection')
      setClasses(selection.classes || [])
      setArchivedClasses(selection.archived_classes || [])
      const restoredClass = selection.classes?.find((item) => item.id === classRow.id)
      if (!restoredClass) throw new Error('The class was restored but is not available in your active class list.')
      const classDetails = {
        academic_year_id: String(restoredClass.academic_year_id),
        year: restoredClass.year,
        department: restoredClass.department,
        division: restoredClass.division,
      }
      await apiRequest('/api/class-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classDetails),
      })
      setClassDraft(classDetails)
      await loadStaffClassData()
      setNotice('Class and its saved records restored.')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
  const resetStudentForm = () => {
    setStudentForm({ name: '', roll_no: '', email: '', phone: '' })
    setEditingStudentId(null)
  }

  const saveStudent = async (event) => {
    event.preventDefault()
    try {
      setBusy(true)
      await apiRequest(editingStudentId ? `/api/students/${editingStudentId}` : '/api/students', {
        method: editingStudentId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      })
      setNotice(editingStudentId ? 'Student details updated.' : 'Student added to this class.')
      resetStudentForm()
      await loadStaffClassData()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const beginStudentEdit = (student) => {
    setStudentForm({ name: student.name, roll_no: student.roll_no || '', email: student.email || '', phone: student.phone || '' })
    setEditingStudentId(student.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteStudent = async (student) => {
    if (!window.confirm(`Remove ${student.name} from this class? Their attendance history is retained.`)) return
    try {
      await apiRequest(`/api/students/${student.id}`, { method: 'DELETE' })
      setNotice('Student removed from the active roster.')
      await loadStaffClassData()
    } catch (err) { setError(err.message) }
  }

<<<<<<< HEAD
=======
  const restoreStudent = async (student) => {
    try {
      setBusy(true)
      await apiRequest(`/api/students/${student.id}/restore`, { method: 'POST' })
      await loadStaffClassData()
      setNotice(`${student.name} restored to the active class roster.`)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
  const resetSubjectForm = () => {
    setSubjectForm({ subject_code: '', subject_name: '', lecture_type: 'THEORY', total_hours: '30' })
    setEditingSubjectId(null)
  }

  const saveSubject = async (event) => {
    event.preventDefault()
    try {
      setBusy(true)
      await apiRequest(editingSubjectId ? `/api/subjects/${editingSubjectId}` : '/api/subjects', {
        method: editingSubjectId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm),
      })
      setNotice(editingSubjectId ? 'Subject updated.' : 'Subject added to this class.')
      resetSubjectForm()
      await loadStaffClassData()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const beginSubjectEdit = (subject) => {
    setSubjectForm({ subject_code: subject.subject_code, subject_name: subject.subject_name, lecture_type: subject.lecture_type || 'THEORY', total_hours: String(subject.total_hours || 0) })
    setEditingSubjectId(subject.id)
  }

  const deleteSubject = async (subject) => {
    if (!window.confirm(`Remove ${subject.subject_name} from this class?`)) return
    try {
      await apiRequest(`/api/subjects/${subject.id}`, { method: 'DELETE' })
      setNotice('Subject removed from the active class list.')
      await loadStaffClassData()
    } catch (err) { setError(err.message) }
  }

  const loadAttendanceRoster = async () => {
    if (!attendanceSubject) return setError('Select a subject first.')
    try {
      setBusy(true)
      const result = await apiRequest(`/api/attendance?subject_id=${attendanceSubject}&date=${attendanceDate}`)
      setAttendanceRows(result.students.map((student) => ({ ...student, status: student.status || '' })))
      setNotice(`Roster loaded for ${attendanceDate}.`)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const saveManualAttendance = async () => {
    const records = attendanceRows.filter((student) => student.status).map(({ id, status }) => ({ student_id: id, status }))
    if (!records.length) return setError('Mark at least one student before saving.')
    try {
      setBusy(true)
      const result = await apiRequest('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_id: attendanceSubject, date: attendanceDate, records }),
      })
      setNotice(`Saved attendance for ${result.saved} students on ${attendanceDate}.`)
      await loadAttendanceRoster()
      await loadStaffClassData()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraOn(true)
      setCameraMessage('Camera ready. Use a clear, well-lit frame.')
    } catch {
      setCameraMessage('Camera access is unavailable. Check browser permission and use localhost or HTTPS.')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  const captureFrame = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) throw new Error('Start the camera and wait for the preview first.')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) throw new Error('Could not capture an image.')
    return blob
  }

  const markFromCamera = async () => {
    if (!cameraSubject) return setCameraMessage('Select a subject first.')
    try {
      setBusy(true)
      const form = new FormData()
      form.append('image', await captureFrame(), 'camera.jpg')
      form.append('subject_id', cameraSubject)
      form.append('attendance_date', attendanceDate)
      const result = await apiRequest('/api/camera-attendance', { method: 'POST', body: form })
      setCameraMessage(`Attendance recorded for ${result.student.name}. Match confidence ${Math.round(result.confidence * 100)}%.`)
      await refresh()
    } catch (err) { setCameraMessage(err.message) } finally { setBusy(false) }
  }

  const saveEnrollment = async () => {
    if (!enrollStudent) return setCameraMessage('Select a student before enrolling a face.')
    try {
      setBusy(true)
      const form = new FormData()
      form.append('image', await captureFrame(), 'enrollment.jpg')
      form.append('student_id', enrollStudent)
      const result = await apiRequest('/api/faces', { method: 'POST', body: form })
      setNotice(`Face sample saved. ${result.sample_count} sample(s) enrolled.`)
      const resultList = await apiRequest('/api/faces')
      setEnrollments(resultList.students || [])
      setCameraMessage('Enrollment saved. Capture additional angles for stronger matching.')
    } catch (err) { setCameraMessage(err.message) } finally { setBusy(false) }
  }

  const removeEnrollment = async (studentId) => {
    if (!window.confirm('Remove all saved face samples for this student?')) return
    try {
      await apiRequest(`/api/faces/${studentId}`, { method: 'DELETE' })
      setEnrollments((rows) => rows.map((row) => row.id === studentId ? { ...row, sample_count: 0, face_enrolled: false } : row))
      setNotice('Face samples removed.')
    } catch (err) { setError(err.message) }
  }

<<<<<<< HEAD
  const processSheet = async (event) => {
    event.preventDefault()
    if (!sheetFile || !sheetSubject) return setError('Choose an image and subject before processing.')
    try {
      setBusy(true)
      const form = new FormData()
      form.append('image', sheetFile)
=======
  const chooseSheetFile = (file) => {
    if (sheetPreviewUrlRef.current) URL.revokeObjectURL(sheetPreviewUrlRef.current)
    const previewUrl = file?.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    sheetPreviewUrlRef.current = previewUrl
    setSheetPreviewUrl(previewUrl)
    setSheetFile(file)
    setSheetResults([])
    setSheetRotation(0)
    setSheetCrop({ x: 0, y: 0, width: 100, height: 100 })
  }

  const startSheetCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      sheetStreamRef.current = stream
      if (sheetVideoRef.current) sheetVideoRef.current.srcObject = stream
      setSheetCameraOn(true)
      setError('')
    } catch {
      setError('Camera access is unavailable. Check browser permission and use localhost or HTTPS.')
    }
  }

  const stopSheetCamera = () => {
    sheetStreamRef.current?.getTracks().forEach((track) => track.stop())
    sheetStreamRef.current = null
    setSheetCameraOn(false)
  }

  const captureSheetPhoto = async () => {
    const video = sheetVideoRef.current
    if (!video?.videoWidth) return setError('Wait for the camera preview before capturing the sheet.')
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) return setError('Could not capture the attendance sheet image.')
    chooseSheetFile(new File([blob], 'attendance-sheet.jpg', { type: 'image/jpeg' }))
    stopSheetCamera()
  }

  const prepareSheetImage = async (file) => {
    if (!file.type.startsWith('image/')) return file
    const bitmap = await createImageBitmap(file)
    const rotation = ((sheetRotation % 360) + 360) % 360
    const rotated = document.createElement('canvas')
    rotated.width = rotation % 180 ? bitmap.height : bitmap.width
    rotated.height = rotation % 180 ? bitmap.width : bitmap.height
    const context = rotated.getContext('2d')
    if (!context) throw new Error('Image editing is not supported by this browser.')
    context.translate(rotated.width / 2, rotated.height / 2)
    context.rotate((rotation * Math.PI) / 180)
    context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)
    bitmap.close()

    const output = document.createElement('canvas')
    output.width = Math.max(1, Math.round(rotated.width * sheetCrop.width / 100))
    output.height = Math.max(1, Math.round(rotated.height * sheetCrop.height / 100))
    const left = Math.min(sheetCrop.x, 100 - sheetCrop.width) * rotated.width / 100
    const top = Math.min(sheetCrop.y, 100 - sheetCrop.height) * rotated.height / 100
    output.getContext('2d')?.drawImage(
      rotated, left, top, output.width, output.height, 0, 0, output.width, output.height,
    )
    const blob = await new Promise((resolve) => output.toBlob(resolve, 'image/jpeg', 0.94))
    if (!blob) throw new Error('Could not prepare the cropped image.')
    return new File([blob], 'attendance-sheet.jpg', { type: 'image/jpeg' })
  }

  const processSheet = async (event) => {
    event.preventDefault()
    if (!sheetFile || !sheetSubject) return setError('Choose a sheet and subject before processing.')
    try {
      setBusy(true)
      const form = new FormData()
      form.append('image', await prepareSheetImage(sheetFile))
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
      form.append('subject_id', sheetSubject)
      form.append('attendance_date', attendanceDate)
      const result = await apiRequest('/api/attendance-sheet', { method: 'POST', body: form })
      if (result.status === 'error') throw new Error(result.message)
<<<<<<< HEAD
      setSheetResults(result.results || [])
      setNotice(result.message || `${result.detected || 0} explicit status(es) detected. Review every row before confirming.`)
=======
      setSheetResults((result.results || []).map((row) => ({ ...row, verified: Boolean(row.verified) })))
      setNotice(result.message || `${result.detected || 0} explicit status(es) detected. Review every row before confirming.`)
      setError('')
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const confirmSheet = async () => {
<<<<<<< HEAD
    try {
      setBusy(true)
      const result = await apiRequest('/api/attendance-sheet/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject_id: sheetSubject, attendance_date: attendanceDate, records: sheetResults }) })
      setNotice(result.message)
      setSheetResults([])
=======
    if (sheetResults.some((row) => row.status === 'Review')) return setError('Resolve every Needs Verification row before submitting.')
    try {
      setBusy(true)
      const records = sheetResults.map(({ student_id, status, confidence, verified }) => ({ student_id, status, confidence, verified }))
      const result = await apiRequest('/api/attendance-sheet/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject_id: sheetSubject, attendance_date: attendanceDate, records }) })
      setNotice(result.message)
      setSheetResults([])
      chooseSheetFile(null)
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
      await refresh()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  if (!session) return (
    <div className="login-page">
      <div className="login-art"><div className="art-mark">A<span>.</span></div><p>Attendance, in focus.</p><h1>One clear view of every class day.</h1><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /></div>
      <main className="login-main"><form className="auth-card" onSubmit={login}>
        <p className="eyebrow">Smart Attendance System</p><h2>Sign in to your workspace</h2><p className="muted">Use your college account to continue.</p>
        <label>Role<select value={credentials.role} onChange={(event) => setCredentials({ ...credentials, role: event.target.value })}><option value="admin">Administrator</option><option value="faculty">Faculty</option><option value="student">Student</option></select></label>
        <label>Email or student ID<input autoComplete="username" value={credentials.identifier} onChange={(event) => setCredentials({ ...credentials, identifier: event.target.value })} placeholder="name@college.edu" required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} required /></label>
        <button className="primary-button" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        {error && <p className="message error" role="alert">{error}</p>}
        <p className="login-footnote">Staff demo accounts: admin@college.edu / admin123 and faculty@college.edu / faculty123. Students sign in with accounts created by faculty.</p>
      </form></main>
    </div>
  )

  const currentClass = classes.find((item) => item.year === classDraft.year && item.department === classDraft.department && item.division === classDraft.division && String(item.academic_year_id) === classDraft.academic_year_id)
  const stats = data?.stats || {}
  const analytics = data?.analytics || {}
  const selectedName = session.name || (session.role === 'student' ? data?.student?.name : '')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setActiveView('overview')}><span className="brand-icon">A</span><span>Attend<span className="brand-light">ance</span><small>COLLEGE PORTAL</small></span></a>
        <p className="nav-label">WORKSPACE</p>
        <nav className="main-nav">
          {(session.role === 'student' ? [['overview', 'Overview'], ['history', 'Attendance history'], ['updates', 'Notifications']] : isFaculty ? [['overview', 'Dashboard'], ['classes', 'Class management'], ['students', 'Student management'], ['subjects', 'Subject management'], ['attendance', 'Attendance']] : [['overview', 'Dashboard']]).map(([id, label]) => <button key={id} className={activeView === id || (id === 'attendance' && ['camera', 'sheets'].includes(activeView)) ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveView(id); if (id === 'attendance') setAttendanceMode('manual') }}><span className="nav-dot" />{label}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="user-badge"><span className="avatar">{selectedName?.slice(0, 1).toUpperCase() || 'U'}</span><div><strong>{selectedName || 'User'}</strong><small>{session.role}</small></div></div><button className="logout-button" onClick={logout}>Sign out</button></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div><p className="eyebrow">{session.role === 'student' ? 'Student portal' : `${session.role} workspace`}</p><h1>{session.role === 'student' ? 'My attendance' : (currentClass ? `${currentClass.department} · ${currentClass.year} ${currentClass.division}` : 'Class workspace')}</h1></div><div className="top-actions"><span className="today-label">{todayLabel}</span><button className="icon-button" title="Refresh data" aria-label="Refresh data" onClick={refresh}>↻</button></div></header>
        {notice && <div className="message success" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice('')}>×</button></div>}
        {error && <div className="message error" role="alert">{error}<button aria-label="Dismiss" onClick={() => setError('')}>×</button></div>}

        {isStaff && <>
          <section className="context-bar"><div><span className="eyebrow">Current class</span><strong>{currentClass ? `${currentClass.academic_year} / ${currentClass.year} / ${currentClass.department} / ${currentClass.division}` : 'Choose or create a class'}</strong><small>{classes.length} class divisions available</small></div><form className="class-switch" onSubmit={saveClass}><select aria-label="Assigned class" value={currentClass?.id || ''} onChange={(event) => chooseClass(event.target.value)}><option value="">Select department and division</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.academic_year} · {item.year} · {item.department} · {item.division}</option>)}</select><button className="small-button" disabled={busy}>Open class</button></form></section>
          {isFaculty && <details className="class-create" open={activeView === 'classes' || Boolean(editingClassId)}><summary>{editingClassId ? 'Edit department / year / division' : '+ Add department / year / division'}</summary><form className="class-create-form" onSubmit={createClass}><label>Academic year<select required value={newClassDraft.academic_year_id} onChange={(event) => setNewClassDraft({ ...newClassDraft, academic_year_id: event.target.value })}><option value="">Select year</option>{academicYears.map((year) => <option key={year.id} value={year.id}>{year.academic_year}</option>)}</select></label><label>Study year<input required value={newClassDraft.year} onChange={(event) => setNewClassDraft({ ...newClassDraft, year: event.target.value })} placeholder="e.g. 3rd Year" /></label><label>Department<input required value={newClassDraft.department} onChange={(event) => setNewClassDraft({ ...newClassDraft, department: event.target.value })} placeholder="e.g. Information Technology" /></label><label>Division<input required value={newClassDraft.division} onChange={(event) => setNewClassDraft({ ...newClassDraft, division: event.target.value })} placeholder="e.g. A, B, C" /></label><div className="form-actions"><button className="small-button" disabled={busy}>{editingClassId ? 'Save class changes' : 'Create and open class'}</button>{editingClassId && <button className="secondary-button" type="button" onClick={cancelClassEdit}>Cancel</button>}</div></form></details>}
        </>}

<<<<<<< HEAD
        {isFaculty && data && <div className="date-context"><span>Selected attendance date</span><input aria-label="Selected attendance date" type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} /></div>}
        {session.role === 'student' && data && <StudentWorkspace data={data} />}
        {isStaff && !data && <section className="empty-workspace"><span className="empty-symbol">↗</span><h2>Select an assigned class</h2><p>Choose a class above to load the roster, attendance analytics, and recognition tools.</p></section>}

        {isFaculty && activeView === 'classes' && <section className="panel management-panel"><div className="section-heading"><div><p className="eyebrow">Academic structure</p><h2>Class management</h2><p className="muted">All academic years, departments, study years, and divisions are listed below. Archive removes a class from active selection while retaining history.</p></div><span className="muted">{classes.length} divisions</span></div><div className="table-wrap"><table><thead><tr><th>Academic year</th><th>Study year</th><th>Department</th><th>Division</th><th>Actions</th></tr></thead><tbody>{classes.map((classRow) => <tr key={classRow.id}><td>{classRow.academic_year}</td><td>{classRow.year}</td><td>{classRow.department}</td><td>{classRow.division}</td><td className="row-actions"><button className="text-button" onClick={() => beginClassEdit(classRow)}>Edit</button><button className="text-button danger-text" onClick={() => deleteClass(classRow)}>Delete</button></td></tr>)}</tbody></table></div><p className="helper-text class-delete-note">Deleting archives the class in the active list. Existing students, subjects, and attendance history remain stored.</p></section>}

        {isStaff && data && activeView === 'overview' && <>
          <section className="stats-grid">
            <div className="stat-card"><span>Students</span><strong>{stats.total_students || 0}</strong><small>Active in this class</small></div><div className="stat-card"><span>Subjects</span><strong>{stats.total_subjects || 0}</strong><small>Current class</small></div><div className="stat-card accent-stat"><span>Present today</span><strong>{stats.present_today || 0}</strong><small>{stats.absent_today || 0} marked absent</small></div><div className="stat-card"><span>Below 75%</span><strong>{stats.low_attendance || 0}</strong><small>Students to follow up</small></div>
=======
        {isFaculty && data && <div className="date-context"><span>Selected attendance date</span><input aria-label="Selected attendance date" type="date" value={attendanceDate} onChange={(event) => { setAttendanceDate(event.target.value); setSheetResults([]) }} /></div>}
        {session.role === 'student' && data && <StudentWorkspace data={data} />}
        {isStaff && !data && <section className="empty-workspace"><span className="empty-symbol">↗</span><h2>Select an assigned class</h2><p>Choose a class above to load the roster, attendance analytics, and recognition tools.</p></section>}

        {isFaculty && activeView === 'classes' && <section className="panel management-panel"><div className="section-heading"><div><p className="eyebrow">Academic structure</p><h2>Class management</h2><p className="muted">All academic years, departments, study years, and divisions are listed below. Archived classes retain their student and attendance history.</p></div><span className="muted">{classes.length} divisions</span></div><div className="table-wrap"><table><thead><tr><th>Academic year</th><th>Study year</th><th>Department</th><th>Division</th><th>Actions</th></tr></thead><tbody>{classes.map((classRow) => <tr key={classRow.id}><td>{classRow.academic_year}</td><td>{classRow.year}</td><td>{classRow.department}</td><td>{classRow.division}</td><td className="row-actions"><button className="text-button" onClick={() => beginClassEdit(classRow)}>Edit</button><button className="text-button danger-text" onClick={() => deleteClass(classRow)}>Archive</button></td></tr>)}</tbody></table></div><p className="helper-text class-delete-note">Archiving hides a class from active selection without deleting its saved records. Restore an archived class to view its roster again.</p>{archivedClasses.length > 0 && <><div className="section-heading archived-heading"><div><p className="eyebrow">Saved but hidden</p><h2>Archived classes</h2></div><span className="muted">{archivedClasses.length} archived</span></div><div className="table-wrap"><table><thead><tr><th>Academic year</th><th>Study year</th><th>Department</th><th>Division</th><th>Actions</th></tr></thead><tbody>{archivedClasses.map((classRow) => <tr key={classRow.id}><td>{classRow.academic_year}</td><td>{classRow.year}</td><td>{classRow.department}</td><td>{classRow.division}</td><td><button className="text-button" disabled={busy} onClick={() => restoreClass(classRow)}>Restore class and records</button></td></tr>)}</tbody></table></div></>}</section>}

        {isStaff && data && activeView === 'overview' && <>
          <section className="stats-grid">
            <div className="stat-card"><span>Total enrolled</span><strong>{stats.total_students || 0}</strong><small>Active in this class</small></div><div className="stat-card accent-stat"><span>Present today</span><strong>{stats.present_today || 0}</strong><small>Marked present across subjects</small></div><div className="stat-card"><span>Absent today</span><strong>{stats.absent_today || 0}</strong><small>Marked absent across subjects</small></div><div className="stat-card"><span>Manual / OCR uploads</span><strong>{stats.manual_ocr_today || 0}</strong><small>Entries recorded today</small></div>
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c
          </section>
          <section className="panel analytics-panel"><div className="section-heading"><div><p className="eyebrow">Attendance trends</p><h2>Class analytics</h2></div><span className="muted">Based on recorded attendance</span></div><div className="analytics-grid"><div className="chart-block"><h3>By subject</h3>{(analytics.by_subject || []).map((item) => <div className="metric-row" key={item.id}><div><span>{item.subject_code} · {item.subject_name}</span><strong>{item.rate ?? 0}%</strong></div><div className="bar-track"><span style={{ width: `${Math.min(item.rate || 0, 100)}%` }} /></div><small>{item.present || 0} present of {item.marked || 0} marks</small></div>)}</div><div className="chart-block"><h3>Recording methods</h3>{Object.entries(analytics.methods || {}).length ? Object.entries(analytics.methods).map(([method, total]) => <div className="method-row" key={method}><span className="method-icon">{method === 'CAMERA' ? '◉' : method === 'SHEET' ? '▤' : '✓'}</span><span>{method}</span><strong>{total}</strong></div>) : <p className="empty-state">Attendance methods will appear after the first records.</p>}<h3 className="recent-title">Recent attendance</h3><AttendanceTable rows={(data.recent_attendance || []).slice(0, 5)} /></div></div></section>
          <section className="panel"><div className="section-heading"><div><p className="eyebrow">Support queue</p><h2>Students below threshold</h2></div></div><div className="table-wrap"><table><thead><tr><th>Roll</th><th>Name</th><th>Student ID</th><th>Attendance status</th><th>Face samples</th></tr></thead><tbody>{(data.students || []).map((student) => <tr key={student.id}><td>{student.roll_no}</td><td>{student.name}</td><td>{student.student_uid}</td><td>{student.face_enrolled ? <span className="tag present">Enrolled</span> : <span className="tag absent">Not enrolled</span>}</td><td>{enrollments.find((item) => item.id === student.id)?.sample_count || 0}</td></tr>)}</tbody></table></div></section>
        </>}

<<<<<<< HEAD
        {isFaculty && data && activeView === 'students' && <section id="student-roster" className="panel management-panel"><div className="section-heading"><div><p className="eyebrow">Class roster</p><h2>{editingStudentId ? 'Edit student' : 'Student management'}</h2><p className="muted">Changes are saved to this class. New student login password defaults to student123.</p></div></div><div className="module-mode-switch"><a href="#student-roster">Roster CRUD</a><a href="#face-enrollment">Face enrollment</a></div><form className="management-form" onSubmit={saveStudent}><label>Full name<input required value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} /></label><label>Roll number<input required value={studentForm.roll_no} onChange={(event) => setStudentForm({ ...studentForm, roll_no: event.target.value })} /></label><label>Email<input type="email" required value={studentForm.email} onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })} /></label><label>Phone<input value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })} /></label><div className="form-actions"><button className="primary-button" disabled={busy}>{editingStudentId ? 'Save student changes' : 'Add student'}</button>{editingStudentId && <button type="button" className="secondary-button" onClick={resetStudentForm}>Cancel edit</button>}</div></form><div className="table-wrap management-table"><table><thead><tr><th>Roll</th><th>Name</th><th>Student ID</th><th>Email</th><th>Face samples</th><th>Actions</th></tr></thead><tbody>{(data.students || []).map((student) => <tr key={student.id}><td>{student.roll_no}</td><td>{student.name}</td><td>{student.student_uid}</td><td>{student.email}</td><td>{enrollments.find((row) => row.id === student.id)?.sample_count || 0}</td><td className="row-actions"><button className="text-button" onClick={() => beginStudentEdit(student)}>Edit</button><button className="text-button danger-text" onClick={() => deleteStudent(student)}>Delete</button></td></tr>)}</tbody></table></div></section>}
=======
        {isFaculty && data && activeView === 'students' && <section id="student-roster" className="panel management-panel"><div className="section-heading"><div><p className="eyebrow">Class roster</p><h2>{editingStudentId ? 'Edit student' : 'Student management'}</h2><p className="muted">Changes are saved to this class. New student login password defaults to student123.</p></div></div><div className="module-mode-switch"><a href="#student-roster">Roster CRUD</a><a href="#face-enrollment">Face enrollment</a></div><form className="management-form" onSubmit={saveStudent}><label>Full name<input required value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} /></label><label>Roll number<input required value={studentForm.roll_no} onChange={(event) => setStudentForm({ ...studentForm, roll_no: event.target.value })} /></label><label>Email<input type="email" required value={studentForm.email} onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })} /></label><label>Phone<input value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })} /></label><div className="form-actions"><button className="primary-button" disabled={busy}>{editingStudentId ? 'Save student changes' : 'Add student'}</button>{editingStudentId && <button type="button" className="secondary-button" onClick={resetStudentForm}>Cancel edit</button>}</div></form><div className="table-wrap management-table"><table><thead><tr><th>Roll</th><th>Name</th><th>Student ID</th><th>Email</th><th>Face samples</th><th>Actions</th></tr></thead><tbody>{(data.students || []).map((student) => <tr key={student.id}><td>{student.roll_no}</td><td>{student.name}</td><td>{student.student_uid}</td><td>{student.email}</td><td>{enrollments.find((row) => row.id === student.id)?.sample_count || 0}</td><td className="row-actions"><button className="text-button" onClick={() => beginStudentEdit(student)}>Edit</button><button className="text-button danger-text" onClick={() => deleteStudent(student)}>Archive</button></td></tr>)}</tbody></table></div>{archivedStudents.length > 0 && <><div className="section-heading archived-heading"><div><p className="eyebrow">Saved but hidden</p><h2>Archived students</h2><p className="muted">Restore a student to include them in the active roster again.</p></div><span className="muted">{archivedStudents.length} archived</span></div><div className="table-wrap management-table"><table><thead><tr><th>Roll</th><th>Name</th><th>Student ID</th><th>Email</th><th>Actions</th></tr></thead><tbody>{archivedStudents.map((student) => <tr key={student.id}><td>{student.roll_no}</td><td>{student.name}</td><td>{student.student_uid}</td><td>{student.email}</td><td><button className="text-button" disabled={busy} onClick={() => restoreStudent(student)}>Restore</button></td></tr>)}</tbody></table></div></>}</section>}
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c

        {isStaff && data && activeView === 'subjects' && <section className="panel management-panel"><div className="section-heading"><div><p className="eyebrow">Course setup</p><h2>{editingSubjectId ? 'Edit subject' : 'Subject management'}</h2><p className="muted">Add and maintain the subjects used by attendance sessions for this class.</p></div></div><form className="management-form" onSubmit={saveSubject}><label>Subject code<input required value={subjectForm.subject_code} onChange={(event) => setSubjectForm({ ...subjectForm, subject_code: event.target.value })} /></label><label>Subject name<input required value={subjectForm.subject_name} onChange={(event) => setSubjectForm({ ...subjectForm, subject_name: event.target.value })} /></label><label>Type<select value={subjectForm.lecture_type} onChange={(event) => setSubjectForm({ ...subjectForm, lecture_type: event.target.value })}><option>THEORY</option><option>PRACTICAL</option><option>LAB</option><option>TUTORIAL</option></select></label><label>Total hours<input type="number" min="0" value={subjectForm.total_hours} onChange={(event) => setSubjectForm({ ...subjectForm, total_hours: event.target.value })} /></label><div className="form-actions"><button className="primary-button" disabled={busy}>{editingSubjectId ? 'Save subject changes' : 'Add subject'}</button>{editingSubjectId && <button type="button" className="secondary-button" onClick={resetSubjectForm}>Cancel edit</button>}</div></form><div className="table-wrap management-table"><table><thead><tr><th>Code</th><th>Subject</th><th>Type</th><th>Hours</th><th>Faculty</th><th>Actions</th></tr></thead><tbody>{subjects.map((subject) => <tr key={subject.id}><td>{subject.subject_code}</td><td>{subject.subject_name}</td><td>{subject.lecture_type}</td><td>{subject.total_hours}</td><td>{subject.faculty_code || session.name}</td><td className="row-actions"><button className="text-button" onClick={() => beginSubjectEdit(subject)}>Edit</button><button className="text-button danger-text" onClick={() => deleteSubject(subject)}>Delete</button></td></tr>)}</tbody></table></div></section>}

        {isFaculty && ['attendance', 'camera', 'sheets'].includes(activeView) && <div className="module-mode-switch attendance-modes"><button className={attendanceMode === 'manual' ? 'selected' : ''} onClick={() => { setAttendanceMode('manual'); setActiveView('attendance') }}>Manual register</button><button className={attendanceMode === 'camera' ? 'selected' : ''} onClick={() => { setAttendanceMode('camera'); setActiveView('camera') }}>Camera</button><button className={attendanceMode === 'sheet' ? 'selected' : ''} onClick={() => { setAttendanceMode('sheet'); setActiveView('sheets') }}>Offline sheet</button></div>}
        {isFaculty && data && activeView === 'attendance' && attendanceMode === 'manual' && <section className="panel management-panel"><div className="section-heading"><div><p className="eyebrow">Daily register</p><h2>Mark attendance</h2><p className="muted">Choose a date and subject, load the class roster, set each status, then save.</p></div></div><div className="attendance-toolbar"><label>Attendance date<input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} /></label><label>Subject<select value={attendanceSubject} onChange={(event) => setAttendanceSubject(event.target.value)}><option value="">Select subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.subject_code} · {subject.subject_name}</option>)}</select></label><button className="primary-button" onClick={loadAttendanceRoster} disabled={busy}>Load roster</button></div>{attendanceRows.length > 0 && <><div className="attendance-bulk"><span>{attendanceRows.filter((row) => row.status).length} of {attendanceRows.length} marked</span><button className="text-button" onClick={() => setAttendanceRows((rows) => rows.map((row) => ({ ...row, status: 'Present' })))}>Mark all present</button><button className="text-button" onClick={() => setAttendanceRows((rows) => rows.map((row) => ({ ...row, status: 'Absent' })))}>Mark all absent</button></div><div className="table-wrap"><table><thead><tr><th>Roll</th><th>Student</th><th>Student ID</th><th>Status for {attendanceDate}</th></tr></thead><tbody>{attendanceRows.map((student) => <tr key={student.id}><td>{student.roll_no}</td><td>{student.name}</td><td>{student.student_uid}</td><td><select aria-label={`Attendance status for ${student.name}`} value={student.status} onChange={(event) => setAttendanceRows((rows) => rows.map((row) => row.id === student.id ? { ...row, status: event.target.value } : row))}><option value="">Not marked</option><option value="Present">Present</option><option value="Absent">Absent</option><option value="Late">Late</option></select></td></tr>)}</tbody></table></div><button className="primary-button confirm-button" disabled={busy || !attendanceRows.some((row) => row.status)} onClick={saveManualAttendance}>Save attendance</button></>}</section>}

        {isStaff && data && activeView === 'camera' && <section className="panel workflow-panel"><div className="section-heading"><div><p className="eyebrow">Live recognition</p><h2>Camera attendance</h2><p className="muted">One face is processed per capture. Attendance is matched only against this class.</p></div><span className="privacy-chip">Camera images are not retained</span></div><div className="camera-layout"><div className="camera-stage"><video ref={videoRef} autoPlay muted playsInline /><div className="camera-overlay"><span className={cameraOn ? 'camera-indicator live' : 'camera-indicator'} />{cameraOn ? 'Camera live' : 'Camera stopped'}</div></div><div className="camera-controls"><label>Subject<select value={cameraSubject} onChange={(event) => setCameraSubject(event.target.value)}><option value="">Select subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.subject_code} · {subject.subject_name}</option>)}</select></label><label>Session date<input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} /></label><div className="button-row"><button className="primary-button" onClick={cameraOn ? markFromCamera : startCamera} disabled={busy}>{cameraOn ? (busy ? 'Checking...' : 'Capture and mark') : 'Start camera'}</button>{cameraOn && <button className="secondary-button" onClick={stopCamera}>Stop</button>}</div><p className="helper-text">Recognition uses enrolled LBPH face samples. A match is not a liveness guarantee; faculty should supervise the session.</p>{cameraMessage && <p className="message" role="status">{cameraMessage}</p>}</div></div><canvas ref={canvasRef} hidden /></section>}

        {isFaculty && data && activeView === 'students' && <section id="face-enrollment" className="panel workflow-panel"><div className="section-heading"><div><p className="eyebrow">Recognition setup</p><h2>Face enrollment</h2><p className="muted">Enroll several clear angles for each student. Samples are stored as face crops and can be removed here.</p></div><span className="privacy-chip">Consent required</span></div><div className="enroll-layout"><div className="camera-stage enrollment-stage"><video ref={videoRef} autoPlay muted playsInline /><div className="camera-overlay"><span className={cameraOn ? 'camera-indicator live' : 'camera-indicator'} />{cameraOn ? 'Camera live' : 'Camera stopped'}</div></div><div className="camera-controls"><label>Student<select value={enrollStudent} onChange={(event) => setEnrollStudent(event.target.value)}><option value="">Select student</option>{enrollments.map((student) => <option key={student.id} value={student.id}>{student.roll_no} · {student.name}</option>)}</select></label><div className="button-row"><button className="primary-button" onClick={cameraOn ? saveEnrollment : startCamera} disabled={busy}>{cameraOn ? (busy ? 'Saving...' : 'Capture enrollment sample') : 'Start camera'}</button>{cameraOn && <button className="secondary-button" onClick={stopCamera}>Stop</button>}</div><p className="helper-text">Capture one face per frame, with even lighting and no face coverings. Browser camera requires localhost or HTTPS.</p>{cameraMessage && <p className="message" role="status">{cameraMessage}</p>}</div></div><canvas ref={canvasRef} hidden /><div className="table-wrap enrollment-table"><table><thead><tr><th>Roll</th><th>Student</th><th>Student ID</th><th>Samples</th><th>Enrollment</th><th /></tr></thead><tbody>{enrollments.map((student) => <tr key={student.id}><td>{student.roll_no}</td><td>{student.name}</td><td>{student.student_uid}</td><td>{student.sample_count}</td><td>{student.sample_count ? <span className="tag present">Enrolled</span> : <span className="tag absent">Pending</span>}</td><td>{student.sample_count > 0 && <button className="text-button danger-text" onClick={() => removeEnrollment(student.id)}>Remove samples</button>}</td></tr>)}</tbody></table></div></section>}

<<<<<<< HEAD
        {isStaff && data && activeView === 'sheets' && <section className="panel workflow-panel"><div className="section-heading"><div><p className="eyebrow">Document processing</p><h2>Attendance sheet review</h2><p className="muted">OCR reads explicit status text when present. Marks that cannot be confidently parsed stay in review.</p></div></div><form className="sheet-upload" onSubmit={processSheet}><label>Subject<select value={sheetSubject} onChange={(event) => setSheetSubject(event.target.value)}><option value="">Select subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.subject_code} · {subject.subject_name}</option>)}</select></label><label>Sheet image<input type="file" accept="image/png,image/jpeg" onChange={(event) => setSheetFile(event.target.files?.[0] || null)} /></label><button className="primary-button" disabled={busy}>{busy ? 'Reading sheet...' : 'Process image'}</button></form>{sheetResults.length > 0 && <><div className="review-banner">Review each row. Uncertain OCR results stay marked Review and are never silently saved as absent.</div><div className="table-wrap"><table><thead><tr><th>Roll</th><th>Student</th><th>Student ID</th><th>Detected status</th><th>Set status</th></tr></thead><tbody>{sheetResults.map((row) => <tr key={row.student_id}><td>{(data.students || []).find((item) => item.id === row.student_id)?.roll_no}</td><td>{row.name}</td><td>{row.student_uid}</td><td>{row.status}</td><td><select value={row.status} onChange={(event) => setSheetResults((rows) => rows.map((item) => item.student_id === row.student_id ? { ...item, status: event.target.value } : item))}><option>Review</option><option>Present</option><option>Absent</option><option>Late</option></select></td></tr>)}</tbody></table></div><button className="primary-button confirm-button" onClick={confirmSheet} disabled={busy || sheetResults.some((row) => row.status === 'Review')}>Confirm reviewed attendance</button></>}</section>}
=======
        {isStaff && data && activeView === 'sheets' && <section className="panel workflow-panel">
          <div className="section-heading"><div><p className="eyebrow">Document processing</p><h2>Attendance sheet review</h2><p className="muted">Upload a photo or spreadsheet. Matches below 85% confidence must be checked before saving.</p></div></div>
          <form className="sheet-upload" onSubmit={processSheet}>
            <label>Subject<select value={sheetSubject} onChange={(event) => { setSheetSubject(event.target.value); setSheetResults([]) }}><option value="">Select subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.subject_code} · {subject.subject_name}</option>)}</select></label>
            <div className="sheet-drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file) chooseSheetFile(file) }}>
              <label>Sheet photo or CSV / Excel<input type="file" accept="image/png,image/jpeg,.csv,.xlsx" capture="environment" onChange={(event) => chooseSheetFile(event.target.files?.[0] || null)} /></label>
              <small>Drop JPG, PNG, CSV, or XLSX here</small>
            </div>
            <div className="sheet-actions"><button className="secondary-button" type="button" onClick={sheetCameraOn ? stopSheetCamera : startSheetCamera}>{sheetCameraOn ? 'Stop live camera' : 'Take live photo'}</button><button className="primary-button" disabled={busy || !sheetFile}>{busy ? 'Processing...' : 'Process sheet'}</button></div>
          </form>
          {sheetCameraOn && <div className="sheet-camera"><video ref={sheetVideoRef} autoPlay muted playsInline /><button className="small-button" type="button" onClick={captureSheetPhoto}>Capture sheet</button></div>}
          {sheetFile && <div className="sheet-review-grid">
            <div className="sheet-preview-panel"><p className="eyebrow">Source preview</p>
              {sheetPreviewUrl ? <div className="sheet-image-frame"><img src={sheetPreviewUrl} alt="Attendance sheet preview" style={{ transform: `rotate(${sheetRotation}deg)` }} /></div> : <p className="file-preview">{sheetFile.name}<br />Spreadsheet contents will be reconciled with the class roster.</p>}
              {sheetPreviewUrl && <div className="image-edit-controls">
                <button className="secondary-button" type="button" onClick={() => setSheetRotation((rotation) => rotation + 90)}>Rotate 90°</button>
                <label>Crop width {sheetCrop.width}%<input type="range" min="20" max="100" value={sheetCrop.width} onChange={(event) => setSheetCrop((crop) => ({ ...crop, width: Number(event.target.value), x: Math.min(crop.x, 100 - Number(event.target.value)) }))} /></label>
                <label>Crop height {sheetCrop.height}%<input type="range" min="20" max="100" value={sheetCrop.height} onChange={(event) => setSheetCrop((crop) => ({ ...crop, height: Number(event.target.value), y: Math.min(crop.y, 100 - Number(event.target.value)) }))} /></label>
                <label>Crop left {sheetCrop.x}%<input type="range" min="0" max={100 - sheetCrop.width} value={sheetCrop.x} onChange={(event) => setSheetCrop((crop) => ({ ...crop, x: Number(event.target.value) }))} /></label>
                <label>Crop top {sheetCrop.y}%<input type="range" min="0" max={100 - sheetCrop.height} value={sheetCrop.y} onChange={(event) => setSheetCrop((crop) => ({ ...crop, y: Number(event.target.value) }))} /></label>
              </div>}
            </div>
            <div className="sheet-checklist"><p className="eyebrow">Matched checklist</p>
              {sheetResults.length ? <><div className="review-banner">Duplicate entries are rejected. Existing attendance for the same date and subject is updated after approval.</div><div className="table-wrap"><table><thead><tr><th>Roll</th><th>Student</th><th>Match confidence</th><th>Attendance</th></tr></thead><tbody>{sheetResults.map((row) => <tr key={row.student_id} className={row.confidence < 85 ? 'needs-verification' : ''}><td>{row.roll_no || '—'}</td><td>{row.name}<small className="matched-text">{row.matched_text || 'No readable row match'}</small></td><td><span className={`confidence-label ${row.confidence < 85 ? 'low-confidence' : ''}`}>{row.confidence}%{row.confidence < 85 ? ' · Verify' : ''}</span></td><td><select aria-label={`Attendance for ${row.name}`} value={row.status} onChange={(event) => setSheetResults((rows) => rows.map((item) => item.student_id === row.student_id ? { ...item, status: event.target.value, verified: true } : item))}><option value="Review">Needs Verification</option><option value="Present">Present</option><option value="Absent">Absent</option><option value="Late">Late</option></select></td></tr>)}</tbody></table></div><button className="primary-button confirm-button" onClick={confirmSheet} disabled={busy || sheetResults.some((row) => row.status === 'Review')}>Approve &amp; Submit Attendance</button></> : <p className="empty-state">Process the sheet to compare it with the active class roster.</p>}
            </div>
          </div>}
        </section>}
>>>>>>> b4694a3415ac9f3a74c1838e4afc440337f3386c

        {isStaff && data && activeView === 'roster' && <section className="panel"><div className="section-heading"><div><p className="eyebrow">Class management</p><h2>Student roster</h2></div><span className="muted">{data.students?.length || 0} active students</span></div><div className="table-wrap"><table><thead><tr><th>Roll</th><th>Name</th><th>Student ID</th><th>Email</th><th>Face enrollment</th></tr></thead><tbody>{(data.students || []).map((student) => <tr key={student.id}><td>{student.roll_no}</td><td>{student.name}</td><td>{student.student_uid}</td><td>{student.email}</td><td>{enrollments.find((item) => item.id === student.id)?.sample_count || 0} sample(s)</td></tr>)}</tbody></table></div></section>}

        {session.role === 'student' && data && (activeView === 'history' || activeView === 'updates') && <section className="panel"><div className="section-heading"><div><p className="eyebrow">Student records</p><h2>{activeView === 'history' ? 'Attendance history' : 'Notifications'}</h2></div></div>{activeView === 'history' ? <AttendanceTable rows={data.recent_attendance || []} studentView /> : (data.notifications || []).map((item) => <article className="notification-item" key={item.id}><strong>{item.title}</strong><p>{item.message}</p><time>{item.created_at}</time></article>)}</section>}
      </main>
    </div>
  )
}

export default Dashboard
