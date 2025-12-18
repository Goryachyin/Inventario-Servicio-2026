const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const { app } = require('electron')

const dbPath = path.join(app.getPath('userData'), 'inventory.sqlite')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la BD', err)
  } else {
    console.log('Base de datos conectada')
  }
})

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT DEFAULT 'Sin descripción',
      tipoUnidad TEXT NOT NULL,
      cantidad INTEGER NOT NULL DEFAULT 0
    )
  `)
})

module.exports = db
