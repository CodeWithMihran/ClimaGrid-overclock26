@echo off
echo ========================================================
echo  Starting Lifeline360 FastAPI Backend (Port 8000)...
echo ========================================================
cd backend
.\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir .
pause
