import Layout from '@/layout'

const purchaseManagement = {
  path: '/purchaseManagement',
  component: Layout,
  hidden: true,
  children: [
    {
      path: 'addPurchaseRequisition',
      component: () =>
        import('@/views/purchaseManagement/purchaseRequisition/addPurchaseRequisition.vue'),
      name: 'AddPurchaseRequisition',
      meta: {
        title: 'addPurchaseRequisition',
        activeMenu: '/purchaseManagement/purchaseRequisition'
      }
    },
    {
      path: 'editPurchaseRequisition',
      component: () =>
        import('@/views/purchaseManagement/purchaseRequisition/editPurchaseRequisition.vue'),
      name: 'EditPurchaseRequisition',
      meta: {
        title: 'editPurchaseRequisition',
        activeMenu: '/purchaseManagement/purchaseRequisition'
      }
    },
    {
      path: 'revisePurchaseRequisition',
      component: () =>
        import('@/views/purchaseManagement/purchaseRequisition/revisePurchaseRequisition.vue'),
      name: 'RevisePurchaseRequisition',
      meta: {
        title: 'revisePurchaseRequisition',
        activeMenu: '/purchaseManagement/purchaseRequisition'
      }
    },
    {
      path: 'viewPurchaseRequisition',
      component: () =>
        import('@/views/purchaseManagement/purchaseRequisition/viewPurchaseRequisition.vue'),
      name: 'ViewPurchaseRequisition',
      meta: {
        title: 'viewPurchaseRequisition',
        activeMenu: '/purchaseManagement/purchaseRequisition'
      }
    }
  ]
}

export default purchaseManagement
