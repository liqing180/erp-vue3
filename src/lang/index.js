import { createI18n } from 'vue-i18n'
import enLocale from './en'
import zhLocale from './zh'
import Cookies from 'js-cookie'
import rightToolbar from './rightToolbar'
import system from './system'
import organization from './organization'
import sales from './sales'
import purchase from './purchase'
import customer from './customer'
import calendar from './calendar'
import dashboard from './dashboard'

const messages = {
  en: {
    ...rightToolbar.en,
    ...system.en,
    ...organization.en,
    ...sales.en,
    ...purchase.en,
    ...customer.en,
    ...calendar.en,
    ...dashboard.en,
    ...enLocale
  },
  zh: {
    ...rightToolbar.zh,
    ...system.zh,
    ...organization.zh,
    ...sales.zh,
    ...purchase.zh,
    ...customer.zh,
    ...calendar.zh,
    ...dashboard.zh,
    ...zhLocale
  }
}

const i18n = createI18n({
  legacy: false,
  locale: Cookies.get('language') || 'en',
  fallbackLocale: 'en',
  messages,
  fallbackWarn: false,
  missingWarn: false
})

export default i18n
