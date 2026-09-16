import { h } from 'vue'
import { ElButton, ElNotification } from 'element-plus'
import i18n from '@/lang'
import { markRead } from '@/api/notice/notice'
import { getToken } from '@/utils/auth'
import { checkPermi } from '@/utils/permission'
import eventBus from '@/utils/eventBus'
import store from '@/store'
import router from '@/router'
import { browserNotify } from './browserNotify'

class SysNotifyClass {
  constructor() {
    this.notifyComponent = {}

    this.pageAll = {
      0: '/inventoryManagement/viewInventoryInitialization',
      1: '/purchaseManagement/editPurchaseOrder',
      2: '/purchaseManagement/editPurchaseRequisition',
      3: '/purchaseManagement/editPurchaseQuotation',
      4: '/purchaseManagement/viewRequestForQuotation',
      10: '/salesManagement/editServiceOrder',
      11: '/salesManagement/editSalesInquiry',
      12: '/salesManagement/editSalesQuotation',
      13: '/salesManagement/editSalesOrder',
      14: '/salesManagement/editPreDeliveryNotice',
      15: '/salesManagement/editSalesGoodsReturn',
      16: '/purchaseManagement/editPurchaseReturnOrder',
      17: '/salesManagement/editDeliveryOrder',
      18: '/purchaseManagement/editAsl',
      22: '/inventoryManagement/editTransferOrder',
      23: '/projectManagement/editStoreIssueChit',
      24: '/inventoryManagement/editInventoryAudit',
      26: '/inventoryManagement/editInventoryAdjustment',
      27: '/inventoryManagement/editEmergencyGoodsReceipt',
      30: '/purchaseManagement/editConsignmentOrder',
      36: '/projectManagement/editProjectTemplate',
      37: '/projectManagement/editProjectProduction',
      39: '/productManagement/editMixDesign',
      101: '/organization/updateLegalEntity',
      102: '/organization/editBranchCompany',
      103: '/organization/editDepartment',
      104: '/organization/editPost',
      105: '/organization/editRole',
      106: '/user/editUser',
      107: '/businessPartner/editBusinessPartner',
      108: '/organization/editZone',
      109: '/productManagement/editProductCategory',
      110: '/productManagement/editProductInfo',
      111: '/productManagement/editBOMManagement',
      112: '/system/editDriver',
      113: '/system/editVehicle',
      114: '/system/editTax',
      115: '/system/editSeaport',
      116: '/productManagement/editExtendedProductInfo',
      117: '/productManagement/editProductRelationship',
      118: '/productManagement/editSalesExpansionInformation',
      119: '/salesManagement/editQuestionnaireTemplate',
      120: '/salesManagement/editDeliveryOrder',
      121: '/salesManagement/viewQuestionnaireTemplate',
      122: '/salesManagement/editSalesPriceStrategy',
      123: '/salesManagement/editServicePriceList',
      126: '/system/editPaymentTerm'
    }

    this.mainListPageAll = {
      4: {
        routeName: 'RequestForQuotation',
        routePath: '/purchaseManagement/requestForQuotation',
        authKey: 'purchaseManagement:requestForQuotation:pendInquiry'
      },
      107: {
        routeName: 'BusinessPartner',
        routePath: '/businessPartnerManagement/businessPartner',
        authKey: 'businessPartner:businessPartner:list'
      },
      110: {
        routeName: 'ProductInfo',
        routePath: '/productManagement/productInfo',
        authKey: 'productManagement:productInfo:list'
      },
      112: {
        routeName: 'DriverManagement',
        routePath: '/system/driverManagement',
        authKey: 'system:driverManagement:list'
      },
      113: {
        routeName: 'VehicleManagement',
        routePath: '/system/vehicleManagement',
        authKey: 'system:vehicleManagement:list'
      },
      116: {
        routeName: 'ProductExtended',
        routePath: '/productManagement/productExtended',
        authKey: 'productManagement:productExtended:list'
      },
      117: {
        routeName: 'ProductRelationship',
        routePath: '/productManagement/productRelationship',
        authKey: 'productManagement:productRelationship:list'
      },
      118: {
        routeName: 'ProductConfigurationTable',
        routePath: '/productManagement/productConfigurationTable',
        authKey: 'productManagement:productConfigurationTable:list'
      },
      122: {
        routeName: 'SalesPriceStrategy',
        routePath: '/salesManagement/salesPriceStrategy',
        authKey: 'salesManagement:salesPriceStrategy:list'
      },
      123: {
        routeName: 'ServicePriceList',
        routePath: '/salesManagement/servicePriceList',
        authKey: 'salesManagement:servicePriceList:list'
      }
    }

    this.multilineTemplateKeys = new Set([
      'Product_Master_BUSINESS_GROUP_UPDATE_PRODUCT',
      'Emergency_Goods_Receipt_PROCUREMENT',
      'PRE_DELIVERY_NOTICE_Sys_Created_FROM_PO',
      'SALES_INQUIRY_Quoted',
      'DELIVERY_ORDER_Created'
    ])
  }

