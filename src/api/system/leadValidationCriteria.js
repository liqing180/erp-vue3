import request from '@/utils/request'

// 查询具体线索验证标准: /setup/leadQualificationCriteria/queryLeadQualificationCriteriaById
export function queryLeadQualificationCriteriaById(data) {
  return request({
    url: '/setup/leadQualificationCriteria/queryLeadQualificationCriteriaById',
    method: 'post',
    data: data
  })
}

// 修改线索验证标准: /setup/leadQualificationCriteria/updateLeadQualificationCriteria
export function updateLeadQualificationCriteria(data) {
  return request({
    url: '/setup/leadQualificationCriteria/updateLeadQualificationCriteria',
    method: 'post',
    data: data
  })
}
