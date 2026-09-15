import Layout from '@/layout'

const system = {
  path: '/system',
  component: Layout,
  hidden: true,
  children: [
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
