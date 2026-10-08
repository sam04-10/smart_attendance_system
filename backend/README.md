# Backend (Flask API)

## Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env         # macOS/Linux: cp .env.example .env   (then edit SECRET_KEY)
```
Face/sheet OCR needs [Tesseract](https://github.com/UB-Mannheim/tesseract/wiki) installed; set `TESSERACT_CMD` in `.env` to its path.

## Run  (always run from inside `backend/`)
```bash
python app.py
```
API runs on http://localhost:5000. Opening `/` shows backend status JSON, and `/api/health` provides the health check.
The React/Vite frontend runs on http://localhost:5173 and sends `/api` requests through its dev proxy to this backend.
API requests are logged in the backend terminal with their method, path, and response status.

## Other commands
```bash
python database.py              # create tables + seed demo data
python create_users.py          # create staff users
python create_student_users.py  # create student logins
python -m pytest tests          # run tests (pip install pytest first)
```

## Folders
- `templates/` - HTML templates
- `uploads/`   - uploaded attendance sheets / camera images
- `face_data/` - enrolled face samples
- `tests/`     - API tests
