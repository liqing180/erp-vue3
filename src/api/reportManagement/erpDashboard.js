import request from '@/utils/request'

// 查询任务中心统计
export function queryTaskCenterStatistics(data) {
  return request({
    url: '/system/activiti/myTask/queryTaskCenterStatistics',
    method: 'post',
    data
  })
}

// 查询首页报表分组
export function queryReportGroupForDashboard(data) {
  return request({
    url: '/system/reportGroup/queryReportGroupForDashboard',
    method: 'post',
    data
  })
}

// 保存用户默认首页报表
export function saveUserDefaultReport(data) {
  return request({
    url: '/system/reportGroup/saveUserDefaultReport',
    method: 'post',
    data
  })
}

// 今日采购数据
export function queryTodayTransactionsPurchase(data) {
  return request({
    url: '/purchase/purchaseOrder/queryTodayTransactions',
    method: 'post',
    data
  })
}

// 今日销售数据
export function queryTodayTransactionsSales(data) {
  return request({
    url: '/sales/salesOrder/queryTodayTransactions',
    method: 'post',
    data
  })
}

// 今日全局数据
export function queryTodayTransactionsOverall(data) {
  return request({
    url: '/system/common/queryTodayTransactions',
    method: 'post',
    data
  })
}
