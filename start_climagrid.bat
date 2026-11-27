@echo off
title CLIMAGRID Command Operations Launcher
echo ======================================================================
echo    CLIMAGRID // MULTI-HAZARD CLIMATE DISASTER RESILIENCE
echo               Starting Full Platform (Overclock '26)
echo ======================================================================
echo.

echo [1/3] Launching FastAPI Backend on Port 8000...
start "CLIMAGRID - Backend API (Port 8000)" cmd /k "cd backend && .\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir ."

echo [2/3] Launching Next.js Tactical Dashboard on Port 3000...
start "CLIMAGRID - Tactical EOC Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo [3/3] Waiting 4 seconds for services to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Launching Tactical Command Center in browser...
start http://localhost:3000

echo.
echo ======================================================================
echo  Platform is now running!
echo  - Command Center:   http://localhost:3000
echo  - Citizen Mobile:   http://localhost:3000/citizen
echo  - Backend API Docs: http://localhost:8000/docs
echo ======================================================================
pause
