import Layout from '@/layout'

const system = {
  path: '/system',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'addIssue',
      component: () => import('@/views/system/issueList/addIssue'),
      name: 'AddIssue',
      meta: { title: 'addIssue', activeMenu: '/system/issueList' }
    },
    {
      path: 'editIssue',
      component: () => import('@/views/system/issueList/editIssue'),
      name: 'EditIssue',
      meta: { title: 'editIssue', activeMenu: '/system/issueList' }
    },
    {
      path: 'addDriver',
      component: () => import('@/views/system/driverManagement/addDriver'),
      name: 'AddDriver',
      meta: { title: 'addDriver', activeMenu: '/system/driverManagement' }
    },
    {
      path: 'editDriver',
      component: () => import('@/views/system/driverManagement/editDriver'),
      name: 'EditDriver',
      meta: { title: 'editDriver', activeMenu: '/system/driverManagement' }
    },
    {
      path: 'addVehicle',
      component: () => import('@/views/system/vehicleManagement/addVehicle'),
      name: 'AddVehicle',
      meta: { title: 'addVehicle', activeMenu: '/system/vehicleManagement' }
    },
    {
      path: 'editVehicle',
      component: () => import('@/views/system/vehicleManagement/editVehicle'),
      name: 'EditVehicle',
      meta: { title: 'editVehicle', activeMenu: '/system/vehicleManagement' }
    },
    {
      path: 'addTax',
      component: () => import('@/views/system/tax/addTax'),
      name: 'AddTax',
      meta: { title: 'addTax', activeMenu: '/system/tax' }
    },
    {
      path: 'editTax',
      component: () => import('@/views/system/tax/editTax'),
      name: 'EditTax',
      meta: { title: 'editTax', activeMenu: '/system/tax' }
    },
    {
      path: 'addSeaport',
      component: () => import('@/views/system/seaport/addSeaport'),
      name: 'AddSeaport',
      meta: { title: 'addSeaport', activeMenu: '/system/seaport' }
    },
    {
      path: 'editSeaport',
      component: () => import('@/views/system/seaport/editSeaport'),
      name: 'EditSeaport',
      meta: { title: 'editSeaport', activeMenu: '/system/seaport' }
    },
    {
      path: 'addPaymentTerm',
      component: () => import('@/views/system/paymentTerm/addPaymentTerm'),
      name: 'AddPaymentTerm',
      meta: { title: 'addPaymentTerm', activeMenu: '/system/paymentTerm' }
    },
    {
      path: 'editPaymentTerm',
      component: () => import('@/views/system/paymentTerm/editPaymentTerm'),
      name: 'EditPaymentTerm',
      meta: { title: 'editPaymentTerm', activeMenu: '/system/paymentTerm' }
    },
    {
      path: 'addCodeRule',
      component: () => import('@/views/system/createCodeRule/addCodeRule'),
      name: 'AddCodeRule',
      meta: { title: 'addCreateCodeRule', activeMenu: '/system/createCodeRule' }
    },
    {
      path: 'editCodeRule',
      component: () => import('@/views/system/createCodeRule/editCodeRule'),
      name: 'EditCodeRule',
      meta: {
        title: 'editCreateCodeRule',
        activeMenu: '/system/createCodeRule'
      }
    },
    {
      path: 'emailManagement/addEmailTemplate',
      component: () =>
        import('@/views/system/emailManagement/emailTemplate/addEmailTemplate'),
      name: 'AddEmailTemplate',
      meta: {
        title: 'addEmailTemplate',
        activeMenu: '/system/emailManagement/emailTemplate'
      }
    },
    {
      path: 'emailManagement/editEmailTemplate',
      component: () =>
        import('@/views/system/emailManagement/emailTemplate/editEmailTemplate'),
      name: 'EditEmailTemplate',
      meta: {
        title: 'editEmailTemplate',
        activeMenu: '/system/emailManagement/emailTemplate'
      }
    },
    {
      path: 'emailManagement/emailDetail',
      component: () =>
        import('@/views/system/emailManagement/sentEmail/emailDetail'),
      name: 'EmailDetail',
      meta: {
        title: 'emailDetail',
        activeMenu: '/system/emailManagement/sentEmail'
      }
    },
    {
      path: 'emailManagement/editPendingSendEmail',
      component: () =>
        import('@/views/system/emailManagement/pendingSendEmail/editPendingSendEmail'),
      name: 'EditPendingSendEmail',
      meta: {
        title: 'editPendingSendEmail',
        activeMenu: '/system/emailManagement/pendingSendEmail'
      }
    },

    {
      path: 'systemSetup/addSalesGroup',
      component: () =>
        import('@/views/system/systemSetup/salesGroup/addSalesGroup'),
      name: 'AddSalesGroup',
      meta: {
        title: 'addSalesGroup',
        activeMenu: '/system/systemSetup/salesGroup'
      }
    },
    {
      path: 'systemSetup/editSalesGroup',
      component: () =>
        import('@/views/system/systemSetup/salesGroup/editSalesGroup'),
      name: 'EditSalesGroup',
      meta: {
        title: 'editSalesGroup',
        activeMenu: '/system/systemSetup/salesGroup'
      }
    },

    {
      path: 'systemSetup/addActivity',
      component: () =>
        import('@/views/system/systemSetup/activity/addActivity'),
      name: 'AddActivity',
      meta: {
        title: 'addActivity',
        activeMenu: '/system/systemSetup/activity'
      }
    },
    {
      path: 'systemSetup/editActivity',
      component: () =>
        import('@/views/system/systemSetup/activity/editActivity'),
      name: 'EditActivity',
      meta: {
        title: 'editActivity',
        activeMenu: '/system/systemSetup/activity'
      }
    }
  ]
}

export default system
