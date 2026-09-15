import request from '@/utils/request'

export function queryProductCategoryList(data) {
  return request({
    url: '/system/productCategory/queryProductCategoryList',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/system/productCategory/save',
    method: 'post',
    data
  })
}

export function queryProductCategoryById(id) {
  return request({
    url: '/system/productCategory/queryProductCategoryById/' + id,
    method: 'get'
  })
}

export function update(data) {
  return request({
    url: '/system/productCategory/update',
    method: 'post',
    data
  })
}

export function updateActive(data) {
  return request({
    url: '/system/productCategory/updateActive',
    method: 'post',
    data
  })
}

export function importTemplate(data) {
  return request({
    url: '/system/productCategory/importTemplate',
    method: 'post',
    responseType: 'blob',
    data
  })
}
export function productCategoryExport(data) {
  return request({
    url: '/system/productCategory/export',
    method: 'post',
    responseType: 'blob',
    data
  })
}

export function importData(data) {
  return request({
    url: '/system/productCategory/importData?updateSupport=0',
    method: 'post',
    data
  })
}

export function queryAllCategoryTreeList(data) {
  return request({
    url: '/system/productCategory/queryAllCategoryTreeList',
    method: 'get'
  })
}
export function queryActiveCategoryTreeList(data) {
  return request({
    url: '/system/productCategory/queryActiveCategoryTreeList',
    method: 'get'
  })
}
export function queryBusinessSelectCategoryTreeList(data) {
  return request({
    url: '/system/productCategory/queryBusinessSelectCategoryTreeList',
    method: 'get'
  })
}

export function queryAllProductCategoryTreeList() {
  return request({
    url: '/system/productCategory/queryAllProductCategoryTreeList',
    method: 'get'
  })
}
export function queryActiveProductCategoryTreeList(data) {
  return request({
    url: '/system/productCategory/queryActiveProductCategoryTreeList',
    method: 'get'
  })
}
export function queryBusinessSelectProductCategoryTreeList(data) {
  return request({
    url: '/system/productCategory/queryBusinessSelectProductCategoryTreeList',
    method: 'get'
  })
}

export function queryAllServiceCategoryTreeList(data) {
  return request({
    url: '/system/productCategory/queryAllServiceCategoryTreeList',
    method: 'get'
  })
}
export function queryActiveServiceCategoryTreeList(data) {
  return request({
    url: '/system/productCategory/queryActiveServiceCategoryTreeList',
    method: 'get'
  })
}
export function queryBusinessSelectServiceCategoryTreeList(data) {
  return request({
    url: '/system/productCategory/queryBusinessSelectServiceCategoryTreeList',
    method: 'get'
  })
}

export function queryPhantomCategoryTreeList(data) {
  return request({
    url: '/system/productCategory/queryPhantomCategoryTreeList',
    method: 'get'
  })
}
