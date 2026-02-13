@echo off
echo ========================================
echo AGGRESSIVE CACHE CLEARING
echo ========================================
echo.

echo Step 1: Killing ALL Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Killing ALL browser processes...
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
taskkill /F /IM firefox.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 3: Clearing Next.js cache...
cd Frontend
if exist .next (
    rmdir /s /q .next
    echo ✓ .next deleted
)

echo Step 4: Clearing node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ node_modules cache cleared
)

echo Step 5: Clearing npm cache...
call npm cache clean --force

echo.
echo Step 6: Starting frontend server...
echo.
start cmd /k "npm run dev"

echo.
echo ========================================
echo DONE!
echo ========================================
echo.
echo CRITICAL NEXT STEPS:
echo.
echo 1. Wait for server to start
echo 2. Open browser in PRIVATE/INCOGNITO mode
echo 3. Go to: http://localhost:3000
echo 4. Login
echo 5. Look for GREEN chat button
echo.
echo If STILL not visible:
echo - Close this window
echo - Restart your computer
echo - Try again
echo.
pause
