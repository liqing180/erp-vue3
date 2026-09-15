import { ElMessageBox } from 'element-plus'
import isEqual from 'lodash/isEqual'
import i18n from '@/lang'

function cleanEmptyProps(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => cleanEmptyProps(item))
      .filter(item => item !== '' && item !== undefined)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((result, key) => {
      const cleanedValue = cleanEmptyProps(value[key])
      if (cleanedValue !== '' && cleanedValue !== undefined) {
        result[key] = cleanedValue
      }
      return result
    }, {})
  }

  return value
}

function isComponentUnmounted(vm) {
  return Boolean(vm?._isDestroyed || vm?.$?.isUnmounted)
}

class FormDirty {
  constructor() {
    this.routeStatusData = {}
  }

  updatedInitFormJsonProp(pageKey, params) {
    const pageItem = this.routeStatusData[pageKey]
    if (!pageItem?.initFormJson) return

    const initFormJsonObj = JSON.parse(pageItem.initFormJson)
    Object.assign(initFormJsonObj, params)
    pageItem.initFormJson = JSON.stringify(initFormJsonObj)
  }

  showConfirm() {
    const t = i18n.global.t

    return ElMessageBox.confirm(
      t('ui.unsavedChangesTip'),
      t('ui.unsavedChanges'),
      {
        distinguishCancelAndClose: true,
        confirmButtonText: t('uiBtn.save'),
        cancelButtonText: t('uiBtn.doNotSave'),
        customClass: 'fd-custom-class'
      }
    )
      .then(() => 'save')
      .catch(action => (action === 'cancel' ? 'doNotSave' : 'stop'))
  }

  async showNotify(pageKey) {
    if (!this.checkIsNoSave(pageKey)) return 'doNotSave'

    const action = await this.showConfirm()
    const pageItem = this.routeStatusData[pageKey]
    if (pageItem) {
      pageItem.confirmTimer = Date.now()
    }
    return action
  }

  checkIsChange(pageItem) {
    if (!pageItem?.initFormJson || !pageItem.getFormJson) return true

    try {
      const initForm = cleanEmptyProps(JSON.parse(pageItem.initFormJson))
      const currentForm = cleanEmptyProps(JSON.parse(pageItem.getFormJson()))
      return !isEqual(initForm, currentForm)
    } catch {
      return false
    }
  }

  checkIsNoSave(pageKey) {
    const pageItem = this.routeStatusData[pageKey]
    if (!pageItem) return false
    if (pageItem.confirmTimer && Date.now() - pageItem.confirmTimer < 200) {
      return false
    }
    if (isComponentUnmounted(pageItem.$vm)) return false

    return Boolean(
      pageItem.saveShow &&
        !pageItem.isSaveSuccess &&
        this.checkIsChange(pageItem)
    )
  }

  checkIsNoSaveForAll() {
    const noSavePageKey = Object.keys(this.routeStatusData).find(pageKey =>
      this.checkIsNoSave(pageKey)
    )

    return {
      isNoSave: Boolean(noSavePageKey),
      noSaveItem: noSavePageKey
        ? this.routeStatusData[noSavePageKey]
        : undefined
    }
  }
}

const formDirtyClass = new FormDirty()

export { formDirtyClass }
