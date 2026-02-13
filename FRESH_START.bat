@echo off
echo ========================================
echo  FRESH START - COMPLETE RESTART
echo ========================================
echo.

echo [1/5] Killing all node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo [2/5] Starting Backend Server (Port 5003)...
cd Backend
start "Backend Server" cmd /k "node server.js"
cd ..
timeout /t 8 /nobreak >nul

echo [3/5] Starting Frontend Server (Port 3000)...
cd Frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..
timeout /t 8 /nobreak >nul

echo [4/5] Opening browser...
start http://localhost:3000

echo [5/5] Done!
echo.
echo ========================================
echo  SERVERS STARTED!
echo ========================================
echo.
echo Backend:  http://localhost:5003
echo Frontend: http://localhost:3000
echo.
echo Login with:
echo   Email:    agencyadmin@test.com
echo   Password: agencyadmin123
echo.
echo IMPORTANT: Clear browser cache (Ctrl+Shift+Delete)
echo            or use Incognito mode (Ctrl+Shift+N)
echo.
pause
