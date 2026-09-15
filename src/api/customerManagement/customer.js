import request from '@/utils/request'
// 类型参数customerType（潜在客户：1，客户：2）
// 下拉搜索值查询:
export function querySearchList(data) {
  return request({
    url: '/customer/querySearchList',
    method: 'post',
    data: data
  })
}
// 查询客户主页面:
export function queryCustomerList(data) {
  return request({
    url: '/customer/queryCustomerList',
    method: 'post',
    data: data
  })
}
// 查询具体客户:
export function queryCustomerById(data) {
  return request({
    url: '/customer/queryCustomerById',
    method: 'post',
    data: data
  })
}

// 新增客户:
export function saveCustomer(data) {
  return request({
    url: '/customer/saveCustomer',
    method: 'post',
    data: data
  })
}
// 修改客户:
export function updateCustomer(data) {
  return request({
    url: '/customer/updateCustomer',
    method: 'post',
    data: data
  })
}
// 查询类似已有的客户列表:
export function queryLikeCustomerList(data) {
  return request({
    url: '/customer/queryLikeCustomerList',
    method: 'post',
    data: data
  })
}
// 转移客户: (customerIdList, salesGroupId, salesGroupUserId, salesGroupUserName)
export function assignToCustomer(data) {
  return request({
    url: '/customer/assignToCustomer',
    method: 'post',
    data: data
  })
}
// 导出客户列表:
export function exportData(data) {
  return request({
    url: '/customer/export',
    method: 'post',
    data: data
  })
}
// 下载导入模板:
export function downTemplate(data) {
  return request({
    url: '/customer/downTemplate',
    method: 'post',
    data: data
  })
}
// 模板Excel导入正确性验证:
export function checkImportData(data) {
  return request({
    url: '/customer/checkImportData',
    method: 'post',
    data: data
  })
}
// 数据导入
export function importData(data) {
  return request({
    url: '/customer/importData',
    method: 'post',
    data: data
  })
}

// 修改附件
export function updateFileMsg(data) {
  return request({
    url: '/customer/updateFileMsg',
    method: 'post',
    data: data
  })
}
// 新增、修改保存联系人
export function saveContactPerson(data) {
  return request({
    url: '/customer/saveContactPerson',
    method: 'post',
    data: data
  })
}
// 删除联系人：customerContactPersonId
export function deleteContactPerson(data) {
  return request({
    url: '/customer/deleteContactPerson',
    method: 'post',
    data: data
  })
}

// 查询联系人历史已有的职位列表
export function queryPositionList() {
  return request({
    url: '/customer/queryPositionList',
    method: 'get'
  })
}
// 查询项目可添加配合比列表
export function queryProjectCanAddMixDesignSalesPriceList(data) {
  return request({
    url: '/zone/queryProjectCanAddMixDesignSalesPriceList',
    method: 'post',
    data: data
  })
}
