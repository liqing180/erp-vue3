import request from '@/utils/request'

export function querySearchListSales(data) {
  return request({
    url: '/system/productExpansionSales/querySearchList',
    method: 'post',
    data
  })
}
export function queryProductExpansionSalesList(data) {
  return request({
    url: '/system/productExpansionSales/queryProductExpansionSalesList',
    method: 'post',
    data
  })
}
export function getByIdSales(id) {
  return request({
    url: '/system/productExpansionSales/getById/' + id,
    method: 'get'
  })
}
export function batchQueryProductExpansionSales(data) {
  return request({
    url: '/system/productExpansionSales/batchQueryProductExpansionSales',
    method: 'post',
    data
  })
}
export function saveSales(data) {
  return request({
    url: '/system/productExpansionSales/save',
    method: 'post',
    data
  })
}
export function updateSales(data) {
  return request({
    url: '/system/productExpansionSales/update',
    method: 'post',
    data
  })
}
export function updateActiveSales(data) {
  return request({
    url: '/system/productExpansionSales/updateActive',
    method: 'post',
    data
  })
}
export function querySalesPartNoByProductId(data) {
  return request({
    url: '/system/productExpansionSales/querySalesPartNoByProductId',
    method: 'post',
    data
  })
}
export function querySearchListPurchase(data) {
  return request({
    url: '/system/productExpansionPurchase/querySearchList',
    method: 'post',
    data
  })
}
export function queryProductExpansionPurchaseList(data) {
  return request({
    url: '/system/productExpansionPurchase/queryProductExpansionPurchaseList',
    method: 'post',
    data
  })
}
export function getByIdPurchase(id) {
  return request({
    url: '/system/productExpansionPurchase/getById/' + id,
    method: 'get'
  })
}
export function savePurchase(data) {
  return request({
    url: '/system/productExpansionPurchase/save',
    method: 'post',
    data
  })
}
export function updatePurchase(data) {
  return request({
    url: '/system/productExpansionPurchase/update',
    method: 'post',
    data
  })
}
export function updateActivePurchase(data) {
  return request({
    url: '/system/productExpansionPurchase/updateActive',
    method: 'post',
    data
  })
}
export function querySalesCanSelectProductList(data) {
  return request({
    url: '/system/product/querySalesCanSelectProductList',
    method: 'post',
    data
  })
}
