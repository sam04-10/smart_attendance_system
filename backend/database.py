import os
import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
# The database lives in its own top-level folder (../database), separate from the backend.
DATABASE_DIR = BASE_DIR.parent / "database"
DATABASE_DIR.mkdir(exist_ok=True)
DATABASE = os.environ.get("DATABASE_PATH") or str(DATABASE_DIR / "attendance.db")


# ==================================================
# DATABASE CONNECTION
# ==================================================

def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


# ==================================================
# SAFE MIGRATION FOR LEGACY DATABASE
# ==================================================

def reset_legacy_database_if_needed():
    if not os.path.exists(DATABASE):
        return
    connection = get_db_connection()
    try:
        user_columns = {row[1] for row in connection.execute("PRAGMA table_info(users)").fetchall()}
        student_columns = {row[1] for row in connection.execute("PRAGMA table_info(students)").fetchall()}
        required_user_columns = {"password_hash", "role", "created_at", "updated_at"}
        required_student_columns = {"student_uid", "class_id", "password_hash", "face_enrolled", "active"}
        if not required_user_columns.issubset(user_columns) or not required_student_columns.issubset(student_columns):
            connection.close()
            os.remove(DATABASE)
    except sqlite3.DatabaseError:
        connection.close()
        if os.path.exists(DATABASE):
            os.remove(DATABASE)


# ==================================================
# CREATE TABLES
# ==================================================

def create_tables():
    reset_legacy_database_if_needed()
    connection = get_db_connection()

    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT,
            password TEXT,
            role TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS academic_years (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            academic_year TEXT NOT NULL UNIQUE,
            is_active INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            academic_year_id INTEGER NOT NULL,
            year TEXT NOT NULL,
            department TEXT NOT NULL,
            division TEXT NOT NULL,
            active INTEGER DEFAULT 1,
            FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS students (
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

        CREATE TABLE IF NOT EXISTS faculty (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            faculty_code TEXT UNIQUE,
            department TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS faculty_class_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            faculty_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS subjects (
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

        CREATE TABLE IF NOT EXISTS attendance_sessions (
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

        CREATE TABLE IF NOT EXISTS attendance (
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

        CREATE TABLE IF NOT EXISTS notifications (
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

        CREATE TABLE IF NOT EXISTS attendance_correction_requests (
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

        CREATE TABLE IF NOT EXISTS audit_logs (
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

        CREATE TABLE IF NOT EXISTS timetable (
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

        CREATE TABLE IF NOT EXISTS attendance_sheet_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            version TEXT,
            settings TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    class_columns = {row[1] for row in connection.execute("PRAGMA table_info(classes)").fetchall()}
    if "active" not in class_columns:
        connection.execute("ALTER TABLE classes ADD COLUMN active INTEGER DEFAULT 1")

    # Legacy compatibility: if the old prototype tables exist, leave them alone.
    connection.commit()
    connection.close()


# ==================================================
# DEMO SEED DATA
# ==================================================

def seed_demo_data():
    connection = get_db_connection()

    academic_year = connection.execute(
        "SELECT id FROM academic_years WHERE academic_year = ?",
        ("2026-27",),
    ).fetchone()

    if academic_year is None:
        connection.execute(
            "INSERT INTO academic_years (academic_year, is_active) VALUES (?, 1)",
            ("2026-27",),
        )
        academic_year_id = connection.execute(
            "SELECT id FROM academic_years WHERE academic_year = ?",
            ("2026-27",),
        ).fetchone()["id"]
    else:
        academic_year_id = academic_year["id"]

    admin = connection.execute(
        "SELECT id FROM users WHERE email = ? AND role = 'admin'",
        ("admin@college.edu",),
    ).fetchone()
    if admin is None:
        connection.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ("Admin User", "admin@college.edu", generate_password_hash("admin123"), "admin"),
        )

    faculty = connection.execute(
        "SELECT id FROM users WHERE email = ? AND role = 'faculty'",
        ("faculty@college.edu",),
    ).fetchone()
    if faculty is None:
        connection.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ("Faculty User", "faculty@college.edu", generate_password_hash("faculty123"), "faculty"),
        )
    faculty_user_id = connection.execute(
        "SELECT id FROM users WHERE email = ? AND role = 'faculty'",
        ("faculty@college.edu",),
    ).fetchone()["id"]
    faculty_record = connection.execute("SELECT id FROM faculty WHERE user_id = ?", (faculty_user_id,)).fetchone()
    if faculty_record is None:
        connection.execute(
            "INSERT INTO faculty (user_id, faculty_code) VALUES (?, ?)",
            (faculty_user_id, "FAC-001"),
        )

    connection.commit()
    connection.close()


# ==================================================
# RUN DATABASE SETUP
# ==================================================

if __name__ == "__main__":
    create_tables()
    seed_demo_data()
    print("Database initialized successfully.")