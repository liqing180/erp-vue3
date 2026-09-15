import request from '@/utils/request'
// 获取有效的客户级别
export function getActiveCustomerTier() {
  return request({
    url: '/setup/customerTier/getActiveCustomerTier',
    method: 'get'
  })
}
// Get获取所有客户级别:
export function getAllCustomerTier() {
  return request({
    url: '/setup/customerTier/getAllCustomerTier',
    method: 'get'
  })
}
// Post修改客户级别: (集合数组)
export function updateCustomerTier(data) {
  return request({
    url: '/setup/customerTier/updateCustomerTier',
    method: 'post',
    data
  })
}

// 获取有效的客户标签
export function getActiveCustomerLabel() {
  return request({
    url: '/setup/customerLabel/getActiveCustomerLabel',
    method: 'get'
  })
}
// Get获取所有客户标签
export function getAllCustomerLabel() {
  return request({
    url: '/setup/customerLabel/getAllCustomerLabel',
    method: 'get'
  })
}
// Post修改客户标签
export function updateCustomerLabel(data) {
  return request({
    url: '/setup/customerLabel/updateCustomerLabel',
    method: 'post',
    data
  })
}
