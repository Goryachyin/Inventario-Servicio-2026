/* eslint-disable no-return-assign */
import { showConfirmModal } from './components/confirmModal.js'

const modal = document.getElementById('modal')
const btnOpen = document.getElementById('btn-open-modal')
const btnCancel = document.getElementById('btn-cancel')
const btnSave = document.getElementById('btn-save')

const tableBody = document.getElementById('products-table')
const menuItems = document.querySelectorAll('.menu-item')
const views = document.querySelectorAll('.view')
const viewTitle = document.getElementById('view-title')

const nombre = document.getElementById('nombre')
const descripcion = document.getElementById('descripcion')
const tipoUnidad = document.getElementById('tipoUnidad')
const cantidad = document.getElementById('cantidad')

// Estado para edición
let editingId = null
const modalTitle = modal.querySelector('h2')


const filterColumn = document.getElementById('filter-column')
const filterText = document.getElementById('filter-text')

let productos = []

menuItems.forEach(item => {
  item.onclick = () => {
    menuItems.forEach(i => i.classList.remove('active'))
    item.classList.add('active')

    const view = item.dataset.view
    viewTitle.textContent = item.textContent

    views.forEach(v => {
      v.classList.toggle('active', v.id === view)
    })
  }
})

btnOpen.onclick = () => {
  editingId = null
  modalTitle.textContent = 'Registrar producto'
  btnSave.textContent = 'Guardar'
  nombre.value = ''
  descripcion.value = ''
  tipoUnidad.value = ''
  cantidad.value = ''
  modal.style.display = 'flex'
}
btnCancel.onclick = () => {
  editingId = null
  modalTitle.textContent = 'Registrar producto'
  btnSave.textContent = 'Guardar'
  modal.style.display = 'none'
} 

btnSave.onclick = async () => {
  try {
    if (!nombre.value || !tipoUnidad.value || cantidad.value === '') {
      throw new Error('Nombre, tipo de unidad y cantidad son obligatorios')
    }

    const payload = {
      nombre: nombre.value,
      descripcion: descripcion.value || 'Sin descripción',
      tipoUnidad: tipoUnidad.value,
      cantidad: Number(cantidad.value || 0)
    }

    // Si estamos en un navegador que usa la UI servida, usamos la API HTTP
    if (typeof fetch !== 'undefined') {
      const headers = { 'Content-Type': 'application/json' }
      // Si existe API key en ventana, la añadimos automáticamente
      if (window.__API_KEY__) headers['x-api-key'] = window.__API_KEY__

      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Error al actualizar el producto')
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Error al guardar el producto')
      }
    } else if (window.inventoryAPI) {
      if (editingId && window.inventoryAPI.edit) {
        await window.inventoryAPI.edit(editingId, payload)
      } else if (window.inventoryAPI.create) {
        await window.inventoryAPI.create(payload)
      }
    }

    modal.style.display = 'none'
    editingId = null
    modalTitle.textContent = 'Registrar producto'
    btnSave.textContent = 'Guardar'
    await cargarProductos()
    aplicarFiltros()

    // Limpiar formulario
    nombre.value = ''
    descripcion.value = ''
    tipoUnidad.value = ''
    cantidad.value = '' 
  } catch (err) {
    showError(err.message || 'Error al guardar el producto')
  }
}

function renderTabla (lista) {
  tableBody.innerHTML = lista.map(p => `
    <tr data-id="${p.id}">
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.descripcion}</td>
      <td>${p.tipoUnidad}</td>
      <td>${p.cantidad}</td>
      <td>
        <button
          class="btn-secondary btn-edit"
          data-action="edit"
          data-id="${p.id}">
          Editar
        </button>
        <button
          class="btn-secondary btn-delete"
          data-action="delete"
          data-id="${p.id}">
          Eliminar
        </button>
      </td>
    </tr>
  `).join('')
}

