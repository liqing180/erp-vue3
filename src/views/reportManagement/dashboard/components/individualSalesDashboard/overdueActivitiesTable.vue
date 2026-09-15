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
          <template v-if="item.prop === 'loginDate'">{{
            parseTime(scope.row.loginDate, fmtForYmdhms)
          }}</template>
          <template v-else-if="item.prop === 'activityStartTime'">{{
            parseTime(scope.row.activityStartTime, fmtForYmdhm)
          }}</template>
          <template v-else-if="item.prop === 'activityEndTime'">{{
            parseTime(scope.row.activityEndTime, fmtForYmdhm)
          }}</template>
          <template v-else>{{ scope.row[item.propBy || item.prop] }}</template>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :saveKey="saveKey"
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import { getUserOverdueActivityList } from '@/api/reportManagement/dashboard'

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
      saveKey: '4',
      // 遮罩层
      loading: true,
      // 用户表格数据
      tableList: [],
      // 总条数
      total: 0,
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
          prop: 'activityName',
          label: vm.$t('customer.activityName'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom',
          fixed: true
        },
        {
          prop: 'subject',
          label: vm.$t('customer.subject1'),
          visible: true,
          minWidth: 160,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'contactPersonName',
          label: vm.$t('customer.contactPerson'),
          visible: true,
          minWidth: 160,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'activityStartTime',
          label: vm.$t('customer.startDateTime'),
          minWidth: 140,
          visible: true,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'activityEndTime',
          label: vm.$t('customer.endDateTime'),
          minWidth: 140,
          visible: true,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'salesOpportunityName',
          label: vm.$t('customer.salesOpportunity'),
          minWidth: 140,
          visible: true,
          sortable: 'custom',
          tooltip: true
        }
      ]
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhm() {
      return this.$store.getters.fmtForYmdhm
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
      this.queryParams.isAsc = this.queryParams.orderByColumn = undefined
      this.getList()
    },
    /** 查询用户列表 */
    getList() {
      this.loading = true
      const { dateRange, ...params } = this.searchQueryParams || {}
      const { orderByColumn, isAsc } = this.queryParams || {}
      params.permissionUserIdList = this.permissionUserIdList
      getUserOverdueActivityList({ ...params, orderByColumn, isAsc })
        .then(response => {
          this.tableList = response.rows || []
          // this.total = response.total

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
