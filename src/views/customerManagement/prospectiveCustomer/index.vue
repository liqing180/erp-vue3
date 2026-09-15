<template>
  <div class="app-container">
    <search-form
      ref="searchForm"
      :value="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :topShowCount="1"
      :isBtn="true"
      :showCustom="false"
      @updateSearchData="updateSearchData"
      v-show="showSearch"
    >
    </search-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          v-hasPermi="['customerManagement:prospectiveCustomer:add']"
          icon="Plus"
          @click="handleAdd"
          size="small"
          >{{ $t('uiBtn.add') }}</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="primary"
          v-hasPermi="['customerManagement:prospectiveCustomer:transfer']"
          @click="handleAssignTo"
          size="small"
          :disabled="ids.length <= 0"
          >{{ $t('menu.transfer') }}</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="info"
          icon="Upload"
          size="small"
          @click="handleImport"
          v-hasPermi="['customerManagement:prospectiveCustomer:import']"
          >{{ $t('uiBtn.import') }}</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="Download"
          size="small"
          :loading="exportLoading"
          @click="openExport"
          v-hasPermi="['customerManagement:prospectiveCustomer:export']"
          >{{ $t('uiBtn.export') }}</el-button
        >
      </el-col>
      <right-toolbar
        :saveKey="saveKey"
        v-model:showSearch="showSearch"
        @queryTable="queryTable"
        :columns="configColumn"
      ></right-toolbar>
    </el-row>

    <el-table
      border
      ref="tables"
      :row-class-name="tableRowClassName"
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-dblclick="handleUpdate"
    >
      <el-table-column
        v-if="
          checkPermi([
            'customerManagement:prospectiveCustomer:assignTo',
            'customerManagement:prospectiveCustomer:export'
          ])
        "
        type="selection"
        width="50"
        align="center"
        :selectable="selectable"
      />
      <el-table-column
        type="index"
        :label="$t('ui.sn')"
        width="60"
        fixed="left"
        align="center"
      >
        <template #default="scope">
          <span>{{
            scope.$index + (queryParams.pageNum - 1) * queryParams.pageSize + 1
          }}</span>
        </template>
      </el-table-column>
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
          <template v-else-if="item.prop === 'createdTime'">{{
            parseTime(scope.row.createdTime, fmtForYmdhms)
          }}</template>
          <template v-else-if="item.prop === 'modifiedTime'">{{
            parseTime(scope.row.modifiedTime, fmtForYmdhms)
          }}</template>
          <dict-tag
            v-else-if="item.prop === 'sex'"
            :options="sys_user_sex"
            :value="scope.row[item.prop]"
          />
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
    <!-- 导入 -->
    <ImportDlg
      ref="importDlg"
      :importOptions="importOptions"
      @onSuccess="getList"
    />

    <!-- 指派 -->
    <assignDlg ref="assignDlg" @onSuccess="getList" />

    <ExportDlg
      ref="ExportDlgRef"
      :loading="exportLoading"
      @export="handleExport"
    />
  </div>
</template>

