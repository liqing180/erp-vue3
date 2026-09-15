import request from '@/utils/request'

export function queryBusinessGroupCurrency() {
  return request({
    url: '/system/corporate/queryBusinessGroupCurrency',
    method: 'get'
  })
}
export function queryServiceList(data) {
  return request({
    url: '/system/service/queryServiceList',
    method: 'post',
    data
  })
}
export function queryServiceHistoryVersion(data) {
  return request({
    url: '/system/service/queryServiceHistoryVersion',
    method: 'post',
    data
  })
}
export function queryServiceById(data) {
  return request({
    url: '/system/service/queryServiceById',
    method: 'post',
    data
  })
}
export function saveDraftService(data) {
  return request({
    url: '/system/service/saveDraftService',
    method: 'post',
    data
  })
}
export function saveService(data) {
  return request({
    url: '/system/service/saveService',
    method: 'post',
    data
  })
}
export function approvedService(data) {
  return request({
    url: '/system/service/approvedService',
    method: 'post',
    data
  })
}
export function rejectedService(data) {
  return request({
    url: '/system/service/rejectedService',
    method: 'post',
    data
  })
}
export function changeServiceIsActive(data) {
  return request({
    url: '/system/service/changeServiceIsActive',
    method: 'post',
    data
  })
}
export function reviseService(data) {
  return request({
    url: '/system/service/reviseService',
    method: 'post',
    data
  })
}
export function queryUpdateMsgService(data) {
  return request({
    url: '/system/service/queryUpdateMsgService',
    method: 'post',
    data
  })
}
