<template>
  <div class="app-container">
    <el-tabs
      ref="tabsRef"
      type="card"
      :key="'tabs_' + tabsKey"
      v-model="activeName"
      @tab-click="tabClickHandler"
    >
      <template :key="index" v-for="(item, index) in tabs">
        <el-tab-pane size="" :name="item.value">
          <template #label
            ><span>
              <div class="tabs-item-title">
                {{ item.name }}
                <el-badge
                  :max="99"
                  :key="item.value + badgeKey"
                  class="tabs-item-badge"
                  style="margin-left: 3px"
                  :value="item.num"
                />
              </div> </span
          ></template>
        </el-tab-pane>
      </template>
    </el-tabs>
    <search-form
      ref="searchForm"
      v-model="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :showCustom="false"
      :isBtn="true"
      :topShowCount="1"
      @updateSearchData="updateSearchData"
      v-show="showSearch"
    />

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-if="addAuth"
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd"
          >{{ $t('uiBtn.add') }}</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="Download"
          size="small"
          :loading="exportLoading"
          @click="openExport"
          v-if="exportAuth"
          >{{ $t('uiBtn.export') }}</el-button
        >
      </el-col>

      <right-toolbar
        ref="rightToolbar"
        :saveKey="activeName"
        v-model:showSearch="showSearch"
        @queryTable="queryTable"
        :columnsInit="curColumns"
        :columns="configCurColumn"
        @autoRefresh="autoRefresh"
        :refreshTimeSaveKey="'1'"
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
      :max-height="indexTableMaxHeight"
      style="cursor: pointer"
    >
      <el-table-column
        type="selection"
        width="50"
        align="center"
        v-if="exportAuth"
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
        v-for="item in visibleCurColumns"
        :key="item.prop + item.colSortIndex + activeName"
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
          <template v-if="item.prop === 'documentNoListShowStr'">
            <div
              @mouseenter="showPop($event, scope.row)"
              @mouseleave="hidePop($event, scope.row)"
            >
              <div class="primary ellipsis-text">
                {{ scope.row.documentNoListShowStr }}
              </div>
            </div>
          </template>
          <template v-else-if="['salesQuotationNo'].includes(item.prop)">
            <DocumentNoLink
              :showStr="scope.row[item.prop]"
              moduleKey="salesQuotation"
              @click="nav(scope.row, item.prop)"
            />
          </template>
          <template v-else-if="['salesOrderNo'].includes(item.prop)">
            <DocumentNoLink
              :showStr="scope.row[item.prop]"
              moduleKey="salesOrder"
              @click="nav(scope.row, item.prop)"
            />
          </template>
          <template v-else-if="['businessPartnerName'].includes(item.prop)">
            <DocumentNoLink
              :showStr="scope.row[item.prop]"
              moduleKey="businessPartner"
              @click="nav(scope.row, item.prop)"
            />
          </template>
          <template v-else-if="item.prop === 'totalAmount'">
            {{ $numberStr(scope.row.totalAmount, 2) }}
          </template>
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

    <ExportDlg
      ref="ExportDlgRef"
      :loading="exportLoading"
      @export="handleExport"
    />
    <systemOperationLogTableDlg ref="systemOperationLogTableDlg" />

    <ToolTipShowListForFN ref="ToolTipShowList" @clickItem="documentClick" />
  </div>
</template>

