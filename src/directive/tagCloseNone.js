import { nextTick } from 'vue'

function getDefaultCount(binding) {
  const value = binding.value
  if (!Array.isArray(value)) return 0
  if (Array.isArray(value[0])) return value[0].length
  return value.length
}

function updateCloseButtons(el, binding) {
  nextTick(() => {
    const defaultCount = getDefaultCount(binding)
    const closeButtons = el.querySelectorAll('.el-tag__close')

    closeButtons.forEach((button, index) => {
      button.style.display = index < defaultCount ? 'none' : ''
    })
  })
}

export default {
  mounted(el, binding) {
    updateCloseButtons(el, binding)
  },
  updated(el, binding) {
    updateCloseButtons(el, binding)
  }
}
