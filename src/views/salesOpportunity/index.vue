<template>
  <div class="app-container">
    <Calendar
      ref="Calendar"
      v-if="false && $store.state.user.userId === '10087984476323840'"
    />

    <search-form
      ref="searchForm"
      :value="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :topShowCount="1"
      :isBtn="true"
      :showCustom="false"
      operator="OR"
      @updateSearchData="updateSearchData"
      v-show="showSearch"
    >
    </search-form>

    <div style="display: flex; justify-content: space-between">
      <el-row :gutter="10" class="mb8 flex-1">
        <el-col :span="1.5">
          <el-button
            type="primary"
            v-hasPermi="['salesOpportunity:add']"
            icon="Plus"
            @click="handleAdd"
            size="small"
            >{{ $t('uiBtn.add') }}</el-button
          >
        </el-col>

        <el-col :span="1.5" v-if="tableType === '2'">
          <el-button
            type="primary"
            v-hasPermi="['salesOpportunity:transfer']"
            @click="handleAssignTo"
            size="small"
            :disabled="ids.length <= 0"
            >{{ $t('menu.transfer') }}</el-button
          >
        </el-col>

        <div class="flex-1 flexEnd mr20">
          <div
            class="table-icon flexCen mr10 table-icon-ver"
            :class="{ 'table-icon-active': tableType === '1' }"
            @click="tableTypeChange('1')"
          >
            <svg-icon
              icon-class="table-ver"
              style="height: 20px; width: 20px; cursor: pointer"
            />
          </div>

          <div
            class="table-icon flexCen table-icon-len"
            :class="{ 'table-icon-active': tableType === '2' }"
            @click="tableTypeChange('2')"
          >
            <svg-icon
              icon-class="table-len"
              style="height: 20px; width: 20px; cursor: pointer"
            />
          </div>
        </div>
      </el-row>

      <right-toolbar
        :saveKey="saveKey"
        v-model:showSearch="showSearch"
        @queryTable="queryTable"
        :columns="configColumn"
        :showSetColumns="tableType === '2'"
      >
      </right-toolbar>
    </div>

    <template v-if="tableType === '2'">
      <el-table
        border
        ref="tables"
        :row-class-name="tableRowClassName"
        v-loading="loading"
        :data="tableList"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-dblclick="handleUpdate"
        :max-height="tableMaxHeight"
      >
        <el-table-column
          v-if="checkPermi(['salesOpportunity:transfer'])"
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
              scope.$index +
              (queryParams.pageNum - 1) * queryParams.pageSize +
              1
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
            <template v-else-if="item.prop === 'estAmount'">
              {{ $numberStr(scope.row.estAmount, 2) }}
            </template>
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

            <template v-else>{{
              scope.row[item.propBy || item.prop]
            }}</template>
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
    </template>

    <template v-else>
      <ul class="card">
        <li
          class="item"
          v-for="(father, fatherIndex) in stageList"
          :key="fatherIndex"
        >
          <div class="top">
            <div class="flex flow1">
              <span
                class="mr10 flow1"
                style="min-width: 0; max-width: 70%"
                :title="
                  fatherIndex === stageList.length - 1
                    ? $t('customer.closedWon')
                    : father.stageName
                "
                >{{
                  fatherIndex === stageList.length - 1
                    ? $t('customer.closedWon')
                    : father.stageName
                }}</span
              >
              <div style="margin-top: 2px">
                <span class="mr10">{{ father.percentage }}%</span>
                <span style="font-size: 12px">{{
                  $t('customer.total').replace('$1', father.quantity)
                }}</span>
              </div>
            </div>
            <div
              class="mt10 flow1"
              :title="
                father.currencySymbol +
                ' ' +
                $numberStr(father.estimateLegalAmount, 2)
              "
            >
              {{ father.currencySymbol }}
              {{ $numberStr(father.estimateLegalAmount, 2) }}
            </div>
          </div>
          <ul
            class="child-card mt10"
            @scroll="scroll($event, father.stageId)"
            v-if="father.stageId && stageObj[father.stageId].list.length > 0"
            v-loading="father.stageId && stageObj[father.stageId].loading"
          >
            <li
              class="child-item pointer"
              v-for="(item, index) in stageObj[father.stageId].list"
              :key="index"
              @click="handleUpdateVer(item, father.stageId)"
            >
              <div class="flow1" :title="item.salesOpportunityName">
                {{ item.salesOpportunityName }}
              </div>
              <div class="flow1 mt5" :title="item.customerName">
                {{ item.customerName }}
              </div>
              <div
                class="flow1 mt5"
                :title="
                  item.currencySymbol + ' ' + $numberStr(item.estAmount, 2)
                "
                v-if="item.estAmount"
              >
                {{ item.currencySymbol }} {{ $numberStr(item.estAmount, 2) }}
              </div>
              <div class="flow1 mt5" :title="item.durationShowStr">
                {{ item.durationShowStr }}
              </div>
            </li>
            <li
              class="flexCen"
              style="padding: 5px 0"
              v-if="
                father.stageId && stageObj[father.stageId].isMore
                  ? stageObj[father.stageId].loading
                  : false
              "
            >
              <div class="loading mr10"></div>
              <div>{{ $t('ui.loading') }}</div>
            </li>
          </ul>
          <div v-else>
            <el-empty :description="$t('ui.noData')" />
          </div>
        </li>
      </ul>
    </template>

    <!-- 导入 -->
    <ImportDlg
      ref="importDlg"
      :importOptions="importOptions"
      @onSuccess="getList"
    />

    <!-- 转移 -->
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
  querySalesOpportunityList,
  querySearchList,
  querySalesOpportunityStageSummary,
  querySalesOpportunityStageSummaryList
} from '@/api/salesOpportunity/salesOpportunity'
import pageMixin from '@/mixins/tableMinx'
import assignDlg from './components/assignDlg'
import Calendar from './Calendar'

