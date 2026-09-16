import {
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElLoading
} from 'element-plus'
import i18n from '@/lang'

let loadingInstance

class MsgErrorClass {
  constructor() {
    this.MsgErrorList = []
  }

  closeAll() {
    this.MsgErrorList.forEach(item => item?.close?.())
    this.MsgErrorList = []
  }

  closeForMsg(message) {
    this.MsgErrorList = this.MsgErrorList.filter(item => {
      if (item.message !== message) return true
      item.close?.()
      return false
    })
  }

  addMsgError(message, instance) {
    this.MsgErrorList.push({
      message,
      close: instance?.close
    })
  }
}

const msgErrorClass = new MsgErrorClass()

function createTrackedMessage(type, content) {
  const options =
    content && Object.prototype.toString.call(content) === '[object Object]'
      ? { duration: 4000, ...content, type, showClose: true }
      : { duration: 4000, message: content, type, showClose: true }

  const message = options.message
  if (type === 'error') {
    msgErrorClass.closeForMsg(message)
  }

  const instance = ElMessage(options)
  msgErrorClass.addMsgError(message, instance)
  return instance
}

export default {
  msg(content) {
    return ElMessage.info(content)
  },
  msgError(content) {
    return createTrackedMessage('error', content)
  },
  msgSuccess(content) {
    return ElMessage.success(content)
  },
  msgWarning(content) {
    return createTrackedMessage('warning', content)
  },
  alert(content) {
    return ElMessageBox.alert(content, '系统提示')
  },
  alertError(content) {
    return ElMessageBox.alert(content, '系统提示', { type: 'error' })
  },
  alertSuccess(content) {
    return ElMessageBox.alert(content, '系统提示', { type: 'success' })
  },
  alertWarning(content) {
    return ElMessageBox.alert(content, '系统提示', { type: 'warning' })
  },
  notify(content) {
    return ElNotification.info(content)
  },
  notifyError(content) {
    return ElNotification.error(content)
  },
  notifySuccess(content) {
    return ElNotification.success(content)
  },
  notifyWarning(content) {
    return ElNotification.warning(content)
  },
  confirm(content, title = '', type = 'warning') {
    return ElMessageBox.confirm(content, title, {
      confirmButtonText: i18n.global.t('uiBtn.yes'),
      cancelButtonText: i18n.global.t('uiBtn.no'),
      buttonSize: 'default',
      type
    })
  },
  prompt(content, title = '') {
    return ElMessageBox.prompt(content, title, {
      confirmButtonText: i18n.global.t('uiBtn.yes'),
      cancelButtonText: i18n.global.t('uiBtn.no'),
      buttonSize: 'default',
      type: 'warning'
    })
  },
  loading(content) {
    loadingInstance?.close?.()
    loadingInstance = ElLoading.service({
      lock: true,
      text: content,
      background: 'rgba(0, 0, 0, 0.7)'
    })
  },
  closeLoading() {
    loadingInstance?.close?.()
    loadingInstance = undefined
  }
}

export { msgErrorClass }
