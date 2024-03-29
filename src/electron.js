const { app, BrowserWindow, screen, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

const { EventEmitter } = require('events')
const ioevents = new EventEmitter()
const stopioevents = (isDev ? require('bindings')('ioevents') : require(path.join(app.getAppPath(), '..', 'modules', 'ioevents', 'ioevents.node')))
  .start(ioevents.emit.bind(ioevents))

const VER = '0.1.2'

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: Math.min(1500, screen.getPrimaryDisplay().workAreaSize.width * 0.8),
    height: Math.min(800, screen.getPrimaryDisplay().workAreaSize.height * 0.8),
    minWidth: 600,
    minHeight: 350,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: true, nodeIntegrationInWorker: true, contextIsolation: false },
    icon: './static/logo.png'
  })
  win.loadURL(isDev ? 'http://localhost:8081/dashboard' : 'https://streameq.xyz/dashboard')

  ioevents.on('keydown', k => console.log('keydown', k))
  ioevents.on('keyup', k => console.log('keyup', k))
  ioevents.on('mousedown', k => console.log('mousedown', k))
  ioevents.on('mouseup', k => console.log('mouseup', k))

  ioevents.on('keydown', k => win.webContents.send('keydown', k))
  ioevents.on('keyup', k => win.webContents.send('keyup', k))
  ioevents.on('mousedown', k => win.webContents.send('mousedown', k))
  ioevents.on('mouseup', k => win.webContents.send('mouseup', k))
  
  ipcMain.handle('version', () => VER)
  win.webContents.on('ipc-message', (_, type) => {
    type === 'minimize' && win.minimize()
    type === 'maximize' && (win.isMaximized() ? win.unmaximize() : win.maximize())
    type === 'close' && win.close()
  })
})

app.on('window-all-closed', () => {
  stopioevents()
  app.quit()
})