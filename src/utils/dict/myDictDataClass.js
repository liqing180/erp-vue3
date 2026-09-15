import { getDicts } from '@/api/system/dict/data'
import store from '@/store'

class MyDictDataClass {
  constructor() {
    this.maxCacheTime = 30 * 60 * 1000
    this.dictData = {}
  }

  getDictFn(dict) {
    if (!this.dictData[dict]) {
      this.dictData[dict] = {
        zh: this.createCacheItem(),
        en: this.createCacheItem()
      }
    }

    const language = store.getters.language
    const itemData = this.dictData[dict][language] || this.dictData[dict].zh

    let resolveRequest
    const result = new Promise(resolve => {
      resolveRequest = resolve
    })
    itemData.promiseList.push(resolveRequest)

    if (
      itemData.dictList.length > 0 &&
      Date.now() - itemData.timer < this.maxCacheTime
    ) {
      this.resolvePending(itemData, itemData.dictList)
      return result
    }

    if (itemData.requestInProgress) {
      return result
    }

    itemData.requestInProgress = true
    getDicts(dict)
      .then(res => {
        itemData.dictList = res.data || []
        itemData.timer = Date.now()
        itemData.requestInProgress = false
        this.resolvePending(itemData, itemData.dictList)
      })
      .catch(() => {
        itemData.requestInProgress = false
        this.resolvePending(itemData, [])
      })

    return result
  }

  createCacheItem() {
    return {
      dictList: [],
      timer: Date.now(),
      promiseList: [],
      requestInProgress: false
    }
  }

  resolvePending(itemData, list) {
    const pending = itemData.promiseList.splice(0)
    pending.forEach(resolve => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(list)))
      }, 0)
    })
  }
}

export default new MyDictDataClass()
