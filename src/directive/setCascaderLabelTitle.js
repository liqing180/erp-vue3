let canvas

function getTextWidth(text) {
  canvas ||= document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return 0
  context.font = '14px Microsoft Yahei'
  return context.measureText(text).width
}

function updateTitle(el, binding) {
  const width = Number(binding.arg || binding.value)
  if (!Number.isFinite(width) || width <= 0) return

  const text = (el.innerText || '').trim()
  const shouldShowTitle = getTextWidth(text) > width

  if (shouldShowTitle) {
    el.title = text
    el.dataset.erpCascaderTitle = 'true'
  } else if (el.dataset.erpCascaderTitle === 'true') {
    el.removeAttribute('title')
    delete el.dataset.erpCascaderTitle
  }
}

export default {
  mounted(el, binding) {
    updateTitle(el, binding)
  },
  updated(el, binding) {
    updateTitle(el, binding)
  }
}
