<template>
  <div>
    <el-table
      border
      ref="tables"
      :row-class-name="tableRowClassName"
      v-loading="loading"
      :data="tableList"
      @sort-change="handleSortChange"
      max-height="500"
    >
      <el-table-column
        v-for="item in visibleColumn"
        :key="item.prop + item.colSortIndex"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :min-width="getMinWidth(item)"
        :show-overflow-tooltip="item.tooltip"
        :fixed="item.fixed"
        :sortable="item.sortable"
        :align="item.align || 'left'"
        header-align="center"
      >
        <template #default="scope">
          <template v-if="item.prop === 'customerSourceShowStr'">{{
            !scope.row.isSummary
              ? scope.row.customerSourceShowStr
              : $t('customer.total1')
          }}</template>
          <template v-else-if="item.prop === 'loginDate'">{{
            parseTime(scope.row.loginDate, fmtForYmdhms)
          }}</template>
          <template v-else-if="item.prop === 'createdTime'">{{
            parseTime(scope.row.createdTime, fmtForYmdhms)
          }}</template>
          <template v-else-if="item.prop === 'modifiedTime'">{{
            parseTime(scope.row.modifiedTime, fmtForYmdhms)
          }}</template>
          <template v-else-if="item.prop === 'salesOpportunityQty'">
            {{ $numberStr(scope.row.salesOpportunityQty, 0) }}
          </template>
          <template v-else-if="item.prop === 'salesOpportunityAmount'">
            {{ $numberStr(scope.row.salesOpportunityAmount, 2) }}
          </template>
          <template v-else-if="item.prop === 'wonSalesOpportunityQty'">
            {{ $numberStr(scope.row.wonSalesOpportunityQty, 0) }}
          </template>
          <template v-else-if="item.prop === 'wonSalesOpportunityAmount'">
            {{ $numberStr(scope.row.wonSalesOpportunityAmount, 2) }}
          </template>
          <template v-else-if="item.prop === 'winRate'">
            {{ $numberStr(scope.row.winRate, 2) }}
          </template>
          <template v-else>{{ scope.row[item.propBy || item.prop] }}</template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import { getSalesOpportunityCustomerSourceAnalysis } from '@/api/reportManagement/dashboard'

export default {
  name: 'SalesOpportunityAnalysisTable',
  mixins: [pageMixin],
  props: {
    permissionUserIdList: {
      type: Array,
      default: () => []
    },
    searchQueryParams: {
      type: Object,
      default: () => {}
    }
  },
  components: {},
  data() {
    const vm = this
    return {
      range: [],
      saveKey: '1',
      // 遮罩层
      loading: true,
      // 用户表格数据
      tableList: [],

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        condition: undefined,
        status: undefined
      },
      // 列信息
      columns: [
        {
          prop: 'customerSourceShowStr',
          label: vm.$t('customer.customerSource'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'customerQty',
          label: vm.$t('customer.prospectiveCustomerQTY'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'dealCustomerQty',
          label: vm.$t('customer.customerQTY'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'salesOpportunityQty',
          label: vm.$t('customer.salesOpportunityQTY'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'salesOpportunityAmount',
          label: computed(() => {
            const currencyCode = vm.legalEntityInfo.currencySymbol || ''
            return `${vm.$t('customer.salesOpportunityAmount1')}${currencyCode ? ' (' + currencyCode + ')' : ''}`
          }),
          minWidth: 140,
          visible: true,
          tooltip: true,
          align: 'right'
        },
        {
          prop: 'wonSalesOpportunityQty',
          label: vm.$t('customer.wonSalesOpportunityQTY'),
          minWidth: 140,
          visible: true,
          tooltip: true
        },
        {
          prop: 'wonSalesOpportunityAmount',
          label: computed(() => {
            const currencyCode = vm.legalEntityInfo.currencySymbol || ''
            return `${vm.$t('customer.wonSalesOpportunityAmount')}${currencyCode ? ' (' + currencyCode + ')' : ''}`
          }),
          minWidth: 140,
          visible: true,
          tooltip: true,
          align: 'right'
        }
      ]
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    legalEntityInfo() {
      return this.$store.state.user.legalEntityInfo
    }
  },
  watch: {
    legalEntityInfo: {
      handler() {
        this.$$initColumnVisible(this.saveKey, this.columns)
      }
    }
  },
  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
  },
  methods: {
    init() {
      this.$refs.tables && this.$refs.tables.clearSort()
      this.getList()
    },
    /** 查询用户列表 */
    getList() {
      this.loading = true
      const { dateRange, ...params } = this.searchQueryParams || {}
      params.permissionUserIdList = this.permissionUserIdList
      getSalesOpportunityCustomerSourceAnalysis({
        ...params,
        ...this.queryParams
      })
        .then(response => {
          const { dashboardDetailVOList, summary } = response.data
          const rows = dashboardDetailVOList || []

          if (rows.length > 0 && summary) {
            summary.customerQty = summary.totalCustomerQty
            summary.dealCustomerQty = summary.totalDealCustomerQty
            summary.salesOpportunityQty = summary.totalSalesOpportunityQty
            summary.salesOpportunityAmount = summary.totalSalesOpportunityAmount
            summary.wonSalesOpportunityQty = summary.totalWonSalesOpportunityQty
            summary.wonSalesOpportunityAmount =
              summary.totalWonSalesOpportunityAmount

            summary.isSummary = '1'
            rows.push(summary)
          }
          this.tableList = rows

          this.loading = false
          this.$$getColumnContentMaxWidth(this.columns, this.tableList)
        })
        .catch(() => {
          this.loading = false
        })
    },
    tableRowClassName({ row, rowIndex }) {
      return ''
    }
  }
}
</script>
