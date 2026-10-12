import Layout from '@/layout'

const routeData = {
  path: '/salesManagement',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'addSalesInquiry',
      component: () =>
        import('@/views/salesManagement/salesInquiry/addSalesInquiry'),
      name: 'AddSalesInquiry',
      meta: {
        title: 'addSalesInquiry',
        activeMenu: '/salesManagement/salesInquiry'
      }
    },
    {
      path: 'editSalesInquiry',
      component: () =>
        import('@/views/salesManagement/salesInquiry/editSalesInquiry'),
      name: 'EditSalesInquiry',
      meta: {
        title: 'editSalesInquiry',
        activeMenu: '/salesManagement/salesInquiry'
      }
    },
    {
      path: 'viewSalesInquiry',
      component: () =>
        import('@/views/salesManagement/salesInquiry/viewSalesInquiry'),
      name: 'ViewSalesInquiry',
      meta: {
        title: 'viewSalesInquiry',
        activeMenu: '/salesManagement/salesInquiry'
      }
    },
    {
      path: 'reviseSalesInquiry',
      component: () =>
        import('@/views/salesManagement/salesInquiry/reviseSalesInquiry'),
      name: 'ReviseSalesInquiry',
      meta: {
        title: 'reviseSalesInquiry',
        activeMenu: '/salesManagement/salesInquiry'
      }
    },
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
