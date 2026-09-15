import request from '@/utils/request'

// 查询商机创建销售报价时的客户信息:  (salesOpportunityId)
export function querySaveSalesQuotationMsg(data) {
  return request({
    url: '/crm/salesOpportunity/querySaveSalesQuotationMsg',
    method: 'post',
    data: data
  })
}
// 获取系统设置信息 :
export function getSystemSetup(query) {
  return request({
    url: '/system/setup/getSystemSetup',
    method: 'get',
    params: query
  })
}

// 提交单据
export function saveSalesQuotation(data) {
  return request({
    url: '/crm/salesOpportunity/saveSalesQuotation',
    method: 'post',
    data: data
  })
}

// 预览PDF
export function preview(data) {
  return request({
    url: '/erp/salesQuotation/preview',
    method: 'post',
    data: data
  })
}

// 查询根据货币转换金额
export function conversionCurrencyUnitPrice(data) {
  return request({
    url: '/erp/salesQuotation/conversionCurrencyUnitPrice',
    method: 'post',
    data: data
  })
}

// 销售报价进行计算
export function calculate(data) {
  return request({
    url: '/erp/salesQuotation/calculate',
    method: 'post',
    data: data
  })
}

// 查询可以选择的配合比列表:
export function queryCanSelectMixDesignSalesPriceList(data) {
  return request({
    url: '/erp/salesQuotation/queryCanSelectMixDesignSalesPriceList',
    method: 'post',
    data: data
  })
}

// 服务: 查询业务单据选择分类(带全部)
export function queryBusinessSelectServiceCategoryTreeList(data) {
  return request({
    url: '/erp/salesQuotation/queryBusinessSelectServiceCategoryTreeList',
    method: 'get'
  })
}

// 查询可以选择的服务列表
export function queryCanSelectServiceListFromSalesInquiry(data) {
  return request({
    url: '/erp/salesQuotation/queryCanSelectServiceListFromSalesInquiry',
    method: 'post',
    data: data
  })
}

// 产品行数据二次处理接口
export function dealAddProductMsg(data) {
  return request({
    url: '/erp/salesQuotation/dealAddProductMsg',
    method: 'post',
    data: data
  })
}

// 查询可以选择的项目列表: (customerId)
export function queryCanSelectProjectList(data) {
  return request({
    url: '/customer/queryCanSelectProjectList',
    method: 'post',
    data: data
  })
}

// 查询销售报价历史版本
export function querySalesQuotationHistoryVersion(data) {
  return request({
    url: '/erp/salesQuotation/querySalesQuotationHistoryVersion',
    method: 'post',
    data: data
  })
}

// 查询销售报价详情
export function querySalesQuotationById(data) {
  return request({
    url: '/erp/salesQuotation/querySalesQuotationById',
    method: 'post',
    data: data
  })
}
// 修改销售报价: /crm/salesOpportunity/reviseSalesQuotation
export function reviseSalesQuotation(data) {
  return request({
    url: '/crm/salesOpportunity/reviseSalesQuotation',
    method: 'post',
    data: data
  })
}
// 生成销售订单: /crm/salesOpportunity/generateSO
export function generateSO(data) {
  return request({
    url: '/crm/salesOpportunity/generateSO',
    method: 'post',
    data: data
  })
}
