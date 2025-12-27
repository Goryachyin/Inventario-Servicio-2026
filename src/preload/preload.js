const { contextBridge, ipcRenderer } = require('electron')

/**
 * @typedef {import('@shared/types').Product} Product
 */

contextBridge.exposeInMainWorld('inventoryAPI', {
  /**
   * Obtiene todos los productos
   * @returns {Promise<Product[]>}
   */
  getAll: () => ipcRenderer.invoke('inventory:getAll'),

  /**
   * Crea un producto
   * @param {Product} product
   * @returns {Promise<void>}
   */
  create: (product) => ipcRenderer.invoke('inventory:create', product),

  /**
   * Elimina un producto por id
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => ipcRenderer.invoke('inventory:delete', id),

  /**
   * Edita un producto por id
   * @param {number} id
   * @param {Product} product
   * @returns {Promise<void>}
   */
  edit: (id, product) => ipcRenderer.invoke('inventory:edit', id, product)
})
