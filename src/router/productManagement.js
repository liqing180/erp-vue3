import Layout from '@/layout'

const productManagement = {
  path: '/productManagement',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'addProductInfo',
      component: () =>
        import('@/views/productManagement/productInfo/addProductInfo.vue'),
      name: 'AddProductInfo',
      meta: {
        title: 'addProductInfo',
        activeMenu: '/productManagement/productInfo'
      }
    },
    {
      path: 'editProductInfo',
      component: () =>
        import('@/views/productManagement/productInfo/editProductInfo.vue'),
      name: 'EditProductInfo',
      meta: {
        title: 'editProductInfo',
        activeMenu: '/productManagement/productInfo'
      }
    },
    {
      path: 'reviseProductInfo',
      component: () =>
        import('@/views/productManagement/productInfo/reviseProductInfo.vue'),
      name: 'ReviseProductInfo',
      meta: {
        title: 'reviseProductInfo',
        activeMenu: '/productManagement/productInfo'
      }
    },
    {
      path: 'viewProductInfo',
      component: () =>
        import('@/views/productManagement/productInfo/viewProductInfo.vue'),
      name: 'ViewProductInfo',
      meta: {
        title: 'viewProductInfo',
        activeMenu: '/productManagement/productInfo'
      }
    }
  ]
}

export default productManagement
