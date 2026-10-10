<template>
  <div class="app-container">
    <search-form
      ref="searchForm"
      v-model="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :showCustom="false"
      :topShowCount="1"
      v-show="showSearch"
    />

    <el-row :gutter="10" class="mb8">
      <right-toolbar
        ref="rightToolbar"
        :saveKey="saveKey"
        v-model:showSearch="showSearch"
        @queryTable="queryTable"
        :columns="configColumn"
        :columnsInit="columns"
        :refreshTimeSaveKey="saveKey"
        @autoRefresh="autoRefresh"
      ></right-toolbar>
    </el-row>

    <el-table
      border
      ref="tables"
      class="mt10"
      v-loading="loading"
      :data="tableList"
      :max-height="indexTableMaxHeight"
      @sort-change="handleSortChange"
      @row-dblclick="handleUpdate"
      style="cursor: pointer"
    >
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
          <template v-if="item.prop === 'businessNo'">
            <div
              @mouseenter="showPop1($event, scope.row, scope.$index)"
              @mouseleave="hidePop1($event, scope.row)"
            >
              <div
                class="ellipsis-text"
                :class="{
                  pointer: ![
                    'inventoryInitializationKey',
                    'purchaseContractKey'
                  ].includes(scope.row.moduleKey)
                }"
              >
                <span
                  v-if="
                    $resultOfBoolean(scope.row.businessApprovalStatus) &&
                    Number(scope.row.businessApprovalStatus) !== 1
                  "
                  style="color: #f66c6c"
                  >{{ scope.row[item.prop] }}</span
                >
                <span v-else>{{ scope.row[item.prop] }}</span>
              </div>
            </div>
            <!-- <template>{{ $numberStr(scope.row[item.prop], scope.row.decimalNum) }}</template> -->
          </template>
          <el-tag
            v-else-if="item.prop === 'isTimeOut'"
            :type="scope.row.isTimeOut * 1 === 1 ? '' : 'danger'"
          >
            {{ scope.row.isTimeOut * 1 === 1 ? $t('ui.y') : $t('ui.n') }}
          </el-tag>
          <template v-else-if="item.prop === 'todoUserName'">
            <el-popover
              :key="scope.$index"
              width="auto"
              popper-class="bpm-participant-popover"
              trigger="hover"
              placement="bottom"
              effect="light"
              :show-after="500"
              :disabled="!scope.row.todoUserNamesList"
            >
              <el-scrollbar class="scroll-bar-box">
                <div class="pp-title">
                  {{ $t('bpm.currentParticipants') }}
                </div>
                <div>
                  <div
                    v-for="(list, index) in scope.row.todoUserNamesList || []"
                    :key="index"
                    class="pp-item"
                  >
                    <span
                      >{{ $t('bpm.nameStr') }} {{ Number(index + 1) }} :
                      &nbsp;</span
                    >
                    <span>{{ list }}</span>
                  </div>
                </div>
              </el-scrollbar>
              <template #reference
                ><div style="height: 100%; line-height: 20px">
                  <div
                    style="
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                  >
                    {{ scope.row.todoUserName }}
                  </div>
                </div></template
              >
            </el-popover>
          </template>

          <template v-else>{{ scope.row[item.propBy || item.prop] }}</template>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('ui.action')"
        align="center"
        min-width="180"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template #default="scope">
          <div @dblclick.stop>
            <el-popover :ref="'popover_' + scope.$index" placement="bottom">
              <!-- 1:"Pending",2:"Closed",3:"Cancelled" -->
              <dl class="pop-list-inrow">
                <dt>{{ $t('bpm.moreActions') }}</dt>
                <dd
                  @click.stop.prevent="
                    actionHandle(scope.row, 'returnProcessDlg', scope.$index)
                  "
                  v-hasPermi="['bpm:processPendingAction:return']"
                >
                  {{ $t('bpm.return') }}
                </dd>
                <dd
                  @click.stop.prevent="
                    actionHandle(scope.row, 'transferDlg', scope.$index)
                  "
                  v-hasPermi="[
                    'bpm:toDoTask:transfer',
                    'bpm:processPendingAction:transfer'
                  ]"
                >
                  {{ $t('bpm.transfer') }}
                </dd>
                <dd
                  @click.stop.prevent="
                    actionHandle(scope.row, 'approvalSkipOverDlg', scope.$index)
                  "
                  v-hasPermi="['bpm:processPendingAction:SKipOver']"
                >
                  {{ $t('bpm.SKipOver') }}
                </dd>
                <dd
                  @click.stop.prevent="
                    actionHandle(scope.row, 'cancelDialog', scope.$index)
                  "
                  v-hasPermi="['bpm:processPendingAction:cancel']"
                  v-if="showCancel(scope.row)"
                >
                  {{ $t('bpm.cancel') }}
                </dd>
                <dd
                  @click.stop.prevent="
                    actionHandle(scope.row, 'reminder', scope.$index)
                  "
                  v-hasPermi="['bpm:processPendingAction:reminder']"
                >
                  {{ $t('bpm.reminder') }}
                </dd>
                <dd
                  @click.stop.prevent="
                    actionHandle(scope.row, 'toDo', scope.$index)
                  "
                  v-hasPermi="[
                    'bpm:toDoTask:toDo',
                    'bpm:processPendingAction:toDo'
                  ]"
                >
                  {{ $t('bpm.toDo') }}
                </dd>

                <!-- <dd
                  @click.stop.prevent="actionHandle(scope.row, 'history', scope.$index)"
                  v-hasPermi="['bpm:toDoTask:history']"
                >
                  {{ $t('bpm.history') }}
                </dd> -->
              </dl>
              <template #reference
                ><el-button type="text">{{
                  $t('uiBtn.more')
                }}</el-button></template
              >
            </el-popover>
          </div>
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

    <!-- 回退 -->
    <returnProcessDlg ref="returnProcessDlg" @onSuccess="getList" />
    <!-- 转审 -->
    <transferDlg ref="transferDlg" @onSuccess="getList" />
    <!-- 跳审 -->
    <approvalSkipOverDlg ref="approvalSkipOverDlg" @onSuccess="getList" />
    <!-- 取消 -->
    <cancelDialog ref="cancelDialog" fromType="3" @onSuccess="getList" />
    <!-- 催办提醒 -->
    <reminder ref="reminder" @onSuccess="getList" />
    <!-- 文件号码悬浮 -->
    <documentNoTipShow ref="documentNoTipShow" />
  </div>
