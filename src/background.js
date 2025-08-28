'use strict'

import { app, protocol, BrowserWindow, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'

let win = null
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, argv) => {
    console.log(argv)

    if (win) {
      win.webContents.send('renderer-scheme', argv[argv.length - 1])

      if (win.isMinimized()) win.restore()
      if (win.isVisible()) {
        win.focus()
      } else {
        win.show()
        win.setSkipTaskbar(false)
      }
    }
  })
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false
    }
  })

  win.maximize()

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await win.loadURL('app://./index.html')
  }

  if (process.platform === 'win32') {
    let arg = process.argv[1]

    setTimeout(() => {
      win.webContents.send('renderer-scheme', arg);
    }, 500)
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  Menu.setApplicationMenu(null)
  createWindow()

  if (app.isPackaged) {
    app.setAsDefaultProtocolClient('ncc')
  } else {
    app.setAsDefaultProtocolClient('ncc-test', process.execPath, [
      path.resolve(process.argv[1])
    ])
  }
})

app.on('will-finish-launching', () => {
  app.on('open-url', (event, url) => {
    event.preventDefault();

    if (win) {
      win.webContents.send('renderer-scheme', url);

      if (win.isMinimized()) win.restore()
      if (win.isVisible()) {
        win.focus()
      } else {
        win.show()
        win.setSkipTaskbar(false)
      }
    }
  });
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
