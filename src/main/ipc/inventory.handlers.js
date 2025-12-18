const { ipcMain } = require('electron')
const inventoryRepo = require('@database/inventory.repository')

ipcMain.handle('inventory:getAll', async () => {
  return inventoryRepo.getAll()
})

ipcMain.handle('inventory:create', async (_event, product) => {
  return inventoryRepo.create(product)
})

ipcMain.handle('inventory:delete', async (_event, id) => {
  return inventoryRepo.delete(id)
})
