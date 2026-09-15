function delEmptyParam(params) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return params
  }

  const result = {}

  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value === '' || value === null || value === undefined) {
      delete params[key]
      return
    }
    result[key] = value
  })

  return result
}

export { delEmptyParam }

export default {
  install(app) {
    app.config.globalProperties.$delEmptyParam = delEmptyParam
  }
}
