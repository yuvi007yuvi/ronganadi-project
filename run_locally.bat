@echo off
title Ronganadi Project Starter
cls
echo =====================================================================
echo                  Ronganadi Beta - Local Starter
echo =====================================================================
echo.
echo [1] Start React Frontend Only (Connects to Live Server API)
echo [2] Start React Frontend + Local PHP Backend Server (Requires local PHP)
echo [3] Start React Frontend + Node Mock Backend Server (No PHP required)
echo [4] Exit
echo.
set /p opt="Choose an option (1-4): "

if "%opt%"=="1" goto run_frontend
if "%opt%"=="2" goto run_both
if "%opt%"=="3" goto run_mock
if "%opt%"=="4" goto end

:run_frontend
echo.
echo Starting Vite Frontend...
echo Connects to live API at: https://ranganadibeta.com/api
echo.
npm run dev
goto end

:run_both
echo.
echo Checking PHP installation...
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PHP is not installed or not in system PATH.
    echo Please install PHP or choose option 3 to run the Node backend.
    echo.
    pause
    goto end
)
echo PHP is installed! Starting PHP Backend on http://localhost:8000/ ...
start cmd /k "php -S localhost:8000 -t api"
echo Starting Vite Frontend...
echo.
echo NOTE: If you run a local PHP server, edit src/config/api.js
echo to use 'http://localhost:8000' as the API_BASE_URL.
echo.
npm run dev
goto end

:run_mock
echo.
echo Starting Node Mock Backend Server on http://localhost:8000/ ...
start cmd /k "node mock-server.js"
echo Starting Vite Frontend...
echo.
npm run dev
goto end

:end
pause
