import { h } from 'vue'
import i18n from '@/lang'
import { markRead } from '@/api/notice/notice'
import store from '@/store'
import router from '@/router/index'
import { ElNotification, ElButton } from 'element-plus'
import { checkPermi } from '@/utils/permission'
class SysNotifyClass {
  constructor() {
    this.notifyComponent = {}
    this.$vue = null
    this.pageAll = {
      101: '/organization/updateLegalEntity',
      102: '/organization/editBranchCompany',
      103: '/organization/editDepartment',
      104: '/organization/editPost',
      105: '/organization/editRole',
      106: '/user/editUser',

      201: '/system/systemSetup/editSalesGroup',
      202: '/leads/viewLeads',
      203: '/customerManagement/viewCustomer',
      204: '/customerManagement/viewProspectiveCustomer',
      205: '/salesOpportunity/viewSalesOpportunity',
      206: '/competitor/editCompetitor'
    }

    this.mainListPageAll = {
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

    this.zoneList = []

    this.testMsgShow = (params = {}) => {
      /* 无内容体，过滤不显示 */
      if (!params.content) return

      const row = { ...params }
      const notifyID = row.messageId
      if (this.notifyComponent[notifyID]) {
        this.notifyComponent[notifyID].close()
        delete this.notifyComponent[notifyID]
      }

      row.showType = row.documentType

      row.showResolve = this.getShowResolve(row)

      /* notification 会返回当前 Notification 的实例 */
      const position = row.popupSettings || 'top-left' // top-right/top-left/bottom-right/bottom-left
      const notifyItem = ElNotification({
        showClose: false,
        position: position,
        customClass:
          position === 'top-left' ? 'my-notification-left' : 'my-notification',
        duration: 0,
        offset: position.includes('top-') ? 70 : 0,
        title: row.titleName,
        onClose: () => {
          this.closeNotify(notifyID)
        },
        message: () => {
          return h(
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
                  h(
                    ElButton,
                    {
                      size: 'small',
                      plain: true,
                      style: 'margin-top: 6px',
                      onClick: () => {
                        this.clickHandler(row, 'read', notifyID)
                      }
                    },
                    () => i18n.global.t('notification.read')
                  ),
                  row.showResolve
                    ? h(
                        ElButton,
                        {
                          size: 'small',
                          type: 'primary',
                          style: 'margin-top: 6px',
                          onClick: () => {
                            this.clickHandler(row, 'resolve', notifyID)
                          }
                        },
                        () => this.getResolveBtnText(row)
                      )
                    : null
                ]
              )
            ]
          )
        }
      })

      this.notifyComponent[notifyID] = notifyItem
      // console.log(this.notifyComponent)
    }

    this.getShowResolve = item => {
      // jumpType 0：跳详情 1：跳主列表 2：没有跳转按钮
      if (item.jumpType === 2) return false
      if (item.jumpType === 1) {
        const page = this.mainListPageAll[item.documentType]
        if (!page) {
          return false
        }
        return checkPermi([page.authKey])
      }
      return !!this.pageAll[item.documentType]
    }

    this.getResolveBtnText = item => {
      return i18n.global.t('notification.detail')
    }

    this.handleRead = param => {
      markRead(param)
        .then(res => {
          store.commit('setUnReadNum', res.data)
        })
        .catch(() => {})
      if (this.notifyComponent[param.notifyID]) {
        this.notifyComponent[param.notifyID].close()
        delete this.notifyComponent[param.notifyID]
      }
    }

    this.clickHandler = async (item, clickType, notifyID) => {
      const param = {
        ids: item.messageId,
        notifyID: notifyID || item.messageId
      }
      if (clickType === 'read') {
        this.handleRead(param)
      }
      if (clickType === 'resolve') {
        if (item.status !== 1) {
          this.handleRead(param)
        }
        const pushRoutePath = this.pageAll[item.documentType]
        let queryData = {
          timeId: Date.now(),
          id: item.documentId
        }
        let params = {}

        switch (item.documentType) {
          case '103':
            queryData = {
              timeId: Date.now(),
              departmentId: item.documentId
            }
            break
          case '104':
            queryData = {
              timeId: Date.now(),
              postId: item.documentId
            }
            break
          case '105':
            queryData = {
              timeId: Date.now(),
              roleId: item.documentId
            }
            break
        }
        if (item.jumpType === 0) {
          queryData.backType = '2'
        }
        if (item.jumpType === 0) {
          /* 多次跳转同一路由，需要特殊处理 */
          const cur = router.currentRoute._value
          const curName = cur.path
          if (curName === pushRoutePath) {
            router
              .replace({
                path: '/redirect' + pushRoutePath,
                query: queryData
              })
              .catch()
          } else {
            router
              .push({
                path: pushRoutePath,
                query: queryData
              })
              .catch()
          }
        } else if (item.jumpType === 1) {
          /* 跳主列表 */
          const page = this.mainListPageAll[item.documentType]
          if (!page) return
          const pushRouteName = page.routeName
          queryData = {
            timeId: Date.now()
          }
          params = {
            isGetList: true,
            ids: item.jumpToIds
          }
          router
            .push({
              name: pushRouteName,
              query: queryData,
              params: params
            })
            .catch()
        }
      }
    }
    this.closeNotify = notifyID => {
      if (this.notifyComponent[notifyID]) {
        delete this.notifyComponent[notifyID]
      }
    }

    this.closeNotifyAll = () => {
      const data = this.notifyComponent
      Object.keys(data).forEach(key => {
        data[key].close()
        delete data[key]
      })
    }

    this.createContent = (row, getEleList = true) => {
      let rowList = []
      switch (row.showType) {
        case '1':
          rowList = [
            {
              label: 'null',
              value: row.content
            }
            /*  {
              label: i18n.global.t('notification.plant'),
              value: row.plantName
            } */
          ]
          break
        default:
          rowList = [
            {
              label: 'null',
              value: row.content
            }
          ]
          break
      }

      if (getEleList) {
        return this.createItemList(rowList)
      } else {
        return rowList
      }
    }
    this.createItemList = rowList => {
      return rowList.map(item => {
        return h(
          'div',
          {
            style: {
              width: '300px',
              'text-align': 'left'
            }
          },
          [
            item.label !== 'null'
              ? h(
                  'span',
                  {
                    class: 'm-label',
                    style: {
                      'font-weight': 'bold',
                      color: '#444'
                    },
                    attrs: {
                      title: item.label
                    }
                  },
                  item.label + ' : '
                )
              : null,
            item.value !== 'null'
              ? h(
                  'span',
                  {
                    class: 'm-value'
                  },
                  item.value
                )
              : null
          ]
        )
      })
    }
  }
}

export default new SysNotifyClass()
