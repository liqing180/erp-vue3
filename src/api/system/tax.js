import request from '@/utils/request'

// 根据BPid查询对应的所有税码:
export function queryAllTaxCodeByBusinessPartnerId(businessPartnerId) {
  return request({
    url:
      '/system/taxCode/queryAllTaxCodeByBusinessPartnerId/' + businessPartnerId,
    method: 'get'
  })
}
