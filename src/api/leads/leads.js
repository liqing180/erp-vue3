import request from '@/utils/request'

// 下拉搜索值查询: /crm/lead/querySearchList
export function querySearchList(data) {
  return request({
    url: '/crm/lead/querySearchList',
    method: 'post',
    data: data
  })
}
// 查询线索主页面: /crm/lead/queryLeadList
export function queryLeadList(data) {
  return request({
    url: '/crm/lead/queryLeadList',
    method: 'post',
    data: data
  })
}
// 查询具体线索: /crm/lead/queryLeadById
export function queryLeadById(data) {
  return request({
    url: '/crm/lead/queryLeadById',
    method: 'post',
    data: data
  })
}
// 新增线索: /crm/lead/saveLead
export function saveLead(data) {
  return request({
    url: '/crm/lead/saveLead',
    method: 'post',
    data: data
  })
}
// 修改线索: /crm/lead/updateLead
export function updateLead(data) {
  return request({
    url: '/crm/lead/updateLead',
    method: 'post',
    data: data
  })
}
// 查询类似已有的线索列表: /crm/lead/queryLikeLeadList
export function queryLikeLeadList(data) {
  return request({
    url: '/crm/lead/queryLikeLeadList',
    method: 'post',
    data: data
  })
}

// 导出
export function exportData(data) {
  return request({
    url: '/crm/lead/export',
    method: 'post',
    data: data
  })
}

// 职位
export function queryPositionList(data) {
  return request({
    url: '/crm/lead/queryPositionList',
    method: 'get'
  })
}

// 查询可以选择的销售小组列表: setup/salesGroup/queryCanSelectSalesGroupList
export function queryCanSelectSalesGroupList(data) {
  return request({
    url: '/setup/salesGroup/queryCanSelectSalesGroupList',
    method: 'post',
    data: data
  })
}
// 指派线索: /crm/lead/assignToLead (leadIdList, salesGroupId, salesGroupUserId, salesGroupUserName)
export function assignToLead(data) {
  return request({
    url: '/crm/lead/assignToLead',
    method: 'post',
    data: data
  })
}

// /crm/lead/updateFileMsg (leadId, commonFileList)
export function updateFileMsg(data) {
  return request({
    url: '/crm/lead/updateFileMsg',
    method: 'post',
    data: data
  })
}

// POST 保存跟进记录:followup/saveFollowUp
export function saveFollowUp(data) {
  return request({
    url: '/followup/saveFollowUp',
    method: 'post',
    data: data
  })
}
// POST 修改跟进记录:followup/updateFollowUp
export function updateFollowUp(data) {
  return request({
    url: '/followup/updateFollowUp',
    method: 'post',
    data: data
  })
}
// POST 获取跟进动态列表: followup/getFollowUpList(documentId,documentType)
export function getFollowUpList(data) {
  return request({
    url: '/followup/getFollowUpList',
    method: 'post',
    data: data
  })
}

// 线索验证通过: /crm/lead/leadVerificationPassed (leadId, leadQualificationCriteria)
export function leadVerificationPassed(data) {
  return request({
    url: '/crm/lead/leadVerificationPassed',
    method: 'post',
    data: data
  })
}

// 线索验证不通过: /crm/lead/leadVerificationFailed (leadId, leadQualificationCriteria, nextContactTimeDays, nextContactTimeDate, remarks, commonFileList)
export function leadVerificationFailed(data) {
  return request({
    url: '/crm/lead/leadVerificationFailed',
    method: 'post',
    data: data
  })
}

// 查询类似已有的潜在客户列表:  /crm/lead/queryLikeProspectiveCustomerList (customerName,mobilePhone,email,businessRegNo,website)
export function queryLikeProspectiveCustomerList(data) {
  return request({
    url: '/crm/lead/queryLikeProspectiveCustomerList',
    method: 'post',
    data: data
  })
}
// 查询类似已有的潜在客户联系人列表: /crm/lead/queryLikeProspectiveCustomerContactPersonList (customerId,contactPersonName,contactMobilePhone,contactEmail)
export function queryLikeProspectiveCustomerContactPersonList(data) {
  return request({
    url: '/crm/lead/queryLikeProspectiveCustomerContactPersonList',
    method: 'post',
    data: data
  })
}
// 转化线索: /crm/lead/convertLead
// 转换提交参数:
// leadId; convertCustomerType(1新2现), customerName, customerId;
// convertCustomerContactPersonType(1新2现), customerContactPersonName, customerContactPersonId,
// convertSalesOpportunityType, salesOpportunityName, salesOpportunityId
export function convertLead(data) {
  return request({
    url: '/crm/lead/convertLead',
    method: 'post',
    data: data
  })
}

// 查询操作日志: /crm/lead/queryOperationLogList (leadId)
export function queryOperationLogList(data) {
  return request({
    url: '/crm/lead/queryOperationLogList',
    method: 'post',
    data: data
  })
}

// 查询类似已有的商机列表: /crm/lead/queryLikeSalesOpportunityList
export function queryLikeSalesOpportunityList(data) {
  return request({
    url: '/crm/lead/queryLikeSalesOpportunityList',
    method: 'post',
    data: data
  })
}
