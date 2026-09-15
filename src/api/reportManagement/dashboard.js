import request from '@/utils/request'

// 查询自定义用户列表: /crm/dashboard/queryUserDefinedUserList
export function queryUserDefinedUserList(data) {
  return request({
    url: '/crm/dashboard/queryUserDefinedUserList',
    method: 'post',
    data: data
  })
}
// 选择任何类型以后调用: /crm/dashboard/queryPermissionUserIdList (dashboardDataType, permissionUserIdList)
export function queryPermissionUserIdList(data) {
  return request({
    url: '/crm/dashboard/queryPermissionUserIdList',
    method: 'post',
    data: data
  })
}

// 查询客户来源: /crm/dashboard/queryCustomerSource (permissionUserIdList)
export function queryCustomerSource(data) {
  return request({
    url: '/crm/dashboard/queryCustomerSource',
    method: 'post',
    data: data
  })
}
// 查询客户类型: /crm/dashboard/queryCustomerType (permissionUserIdList)
export function queryCustomerType(data) {
  return request({
    url: '/crm/dashboard/queryCustomerType',
    method: 'post',
    data: data
  })
}
// 查询销售分析: /crm/dashboard/querySalesAnalysis (permissionUserIdList)
export function querySalesAnalysis(data) {
  return request({
    url: '/crm/dashboard/querySalesAnalysis',
    method: 'post',
    data: data
  })
}

// 查询客户分析: /crm/dashboard/queryCustomerAnalysis (permissionUserIdList)
export function queryCustomerAnalysis(data) {
  return request({
    url: '/crm/dashboard/queryCustomerAnalysis',
    method: 'post',
    data: data
  })
}

// /crm/dashboard/querySalesOpportunityStage("permissionUserIdList",dashboardDataType)
export function querySalesOpportunityStage(data) {
  return request({
    url: '/crm/dashboard/querySalesOpportunityStage',
    method: 'post',
    data: data
  })
}

// /crm/dashboard/querySalesStageFunnel("permissionUserIdList",dashboardDataType)
export function querySalesStageFunnel(data) {
  return request({
    url: '/crm/dashboard/querySalesStageFunnel',
    method: 'post',
    data: data
  })
}
// /crm/dashboard/querySalesOpportunityTrend("permissionUserIdList",dashboardDataType,startDate,endDate)
export function querySalesOpportunityTrend(data) {
  return request({
    url: '/crm/dashboard/querySalesOpportunityTrend',
    method: 'post',
    data: data
  })
}

// /crm/dashboard/getSalesOpportunityCustomerSourceAnalysis("permissionUserIdList",dashboardDataType,startDate,endDate)
export function getSalesOpportunityCustomerSourceAnalysis(data) {
  return request({
    url: '/crm/dashboard/getSalesOpportunityCustomerSourceAnalysis',
    method: 'post',
    data: data
  })
}

// 查询个人销售看板顶部信息: /crm/dashboard/queryIndividualSalesDashboardTopMsg ("permissionUserIdList",dashboardDataType,startDate,endDate)
export function queryIndividualSalesDashboardTopMsg(data) {
  return request({
    url: '/crm/dashboard/queryIndividualSalesDashboardTopMsg',
    method: 'post',
    data: data
  })
}

// /crm/dashboard/getUserOverdueActivityList("permissionUserIdList",dashboardDataType,startDate,endDate)
export function getUserOverdueActivityList(data) {
  return request({
    url: '/crm/dashboard/getUserOverdueActivityList',
    method: 'post',
    data: data
  })
}

// /crm/dashboard/getUserTodayActivityList("permissionUserIdList",dashboardDataType,startDate,endDate)
export function getUserTodayActivityList(data) {
  return request({
    url: '/crm/dashboard/getUserTodayActivityList',
    method: 'post',
    data: data
  })
}

// /crm/dashboard/getUserUpcomingActivityList("permissionUserIdList",dashboardDataType,startDate,endDate)
export function getUserUpcomingActivityList(data) {
  return request({
    url: '/crm/dashboard/getUserUpcomingActivityList',
    method: 'post',
    data: data
  })
}
