import request from '@/utils/request'

// 查询历史品牌列表: system/materialProduct/queryAllBrandList
export function queryAllBrandList(data) {
  return request({
    url: '/system/materialProduct/queryAllBrandList',
    method: 'get',
    data
  })
}
// 保存草稿: system/materialProduct/saveDraftMaterialProduct
export function saveDraftMaterialProduct(data) {
  return request({
    url: '/system/materialProduct/saveDraftMaterialProduct',
    method: 'post',
    data: data
  })
}
// 提交产品: system/materialProduct/submitMaterialProduct
export function submitMaterialProduct(data) {
  return request({
    url: '/system/materialProduct/submitMaterialProduct',
    method: 'post',
    data: data
  })
}

// 查询物料产品列表: system/materialProduct/queryMaterialProductList
export function queryMaterialProductList(data) {
  return request({
    url: '/system/materialProduct/queryMaterialProductList',
    method: 'post',
    data: data
  })
}

// 批量分配产品图片: system/materialProduct/batchAssignImagesToMaterialProducts
export function batchAssignImagesToMaterialProducts(data) {
  return request({
    url: '/system/materialProduct/batchAssignImagesToMaterialProducts',
    method: 'post',
    data: data
  })
}
// 查询具体物料产品: system/materialProduct/queryMaterialProductById (productMainId)
export function queryMaterialProductById(data) {
  return request({
    url: '/system/materialProduct/queryMaterialProductById',
    method: 'post',
    data: data
  })
}

// 审批同意: system/materialProduct/approvedMaterialProduct
export function approvedMaterialProduct(data) {
  return request({
    url: '/system/materialProduct/approvedMaterialProduct',
    method: 'post',
    data: data
  })
}

// 审批拒绝: system/materialProduct/rejectedMaterialProduct
export function rejectedMaterialProduct(data) {
  return request({
    url: '/system/materialProduct/rejectedMaterialProduct',
    method: 'post',
    data: data
  })
}
// 撤回审批: system/materialProduct/withdrawApproved
export function withdrawApproved(data) {
  return request({
    url: '/system/materialProduct/withdrawApproved',
    method: 'post',
    data: data
  })
}

// 取消物料: system/materialProduct/cancelledMaterialProduct
export function cancelledMaterialProduct(data) {
  return request({
    url: '/system/materialProduct/cancelledMaterialProduct',
    method: 'post',
    data: data
  })
}

// 指派物料产品给法人: system/materialProduct/assignMaterialProductToLegalEntitys  (productMainIdList, legalEntityIdList)
export function assignMaterialProductToLegalEntitys(data) {
  return request({
    url: '/system/materialProduct/assignMaterialProductToLegalEntitys',
    method: 'post',
    data: data
  })
}
// 修改法人产品: system/materialProduct/updateLegalEntityMaterialProduct
export function updateLegalEntityMaterialProduct(data) {
  return request({
    url: '/system/materialProduct/updateLegalEntityMaterialProduct',
    method: 'post',
    data: data
  })
}

// 获取临时的产品编号: system/materialProduct/getTempInternalPartNo
export function getTempInternalPartNo(data) {
  return request({
    url: '/system/materialProduct/getTempInternalPartNo',
    method: 'post',
    data: data
  })
}

// Revise物料产品: system/materialProduct/reviseMaterialProduct
export function reviseMaterialProduct(data) {
  return request({
    url: '/system/materialProduct/reviseMaterialProduct',
    method: 'post',
    data: data
  })
}

// 校验物料产品是否可以取消: system/materialProduct/checkMaterialProductCanCancelled
export function checkMaterialProductCanCancelled(data) {
  return request({
    url: '/system/materialProduct/checkMaterialProductCanCancelled',
    method: 'post',
    data: data
  })
}

// 根据产品名称查询对应的产品 system/materialProduct/queryMaterialProductByName
export function queryMaterialProductByName(data) {
  return request({
    url: '/system/materialProduct/queryMaterialProductByName',
    method: 'post',
    data: data
  })
}
