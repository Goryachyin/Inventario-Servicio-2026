const { ipcMain } = require('electron')
const inventoryRepo = require('@database/inventory.repository')

ipcMain.handle('inventory:getAll', async () => {
  try {
    return inventoryRepo.getAll()
  } catch (err) {
    throw new Error(err.message)
  }
})

ipcMain.handle('inventory:create', async (_event, product) => {
  try {
    return inventoryRepo.create(product)
  } catch (err) {
    throw new Error(err.message)
  }
})

ipcMain.handle('inventory:delete', async (_event, id) => {
  try {
    return inventoryRepo.delete(id)
  } catch (err) {
    throw new Error(err.message)
  }
})

ipcMain.handle('inventory:edit', async (_event, id, product) => {
  try {
    return inventoryRepo.edit(id, product)
  } catch (err) {
    throw new Error(err.message)
  }
})
