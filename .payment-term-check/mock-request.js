import { reactive } from 'vue'
export const download = () => Promise.resolve()
export const requests = reactive([])
const stage = (id, name, percentage, childList = []) => ({ paymentTermDetailId: id, stageName: name, percentage, dueBasis: '2', days: 30, trigger: '1', downPayment: '0', goodsIssue: '0', childList })
export const fixture = {
  paymentTermId: 101, paymentTermNo: 'PT-101', paymentTermName: '迁移测试付款条件', paymentTermCode: 'PT', paymentTermType: '1', paymentTermPurpose: '1,2', paymentTermStatus: '1', paymentTermStatusShowStr: '草稿', isActive: '1', isDefault: '0', isAutoNo: '0', description: '付款条件组件验证', remarks: '测试数据',
  paymentTermDetailList: [stage(1, '固定首阶段', 40, [stage(11, '子阶段一', 20), stage(12, '子阶段二', 20)]), stage(2, '第二阶段', 30), stage(3, '第三阶段', 30)]
}
export default async function request(config) {
  requests.push(JSON.parse(JSON.stringify(config)))
  const clone = value => JSON.parse(JSON.stringify(value))
  if (config.url.includes('/dict/data/type/')) {
    const type = config.url.split('/').pop()
    const values = type === 'payment_term_detail_trigger' ? ['1', '9'] : ['1', '2']
    return {code: 200, data: values.map(value => ({dictValue: value, dictLabel: type + '-' + value}))}
  }
  if (config.url.endsWith('queryPaymentTermById')) return {code: 200, data: clone(fixture)}
  if (config.url.endsWith('queryPaymentTermList') || config.url.endsWith('queryPaymentTermListByPaymentTermPurposeForPage')) return {code: 200, rows: [clone(fixture)], total: 1}
  return {code: 200, data: [], rows: [], total: 0}
}
