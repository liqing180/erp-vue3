import request from '@/utils/request'

export function querySearchList(data) {
  return request({
    url: '/system/productExtended/querySearchList',
    method: 'post',
    data: data
  })
}
export function queryProductExtendedList(data) {
  return request({
    url: '/system/productExtended/queryProductExtendedList',
    method: 'post',
    data: data
  })
}
export function queryProductExtended(data) {
  return request({
    url: '/system/productExtended/queryProductExtended',
    method: 'post',
    data: data
  })
}
export function queryLegalEntityList(data) {
  return request({
    url: '/system/corporate/queryLegalEntityList',
    method: 'post',
    data: data
  })
}
export function saveDraftProductExtended(data) {
  return request({
    url: '/system/productExtended/saveDraftProductExtended',
    method: 'post',
    data: data
  })
}
export function saveProductExtended(data) {
  return request({
    url: '/system/productExtended/saveProductExtended',
    method: 'post',
    data: data
  })
}
export function queryExtendedCanSelectProductList(data) {
  return request({
    url: '/system/productExtended/queryExtendedCanSelectProductList',
    method: 'post',
    data: data
  })
}
export function queryExtendedCanSelectProductListNoPage(data) {
  return request({
    url: '/system/productExtended/queryExtendedCanSelectProductListNoPage',
    method: 'post',
    data: data
  })
}
export function queryLegalEntityProductUomList(data) {
  return request({
    url: '/system/productExtended/queryLegalEntityProductUomList',
    method: 'post',
    data: data
  })
}
export function queryErrorProductExtendedList(data) {
  return request({
    url: '/system/productExtended/addOtherMsg',
    method: 'post',
    data: data
  })
}
export function batchSubmitProductExtended(data) {
  return request({
    url: '/system/productExtended/batchSubmitProductExtended',
    method: 'post',
    data: data
  })
}
export function batchUpdateIsActive(ids, isActive) {
  const data = {
    productMainIdList: ids,
    isActive
  }
  return request({
    url: '/system/productExtended/batchUpdateIsActive',
    method: 'post',
    data: data
  })
}
