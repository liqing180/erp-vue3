import { nextTick } from 'vue'

function renderTitle(titleEl) {
  const currentText = (titleEl.textContent || '').trim()
  const sourceText = currentText.includes(',')
    ? currentText
    : titleEl.dataset.erpOptionTitleSource || currentText
  const [first = '', second = ''] = sourceText.split(',')

  titleEl.dataset.erpOptionTitleSource = sourceText
  titleEl.replaceChildren()

  const wrapper = document.createElement('div')
  wrapper.className = 'option-title-box'

  const firstColumn = document.createElement('div')
  firstColumn.className = 'option-title-a'
  firstColumn.textContent = first

  const secondColumn = document.createElement('div')
  secondColumn.className = 'option-title-b'
  secondColumn.textContent = second

  wrapper.append(firstColumn, secondColumn)
  titleEl.appendChild(wrapper)
}

function formatTitles(el) {
  nextTick(() => {
    el.querySelectorAll('li.el-select-group__title').forEach(renderTitle)
  })
}

export default {
  mounted(el) {
    formatTitles(el)
  },
  updated(el) {
    formatTitles(el)
  }
}
