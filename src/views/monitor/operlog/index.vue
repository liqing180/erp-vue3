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
          v-hasPermi="['system:operlog:remove']"
          >{{ $t('uiBtn.delete') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="Delete"
          size="small"
          @click="handleClean"
          v-hasPermi="['system:operlog:remove']"
          >{{ $t('uiBtn.clear') }}
        </el-button>
      </el-col>

      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="queryTable"
      ></right-toolbar>
    </el-row>

    <el-table
      border
      ref="tables"
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
      @row-dblclick="handleView"
      :max-height="600"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        :label="$t('ui.operId')"
        align="left"
        prop="operId"
        :min-width="120"
      />
      <el-table-column
        :label="$t('ui.sysModule')"
        align="left"
        prop="title"
        :min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('ui.operationType')"
        align="left"
        prop="businessType"
        :min-width="140"
      >
        <template v-slot="scope">
          <dict-tag :options="sys_oper_type" :value="scope.row.businessType" />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('ui.requestMethod')"
        align="left"
        prop="requestMethod"
        :min-width="140"
      />
      <el-table-column
        :label="$t('ui.operName')"
        align="left"
        prop="operName"
        :min-width="120"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        :min-width="160"
        :label="$t('ui.operIp')"
        align="left"
        prop="operIp"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        :min-width="160"
        :label="$t('ui.dept')"
        align="left"
        prop="departmentName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        :min-width="160"
        :label="$t('ui.operLocation')"
        align="left"
        prop="operLocation"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        :label="$t('ui.businessStatus')"
        align="left"
        prop="status"
        :min-width="160"
      >
        <template v-slot="scope">
          <dict-tag :options="sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('ui.operDate')"
        align="left"
        prop="operTime"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        :min-width="180"
      >
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.operTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('ui.action')"
        align="center"
        class-name="small-padding fixed-width"
        :min-width="100"
        fixed="right"
      >
        <template v-slot="scope">
          <el-button
            size="small"
            link
            type="primary"
            icon="el-icon-view"
            @click="handleView(scope.row, scope.index)"
            v-hasPermi="['system:operlog:query']"
            >{{ $t('ui.detail') }}
          </el-button>
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

    <!-- 操作日志详细 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="$t('ui.operLogDetails')"
      v-model="open"
      width="900px"
      append-to-body
    >
      <el-form ref="form" :model="form" label-width="160px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="`${$t('ui.sysModule')}：`"
              >{{ form.title }} / {{ typeFormat(form) }}</el-form-item
            >
            <el-form-item :label="`${$t('ui.loginInfo')}：`"
              >{{ form.operName }} / {{ form.operIp }} /
              {{ form.operLocation }}</el-form-item
            >
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('ui.operUrl')}：`">{{
              form.operUrl
            }}</el-form-item>
            <el-form-item :label="`${$t('ui.requestMethod')}：`"
              >{{ form.requestMethod }}
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="`${$t('ui.actionMethod')}：`">{{
              form.method
            }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="`${$t('ui.operParam')}：`">
              <div style="width: 100%; word-break: break-all">
                {{ form.operParam }}
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="`${$t('ui.jsonResult')}：`">
              <div style="width: 100%; word-break: break-all">
                {{ form.jsonResult }}
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('ui.businessStatus')}：`">
              <dict-tag :options="sys_common_status" :value="form.status" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('ui.operTime')}：`"
              >{{ parseTime(form.operTime) }}
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              :label="`${$t('ui.errorMsg')}：`"
              v-if="form.status === 1"
              >{{ form.errorMsg }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="open = false">{{ $t('uiBtn.back') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { list, delOperlog, cleanOperlog } from '@/api/monitor/operlog'
import pageMixin from '@/mixins/tableMinx'
export default {
  name: 'Operlog',
  mixins: [pageMixin],
  data() {
    const vm = this
    return {
      sys_oper_type: [],
      sys_common_status: [],
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      tableList: [],
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'operTime', order: 'descending' },
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        title: undefined,
        operName: undefined,
        businessType: undefined,
        status: undefined
      },
      searchData: [
        {
          name: 'title',
          type: 'InputEle',
          placeholder: vm.$t('ui.sysModule')
        },
        {
          name: 'operName',
          label: vm.$t('ui.operName'),
          type: 'InputEle',
          isLine: false
        },
        {
          name: 'businessType',
          label: vm.$t('ui.businessType'),
          type: 'SelectEle',
          selectValue: 'value',
          selectLabel: 'label',
          dict: 'sys_oper_type',
          selectData: []
        },
        {
          name: 'status',
          label: vm.$t('ui.businessStatus'),
          type: 'SelectEle',
          selectValue: 'value',
          selectLabel: 'label',
          dict: 'sys_common_status',
          selectData: []
        },
        {
          name: 'dateRange',
          label: vm.$t('ui.operDate'),
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
    const { sys_oper_type, sys_common_status } = this.useDict(
      'sys_oper_type',
      'sys_common_status'
    )
    this.sys_oper_type = sys_oper_type || []
    this.sys_common_status = sys_common_status || []
    this.getList()
  },
  methods: {
    /** 查询登录日志 */
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
    // 操作日志类型字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.sys_oper_type, row.businessType)
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
      this.ids = selection.map(item => item.operId)
      this.multiple = !selection.length
    },
    /** 排序触发事件 */
    // handleSortChange(column, prop, order) {
    //   this.queryParams.orderByColumn = column.prop
    //   this.queryParams.isAsc = column.order
    //   this.getList()
    // },
    /** 详细按钮操作 */
    handleView(row, column) {
      if (column && column.type === 'selection') {
        return
      }
      this.open = true
      this.form = row
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const operIds = row.operId || this.ids
      const showStr = row.operId ? row.operId : this.ids.join(', ')
      this.$modal
        .confirm(this.$t('ui.operlogDelConfirm').replace('$1', showStr))
        .then(function () {
          return delOperlog(operIds)
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
        .confirm(this.$t('ui.operlogClearConfirm'))
        .then(function () {
          return cleanOperlog()
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess(this.$t('ui.clearedSuccess'))
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$modal
        .confirm(this.$t('ui.operlogExportConfirm'))
        .then(() => {
          this.exportLoading = true
          // return exportOperlog(queryParams)
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
