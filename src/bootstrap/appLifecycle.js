import { formDirtyClass } from '@/mixins/formDirtyClass'
import i18n from '@/lang'

function getBrowser() {
  const ua = navigator.userAgent.toLowerCase()
  if (/firefox/.test(ua)) return 'firefox'
  if (/edg/.test(ua)) return 'edge'
  if (/opr/.test(ua)) return 'opera'
  if (/chrome/.test(ua)) return 'chrome'
  if (/safari/.test(ua)) return 'safari'
  return 'unknown'
}

function handleBeforeUnload(event) {
  const { isNoSave } = formDirtyClass.checkIsNoSaveForAll()
  if (!isNoSave) return undefined

  const tip = i18n.global.t('ui.changeNoSaveTip')
  event.preventDefault()
  event.returnValue = tip
  return tip
}

export default function installAppLifecycle() {
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.body.classList.add(`browser--${getBrowser()}`)
}
