import { mergeRecursive } from '@/utils/ruoyi'
import dictConverter from './DictConverter'

export const options = {
  metas: {
    '*': {
      request: dictMeta => {
        console.log(`load dict ${dictMeta.type}`)
        return Promise.resolve([])
      },
      responseConverter,
      labelField: 'label',
      valueField: 'value'
    }
  },
  DEFAULT_LABEL_FIELDS: ['dictLabel', 'label', 'name', 'title'],
  DEFAULT_VALUE_FIELDS: ['dictValue', 'value', 'id', 'uid', 'key']
}

function responseConverter(response, dictMeta) {
  const dicts = Array.isArray(response?.content)
    ? response.content
    : Array.isArray(response?.data)
      ? response.data
      : response

  if (!Array.isArray(dicts)) {
    console.warn(`no dict data of "${dictMeta.type}" found in the response`)
    return []
  }

  return dicts.map(dict => dictConverter(dict, dictMeta))
}

export function mergeOptions(source) {
  if (source) {
    mergeRecursive(options, source)
  }
}

export default options
