import Layout from '@/layout'

const formRouteProps = route => ({ pageRoute: route })

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
      props: formRouteProps,
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
      props: formRouteProps,
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
      props: formRouteProps,
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
      props: formRouteProps,
      meta: {
        title: 'viewPurchaseRequisition',
        activeMenu: '/purchaseManagement/purchaseRequisition'
      }
    }
  ]
}

export default purchaseManagement