  getShowResolve(item) {
    if (item.jumpType === 2) return false

    if (item.jumpType === 1) {
      const page = this.mainListPageAll[item.documentType]
      return page ? checkPermi([page.authKey]) : false
    }

    return Boolean(this.pageAll[item.documentType])
  }

  getResolveBtnText() {
    return i18n.global.t('notification.detail')
  }

  createActionButton(label, props, onClick) {
    return h(
      ElButton,
      {
        size: 'small',
        style: 'margin-top: 6px',
        ...props,
        onClick
      },
      () => label
    )
  }

  testMsgShow(params = {}) {
    if (!params.content) return

    const row = { ...params }
    const notifyID = row.messageId
    const oldNotify = this.notifyComponent[notifyID]
    if (oldNotify) {
      oldNotify.close()
      delete this.notifyComponent[notifyID]
    }
    browserNotify.closeNotify(notifyID)

    row.showType = row.documentType
    row.showResolve = this.getShowResolve(row)

    const position = row.popupSettings || 'top-left'
    const notifyItem = ElNotification({
      showClose: false,
      position,
      customClass:
        position === 'top-left' ? 'my-notification-left' : 'my-notification',
      duration: 0,
      offset: position.includes('top-') ? 70 : 0,
      title: row.titleName,
      onClose: () => this.closeNotify(notifyID),
      message: () =>
        h(
          'div',
          {
            style:
              'color: #666;border-top: 1px solid #E4E7ED;margin-top: 10px;padding-top: 4px;'
          },
          [
            h('div', this.createContent(row)),
            h(
              'div',
              {
                style: 'text-align: right;margin-top: 6px'
              },
              [
                row.templateKey === 'DELIVERY_ORDER_Created'
                  ? this.createActionButton(
                      i18n.global.t('notification.printPDF'),
                      { plain: true },
                      () => this.clickHandler(row, 'printPDF', notifyID)
                    )
                  : null,
                row.showResolve
                  ? this.createActionButton(
                      this.getResolveBtnText(row),
                      { type: 'primary' },
                      () => this.clickHandler(row, 'resolve', notifyID)
                    )
                  : null,
                this.createActionButton(
                  i18n.global.t('notification.read'),
                  { plain: true },
                  () => this.clickHandler(row, 'read', notifyID)
                )
              ]
            )
          ]
        )
    })

    this.notifyComponent[notifyID] = notifyItem
    browserNotify.showNotify({
      notifyID,
      title: row.titleName,
      body: row.content
    })
  }

  handleRead(param) {
    markRead(param)
      .then(res => {
        store.commit('setUnReadNum', res.data)
      })
      .catch(() => {})

    const notify = this.notifyComponent[param.notifyID]
    if (notify) {
      notify.close()
      delete this.notifyComponent[param.notifyID]
    }
    browserNotify.closeNotify(param.notifyID)
  }

