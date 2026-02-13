@echo off
echo ========================================
echo  PAYROLL PORTAL - STARTUP SCRIPT
echo ========================================
echo.

echo [1/4] Killing existing node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Starting Backend Server (Port 5003)...
start "Backend Server" cmd /k "cd Backend && node server.js"
timeout /t 5 /nobreak >nul

echo [3/4] Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd Frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo [4/4] Opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo  APPLICATION STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Backend:  http://localhost:5003
echo Frontend: http://localhost:3000
echo.
echo Login Credentials:
echo   Email:    contractor@test.com
echo   Password: contractor123
echo.
echo Press any key to close this window...
pause >nul
