@echo off
REM KPDL - Run Development Servers (Windows)

echo.
echo [*] Starting KPDL Development Environment...
echo.

REM Backend
echo [1/2] Starting Backend (FastAPI)...
cd backend
pip install -q -r requirements.txt > nul 2>&1
start cmd /k "python app.py"
cd ..

timeout /t 2 /nobreak

REM Frontend
echo [2/2] Starting Frontend (React)...
cd frontend

if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install -q
)

start cmd /k "npm start"
cd ..

echo.
echo [OK] KPDL is running!
echo.
echo Open your browser:
echo   - Frontend: http://localhost:3000
echo   - Backend Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C in each window to stop...
