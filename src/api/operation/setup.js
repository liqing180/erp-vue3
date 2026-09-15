import request from '@/utils/request'

// 仪表盘 - 查询报表级联下拉数据
export function queryReportGroupForDashboard(data) {
  return request({
    url: '/mdm/reportGroup/queryReportGroupForDashboard',
    method: 'post',
    data
  })
}

// 仪表盘 - 保存首页默认报表
export function saveUserDefaultReport(data) {
  return request({
    url: '/mdm/reportGroup/saveUserDefaultReport',
    method: 'post',
    data
  })
}
