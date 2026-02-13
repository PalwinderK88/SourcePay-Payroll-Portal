@echo off
echo ========================================
echo  COMPLETE RESTART - BULK UPLOAD FIX
echo ========================================
echo.

echo [1/5] Killing ALL node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo [2/5] Installing Backend Dependencies...
cd Backend
call npm install xlsx csv-parser
cd ..
timeout /t 2 /nobreak >nul

echo [3/5] Starting Backend Server (Port 5003)...
start "Backend Server" cmd /k "cd Backend && node server.js"
timeout /t 5 /nobreak >nul

echo [4/5] Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd Frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo [5/5] Opening browser...
start http://localhost:3000

echo.
echo ========================================
echo  SERVERS RESTARTED WITH NEW CODE!
echo ========================================
echo.
echo Backend:  http://localhost:5003
echo Frontend: http://localhost:3000
echo.
echo IMPORTANT NEXT STEPS:
echo 1. Press Ctrl+F5 in your browser to hard refresh
echo 2. Login as agency admin
echo 3. Go to Agency Admin Portal
echo 4. Click "Bulk Upload" tab
echo 5. Try uploading your CSV file
echo.
echo The bulk upload now:
echo - Accepts CSV or Excel files (.csv, .xlsx, .xls)
echo - PDF files are OPTIONAL
echo - You can upload just CSV data
echo.
echo Press any key to close this window...
pause >nul
