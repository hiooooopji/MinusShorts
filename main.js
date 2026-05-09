const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { createMenuTemplate } = require('./menu');

let mainWindow;
let shortsBlockerEnabled = true;
const shortsBlockerScript = fs.readFileSync(path.join(__dirname, 'shorts-blocker.js'), 'utf8');

const ALLOWED_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'accounts.google.com',
  'myaccount.google.com',
  'google.com'
];

function isAllowedUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_HOSTS.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host));
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'YouTube Browser',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    }
  });

  mainWindow.loadURL('https://www.youtube.com');

  // Inject Shorts blocker when page loads
  mainWindow.webContents.on('dom-ready', () => {
    if (shortsBlockerEnabled) {
      injectShortsBlocker();
    }
  });

  // Inject after navigation completes
  mainWindow.webContents.on('did-navigate', () => {
    if (shortsBlockerEnabled) {
      injectShortsBlocker();
    }
  });

  // Block external navigation - only allow YouTube
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedUrl(url)) {
      event.preventDefault();
      console.log('Blocked navigation to:', url);
    }
  });

  // Handle new window requests
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedUrl(url)) {
      mainWindow.loadURL(url);
    } else {
      console.log('Blocked new window to:', url);
    }
    return { action: 'deny' };
  });

  // Intercept link clicks
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    if (isAllowedUrl(url)) {
      mainWindow.loadURL(url);
    } else {
      console.log('Blocked new window to:', url);
    }
  });

  // Update window title with page title
  mainWindow.webContents.on('page-title-updated', (event, title) => {
    mainWindow.setTitle(title);
  });

  // Handle external links trying to open
  mainWindow.webContents.on('will-frame-navigate', (event, url) => {
    if (!isAllowedUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Set up menu
  updateMenu();
}

// Inject the Shorts blocker script into the page
function injectShortsBlocker() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  
  mainWindow.webContents.executeJavaScript(shortsBlockerScript).catch(err => {
    console.log('[Shorts Blocker] Injection error:', err.message);
  });
}

// Toggle Shorts blocker on/off
function toggleShortsBlocker(enabled) {
  shortsBlockerEnabled = enabled;
  console.log('[Shorts Blocker]', enabled ? 'Enabled' : 'Disabled');
  
  if (enabled) {
    injectShortsBlocker();
  } else {
    // Remove the blocker by reloading the page without injection
    mainWindow.webContents.reload();
  }
  
  updateMenu();
}

// Update the application menu
function updateMenu() {
  const menuTemplate = createMenuTemplate(mainWindow, shortsBlockerEnabled, toggleShortsBlocker);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for navigation
ipcMain.on('navigate-back', () => {
  if (mainWindow && mainWindow.webContents.canGoBack()) {
    mainWindow.webContents.goBack();
  }
});

ipcMain.on('navigate-forward', () => {
  if (mainWindow && mainWindow.webContents.canGoForward()) {
    mainWindow.webContents.goForward();
  }
});

ipcMain.on('navigate-refresh', () => {
  if (mainWindow) {
    mainWindow.webContents.reload();
  }
});

ipcMain.on('navigate-home', () => {
  if (mainWindow) {
    mainWindow.loadURL('https://www.youtube.com');
  }
});

// IPC handler for Shorts blocker toggle
ipcMain.on('toggle-shorts-blocker', (event, enabled) => {
  toggleShortsBlocker(enabled);
});
