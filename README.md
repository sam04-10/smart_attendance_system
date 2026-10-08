# Smart Attendance System

```
Smart_Attendance_System/
├── backend/    Flask API, templates, uploads, face data, tests
├── frontend/   React + Vite web app
└── database/   SQLite database (attendance.db) + schema.sql
```

## Quick start
1. **Backend** - `cd backend`, create venv, `pip install -r requirements.txt`, `python app.py`  (http://localhost:5000)
2. **Frontend** - `cd frontend`, `npm install`, `npm run dev`  (http://localhost:5173)
3. **Database** - nothing to do; `backend/` finds `database/attendance.db` automatically.

Details are in each folder's `README.md`.

> Not included (re-creatable): Python `venv/` and `frontend/node_modules/`. The originals were
> Windows-only builds; run the install commands above on your machine.
