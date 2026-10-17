@echo off
if /i "%~1"=="/OCULTO" goto :CONTINUAR
powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath '%~f0' -ArgumentList '/OCULTO' -WindowStyle Hidden"
exit /b

:CONTINUAR
set "ROOT_DIR=%~dp0"
call :main >> "%ROOT_DIR%scripts\ecommerce_log.txt" 2>&1
exit /b

:main
chcp 65001 >nul
echo.
echo ===== %date% %time% =====
echo ========================================================
echo           INICIANDO ECOMMERCE [BACKEND + FRONTEND]
echo ========================================================
echo.

cd /d "%ROOT_DIR%"

echo [1/5] Verificando requisitos de ejecucion...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se encontro 'node' en el PATH del sistema.
    echo Instale Node.js desde https://nodejs.org
    exit /b 1
)
echo [OK] Node.js verificado correctamente.

if not exist "%ROOT_DIR%frontend\node_modules" (
    echo.
    echo [AVISO] Faltan las dependencias del frontend [node_modules]. Instalando...
    pushd "%ROOT_DIR%frontend"
    call npm install
    popd
)

echo.
echo [2/5] Cerrando una corrida anterior, si quedo alguna abierta...
rem /SOLO_PROCESOS: solo mata procesos colgados, no borra target/.vite [ver detener_sistema.bat].
call "%ROOT_DIR%detener_sistema.bat" /SOLO_PROCESOS

echo.
echo [3/5] Iniciando el backend [Spring Boot] en puerto 8080...
rem "%ROOT_DIR%backend" sin barra final: si se la pasamos a Start-Process justo
rem antes de la comilla de cierre, PowerShell la entiende como un escape de esa
rem comilla y revienta el comando con DirectoryNotFoundException.
for /f %%P in ('powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT_DIR%scripts\iniciar_proceso.ps1" -Titulo "Ecommerce - Backend - puerto 8080" -Comando ".\arrancar_backend.bat" -CarpetaTrabajo "%ROOT_DIR%backend"') do set "BACKEND_PID=%%P"
echo %BACKEND_PID%> "%ROOT_DIR%scripts\ecommerce_backend.pid"
echo [OK] Backend iniciado [PID %BACKEND_PID%].

echo.
echo Esperando a que el backend termine de arrancar [puede tardar, es Java]...
set "ESPERADO_BACK=0"
:esperar_backend
rem /r /c:":8080 " exige el puerto exacto seguido de espacio, para no confundirlo con 80800+.
netstat -ano | findstr /r /c:":8080 " | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 goto backend_listo
set /a ESPERADO_BACK+=1
if %ESPERADO_BACK% GEQ 90 goto backend_timeout
ping 127.0.0.1 -n 2 >nul
goto esperar_backend
:backend_timeout
echo [AVISO] El backend no respondio en el puerto 8080 tras %ESPERADO_BACK% intentos.
echo Revisa la ventana "Ecommerce - Backend - puerto 8080" por errores [ej. PostgreSQL apagado o un error de compilacion].
goto backend_fin
:backend_listo
echo [OK] Backend respondiendo tras %ESPERADO_BACK% intentos.
:backend_fin

echo.
echo [4/5] Iniciando el frontend [Vite] en puerto 5173...
for /f %%P in ('powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT_DIR%scripts\iniciar_proceso.ps1" -Titulo "Ecommerce - Frontend - puerto 5173" -Comando "npm run dev" -CarpetaTrabajo "%ROOT_DIR%frontend"') do set "FRONTEND_PID=%%P"
echo %FRONTEND_PID%> "%ROOT_DIR%scripts\ecommerce_frontend.pid"
echo [OK] Frontend iniciado [PID %FRONTEND_PID%].

echo.
echo   URL de acceso:   http://localhost:5173
echo.
echo Esperando a que el frontend termine de arrancar...
set "ESPERADO_FRONT=0"
:esperar_frontend
netstat -ano | findstr /r /c:":5173 " | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 goto frontend_listo
set /a ESPERADO_FRONT+=1
if %ESPERADO_FRONT% GEQ 40 goto frontend_timeout
ping 127.0.0.1 -n 2 >nul
goto esperar_frontend
:frontend_timeout
echo [AVISO] El frontend no respondio en el puerto 5173 tras %ESPERADO_FRONT% intentos.
echo Revisa la ventana "Ecommerce - Frontend - puerto 5173" por errores.
goto frontend_fin
:frontend_listo
echo [OK] Frontend respondiendo tras %ESPERADO_FRONT% intentos.
:frontend_fin

echo.
echo [5/5] Abriendo la tienda en el navegador...
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT_DIR%scripts\abrir_navegador_app.ps1" -Url "http://localhost:5173"
echo ===== FIN =====
exit /b
