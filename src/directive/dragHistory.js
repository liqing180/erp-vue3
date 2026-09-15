import router from '@/router'
import cache from '@/plugins/cache'

const MIN_WIDTH = 150
const MAX_WIDTH = 600
const COLLAPSED_WIDTH = 63
const DEFAULT_WIDTH = 300
const dragState = new WeakMap()

function getRouteKey() {
  const route = router.currentRoute?.value
  return route?.name || route?.path || '__default__'
}

function getWidthMap() {
  return cache.local.getJSON('treeBoxWidthObj') || {}
}

function saveWidth(routeKey, width) {
  const widthMap = getWidthMap()
  widthMap[routeKey] = width
  cache.local.setJSON('treeBoxWidthObj', widthMap)
}

function restoreWidth(el) {
  const container = el.parentElement
  if (!container) return

  if (el.dataset.collapse === 'true') {
    container.style.width = `${COLLAPSED_WIDTH}px`
    return
  }

  const routeKey = getRouteKey()
  const widthMap = getWidthMap()
  const width = Number(widthMap[routeKey]) || DEFAULT_WIDTH

  if (!widthMap[routeKey]) {
    saveWidth(routeKey, width)
  }

  container.style.width = `${width}px`
}

function bindDrag(el) {
  if (dragState.has(el)) return

  const onMouseDown = event => {
    const container = el.parentElement
    if (!container || el.dataset.collapse === 'true') return

    event.preventDefault()

    const routeKey = getRouteKey()
    const startX = event.clientX
    const startWidth = container.getBoundingClientRect().width
    let currentWidth = startWidth

    const onMouseMove = moveEvent => {
      currentWidth = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, startWidth + moveEvent.clientX - startX)
      )
      container.style.width = `${currentWidth}px`
      el.style.left = `${currentWidth}px`
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      saveWidth(routeKey, Math.round(currentWidth))
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    dragState.set(el, {
      ...dragState.get(el),
      onMouseMove,
      onMouseUp
    })
  }

  el.addEventListener('mousedown', onMouseDown)
  dragState.set(el, { onMouseDown })
}

function cleanup(el) {
  const state = dragState.get(el)
  if (!state) return

  el.removeEventListener('mousedown', state.onMouseDown)
  if (state.onMouseMove) {
    document.removeEventListener('mousemove', state.onMouseMove)
  }
  if (state.onMouseUp) {
    document.removeEventListener('mouseup', state.onMouseUp)
  }
  dragState.delete(el)
}

export default {
  mounted(el) {
    restoreWidth(el)
    bindDrag(el)
  },
  updated(el) {
    restoreWidth(el)
  },
  unmounted(el) {
    cleanup(el)
  }
}
