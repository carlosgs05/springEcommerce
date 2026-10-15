# Abre una ventana cmd con un titulo y un comando, y devuelve SOLO su PID por stdout.
# Lo llaman iniciar_sistema.bat - no se ejecuta solo.
param(
    [Parameter(Mandatory = $true)] [string] $Titulo,
    [Parameter(Mandatory = $true)] [string] $Comando,
    [Parameter(Mandatory = $true)] [string] $CarpetaTrabajo
)

$argumentos = "/k", "title $Titulo && $Comando"
$proceso = Start-Process -FilePath "cmd.exe" -ArgumentList $argumentos -WorkingDirectory $CarpetaTrabajo -WindowStyle Normal -PassThru
Write-Output $proceso.Id