  async clickHandler(item, clickType, notifyID) {
    const param = {
      ids: item.messageId,
      notifyID: notifyID || item.messageId
    }

    if (clickType === 'read') {
      this.handleRead(param)
      return
    }

    if (clickType === 'printPDF') {
      const token = getToken() || ''
      const baseApi = import.meta.env.VITE_APP_BASE_API || '/dev-api'
      const url = `${baseApi}/sales/deliveryOrder/preview/${item.documentId}?token=${encodeURIComponent(token)}`
      window.open(url, 'print')
      return
    }

    if (clickType !== 'resolve') return

    if (item.status !== 1) {
      this.handleRead(param)
    }

    if (item.documentType === '121') {
      eventBus.emit('taskNotificationOpenDlg', {
        type: 'customerQuestionnaire',
        customerQuestionnaireId: item.documentId
      })
      return
    }

    let pushRoutePath = this.pageAll[item.documentType]
    let query = {
      timeId: Date.now(),
      id: item.documentId
    }

    switch (item.documentType) {
      case '103':
        query = { timeId: Date.now(), departmentId: item.documentId }
        break
      case '104':
        query = { timeId: Date.now(), postId: item.documentId }
        break
      case '105':
        query = { timeId: Date.now(), roleId: item.documentId }
        break
    }

    if (item.jumpType === 0) {
      query.backType = '2'

      if (item.documentType === '110' && item.documentJson) {
        try {
          const product = JSON.parse(item.documentJson)
          if (product.productType === '2') {
            pushRoutePath = '/productManagement/editService'
          }
        } catch {
          // 无效扩展 JSON 不影响默认产品详情跳转。
        }
      }

      if (!pushRoutePath) return

      const currentPath = router.currentRoute.value.path
      const route =
        currentPath === pushRoutePath
          ? { path: `/redirect${pushRoutePath}`, query }
          : { path: pushRoutePath, query }

      router.push(route).catch(() => {})
      return
    }

    if (item.jumpType === 1) {
      const page = this.mainListPageAll[item.documentType]
      if (!page) return

      router
        .push({
          name: page.routeName,
          query: { timeId: Date.now() },
          params: {
            isGetList: true,
            ids: item.jumpToIds
          }
        })
        .catch(() => {})
    }
  }

  penaliseDriver(row) {
    eventBus.emit('taskNotificationOpenDlg', {
      type: 'PenaliseDriver',
      driverId: row.driverId
    })
  }

  closeNotify(notifyID) {
    delete this.notifyComponent[notifyID]
    browserNotify.closeNotify(notifyID)
  }

  closeNotifyAll() {
    Object.keys(this.notifyComponent).forEach(notifyID => {
      this.notifyComponent[notifyID]?.close()
      delete this.notifyComponent[notifyID]
    })
    browserNotify.closeNotifyAll()
  }

  formatText(text) {
    return String(text || '').replace(/\n/g, '<br />')
  }

  createContent(row, getElementList = true) {
    const rowList = [
      {
        label: 'null',
        templateKey: row.templateKey,
        value: row.content
      }
    ]

    return getElementList ? this.createItemList(rowList) : rowList
  }

  createItemList(rowList) {
    return rowList.map(item => {
      const valueNode = this.multilineTemplateKeys.has(item.templateKey)
        ? h('div', {
            style: 'line-height: 1.8',
            class: 'm-value',
            innerHTML: this.formatText(item.value)
          })
        : h(
            'span',
            {
              class: 'm-value'
            },
            item.value
          )

      return h(
        'div',
        {
          style: {
            width: '300px',
            textAlign: 'left'
          }
        },
        [
          item.label !== 'null'
            ? h(
                'span',
                {
                  class: 'm-label',
                  style: {
                    fontWeight: 'bold',
                    color: '#444'
                  },
                  title: item.label
                },
                `${item.label} : `
              )
            : null,
          item.value !== 'null' ? valueNode : null
        ]
      )
    })
  }
}

export default new SysNotifyClass()
