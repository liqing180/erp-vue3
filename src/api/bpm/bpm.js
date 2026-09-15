import request from '@/utils/request'

export function queryBusinessOtherMsg(data) {
  return request({
    url: '/system/activiti/superAdmin/queryBusinessOtherMsg',
    method: 'post',
    data
  })
}

export function queryMyTodoTaskList(data) {
  return request({
    url: '/system/activiti/myTask/queryMyTodoTaskList',
    method: 'post',
    data
  })
}

export function getSystemTodoTaskList(data) {
  return request({
    url: '/system/activiti/superAdmin/getSystemTodoTaskList',
    method: 'post',
    data
  })
}

export function getSkipOverNodeMsgList(id, taskId) {
  return request({
    url:
      '/system/activiti/superAdmin/getSkipOverNodeMsgList/' + id + '/' + taskId,
    method: 'get'
  })
}

export function getReturnNodeMsgList(id) {
  return request({
    url: '/system/activiti/superAdmin/getReturnNodeMsgList/' + id,
    method: 'get'
  })
}

export function skipOverProcessToNode(data) {
  return request({
    url: '/system/activiti/superAdmin/skipOverProcessToNode',
    method: 'post',
    data
  })
}

export function returnProcessToNode(data) {
  return request({
    url: '/system/activiti/superAdmin/returnProcessToNode',
    method: 'post',
    data
  })
}

export function queryReminderMessageList(data) {
  return request({
    url: '/system/activiti/processManagement/queryReminderMessageList',
    method: 'post',
    data
  })
}

export function reminder(data) {
  return request({
    url: '/system/activiti/processManagement/reminder',
    method: 'post',
    data
  })
}

export function approvalTransfer(data) {
  return request({
    url: '/system/activiti/superAdmin/approvalTransfer',
    method: 'post',
    data
  })
}

export function cancelleActivitiTask(data) {
  return request({
    url: '/system/activiti/superAdmin/cancelleActiviti',
    method: 'post',
    data
  })
}

export function cancelleActivitiProcess(data) {
  return request({
    url: '/system/activiti/processManagement/cancelleActiviti',
    method: 'post',
    data
  })
}

export function batchCancelledBusiness(data) {
  return request({
    url: '/system/activiti/superAdmin/batchCancelledBusiness',
    method: 'post',
    data,
    timeout: 300000
  })
}

export function batchWithdrawToRestart(data) {
  return request({
    url: '/system/activiti/superAdmin/batchWithdrawToRestart',
    method: 'post',
    data,
    timeout: 300000
  })
}

export function batchApprovedBusiness(data) {
  return request({
    url: '/system/activiti/superAdmin/batchApprovedBusiness',
    method: 'post',
    data,
    timeout: 300000
  })
}

export function batchRejectedBusiness(data) {
  return request({
    url: '/system/activiti/superAdmin/batchRejectedBusiness',
    method: 'post',
    data,
    timeout: 300000
  })
}

export function batchSkipOverProcessToNextNode(data) {
  return request({
    url: '/system/activiti/superAdmin/batchSkipOverProcessToNextNode',
    method: 'post',
    data,
    timeout: 300000
  })
}

export function querySearchListForMyTodoTask(data) {
  return request({
    url: '/system/activiti/myTask/querySearchListForMyTodoTask',
    method: 'post',
    data
  })
}

export function querySearchListForMyHandleTask(data) {
  return request({
    url: '/system/activiti/myTask/querySearchListForMyHandleTask',
    method: 'post',
    data
  })
}

export function queryMyHandleTaskList(data) {
  return request({
    url: '/system/activiti/myTask/queryMyHandleTaskList',
    method: 'post',
    data
  })
}

export function querySearchListForSystemTodoTaskList(data) {
  return request({
    url: '/system/activiti/superAdmin/querySearchListForSystemTodoTaskList',
    method: 'post',
    data
  })
}

export function querySearchListForSystemTodoTaskListForTimeOut(data) {
  return request({
    url: '/system/activiti/superAdmin/querySearchListForSystemTodoTaskListForTimeOut',
    method: 'post',
    data
  })
}

export function getSystemTodoTaskListForTimeOut(data) {
  return request({
    url: '/system/activiti/superAdmin/getSystemTodoTaskListForTimeOut',
    method: 'post',
    data
  })
}

export function querySearchListForInitiatedProcess(data) {
  return request({
    url: '/system/activiti/processManagement/querySearchListForInitiatedProcess',
    method: 'post',
    data
  })
}

export function queryInitiatedProcess(data) {
  return request({
    url: '/system/activiti/processManagement/queryInitiatedProcess',
    method: 'post',
    data
  })
}

export function querySearchListForParticipatedProcess(data) {
  return request({
    url: '/system/activiti/processManagement/querySearchListForParticipatedProcess',
    method: 'post',
    data
  })
}

export function queryParticipatedProcess(data) {
  return request({
    url: '/system/activiti/processManagement/queryParticipatedProcess',
    method: 'post',
    data
  })
}

export function getProcessImgByProcessInstance(id) {
  return request({
    url: '/system/history/getProcessImgByProcessInstance/' + id,
    method: 'get',
    responseType: 'blob'
  })
}

export function queryBizProcessManagementById(id) {
  return request({
    url:
      '/system/activiti/processManagement/queryBizProcessManagementById/' + id,
    method: 'get'
  })
}

export function getBizTaskHistoryByInstanceIdForEnd(data) {
  return request({
    url: '/system/history/getBizTaskHistoryByInstanceIdForEnd',
    method: 'post',
    data
  })
}

export function getTaskDetailByInstanceId(id) {
  return request({
    url: '/system/history/getTaskDetailByInstanceId/' + id,
    method: 'get'
  })
}

export function getBizTaskHistoryShowByInstanceId(id) {
  return request({
    url: '/system/history/getBizTaskHistoryShowByInstanceId/' + id,
    method: 'get'
  })
}

export function getProcessStatusByInstanceId(id) {
  return request({
    url: '/system/history/getProcessStatusByInstanceId/' + id,
    method: 'get'
  })
}

export function queryTodoTaskCount(data) {
  return request({
    url: '/system/activiti/myTask/queryTodoTaskCount',
    method: 'post',
    data
  })
}

export function getInventoryAllPendingCounts(data) {
  return request({
    url: '/inventory/statistics/getAllPendingCountsForErp',
    method: 'post',
    data
  })
}

export function getSalesAllPendingCounts(data) {
  return request({
    url: '/sales/statistics/getAllPendingCounts',
    method: 'post',
    data
  })
}

export function getPurchaseAllPendingCounts(data) {
  return request({
    url: '/purchase/statistics/getAllPendingCounts',
    method: 'post',
    data
  })
}
