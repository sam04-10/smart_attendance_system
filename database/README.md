# Database

SQLite database for the Smart Attendance System.

| File | Purpose |
|------|---------|
| `attendance.db` | The live database (includes your existing data). |
| `schema.sql`    | Table structure only (no data) - use it to create a fresh, empty DB. |

The backend finds this folder automatically (`backend/database.py` points to `../database/attendance.db`).

## Start from a clean database
```bash
cd database
rm attendance.db                      # (Windows: del attendance.db)
sqlite3 attendance.db < schema.sql    # or just run the backend; it creates tables itself
```
Alternatively, from `backend/` run `python database.py` to create tables and seed the demo data.

## Inspect it
Open `attendance.db` with [DB Browser for SQLite](https://sqlitebrowser.org/) or run `sqlite3 attendance.db`.
