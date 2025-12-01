@echo off
setlocal enabledelayedexpansion

REM flags
set BUILD_FRONTEND=false
set REBUILD_FRONTEND=false

REM parse arguments
:parse_args
if "%~1"=="" goto start_build
if "%~1"=="--build-frontend" (
    set BUILD_FRONTEND=true
    shift
    goto parse_args
)
if "%~1"=="--rebuild-frontend" (
    set REBUILD_FRONTEND=true
    set BUILD_FRONTEND=true
    shift
    goto parse_args
)

echo false argument: %~1
exit /b 1

:start_build
echo Starting build process...

REM setting flag
if "%BUILD_FRONTEND%"=="true" (
    echo Building frontend...
    cd src\frontend
    
    REM rebuild-frontend
    if "%REBUILD_FRONTEND%"=="true" (
        echo Cleaning node_modules...
        if exist node_modules rmdir /s /q node_modules
        if exist package-lock.json del package-lock.json
    )
    
    echo Installing dependencies...
    call npm install
    
    echo Building React app...
    call npm run build
    
    cd ..\..
    echo Frontend build complete!
) else (
    echo Skipping frontend build use (--build-frontend to rebuild)
)

REM webserver
echo Building webserver...
echo Press Ctrl+C to stop
call cargo build
.\target\release\webserver.exe