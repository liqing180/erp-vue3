<template>
  <div class="app-container">
    <search-form
      ref="searchForm"
      :value="queryParams"
      :searchData="searchData"
      :handleQuery="handleQuery"
      :resetQuery="resetQuery"
      :showCustom="false"
      v-show="showSearch"
      :topShowCount="1"
    />

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="Delete"
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:logininfor:remove']"
          >{{ $t('uiBtn.delete') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="Delete"
          size="small"
          @click="handleClean"
          v-hasPermi="['system:logininfor:remove']"
          >{{ $t('uiBtn.clear') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Unlock"
          size="small"
          :disabled="single"
          @click="handleUnlock"
          v-hasPermi="['system:logininfor:unlock']"
          >{{ $t('menu.accountUnlock') }}</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="queryTable"
      ></right-toolbar>
    </el-row>

    <el-table
      ref="tables"
      border
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
      :max-height="600"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        :label="$t('ui.operId')"
        align="left"
        prop="infoId"
        :min-width="160"
      />
      <el-table-column
        :min-width="160"
        :label="$t('ui.userName')"
        align="left"
        prop="userName"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        :min-width="160"
        :label="$t('ui.ipaddr')"
        align="left"
        prop="ipaddr"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        :min-width="160"
        :label="$t('ui.loginLocation')"
        align="left"
        prop="loginLocation"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        :min-width="160"
        :label="$t('ui.browser')"
        align="left"
        prop="browser"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        :label="$t('ui.operSystem')"
        align="left"
        prop="os"
        :min-width="160"
      />
      <el-table-column
        :label="$t('ui.loginStatus')"
        align="left"
        prop="status"
        :min-width="160"
      >
        <template v-slot="scope">
          <dict-tag :options="sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('ui.actionMsg')"
        align="left"
        prop="msg"
        :min-width="160"
      />
      <el-table-column
        :label="$t('ui.loginTime')"
        align="left"
        prop="loginTime"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :min-width="160"
      >
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import {
  list,
  delLogininfor,
  cleanLogininfor,
  unlockLogininfor
} from '@/api/monitor/logininfor'
import pageMixin from '@/mixins/tableMinx'
export default {
  name: 'Logininfor',
  mixins: [pageMixin],
  data() {
    const vm = this
    return {
      sys_common_status: [],
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 选择用户名
      selectName: '',
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      tableList: [],
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'loginTime', order: 'descending' },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        ipaddr: undefined,
        userName: undefined,
        status: undefined
      },
      searchData: [
        {
          name: 'ipaddr',
          type: 'InputEle',
          placeholder: vm.$t('ui.ipaddr')
        },
        {
          name: 'userName',
          label: vm.$t('ui.userName'),
          type: 'InputEle',
          isLine: false
        },
        {
          name: 'status',
          label: vm.$t('ui.loginStatus'),
          type: 'SelectEle',
          selectValue: 'value',
          selectLabel: 'label',
          dict: 'sys_common_status',
          selectData: []
        },
        {
          name: 'dateRange',
          label: vm.$t('ui.loginTime'),
          type: 'DatePickerEleShortcuts',
          startDate: 'startDate',
          endDate: 'endDate'
        }
      ]
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    }
  },
  created() {
    const { sys_common_status } = this.useDict('sys_common_status')
    this.sys_common_status = sys_common_status || []
    this.getList()
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true
      let dateRange = this.queryParams.dateRange || []
      if (dateRange.length > 0) {
        dateRange = [...dateRange]
        dateRange[0] = this.parseTime(dateRange[0], 'YYYY/MM/DD HH:mm:ss')
        dateRange[1] = this.parseTime(dateRange[1], 'YYYY/MM/DD HH:mm:ss')
      }
      let params = this.addDateRange(this.queryParams, dateRange)
      params = this.$trimOfObj(params)

      delete params.dateRange
      delete params.startDate
      delete params.endDate

      list(params).then(response => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      const { pageSize } = this.queryParams
      this.queryParams = { pageNum: 1, pageSize }
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order)
      this.handleQuery()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.infoId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
      this.selectName = selection.map(item => item.userName)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const infoIds = row.infoId || this.ids
      const showStr = row.infoId ? row.infoId : this.ids.join(', ')
      this.$modal
        .confirm(this.$t('ui.logininforDelConfirm').replace('$1', showStr))
        .then(function () {
          return delLogininfor(infoIds)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess(this.$t('ui.deleteSuccess'))
        })
        .catch(() => {})
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$modal
        .confirm(this.$t('ui.logininforClearConfirm'))
        .then(function () {
          return cleanLogininfor()
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess(this.$t('ui.clearedSuccess'))
        })
        .catch(() => {})
    },
    /** 解锁按钮操作 */
    handleUnlock() {
      const username = this.selectName
      this.$modal
        .confirm('是否确认解锁用户"' + username + '"数据项?')
        .then(function () {
          return unlockLogininfor(username)
        })
        .then(() => {
          this.$modal.msgSuccess('用户解锁成功')
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$modal
        .confirm(this.$t('ui.logininforExportConfirm'))
        .then(() => {
          this.exportLoading = true
          // return exportLogininfor(queryParams)
        })
        .then(response => {
          this.$download.name(response.msg)
          this.exportLoading = false
        })
        .catch(() => {})
    }
  }
}
</script>
