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
      :customSelectData="customSelectData"
      :showCustom="false"
      operator="OR"
      @updateSearchData="updateSearchData"
      v-show="showSearch"
    >
    </search-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          v-hasPermi="['leads:add']"
          icon="Plus"
          @click="handleAdd"
          size="small"
          >{{ $t('uiBtn.add') }}</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="primary"
          v-hasPermi="['leads:assignTo']"
          @click="handleAssignTo"
          size="small"
          :disabled="ids.length <= 0"
          >{{ $t('menu.assignTo1') }}</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="primary"
          v-hasPermi="['leads:customQuery']"
          icon="Search"
          @click="handleCustomQuery"
          size="small"
          >{{ $t('uiBtn.customQuery') }}</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="info"
          icon="Upload"
          size="small"
          @click="handleImport"
          v-hasPermi="['leads:import']"
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
          v-hasPermi="['leads:export']"
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
        v-if="checkPermi(['leads:assignTo', 'leads:export'])"
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
            v-else-if="item.prop === 'leadCategory'"
            :options="lead_category"
            :value="scope.row[item.prop]"
          />
          <dict-tag
            v-else-if="item.prop === 'leadSource'"
            :options="lead_source"
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

    <!-- 自定义组件 -->
    <CustomSearchDlg
      :customSelectData="customSelectData"
      :handleQuery="handleSearchForm"
      ref="customSearchDlg"
    />
  </div>
</template>

