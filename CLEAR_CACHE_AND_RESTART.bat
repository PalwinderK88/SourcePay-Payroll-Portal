@echo off
echo ========================================
echo CLEARING CACHE AND RESTARTING FRONTEND
echo ========================================
echo.

echo Step 1: Stopping any running processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Clearing Next.js cache...
cd Frontend
if exist .next (
    rmdir /s /q .next
    echo ✓ .next directory deleted
) else (
    echo ✓ .next directory doesn't exist
)

echo Step 3: Clearing node_modules cache (optional)...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ node_modules cache cleared
)

echo.
echo Step 4: Starting frontend server...
echo.
start cmd /k "npm run dev"

echo.
echo ========================================
echo DONE! Frontend is starting...
echo ========================================
echo.
echo IMPORTANT: After the server starts:
echo 1. Wait for "ready - started server on 0.0.0.0:3000"
echo 2. Open browser in INCOGNITO/PRIVATE mode
echo 3. Go to http://localhost:3000
echo 4. Login and look for GREEN chat button
echo.
echo If still not visible, press Ctrl+Shift+Delete
echo to clear ALL browser cache, then try again.
echo.
pause
