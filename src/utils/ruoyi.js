/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */
import store from '@/store'

// 日期格式化；兼容 ERP-VUE2 的 yyyy/dd 与 Vue3 基线的 YYYY/DD。
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }

  const formatData = {
    YYYY: '{y}',
    yyyy: '{y}',
    MM: '{m}',
    DD: '{d}',
    dd: '{d}',
    HH: '{h}',
    mm: '{i}',
    ss: '{s}'
  }
  let format = pattern || store.getters.fmtForYmdhms
  let dateStr = ''
  let timerStr = ''

  format.split(' ').forEach(item => {
    if (item === 'YYYY' || item === 'yyyy') {
      dateStr = formatData[item]
    }
    if (item.indexOf('/') !== -1) {
      dateStr = item
        .split('/')
        .map(dateItem => formatData[dateItem])
        .join('/')
    } else if (item.indexOf('-') !== -1) {
      dateStr = item
        .split('-')
        .map(dateItem => formatData[dateItem])
        .join('-')
    } else if (item.indexOf(':') !== -1) {
      timerStr = item
        .split(':')
        .map(dateItem => formatData[dateItem])
        .join(':')
    }
  })

  format = dateStr + (timerStr ? ' ' + timerStr : '')

  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time
        .replace(new RegExp(/-/gm), '/')
        .replace('T', ' ')
        .replace(new RegExp(/\.[\d]{3}/gm), '')
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }

  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }

  return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
}

/**
 * 获取时间戳 的指定时分秒的时间戳
 * appointTime(timestamp, '00:00:00')
 * appointTime(timestamp, '23:59:59')
 */
export function appointTime(timestamp, time = '00:00:00') {
  const date = new Date(timestamp)
  let month = parseInt(date.getMonth() + 1)
  let day = date.getDate()
  if (month < 10) month = '0' + month
  if (day < 10) day = '0' + day
  return new Date(
    date.getFullYear() + '-' + month + '-' + day + ' ' + time
  ).getTime()
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields()
  }
}

// 添加日期范围
export function addDateRange(params, dateRange, propName) {
  const search = params
  search.params =
    typeof search.params === 'object' &&
    search.params !== null &&
    !Array.isArray(search.params)
      ? search.params
      : {}
  dateRange = Array.isArray(dateRange) ? dateRange : []
  if (typeof propName === 'undefined') {
    search.params.beginTime = dateRange[0]
    search.params.endTime = dateRange[1]
  } else {
    search.params['begin' + propName] = dateRange[0]
    search.params['end' + propName] = dateRange[1]
  }
  return search
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  if (value === undefined) return ''
  const actions = []
  Object.keys(datas).some(key => {
    if (datas[key].value == '' + value) {
      actions.push(datas[key].label)
      return true
    }
    return false
  })
  if (actions.length === 0) actions.push(value)
  return actions.join('')
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
  if (value === undefined || value.length === 0) return ''
  if (Array.isArray(value)) value = value.join(',')

  const actions = []
  const currentSeparator = separator === undefined ? ',' : separator
  const temp = value.split(currentSeparator)

  Object.keys(temp).forEach(index => {
    let match = false
    Object.keys(datas).forEach(key => {
      if (datas[key].value == '' + temp[index]) {
        actions.push(datas[key].label + currentSeparator)
        match = true
      }
    })
    if (!match) actions.push(temp[index] + currentSeparator)
  })

  return actions.join('').substring(0, actions.join('').length - 1)
}

// 字符串格式化(%s )
export function sprintf(str) {
  const args = arguments
  let flag = true
  let i = 1
  str = str.replace(/%s/g, function () {
    const arg = args[i++]
    if (typeof arg === 'undefined') {
      flag = false
      return ''
    }
    return arg
  })
  return flag ? str : ''
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str) {
  if (!str || str == 'undefined' || str == 'null') return ''
  return str
}

// 兼容 ERP-VUE2 历史拼写。
export const praseStrEmpty = parseStrEmpty

// 数据合并
export function mergeRecursive(source, target) {
  for (const p in target) {
    try {
      if (target[p].constructor == Object) {
        source[p] = mergeRecursive(source[p], target[p])
      } else {
        source[p] = target[p]
      }
    } catch (e) {
      source[p] = target[p]
    }
  }
  return source
}

/**
 * 构造树型结构数据
 */
export function handleTree(data, id, parentId, children) {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }
  const childrenListMap = {}
  const nodeIds = {}
  const tree = []

  for (const item of data) {
    const itemParentId = item[config.parentId]
    if (childrenListMap[itemParentId] == null) {
      childrenListMap[itemParentId] = []
    }
    nodeIds[item[config.id]] = item
    childrenListMap[itemParentId].push(item)
  }

  for (const item of data) {
    if (nodeIds[item[config.parentId]] == null) tree.push(item)
  }

  const adaptToChildrenList = item => {
    if (childrenListMap[item[config.id]] != null) {
      item[config.childrenList] = childrenListMap[item[config.id]]
    }
    if (item[config.childrenList]) {
      item[config.childrenList].forEach(adaptToChildrenList)
    }
  }

  tree.forEach(adaptToChildrenList)
  return tree
}

// 判断字符串是否包含某个字符
export function isContain(str, data) {
  if (!str) return true
  const text = str.toUpperCase()
  const list = data.filter(item => item && item.trim())
  return list
    .map(item => item.toUpperCase())
    .some(item => item.indexOf(text) !== -1)
}

/**
 * 参数处理
 */
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='

    if (value === null || value === '' || typeof value === 'undefined') {
      continue
    }

    // 保留 ERP-VUE2 下载逻辑：exportIdList 不在表单序列化阶段展开。
    if (propName === 'exportIdList' && typeof value === 'object') {
      continue
    }

    if (typeof value === 'object') {
      for (const key of Object.keys(value)) {
        if (
          value[key] !== null &&
          value[key] !== '' &&
          typeof value[key] !== 'undefined'
        ) {
          const subParam = propName + '[' + key + ']'
          result +=
            encodeURIComponent(subParam) +
            '=' +
            encodeURIComponent(value[key]) +
            '&'
        }
      }
    } else {
      result += part + encodeURIComponent(value) + '&'
    }
  }
  return result
}

// 返回项目路径
export function getNormalPath(path) {
  if (!path || path === 'undefined') return path
  let result = path.replace('//', '/')
  if (result[result.length - 1] === '/') {
    result = result.slice(0, result.length - 1)
  }
  return result
}

// 验证是否为blob格式
export function blobValidate(data) {
  return data.type !== 'application/json'
}

// 回显 ERP 单位描述
export function showUomLabel(value) {
  const commonUomList = store.getters.commonUomList || []
  const item = commonUomList.find(uom => uom.uomName === value)
  return item?.description || ''
}
