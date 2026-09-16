import router from './router/index'
import store from './store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { msgErrorClass } from '@/plugins/modal'

NProgress.configure({ showSpinner: false })

const whiteList = [
  '/login',
  '/auth-redirect',
  '/bind',
  '/register',
  '/order/transfer',
  '/appH5/order/index',
  '/appH5/order/orderDetail',
  '/appH5/order/waybillDetail',
  '/appH5/verification/index',
  '/appH5/verification/verification',
  '/appH5/verification/signature',
  '/settingNewPassword',
  '/authLogin'
]

router.beforeEach((to, from, next) => {
  msgErrorClass.closeAll()
  router.prevRoute = from
  NProgress.start()

  if (whiteList.indexOf(to.path) !== -1) {
    next()
  } else if (getToken()) {
    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)

    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (store.getters.roles.length === 0) {
      store
        .dispatch('GetInfo')
        .then(() => {
          store.dispatch('GenerateRoutes').then(accessRoutes => {
            accessRoutes.forEach(item => {
              router.addRoute(item)
            })
            next({ ...to, replace: true })
          })
        })
        .catch(err => {
          store.dispatch('LogOut').then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
    } else {
      next()
    }
  } else {
    const type = sessionStorage.getItem('type') || ''
    if (type && type !== 'undefined') {
      next('/login?redirect=/index&type=' + type)
    } else {
      next('/login?redirect=/index')
    }
    NProgress.done()
  }
})

router.afterEach(() => {
  NProgress.done()
})
