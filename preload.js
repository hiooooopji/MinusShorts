const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('youtubeBrowser', {
  // Navigation controls
  goBack: () => ipcRenderer.send('navigate-back'),
  goForward: () => ipcRenderer.send('navigate-forward'),
  refresh: () => ipcRenderer.send('navigate-refresh'),
  goHome: () => ipcRenderer.send('navigate-home'),
  
  // Check if navigation is possible
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  
  // Shorts blocker toggle
  toggleShortsBlocker: (enabled) => ipcRenderer.send('toggle-shorts-blocker', enabled),
  
  // Version info
  version: '1.1.0'
});
