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
import i18n from '@/lang' // 国际化语言包
import { saveAs } from 'file-saver'
import { checkPermi } from '@/utils/permission'
import router from '@/router/index'
const resetMessage = options => {
  const doms = document.getElementsByClassName('el-message')
  let canShow = true
  for (let i = 0; i < doms.length; i++) {
    if (
      options.message ===
      doms[i].getElementsByClassName('el-message__content')[0].innerHTML
    ) {
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
      options = {
        message: options
      }
    }
    options.type = type
    return resetMessage(options)
  }
})

// axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 60000
})
// request拦截器
service.interceptors.request.use(
  config => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false
    if (getToken() && !isToken) {
      config.headers.Authorization = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?'
      for (const propName of Object.keys(config.params)) {
        const value = config.params[propName]
        const part = encodeURIComponent(propName) + '='
        if (value !== null && typeof value !== 'undefined') {
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
    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // const code = 701
    // 获取错误信息
    const msg =
      errorCode.getErrorCode(code) ||
      res.data.msg ||
      errorCode.getErrorDefault()
    if (code === 401) {
      if (!store.state.app.confirmDlg401) {
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
    } else if (code === 410) {
      if (!store.state.app.confirmDlg401) {
        store.commit('app/SET_CONFIRM_410', true)
        MessageBox.confirm(i18n.global.t('ui.repeatAccount'), '', {
          confirmButtonText: i18n.global.t('uiBtn.confirm'),
          showCancelButton: false,
          showClose: false,
          closeOnClickModal: false,
          // cancelButtonText: i18n.global.t('uiBtn.back'),
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
    } else if (code === 500) {
      resetMessage({
        dangerouslyUseHTMLString: true,
        message: `<div style="line-height: 20px">${msg}</div>`,
        type: 'error'
      })
      return Promise.reject(new Error(msg))
    } else if (code === 701) {
      const auth = checkPermi(['system:createCodeRule:add'])
      MessageBox.confirm(i18n.global.t('ui.noGenerateRulesTip'), '', {
        confirmButtonText: i18n.global.t('uiBtn.configure'),
        cancelButtonText: i18n.global.t('uiBtn.close'),
        showConfirmButton: auth,
        showClose: true,
        closeOnClickModal: false,
        // cancelButtonText: i18n.global.t('uiBtn.back'),
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
    } else if (code !== 200) {
      Notification.error({
        title: msg
      })

      return Promise.reject('error')
    } else {
      return res.data
    }
  },
  error => {
    console.log('err' + error)
    /* let { message } = error
    if (message === 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常'
    } */
    // timeout of 300ms exceeded
    let { message } = error
    if (message.includes('Request failed with status code')) {
      message = message + '.'
    } else if (message === 'Network Error') {
      message = message + '.'
    }
    if (message.includes('timeout')) {
      resetMessage({
        message: errorCode.getErrorTimeout(),
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }
    const msg = message || errorCode.getErrorDefault()
    resetMessage({
      message: msg,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

// 通用下载方法
export function download(url, params, filename, config) {
  console.log(
    typeof [
      params => {
        return tansParams(params)
      }
    ],
    [
      params => {
        return tansParams(params)
      }
    ],
    '==='
  )
  return service
    .post(url, params, {
      transformRequest: [
        params => {
          return tansParams(params)
        }
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      ...config
    })
    .then(async data => {
      const isBlob = blobValidate(data)
      if (isBlob) {
        const blob = new Blob([data])
        saveAs(blob, filename)
      } else {
        // const resText = await data.text()
        // const rspObj = JSON.parse(resText)
        // const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode.default
        // Message.error(errMsg)
      }
    })
    .catch(r => {
      console.error(r)
      // Message.error('下载文件出现错误，请联系管理员！')
    })
}

export default service
