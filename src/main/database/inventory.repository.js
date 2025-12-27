const db = require('@database/db')

/**
 * @typedef {import('@shared/types').Product} Product
 */

/**
 * @returns {Promise<Product[]>}
 */

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM productos', [], (err, rows) => {
      if (err) reject(err)
      resolve(rows)
    })
  })
}

exports.create = (product) => {
  const { nombre, descripcion, tipoUnidad, cantidad } = product
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO productos(nombre, descripcion, tipoUnidad, cantidad) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, tipoUnidad, cantidad],
      err => err ? reject(err) : resolve()
    )
  })
}

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM productos WHERE id = ?',
      [id],
      err => err ? reject(err) : resolve()
    )
  })
}

exports.edit = (id, product) => {
  const { nombre, descripcion, tipoUnidad, cantidad } = product
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE productos SET nombre = ?, descripcion = ?, tipoUnidad = ?, cantidad = ? WHERE id = ?',
      [nombre, descripcion, tipoUnidad, cantidad, id],
      function (err) { err ? reject(err) : resolve(this.changes) }
    )
  })
} 
