import request from '@/utils/request'

// 查询活动列表
export function queryActivityList(data) {
  return request({
    url: '/setup/activity/queryActivityList',
    method: 'post',
    data
  })
}

// 根据id查询活动
export function queryActivityById(id) {
  return request({
    url: '/setup/activity/queryActivityById/' + id,
    method: 'get'
  })
}
// 添加活动
export function saveActivity(data) {
  return request({
    url: '/setup/activity/saveActivity',
    method: 'post',
    data
  })
}
// 修改活动
export function updateActivity(data) {
  return request({
    url: '/setup/activity/updateActivity',
    method: 'post',
    data
  })
}

// 删除销售小组: (selectIdList)
export function deleteActivity(data) {
  return request({
    url: '/setup/activity/deleteActivity',
    method: 'post',
    data
  })
}
