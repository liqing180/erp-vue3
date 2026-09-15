import { mergeRecursive } from '@/utils/ruoyi'
import DictOptions from './DictOptions'

export default class DictMeta {
  constructor(options) {
    this.type = options.type
    this.request = options.request
    this.responseConverter = options.responseConverter
    this.labelField = options.labelField
    this.valueField = options.valueField
    this.lazy = options.lazy === true
  }
}

DictMeta.parse = function (options) {
  let opts = null

  if (typeof options === 'string') {
    opts = { ...(DictOptions.metas[options] || {}), type: options }
  } else if (options && typeof options === 'object') {
    opts = options
  }

  opts = mergeRecursive(mergeRecursive({}, DictOptions.metas['*']), opts || {})
  return new DictMeta(opts)
}
