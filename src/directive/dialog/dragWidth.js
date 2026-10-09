/**
 * v-dialogDragWidth 可拖动弹窗宽度（右侧边）
 * Copyright (c) 2019 ruoyi
 */

const cleanupMap = new WeakMap()

export default {
  mounted(el) {
    const dragDom = el.matches('.el-dialog')
      ? el
      : el.closest('.el-dialog') || el.querySelector('.el-dialog')
    if (!dragDom) return
    const lineEl = document.createElement('div')
    lineEl.className = 'erp-dialog-resize-handle'
    lineEl.style =
      'width: 5px; background: inherit; height: 80%; position: absolute; right: 0; top: 0; bottom: 0; margin: auto; z-index: 1; cursor: w-resize;'
    let endDrag = () => {}
    const startDrag = event => {
      event.preventDefault()
      event.stopPropagation()
      endDrag()
      const startX = event.clientX
      const width = dragDom.offsetWidth
      const move = moveEvent => {
        moveEvent.preventDefault()
        const nextWidth = width + moveEvent.clientX - startX
        if (nextWidth >= 600) dragDom.style.width = `${nextWidth}px`
      }
      endDrag = () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', endDrag)
      }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', endDrag)
    }
    lineEl.addEventListener('mousedown', startDrag)
    dragDom.appendChild(lineEl)
    cleanupMap.set(el, () => {
      endDrag()
      lineEl.removeEventListener('mousedown', startDrag)
      lineEl.remove()
    })
  },
  unmounted(el) {
    cleanupMap.get(el)?.()
    cleanupMap.delete(el)
  }
}
