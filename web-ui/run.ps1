# Run the Lore Sanctum Desktop App
Write-Host "Iniciando a preparacao do Lore Sanctum..." -ForegroundColor Cyan

# Verifica e cria o ambiente virtual Python se nao existir
if (-not (Test-Path "backend\.venv")) { 
    Write-Host "Criando ambiente virtual Python..." -ForegroundColor Yellow
    cd backend
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    cd ..
}

# Verifica modulos do Frontend
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Instalando dependencias do Frontend..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

# Verifica modulos do Wrapper Electron
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias do Electron..." -ForegroundColor Yellow
    npm install
}

Write-Host "Abrindo os portoes do Sanctum..." -ForegroundColor Green
npm start
