<template>
  <div class="dashboard-container">
    <template v-if="dashboardOverviewTypeList.length > 0">
      <!-- 头部筛选区 -->
      <div class="filter-container">
        <div class="left flexStart">
          <el-select
            :model-value="
              queryParams.dashboardDataType === 'custom'
                ? userNames
                : queryParams.dashboardDataType
            "
            placeholder=""
            style="width: 200px"
            @change="dashboardDataTypeChange"
          >
            <el-option
              v-for="dict in dashboardDataTypeList"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
            <template
              #footer
              v-if="checkPermi([queryParams.dashboardOverviewType + ':custom'])"
            >
              <el-button
                :type="userList.length > 0 ? 'primary' : ''"
                plain
                bg
                @click="selectPicTableOpen"
                style="width: 100%"
              >
                {{ $t('customer.custom') }}
              </el-button>
            </template>
          </el-select>
          <!-- <SelectInput
            clearable
            :value="userNames || $t('customer.custom')"
            :title="userNames || $t('customer.custom')"
            @click="selectPicTableOpen"
            @clear="selectPicTableClear"
            style="width: 200px"
            v-if="queryParams.dashboardDataType === 'custom'"
          /> -->
          <DatePickerEleShortcuts
            :startDate="queryParams.startDate"
            :endDate="queryParams.endDate"
            :value="queryParams.dateRange"
            :label="$t('ui.createdTime')"
            :clearable="false"
            format="timestamp"
            style="width: 300px"
            @updateForm="updateForm"
          ></DatePickerEleShortcuts>
        </div>
        <div class="right flexEnd">
          <el-select
            v-model="queryParams.dashboardOverviewType"
            placeholder=""
            class="mr10"
            style="width: 200px"
            @change="dashboardOverviewTypeChange"
            v-if="dashboardOverviewTypeList.length > 1"
          >
            <el-option
              v-for="dict in dashboardOverviewTypeList"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
          <right-toolbar
            ref="rightToolbar"
            :saveKey="saveKey"
            :refreshTimeSaveKey="saveKey"
            @autoRefresh="autoRefresh"
            @queryTable="resetSearch"
          >
          </right-toolbar>
        </div>
      </div>
      <!-- 销售全局看板 -->
      <SalesOverviewDashboard
        ref="salesOverviewDashboard"
        :permissionUserIdList="permissionUserIdList"
        :queryParams="queryParams"
        v-show="queryParams.dashboardOverviewType === 'salesOverviewDashboard'"
      />
      <!-- 个人销售看板 -->
      <IndividualSalesDashboard
        ref="individualSalesDashboard"
        :permissionUserIdList="permissionUserIdList"
        :queryParams="queryParams"
        v-show="
          queryParams.dashboardOverviewType === 'individualSalesDashboard'
        "
      />
      <!-- 选择授权用户 -->
      <select-pic-table
        ref="selectPicTable"
        @onSuccess="selectPicTableSuccess"
      />
    </template>
    <!-- 无权限 -->
    <div class="no-access-container" v-else>
      <div class="no-access-content">
        <h3>{{ $t('customer.noDashboardAccess') }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

import DatePickerEleShortcuts from '@/components/Common/searchFormNew/DatePickerEleShortcuts.vue'
import SelectPicTable from './components/selectPicTable.vue'
import { queryPermissionUserIdList } from '@/api/reportManagement/dashboard'
import i18n from '@/lang' // 国际化语言包
import SalesOverviewDashboard from './salesOverviewDashboard.vue'
import IndividualSalesDashboard from './individualSalesDashboard.vue'

const typeList = [
  {
    label: i18n.global.t('menu.salesOverviewDashboard'),
    value: 'salesOverviewDashboard',
    auth: 'reportManagement:dashboard:salesOverviewDashboard'
  },
  {
    label: i18n.global.t('menu.individualSalesDashboard'),
    value: 'individualSalesDashboard',
    auth: 'reportManagement:dashboard:individualSalesDashboard'
  }
]

const dataTypeList = [
  { label: i18n.global.t('customer.onlyMe'), value: 'onlyMe' },
  {
    label: i18n.global.t('customer.meAndMyDirectReports'),
    value: 'meAndMyDirectReports'
  },
  {
    label: i18n.global.t('customer.myDepartmentOnly'),
    value: 'myDepartmentOnly'
  },
  { label: i18n.global.t('customer.allDepartments'), value: 'allDepartments' }
  // { label: i18n.global.t('customer.custom'), value: 'custom' }
]

export default {
  name: 'Dashboard',
  components: {
    DatePickerEleShortcuts,
    SelectPicTable,
    SalesOverviewDashboard,
    IndividualSalesDashboard
  },
  data() {
    return {
      saveKey: '1',
      queryParams: {
        dashboardDataType: 'allDepartments',
        dateRange: [],
        startDate: undefined,
        endDate: undefined,
        dashboardOverviewType: 'salesOverviewDashboard'
      },
      userNames: undefined,

      // 数据维度
      dashboardDataTypeList: [],
      // 概览类型
      dashboardOverviewTypeList: [],
      // 自定义用户列表
      userList: [],
      // 用户权限id
      permissionUserIdList: [],
      chart: null
    }
  },
  created() {
    this.initAuth()
    this.initQueryParams()
  },

  activated() {
    this.initCharts({ type: 'init' })
  },

  beforeUnmount() {
    // 销毁图表实例
    this.$refs.salesOverviewDashboard &&
      this.$refs.salesOverviewDashboard.dispose()
    this.$refs.individualSalesDashboard &&
      this.$refs.individualSalesDashboard.dispose()
  },

  methods: {
    // 初始化权限
    initAuth() {
      this.dashboardOverviewTypeList = typeList.filter(item =>
        this.checkPermi([item.auth])
      )
      if (
        this.dashboardOverviewTypeList &&
        this.dashboardOverviewTypeList.length > 0
      ) {
        this.dashboardOverviewTypeList.forEach(x => {
          x.dashboardDataTypeList = dataTypeList.filter(item =>
            this.checkPermi([x.value + ':' + item.value])
          )
        })
        this.dashboardOverviewTypeList = this.dashboardOverviewTypeList.filter(
          x => x.dashboardDataTypeList.length > 0
        )
        if (
          this.dashboardOverviewTypeList &&
          this.dashboardOverviewTypeList.length > 0
        ) {
          this.queryParams.dashboardOverviewType =
            this.dashboardOverviewTypeList[0].value
          this.dashboardDataTypeList =
            this.dashboardOverviewTypeList[0].dashboardDataTypeList
          const list = this.dashboardDataTypeList.filter(
            x => x.value !== 'custom'
          )
          if (list.length > 0) {
            this.queryParams.dashboardDataType = list[list.length - 1].value
          } else {
            this.queryParams.dashboardDataType = undefined
          }
        }
        this.queryPermissionUserIdList()
      }
    },
    // 权限查询
    queryPermissionUserIdList(e) {
      const userIdList = this.userList.map(item => item.userId)
      const { dashboardDataType } = this.queryParams
      if (this.$refs.rightToolbar) {
        this.$refs.rightToolbar.autoRefreshSecond = 0
      }
      queryPermissionUserIdList({
        permissionUserIdList: userIdList,
        dashboardDataType
      }).then(res => {
        const { permissionUserIdList } = res.data || []
        this.permissionUserIdList = permissionUserIdList || []
        this.$refs.salesOverviewDashboard &&
          this.$refs.salesOverviewDashboard.dispose()
        this.$refs.individualSalesDashboard &&
          this.$refs.individualSalesDashboard.dispose()
        this.$nextTick(() => {
          this.initCharts(e)
        })
      })
    },
    // 数据维度
    dashboardDataTypeChange(e) {
      this.userNames = undefined
      this.userList = []
      const list = this.dashboardDataTypeList.filter(x => x.value === e)
      if (e === 'custom') {
        this.selectPicTableOpen()
      } else {
        this.queryParams.dashboardDataType = e
      }
      this.queryPermissionUserIdList()
    },
    // 概览权限
    dashboardOverviewTypeChange(e) {
      const dashboardOverviewTypeList = this.dashboardOverviewTypeList.filter(
        x => x.value === e
      )
      this.dashboardDataTypeList =
        dashboardOverviewTypeList[0].dashboardDataTypeList
      const list = this.dashboardDataTypeList.filter(x => x.value !== 'custom')
      if (list.length > 0) {
        this.queryParams.dashboardDataType = list[list.length - 1].value
      } else {
        this.queryParams.dashboardDataType = undefined
      }
      this.queryPermissionUserIdList()
    },
    // 图表初始化
    initCharts(e = {}) {
      const { dashboardOverviewType } = this.queryParams
      if (dashboardOverviewType) {
        this.$refs[dashboardOverviewType] &&
          this.$refs[dashboardOverviewType].init(e)
      }
    },
    // 自定义用户弹窗
    selectPicTableOpen() {
      this.$refs.selectPicTable.handleOpen(this.userList)
    },
    // 选择用户
    selectPicTableSuccess(e) {
      this.userNames = e.map(item => item.nickName).join(',')
      this.userList = e || []
      this.queryParams.dashboardDataType = undefined
      this.queryParams.dashboardDataType = 'custom'
      this.queryPermissionUserIdList()
    },
    // 清空自定义用户
    selectPicTableClear() {
      this.userNames = undefined
      this.queryParams.dashboardDataType = undefined
    },
    // 自动刷新
    autoRefresh() {
      this.queryPermissionUserIdList({ noLoading: true })
    },
    // 刷新
    resetSearch() {
      this.queryPermissionUserIdList()
    },
    // 初始化查询参数
    initQueryParams() {
      const end = this.appointTime(Date.now(), '23:59:59')
      const startTimer =
        this.appointTime(Date.now(), '00:00:00') - 3600 * 1000 * 24 * 29
      this.queryParams['dateRange'] = [startTimer, end]
      this.queryParams['startDate'] = startTimer
      this.queryParams['endDate'] = end
    },
    // 更新查询参数
    updateForm(e) {
      const { value } = e
      if (value && value.length > 0) {
        this.queryParams['startDate'] = value[0]
        this.queryParams['endDate'] = value[1] + 86399000
      } else {
        this.queryParams['startDate'] = undefined
        this.queryParams['endDate'] = undefined
      }
      this.queryPermissionUserIdList()
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-container {
  // padding: 20px;

  .filter-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .left {
      .el-select {
        margin-right: 15px;
      }
    }
  }

  .no-access-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
