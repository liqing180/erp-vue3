<template>
  <div class="app-container">
    <el-tabs v-model="activeName" type="card" @tab-change="tabChange">
      <el-tab-pane v-for="item in tabs" :key="item.value" :name="item.value">
        <template #label>
          <span class="pr-tab-label">
            {{ item.name }}
            <el-badge v-if="item.num" :value="item.num" :max="99" />
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <el-card v-show="showSearch" shadow="never" class="mb10">
      <div class="pr-search-grid">
        <el-input
          v-model="queryParams.condition"
          clearable
          :placeholder="`${$t('PURCHASE.projectCode')} / ${$t('ui.productSearch')}`"
          @keyup.enter="search"
          @clear="search"
        />

        <el-select
          v-if="activeName === '0'"
          v-model="queryParams.purchaseRequisiteStatusList"
          multiple
          collapse-tags
          clearable
          :placeholder="$t('ui.status')"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          />
        </el-select>

        <el-select
          v-if="activeName === '0'"
          v-model="queryParams.approvedStatusList"
          multiple
          collapse-tags
          clearable
          :placeholder="$t('ui.processStatus')"
        >
          <el-option
            v-for="item in approvedStatusOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          />
        </el-select>

        <el-select
          v-model="queryParams.receiveAddressNameList"
          multiple
          collapse-tags
          filterable
          clearable
          :placeholder="$t('PURCHASE.deliveryAddress')"
        >
          <el-option
            v-for="item in receiveAddressOptions"
            :key="item.receiveAddressName"
            :label="item.receiveAddressName"
            :value="item.receiveAddressName"
          />
        </el-select>

        <el-cascader
          v-model="queryParams.departmentIdList"
          :options="departmentOptions"
          :props="departmentProps"
          clearable
          collapse-tags
          filterable
          :placeholder="$t('PURCHASE.department')"
        />

        <el-select
          v-model="queryParams.requiredIdList"
          multiple
          collapse-tags
          filterable
          clearable
          :placeholder="$t('PURCHASE.requiredBy')"
        >
          <el-option
            v-for="item in requiredByOptions"
            :key="item.requiredId"
            :label="item.requiredBy"
            :value="item.requiredId"
          />
        </el-select>

        <el-select
          v-model="queryParams.dropShippingList"
          multiple
          collapse-tags
          clearable
          :placeholder="$t('PURCHASE.dropShipping')"
        >
          <el-option :label="$t('uiBtn.active')" value="1" />
          <el-option :label="$t('uiBtn.inactive')" value="0" />
        </el-select>

        <el-date-picker
          v-model="queryParams.dateRange"
          type="daterange"
          value-format="x"
          unlink-panels
          range-separator="-"
          :start-placeholder="$t('ui.startDate')"
          :end-placeholder="$t('ui.endDate')"
          style="width: 100%"
        />

        <div class="pr-search-actions">
          <el-button type="primary" size="small" @click="search">{{ $t('uiBtn.search') }}</el-button>
          <el-button size="small" @click="resetSearch">{{ $t('uiBtn.reset') }}</el-button>
        </div>
      </div>
    </el-card>

    <div class="pr-toolbar mb10">
      <div class="pr-toolbar-left">
        <el-button
          v-hasPermi="['purchaseManagement:purchaseRequisition:add']"
          type="primary"
          size="small"
          @click="handleAdd"
        >
          {{ $t('uiBtn.add') }}
        </el-button>
        <el-button
          v-hasPermi="['purchaseManagement:purchaseRequisition:export']"
          type="warning"
          size="small"
          :loading="exportLoading"
          @click="openExport"
        >
          {{ $t('uiBtn.export') }}
        </el-button>

        <div v-if="showDeliveryFilter" class="pr-delivery-filter">
          <span>{{ $t('PURCHASE.deliveryStatus') }}:</span>
          <el-radio-group v-model="queryParams.deliveryStatus" size="small" @change="deliveryStatusChange">
            <el-radio-button v-for="item in deliveryFilters" :key="item.id" :value="item.id">
              {{ item.name }}<span v-if="item.num"> ({{ item.num }})</span>
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <RightToolbar
        ref="rightToolbar"
        v-model:showSearch="showSearch"
        :columns="columns"
        :save-key="saveKey"
        refresh-time-save-key="1"
        @queryTable="getList"
        @autoRefresh="autoRefresh"
      />
    </div>

    <el-table
      ref="tables"
      v-loading="loading"
      :data="tableList"
      border
      row-key="purchaseRequisiteId"
      :max-height="tableMaxHeight - 80"
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-dblclick="handleUpdate"
    >
      <el-table-column
        v-if="canExport"
        type="selection"
        width="50"
        align="center"
        :selectable="selectable"
      />
      <el-table-column type="index" :label="$t('ui.sn')" width="60" fixed="left" align="center">
        <template #default="scope">
          {{ scope.$index + (queryParams.pageNum - 1) * queryParams.pageSize + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        v-for="item in visibleColumns"
        :key="`${activeName}-${item.prop}-${item.colSortIndex}`"
        :prop="item.prop"
        :label="item.label"
        :min-width="getMinWidth(item) || item.minWidth"
        :width="item.width"
        :fixed="item.fixed"
        :sortable="item.sortable"
        :show-overflow-tooltip="item.tooltip"
        :align="item.align || 'left'"
        header-align="center"
      >
        <template #default="scope">
          <template v-if="item.prop === 'dropShipping'">
            <el-tag v-if="scope.row.dropShipping === '1'">{{ $t('uiBtn.active') }}</el-tag>
            <el-tag v-else-if="scope.row.dropShipping === '0'" type="danger">
              {{ $t('uiBtn.inactive') }}
            </el-tag>
          </template>
          <template v-else>{{ scope.row[item.propBy || item.prop] }}</template>
        </template>
      </el-table-column>
    </el-table>

    <div class="pr-pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 25, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @current-change="getList"
        @size-change="pageSizeChange"
      />
    </div>

    <ExportDlg ref="ExportDlgRef" :loading="exportLoading" @export="handleExport" />
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import locale from '@/views/purchaseManagement/lang'
import MyDictDataClass from '@/utils/dict/myDictDataClass'
import menuKey from '@/config/menuKey'
import { checkPermi } from '@/utils/permission'
import {
  queryCountList,
  queryDeliveryStatusCount,
  queryPurchaseRequisiteList,
  querySearchList
} from '@/api/purchaseManagement/purchaseRequisition'

export default {
  name: 'PurchaseRequisition',
  mixins: [pageMixin],
  data() {
    const columns = [
      this.column('purchaseRequisiteNo', this.$t('PURCHASE.purchaseRequisitionNo'), 200, true, true),
      this.column('requiredType', this.$t('PURCHASE.requiredFrom'), 180, true, true, 'requiredTypeStr'),
      this.column('documentNo', this.$t('PURCHASE.DocNo'), 160, true, true),
      this.column('requiredBy', this.$t('PURCHASE.requiredBy'), 160, true, true),
      this.column('costProjectCode', this.$t('PURCHASE.projectCode'), 170, true, false),
      this.column('branchCompanyDeptName', this.$t('PURCHASE.department'), 190, true, false),
      this.column('purchaseRequisiteStatusShowStr', this.$t('ui.status'), 150, true, true),
      this.column('approvedStatus', this.$t('ui.processStatus'), 150, true, true, 'approvedStatusStr'),
      this.column('productName', this.$t('PURCHASE.productName'), 180, false, false),
      this.column('deliveryDate', this.$t('PURCHASE.requestedReceiptDate'), 160, false, true),
      this.column('receiveAddressName', this.$t('PURCHASE.deliveryAddress'), 180, true, true),
      this.column('dropShipping', this.$t('PURCHASE.dropShipping'), 130, true, true),
      this.column('createdBy', this.$t('ui.createdBy'), 150, true, true),
      this.column('createdTime', this.$t('ui.createdTime'), 170, true, true),
      this.column('modifiedBy', this.$t('ui.modifiedBy'), 150, true, true),
      this.column('modifiedTime', this.$t('ui.modifiedTime'), 170, true, true),
      this.column('approvedBy', this.$t('ui.approvedBy'), 150, true, true),
      this.column('approvedTime', this.$t('ui.approvedTime'), 170, true, true)
    ]

    return {
      saveKey: '1',
      loading: false,
      exportLoading: false,
      showSearch: true,
      activeName: '0',
      total: 0,
      tableList: [],
      selectedRows: [],
      ids: [],
      queryToken: 0,
      statusOptions: [],
      approvedStatusOptions: [],
      receiveAddressOptions: [],
      departmentOptions: [],
      requiredByOptions: [],
      departmentProps: {
        multiple: true,
        emitPath: true,
        value: 'value',
        label: 'label',
        children: 'children'
      },
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: '',
        purchaseRequisiteStatusList: [],
        approvedStatusList: [],
        receiveAddressNameList: [],
        departmentIdList: [],
        requiredIdList: [],
        dropShippingList: [],
        dateRange: [],
        deliveryStatus: '0',
        orderByColumn: undefined,
        isAsc: undefined
      },
      tabs: [
        { name: this.$t('PURCHASE.all'), value: '0', num: 0 },
        { name: this.$t('PURCHASE.open'), value: '1', num: 0 },
        { name: this.$t('PURCHASE.pendApproval'), value: '2', num: 0 },
        { name: this.$t('PURCHASE.pendPurchase'), value: '3', num: 0 },
        { name: this.$t('PURCHASE.allPurchase'), value: '8', num: 0 },
        { name: this.$t('PURCHASE.completed'), value: '9', num: 0 },
        { name: this.$t('PURCHASE.closed'), value: '6', num: 0 },
        { name: this.$t('PURCHASE.cancelled'), value: '7', num: 0 }
      ],
      deliveryFilters: [
        { id: '0', name: this.$t('PURCHASE.all'), value: 'all', num: 0 },
        { id: '2', name: this.$t('PURCHASE.overdue'), value: 'overdue', num: 0 },
        { id: '1', name: this.$t('PURCHASE.dueSoon'), value: 'dueSoon', num: 0 }
      ],
      columns
    }
  },
  computed: {
    visibleColumns() {
      let result = this.columns
        .filter(column => column.visible)
        .sort((a, b) => a.colSortIndex - b.colSortIndex)
      const hasProjectCode = this.tableList.some(row => row.costProjectCode)
      if (!hasProjectCode) result = result.filter(column => column.prop !== 'costProjectCode')
      return result
    },
    showDeliveryFilter() {
      return ['0', '1', '2', '3', '4'].includes(this.activeName)
    },
    canExport() {
      return checkPermi(['purchaseManagement:purchaseRequisition:export'])
    }
  },
  beforeCreate() {
    this.$i18n.mergeLocaleMessage('zh', locale.zh)
    this.$i18n.mergeLocaleMessage('en', locale.en)
  },
  async created() {
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.setDefaultDateRange()
    await this.loadDictionaries()
    await Promise.all([this.getList(), this.loadSearchOptions()])
  },
  activated() {
    if (this.$route.name === 'PurchaseRequisition') {
      this.getList()
      this.loadSearchOptions()
    }
  },
  methods: {
    column(prop, label, minWidth, tooltip = true, sortable = false, propBy) {
      return {
        prop,
        propBy,
        label,
        visible: true,
        minWidth,
        colMinWidth: minWidth,
        tooltip,
        sortable: sortable ? 'custom' : false,
        fixed: prop === 'purchaseRequisiteNo',
        colSortIndex: 0
      }
    },
    async loadDictionaries() {
      const [status, approved] = await Promise.all([
        MyDictDataClass.getDictFn('p_purchase_requisite_status'),
        MyDictDataClass.getDictFn('approved_status')
      ])
      this.statusOptions = status || []
      this.approvedStatusOptions = approved || []
    },
    setDefaultDateRange() {
      const endDate = new Date()
      endDate.setHours(23, 59, 59, 999)
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 179)
      startDate.setHours(0, 0, 0, 0)
      this.queryParams.dateRange = [startDate.getTime(), endDate.getTime()]
    },
    dictLabel(options, value) {
      const item = options.find(option => String(option.dictValue) === String(value))
      return item?.dictLabel || value || ''
    },
    transformDepartments(list) {
      return (list || []).map(branch => ({
        value: branch.branchCompanyId,
        label: branch.branchCompanyName,
        children: (branch.departmentList || []).map(department => ({
          value: department.departmentId,
          label: department.departmentName
        }))
      }))
    },
    async loadSearchOptions() {
      const response = await querySearchList({
        labelType: this.activeName,
        menuPerms: menuKey.PR
      })
      const data = response.data || {}
      this.receiveAddressOptions = data.receiveAddressList || []
      this.departmentOptions = this.transformDepartments(data.branchCompanyList)
      this.requiredByOptions = data.userList || []
    },
    normalizeParams() {
      const params = JSON.parse(JSON.stringify(this.queryParams))
      const dateRange = params.dateRange || []
      params.startDateCreatedTime = dateRange[0] ? Number(dateRange[0]) : undefined
      params.endDateCreatedTime = dateRange[1] ? Number(dateRange[1]) : undefined
      delete params.dateRange
      params.departmentIdList = (params.departmentIdList || []).map(path =>
        Array.isArray(path) ? path[path.length - 1] : path
      )
      if (!params.departmentIdList.length) params.departmentIdList = undefined
      if (!params.purchaseRequisiteStatusList?.length) params.purchaseRequisiteStatusList = undefined
      if (!params.approvedStatusList?.length) params.approvedStatusList = undefined
      if (!params.receiveAddressNameList?.length) params.receiveAddressNameList = undefined
      if (!params.requiredIdList?.length) params.requiredIdList = undefined
      if (!params.dropShippingList?.length) params.dropShippingList = undefined
      if (!params.condition) params.condition = undefined
      if (params.orderByColumn === 'purchaseRequisiteStatusShowStr') {
        params.orderByColumn = 'purchaseRequisiteStatus'
      }
      params.labelType = this.activeName
      params.menuPerms = menuKey.PR
      return params
    },
    async getList(options = {}) {
      const token = ++this.queryToken
      if (!options.noLoading) this.loading = true
      this.$refs.rightToolbar && (this.$refs.rightToolbar.autoRefreshSecond = 0)
      this.$store.dispatch('getPurchaseTaskCount')

      const params = this.normalizeParams()
      const requests = [
        queryPurchaseRequisiteList(params),
        queryCountList({ menuPerms: menuKey.PR }),
        queryDeliveryStatusCount(params)
      ]

      try {
        const [listResponse, countResponse, deliveryResponse] = await Promise.all(requests)
        if (token !== this.queryToken) return
        const rows = (listResponse.rows || []).map(row => ({
          ...row,
          createdTime: this.formatDateTime(row.createdTime),
          modifiedTime: this.formatDateTime(row.modifiedTime),
          approvedTime: this.formatDateTime(row.approvedTime),
          deliveryDate: this.formatDate(row.deliveryDate),
          requiredTypeStr: this.dictLabel(this.requiredTypeOptions || [], row.requiredType),
          approvedStatusStr: this.dictLabel(this.approvedStatusOptions, row.approvedStatus)
        }))
        this.tableList = rows
        this.total = listResponse.total || 0
        this.applyCounts(countResponse.data || {})
        this.applyDeliveryCounts(deliveryResponse.data || {})
        this.$$getColumnContentMaxWidth(this.columns, rows)
      } finally {
        if (token === this.queryToken) this.loading = false
      }
    },
    applyCounts(data) {
      this.tabs.forEach(tab => {
        tab.num = Number(data[tab.value] || 0)
      })
    },
    applyDeliveryCounts(data) {
      this.deliveryFilters.forEach(item => {
        item.num = Number(data[item.value] || 0)
      })
    },
    formatDate(value) {
      return value ? this.parseTime(value, this.$store.getters.fmtForYmd) : ''
    },
    formatDateTime(value) {
      return value ? this.parseTime(value, this.$store.getters.fmtForYmdhms) : ''
    },
    async tabChange() {
      const pageSize = this.queryParams.pageSize
      const dateRange = this.queryParams.dateRange
      this.queryParams = {
        pageNum: 1,
        pageSize,
        condition: '',
        purchaseRequisiteStatusList: [],
        approvedStatusList: [],
        receiveAddressNameList: [],
        departmentIdList: [],
        requiredIdList: [],
        dropShippingList: [],
        dateRange,
        deliveryStatus: '0',
        orderByColumn: undefined,
        isAsc: undefined
      }
      await Promise.all([this.getList(), this.loadSearchOptions()])
    },
    deliveryStatusChange() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    search() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetSearch() {
      const pageSize = this.queryParams.pageSize
      this.queryParams = {
        pageNum: 1,
        pageSize,
        condition: '',
        purchaseRequisiteStatusList: [],
        approvedStatusList: [],
        receiveAddressNameList: [],
        departmentIdList: [],
        requiredIdList: [],
        dropShippingList: [],
        dateRange: [],
        deliveryStatus: '0',
        orderByColumn: undefined,
        isAsc: undefined
      }
      this.setDefaultDateRange()
      this.$refs.tables?.clearSort?.()
      this.getList()
    },
    pageSizeChange() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    autoRefresh() {
      this.getList({ noLoading: true })
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.ids = selection.map(row => row.purchaseRequisiteId)
    },
    selectable(row) {
      return row.adminFlag !== 1
    },
    tableRowClassName({ row }) {
      if (row.isWarning === '1') return 'table-warning-bgcolor'
      if (
        this.showDeliveryFilter &&
        ['1', '2'].includes(row.deliveryStatus) &&
        row.requiredType !== '7' &&
        !['6', '7', '8'].includes(row.purchaseRequisiteStatus)
      ) {
        return `row-deliveryStatus-${row.deliveryStatus}`
      }
      if (this.ids.includes(row.purchaseRequisiteId)) return 'table-SelectedRow-bgcolor'
      return ''
    },
    handleAdd() {
      this.$router.push({
        path: '/purchaseManagement/addPurchaseRequisition',
        query: { timeId: Date.now() }
      })
    },
    handleUpdate(row, column) {
      if (column?.type === 'selection') return
      this.$router.push({
        path: '/purchaseManagement/editPurchaseRequisition',
        query: {
          id: row.purchaseRequisiteId,
          timeId: Date.now()
        }
      })
    },
    openExport() {
      this.$refs.ExportDlgRef?.open?.()
    },
    async handleExport(data) {
      const params = this.normalizeParams()
      params.exportType = data.exportType
      if (data.exportType === 2) {
        params.exportIdList = this.tableList.map(row => row.purchaseRequisiteId)
      } else if (data.exportType === 3) {
        params.exportIdList = this.ids
      }
      params.exportFields = this.getTablePropListForSort(this.visibleColumns)
      this.exportLoading = true
      try {
        await this.$importOrExportDownFile(
          '/purchase/purchaseRequisite/export',
          params,
          `${this.getFileNameDate('Purchase Requisition')}.xlsx`
        )
        this.$refs.ExportDlgRef?.hide?.()
        this.$modal.msgSuccess(this.$t('ui.exportSuccess'))
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.pr-tab-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pr-search-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 10px;
  align-items: center;
}

.pr-search-actions {
  display: flex;
  gap: 8px;
}

.pr-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.pr-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.pr-delivery-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.pr-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

@media (max-width: 1400px) {
  .pr-search-grid {
    grid-template-columns: repeat(3, minmax(180px, 1fr));
  }
}
</style>
