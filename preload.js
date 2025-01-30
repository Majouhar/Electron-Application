const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onUserData: (callback) => ipcRenderer.on('user-data', (event, userData) => callback(event, userData)),
});
