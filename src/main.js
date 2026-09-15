import { createApp } from 'vue'
import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import vue3TreeOrg from 'vue3-tree-org'
import 'vue3-tree-org/lib/vue3-tree-org.css'

import '@/assets/styles/index.scss'
import App from './App'
import Pinia from './Pinia'
import store from './store'
import router from './router'
import directive from './directive'
import plugins from './plugins'
import i18n from './lang'
import lang from './lang/el'
import registerErpGlobals from '@/bootstrap/registerErpGlobals'
import erpRouteMixin from '@/bootstrap/erpRouteMixin'

import 'virtual:svg-icons-register'
import elementIcons from '@/components/SvgIcon/svgicon'
import './permission'

import trimOfObj from '@/utils/trimOfObj/index'
import numberTofixed from '@/utils/numberTofixed/index'
import resultOfBoolean from '@/utils/resultOfBoolean/index'
import { queryAllPageList } from '@/mixins/tableMinx.js'
import { initSystemConfig } from '@/initSystemConfig/initSystemConfig.js'
import { getToken } from '@/utils/auth'

const app = createApp(App)
const externalEntryPaths = new Set([
  '/customerQuestionnaire',
  '/externalPQ',
  '/externalPQSuccess'
])

if (getToken() && !externalEntryPaths.has(window.location.pathname)) {
  queryAllPageList()
  initSystemConfig()
}

app.use(vue3TreeOrg)
app.use(router)
app.use(i18n)
app.use(Pinia)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.use(trimOfObj)
app.use(numberTofixed)
app.use(resultOfBoolean)

app.use(ElementPlus, {
  locale: Cookies.get('language') === 'en' ? lang.en : lang.zhCn,
  size:
    Cookies.get('size') === 'mini' ? 'small' : Cookies.get('size') || 'small',
  i18n: (key, value) => i18n.global.t(key, value)
})

// Element Plus 安装完成后再注册 ERP 覆盖组件与历史全局能力。
registerErpGlobals(app, i18n)
app.mixin(erpRouteMixin)
directive(app)

// 保留 ERP-VUE2 跨页签 token 同步行为。
window.addEventListener('visibilitychange', () => {
  if (document.hidden || getToken() === store.getters.token) return

  if (!getToken()) {
    router.replace({ path: '/login?redirect=/index' }).finally(() => {
      location.reload()
    })
    return
  }

  if (location.pathname === '/index') {
    location.reload()
    return
  }

  router.replace({ path: '/index' })
})

app.mount('#app')
