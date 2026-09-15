import Layout from '@/layout'

const routeData = {
  path: '/customerManagement',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'addProspectiveCustomer',
      component: () =>
        import('@/views/customerManagement/prospectiveCustomer/addProspectiveCustomer'),
      name: 'AddProspectiveCustomer',
      meta: {
        title: 'addProspectiveCustomer',
        activeMenu: '/customerManagement/prospectiveCustomer'
      }
    },
    {
      path: 'editProspectiveCustomer',
      component: () =>
        import('@/views/customerManagement/prospectiveCustomer/editProspectiveCustomer'),
      name: 'EditProspectiveCustomer',
      meta: {
        title: 'editProspectiveCustomer',
        activeMenu: '/customerManagement/prospectiveCustomer'
      }
    },
    {
      path: 'viewProspectiveCustomer',
      component: () =>
        import('@/views/customerManagement/prospectiveCustomer/viewProspectiveCustomer'),
      name: 'ViewProspectiveCustomer',
      meta: {
        title: 'viewProspectiveCustomer',
        activeMenu: '/customerManagement/prospectiveCustomer'
      }
    },

    {
      path: 'addCustomer',
      component: () =>
        import('@/views/customerManagement/customer/addCustomer'),
      name: 'AddCustomer',
      meta: {
        title: 'addCustomer',
        activeMenu: '/customerManagement/customer'
      }
    },
    {
      path: 'editCustomer',
      component: () =>
        import('@/views/customerManagement/customer/editCustomer'),
      name: 'EditCustomer',
      meta: {
        title: 'editCustomer',
        activeMenu: '/customerManagement/customer'
      }
    },
    {
      path: 'viewCustomer',
      component: () =>
        import('@/views/customerManagement/customer/viewCustomer'),
      name: 'ViewCustomer',
      meta: {
        title: 'viewCustomer',
        activeMenu: '/customerManagement/customer'
      }
    }
  ]
}

export default routeData
