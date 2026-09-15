import DelSpacesOfObject from './DelSpacesOfObject'

export default {
  install: function (app) {
    app.config.globalProperties.$trimOfObj = function (pObj) {
      const { obj } = new DelSpacesOfObject(pObj)
      return obj
    }
  }
}
