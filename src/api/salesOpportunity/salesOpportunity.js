import request from '@/utils/request'

// 查询可以选择的线索列表: /crm/salesOpportunity/queryCanSelectLeadList
export function queryCanSelectLeadList(data) {
  return request({
    url: '/crm/salesOpportunity/queryCanSelectLeadList',
    method: 'post',
    data: data
  })
}
// 查询可以选择的客户列表: /crm/salesOpportunity/queryCanSelectCustomerList
export function queryCanSelectCustomerList(data) {
  return request({
    url: '/crm/salesOpportunity/queryCanSelectCustomerList',
    method: 'post',
    data: data
  })
}

// 保存商机: /crm/salesOpportunity/saveSalesOpportunity
export function saveSalesOpportunity(data) {
  return request({
    url: '/crm/salesOpportunity/saveSalesOpportunity',
    method: 'post',
    data: data
  })
}

// 提交商机: /crm/salesOpportunity/submitSalesOpportunity
export function submitSalesOpportunity(data) {
  return request({
    url: '/crm/salesOpportunity/submitSalesOpportunity',
    method: 'post',
    data: data
  })
}

// 下拉搜索值查询: /crm/salesOpportunity/querySearchList
export function querySearchList(data) {
  return request({
    url: '/crm/salesOpportunity/querySearchList',
    method: 'post',
    data: data
  })
}
// 查询商机主页面: /crm/salesOpportunity/querySalesOpportunityList
export function querySalesOpportunityList(data) {
  return request({
    url: '/crm/salesOpportunity/querySalesOpportunityList',
    method: 'post',
    data: data
  })
}

// 查询具体商机: /crm/salesOpportunity/querySalesOpportunityById
export function querySalesOpportunityById(data) {
  return request({
    url: '/crm/salesOpportunity/querySalesOpportunityById',
    method: 'post',
    data: data
  })
}
// 查询操作日志: /crm/salesOpportunity/queryOperationLogList
export function queryOperationLogList(data) {
  return request({
    url: '/crm/salesOpportunity/queryOperationLogList',
    method: 'post',
    data: data
  })
}

// 查询客户地址列表: /crm/customer/queryCustomerAddressList (customerId)
export function queryCustomerAddressList(data) {
  return request({
    url: '/customer/queryCustomerAddressList',
    method: 'post',
    data: data
  })
}

// /crm/salesOpportunity/updateFileMsg (salesOpportunityId, commonFileList)
export function updateFileMsg(data) {
  return request({
    url: '/crm/salesOpportunity/updateFileMsg',
    method: 'post',
    data: data
  })
}

// 转移商机: /crm/salesOpportunity/transferToSalesOpportunity (salesOpportunityIdList, salesGroupId, salesGroupUserId, salesGroupUserName)
export function transferToSalesOpportunity(data) {
  return request({
    url: '/crm/salesOpportunity/transferToSalesOpportunity',
    method: 'post',
    data: data
  })
}
// 保存商机的竞争对手： /crm/salesOpportunity/saveCompetitor
export function saveCompetitor(data) {
  return request({
    url: '/crm/salesOpportunity/saveCompetitor',
    method: 'post',
    data: data
  })
}

// 修改商机的竞争对手： /crm/salesOpportunity/updateCompetitor
export function updateCompetitor(data) {
  return request({
    url: '/crm/salesOpportunity/updateCompetitor',
    method: 'post',
    data: data
  })
}

// 查询商机的竞争对手列表: /crm/salesOpportunity/queryCompetitorList （salesOpportunityId）
export function queryCompetitorList(data) {
  return request({
    url: '/crm/salesOpportunity/queryCompetitorList',
    method: 'post',
    data: data
  })
}

// 查询商机活动列表:crm/sales-opportunity-activity/queryActivityListByOpportunityId(salesOpportunityId,activityTypeList,condition)
export function queryActivityListByOpportunityId(data) {
  return request({
    url: '/crm/salesOpportunityActivity/queryActivityListByOpportunityId',
    method: 'post',
    data: data
  })
}
// 查询商机活动详情:crm/salesOpportunityActivity/{activityId}/queryActivityById
export function queryActivityById(id) {
  return request({
    url: '/crm/salesOpportunityActivity/' + id + '/queryActivityById',
    method: 'get'
  })
}
// 取消活动:crm/salesOpportunityActivity/cancelActivity( SalesOpportunityActivity activity)
export function cancelActivity(data) {
  return request({
    url: '/crm/salesOpportunityActivity/cancelActivity',
    method: 'post',
    data: data
  })
}
// 完成活动:crm/salesOpportunityActivity/complete( SalesOpportunityActivity activity)
export function complete(data) {
  return request({
    url: '/crm/salesOpportunityActivity/complete',
    method: 'post',
    data: data
  })
}
// 提交/修改活动:crm/salesOpportunityActivity/submit( SalesOpportunityActivity activity)
export function submitSalesOpportunityActivity(data) {
  return request({
    url: '/crm/salesOpportunityActivity/submit',
    method: 'post',
    data: data
  })
}
// 获取阶段可选活动列表:crm/salesOpportunityActivity/queryActiveActivityListByStageId(salesOpportunityId,currentOpportunityStageId)
export function queryActiveActivityListByStageId(data) {
  return request({
    url: '/crm/salesOpportunityActivity/queryActiveActivityListByStageId',
    method: 'post',
    data: data
  })
}

// 丢失商机: /crm/salesOpportunity/lostSalesOpportunity
export function lostSalesOpportunity(data) {
  return request({
    url: '/crm/salesOpportunity/lostSalesOpportunity',
    method: 'post',
    data: data
  })
}
// 标记商机阶段完成:/crm/salesOpportunity/{salesOpportunityId}/completeOpportunityStage
export function completeOpportunityStage(id) {
  return request({
    url: '/crm/salesOpportunity/' + id + '/completeOpportunityStage',
    method: 'post',
    data: {}
  })
}

// 查询商机主页面(阶段汇总)：/crm/salesOpportunity/querySalesOpportunityStageSummary
export function querySalesOpportunityStageSummary(data) {
  return request({
    url: '/crm/salesOpportunity/querySalesOpportunityStageSummary',
    method: 'post',
    data: data
  })
}

// 查询商机主页面列表(阶段汇总)：/crm/salesOpportunity/querySalesOpportunityStageSummaryList(stageId)
export function querySalesOpportunityStageSummaryList(data) {
  return request({
    url: '/crm/salesOpportunity/querySalesOpportunityStageSummaryList',
    method: 'post',
    data: data
  })
}
