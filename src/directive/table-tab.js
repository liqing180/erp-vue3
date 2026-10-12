import { nextTick } from 'vue'

const DEFAULT_OPTIONS = {
  enterToNext: false,
  focusableSelector:
    'input:not([disabled]):not([tabindex="-1"]), ' +
    'select:not([disabled]):not([tabindex="-1"]), ' +
    'textarea:not([disabled]):not([tabindex="-1"]), ' +
    'button:not([disabled]):not([tabindex="-1"]), ' +
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
  autoScroll: true,
  strictVisibilityCheck: true,
  debug: false
}

function isElementVisible(el, strictCheck = true) {
  if (!el || el.hidden || el.classList?.contains('is-hidden')) return false

  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden') return false

  if (strictCheck) {
    let parent = el.parentElement
    while (parent) {
      if (parent.hidden || parent.classList?.contains('is-hidden')) return false
      const parentStyle = window.getComputedStyle(parent)
      if (
        parentStyle.display === 'none' ||
        parentStyle.visibility === 'hidden'
      ) {
        return false
      }
      parent = parent.parentElement
    }
  }

  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function isFloatingPanelOpen() {
  const selectors = [
    '.el-select__popper',
    '.el-select-dropdown',
    '.el-picker__popper',
    '.el-date-picker',
    '.el-cascader__dropdown'
  ]

  return selectors.some(selector =>
    Array.from(document.querySelectorAll(selector)).some(el =>
      isElementVisible(el, false)
    )
  )
}

function uniqueElements(elements) {
  return [...new Set(elements)]
}

function getFocusableElements(tableEl, config) {
  const bodyWrapper =
    tableEl.querySelector('.el-table__body-wrapper') || tableEl
  const rows = Array.from(
    bodyWrapper.querySelectorAll('.el-table__row')
  ).filter(row => isElementVisible(row, config.strictVisibilityCheck))

  const result = []

  rows.forEach(row => {
    const rowElements = Array.from(
      row.querySelectorAll(config.focusableSelector)
    )
      .filter(el => isElementVisible(el, config.strictVisibilityCheck))
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect()
        const bRect = b.getBoundingClientRect()
        return aRect.left - bRect.left
      })

    result.push(...rowElements)
  })

  if (result.length > 0) return uniqueElements(result)

  return uniqueElements(
    Array.from(tableEl.querySelectorAll(config.focusableSelector)).filter(el =>
      isElementVisible(el, config.strictVisibilityCheck)
    )
  )
}

function getScrollWrapper(tableEl) {
  return (
    tableEl.querySelector('.el-table-v2__main .el-vl__window') ||
    tableEl.querySelector('.el-table-v2__main .el-table-v2__body > div') ||
    tableEl.querySelector('.el-table__body-wrapper .el-scrollbar__wrap') ||
    tableEl.querySelector('.el-table__body-wrapper') ||
    tableEl.querySelector('.el-scrollbar__wrap')
  )
}

function getVirtualRowInputs(tableEl, rowIndex, config) {
  const columns = config.getColumns()
  const order = [
    ...columns.filter(column => column.fixed === 'left'),
    ...columns.filter(column => !column.fixed),
    ...columns.filter(column => column.fixed === 'right')
  ]
  const cells = Array.from(
    tableEl.querySelectorAll('[data-virtual-row]')
  ).filter(cell => Number(cell.dataset.virtualRow) === rowIndex)
  return order.flatMap(column => {
    const cell = cells.find(
      item => item.dataset.virtualColumn === String(column.key)
    )
    if (!cell) return []
    return Array.from(cell.querySelectorAll(config.focusableSelector)).filter(
      input => isElementVisible(input, config.strictVisibilityCheck)
    )
  })
}

function focusVirtualInput(tableEl, input, config) {
  const cell = input.closest('[data-virtual-column]')
  const column = config
    .getColumns()
    .find(item => String(item.key) === cell?.dataset.virtualColumn)
  if (config.autoScroll && !column?.fixed) {
    scrollElementIntoViewWithinTable(tableEl, input)
  }
  input.focus()
}

