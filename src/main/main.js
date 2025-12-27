require('module-alias/register')
// Iniciar servidor HTTP que expone la UI en la red local
require('./server')

const { app, BrowserWindow } = require('electron')
const path = require('path')

require('@ipc/inventory.handlers')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Cargar la UI desde el servidor local para que las requests a /api funcionen con la misma origin
  win.loadURL('http://127.0.0.1:3000')
  win.webContents.openDevTools()
}

// Esperar a que el servidor HTTP responda antes de crear la ventana
const http = require('http')
function waitForServer (url, retries = 50, delay = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const tryReq = () => {
      attempts++
      const req = http.request(url, { method: 'GET', timeout: 1000 }, res => {
        resolve()
      })
      req.on('error', () => {
        if (attempts >= retries) return reject(new Error('Server did not respond'))
        setTimeout(tryReq, delay)
      })
      req.on('timeout', () => req.destroy())
      req.end()
    }
    tryReq()
  })
}

app.whenReady().then(async () => {
  try {
    await waitForServer('http://127.0.0.1:3000/api/ping')

  } catch (err) {
    console.warn('Servidor local no respondió a tiempo, procediendo a crear la ventana de todas formas')
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
