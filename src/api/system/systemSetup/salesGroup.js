import request from '@/utils/request'

// 下拉搜索值查询
export function querySearchList(data) {
  return request({
    url: '/setup/salesGroup/querySearchList',
    method: 'post',
    data
  })
}
// 查询销售小组主页面: (picUserId, picUserIdList)"
export function querySalesGroupList(data) {
  return request({
    url: '/setup/salesGroup/querySalesGroupList',
    method: 'post',
    data
  })
}

// 删除销售小组: (selectIdList)
export function deleteSalesGroup(data) {
  return request({
    url: '/setup/salesGroup/deleteSalesGroup',
    method: 'post',
    data
  })
}

// 查询销售小组可以选择的部门级联列表:
export function querySalesGroupCanSelectDepartmentList(data) {
  return request({
    url: '/setup/salesGroup/querySalesGroupCanSelectDepartmentList',
    method: 'post',
    data
  })
}
// 查询销售小组可以选择的用户列表:  (topDepartmentId, alreadySelectUserIdList)
export function querySalesGroupCanSelectUserList(data) {
  return request({
    url: '/setup/salesGroup/querySalesGroupCanSelectUserList',
    method: 'post',
    data
  })
}
// 新增销售小组
export function saveSalesGroup(data) {
  return request({
    url: '/setup/salesGroup/saveSalesGroup',
    method: 'post',
    data
  })
}
// 修改销售小组
export function updateSalesGroup(data) {
  return request({
    url: '/setup/salesGroup/updateSalesGroup',
    method: 'post',
    data
  })
}
// 查询具体销售小组
export function querySalesGroupById(data) {
  return request({
    url: '/setup/salesGroup/querySalesGroupById',
    method: 'post',
    data
  })
}
