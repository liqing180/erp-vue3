<template>
  <div
    v-if="dashboardAuth"
    ref="fullScreenContainer"
    class="dashboard-container"
  >
    <BoardHeader
      :report-url-list="reportUrlList"
      :todays-data-options="todaysDataOptions"
      :com-todays-data="comTodaysData"
      :is-show-full-screen="isShowFullScreen"
      :form-data="form"
      :is-expand="isExpand"
      @toggleFullscreen="toggleFullscreen"
      @handleChangeUrl="handleChangeUrl"
      @handleChangeTodays="handleChangeTodays"
      @setMaskShow="setMaskShow"
      @changeIsExpand="isExpand = !isExpand"
    />

    <div v-if="comUrl" class="iframe-module-out">
      <IFrame :src="comUrl" :other-height="comOrderHeight" />
      <div v-if="mask" class="mask" @click="mask = false" />
    </div>

    <div
      v-else-if="reportUrlList.length <= 0 && initPage"
      class="empty-dashboard"
    >
      {{ $t('DASHBOARD.noAuthMsg') }}
    </div>

    <SettingDlg ref="settingDlg" @onSuccess="settingSuccess" />
  </div>

  <div v-else class="empty-dashboard">
    {{ $t('DASHBOARD.noAuthMsg') }}
  </div>
</template>

<script>
import { debounce } from '@/utils'
import BoardHeader from './boardHeader.vue'
import SettingDlg from './settingDlg.vue'
import IFrame from '@/components/iFrame/index.vue'
import {
  queryReportGroupForDashboard,
  queryTaskCenterStatistics,
  saveUserDefaultReport,
  queryTodayTransactionsPurchase,
  queryTodayTransactionsSales,
  queryTodayTransactionsOverall
} from '@/api/reportManagement/dashboard'

const appUrl = import.meta.env.VITE_APP_URL || ''

