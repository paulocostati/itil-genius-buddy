
@echo off
echo ===================================================
echo   ITIL Genius Buddy - Database Migration Script
echo ===================================================
echo.
echo This script will connect to your Supabase project (ywdhaicivsufharivwdv)
echo and apply the latest schema changes and data imports.
echo.

echo 1. Attempting to link to project 'ywdhaicivsufharivwdv'...
call npx supabase link --project-ref ywdhaicivsufharivwdv
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Link failed. You need to login first.
    echo.
    pause
    echo Please login now...
    call npx supabase login
    if %ERRORLEVEL% NEQ 0 (
        echo Login failed. Aborting.
        exit /b 1
    )
    echo Login successful. Trying to link again...
    call npx supabase link --project-ref ywdhaicivsufharivwdv
    if %ERRORLEVEL% NEQ 0 (
        echo Link failed again. Please check your internet or project ID.
        exit /b 1
    )
)

echo.
echo 2. Applying migrations (Schema + Data)...
call npx supabase db push
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Migration failed. Please check the error message above.
    pause
    exit /b 1
)

echo.
echo [OK] Migration Completed Successfully!
echo You can now use the app with the imported questions.
pause
