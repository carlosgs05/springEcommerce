@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"
set "SILENCIOSO=0"
set "LIMPIAR=1"
if "%~1"=="/SILENCIOSO" set "SILENCIOSO=1"
rem /SOLO_PROCESOS: lo usa iniciar_sistema.bat como red de seguridad antes de arrancar.
rem Solo mata procesos colgados, NO borra target/.vite [si no, cada inicio recompilaria todo de cero].
if "%~1"=="/SOLO_PROCESOS" (
    set "SILENCIOSO=1"
    set "LIMPIAR=0"
)

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
    echo [1/2] Deteniendo el ecommerce...
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

if "%LIMPIAR%"=="1" (
    if "%SILENCIOSO%"=="0" (
        echo.
        echo [2/2] Limpiando caches de compilacion [se regeneran solas al iniciar]...
    )

    rem Compilado de Maven [backend]. node_modules NO se toca: tarda y necesita internet reinstalarlo.
    if exist "%ROOT_DIR%backend\target" (
        rmdir /s /q "%ROOT_DIR%backend\target" >nul 2>&1
    )
    rem Cache de Vite [frontend]. Se reconstruye sola en el primer arranque.
    if exist "%ROOT_DIR%frontend\node_modules\.vite" (
        rmdir /s /q "%ROOT_DIR%frontend\node_modules\.vite" >nul 2>&1
    )
    rem Build de produccion del frontend, si se llego a generar con 'npm run build'.
    if exist "%ROOT_DIR%frontend\dist" (
        rmdir /s /q "%ROOT_DIR%frontend\dist" >nul 2>&1
    )
)

if "%SILENCIOSO%"=="0" (
    echo.
    echo ========================================================
    echo       EL ECOMMERCE HA SIDO DETENIDO Y LIMPIADO
    echo ========================================================
    echo.
    pause
)
