import DictOptions from './DictOptions'
import DictData from './DictData'

export default function dictConverter(dict, dictMeta) {
  const labelField = determineDictField(
    dict,
    dictMeta.labelField,
    ...DictOptions.DEFAULT_LABEL_FIELDS
  )
  const valueField = determineDictField(
    dict,
    dictMeta.valueField,
    ...DictOptions.DEFAULT_VALUE_FIELDS
  )

  return new DictData(dict[labelField], dict[valueField], dict)
}

function determineDictField(dict, ...fields) {
  return fields
    .filter(Boolean)
    .find(field => Object.prototype.hasOwnProperty.call(dict, field))
}
