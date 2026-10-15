@echo off
rem Lo llama ..\iniciar_sistema.bat dentro de la ventana del backend - no se ejecuta solo.
rem El pom.xml exige Java 21 [java.version=21]. Si el 'java' del PATH es mas viejo,
rem busca un JDK 21+ ya instalado en esta PC y lo usa SOLO para esta ventana
rem [no toca el JAVA_HOME del sistema].
setlocal
set "BACKEND_JAVA_HOME="
for %%D in (
    "C:\Program Files\Java\jdk-23"
    "C:\Program Files\Java\jdk-22"
    "C:\Program Files\Java\jdk-21"
    "C:\Program Files\Java\jdk-24"
    "C:\Program Files\Eclipse Adoptium\jdk-21.0.0.0-hotspot"
    "C:\Program Files\Eclipse Adoptium\jdk-22.0.0.0-hotspot"
    "C:\Program Files\Eclipse Adoptium\jdk-23.0.0.0-hotspot"
    "C:\Program Files\Eclipse Adoptium\jdk-24.0.0.0-hotspot"
) do (
    if exist "%%~D\bin\java.exe" if not defined BACKEND_JAVA_HOME set "BACKEND_JAVA_HOME=%%~D"
)

if defined BACKEND_JAVA_HOME (
    echo [OK] Usando Java 21+ en "%BACKEND_JAVA_HOME%" para compilar y correr el backend.
    rem mvnw.cmd solo mira JAVA_HOME para ubicar java.exe [no usa el PATH],
    rem asi que alcanza con esto - tocar el PATH aqui solo arriesga romper
    rem la busqueda de mvnw.cmd mismo.
    set "JAVA_HOME=%BACKEND_JAVA_HOME%"
) else (
    echo [AVISO] No se encontro una instalacion de Java 21 o superior conocida en esta PC.
    echo El backend requiere Java 21 [pom.xml, java.version=21]. Si falla la compilacion, instala un JDK 21+.
)

rem Ruta explicita [".\"] - esta PC tiene activado NoDefaultCurrentDirectoryInExePath,
rem que impide que cmd encuentre mvnw.cmd por nombre suelto aunque este en esta carpeta.
call .\mvnw.cmd spring-boot:run
