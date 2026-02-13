@echo off
echo ========================================
echo COMPLETE SYSTEM RESTART
echo ========================================
echo.

echo Step 1: Killing all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo Step 2: Clearing Frontend cache...
cd Frontend
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
cd ..

echo Step 3: Starting Backend...
start "Backend Server" cmd /k "cd Backend && node server.js"
timeout /t 5 >nul

echo Step 4: Starting Frontend...
start "Frontend Server" cmd /k "cd Frontend && npm run dev"
timeout /t 10 >nul

echo Step 5: Opening browser...
start http://localhost:3000

echo.
echo ========================================
echo SYSTEM RESTARTED!
echo ========================================
echo.
echo Backend: http://localhost:5003
echo Frontend: http://localhost:3000
echo.
echo IMPORTANT: 
echo 1. Wait for "ready - started server" message in Frontend window
echo 2. Then refresh browser with Ctrl+Shift+R
echo 3. Look for RED button in bottom-right corner
echo.
pause
