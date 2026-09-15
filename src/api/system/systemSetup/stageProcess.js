import request from '@/utils/request'

// GET获取当前法人公司的阶段流程模型:
export function getModel() {
  return request({
    url: '/setup/stage/getModel',
    method: 'get'
  })
}

// POST保存阶段流程模型
export function saveModel(data) {
  return request({
    url: '/setup/stage/saveModel',
    method: 'post',
    data
  })
}
