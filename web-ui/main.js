const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

let mainWindow;
let pythonProcess;

// Função para iniciar o Backend Python
function startPythonBackend() {
  const isWindows = os.platform() === 'win32';
  const isPackaged = app.isPackaged;

  // No modo empacotado, usamos o executável do PyInstaller
  // Em dev, usamos o venv local
  let executable;
  let args = [];
  let cwd;

  if (isPackaged) {
    // electron-builder coloca extraResources em 'resources'
    const resourcesPath = process.resourcesPath;
    executable = isWindows
      ? path.join(resourcesPath, 'backend', 'backend.exe')
      : path.join(resourcesPath, 'backend', 'backend');
    cwd = path.join(resourcesPath, 'backend');

    // Caminho de persistência no AppData
    const userDataPath = app.getPath('userData');
    args = ['--data-dir', userDataPath];
  } else {
    const backendPath = path.join(__dirname, 'backend');
    executable = isWindows
      ? path.join(backendPath, '.venv', 'Scripts', 'python.exe')
      : path.join(backendPath, '.venv', 'bin', 'python');
    args = ['main.py'];
    cwd = backendPath;
  }

  console.log(`Iniciando servidor de Lore (${isPackaged ? 'Prod' : 'Dev'})...`);
  pythonProcess = spawn(executable, args, {
    cwd: cwd,
    env: { ...process.env },
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
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Desativa temporariamente para evitar bloqueios de CORS locais
    },
    backgroundColor: '#00000000',
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

  // IPC Handlers for window controls
  ipcMain.on('window-min', () => mainWindow.minimize());
  ipcMain.on('window-max', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('window-close', () => mainWindow.close());
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
