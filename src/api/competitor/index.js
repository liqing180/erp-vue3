import request from '@/utils/request'

// 下拉搜索值查询: /competitor/querySearchList
export function querySearchList(data) {
  return request({
    url: '/competitor/querySearchList',
    method: 'post',
    data: data
  })
}
// 查询主页面:
export function queryCompetitorList(data) {
  return request({
    url: '/competitor/queryCompetitorList',
    method: 'post',
    data: data
  })
}

// 查询具体竞争对手:
export function queryCompetitorById(data) {
  return request({
    url: '/competitor/queryCompetitorById',
    method: 'post',
    data: data
  })
}

// 查询可以选择的客户列表:
export function queryCanSelectCustomerList(data) {
  return request({
    url: '/competitor/queryCanSelectCustomerList',
    method: 'post',
    data: data
  })
}
// 新增竞争对手
export function saveCompetitor(data) {
  return request({
    url: '/competitor/saveCompetitor',
    method: 'post',
    data: data
  })
}
// 修改竞争对手
export function updateCompetitor(data) {
  return request({
    url: '/competitor/updateCompetitor',
    method: 'post',
    data: data
  })
}

// 导出
export function exportData(data) {
  return request({
    url: '/competitor/export',
    method: 'post',
    data: data
  })
}
