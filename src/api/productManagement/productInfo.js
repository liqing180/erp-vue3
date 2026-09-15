import request from '@/utils/request'

export function queryUserDepartment(data) {
  return request({
    url: '/system/userNew/queryUserDepartment',
    method: 'post',
    data: data
  })
}
export function queryProductList(data) {
  return request({
    url: '/system/product/queryProductList',
    method: 'post',
    data: data
  })
}
export function queryProductById(id, taskId) {
  return request({
    url:
      '/system/product/queryProductById/' + id + (taskId ? `/${taskId}` : ''),
    method: 'get'
  })
}
export function saveDraftProduct(data) {
  return request({
    url: '/system/product/saveDraftProduct',
    method: 'post',
    data: data
  })
}
export function saveProduct(data) {
  return request({
    url: '/system/product/saveProduct',
    method: 'post',
    data: data
  })
}
export function reviseProduct(data) {
  return request({
    url: '/system/product/reviseProduct',
    method: 'post',
    data: data
  })
}
export function approvedProduct(data) {
  return request({
    url: '/system/product/approvedProduct',
    method: 'post',
    data: data
  })
}
export function rejectedProduct(data) {
  return request({
    url: '/system/product/rejectedProduct',
    method: 'post',
    data: data
  })
}
export function cancelledProduct(data) {
  return request({
    url: '/system/product/cancelledProduct',
    method: 'post',
    data: data
  })
}
export function withdrawApproved(data) {
  return request({
    url: '/system/product/withdrawApproved',
    method: 'post',
    data: data
  })
}
export function changeProductIsActive(ids, isActive) {
  const data = {
    productMainIdList: ids,
    isActive
  }
  return request({
    url: '/system/product/changeProductIsActive',
    method: 'post',
    data: data
  })
}
export function queryUpdateMsgProduct(data) {
  return request({
    url: '/system/product/queryUpdateMsgProduct',
    method: 'post',
    data: data
  })
}
export function queryProductHistoryVersion(data) {
  return request({
    url: '/system/product/queryProductHistoryVersion',
    method: 'post',
    data: data
  })
}
export function importData(data) {
  return request({
    url: '/system/product/importData?updateSupport=0',
    method: 'post',
    data: data.formData
  })
}
export function queryProductByProductName(data) {
  return request({
    url: '/system/product/queryProductByProductName',
    method: 'post',
    data
  })
}
export function assignProductToLegalEntitys(data) {
  return request({
    url: '/system/product/assignProductToLegalEntitys',
    method: 'post',
    data
  })
}
export function updateLegalEntityProduct(data) {
  return request({
    url: '/system/product/updateLegalEntityProduct',
    method: 'post',
    data
  })
}
export function querySetCombinationCanSelectProductList(data) {
  return request({
    url: '/system/product/querySetCombinationCanSelectProductList',
    method: 'post',
    data
  })
}
export function batchImageToProduct(data) {
  return request({
    url: '/system/product/batchImageToProduct',
    method: 'post',
    data
  })
}
export function batchAssignImagesToProducts(data) {
  return request({
    url: '/system/product/batchAssignImagesToProducts',
    method: 'post',
    data
  })
}
export function getTempInternalPartNo(data) {
  return request({
    url: '/system/product/getTempInternalPartNo',
    method: 'post',
    data
  })
}
export function queryAllBrandList(data) {
  return request({
    url: '/system/product/queryAllBrandList',
    method: 'get',
    data
  })
}
export function checkInventoryUom(data) {
  return request({
    url: '/system/product/checkInventoryUom',
    method: 'post',
    data
  })
}
export function checkProductCanCancelled(data) {
  return request({
    url: '/system/product/checkProductCanCancelled',
    method: 'post',
    data
  })
}
export function queryRevisionVersions(businessId) {
  return request({
    url: `/system/product/${encodeURIComponent(businessId)}/revisionVersions`,
    method: 'get'
  })
}
export function compareRevisionDiff(data) {
  return request({
    url: '/system/product/revisionDiff',
    method: 'post',
    data
  })
}