<script>
import i18n from '@/lang'
import pageMixin from '@/mixins/tableMinx'
import tableDataMixin from './tableDataMixin'
import locale from '@/views/salesManagement/lang/index'
import ToolTipShowListForFN from '@/components/Common/ToolTipShowList/tableUse.vue'
import {
  queryLabelCount,
  querySearchList,
  querySalesInquiryList,
  querySalesInquiryOperationLog
} from '@/api/salesManagement/salesInquiry'
import systemOperationLogTableDlg from '@/views/components/systemOperationLog/systemOperationLogTableDlg.vue'
export default {
  name: 'SalesInquiry',
  mixins: [pageMixin, tableDataMixin],
  components: { systemOperationLogTableDlg, ToolTipShowListForFN },
  data() {
    return {
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
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: undefined,
        status: undefined
      },
      statusDicts: [],
      approvedStatusDicts: [],
      salesInquiryTypeDicts: [],
      projectTaskStatusDicts: [],
      projectCostStatusDicts: [],
      materialListStatusDicts: [],
      // 请求的时间戳
      queryTime: undefined
    }
  },
  computed: {
    addAuth() {
      return this.checkPermi(['salesManagement:salesInquiry:add'])
    },

    exportAuth() {
      return this.checkPermi(['salesManagement:salesInquiry:export'])
    },
    curColumns() {
      return this.columnsData[this.activeName] || []
    },
    configCurColumn() {
      let arr = [...this.curColumns]
      if (this.tableList.length <= 0) {
        arr = arr.filter(x => x.prop !== 'costProjectCode')
      } else {
        const flag = this.tableList.some(x => x.costProjectCode)
        if (!flag) {
          arr = arr.filter(x => x.prop !== 'costProjectCode')
        }
      }
      function compare(value1, value2) {
        if (value1.colSortIndex < value2.colSortIndex) {
          return -1
        } else if (value1.colSortIndex > value2.colSortIndex) {
          return 1
        } else {
          return 0
        }
      }
      arr.sort(compare)
      return arr
    },
    visibleCurColumns() {
      let arr = this.curColumns.filter(column => column.visible === true)
      if (this.tableList.length <= 0) {
        arr = arr.filter(x => x.prop !== 'costProjectCode')
      } else {
        const flag = this.tableList.some(x => x.costProjectCode)
        if (!flag) {
          arr = arr.filter(x => x.prop !== 'costProjectCode')
        }
      }
      function compare(value1, value2) {
        if (value1.colSortIndex < value2.colSortIndex) {
          return -1
        } else if (value1.colSortIndex > value2.colSortIndex) {
          return 1
        } else {
          return 0
        }
      }
      arr.sort(compare)
      return arr
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  beforeCreate() {
    i18n.global.mergeLocaleMessage('zh', locale.zh)
    i18n.global.mergeLocaleMessage('en', locale.en)
  },
  async created() {
    this.createdInitTimer = Date.now()

    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    // $$initColumnVisible 在 ./tableDataMixin.js 调用了
    const a = this.MyDictDataClass.getDictFn('sales_inquiry_status')
    const b = this.MyDictDataClass.getDictFn('approved_status')
    const c = this.MyDictDataClass.getDictFn('sales_inquiry_type')
    const e1 = this.MyDictDataClass.getDictFn('project_task_status')
    const e2 = this.MyDictDataClass.getDictFn('project_cost_status')
    const e3 = this.MyDictDataClass.getDictFn('material_list_status')
    await Promise.all([a, b, c, e1, e2, e3]).then(res => {
      const res1 = res[0] || {}
      const res2 = res[1] || {}
      const res3 = res[2] || {}
      const res4 = res[3] || {}
      const res5 = res[4] || {}
      const res6 = res[5] || {}
      this.statusDicts = (res1 || []).map(item => {
        return {
          label: item.dictLabel,
          value: item.dictValue
        }
      })
      this.approvedStatusDicts = (res2 || []).map(item => {
        return {
          label: item.dictLabel,
          value: item.dictValue
        }
      })
      this.salesInquiryTypeDicts = (res3 || []).map(item => {
        return {
          label: item.dictLabel,
          value: item.dictValue
        }
      })
      this.projectTaskStatusDicts = (res4 || []).map(item => {
        return {
          label: item.dictLabel,
          value: item.dictValue
        }
      })
      this.projectCostStatusDicts = (res5 || []).map(item => {
        return {
          label: item.dictLabel,
          value: item.dictValue
        }
      })
      this.materialListStatusDicts = (res6 || []).map(item => {
        return {
          label: item.dictLabel,
          value: item.dictValue
        }
      })
    })

    this.searchData0.forEach(item => {
      if (item.name === 'salesInquiryStatusList') {
        item.selectData = this.statusDicts
      } else if (item.name === 'approvedStatusList') {
        item.selectData = this.approvedStatusDicts
      } else if (item.name === 'salesInquiryTypeList') {
        item.selectData = this.salesInquiryTypeDicts.filter(
          x => x.value !== 'Service'
        )
      }
    })
    this.searchData1.forEach(item => {
      if (item.name === 'salesInquiryTypeList') {
        item.selectData = this.salesInquiryTypeDicts.filter(
          x => x.value !== 'Service'
        )
      }
    })
    this.searchData3.forEach(item => {
      if (item.name === 'salesInquiryTypeList') {
        item.selectData = this.salesInquiryTypeDicts.filter(
          x => x.value !== 'Service'
        )
      }
    })
    this.searchData5.forEach(item => {
      if (item.name === 'salesInquiryTypeList') {
        item.selectData = this.salesInquiryTypeDicts.filter(
          x => x.value !== 'Service'
        )
      }
    })
    this.searchData6.forEach(item => {
      if (item.name === 'salesInquiryTypeList') {
        item.selectData = this.salesInquiryTypeDicts.filter(
          x => x.value !== 'Service'
        )
      }
    })

    this.searchData = this.searchData0

    this.initQueryParams()
    this.getList()
  },
  activated() {
    if (Date.now() - this.createdInitTimer < 1000) return
    this.getList()
  },
  methods: {
    showPop(e, row) {
      const list = row.documentMsgList || []
      const params = {
        popoverTitle: this.$t('PURCHASE.DocNo'),
        labelKey: 'documentNo',
        itemClass: 'primary-pointer',
        list
      }
      if (list.length > 0 && this.$refs.ToolTipShowList) {
        this.$refs.ToolTipShowList.showPop(e, params)
      }
    },
    hidePop(e) {
      this.$refs.ToolTipShowList && this.$refs.ToolTipShowList.hidePop(e)
    },
    documentClick(item) {
      if (this.navTime && Date.now() - this.navTime < 1000) return
      this.navTime = Date.now()
      if (item.priceType === '0') {
        this.$router.push({
          path: '/purchaseManagement/viewPurchaseRequisition',
          query: {
            id: item.documentId,
            timeId: Date.now()
          }
        })
      } else if (item.priceType === '1') {
        this.$router.push({
          path: '/purchaseManagement/viewPurchaseQuotation',
          query: {
            id: item.documentId,
            timeId: Date.now()
          }
        })
      } else if (item.priceType === '2') {
        this.$router.push({
          path: '/purchaseManagement/viewPurchaseContract',
          query: {
            id: item.documentId,
            timeId: Date.now()
          }
        })
      }
    },
    initQueryParams(isResetDate = true) {
      const { pageSize, dateRange, startDateCreatedTime, endDateCreatedTime } =
        this.queryParams
      this.queryParams = {
        pageNum: 1,
        pageSize,
        dateRange,
        startDateCreatedTime,
        endDateCreatedTime
      }
      if (isResetDate) {
        const end = this.appointTime(Date.now(), '23:59:59')
        const startTimer =
          this.appointTime(Date.now(), '00:00:00') - 3600 * 1000 * 24 * 179
        this.queryParams.dateRange = [startTimer, end]
        this.queryParams.startDateCreatedTime = startTimer
        this.queryParams.endDateCreatedTime = end
      }

      this.queryParams.selectId = 'conditionForSI'
      this.queryParams.selectId2 = 'createdIdList'
      this.searchData.forEach(item => {
        if (item.name === 'selectAnInputName') {
          item.selectId = 'conditionForSI'
          item.inputVal = ''
        }
        if (item.name === 'SelectAnMultipleSelectName') {
          item.selectId = 'createdIdList'
          item.inputVal = []
        }
      })
    },
    tabClickHandler() {
      if (this.activeName === '0') {
        this.searchData = this.searchData0
      } else if (this.activeName === '1') {
        this.searchData = this.searchData1
      } else if (this.activeName === '2') {
        this.searchData = this.searchData1
      } else if (this.activeName === '3') {
        this.searchData = this.searchData3
      } else if (this.activeName === '4') {
        this.searchData = this.searchData1
      } else if (this.activeName === '5') {
        this.searchData = this.searchData5
      } else if (this.activeName === '8') {
        this.searchData = this.searchData5
      } else if (this.activeName === '6') {
        this.searchData = this.searchData6
      } else {
        this.searchData = this.searchData1
      }
      this.initQueryParams(false)
      this.getList()
    },
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      for (const item of this.ids.values()) {
        if (item === row.salesInquiryId) {
          color = 'table-SelectedRow-bgcolor'
        }
      }

      return color
    },

    selectable(row, rowIndex) {
      return true // 不禁用
    },
    autoRefresh() {
      this.getList({ noLoading: true })
    },
    queryLabelCount() {
      queryLabelCount({}).then(res => {
        const data = res.data || {}
        this.tabs.forEach((item, index) => {
          item.num = data[item.value]
        })
        this.$nextTick(() => {
          this.badgeKey++
        })
      })
    },
    /** 查询用户列表 */
    getList(query) {
      this.$store.dispatch('getSalesTaskCount')
      const timer = Date.now()
      this.queryTime = timer
      this.queryLabelCount()
      this.querySearchList()
      this.loading = true
      if (query && this.$TypeJudge.isObject(query)) {
        if (query.noLoading) {
          this.loading = false
        }
      }
      if (this.$refs.rightToolbar) {
        this.$refs.rightToolbar.autoRefreshSecond = 0
      }
      let params = { ...this.queryParams }
      if (params.inputVal && params.selectId) {
        params[params.selectId] = params.inputVal
      }
      if (params.inputVal2 && params.selectId2) {
        params[params.selectId2] = params.inputVal2
      }
      if (params.departmentIdList && params.departmentIdList.length > 0) {
        params.departmentIdList = params.departmentIdList.map(x => {
          return x[x.length - 1]
        })
      } else {
        params.departmentIdList = undefined
      }
      params.labelType = this.activeName
      params = this.$trimOfObj(params)
      querySalesInquiryList(params).then(response => {
        if (timer !== this.queryTime) return
        const rows = response.rows || []
        rows.forEach(item => {
          item.createdTime = this.parseTime(item.createdTime, this.fmtForYmdhms)
          item.modifiedTime = this.parseTime(
            item.modifiedTime,
            this.fmtForYmdhms
          )
          item.approvedTime = this.parseTime(
            item.approvedTime,
            this.fmtForYmdhms
          )
          item.committedDate = this.parseTime(
            item.committedDate,
            this.fmtForYmd
          )
          item.validity = this.parseTime(item.validity, this.fmtForYmd)
          item.deliveryDate = this.parseTime(item.deliveryDate, this.fmtForYmd)
          item.salesInquiryStatusStr = this.selectDictLabel(
            this.statusDicts,
            item.salesInquiryStatus
          )
          item.approvedStatusStr = this.selectDictLabel(
            this.approvedStatusDicts,
            item.approvedStatus
          )
          item.salesInquiryTypeStr = this.selectDictLabel(
            this.salesInquiryTypeDicts,
            item.salesInquiryType
          )
          item.projectTaskStatusStr = this.selectDictLabel(
            this.projectTaskStatusDicts,
            item.projectTaskStatus
          )
          item.projectCostStatusStr = this.selectDictLabel(
            this.projectCostStatusDicts,
            item.projectCostStatus
          )
          item.materialListStatusStr = this.selectDictLabel(
            this.materialListStatusDicts,
            item.materialListStatus
          )
        })
        this.tableList = rows
        this.loading = false
        this.total = response.total

        this.$$getColumnContentMaxWidth(this.curColumns, this.tableList)
      })
    },
    querySearchList() {
      querySearchList({ labelType: this.activeName }).then(res => {
        const data = res.data || {}
        const incotermList = data.incotermList || []
        const vendorList = data.vendorList || []
        const receiveAddressList = data.receiveAddressList || []

        this.conditionForSIList = (data.conditionForSIList || []).map(item => {
          return {
            value: item,
            label: item
          }
        })
        this.conditionForSQList = (data.conditionForSQList || []).map(item => {
          return {
            value: item,
            label: item
          }
        })
        this.conditionForSOList = (data.conditionForSOList || []).map(item => {
          return {
            value: item,
            label: item
          }
        })

        this.createdList = (data.createdList || []).map(item => {
          return {
            value: item.createdId,
            label: item.createdBy
          }
        })
        this.approvedList = (data.approvedList || []).map(item => {
          return {
            value: item.approvedId,
            label: item.approvedBy
          }
        })
        this.modifiedList = (data.modifiedList || []).map(item => {
          return {
            value: item.modifiedId,
            label: item.modifiedBy
          }
        })
        this.salesPersonList = (data.salesPersonList || []).map(item => {
          return {
            value: item.salesPersonId,
            label: item.salesPersonBy
          }
        })

        const conditionForSIList = (data.conditionForSIList || []).map(item => {
          return {
            value: item,
            label: item
          }
        })
        const departmentList = data.branchCompanyList || []
        this.handle(departmentList)
        this.searchData.forEach(item => {
          if (item.name === 'incotermIdList') {
            item.selectData = incotermList
          } else if (item.name === 'businessPartnerIdList') {
            item.selectData = vendorList
          } else if (item.name === 'receiveAddressList') {
            item.selectData = receiveAddressList
          } else if (item.name === 'conditionForSI') {
            item.fuzzyData = conditionForSIList
          } else if (item.name === 'departmentIdList') {
            item.selectData = departmentList
          }
        })
        this.setFuzzyData()
        this.setCreatedListData()
      })
    },
    handle(data) {
      if (data && data.length > 0) {
        data.forEach(x => {
          x.value = x.branchCompanyId
          x.label = x.branchCompanyName
          if (x.departmentList && x.departmentList.length > 0) {
            x.children = x.departmentList.map(k => {
              return {
                value: k.departmentId,
                label: k.departmentName
              }
            })
          }
        })
      }
    },
    /** 搜索 */
    handleSearchForm() {
      // const param = this.$trimOfObj(query)
      // this.queryParams = { ...param }
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置 */
    resetSearchForm() {
      this.initQueryParams()

      // this.searchFormKey = Date.now()
      this.$refs.tables.clearSort()
      this.getList()
    },
    updateSearchData(e) {
      const item = this.searchData[e.index]

      if (item.name === 'selectAnInputName') {
        if (e.childType === 'all') {
          item.selectId = ''
          item.inputVal = ''
          this.setFuzzyData()
        } else if (e.childType === 'select') {
          item.selectId = e.value
          item.inputVal = ''
          this.setFuzzyData()
        } else {
          item.inputVal = e.value || ''
        }
      } else if (item.name === 'SelectAnMultipleSelectName') {
        if (e.childType === 'all') {
          item.selectId = ''
          item.inputVal = []
          this.setCreatedListData()
        } else if (e.childType === 'select') {
          item.selectId = e.value
          item.inputVal = []
          this.setCreatedListData()
        } else {
          item.inputVal = e.value || []
        }
      }
    },
    setFuzzyData() {
      this.searchData.forEach(item => {
        if (item.name === 'selectAnInputName') {
          if (item.selectId === 'conditionForSI') {
            item.fuzzyData = this.conditionForSIList
          } else if (item.selectId === 'conditionForSQ') {
            item.fuzzyData = this.conditionForSQList
          } else if (item.selectId === 'conditionForSO') {
            item.fuzzyData = this.conditionForSOList
          } else {
            item.fuzzyData = []
          }
        }
      })
    },
    setCreatedListData() {
      this.searchData.forEach(item => {
        if (item.name === 'SelectAnMultipleSelectName') {
          if (item.selectId === 'createdIdList') {
            item.selectData2 = this.createdList
          } else if (item.selectId === 'approvedIdList') {
            item.selectData2 = this.approvedList
          } else if (item.selectId === 'modifiedIdList') {
            item.selectData2 = this.modifiedList
          } else if (item.selectId === 'salesPersonIdList') {
            item.selectData2 = this.salesPersonList
          } else {
            item.selectData2 = []
          }
        }
      })
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.salesInquiryId)
      this.selectList = [...selection]
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({
        path: '/salesManagement/addSalesInquiry',
        query: {
          timeId: Date.now()
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row, column) {
      if (column && column.type === 'selection') {
        return
      }
      this.$router.push({
        path: '/salesManagement/editSalesInquiry',
        query: {
          id: row.salesInquiryId,
          timeId: Date.now()
        }
      })
    },

    nav(row, type) {
      if (this.navTime && Date.now() - this.navTime < 1000) return
      this.navTime = Date.now()
      if (type === 'salesQuotationNo') {
        this.$router.push({
          path: '/salesManagement/editSalesQuotation',
          query: {
            // id: row.salesQuotationMainId,
            // timeId: Date.now()
            id: row.salesQuotationMainId,
            timeId: Date.now(),
            backType: '2'
          }
        })
      }
      if (type === 'salesOrderNo') {
        this.$router.push({
          path: '/salesManagement/viewSalesOrder',
          query: {
            id: row.salesOrderId,
            timeId: Date.now()
          }
        })
      }
      if (type === 'businessPartnerName') {
        this.$router.push({
          path: '/businessPartner/viewBusinessPartner',
          query: {
            id: row.businessPartnerId,
            timeId: Date.now()
          }
        })
      }
    },

    /* 查看操作日志 */
    handleOperationLog(row) {
      this.$refs.systemOperationLogTableDlg.handleOpen(
        querySalesInquiryOperationLog,
        {
          salesInquiryId: row.salesInquiryId
        }
      )
    },
    /** 导出按钮操作 */
    /** 导出按钮操作 */
    openExport() {
      this.$refs.ExportDlgRef.open()
    },
    handleExport(data) {
      const vm = this
      const { exportType } = data
      let params = { ...this.queryParams }
      params = JSON.parse(JSON.stringify(params))
      if (params.inputVal && params.selectId) {
        params[params.selectId] = params.inputVal
      }
      if (params.inputVal2 && params.selectId2) {
        params[params.selectId2] = params.inputVal2
      }
      params = this.$trimOfObj(params)
      params.labelType = this.activeName
      params.exportType = exportType
      if (params.departmentIdList && params.departmentIdList.length > 0) {
        params.departmentIdList = params.departmentIdList.map(x => {
          return x[x.length - 1]
        })
      } else {
        params.departmentIdList = undefined
      }
      if (exportType === 2) {
        params.exportIdList = vm.tableList.map(item => item.salesInquiryId)
      }
      if (exportType === 3) {
        params.exportIdList = vm.ids
      }
      params.exportFields = this.getTablePropListForSort(this.visibleCurColumns)

      vm.exportLoading = true
      this.$importOrExportDownFile(
        '/sales/salesInquiry/export',
        params,
        `${this.getFileNameDate('Sales Inquiry')}.xlsx`
      )
        .then(res => {
          vm.exportLoading = false
          vm.$refs.ExportDlgRef.hide()
          vm.$modal.msgSuccess(vm.$t('ui.exportSuccess'))
        })
        .catch(() => {
          vm.exportLoading = false
        })
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
.flexSb {
  display: flex;
  justify-content: space-between;
}
.flexCen {
  display: flex;
  justify-content: center;
}
</style>
