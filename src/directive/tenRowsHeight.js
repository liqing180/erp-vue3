const timerMap = new WeakMap()

function measureRowHeight(el, callback) {
  try {
    const headerRow = el.querySelector('.el-table__header-wrapper')
    const bodyWrapper = el.querySelector('.el-table__body-wrapper')
    const firstRow = bodyWrapper?.querySelector('tbody tr')

    if (firstRow && typeof callback === 'function') {
      callback(firstRow.offsetHeight, headerRow?.offsetHeight)
    }
  } catch (error) {
    console.warn('[v-ten-rows-height]', error)
    if (typeof callback === 'function') {
      callback()
    }
  }
}

function scheduleMeasure(el, binding) {
  const oldTimer = timerMap.get(el)
  if (oldTimer) {
    clearTimeout(oldTimer)
  }

  const timer = setTimeout(() => {
    timerMap.delete(el)
    measureRowHeight(el, binding.value)
  })
  timerMap.set(el, timer)
}

export default {
  mounted(el, binding) {
    scheduleMeasure(el, binding)
  },
  updated(el, binding) {
    scheduleMeasure(el, binding)
  },
  unmounted(el) {
    const timer = timerMap.get(el)
    if (timer) {
      clearTimeout(timer)
    }
    timerMap.delete(el)
  }
}