<script>
import {
  queryCustomerList,
  querySearchList,
  exportData
} from '@/api/customerManagement/customer'
import pageMixin from '@/mixins/tableMinx'
import assignDlg from '@/views/customerManagement/prospectiveCustomer/components/assignDlg'
export default {
  name: 'ProspectiveCustomer',
  mixins: [pageMixin],
  components: {
    assignDlg
  },
  data() {
    const vm = this

    return {
      range: [],
      saveKey: '1',
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      selectList: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      tableList: [],
      // 默认密码
      initPassword: undefined,

      // 导入
      importOptions: {
        // 下载模板
        downFileUrl: '/customer/downTemplateProspective',
        // 上传校验
        uploadUrl:
          import.meta.env.VITE_APP_BASE_API +
          '/customer/checkImportDataProspective',
        // 提交导入
        importUrl: '/customer/importDataProspective',
        // 下载文件名
        fileName: 'Customer'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: undefined,
        status: undefined
      },
      searchData: [
        {
          name: 'condition',
          type: 'InputEle',
          placeholder: `${vm.$t('customer.prospectiveCustomerName')} / ${vm.$t(
            'customer.code'
          )}`
        },
        {
          name: 'customerSourceList',
          label: vm.$t('customer.customerSource'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'customerSource',
          selectLabel: 'customerSourceShowStr',
          selectData: []
        },
        {
          name: 'labelIdList',
          label: vm.$t('customer.label'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'labelId',
          selectLabel: 'labelName',
          selectData: []
        },
        {
          name: 'countryIdList',
          label: vm.$t('ui.country'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'countryId',
          selectLabel: 'country',
          selectData: []
        },
        {
          name: 'tierIdList',
          label: vm.$t('customer.customerTier'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'tierId',
          selectLabel: 'tierName',
          selectData: []
        },
        {
          name: 'dateRange',
          label: vm.$t('ui.createdTime'),
          type: 'DatePickerEleShortcuts',
          startDate: 'startDateCreatedTime',
          endDate: 'endDateCreatedTime'
        }
      ],
      // 列信息
      columns: [
        {
          prop: 'customerName',
          label: vm.$t('customer.prospectiveCustomerName'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom',
          fixed: true
        },
        {
          prop: 'customerCode',
          label: vm.$t('customer.prospectiveCustomerCode'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'customerSource',
          propBy: 'customerSourceShowStr',
          label: vm.$t('customer.customerSource'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'tierNames',
          label: vm.$t('customer.customerTier'),
          minWidth: 140,
          visible: true,
          tooltip: true
        },

        {
          prop: 'mobilePhone',
          label: vm.$t('customer.phone'),
          minWidth: 140,
          visible: true,
          tooltip: true,
          sortable: 'custom'
        },

        {
          prop: 'email',
          label: vm.$t('ui.email'),
          minWidth: 180,
          visible: true,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'salesGroupName',
          label: vm.$t('customer.salesGroup'),
          visible: true,
          minWidth: 140,
          tooltip: true
        },
        {
          prop: 'createdBy',
          label: vm.$t('ui.createdBy'),
          minWidth: 160,
          visible: true,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'createdTime',
          label: vm.$t('ui.createdTime'),
          width: 160,
          visible: true,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'modifiedBy',
          label: vm.$t('ui.modifiedBy'),
          minWidth: 140,
          visible: true,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'modifiedTime',
          label: vm.$t('ui.modifiedTime'),
          minWidth: 170,
          visible: true,
          tooltip: true,
          sortable: 'custom'
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
    editAuth() {
      return this.checkPermi(['customerManagement:prospectiveCustomer:edit'])
    }
  },
  created() {
    // const { proxy } = getCurrentInstance()
    // 组合式<script setup> 页面使用 proxy.useDict() , vue2 写法直接使用 this.useDict()
    this.createdInitTimer = Date.now()
    // this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.initQueryParams()
    this.getList()
    /* this.getConfigKey('sys.user.initPassword').then((response) => {
      this.initPassword = response.msg
    }) */
  },
  activated() {
    if (Date.now() - this.createdInitTimer < 1000) return
    this.getList()
  },
  methods: {
    initQueryParams() {
      const { pageSize } = this.queryParams
      this.queryParams = { pageNum: 1, pageSize }
      const end = this.appointTime(Date.now(), '23:59:59')
      const startTimer =
        this.appointTime(Date.now(), '00:00:00') - 3600 * 1000 * 24 * 179
      this.queryParams['dateRange'] = [startTimer, end]
      this.queryParams['startDateCreatedTime'] = startTimer
      this.queryParams['endDateCreatedTime'] = end

      this.searchFormKey = Date.now()
    },
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      for (const item of this.ids.values()) {
        if (item === row.customerId) {
          color = 'table-SelectedRow-bgcolor'
        }
      }
      return color
    },

    selectable(row, rowIndex) {
      if (row.adminFlag === 1) {
        return false // 禁用
      } else {
        return true // 不禁用
      }
    },

    /** 查询用户列表 */
    getList() {
      this.querySearchList()
      this.loading = true
      // const params = this.$trimOfObj(this.queryParams)
      let params = { ...this.queryParams }
      params = this.$trimOfObj(params)
      params.customerType = '1'
      queryCustomerList(params).then(response => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false

        const idList = response.idList || []
        sessionStorage.setItem(
          'page1CustomerIdList',
          JSON.stringify(idList) || []
        )

        this.$$getColumnContentMaxWidth(this.columns, this.tableList)
      })
    },
    querySearchList() {
      querySearchList({ customerType: '1' }).then(res => {
        const data = res.data || {}
        this.searchData.forEach(item => {
          if (item.name === 'labelIdList') {
            item.selectData = data.labelList || []
          }
          if (item.name === 'countryIdList') {
            item.selectData = data.customerCountryList || []
          }
          if (item.name === 'customerSourceList') {
            item.selectData = data.customerSourceList || []
          }
          if (item.name === 'tierIdList') {
            item.selectData = data.tierList || []
          }
        })
      })
    },
    /** 搜索 */
    handleSearchForm(query) {
      const param = this.$trimOfObj(query)
      const { pageSize } = this.queryParams
      this.queryParams = { ...param, pageSize }
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置 */
    resetSearchForm() {
      this.initQueryParams()
      this.$refs.tables.clearSort()
      this.getList()
    },
    updateSearchData(e) {
      if (e.childType === 'select') {
        this.searchData[e.index].selectId = e.value
        this.searchData[e.index].date = []
      } else {
        this.searchData[e.index].date = e.value
      }
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.customerId)
      this.selectList = [...selection]
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({
        path: '/customerManagement/addProspectiveCustomer',
        query: {
          timeId: Date.now()
        }
      })
    },
    // 指派
    handleAssignTo() {
      /* const flag = this.selectList.some(x => x.isCanAssignTo !== '1')
      if (flag) {
        this.$message.error(this.$t('customer.notAssign'))
        return
      } */
      this.$refs.assignDlg.open(this.ids)
    },

    /** 修改按钮操作 */
    handleUpdate(row, column) {
      if (column && column.type === 'selection') {
        return
      }
      this.$router.push({
        path: '/customerManagement/viewProspectiveCustomer',
        query: {
          id: row.customerId,
          timeId: Date.now()
        }
      })
    },

    /** 导出按钮操作 */
    openExport() {
      this.$refs.ExportDlgRef.open()
    },
    handleExport(data) {
      const vm = this
      const { exportType } = data
      let params = this.addDateRange(this.queryParams)
      params = JSON.parse(JSON.stringify(params))
      params = this.$trimOfObj(params)
      params.exportType = exportType
      params.customerType = '1'

      if (exportType === 2) {
        params.exportIdList = vm.tableList.map(item => item.customerId)
      }
      if (exportType === 3) {
        params.exportIdList = vm.ids
      }
      vm.exportLoading = true
      exportData(params)
        .then(response => {
          vm.$download.name(response.msg)
          vm.exportLoading = false
          vm.$refs.ExportDlgRef.hide()
          vm.$modal.msgSuccess(vm.$t('ui.exportSuccess'))
        })
        .catch(() => {
          vm.exportLoading = false
        })
    },
    /** 导入按钮操作 */
    handleImport() {
      this.$refs.importDlg.show()
    }
  }
}
</script>
