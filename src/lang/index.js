import { createI18n } from 'vue-i18n'
import enLocale from './en'
// import enDateTimePicker from './enDateTimePicker'
import zhLocale from './zh'
// import elementEnLocale from 'element-plus/es/locale/lang/en' // element-ui lang
// import elementZhLocale from 'element-plus/es/locale/lang/zh-cn' // element-ui lang
import Cookies from 'js-cookie'
import rightToolbar from './rightToolbar'
import system from './system'
import organization from './organization'
import sales from './sales'
import customer from './customer'
import calendar from './calendar'
// 修改了datepicker的英文语言
// elementEnLocale.el.datepicker = enDateTimePicker.datepicker
// elementEnLocale.el.pagination = enDateTimePicker.pagination

const messages = {
  en: {
    ...enLocale,
    ...rightToolbar.en,
    ...system.en,
    ...organization.en,
    ...sales.en,
    ...customer.en,
    ...calendar.en

    // ...elementEnLocale
  },
  zh: {
    ...zhLocale,
    ...rightToolbar.zh,
    ...system.zh,
    ...organization.zh,
    ...sales.zh,
    ...customer.zh,
    ...calendar.zh
    // ...elementZhLocale
  }
}

const i18n = new createI18n({
  // set locale
  // 设置语言 选项 en | zh
  legacy: false,
  locale: Cookies.get('language') || 'en',
  fallbackLocale: 'en',
  // set locale messages
  messages,
  fallbackWarn: false, // 关闭后备语言警告
  missingWarn: false // 关闭缺失键警告
})

export default i18n