</template>

<script>
import i18n from '@/lang'

import pageMixin from '@/mixins/tableMinx'
import locale from '@/views/bpm/lang/index'
import {
  queryMyTodoTaskList,
  querySearchListForMyTodoTask
} from '@/api/bpm/bpm'
import returnProcessDlg from '@/views/bpm/history/returnProcessDlg/returnProcessDlg'
import transferDlg from '@/views/bpm/history/transferDlg/transferDlg'
import approvalSkipOverDlg from '@/views/bpm/history/approvalSkipOverDlg/approvalSkipOverDlg'
import cancelDialog from '@/views/bpm/history/cancelDialog/cancelDialog'
import reminder from '@/views/bpm/history/reminder/reminder'
import documentNoTipShow from '@/views/bpm/documentNoTipShow/documentNoTipShow.vue'

export default {
  name: 'ToDoTask',
  components: {
    returnProcessDlg,
    transferDlg,
    approvalSkipOverDlg,
    cancelDialog,
    reminder,
    documentNoTipShow
  },
  mixins: [pageMixin],
  dicts: ['bpm_task_status'],
  data() {
    const vm = this
    return {
      saveKey: '1',
      searchFormKey: Date.now(),
      // 总条数
      total: 0,
      // 角色表格数据
      tableList: [],
      ids: [],
      // 显示搜索条件
      showSearch: true,
      loading: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25
      },
      columns: [
        {
          prop: 'taskName',
          label: vm.$t('bpm.taskName'),
          minWidth: 200,
          tooltip: true,
          visible: true,
          fixed: true
        },
        {
          prop: 'businessNo',
          label: vm.$t('bpm.documentNo'),
          visible: true,
          sortable: 'custom',
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'ourRef',
          label: vm.$t('bpm.ourRef'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'moduleKeyShowStr',
          label: vm.$t('bpm.module'),
          minWidth: 180,
          sortable: 'custom',
          tooltip: true,
          visible: true
        },
        /* {
          prop: 'taskIdShow',
          label: vm.$t('bpm.instanceId'),
          visible: true,
          tooltip: true,
          minWidth: 160
        }, */
        {
          prop: 'applyUserName',
          label: vm.$t('bpm.initiator'),
          visible: true,
          tooltip: true,
          minWidth: 160
        },
        {
          prop: 'todoUserName',
          label: vm.$t('bpm.currentParticipants'),
          minWidth: 160,
          tooltip: false,
          visible: true
        },
        {
          prop: 'taskStatus',
          propBy: 'taskStatusStr',
          label: vm.$t('bpm.taskStatus'),
          visible: true,
          tooltip: true,
          minWidth: 180
        },
        {
          prop: 'isTimeOut',
          label: vm.$t('bpm.isTimeout'),
          visible: true,
          tooltip: true,
          minWidth: 140
        },
        {
          prop: 'realStartTime',
          label: vm.$t('bpm.startDateTime'),
          sortable: 'custom',
          visible: true,
          minWidth: 180
        },
        {
          prop: 'predictEndTime',
          label: vm.$t('bpm.dueDate'),
          sortable: 'custom',
          visible: true,
          minWidth: 180
        }
      ],
      searchData: [
        {
          name: 'condition',
          type: 'InputEle',
          placeholder: `${vm.$t('bpm.taskName')} / ${vm.$t('bpm.documentNo')}`
        },
        {
          name: 'moduleKeyList',
          label: vm.$t('bpm.module'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'moduleKey',
          selectLabel: 'moduleKeyShowStr',
          filterable: true,
          selectData: []
        },
        {
          name: 'applyUserIdList',
          label: vm.$t('bpm.initiator'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'applyUserId',
          selectLabel: 'applyUserName',
          filterable: true,
          selectData: []
        },
        {
          name: 'isTimeOutList',
          label: vm.$t('bpm.isTimeout'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'value',
          selectLabel: 'label',
          selectData: [
            { label: this.$t('ui.y'), value: '1' },
            { label: this.$t('ui.n'), value: '0' }
          ]
        },
        {
          name: 'dateRange',
          label: vm.$t('ui.createdTime'),
          type: 'DatePickerEleShortcuts',
          format: 'timestamp',
          startDate: 'startDateCreatedTime',
          endDate: 'endDateCreatedTime'
        }
      ]
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        const params = route.params || {}
        if (params.isGetList && route.name === 'ToDoTask') {
          this.createdInitTimer = Date.now()
          if (params.isGetList) {
            const { pageSize } = this.queryParams
            this.queryParams = { pageNum: 1, pageSize, isTimeOutList: [] }
            if (params.isTimeOut === '1') {
              this.queryParams.isTimeOutList = ['1']
            }
            this.$refs.tables && this.$refs.tables.clearSort()
            setTimeout(() => {
              this.getList()
            }, 100)
          }
        }
      },
      immediate: true
    }
  },
  computed: {
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
  created() {
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)

    if (this.createdInitTimer) return
    this.createdInitTimer = Date.now()
    this.getCreateDate()
    this.getList()
    this.initEventBus()
  },
  activated() {
    if (Date.now() - this.createdInitTimer < 2000) return
    this.getList()
  },
  mounted() {},
  beforeUnmount() {
    this.destroyEventBus()
  },
  methods: {
    refreshTaskList() {
      if (!this.loading) this.getList()
    },
    initEventBus() {
      this.destroyEventBus()
      this.$EventBus.on('toDoTaskQueryList', this.refreshTaskList)
    },
    destroyEventBus() {
      this.$EventBus.off('toDoTaskQueryList', this.refreshTaskList)
    },
    showPop1(e, data) {
      const params = {
        businessId: data.businessId,
        moduleKey: data.moduleKey
      }
      if (this.$refs.documentNoTipShow) {
        this.$refs.documentNoTipShow.showPop(e, params)
      }
    },
    hidePop1(e) {
      this.$refs.documentNoTipShow && this.$refs.documentNoTipShow.hidePop(e)
    },
    getCreateDate() {
      const timer = Date.now()
      const endDate = this.appointTime(timer, '23:59:59')
      const startDate = this.appointTime(
        timer - 90 * 60 * 60 * 24 * 1000,
        '00:00:00'
      )
      this.queryParams.dateRange = [startDate, endDate]
      this.queryParams.startDateCreatedTime = startDate
      this.queryParams.endDateCreatedTime = endDate
    },
    // 主列表
    getList(query) {
      let param = { ...this.queryParams }
      param = this.$trimOfObj(param)
      this.loading = true
      if (query && this.$TypeJudge.isObject(query)) {
        if (query.noLoading) {
          this.loading = false
        }
      }
      if (this.$refs.rightToolbar) {
        this.$refs.rightToolbar.autoRefreshSecond = 0
      }
      this.getSearchData()
      this.$store.dispatch('getBPMTaskCount')
      queryMyTodoTaskList(param)
        .then(response => {
          const rows = response.rows || []
          rows.forEach(item => {
            item.realStartTime = this.parseTime(
              item.realStartTime,
              this.fmtForYmdhms
            )
            item.predictEndTime = this.parseTime(
              item.predictEndTime,
              this.fmtForYmdhms
            )
            item.taskStatusStr = this.selectDictLabel(
              this.dict.type.bpm_task_status,
              item.taskStatus
            )
            item.ourRef = (item.bizVariables || {}).ourRef
          })
          this.tableList = rows
          this.loading = false
          this.total = response.total

          this.$$getColumnContentMaxWidth(this.columns, this.tableList)
        })
        .catch(() => {
          this.loading = false
        })
    },
    autoRefresh() {
      this.getList({ noLoading: true })
    },
    onDictReady() {
      this.tableList.forEach(item => {
        item.taskStatusStr = this.selectDictLabel(
          this.dict.type.bpm_task_status,
          item.taskStatus
        )
      })
      this.$$getColumnContentMaxWidth(this.columns, this.tableList)
    },
    // 下拉搜索列表
    getSearchData() {
      querySearchListForMyTodoTask({}).then(res => {
        const { applyUserList, moduleKeyList } = res.data
        this.searchData[1].selectData = moduleKeyList
        this.searchData[2].selectData = applyUserList
      })
    },
    // 时间处理
    handlerDateRange() {},
    /** 搜索 */
    handleSearchForm() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置 */
    resetSearchForm() {
      const { pageSize } = this.queryParams
      this.queryParams = { pageNum: 1, pageSize }
      this.getCreateDate()
      this.$refs.tables.clearSort()
      this.getList()
    },
    handleAdd() {
      this.$router.push({ path: '/system/addTax' })
    },
    handleUpdate(row) {
      const fromSrcPath = encodeURIComponent('/bpm/myTask/toDoTask')
      let moduleKey = row.moduleKey

      if (row.moduleKey === 'inventoryAuditKey') {
        moduleKey = row.moduleKey + row.inventoryAuditType
      }
      this.$router.push({
        path: '/bpm/history',
        query: {
          id: row.businessId,
          taskId: row.taskId,
          taskName: row.taskName,
          instanceId: row.processInstance,
          moduleKey: moduleKey,
          // toDo: 1, history: 2, 管理员todo: 3
          dataType: '1',
          fromSrcPath,
          timeId: Date.now()
        }
      })
    },
    showCancel(row) {
      const { moduleKey } = row
      const moduleKeys = [
        'specialOrderKey',
        'projectTaskKey',
        'projectCostKey',
        'materialListKey',
        'salesQuotationKey',
        'sysBomKey',
        'requestTrialKey'
      ]
      const isShow = moduleKeys.includes(moduleKey)
      if (moduleKey === 'purchaseOrderKey' && row.isCanCancelled === '0') {
        return false
      }
      return !isShow
    },
    actionHandle(row, type, index) {
      this.$refs[`popover_${index}`]?.hide()
      if (type === 'toDo' || type === 'history') {
        const fromSrcPath = encodeURIComponent('/bpm/myTask/toDoTask')
        let moduleKey = row.moduleKey

        if (row.moduleKey === 'inventoryAuditKey') {
          moduleKey = row.moduleKey + row.inventoryAuditType
        }
        const query = {
          id: row.businessId,
          taskId: row.taskId,
          taskName: row.taskName,
          instanceId: row.processInstance,
          moduleKey: moduleKey,
          // toDo: 1, history: 2, 管理员todo: 3
          dataType: '1',
          fromSrcPath,
          timeId: Date.now()
        }

        this.$router.push({
          path: '/bpm/history',
          query
        })
        return
      }
      this.$refs[type].handleOpen(row)
    }
  }
}
</script>

<style scoped lang="scss">
.searchWidth {
  width: 240px;
}
.clearfix {
  content: '';
  clear: both;
  zoom: 1;
}

// 滚动条内部内容的效果
.pp-title {
  padding: 1px 5px;
  line-height: 28px;
  vertical-align: middle;
  color: #000000;
  text-align: left;
  font-weight: bold;
  border: 1px solid #efefef;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  // background-color: #aaaaaa;
}
.pp-item {
  padding: 1px 5px;
  line-height: 28px;
  vertical-align: middle;
  color: #000000;
  text-align: left;
  border-left: 1px solid #efefef;
  border-bottom: 1px solid #efefef;
  border-right: 1px solid #efefef;
}
.pp-item:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.remarks {
  position: relative;
  padding-left: 210px;
  padding-right: 66px;
  margin: 22px 0;
  > label {
    width: 210px;
    position: absolute;
    top: 0;
    left: 0;
  }
}
.reason {
  position: relative;
  padding-left: 180px;
  padding-right: 60px;
  > label {
    width: 180px;
    position: absolute;
    top: 0;
    left: 0;
  }
}
.searchWidth {
  width: 240px;
}

div.clearfix {
  height: 40px;
  line-height: 40px;
  margin-bottom: 16px;
  overflow: hidden;
}

.pop-list-inrow {
  margin: 0;
  padding: 0;
  line-height: 32px;
  border: 1px solid #efefef;
  border-radius: 4px;

  dt {
    padding: 0 12px;
    font-weight: bold;
    text-align: center;
  }
  dd {
    cursor: pointer;
    border-top: 1px solid #efefef;
    padding: 0 12px;
    margin: 0;
    text-align: center;
  }
}
</style>
