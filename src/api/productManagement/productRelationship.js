import request from '@/utils/request'

export function querySupplierList(data) {
  return request({
    url: '/system/productSheet/querySupplierList',
    method: 'post',
    data
  })
}
export function querySupplierListForPage(data) {
  return request({
    url: '/system/productSheet/querySupplierListForPage',
    method: 'post',
    data
  })
}
export function querySearchList(data) {
  return request({
    url: '/system/productSheet/querySearchList',
    method: 'post',
    data
  })
}
export function queryPurchaseCanSelectProductServiceList(data) {
  return request({
    url: '/system/product/queryPurchaseCanSelectProductList',
    method: 'post',
    data
  })
}
export function getProductSheetList(data) {
  return request({
    url: '/system/productSheet/getProductSheetList',
    method: 'post',
    data
  })
}
export function queryProductSheetList(data) {
  return request({
    url: '/system/productSheet/queryProductSheetList',
    method: 'post',
    data
  })
}
export function getById(id) {
  return request({
    url: '/system/productSheet/getById/' + id,
    method: 'get'
  })
}
export function batchQueryProductSheet(data) {
  return request({
    url: '/system/productSheet/batchQueryProductSheet',
    method: 'post',
    data
  })
}
export function save(data) {
  return request({
    url: '/system/productSheet/save',
    method: 'post',
    data
  })
}
export function update(data) {
  return request({
    url: '/system/productSheet/update',
    method: 'post',
    data
  })
}
export function updateActive(data) {
  return request({
    url: '/system/productSheet/updateActive',
    method: 'post',
    data
  })
}
