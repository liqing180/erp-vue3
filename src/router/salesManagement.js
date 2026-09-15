import Layout from '@/layout'

const routeData = {
  path: '/salesManagement',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'addSalesQuotation',
      component: () =>
        import('@/views/salesManagement/salesQuotation/addSalesQuotation'),
      name: 'AddSalesQuotation',
      meta: {
        title: 'addSalesQuotation',
        activeMenu: '/salesManagement/salesQuotation'
      }
    },
    {
      path: 'editSalesQuotation',
      component: () =>
        import('@/views/salesManagement/salesQuotation/editSalesQuotation'),
      name: 'EditSalesQuotation',
      meta: {
        title: 'editSalesQuotation',
        activeMenu: '/salesManagement/salesQuotation'
      }
    },
    {
      path: 'viewSalesQuotation',
      component: () =>
        import('@/views/salesManagement/salesQuotation/viewSalesQuotation'),
      name: 'ViewSalesQuotation',
      meta: {
        title: 'viewSalesQuotation',
        activeMenu: '/salesManagement/salesQuotation'
      }
    },
    {
      path: 'reviseSalesQuotation',
      component: () =>
        import('@/views/salesManagement/salesQuotation/reviseSalesQuotation'),
      name: 'ReviseSalesQuotation',
      meta: {
        title: 'reviseSalesQuotation',
        activeMenu: '/salesManagement/salesQuotation'
      }
    }
  ]
}

export default routeData
