import request from '@/utils/request'

// 查询会议主页面
export function queryMeetingList(data) {
  return request({
    url: '/crm/meeting/queryMeetingList',
    method: 'post',
    data: data
  })
}

// 查询具体会议
export function queryMeetingById(data) {
  return request({
    url: '/crm/meeting/queryMeetingById',
    method: 'post',
    data: data
  })
}
// 新增会议
export function saveMeeting(data) {
  return request({
    url: '/crm/meeting/saveMeeting',
    method: 'post',
    data: data
  })
}
// 修改会议
export function updateMeeting(data) {
  return request({
    url: '/crm/meeting/updateMeeting',
    method: 'post',
    data: data
  })
}
// 修改会议时间
export function updateMeetingTime(data) {
  return request({
    url: '/crm/meeting/updateMeetingTime',
    method: 'post',
    data: data
  })
}
// 查询可以选择的用户列表
export function queryCanSelectUserList(data) {
  return request({
    url: '/crm/meeting/queryCanSelectUserList',
    method: 'post',
    data: data
  })
}

// 删除会议
export function deleteMeeting(data) {
  return request({
    url: '/crm/meeting/deleteMeeting',
    method: 'post',
    data: data
  })
}

// 查询日程组件用户列表接口，默认用户自身第一个
export function queryCanViewUserList(data) {
  return request({
    url: '/crm/meeting/queryCanViewUserList',
    method: 'post',
    data: data
  })
}

// 查询已添加到日程组件的用户列表
export function queryScheduleUserList(data) {
  return request({
    url: '/crm/meeting/queryScheduleUserList',
    method: 'post',
    data: data
  })
}

// 添加日程用户
export function saveScheduleUser(data) {
  return request({
    url: '/crm/meeting/saveScheduleUser',
    method: 'post',
    data: data
  })
}
// 更新日程用户
export function updateScheduleUser(data) {
  return request({
    url: '/crm/meeting/updateScheduleUser',
    method: 'post',
    data: data
  })
}
// 删除日程用户
export function deleteScheduleUser(data) {
  return request({
    url: '/crm/meeting/deleteScheduleUser',
    method: 'post',
    data: data
  })
}
