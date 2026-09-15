import BigUtils, { getMultiplyDecimalPlaces } from './bigUtils'

function createBigUtils() {
  return new BigUtils()
}

export { BigUtils, getMultiplyDecimalPlaces }

export default {
  install(app) {
    const globals = app.config.globalProperties

    Object.assign(globals, {
      $bigUtils: createBigUtils,
      $bigMathAdd: (...params) => createBigUtils().paramsAdd(...params),
      $bigMathMinus: (...params) => createBigUtils().paramsMinus(...params),
      $bigMathTimes: (...params) => createBigUtils().paramsTimes(...params),
      $bigMathDiv: (...params) => createBigUtils().paramsDiv(...params),
      $bigMathAddTFDTwo: (...params) =>
        createBigUtils().paramsAddTFDTwo(...params),
      $bigMathAddTFDThree: (...params) =>
        createBigUtils().paramsAddTFDThree(...params),
      $bigMathMinusTFDTwo: (...params) =>
        createBigUtils().paramsMinusTFDTwo(...params),
      $bigMathMinusTFDThree: (...params) =>
        createBigUtils().paramsMinusTFDThree(...params),
      $bigMathTimesTFDTwo: (...params) =>
        createBigUtils().paramsTimesTFDTwo(...params),
      $bigMathTimesTFDThree: (...params) =>
        createBigUtils().paramsTimesTFDThree(...params),
      $bigMathDivTFDTwo: (...params) =>
        createBigUtils().paramsDivTFDTwo(...params),
      $bigMathDivTFDThree: (...params) =>
        createBigUtils().paramsDivTFDThree(...params)
    })
  }
}
