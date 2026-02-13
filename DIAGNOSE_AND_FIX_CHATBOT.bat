@echo off
echo ========================================
echo CHATBOT DIAGNOSTIC AND FIX TOOL
echo ========================================
echo.

echo [STEP 1] Checking if servers are running...
echo.

tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✓ Node.js processes found running
    echo.
    echo Current Node.js processes:
    tasklist /FI "IMAGENAME eq node.exe"
    echo.
    echo [ACTION] Killing all Node.js processes to restart fresh...
    taskkill /F /IM node.exe >NUL 2>&1
    echo ✓ All Node.js processes terminated
    timeout /t 2 >NUL
) else (
    echo ✗ No Node.js processes running
    echo   This means your servers are NOT running!
)

echo.
echo ========================================
echo [STEP 2] Cleaning build cache...
echo ========================================
echo.

if exist "Frontend\.next" (
    echo Removing Frontend\.next folder...
    rmdir /s /q "Frontend\.next"
    echo ✓ Frontend build cache cleared
) else (
    echo ℹ No .next folder found
)

if exist "Frontend\node_modules\.cache" (
    echo Removing Frontend\node_modules\.cache folder...
    rmdir /s /q "Frontend\node_modules\.cache"
    echo ✓ Node modules cache cleared
) else (
    echo ℹ No node_modules cache found
)

echo.
echo ========================================
echo [STEP 3] Starting Backend Server...
echo ========================================
echo.

cd Backend
start "Backend Server" cmd /k "echo Backend Server Starting... && node server.js"
cd ..

echo ✓ Backend server started in new window
echo   Waiting 5 seconds for backend to initialize...
timeout /t 5 >NUL

echo.
echo ========================================
echo [STEP 4] Starting Frontend Server...
echo ========================================
echo.

cd Frontend
start "Frontend Server" cmd /k "echo Frontend Server Starting... && npm run dev"
cd ..

echo ✓ Frontend server started in new window
echo   Waiting 10 seconds for frontend to build...
timeout /t 10 >NUL

echo.
echo ========================================
echo [STEP 5] Opening Application...
echo ========================================
echo.

echo Opening browser in 5 seconds...
timeout /t 5 >NUL

start "" "http://localhost:3000"

echo.
echo ========================================
echo ✅ DIAGNOSTIC COMPLETE
echo ========================================
echo.
echo WHAT TO DO NEXT:
echo.
echo 1. Check the Backend Server window - should show "Server running on port 5000"
echo 2. Check the Frontend Server window - should show "ready - started server on 0.0.0.0:3000"
echo 3. In your browser:
echo    - Press Ctrl + Shift + Delete
echo    - Select "All time"
echo    - Check "Cached images and files"
echo    - Click "Clear data"
echo    - Close ALL browser windows
echo    - Open a NEW INCOGNITO/PRIVATE window
echo    - Go to: http://localhost:3000
echo 4. Login to your account
echo 5. Look for the GREEN CHAT BUTTON in the bottom-right corner
echo.
echo If you still don't see the chatbot:
echo - Press F12 in the browser
echo - Check the Console tab for errors
echo - Take a screenshot and share it
echo.
echo ========================================
pause
