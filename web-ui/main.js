const { app, BrowserWindow, ipcMain } = require('electron');
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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true 
    },
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: true,
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173');
    // mainWindow.webContents.openDevTools(); // Comentado para visual de produção
  } else {
    // Carregar o build quando estiver pronto
    mainWindow.loadURL('http://127.0.0.1:5173'); 
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

let authProcess = null;

app.whenReady().then(() => {
  ipcMain.handle('start-auth', async () => {
    return new Promise((resolve) => {
      console.log('Iniciando fluxo de gcloud...');
      
      // Se já houver um processo rodando, mata ele
      if (authProcess) authProcess.kill();

      authProcess = spawn('gcloud', ['auth', 'application-default', 'login', '--no-launch-browser'], { shell: true });
      
      let authUrlSent = false;
      
      authProcess.stderr.on('data', (data) => {
        const output = data.toString();
        console.log(`[gcloud auth]: ${output}`);
        
        const urlMatch = output.match(/https:\/\/accounts\.google\.com[^\s]+/);
        if (urlMatch && !authUrlSent) {
          authUrlSent = true;
          require('electron').shell.openExternal(urlMatch[0]);
          // Avisa o frontend que estamos aguardando o código
          resolve({ status: 'AWAITING_CODE', url: urlMatch[0] });
        }
      });

      authProcess.on('close', (code) => {
        console.log(`Processo gcloud fechou com código ${code}`);
        authProcess = null;
      });
    });
  });

  ipcMain.handle('submit-auth-code', async (event, code) => {
    return new Promise((resolve) => {
      if (!authProcess) {
        resolve({ success: false, error: 'No active auth process' });
        return;
      }

      console.log('Enviando código de autorização para o gcloud...');
      authProcess.stdin.write(code + '\n');
      
      // O gcloud costuma fechar após receber o código com sucesso
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Timeout waiting for gcloud to finish' });
      }, 10000);

      authProcess.on('close', (exitCode) => {
        clearTimeout(timeout);
        if (exitCode === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `Exit code ${exitCode}` });
        }
      });
    });
  });

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
