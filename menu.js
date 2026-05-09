// Menu template for YouTube Browser with Shorts Blocker toggle
const { Menu, MenuItem } = require('electron');

function createMenuTemplate(mainWindow, shortsBlockerEnabled, onToggleShortsBlocker) {
  return [
    {
      label: 'File',
      submenu: [
        {
          label: 'Home',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            mainWindow.loadURL('https://www.youtube.com');
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            require('electron').app.quit();
          }
        }
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Back',
          accelerator: 'Alt+Left',
          click: () => {
            if (mainWindow.webContents.canGoBack()) {
              mainWindow.webContents.goBack();
            }
          }
        },
        {
          label: 'Forward',
          accelerator: 'Alt+Right',
          click: () => {
            if (mainWindow.webContents.canGoForward()) {
              mainWindow.webContents.goForward();
            }
          }
        }
      ]
    },
    {
      label: 'Extensions',
      submenu: [
        {
          label: 'Block Shorts',
          type: 'checkbox',
          checked: shortsBlockerEnabled,
          accelerator: 'CmdOrCtrl+Shift+S',
          click: (menuItem) => {
            onToggleShortsBlocker(menuItem.checked);
          }
        },
        { type: 'separator' },
        {
          label: 'What gets blocked?',
          enabled: false
        },
        {
          label: '  • Shorts shelf on homepage',
          enabled: false
        },
        {
          label: '  • Shorts tab in navigation',
          enabled: false
        },
        {
          label: '  • Shorts in search results',
          enabled: false
        },
        {
          label: '  • Shorts in sidebar',
          enabled: false
        },
        {
          label: '  • Navigation to /shorts/ URLs',
          enabled: false
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom + 1);
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom - 1);
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About YouTube Browser',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'YouTube Browser',
              detail: 'A dedicated browser for YouTube with built-in Shorts blocker.\n\nVersion 1.1.0',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];
}

module.exports = { createMenuTemplate };
