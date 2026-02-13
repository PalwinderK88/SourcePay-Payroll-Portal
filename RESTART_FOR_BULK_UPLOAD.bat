@echo off
echo ========================================
echo  RESTARTING FOR BULK UPLOAD FEATURE
echo ========================================
echo.

echo [1/3] Killing existing node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Starting Backend Server (Port 5003)...
start "Backend Server" cmd /k "cd Backend && node server.js"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd Frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  SERVERS RESTARTED!
echo ========================================
echo.
echo Backend:  http://localhost:5003
echo Frontend: http://localhost:3000
echo.
echo IMPORTANT: Clear your browser cache!
echo Press Ctrl+Shift+Delete in your browser
echo Or use Ctrl+F5 to hard refresh
echo.
echo Then navigate to Agency Admin Portal
echo You should see the "📦 Bulk Upload" tab
echo.
echo Press any key to close this window...
pause >nul