<script>
import { queryLeadList, querySearchList, exportData } from '@/api/leads/leads'
import pageMixin from '@/mixins/tableMinx'
import assignDlg from './components/assignDlg'
import CustomSearchDlg from '@/components/Common/searchFormNew/CustomSearchDlgNew'
export default {
  name: 'Leads',
  mixins: [pageMixin],
  components: {
    assignDlg,
    CustomSearchDlg
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
        downFileUrl: '/crm/lead/downTemplate',
        // 上传校验
        uploadUrl:
          import.meta.env.VITE_APP_BASE_API + '/crm/lead/checkImportData',
        // 提交导入
        importUrl: '/crm/lead/importData',
        // 下载文件名
        fileName: 'Leads'
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
          placeholder: `${vm.$t('customer.leadName')} / ${vm.$t(
            'customer.code'
          )} / ${vm.$t('customer.phone')}`
        },
        {
          name: 'leadSourceList',
          label: vm.$t('customer.leadSource'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: []
        },
        {
          name: 'leadStatusList',
          label: vm.$t('customer.leadStatus'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'value',
          selectLabel: 'label',
          selectData: []
        },
        {
          name: 'labelIdList',
          label: vm.$t('customer.label'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: []
        },
        {
          name: 'dateRange',
          label: vm.$t('ui.createdTime'),
          type: 'DatePickerEleShortcuts',
          startDate: 'startDate',
          endDate: 'endDate'
        },
        {
          name: 'leadCategoryList',
          label: vm.$t('customer.leadCategory'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'value',
          selectLabel: 'label',
          dict: 'lead_category',
          selectData: []
        }
      ],
      // 列信息
      columns: [
        {
          prop: 'leadCode',
          label: vm.$t('customer.leadCode'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom',
          fixed: true
        },
        {
          prop: 'leadName',
          label: vm.$t('customer.leadName'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'leadSourceShowStr',
          label: vm.$t('customer.leadSource'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'leadStatusShowStr',
          label: vm.$t('customer.leadStatus'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'leadCategoryShowStr',
          label: vm.$t('customer.leadCategory'),
          minWidth: 140,
          visible: true,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'labelNames',
          label: vm.$t('customer.label'),
          minWidth: 140,
          visible: true,
          tooltip: true
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
      ],

      lead_status: [],
      lead_category: [],
      lead_source: [],

      // 自定义搜索
      customSelectData: [
        {
          label: vm.$t('customer.leadName'),
          value: 'leadName',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('customer.leadSource'),
          value: 'leadSource',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('customer.phone'),
          value: 'mobilePhone',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('ui.email'),
          value: 'email',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('customer.leadStatus'),
          value: 'leadStatus',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'value',
          selectLabel: 'label',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('customer.companyName'),
          value: 'companyName',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('customer.businessRegNo'),
          value: 'businessRegNo',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('customer.website'),
          value: 'website',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('customer.label'),
          value: 'label',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('customer.customerTier'),
          value: 'tier',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('customer.leadCategory'),
          value: 'leadCategory',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('mapLang.country'),
          value: 'countryId',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('mapLang.provinceState'),
          value: 'provinceState',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('mapLang.cityTown'),
          value: 'cityTown',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('ui.postalCode'),
          value: 'postalCode',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('ui.address'),
          value: 'address',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('ui.contactPersonName'),
          value: 'contactPersonName',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('ui.title'),
          value: 'contactTitle',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('ui.position'),
          value: 'contactPosition',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('ui.mobilePhone'),
          value: 'contactMobilePhone',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('customer.contactPersonEmail'),
          value: 'contactPersonEmail',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('customer.salesGroup'),
          value: 'salesGroupId',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('customer.salesPerson'),
          value: 'salesGroupUserId',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('ui.createdBy'),
          value: 'createdId',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('ui.createdTime'),
          value: 'createdTime',
          type: 'DatePickerEle',
          format: 'timestamp',
          disabled: false,
          startDate: 'startCreatedTime',
          endDate: 'endCreatedTime',
          operator: 'contains'
        },
        {
          label: vm.$t('ui.modifiedBy'),
          value: 'modifiedId',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: [],
          operator: 'equals'
        },
        {
          label: vm.$t('ui.modifiedTime'),
          value: 'modifiedTime',
          type: 'DatePickerEle',
          format: 'timestamp',
          disabled: false,
          startDate: 'startModifiedTime',
          endDate: 'endModifiedTime',
          operator: 'between'
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
      return this.checkPermi(['leads:edit'])
    }
  },
  async created() {
    // const { proxy } = getCurrentInstance()
    // 组合式<script setup> 页面使用 proxy.useDict() , vue2 写法直接使用 this.useDict()
    const { lead_category, lead_status, lead_source } = await this.useDict(
      'lead_category',
      'lead_status',
      'lead_source'
    )
    this.lead_category = lead_category || []
    this.lead_status = lead_status || []
    this.lead_source = lead_source || []
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
      this.queryParams['startDate'] = startTimer
      this.queryParams['endDate'] = end

      this.searchFormKey = Date.now()
    },
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      for (const item of this.ids.values()) {
        if (item === row.leadId) {
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
      queryLeadList(params).then(response => {
        this.tableList = response.rows
        this.total = response.total
        const idList = response.idList || []
        sessionStorage.setItem('pageLeadsIdList', JSON.stringify(idList) || [])
        this.loading = false
        this.$$getColumnContentMaxWidth(this.columns, this.tableList)
      })
    },
    querySearchList() {
      querySearchList({}).then(res => {
        console.log(res)
        const {
          labelList,
          leadSourceList,
          tierList,
          leadCategoryList,
          countryList,
          contactTitleList,
          contactPositionList,
          salesGroupList,
          salesGroupUserList,
          createdList,
          modifiedList
        } = res.data || {}
        this.searchData.forEach(item => {
          if (item.name === 'labelIdList') {
            item.selectData = labelList
          } else if (item.name === 'leadStatusList') {
            item.selectData = this.lead_status
          } else if (item.name === 'leadSourceList') {
            item.selectData = leadSourceList
          }
        })
        this.customSelectData.forEach(item => {
          if (item.value === 'label') {
            item.selectData = labelList
          } else if (item.value === 'leadStatus') {
            item.selectData = this.lead_status
          } else if (item.value === 'leadSource') {
            item.selectData = leadSourceList
          } else if (item.value === 'tier') {
            item.selectData = tierList
          } else if (item.value === 'leadCategory') {
            item.selectData = leadCategoryList
          } else if (item.value === 'countryId') {
            item.selectData = countryList
          } else if (item.value === 'contactTitle') {
            item.selectData = contactTitleList
          } else if (item.value === 'contactPosition') {
            item.selectData = contactPositionList
          } else if (item.value === 'salesGroupId') {
            item.selectData = salesGroupList
          } else if (item.value === 'salesGroupUserId') {
            item.selectData = salesGroupUserList
          } else if (item.value === 'createdId') {
            item.selectData = createdList
          } else if (item.value === 'modifiedId') {
            item.selectData = modifiedList
          }
        })
      })
    },
    /** 搜索 */
    handleSearchForm(query) {
      const param = this.$trimOfObj(query)
      // const { pageSize } = this.queryParams
      this.queryParams = { ...this.queryParams, ...param }
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
      this.ids = selection.map(item => item.leadId)
      this.selectList = [...selection]
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({
        path: '/leads/addLeads',
        query: {
          timeId: Date.now()
        }
      })
    },
    // 指派
    handleAssignTo() {
      const flag = this.selectList.some(x => x.isCanAssignTo !== '1')
      if (flag) {
        this.$message.error(this.$t('customer.notAssign'))
        return
      }
      this.$refs.assignDlg.open(this.ids)
    },
    // 自定义查询
    handleCustomQuery() {
      this.$refs.customSearchDlg.show()
    },
    /** 修改按钮操作 */
    handleUpdate(row, column) {
      if (column && column.type === 'selection') {
        return
      }
      this.$router.push({
        path: '/leads/viewLeads',
        query: {
          id: row.leadId,
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
      const params = { ...vm.queryParams, exportType }

      delete params.pageNum
      delete params.pageSize

      if (exportType === 2) {
        params.exportIdList = vm.tableList.map(item => item.leadId)
      }
      if (exportType === 3) {
        params.exportIdList = vm.ids
      }
      params.exportFields = this.columns.map(item => item.prop)
      let comCustomColumnsProps = []
      if (this.customColumns) {
        comCustomColumnsProps = this.customColumns.map(item => item.prop)
      }
      params.exportFields.push(...comCustomColumnsProps)

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

<style lang="scss" scoped>
.input-switch-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .con-left {
    flex: 1;
    margin-right: 10px;
  }
}
.dept-select {
  :deep(.vue-treeselect--disabled .vue-treeselect__control) {
    background-color: #f5f7fa;
  }
  :deep(.vue-treeselect__single-value) {
    color: #c0c4cc;
  }
}
</style>
