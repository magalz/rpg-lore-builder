const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startAuth: () => ipcRenderer.invoke('start-auth'),
  submitAuthCode: (code) => ipcRenderer.invoke('submit-auth-code', code)
});
