import request from '@/utils/request'

const SYS = import.meta.env.VITE_APP_BASE_API

// POST /oss/multiUpload 多个文件上传
export const multiUpload = `${SYS}/system/oss/multiUpload`

// POST /oss/multiFileUpload 多个文件上传,返回文件的id 跟 url
export const multiFileUpload = `${SYS}/system/oss/multiFileUpload`

// POST /oss/downloadFile 根据模块id下载文件
export const downloadFile = `${SYS}/system/oss/downloadFile`

// 首页注册上传 不需要token
export const multiFileUpload2 = `${SYS}/external/app/waybill/multiFileUpload`

// 用户头像上传
export function multiFileUploadFn(data) {
  return request({
    url: '/system/oss/multiFileUpload',
    method: 'post',
    data: data
  })
}

// GET /country/queryCountryList 下拉查询国家列表
export function queryCountryListBySelect() {
  return request({
    url: '/system/country/queryCountryListBySelect',
    method: 'get'
  })
}
// 查询货币列表
export function queryCurrencyListBySelect() {
  return request({
    url: '/system/country/queryCurrencyListBySelect',
    method: 'get'
  })
}

// 文件下载
export function downFile(url, data) {
  return request({
    url,
    data,
    method: 'post',
    responseType: 'blob'
  })
}

// 文件下载
export function importData(url, data) {
  return request({
    url: url + '?updateSupport=0',
    data,
    method: 'post'
  })
}

// 下载外部运单模板
export function downTemplate(url) {
  return request({
    url: url,
    data: {},
    method: 'post'
  })
}
