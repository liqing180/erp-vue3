import { reactive } from 'vue'
import { mergeRecursive } from '@/utils/ruoyi'
import DictMeta from './DictMeta'
import DictData from './DictData'
import DictOptions from './DictOptions'
import MyDictDataClass from './myDictDataClass'

const DEFAULT_DICT_OPTIONS = {
  types: []
}

export default class Dict {
  constructor() {
    this.owner = null
    this.label = reactive({})
    this.type = reactive({})
    this._dictMetas = []
  }

  init(options) {
    const normalizedOptions = Array.isArray(options)
      ? { types: options }
      : options || {}
    const opts = mergeRecursive(
      mergeRecursive({}, DEFAULT_DICT_OPTIONS),
      normalizedOptions
    )

    if (opts.types === undefined) {
      throw new Error('need dict types')
    }

    this._dictMetas = opts.types.map(type => DictMeta.parse(type))

    const requests = []
    this._dictMetas.forEach(dictMeta => {
      const type = dictMeta.type
      this.label[type] = {}
      this.type[type] = []

      if (!dictMeta.lazy) {
        requests.push(loadDict(this, dictMeta))
      }
    })

    return Promise.all(requests)
  }

  reloadDict(type) {
    const dictMeta = this._dictMetas.find(item => item.type === type)
    if (!dictMeta) {
      return Promise.reject(new Error(`the dict meta of ${type} was not found`))
    }
    return loadDict(this, dictMeta)
  }
}

function loadDict(dict, dictMeta) {
  const defaultRequest = DictOptions.metas['*'].request
  const request =
    typeof dictMeta.request === 'function' &&
    dictMeta.request !== defaultRequest
      ? Promise.resolve(dictMeta.request(dictMeta))
      : MyDictDataClass.getDictFn(dictMeta.type)

  return request.then(response => {
    let dicts = dictMeta.responseConverter(response, dictMeta)

    if (!Array.isArray(dicts)) {
      console.error('the return of responseConverter must be Array.<DictData>')
      dicts = []
    } else if (dicts.some(item => !(item instanceof DictData))) {
      console.error('the type of elements in dicts must be DictData')
      dicts = []
    }

    const typeList = dict.type[dictMeta.type]
    const labelMap = dict.label[dictMeta.type]

    typeList.splice(0, typeList.length, ...dicts)
    Object.keys(labelMap).forEach(key => {
      delete labelMap[key]
    })
    dicts.forEach(item => {
      labelMap[item.value] = item.label
    })

    return dicts
  })
}
