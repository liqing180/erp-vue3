import axios from 'axios'
import {
  ElNotification as Notification,
  ElMessageBox as MessageBox,
  ElMessage as Message
} from 'element-plus'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import store from '@/store'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import i18n from '@/lang'
import { saveAs } from 'file-saver'
import { checkPermi } from '@/utils/permission'
import router from '@/router/index'

const resetMessage = options => {
  const doms = document.getElementsByClassName('el-message')
  let canShow = true

  for (let i = 0; i < doms.length; i++) {
    const content = doms[i].getElementsByClassName('el-message__content')[0]
    if (content && options.message === content.innerHTML) {
      canShow = false
    }
  }

  if (doms.length === 0 || canShow) {
    Message(options)
  }
}

;['error', 'success', 'info', 'warning'].forEach(type => {
  resetMessage[type] = options => {
    if (typeof options === 'string') {
      options = { message: options }
    }
    options.type = type
    return resetMessage(options)
  }
})

// ERP 轮询接口失败时不展示普通错误提示。
const noShowErrMsg = [
  '/system/activiti/myTask/queryTodoTaskCount',
  '/inventory/statistics/getAllPendingCountsForErp',
  '/sales/statistics/getAllPendingCounts',
  '/purchase/statistics/getAllPendingCounts'
]

const shouldHideError = url => noShowErrMsg.includes(url || '')

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 60000
})

service.interceptors.request.use(
  config => {
    const isToken = (config.headers || {}).isToken === false
    if (getToken() && !isToken) {
      config.headers.Authorization = 'Bearer ' + getToken()
      // 保留 ERP-VUE2 的目标实例路由行为，后续如改为环境变量需单独评审。
      config.headers['X-Target-Instance-Id'] = '192.168.101.88'
    }

    if (config.method === 'get' && config.params) {
      let url = config.url.includes('?') ? config.url + '&' : config.url + '?'

      for (const propName of Object.keys(config.params)) {
        const value = config.params[propName]
        const part = encodeURIComponent(propName) + '='

        if (value !== null && typeof value !== 'undefined') {
          // ERP 数据权限：menuPerms 同步写入 Header。
          if (propName === 'menuPerms') {
            config.headers.menuPerms = value
          }

          if (typeof value === 'object') {
            for (const key of Object.keys(value)) {
              if (value[key] !== null && typeof value[key] !== 'undefined') {
                const params = propName + '[' + key + ']'
                const subPart = encodeURIComponent(params) + '='
                url += subPart + encodeURIComponent(value[key]) + '&'
              }
            }
          } else {
            url += part + encodeURIComponent(value) + '&'
          }
        }
      }

      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }

    if (config.method === 'post' && config.data?.menuPerms) {
      config.headers.menuPerms = config.data.menuPerms
    }

    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  res => {
    const code = res.data.code || 200
    const msg =
      errorCode.getErrorCode(code) ||
      res.data.msg ||
      errorCode.getErrorDefault()

    if (code === 401) {
      const currentPath = router.currentRoute.value?.path
      if (!store.state.app.confirmDlg401 && currentPath !== '/login') {
        store.commit('app/SET_CONFIRM_401', true)
        MessageBox.confirm(i18n.global.t('ui.loginStatusExpired'), '', {
          confirmButtonText: i18n.global.t('uiBtn.loginAgain'),
          cancelButtonText: i18n.global.t('uiBtn.back'),
          type: 'warning'
        })
          .then(() => {
            store.commit('app/SET_CONFIRM_401', false)
            store.dispatch('FedLogOut').then(() => {
              location.href = '/index'
            })
          })
          .catch(() => {
            store.commit('app/SET_CONFIRM_401', false)
          })
      }
      return Promise.reject(i18n.global.t('ui.invalidSession'))
    }

    if (code === 410) {
      if (!store.state.app.confirmDlg401) {
        store.commit('app/SET_CONFIRM_410', true)
        MessageBox.confirm(i18n.global.t('ui.repeatAccount'), '', {
          confirmButtonText: i18n.global.t('uiBtn.confirm'),
          showCancelButton: false,
          showClose: false,
          closeOnClickModal: false,
          type: 'warning'
        })
          .then(() => {
            store.commit('app/SET_CONFIRM_410', false)
            store.dispatch('FedLogOut').then(() => {
              location.href = '/index'
            })
          })
          .catch(() => {
            store.commit('app/SET_CONFIRM_410', false)
          })
      }
      return Promise.reject(i18n.global.t('ui.invalidSession'))
    }

    if (code === 500) {
      if (!shouldHideError(res.config.url)) {
        resetMessage({
          dangerouslyUseHTMLString: true,
          message: `<div style="line-height: 20px">${msg}</div>`,
          type: 'error',
          duration: 0
        })
      }
      return Promise.reject(new Error(msg))
    }

    if (code === 701) {
      const auth = checkPermi(['system:createCodeRule:add'])
      MessageBox.confirm(i18n.global.t('ui.noGenerateRulesTip'), '', {
        confirmButtonText: i18n.global.t('uiBtn.configure'),
        cancelButtonText: i18n.global.t('uiBtn.close'),
        showConfirmButton: auth,
        showClose: true,
        closeOnClickModal: false,
        type: 'warning'
      })
        .then(() => {
          router.push({
            path: '/system/addCodeRule',
            query: {
              timeId: Date.now(),
              ruleType: msg
            }
          })
        })
        .catch(() => {})
      return Promise.reject({ code: 701 })
    }

    if (code !== 200) {
      Notification.error({ title: msg })
      return Promise.reject('error')
    }

    return res.data
  },
  error => {
    let { message } = error

    if (message.includes('Request failed with status code')) {
      message += '.'
    } else if (message === 'Network Error') {
      message += '.'
    }

    const url = error.config?.url

    if (message.includes('timeout')) {
      if (!shouldHideError(url)) {
        resetMessage({
          message: errorCode.getErrorTimeout(),
          type: 'error',
          duration: 0
        })
      }
      return Promise.reject(error)
    }

    // 保留 ERP-VUE2 行为：网络断开由调用方处理，不重复弹通用错误。
    if (message.includes('Network Error')) {
      return Promise.reject(error)
    }

    if (!shouldHideError(url)) {
      resetMessage({
        message: message || errorCode.getErrorDefault(),
        type: 'error',
        duration: 0
      })
    }

    return Promise.reject(error)
  }
)

export function download(url, params, filename, config) {
  return service
    .post(url, params, {
      transformRequest: [data => tansParams(data)],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      ...config
    })
    .then(async data => {
      const isBlob = blobValidate(data)
      if (isBlob) {
        const blob = new Blob([data])
        saveAs(blob, filename)
      }
    })
    .catch(error => {
      console.error(error)
    })
}

export default service