export default {
  name: 'Dashboard',
  components: {
    BoardHeader,
    SettingDlg,
    IFrame
  },
  data() {
    return {
      zoneIdList: [],
      isExpand: true,
      isShowFullScreen: false,
      isShowFullScreenIndex: 0,
      mask: false,
      initPage: false,
      intervalId: null,
      resizeHandler: null,
      createdInitTimer: 0,
      queryTime: 0,
      form: {
        openQty: 0,
        overdueQty: 0,
        processedQty: 0,
        myInitiatedQty: 0,
        notificationsQty: 0,
        reportUrl: undefined,
        reportName: undefined,
        reportId: undefined,
        todaysDataActive: 'overall'
      },
      reportUrlList: [],
      purchaseTodaysData: [
        {
          label: this.$t('DASHBOARD.todaysOrders'),
          value: 0,
          percentage: 0
        },
        {
          label: this.$t('DASHBOARD.todaysStockIns'),
          value: 0,
          percentage: 0
        },
        {
          label: this.$t('DASHBOARD.todaysReturns'),
          value: 0,
          percentage: 0
        },
        {
          label: this.$t('DASHBOARD.activeSuppliers'),
          value: 0,
          percentage: 0
        }
      ],
      salesTodaysData: [
        {
          label: this.$t('DASHBOARD.todaysOrders'),
          value: 0,
          percentage: 0
        },
        {
          label: this.$t('DASHBOARD.todaysDeliveries'),
          value: 0,
          percentage: 0
        },
        {
          label: this.$t('DASHBOARD.todaysReturns'),
          value: 0,
          percentage: 0
        },
        {
          label: this.$t('DASHBOARD.activeCustomers'),
          value: 0,
          percentage: 0
        }
      ],
      overallTodaysData: [
        {
          label: this.$t('DASHBOARD.purchaseOrders'),
          value: 0,
          percentage: 0
        },
        {
          label: this.$t('DASHBOARD.salesOrders'),
          value: 0,
          percentage: 0
        },
        {
          label: this.$t('DASHBOARD.activeSuppliers'),
          value: 0,
          percentage: 0
        },
        {
          label: this.$t('DASHBOARD.activeCustomers'),
          value: 0,
          percentage: 0
        }
      ]
    }
  },
  computed: {
    comOrderHeight() {
      let height = this.isShowFullScreen ? 200 : 284
      if (!this.isExpand) {
        height -= 132
      }
      return height
    },
    legalEntityId() {
      return this.$store.state.user.legalEntityInfo.legalEntityId
    },
    comUrl() {
      if (!this.form.reportUrl) return undefined
      return `${appUrl}${this.form.reportUrl}?legal_entity_id=${this.legalEntityId}#hide_parameters=legal_entity_id&titled=false`
    },
    comTodaysData() {
      if (this.form.todaysDataActive === 'purchase') {
        return this.purchaseTodaysData
      }
      if (this.form.todaysDataActive === 'sales') {
        return this.salesTodaysData
      }
      return this.overallTodaysData
    },
    dashboardPurchaseAuth() {
      return this.checkPermi(['system:dashboard:purchase'])
    },
    dashboardSalesAuth() {
      return this.checkPermi(['system:dashboard:sales'])
    },
    dashboardOverallAuth() {
      return this.checkPermi(['system:dashboard:overall'])
    },
    dashboardAuth() {
      return (
        this.dashboardPurchaseAuth ||
        this.dashboardSalesAuth ||
        this.dashboardOverallAuth
      )
    },
    todaysDataOptions() {
      const list = []
      if (this.dashboardPurchaseAuth) {
        list.push({
          label: this.$t('DASHBOARD.purchase'),
          value: 'purchase'
        })
      }
      if (this.dashboardSalesAuth) {
        list.push({
          label: this.$t('DASHBOARD.sales'),
          value: 'sales'
        })
      }
      if (this.dashboardOverallAuth) {
        list.push({
          label: this.$t('DASHBOARD.overall'),
          value: 'overall'
        })
      }
      return list
    }
  },
  created() {
    this.startRefreshTimer()
    this.createdInitTimer = Date.now()
    this.queryReportGroupForDashboard()
    this.queryTaskCenterStatistics()

    const dashboardTodaysId = this.$cache.local.getJSON('dashboardTodaysId')
    if (
      dashboardTodaysId &&
      this.todaysDataOptions.some(item => item.value === dashboardTodaysId)
    ) {
      this.form.todaysDataActive = dashboardTodaysId
    }
    this.handleChangeTodays()
  },
  mounted() {
    this.bindResize()
  },
  activated() {
    if (Date.now() - this.createdInitTimer < 1000) return

    this.startRefreshTimer()
    this.queryReportGroupForDashboard()
    this.queryTaskCenterStatistics()
    this.handleChangeTodays()
    this.bindResize()
  },
  deactivated() {
    this.cleanupPageEffects()
  },
  beforeUnmount() {
    this.cleanupPageEffects()
  },
  methods: {
    startRefreshTimer() {
      if (this.intervalId != null) return
      this.intervalId = window.setInterval(() => {
        this.queryTaskCenterStatistics()
        this.handleChangeTodays()
      }, 60 * 1000)
    },
    stopRefreshTimer() {
      if (this.intervalId == null) return
      window.clearInterval(this.intervalId)
      this.intervalId = null
    },
    bindResize() {
      this.unbindResize()
      this.resizeHandler = debounce(() => {
        if (this.isShowFullScreenIndex > 0) {
          this.isShowFullScreen = false
          this.isShowFullScreenIndex = 0
        } else {
          this.isShowFullScreenIndex++
        }
      }, 0)
      window.addEventListener('resize', this.resizeHandler)
    },
    unbindResize() {
      if (!this.resizeHandler) return
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    },
    cleanupPageEffects() {
      this.isShowFullScreenIndex = 0
      this.unbindResize()
      this.stopRefreshTimer()
    },
    setMaskShow(value) {
      this.mask = value
    },
    toggleFullscreen() {
      this.isShowFullScreenIndex = 0
      const element = this.$refs.fullScreenContainer
      if (!element) return

      if (
        !document.fullscreenElement ||
        element !== document.fullscreenElement
      ) {
        this.openFullscreen(element)
      } else {
        this.quitFullscreen()
      }
    },
    openFullscreen(element) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen()
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }
      this.isShowFullScreen = true
    },
    quitFullscreen() {
      this.isShowFullScreen = false
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    },
    queryReportGroupForDashboard() {
      const dashboardReportId = this.$cache.local.getJSON('dashboardReportId')

      queryReportGroupForDashboard({ reportType: 'ERP' }).then(res => {
        this.initPage = true

        let firstReport
        let defaultReport
        const groups = []

        ;(res.data || []).forEach(group => {
          const options = (group.dashboards || []).map(child => {
            const report = {
              ...child,
              reportId: `${group.reportGroupId}-${child.id}`,
              reportName: child.name
            }
            if (!firstReport) firstReport = report
            if (report.reportId === dashboardReportId) {
              defaultReport = report
            }
            return report
          })

          if (options.length > 0) {
            groups.push({
              label: group.groupName,
              options
            })
          }
        })

        this.reportUrlList = groups
        const selectedReport = defaultReport || firstReport
        if (selectedReport) {
          this.setCurrentReport(selectedReport)
        }
      })
    },
    setCurrentReport(reportRow) {
      this.form.reportUrl = reportRow.publicUrl
      this.form.reportId = reportRow.reportId
      this.form.reportName = reportRow.reportName
    },
    queryTaskCenterStatistics() {
      queryTaskCenterStatistics({}).then(res => {
        const data = res.data || {}
        Object.assign(this.form, {
          myInitiatedQty: data.myInitiatedQty || 0,
          notificationsQty: data.notificationsQty || 0,
          openQty: data.openQty || 0,
          overdueQty: data.overdueQty || 0,
          processedQty: data.processedQty || 0
        })
      })
    },
    handleChangeUrl(reportRow) {
      this.setCurrentReport(reportRow)
      this.$cache.local.setJSON('dashboardReportId', reportRow.reportId)
      this.saveUserDefaultReport(reportRow.reportId)
    },
    handleChangeTodays(activeValue) {
      if (activeValue) {
        this.form.todaysDataActive = activeValue
      }

      const active = this.form.todaysDataActive
      const requestMap = {
        purchase: queryTodayTransactionsPurchase,
        sales: queryTodayTransactionsSales,
        overall: queryTodayTransactionsOverall
      }
      const request = requestMap[active]
      if (!request) return

      const queryTime = Date.now()
      this.queryTime = queryTime
      request({}).then(res => {
        if (queryTime !== this.queryTime) return

        const data = res.data || {}
        if (active === 'purchase') {
          this.applyTodayData(this.purchaseTodaysData, [
            data.todayOrders,
            data.todayStockIns,
            data.todayReturns,
            data.activeSuppliers
          ])
        } else if (active === 'sales') {
          this.applyTodayData(this.salesTodaysData, [
            data.todayOrders,
            data.todayDeliveries,
            data.todayReturns,
            data.activeCustomers
          ])
        } else {
          this.applyTodayData(this.overallTodaysData, [
            data.purchaseOrderCount,
            data.salesOrderCount,
            data.activeSuppliers,
            data.activeCustomers
          ])
        }
      })
    },
    applyTodayData(targetList, values) {
      const normalized = values.map(value => value || 0)
      const max = Math.max(1, ...normalized)
      targetList.forEach((item, index) => {
        item.value = normalized[index]
        item.percentage = (normalized[index] * 100) / max
      })
    },
    saveUserDefaultReport(reportId) {
      const [reportGroupId, id] = reportId.split('-')
      return saveUserDefaultReport({ reportGroupId, id })
    },
    setting() {
      this.$refs.settingDlg?.handleOpen()
    },
    settingSuccess(reportRow) {
      this.queryReportGroupForDashboard()
      this.form.reportUrl = reportRow.publicUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  height: 100%;
  background-color: #fff;
}

.iframe-module-out {
  position: relative;

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(119, 119, 119, 0);
  }
}

.empty-dashboard {
  padding: 20px;
}
</style>
