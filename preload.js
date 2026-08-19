const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  register: (data) => ipcRenderer.invoke('auth:register', data),
  login: (data) => ipcRenderer.invoke('auth:login', data),
  updateProfile: (data) => ipcRenderer.invoke('auth:updateProfile', data),
  changePassword: (data) => ipcRenderer.invoke('auth:changePassword', data),
  getVersion: () => ipcRenderer.invoke('app:version'),
});
