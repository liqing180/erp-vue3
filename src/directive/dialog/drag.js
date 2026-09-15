const cleanupMap = new WeakMap()

export default {
  mounted(el, binding) {
    if (binding.value === false) return

    const dialogHeader = el.querySelector('.el-dialog__header')
    const dialog = el.querySelector('.el-dialog')
    if (!dialogHeader || !dialog) return

    dialogHeader.style.cursor = 'move'

    const onMouseDown = event => {
      const rect = dialog.getBoundingClientRect()
      const startX = event.clientX
      const startY = event.clientY
      const startLeft = rect.left
      const startTop = rect.top

      dialog.style.position = 'fixed'
      dialog.style.margin = '0'
      dialog.style.left = `${startLeft}px`
      dialog.style.top = `${startTop}px`

      const onMouseMove = moveEvent => {
        const left = startLeft + moveEvent.clientX - startX
        const top = Math.max(-54, startTop + moveEvent.clientY - startY)
        dialog.style.left = `${left}px`
        dialog.style.top = `${top}px`
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    dialogHeader.addEventListener('mousedown', onMouseDown)
    cleanupMap.set(el, () => {
      dialogHeader.removeEventListener('mousedown', onMouseDown)
    })
  },
  unmounted(el) {
    cleanupMap.get(el)?.()
    cleanupMap.delete(el)
  }
}
