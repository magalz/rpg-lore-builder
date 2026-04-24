const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

let mainWindow;
let pythonProcess;

// Função para iniciar o Backend Python
function startPythonBackend() {
  const backendPath = path.join(__dirname, 'backend');
  const isWindows = os.platform() === 'win32';
  const venvPython = isWindows
    ? path.join(backendPath, '.venv', 'Scripts', 'python.exe')
    : path.join(backendPath, '.venv', 'bin', 'python');

  console.log('Iniciando servidor de Lore (Python)...');
  pythonProcess = spawn(venvPython, ['main.py'], {
    cwd: backendPath,
    env: { ...process.env }, // Herda o env para carregar o .env e variáveis do sistema
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Servidor Python encerrado com código ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Lore Sanctum',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Desativa temporariamente para evitar bloqueios de CORS locais
    },
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: true,
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('http://127.0.0.1:5173');
  }

  // Intercepta navegação para abrir links externos no navegador do sistema
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('https://aistudio.google.com') || url.startsWith('http') && !url.includes('127.0.0.1')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startPythonBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Encerra tudo de forma limpa ao fechar o app
app.on('window-all-closed', () => {
  if (pythonProcess) {
    console.log('Encerrando servidor de Lore...');
    pythonProcess.kill('SIGINT');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
