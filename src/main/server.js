const express = require('express');
const path = require('path');
const os = require('os');
const http = require('http');
const inventoryRepo = require('@database/inventory.repository')

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json())
const cors = require('cors')
app.use(cors())

// Servir archivos estáticos de la UI
app.use(express.static(path.join(__dirname, '..', 'renderer')));

// Endpoint simple para comprobar que el servidor está vivo
app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));

// Middleware de autenticación simple: usa X-API-KEY en headers. Si no se define API_KEY en el servidor, las rutas protegidas funcionan sin clave (pero se muestra advertencia).
const API_KEY = process.env.API_KEY || ''
if (!API_KEY) console.warn('WARNING: API_KEY not set. Protected routes will accept requests without key.')

function requireApiKey (req, res, next) {
  if (!API_KEY) return next()
  const key = req.headers['x-api-key']
  if (key && key === API_KEY) return next()
  return res.status(401).json({ error: 'Unauthorized' })
}

// API: listar productos
app.get('/api/products', async (req, res) => {
  try {
    const rows = await inventoryRepo.getAll()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// API: crear producto (protegido)
app.post('/api/products', requireApiKey, async (req, res) => {
  try {
    const product = req.body
    await inventoryRepo.create(product)
    // emitir evento más adelante desde socket.io
    res.status(201).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// API: eliminar producto (protegido)
app.delete('/api/products/:id', requireApiKey, async (req, res) => {
  try {
    const id = Number(req.params.id)
    await inventoryRepo.delete(id)
    // emitir evento más adelante desde socket.io
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// API: editar producto (protegido)
app.put('/api/products/:id', requireApiKey, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' })
    const product = req.body
    const changes = await inventoryRepo.edit(id, product)
    if (!changes) return res.status(404).json({ error: 'Not found' })
    await emitChange()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Integrar socket.io para notificaciones en tiempo real
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {
  cors: { origin: '*' }
})

io.on('connection', async (socket) => {
  console.log('Socket conectado:', socket.id)
  try {
    const rows = await inventoryRepo.getAll()
    socket.emit('inventory:changed', rows)
  } catch (err) {
    console.error('Error obteniendo inventario para nuevo socket:', err)
  }
})

// Emitir eventos cuando se modifiquen datos: envolvemos las funciones del repositorio para emitir
const emitChange = async () => {
  const rows = await inventoryRepo.getAll()
  io.emit('inventory:changed', rows)
  return rows
}

// Monkey-patch: tras crear/eliminar, emitimos los cambios. (Llamamos emitChange manualmente desde aquí)
const originalCreate = inventoryRepo.create
inventoryRepo.create = async (product) => {
  const res = await originalCreate(product)
  await emitChange()
  return res
}

const originalDelete = inventoryRepo.delete
inventoryRepo.delete = async (id) => {
  const res = await originalDelete(id)
  await emitChange()
  return res
}

const originalEdit = inventoryRepo.edit
inventoryRepo.edit = async (id, product) => {
  const res = await originalEdit(id, product)
  await emitChange()
  return res
}

server.listen(PORT, '0.0.0.0', async () => {
  const ips = getLocalIPs();
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
  console.log(`Accesible desde la red en: http://${ips[0]}:${PORT}`);

  try {
    const rows = await emitChange()
    console.log(`Inventario inicial enviado (${rows.length} productos)`)
  } catch (err) {
    console.error('Error al obtener inventario inicial:', err)
  }
});