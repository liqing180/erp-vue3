import { numberStr, getSplitType } from '@/utils/numberTofixed/index.js'

const formatNumStr = (num, params) => {
  const precision = params.precision || 0
  /* keepDec 是否保留小数后面的零 */
  const keepDec = params.keepDec
  const minPrecision = params.minPrecision

  num = numberStr(num, precision, true, keepDec, minPrecision)
  return num
}

export default {
  mounted(el, binding) {
    const params = binding.value || {}

    if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
      el = el.getElementsByTagName('input')[0]
    }
    el.title = ''
    // 数字组件提供原始值；保留 text 类型，避免 Element Plus 聚焦时布局变化。
    const rawValue = el.getAttribute('aria-valuenow')
    if (rawValue !== null) {
      el.value = rawValue === 'undefined' ? '' : formatNumStr(rawValue, params)
    }
    // 获取焦点去除千分号
    el.onfocus = e2 => {
      const rawValue = e2.target.getAttribute('aria-valuenow')
      if (rawValue !== null) {
        e2.target.value = rawValue === 'undefined' ? '' : rawValue
        return
      }
      let a = e2.target.value || ''
      const splitType = getSplitType()
      if (splitType === '2') {
        a = a.replace(/\./g, '') // 去除千分号的'.'
        a = a.replace(',', '.') // 小数符号 , 换成 .
      } else {
        a = a.replace(/,/g, '') // 去除千分号的','
      }
      e2.target.value = a
    }
    // 失去焦点重新设置 千分号
    el.onblur = e3 => {
      setTimeout(() => {
        // 格式化为千分位
        /* 这个可以拿到输入的值 */
        if (document.activeElement === e3.target) return
        const num = e3.target.getAttribute('aria-valuenow')
        if (num !== null) {
          e3.target.value = num === 'undefined' ? '' : formatNumStr(num, params)
        } else if (e3.target.value) {
          const splitType = getSplitType()
          const value =
            splitType === '2' && e3.target.value.includes(',')
              ? e3.target.value.replace(/\./g, '').replace(',', '.')
              : e3.target.value.replace(/,/g, '')
          e3.target.value = formatNumStr(value, params)
        }
      }, 0)
    }
  },
  updated(el, binding) {
    // 如果不是获取焦点状态，值更新重新设置 千分号
    const params = binding.value || {}

    if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
      el = el.getElementsByTagName('input')[0]
    }
    setTimeout(() => {
      if (document.activeElement === el) return
      const rawValue = el.getAttribute('aria-valuenow')
      if (rawValue !== null) {
        el.value =
          rawValue === 'undefined' ? '' : formatNumStr(rawValue, params)
        return
      }
      const num = el.value
      const splitType = getSplitType()
      const splitStr = splitType === '2' ? '.' : ','
      if (num && num !== 'undefined') {
        if (!num.includes(splitStr)) {
          el.value = formatNumStr(num, params)
        }
      }
    }, 100)
  }
}
