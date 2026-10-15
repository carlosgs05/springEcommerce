@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"
set "SILENCIOSO=0"
if "%~1"=="/SILENCIOSO" set "SILENCIOSO=1"

if "%SILENCIOSO%"=="0" (
    title Ecommerce - Detener Servicio
    echo ========================================================
    echo        DETENIENDO EL ECOMMERCE [BACKEND + FRONTEND]
    echo ========================================================
    echo.
    echo Cierra las ventanas que abrio iniciar_sistema.bat
    echo [backend puerto 8080 y frontend puerto 5173].
    echo No toca el navegador ni otros programas de esta PC.
    echo.
    echo [1/1] Deteniendo el ecommerce...
)

if exist "%ROOT_DIR%scripts\ecommerce_backend.pid" (
    set /p BACKEND_PID=<"%ROOT_DIR%scripts\ecommerce_backend.pid"
    taskkill /F /T /PID !BACKEND_PID! >nul 2>&1
    del /q "%ROOT_DIR%scripts\ecommerce_backend.pid" >nul 2>&1
)
if exist "%ROOT_DIR%scripts\ecommerce_frontend.pid" (
    set /p FRONTEND_PID=<"%ROOT_DIR%scripts\ecommerce_frontend.pid"
    taskkill /F /T /PID !FRONTEND_PID! >nul 2>&1
    del /q "%ROOT_DIR%scripts\ecommerce_frontend.pid" >nul 2>&1
)

rem Red de seguridad: por si el PID guardado ya no coincide [actualizacion, corrida manual, etc]
rem /r /c:":8080 " y ":5173 " exigen el puerto exacto seguido de espacio.
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":8080 " ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":5173 " ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

if "%SILENCIOSO%"=="0" (
    echo.
    echo ========================================================
    echo       EL ECOMMERCE HA SIDO DETENIDO
    echo ========================================================
    echo.
    pause
)
