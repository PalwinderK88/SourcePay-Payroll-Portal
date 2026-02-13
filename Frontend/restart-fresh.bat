@echo off
echo Clearing Next.js cache and restarting...
echo.

echo Step 1: Deleting .next cache folder...
if exist .next (
    rmdir /s /q .next
    echo ✓ Cache deleted
) else (
    echo ✓ No cache to delete
)

echo.
echo Step 2: Starting development server...
echo.
npm run dev
