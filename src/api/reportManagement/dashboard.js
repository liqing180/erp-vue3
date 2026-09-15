import request from '@/utils/request'

// ERP 首页：查询任务中心统计
export function queryTaskCenterStatistics(data) {
  return request({
    url: '/system/activiti/myTask/queryTaskCenterStatistics',
    method: 'post',
    data
  })
}

// ERP 首页：查询可展示的报表分组
export function queryReportGroupForDashboard(data) {
  return request({
    url: '/system/reportGroup/queryReportGroupForDashboard',
    method: 'post',
    data
  })
}

// ERP 首页：保存用户默认报表
export function saveUserDefaultReport(data) {
  return request({
    url: '/system/reportGroup/saveUserDefaultReport',
    method: 'post',
    data
  })
}

// ERP 首页：采购今日数据
export function queryTodayTransactionsPurchase(data) {
  return request({
    url: '/purchase/purchaseOrder/queryTodayTransactions',
    method: 'post',
    data
  })
}

// ERP 首页：销售今日数据
export function queryTodayTransactionsSales(data) {
  return request({
    url: '/sales/salesOrder/queryTodayTransactions',
    method: 'post',
    data
  })
}

// ERP 首页：全局今日数据
export function queryTodayTransactionsOverall(data) {
  return request({
    url: '/system/common/queryTodayTransactions',
    method: 'post',
    data
  })
}

// 以下 CRM 看板接口暂保留，现有 CRM 看板文件尚未确认全部无引用。
export function queryUserDefinedUserList(data) {
  return request({
    url: '/crm/dashboard/queryUserDefinedUserList',
    method: 'post',
    data
  })
}

export function queryPermissionUserIdList(data) {
  return request({
    url: '/crm/dashboard/queryPermissionUserIdList',
    method: 'post',
    data
  })
}

export function queryCustomerSource(data) {
  return request({
    url: '/crm/dashboard/queryCustomerSource',
    method: 'post',
    data
  })
}

export function queryCustomerType(data) {
  return request({
    url: '/crm/dashboard/queryCustomerType',
    method: 'post',
    data
  })
}

export function querySalesAnalysis(data) {
  return request({
    url: '/crm/dashboard/querySalesAnalysis',
    method: 'post',
    data
  })
}

export function queryCustomerAnalysis(data) {
  return request({
    url: '/crm/dashboard/queryCustomerAnalysis',
    method: 'post',
    data
  })
}

export function querySalesOpportunityStage(data) {
  return request({
    url: '/crm/dashboard/querySalesOpportunityStage',
    method: 'post',
    data
  })
}

export function querySalesStageFunnel(data) {
  return request({
    url: '/crm/dashboard/querySalesStageFunnel',
    method: 'post',
    data
  })
}

export function querySalesOpportunityTrend(data) {
  return request({
    url: '/crm/dashboard/querySalesOpportunityTrend',
    method: 'post',
    data
  })
}

export function getSalesOpportunityCustomerSourceAnalysis(data) {
  return request({
    url: '/crm/dashboard/getSalesOpportunityCustomerSourceAnalysis',
    method: 'post',
    data
  })
}

export function queryIndividualSalesDashboardTopMsg(data) {
  return request({
    url: '/crm/dashboard/queryIndividualSalesDashboardTopMsg',
    method: 'post',
    data
  })
}

export function getUserOverdueActivityList(data) {
  return request({
    url: '/crm/dashboard/getUserOverdueActivityList',
    method: 'post',
    data
  })
}

export function getUserTodayActivityList(data) {
  return request({
    url: '/crm/dashboard/getUserTodayActivityList',
    method: 'post',
    data
  })
}

export function getUserUpcomingActivityList(data) {
  return request({
    url: '/crm/dashboard/getUserUpcomingActivityList',
    method: 'post',
    data
  })
}