function aplicarFiltros () {
  const columna = filterColumn.value
  const texto = filterText.value.toLowerCase().trim()

  const filtrados = productos.filter(p => {
    // Sin texto → mostrar todo
    if (!texto) return true

    // Buscar en todas las columnas
    if (!columna) {
      return (
        String(p.id).includes(texto) ||
                p.nombre.toLowerCase().includes(texto) ||
                (p.descripcion || '').toLowerCase().includes(texto) ||
                p.tipoUnidad.toLowerCase().includes(texto) ||
                String(p.cantidad).includes(texto)
      )
    }

    // Buscar en columna específica
    const valor = p[columna]

    if (valor === undefined || valor === null) return false

    return String(valor).toLowerCase().includes(texto)
  })

  renderTabla(filtrados)
}

filterColumn.addEventListener('change', aplicarFiltros)
filterText.addEventListener('input', aplicarFiltros)

async function cargarProductos () {
  try {
    // Preferir API HTTP si está disponible (clientes remotos o UI servida desde el servidor)
    if (typeof fetch !== 'undefined') {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Error al obtener productos')
      productos = await res.json()
    } else if (window.inventoryAPI && window.inventoryAPI.getAll) {
      productos = await window.inventoryAPI.getAll()
    } else {
      productos = []
    }

    aplicarFiltros()
  } catch (err) {
    showError(err.message || 'Error al cargar productos')
  }
}

/* ================= ERROR HANDLER ================= */

const errorModal = document.getElementById('error-modal')
const errorMessage = document.getElementById('error-message')
const btnErrorClose = document.getElementById('btn-error-close')

// eslint-disable-next-line no-unused-vars
function showError (message) {
  console.error(message)
  errorMessage.textContent = message
  errorModal.style.display = 'flex'
}

btnErrorClose.onclick = () => {
  errorModal.style.display = 'none'
}

/* ================= GLOBAL EVENTS ================= */

window.addEventListener('error', event => {
  showError(event.message || 'Error desconocido')
})

window.addEventListener('unhandledrejection', event => {
  const msg = event.reason?.message || String(event.reason)
  showError(msg)
})

tableBody.addEventListener('click', event => {
  const editBtn = event.target.closest('[data-action="edit"]')
  if (editBtn) {
    const id = Number(editBtn.dataset.id)
    const prod = productos.find(p => p.id === id)
    if (!prod) return

    // Llenar formulario para edición
    editingId = id
    modalTitle.textContent = 'Editar producto'
    btnSave.textContent = 'Actualizar'
    nombre.value = prod.nombre || ''
    descripcion.value = prod.descripcion || ''
    tipoUnidad.value = prod.tipoUnidad || ''
    cantidad.value = prod.cantidad || 0

    modal.style.display = 'flex'
    return
  }

  const btn = event.target.closest('[data-action="delete"]')
  if (!btn) return

  const id = Number(btn.dataset.id)
  const prod = productos.find(p => p.id === id)
  if (!prod) return

  showConfirmModal({
    title: 'Eliminar producto',
    message: `¿Seguro que deseas eliminar "${prod.nombre}"?`,
    confirmText: 'Eliminar',
    onConfirm: async () => {
      try {
        if (typeof fetch !== 'undefined') {
          const headers = {}
          if (window.__API_KEY__) headers['x-api-key'] = window.__API_KEY__
          const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers })
          if (!res.ok) throw new Error('Error al eliminar el producto')
        } else if (window.inventoryAPI && window.inventoryAPI.delete) {
          await window.inventoryAPI.delete(id)
        }

        await cargarProductos()
        aplicarFiltros()
      } catch (err) {
        showError(err.message || 'Error al eliminar producto')
      }
    }
  })
})

// Conectar a socket.io para recibir actualizaciones en tiempo real (si está disponible)
if (typeof io !== 'undefined') {
  try {
    const socket = io()
    socket.on('inventory:changed', (rows) => {
      productos = rows || []
      aplicarFiltros()
    })
  } catch (err) {
    console.warn('No se pudo conectar a socket.io', err)
  }
}

// Cargar inicialmente
