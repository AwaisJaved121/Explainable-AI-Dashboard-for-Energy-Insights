@echo off
title Energy XAI Dashboard - Startup
echo ============================================================
echo   ENERGY EFFICIENCY XAI DASHBOARD
echo   Starting Backend + Frontend...
echo ============================================================
echo.

REM Check if backend models exist
if not exist "backend\saved_models\best_rf_heating.pkl" (
    echo [WARN] Models not found in backend\saved_models.
    echo [WARN] Run "python train_models.py" to train them.
    echo.
)

echo.
echo [1/2] Starting Backend API (FastAPI on port 8000)...
start "Energy Dashboard - Backend" cmd /k "
    cd /d backend
    python -m pip install -r requirements.txt -q 2>nul
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting Frontend (React on port 3000)...
start "Energy Dashboard - Frontend" cmd /k "
    cd /d frontend
    if not exist "node_modules" (
        echo [INFO] Installing dependencies...
        npm install
    )
    npm start
"

echo.
echo ============================================================
echo   BOTH SERVERS STARTING...
echo ============================================================
echo.
echo   Backend API:  http://localhost:8000
echo   Frontend UI:  http://localhost:3000
echo   API Docs:     http://localhost:8000/docs
echo.
echo   Press Ctrl+C in each window to stop servers.
echo ============================================================
pause