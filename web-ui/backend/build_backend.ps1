# Lore Sanctum - Backend Build Script
# Compila o backend Python em um executável standalone para distribuição

$BackendDir = Get-Location
$ProjectRoot = Join-Path $BackendDir ".."
$ResourcesDir = Join-Path $ProjectRoot "resources"
$VenvBin = Join-Path $BackendDir ".venv\Scripts\python.exe"

if (!(Test-Path $VenvBin)) {
    Write-Error "Virtual environment not found at $VenvBin"
    exit 1
}

Write-Host "--- Iniciando Compilação do Backend ---" -ForegroundColor Cyan

# Instalar PyInstaller se necessário
Write-Host "Verificando dependências de build..."
& $VenvBin -m pip install pyinstaller

# Limpar builds antigos
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }

# Executar PyInstaller
# --onedir: Pasta com executável (mais rápido que onefile)
# --noconsole: Sem janela de prompt
Write-Host "Executando PyInstaller..."
& $VenvBin -m PyInstaller --name backend --noconsole --onedir --clean main.py

if ($LASTEXITCODE -ne 0) {
    Write-Error "Erro na compilação do PyInstaller."
    exit 1
}

# Mover para a pasta de recursos do Electron
Write-Host "Movendo binários para a pasta de recursos do Electron..."
$Dest = Join-Path $ResourcesDir "backend"
if (Test-Path $Dest) { Remove-Item -Recurse -Force $Dest }
New-Item -ItemType Directory -Path (Split-Path $Dest -Parent) -ErrorAction SilentlyContinue
Move-Item -Path "dist/backend" -Destination $Dest

Write-Host "--- Build do Backend Concluído com Sucesso! ---" -ForegroundColor Green
