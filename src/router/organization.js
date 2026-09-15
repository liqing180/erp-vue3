import Layout from '@/layout'

const organization = {
  path: '/organization',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'corporateDetail',
      component: () => import('@/views/organization/corporate/corporateDetail'),
      name: 'CorporateDetail2',
      meta: {
        title: 'corporateDetail',
        activeMenu: '/organization/corporateDetail'
      }
    },
    {
      path: 'updateBusinessGroup',
      component: () =>
        import('@/views/organization/corporate/updateBusinessGroup'),
      name: 'UpdateBusinessGroup',
      meta: { title: 'businessGroup', activeMenu: '/organization/corporate' }
    },
    {
      path: 'addLegalEntity',
      component: () => import('@/views/organization/corporate/addLegalEntity'),
      name: 'AddLegalEntity',
      meta: { title: 'addLegalEntity', activeMenu: '/organization/corporate' }
    },
    {
      path: 'updateLegalEntity',
      component: () =>
        import('@/views/organization/corporate/updateLegalEntity'),
      name: 'UpdateLegalEntity',
      meta: { title: 'editLegalEntity', activeMenu: '/organization/corporate' }
    },
    {
      path: 'addBranchCompany',
      component: () =>
        import('@/views/organization/corporate/addBranchCompany'),
      name: 'AddBranchCompany',
      meta: {
        title: 'addBranchCompany',
        activeMenu: '/organization/corporate'
      }
    },
    {
      path: 'editBranchCompany',
      component: () =>
        import('@/views/organization/corporate/editBranchCompany'),
      name: 'EditBranchCompany',
      meta: {
        title: 'editBranchCompany',
        activeMenu: '/organization/corporate'
      }
    },
    {
      path: 'addDepartment',
      component: () =>
        import('@/views/organization/departmentManagement/addDepartment'),
      name: 'AddDepartment',
      meta: {
        title: 'department',
        activeMenu: '/organization/departmentManagement'
      }
    },
    {
      path: 'editDepartment',
      component: () =>
        import('@/views/organization/departmentManagement/editDepartment'),
      name: 'EditDepartment',
      meta: {
        title: 'department',
        activeMenu: '/organization/departmentManagement'
      }
    },
    {
      path: 'addPost',
      component: () => import('@/views/system/post/addPost'),
      name: 'AddPost',
      meta: { title: 'addPost', activeMenu: '/organization/post' }
    },
    {
      path: 'editPost',
      component: () => import('@/views/system/post/editPost'),
      name: 'EditPost',
      meta: { title: 'editPost', activeMenu: '/organization/post' }
    },
    {
      path: 'positionStructure',
      component: () => import('@/views/system/post/positionStructure'),
      name: 'PositionStructure',
      meta: { title: 'positionStructure', activeMenu: '/organization/post' }
    },

    {
      path: 'addRole',
      component: () => import('@/views/organization/role/addRole'),
      name: 'AddRole',
      meta: { title: 'addRole', activeMenu: '/organization/role' }
    },
    {
      path: 'editRole',
      component: () => import('@/views/organization/role/editRole'),
      name: 'EditRole',
      meta: { title: 'editRole', activeMenu: '/organization/role' }
    }
  ]
}

export default organization