async function moveVirtualFocus(tableEl, activeElement, backwards, config) {
  const currentCell = activeElement.closest('[data-virtual-row]')
  if (!currentCell) return
  let rowIndex = Number(currentCell.dataset.virtualRow)
  const currentInputs = getVirtualRowInputs(tableEl, rowIndex, config)
  const inputIndex = currentInputs.indexOf(activeElement)
  const nextInput = currentInputs[inputIndex + (backwards ? -1 : 1)]
  if (nextInput && inputIndex >= 0) {
    focusVirtualInput(tableEl, nextInput, config)
    return
  }

  const rows = config.getRows()
  const table = config.getTable()
  const firstEditableColumn = config.getColumns().find(column => column.prop)
  // 虚拟列表只挂载可视行；逐行滚动并等待渲染，不能在已挂载 DOM 内提前回绕。
  for (let count = 0; count < rows.length; count += 1) {
    if (!tableEl.isConnected) return
    rowIndex = (rowIndex + (backwards ? -1 : 1) + rows.length) % rows.length
    config.activateRow?.(rows[rowIndex], firstEditableColumn || {})
    table?.scrollToRow(rowIndex, 'smart')
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    const inputs = getVirtualRowInputs(tableEl, rowIndex, config)
    const input = backwards ? inputs[inputs.length - 1] : inputs[0]
    if (input) {
      focusVirtualInput(tableEl, input, config)
      return
    }
  }
}

function scrollElementIntoViewWithinTable(tableEl, element) {
  const wrapper = getScrollWrapper(tableEl)
  if (!wrapper) return

  const elementRect = element.getBoundingClientRect()
  const wrapperRect = wrapper.getBoundingClientRect()
  const padding = 10

  let nextScrollTop = wrapper.scrollTop
  let nextScrollLeft = wrapper.scrollLeft

  if (elementRect.top < wrapperRect.top) {
    nextScrollTop -= wrapperRect.top - elementRect.top + padding
  } else if (elementRect.bottom > wrapperRect.bottom) {
    nextScrollTop += elementRect.bottom - wrapperRect.bottom + padding
  }

  if (elementRect.left < wrapperRect.left) {
    nextScrollLeft -= wrapperRect.left - elementRect.left + padding
  } else if (elementRect.right > wrapperRect.right) {
    nextScrollLeft += elementRect.right - wrapperRect.right + padding
  }

  wrapper.scrollTo({
    top: Math.max(0, nextScrollTop),
    left: Math.max(0, nextScrollLeft),
    behavior: 'auto'
  })
}

function createHandler(el) {
  return event => {
    const config = el.__erpTableTabConfig || DEFAULT_OPTIONS
    const isTab = event.key === 'Tab'
    const isEnter = config.enterToNext && event.key === 'Enter'

    if (!isTab && !isEnter) return
    if (isFloatingPanelOpen()) return

    if (
      el.classList.contains('el-table-v2') &&
      config.getRows &&
      config.getColumns
    ) {
      if (!document.activeElement?.closest('[data-virtual-row]')) return
      event.preventDefault()
      // 同一次导航完成前忽略重复按键，避免焦点与滚动请求互相覆盖。
      if (el.__erpVirtualTabPending) return
      el.__erpVirtualTabPending = true
      moveVirtualFocus(
        el,
        document.activeElement,
        event.shiftKey,
        config
      ).finally(() => {
        el.__erpVirtualTabPending = false
      })
      return
    }

    const focusableElements = getFocusableElements(el, config)
    const activeElement = document.activeElement
    const currentIndex = focusableElements.indexOf(activeElement)

    if (config.debug) {
      console.log('[v-table-tab] focus order', focusableElements)
      console.log('[v-table-tab] active', activeElement, currentIndex)
    }

    if (currentIndex < 0 || focusableElements.length === 0) return

    const backwards = event.shiftKey
    let nextIndex = backwards ? currentIndex - 1 : currentIndex + 1

    if (nextIndex < 0) nextIndex = focusableElements.length - 1
    if (nextIndex >= focusableElements.length) nextIndex = 0

    const nextElement = focusableElements[nextIndex]
    if (!nextElement) return

    event.preventDefault()

    if (config.autoScroll) {
      scrollElementIntoViewWithinTable(el, nextElement)
    }

    requestAnimationFrame(() => {
      nextElement.focus()
    })
  }
}

export default {
  mounted(el, binding) {
    el.__erpTableTabConfig = {
      ...DEFAULT_OPTIONS,
      ...(binding.value || {})
    }
    el.__erpTableTabHandler = createHandler(el)
    el.addEventListener('keydown', el.__erpTableTabHandler, true)
  },
  updated(el, binding) {
    el.__erpTableTabConfig = {
      ...DEFAULT_OPTIONS,
      ...(binding.value || {})
    }
  },
  unmounted(el) {
    if (el.__erpTableTabHandler) {
      el.removeEventListener('keydown', el.__erpTableTabHandler, true)
    }
    delete el.__erpTableTabHandler
    delete el.__erpTableTabConfig
    delete el.__erpVirtualTabPending
  }
}
