import { reactive } from 'vue'
import MyDictDataClass from '@/utils/dict/myDictDataClass'

const DEFAULT_LABEL_FIELDS = ['dictLabel', 'label', 'name', 'title']
const DEFAULT_VALUE_FIELDS = ['dictValue', 'value', 'id', 'uid', 'key']

class DictData {
  constructor(label, value, raw) {
    this.label = label
    this.value = value
    this.raw = raw
  }
}

function determineField(data, preferredField, fallbackFields) {
  return [preferredField, ...fallbackFields]
    .filter(Boolean)
    .find(field => Object.prototype.hasOwnProperty.call(data, field))
}

function normalizeMeta(meta) {
  if (typeof meta === 'string') {
    return {
      type: meta,
      labelField: 'dictLabel',
      valueField: 'dictValue',
      lazy: false
    }
  }

  return {
    labelField: 'dictLabel',
    valueField: 'dictValue',
    lazy: false,
    ...(meta || {})
  }
}

function convertDictData(data, meta) {
  const labelField = determineField(
    data,
    meta.labelField,
    DEFAULT_LABEL_FIELDS
  )
  const valueField = determineField(
    data,
    meta.valueField,
    DEFAULT_VALUE_FIELDS
  )

  return new DictData(data[labelField], data[valueField], data)
}

class OptionsDict {
  constructor(owner) {
    this.owner = owner
    this.label = reactive({})
    this.type = reactive({})
    this._dictMetas = []
  }

  init(options) {
    const types = Array.isArray(options) ? options : options?.types || []
    this._dictMetas = types.map(normalizeMeta)

    const requests = []
    this._dictMetas.forEach(meta => {
      if (!meta.type) return

      this.label[meta.type] ||= reactive({})
      this.type[meta.type] ||= reactive([])

      if (!meta.lazy) {
        requests.push(this.loadDict(meta))
      }
    })

    return Promise.all(requests)
  }

  loadDict(meta) {
    const request =
      typeof meta.request === 'function'
        ? Promise.resolve(meta.request(meta))
        : MyDictDataClass.getDictFn(meta.type)

    return request.then(response => {
      const rawList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.content)
            ? response.content
            : []

      const list =
        typeof meta.responseConverter === 'function'
          ? meta.responseConverter(rawList, meta)
          : rawList.map(item => convertDictData(item, meta))

      const normalizedList = Array.isArray(list) ? list : []
      const typeList = this.type[meta.type]
      const labelMap = this.label[meta.type]

      typeList.splice(0, typeList.length, ...normalizedList)
      Object.keys(labelMap).forEach(key => {
        delete labelMap[key]
      })
      normalizedList.forEach(item => {
        if (item?.value !== undefined) {
          labelMap[item.value] = item.label
        }
      })

      return normalizedList
    })
  }

  reloadDict(type) {
    const meta = this._dictMetas.find(item => item.type === type)
    if (!meta) {
      return Promise.reject(new Error(`the dict meta of ${type} was not found`))
    }
    return this.loadDict(meta)
  }
}

export default {
  install(app) {
    app.mixin({
      data() {
        const dicts = this.$options.dicts
        if (dicts === undefined || dicts === null) return {}

        return {
          dict: new OptionsDict(this)
        }
      },
      created() {
        if (!(this.dict instanceof OptionsDict)) return

        this.dict.init(this.$options.dicts).then(() => {
          this.$nextTick(() => {
            this.$emit('dictReady', this.dict)
            if (typeof this.onDictReady === 'function') {
              this.onDictReady(this.dict)
            }
          })
        })
      }
    })
  }
}

export { DictData, OptionsDict }
