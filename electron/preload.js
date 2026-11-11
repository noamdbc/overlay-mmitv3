'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  getAppSettings: () => ipcRenderer.invoke('app:get-settings'),
  setCloseToTray: (enabled) => ipcRenderer.invoke('app:set-close-to-tray', Boolean(enabled)),
  installStreamDeckPlugin: () => ipcRenderer.invoke('app:install-streamdeck'),
  openDataFolder: () => ipcRenderer.invoke('app:open-data-folder'),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', String(url || '')),
  quitApp: () => ipcRenderer.invoke('app:quit'),
  onMenuAction: (callback) => {
    if (typeof callback !== 'function') return;
    ipcRenderer.on('menu:action', (_event, action) => callback(action));
  }
});