export default {
  name: 'SalesOpportunity',
  mixins: [pageMixin],
  components: {
    assignDlg,
    Calendar
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
          placeholder: `${vm.$t('customer.salesOpportunityName')} / ${vm.$t(
            'customer.salesOpportunityNo1'
          )}`
        },
        {
          name: 'conditionForCustomerName',
          label: this.$t('customer.customerName'),
          type: 'AutocompleteEle',
          fuzzyData: [],
          defaultProps: {
            value: 'value',
            label: 'label'
          }
        },
        {
          name: 'stageIdList',
          label: vm.$t('customer.stage'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: []
        },
        {
          name: 'salesOpportunityStatusList',
          label: vm.$t('ui.status'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'value',
          selectLabel: 'label',
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
          name: 'salesGroupIdList',
          label: vm.$t('customer.salesGroup'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'id',
          selectLabel: 'showStr',
          selectData: []
        }
      ],
      // 列信息
      columns: [
        {
          prop: 'salesOpportunityName',
          label: vm.$t('customer.salesOpportunityName'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom',
          fixed: true
        },
        {
          prop: 'salesOpportunityNo',
          label: vm.$t('customer.salesOpportunityNo'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'customerName',
          label: vm.$t('customer.customerName'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'currentStageName',
          label: vm.$t('customer.stage'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'salesOpportunityStatusShowStr',
          label: vm.$t('ui.status'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'estAmount',
          label: vm.$t('customer.estAmount'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          align: 'right',
          sortable: 'custom'
        },
        {
          prop: 'currencyCode',
          label: vm.$t('ui.currency'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'salesGroupName',
          label: vm.$t('customer.salesGroup'),
          minWidth: 140,
          visible: true,
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

      sales_opportunity_status: [],
      lead_category: [],
      lead_source: [],
      noMore: false,
      isScroll: false,
      tableType: this.$cache.local.getJSON('salesOpportunityTableType') || '1',
      stageList: [],
      stageObj: {}
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
      return this.checkPermi(['salesOpportunity:edit'])
    }
  },
  created() {
    // const { proxy } = getCurrentInstance()
    // 组合式<script setup> 页面使用 proxy.useDict() , vue2 写法直接使用 this.useDict()
    const { sales_opportunity_status } = this.useDict(
      'sales_opportunity_status'
    )
    this.sales_opportunity_status = sales_opportunity_status || []
    this.createdInitTimer = Date.now()
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
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
    scroll(e, stageId) {
      const { scrollTop, clientHeight, scrollHeight } = e.target
      // 距离底部 50px 触发加载
      const threshold = 50
      if (scrollHeight - (scrollTop + clientHeight) < threshold) {
        // 当滚动到底部时触发加载更多
        if (this.stageObj[stageId].isMore) {
          if (this.stageObj[stageId].loading) return
          this.stageObj[stageId].pageNum++
          this.querySalesOpportunityStageSummaryList(stageId)
        }
      }
    },
    tableTypeChange(type) {
      if (this.tableType !== type) {
        this.tableType = type
        this.$cache.local.setJSON('salesOpportunityTableType', type)
        this.$$initColumnVisible(this.saveKey, this.columns)
        this.initQueryParams()
        this.getList()
      }
    },
    initQueryParams() {
      const vm = this
      const { pageSize } = this.queryParams
      this.queryParams = { pageNum: 1, pageSize }
      const end = this.appointTime(Date.now(), '23:59:59')
      const startTimer =
        this.appointTime(Date.now(), '00:00:00') - 3600 * 1000 * 24 * 179
      this.queryParams['dateRange'] = [startTimer, end]
      this.queryParams['startDate'] = startTimer
      this.queryParams['endDate'] = end

      if (this.tableType === '2') {
        this.searchData = [
          {
            name: 'condition',
            type: 'InputEle',
            placeholder: `${vm.$t('customer.salesOpportunityName')} / ${vm.$t(
              'customer.salesOpportunityNo1'
            )}`
          },
          {
            name: 'conditionForCustomerName',
            label: this.$t('customer.customerName'),
            type: 'AutocompleteEle',
            fuzzyData: [],
            defaultProps: {
              value: 'value',
              label: 'label'
            }
          },
          {
            name: 'stageIdList',
            label: vm.$t('customer.stage'),
            type: 'MultipleSelectEle',
            width: '200px',
            selectValue: 'id',
            selectLabel: 'showStr',
            selectData: []
          },
          {
            name: 'salesOpportunityStatusList',
            label: vm.$t('ui.status'),
            type: 'MultipleSelectEle',
            width: '200px',
            selectValue: 'value',
            selectLabel: 'label',
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
            name: 'salesGroupIdList',
            label: vm.$t('customer.salesGroup'),
            type: 'MultipleSelectEle',
            width: '200px',
            selectValue: 'id',
            selectLabel: 'showStr',
            selectData: []
          }
        ]
      } else {
        this.searchData = [
          {
            name: 'condition',
            type: 'InputEle',
            placeholder: `${vm.$t('customer.salesOpportunityName')} / ${vm.$t(
              'customer.salesOpportunityNo1'
            )}`
          },
          {
            name: 'conditionForCustomerName',
            label: this.$t('customer.customerName'),
            type: 'AutocompleteEle',
            fuzzyData: [],
            defaultProps: {
              value: 'value',
              label: 'label'
            }
          },
          {
            name: 'salesOpportunityStatusList',
            label: vm.$t('ui.status'),
            type: 'MultipleSelectEle',
            width: '200px',
            selectValue: 'value',
            selectLabel: 'label',
            selectData: []
          },
          {
            name: 'salesGroupIdList',
            label: vm.$t('customer.salesGroup'),
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
          }
        ]
      }

      this.searchFormKey = Date.now()
    },
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      for (const item of this.ids.values()) {
        if (item === row.salesOpportunityId) {
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
      // const params = this.$trimOfObj(this.queryParams)
      let params = { ...this.queryParams }
      params = this.$trimOfObj(params)
      if (this.tableType === '2') {
        this.loading = true
        querySalesOpportunityList(params).then(response => {
          this.tableList = response.rows
          this.total = response.total
          const idList = response.idList || []
          sessionStorage.setItem(
            'pageSalesOpportunityList',
            JSON.stringify(idList) || []
          )
          this.loading = false
          this.$$getColumnContentMaxWidth(this.columns, this.tableList)
        })
      } else {
        querySalesOpportunityStageSummary(params).then(response => {
          this.stageList = response || []
          if (this.stageList && this.stageList.length > 0) {
            this.stageList.forEach((x, i) => {
              if (x.stageId) {
                this.stageObj[x.stageId] = {
                  pageNum: 1,
                  pageSize: 25,
                  stageId: x.stageId,
                  loading: false,
                  isMore: false,
                  list: [],
                  idList: []
                }
              }
            })
            for (let key in this.stageObj) {
              this.querySalesOpportunityStageSummaryList(key)
            }
          }
        })
      }
    },
    // 阶段列数据
    querySalesOpportunityStageSummaryList(stageId) {
      if (this.stageObj[stageId].loading) return
      this.stageObj[stageId].loading = true
      let { pageNum, pageSize, ...params } = this.queryParams
      params = this.$trimOfObj(params)
      querySalesOpportunityStageSummaryList({
        ...params,
        stageId,
        pageNum: this.stageObj[stageId].pageNum,
        pageSize: this.stageObj[stageId].pageSize
      })
        .then(res => {
          const { list } = this.stageObj[stageId]
          const { rows, total, idList } = res || []
          this.stageObj[stageId].list = list.concat(rows)
          this.stageObj[stageId].idList = idList || []
          if (res.pageNum * 1 * res.pageSize >= total * 1) {
            this.stageObj[stageId].isMore = false
          } else {
            this.stageObj[stageId].isMore = true
          }
          this.stageObj[stageId].loading = false
        })
        .catch(() => {
          this.stageObj[stageId].loading = false
        })
    },
    querySearchList() {
      querySearchList({}).then(res => {
        const { salesGroupList, customerList, stageList } = res.data || {}
        const customerNameList = (customerList || []).map(item => {
          return {
            value: item.showStr,
            label: item.showStr
          }
        })
        this.searchData.forEach(item => {
          if (item.name === 'salesOpportunityStatusList') {
            item.selectData = this.sales_opportunity_status
          } else if (item.name === 'salesGroupIdList') {
            item.selectData = salesGroupList
          } else if (item.name === 'conditionForCustomerName') {
            item.fuzzyData = customerNameList
          } else if (item.name === 'stageIdList') {
            item.selectData = stageList
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
      if (this.tableType === '2') {
        this.$refs.tables && this.$refs.tables.clearSort()
      }
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
      this.ids = selection.map(item => item.salesOpportunityId)
      this.selectList = [...selection]
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({
        path: '/salesOpportunity/addSalesOpportunity',
        query: {
          timeId: Date.now()
        }
      })
    },
    // 指派
    handleAssignTo() {
      const flag = this.selectList.some(x => x.isCanTransfer !== '1')
      if (flag) {
        this.$message.error(this.$t('customer.notAssignSalesOpportunity'))
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
      if (row.salesOpportunityStatus === '1') {
        this.$router.push({
          path: '/salesOpportunity/editSalesOpportunity',
          query: {
            id: row.salesOpportunityId,
            timeId: Date.now()
          }
        })
        return
      }
      this.$router.push({
        path: '/salesOpportunity/viewSalesOpportunity',
        query: {
          id: row.salesOpportunityId,
          timeId: Date.now()
        }
      })
    },
    handleUpdateVer(row, stageId) {
      const { idList } = this.stageObj[stageId]
      sessionStorage.setItem(
        'pageSalesOpportunityList',
        JSON.stringify(idList) || []
      )
      if (row.salesOpportunityStatus === '1') {
        this.$router.push({
          path: '/salesOpportunity/editSalesOpportunity',
          query: {
            id: row.salesOpportunityId,
            timeId: Date.now()
          }
        })
        return
      }
      this.$router.push({
        path: '/salesOpportunity/viewSalesOpportunity',
        query: {
          id: row.salesOpportunityId,
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
        params.exportIdList = vm.tableList.map(item => item.salesOpportunityId)
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
.card {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #666;
  font-size: 14px;
  .item {
    min-width: 0;
    flex: 1;
  }
  .top {
    padding: 10px;
    border-top: 2px solid #85dae5;
    background-color: #f3fbfc;
  }
  .item:last-child .top {
    border-top: 2px solid #85e596;
    background-color: #f3fcf4;
  }
  .child-card {
    height: calc(100vh - 400px);
    min-height: 300px;
    overflow: hidden auto;
  }
  .child-item {
    height: 110px;
    padding: 10px;
    margin-top: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .child-item:first-child {
    margin-top: 0;
  }
}
/* 加载动画样式 */
.loading {
  width: 20px;
  height: 20px;
  border: 4px solid #eee; /* 背景色 */
  border-top: 4px solid #409eff; /* 前景色 */
  border-radius: 50%;
  animation: spin 1s linear infinite; /* 旋转动画 */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.table-icon {
  width: 30px;
  height: 30px;
  background-color: #ddd;
}
.table-icon-ver {
  transform: rotate(90deg);
}
.table-icon-active {
  border: 1px solid #409eff;
  background-color: rgba(64, 158, 255, 0.3);
}
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
