/* eslint-disable no-return-assign */
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
const tipoUnidad = document.getElementById('tipo-unidad')
const cantidad = document.getElementById('cantidad')

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

btnOpen.onclick = () => modal.style.display = 'flex'
btnCancel.onclick = () => modal.style.display = 'none'

btnSave.onclick = async () => {
  await window.inventoryAPI.create({
    nombre: nombre.value,
    descripcion: descripcion.value,
    tipoUnidad: tipoUnidad.value,
    cantidad: Number(cantidad.value)
  })

  modal.style.display = 'none'
  cargarProductos()
}

async function cargarProductos () {
  const productos = await window.inventoryAPI.getAll()
  tableBody.innerHTML = ''

  productos.forEach(p => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.tipoUnidad}</td>
      <td>${p.cantidad}</td>
      <td><button class="secondary">Eliminar</button></td>
    `
    tableBody.appendChild(tr)
  })
}

cargarProductos()
