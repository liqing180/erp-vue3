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
    // 获取焦点去除千分号
    el.onfocus = e2 => {
      let a = e2.target.value || ''
      const splitType = getSplitType()
      if (splitType === '2') {
        a = a.replace(/\./g, '') // 去除千分号的'.'
        a = a.replace(',', '.') // 小数符号 , 换成 .
      } else {
        a = a.replace(/,/g, '') // 去除千分号的','
      }
      e2.target.value = a
      if (e2.target.type !== 'number') {
        e2.target.type = 'number'
      }
    }
    // 失去焦点重新设置 千分号
    el.onblur = e3 => {
      setTimeout(() => {
        // 格式化为千分位
        /* 这个可以拿到输入的值 */
        const num = e3.target.value
        // console.log(e3.target.value)

        if (num && num !== 'undefined') {
          if (e3.target.type === 'number') {
            e3.target.type = 'text'
          }
          const value23 = formatNumStr(num, params)
          // console.log(num, value23)
          e3.target.value = value23
        }
      }, 50)
    }
  },
  updated(el, binding) {
    // 如果不是获取焦点状态，值更新重新设置 千分号
    const params = binding.value || {}

    if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
      el = el.getElementsByTagName('input')[0]
    }
    const parentNode = el.parentNode
    const isFocused = parentNode.classList.contains('is-focus')

    if (!isFocused) {
      const num = el.value
      // console.log('updated', num)
      const splitType = getSplitType()
      const splitStr = splitType === '2' ? '.' : ','
      if (num && num !== 'undefined') {
        if (el.type === 'number') {
          el.type = 'text'
        }
        setTimeout(() => {
          if (!num.includes(splitStr)) {
            el.value = formatNumStr(num, params)
          }
        }, 100)
      }
    }
  }
}
