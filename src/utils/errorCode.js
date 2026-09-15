import i18n from '@/lang' // 国际化语言包
export default {
  getErrorCode(code) {
    if (code === 401) {
      return i18n.global.t('errorCode.401')
    }
    if (code === 403) {
      return i18n.global.t('errorCode.403')
    }
    if (code === 404) {
      return i18n.global.t('errorCode.404')
    }
    return null
  },
  getErrorDefault() {
    return i18n.global.t('errorCode.default')
  },
  getErrorTimeout() {
    return i18n.global.t('errorCode.timeout')
  }
}
