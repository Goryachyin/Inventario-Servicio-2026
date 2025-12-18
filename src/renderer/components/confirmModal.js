// src/renderer/ui/confirmModal.js

const confirmModal = document.getElementById('confirm-modal')
const confirmTitle = document.getElementById('confirm-title')
const confirmMessage = document.getElementById('confirm-message')
const btnConfirmCancel = document.getElementById('btn-confirm-cancel')
const btnConfirmAction = document.getElementById('btn-confirm-action')

let confirmCallback = null

export function showConfirmModal ({
  title = 'Confirmar acción',
  message = '¿Deseas continuar?',
  confirmText = 'Confirmar',
  onConfirm
}) {
  confirmTitle.textContent = title
  confirmMessage.textContent = message
  btnConfirmAction.textContent = confirmText

  confirmCallback = onConfirm
  confirmModal.style.display = 'flex'
}

btnConfirmCancel.onclick = () => {
  confirmCallback = null
  confirmModal.style.display = 'none'
}

btnConfirmAction.onclick = async () => {
  try {
    if (confirmCallback) {
      await confirmCallback()
    }
  } catch (err) {
    // Se deja que el renderer principal maneje errores
    // eslint-disable-next-line no-undef
    window.dispatchEvent(new ErrorEvent('error', { message: err.message }))
  } finally {
    confirmCallback = null
    confirmModal.style.display = 'none'
  }
}
