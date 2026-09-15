import { getConfigKey } from '@/api/system/config'
import store from '@/store/index.js'

export const initSystemConfig = () => {
  // Vue3 基线保留：统一初始化日期格式。
  getConfigKey('sys.date.format').then(response => {
    if (response.code === 200 && response.msg) {
      store.commit('SET_FMTFORTIME', response.msg.toUpperCase())
    }
  })

  getConfigKey('google_map_service_key').then(response => {
    if (response.msg) {
      InitMap(response.msg)
    }
  })

  getConfigKey('sys.file.onlinePreview').then(response => {
    store.commit('SET_ONLINE_PREVIEW_URL', response.msg || '')
  })

  getConfigKey('mdm_search_map_address_minimum').then(response => {
    store.commit(
      'set_search_map_address_minimum',
      response.msg ? Number(response.msg) : 4
    )
  })

  getConfigKey('sys_is_auto_code').then(response => {
    store.commit('SET_AUTO_CODE', response.msg || '2')
  })

  getConfigKey('rounding_mode').then(response => {
    store.commit('SET_TO_FIXED_TYPE', response.msg || '4')
  })
}

export function InitMap(key) {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve()
      return
    }

    loadJs(
      'https://maps.googleapis.com/maps/api/js?key=' +
        key +
        '&libraries=drawing,places,visualization&v=3.62&language=en&callback=indexHtmlInitMap&loading=async'
    )
      .then(resolve)
      .catch(reject)
  })
}

function loadJs(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.onload = resolve
    script.onerror = reject
    script.src = src
    document.getElementsByTagName('body')[0].appendChild(script)
  })
}
