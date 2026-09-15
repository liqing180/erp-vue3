import Big from 'big.js/big.mjs'

class BigUtils {
  constructor() {
    this.Big = Big
  }

  getBig() {
    return this.Big
  }

  getBigObj(param) {
    return new (this.getBig())(param)
  }

  fnPMTD(fnName, params, toFixed) {
    try {
      if (!Array.isArray(params)) return NaN

      let result = NaN
      params.forEach((param, index) => {
        if (index === 0) {
          result = this.getBigObj(Number(param))
        } else {
          result = result[fnName](Number(param))
        }
      })

      if (!Number.isNaN(parseInt(toFixed))) {
        result = result.toFixed(parseInt(toFixed)).toString()
      }

      return result.toString()
    } catch (error) {
      window.console.error(error)
      return undefined
    }
  }

  add(params, toFixed) {
    return this.fnPMTD('add', params, toFixed)
  }

  minus(params, toFixed) {
    return this.fnPMTD('minus', params, toFixed)
  }

  times(params, toFixed) {
    return this.fnPMTD('times', params, toFixed)
  }

  div(params, toFixed) {
    return this.fnPMTD('div', params, toFixed)
  }

  addDecimalTwo(params) {
    return this.add(params, 2)
  }

  addDecimalThree(params) {
    return this.add(params, 3)
  }

  minusDecimalTwo(params) {
    return this.minus(params, 2)
  }

  minusDecimalThree(params) {
    return this.minus(params, 3)
  }

  timesDecimalTwo(params) {
    return this.times(params, 2)
  }

  timesDecimalThree(params) {
    return this.times(params, 3)
  }

  divDecimalTwo(params) {
    return this.div(params, 2)
  }

  divDecimalThree(params) {
    return this.div(params, 3)
  }

  paramsAdd(...params) {
    return this.fnPMTD('add', params)
  }

  paramsMinus(...params) {
    return this.fnPMTD('minus', params)
  }

  paramsTimes(...params) {
    return this.fnPMTD('times', params)
  }

  paramsDiv(...params) {
    return this.fnPMTD('div', params)
  }

  paramsAddTFDTwo(...params) {
    return this.fnPMTD('add', params, 2)
  }

  paramsAddTFDThree(...params) {
    return this.fnPMTD('add', params, 3)
  }

  paramsMinusTFDTwo(...params) {
    return this.fnPMTD('minus', params, 2)
  }

  paramsMinusTFDThree(...params) {
    return this.fnPMTD('minus', params, 3)
  }

  paramsTimesTFDTwo(...params) {
    return this.fnPMTD('times', params, 2)
  }

  paramsTimesTFDThree(...params) {
    return this.fnPMTD('times', params, 3)
  }

  paramsDivTFDTwo(...params) {
    return this.fnPMTD('div', params, 2)
  }

  paramsDivTFDThree(...params) {
    return this.fnPMTD('div', params, 3)
  }
}

function getMultiplyDecimalPlaces(num1, num2) {
  try {
    const bigNum1 = new Big(num1)
    const bigNum2 = new Big(num2)
    const product = bigNum1.times(bigNum2)
    const productStr = product.toString()
    const dotIndex = productStr.indexOf('.')
    const decimalPlaces =
      dotIndex === -1 ? 0 : productStr.length - dotIndex - 1
    const fixedResult = decimalPlaces > 6 ? product.toFixed(6) : productStr

    return {
      decimalPlaces,
      formulaStr: `${bigNum1.toString()} * ${bigNum2.toString()} = ${fixedResult}`
    }
  } catch (error) {
    window.console.error('输入非有效数字:', error)
    return {
      decimalPlaces: 0
    }
  }
}

export { getMultiplyDecimalPlaces }
export default BigUtils
