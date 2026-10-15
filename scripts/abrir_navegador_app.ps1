# Abre una URL en el navegador que el usuario mas usa.
#
# NO usa el navegador "predeterminado" de Windows [ese dato puede estar mal: Windows
# 11 tiene un bug conocido donde Configuracion muestra un navegador pero el registro
# real sigue apuntando a otro]. En vez de eso:
#   1. Si ya hay alguno de los navegadores conocidos ABIERTO en este momento, es ese
#      [es la senial mas confiable de cual usa la persona de verdad].
#   2. Si no hay ninguno abierto, usa el primero que encuentre INSTALADO, dejando
#      Edge para el final [viene de fabrica en toda PC con Windows; si el usuario
#      instalo otro, es porque prefiere ese].
#
# Se abre como una pestana mas, sin ventana aparte ni rastreo de PID: probado que
# no todos los navegadores [Opera GX, por ejemplo] abren una ventana aislable
# cuando ya estan corriendo, asi que detener_sistema.bat ya no intenta cerrarla -
# el usuario la cierra el mismo, como cualquier pestana.
#
# Lo llama iniciar_sistema.bat, despues de confirmar que la URL ya responde.
# No se ejecuta solo.
param(
    [Parameter(Mandatory = $true)] [string] $Url
)

$navegadoresConocidos = @(
    @{ Proceso = "opera";   Exe = "opera.exe" },
    @{ Proceso = "chrome";  Exe = "chrome.exe" },
    @{ Proceso = "brave";   Exe = "brave.exe" },
    @{ Proceso = "vivaldi"; Exe = "vivaldi.exe" },
    @{ Proceso = "firefox"; Exe = "firefox.exe" },
    @{ Proceso = "msedge";  Exe = "msedge.exe" }
)

function Buscar-RutaInstalada([string] $nombreExe) {
    $candidatas = @(
        "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\$nombreExe",
        "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\$nombreExe",
        "Registry::HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\$nombreExe"
    )
    foreach ($ruta in $candidatas) {
        $valor = (Get-ItemProperty -Path $ruta -ErrorAction SilentlyContinue)."(default)"
        if ($valor) {
            $valor = $valor.Trim('"')
            if (Test-Path $valor) { return $valor }
        }
    }
    return $null
}

$exe = $null

# 1) Alguno ya abierto ahora mismo
foreach ($nav in $navegadoresConocidos) {
    if (Get-Process -Name $nav.Proceso -ErrorAction SilentlyContinue | Select-Object -First 1) {
        $ruta = Buscar-RutaInstalada $nav.Exe
        if ($ruta) { $exe = $ruta; break }
    }
}

# 2) Si ninguno esta abierto, el primero instalado [Edge al final de la lista]
if (-not $exe) {
    foreach ($nav in $navegadoresConocidos) {
        $ruta = Buscar-RutaInstalada $nav.Exe
        if ($ruta) { $exe = $ruta; break }
    }
}

if ($exe) {
    Start-Process -FilePath $exe -ArgumentList $Url
} else {
    # Nada conocido instalado - que lo abra Windows con lo que tenga.
    Start-Process $Url
}
