/**
 * 解决数字 toFixed 精度问题
 */
import Big from 'big.js/big.mjs'
import TypeJudge from '@/utils/jsType/index'
import store from '@/store'

/* 只有印度尼西亚国家使用类型2 */
export const getSplitType = () => {
  const legalEntityInfo = store.state.user.legalEntityInfo || {}
  return legalEntityInfo.countryId === '96' ? '2' : '1'
}

export const getToFixedType = () => store.state.user.toFixedType

export const numberStr = function (
  numData,
  toFixed,
  isShowStr,
  keepDec = true,
  minPrecision
) {
  if (TypeJudge.isNull(numData) || TypeJudge.isUndefined(numData)) {
    return ''
  }
  if (
    Number.isNaN(numData) ||
    Number.isNaN(Number(numData)) ||
    numData === ''
  ) {
    return ''
  }

  const big = new Big(numData)
  const toFixedType = getToFixedType()
  let result = ''

  if (!toFixed) {
    if (toFixedType === '0') {
      result = Math.ceil(big.toNumber()).toString()
    } else if (toFixedType === '1') {
      result = Math.floor(big.toNumber()).toString()
    } else {
      result = big.toFixed(0).toString()
    }
  } else {
    const multiple = Math.pow(10, toFixed)
    if (toFixedType === '0') {
      result = new Big(Math.ceil(big.times(multiple)) / multiple)
        .toFixed(toFixed)
        .toString()
    } else if (toFixedType === '1') {
      result = new Big(Math.floor(big.times(multiple)) / multiple)
        .toFixed(toFixed)
        .toString()
    } else {
      result = big.toFixed(toFixed).toString()
    }
  }

  if (!keepDec) {
    result = result.replace(/(\.[\d]*?)0+$/, '$1')
  }

  if (minPrecision !== undefined) {
    const decimalIndex = result.indexOf('.')
    const decimalLength =
      decimalIndex === -1 ? 0 : result.length - decimalIndex - 1
    if (decimalLength < minPrecision) {
      if (decimalIndex === -1) {
        result += '.'
      }
      result += '0'.repeat(minPrecision - decimalLength)
    }
  }

  if (!isShowStr) {
    return result
  }

  if (getSplitType() === '2') {
    result = result.replace('.', ',')
    let [integerPart, decimalPart] = result.split(',')
    integerPart = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    return decimalPart ? `${integerPart},${decimalPart}` : integerPart
  }

  let [integerPart, decimalPart] = result.split('.')
  integerPart = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart
}

export default {
  install(app) {
    app.config.globalProperties.$numberStr = function (
      numData,
      toFixed,
      keepDec,
      minPrecision
    ) {
      return numberStr(numData, toFixed, true, keepDec, minPrecision)
    }

    app.config.globalProperties.$num = function (numData, toFixed) {
      return Number(numberStr(numData, toFixed))
    }
  }
}
