<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('menu.addActivity')"
    v-model="visible"
    width="1100px"
    top="5vh"
    append-to-body
    @closed="closed"
  >
    <search-form
      ref="searchForm"
      :value="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :showMenu="false"
    >
      <right-toolbar
        :saveKey="saveKey"
        :savePath="savePath"
        :showRefreshBtn="true"
        @queryTable="queryTable"
        :columns="configColumn"
      ></right-toolbar>
    </search-form>

    <el-row>
      <el-table
        border
        :row-class-name="tableRowClassName"
        ref="tables"
        :data="userList"
        @select="handleSelectionChange"
        @select-all="handleSelectAll"
        @sort-change="handleSortChange"
        :max-height="tableMaxHeight"
        v-loading="loading"
        @row-click="handleRowClick"
        :header-cell-class-name="cellClass"
      >
        <el-table-column
          type="selection"
          :selectable="selectable"
          align="center"
          width="55"
        ></el-table-column>
        <el-table-column
          type="index"
          :label="$t('ui.sn')"
          width="60"
          fixed="left"
          align="center"
        >
          <template v-slot="scope">
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
          <template v-slot:header="{ column }">
            <span v-if="item.prop === 'percentage'">
              <span style="color: #ff4949; margin-right: 4px">*</span
              >{{ column.label }}
            </span>
            <span v-else>{{ column.label }}</span>
          </template>
          <template v-slot="scope">
            <template v-if="item.prop === 'isActive'">
              <el-tag v-if="scope.row.isActive === '1'">{{
                $t('uiBtn.active')
              }}</el-tag>
              <el-tag v-if="scope.row.isActive === '0'" type="danger">{{
                $t('uiBtn.inactive')
              }}</el-tag>
            </template>
            <template v-else-if="item.prop === 'percentage'">
              <el-input-number
                v-if="plantIdList.includes(scope.row[rowIdKey])"
                style="width: 98%"
                v-model="scope.row.percentage"
                controls-position="right"
                :precision="0"
                :min="1"
                :max="100"
                @change="percentageChange(scope.row)"
              />
            </template>
            <template v-else-if="item.prop === 'required'">
              <el-switch
                v-model="scope.row.required"
                active-value="1"
                inactive-value="0"
                v-if="plantIdList.includes(scope.row[rowIdKey])"
                @change="percentageChange(scope.row)"
              ></el-switch>
            </template>
            <template v-else-if="item.prop === 'allowRepeat'">
              <el-switch
                v-model="scope.row.allowRepeat"
                active-value="1"
                inactive-value="0"
                v-if="plantIdList.includes(scope.row[rowIdKey])"
                @change="percentageChange(scope.row)"
              ></el-switch>
            </template>
            <template v-else>{{
              scope.row[item.propBy || item.prop]
            }}</template>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <pagination
      :saveKey="saveKey"
      :savePath="savePath"
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="cancel">{{ $t('uiBtn.back') }}</el-button>
        <el-button
          :disabled="selected.length <= 0"
          type="primary"
          @click="handleSelectUser"
          >{{ $t('uiBtn.save') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { queryActivityList } from '@/api/system/systemSetup/activity'
import pageMixin from '@/mixins/tableMinx'
export default {
  mixins: [pageMixin],
  props: {},
  data() {
    const vm = this
    return {
      rowIdKey: 'activityId',
      saveKey: '2',
      savePath: 'AddUser',
      searchFormKey: Date.now(),
      // 遮罩层
      visible: false,
      // 遮罩层
      loading: true,
      // 选中数组值
      selected: [],
      // 总条数
      total: 0,
      // 未授权用户数据
      userList: [],
      // 显示搜索条件
      showSearch: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: undefined
      },
      columns: [
        {
          prop: 'activityType',
          propBy: 'activityTypeShowStr',
          label: vm.$t('SALES.activityType'),
          visible: true,
          minWidth: 170,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'activityName',
          label: vm.$t('SALES.activityName'),
          visible: true,
          sortable: 'custom',
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'activityNo',
          label: vm.$t('SALES.activityCode'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'percentage',
          label: vm.$t('SALES.activityPercentage'),
          visible: true,
          width: 180,
          tooltip: true
        },
        {
          prop: 'required',
          label: vm.$t('SALES.isCompulsory'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'allowRepeat',
          label: vm.$t('SALES.isRepeat'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'description',
          label: vm.$t('ui.description'),
          visible: true,
          minWidth: 200,
          tooltip: true
        }
      ],
      searchData: [
        {
          name: 'condition',
          type: 'InputEle',
          placeholder: `${vm.$t('SALES.activityName')} / ${vm.$t('SALES.code')} / ${vm.$t('ui.description')}`
        }
      ],
      /* 已经选择的联系人Id(过滤) */
      alreadySelectIdList: [],
      activity_type: [],
      addMaxNum: 0
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    plantIdList() {
      return this.selected.map(item => item[this.rowIdKey])
    }
  },
  created() {
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
    const { activity_type } = this.useDict('activity_type')
    this.activity_type = activity_type || []
  },
  methods: {
    cellClass(row) {
      if (row.columnIndex === 0) {
        return 'disableSelection'
      }
    },
    selectable(row, rowIndex) {
      // return false // 禁用
      if (this.selected.length >= this.addMaxNum) {
        if (this.plantIdList.includes(row[this.rowIdKey])) {
          return true
        }
        return false
      }
      return true // 不禁用
    },
    percentageChange(row) {
      const selectItem = this.selected.find(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      if (selectItem) {
        selectItem.percentage = row.percentage
        selectItem.required = row.required
        selectItem.allowRepeat = row.allowRepeat
      }
    },

    tableRowClassName({ row, rowIndex }) {
      let color = ''
      for (const item of this.plantIdList.values()) {
        if (item === row[this.rowIdKey]) {
          color = 'table-SelectedRow-bgcolor'
        }
      }
      return color
    },
    // 显示弹框
    handleAdd(stageIndex, alreadySelectIdList) {
      this.stageIndex = stageIndex
      this.alreadySelectIdList = alreadySelectIdList || []
      this.addMaxNum = 20 - this.alreadySelectIdList.length
      this.selected = []
      this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
      this.getList()
      this.visible = true
    },
    cancel() {
      this.visible = false
    },
    closed() {
      this.resetSearchForm(false)
    },
    handleSelectAll(selection) {
      const vm = this
      if (selection.length) {
        // 去重添加
        const curSelectedIds = this.selected.map(d => d[this.rowIdKey])
        selection.forEach(item => {
          if (!curSelectedIds.includes(item[this.rowIdKey])) {
            vm.selected.push(item)
          }
        })
      } else {
        // 删除table中在selection 中缓存的内容
        const delArr = this.userList.map(item => item[this.rowIdKey])
        vm.selected = vm.selected.filter(
          item => !delArr.includes(item[this.rowIdKey])
        )
      }
    },
    // 有则删除，无则添加
    handleSelectionChange(selection, row) {
      const vm = this
      for (let i = 0; i < vm.selected.length; i++) {
        if (vm.selected[i][this.rowIdKey] === row[this.rowIdKey]) {
          return vm.selected.splice(i, 1)
        }
      }
      vm.selected.push(row)
    },
    handleRowClick(row, column) {
      if (this.selected.length >= this.addMaxNum) {
        if (!this.plantIdList.includes(row[this.rowIdKey])) {
          return
        }
      }

      const index = this.selected.findIndex(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      const isSelected = index > -1
      if (isSelected) {
        if (column) {
          if (column.property === 'percentage') return
          if (column.property === 'required') return
          if (column.property === 'allowRepeat') return
        }
        this.selected.splice(index, 1)
      } else {
        this.selected.push(row)
      }
      this.$refs.tables.toggleRowSelection(row, !isSelected)
    },
    // 查询表数据
    getList() {
      this.loading = true
      let params = { ...this.queryParams }
      params = this.$trimOfObj(params)
      params.alreadySelectActivityIdList = this.alreadySelectIdList
      queryActivityList(params).then(res => {
        this.loading = false
        const list = res.rows || []
        this.userList = list.map(item => {
          item.required = '1'
          item.allowRepeat = '1'
          item.activityTypeShowStr = this.selectDictLabel(
            this.activity_type,
            item.activityType
          )
          return item
        })
        this.$$getColumnContentMaxWidth(this.columns, this.userList)
        this.total = res.total
        this.$nextTick(() => {
          this.selected.forEach(row => {
            this.userList.forEach(item => {
              if (row[this.rowIdKey] === item[this.rowIdKey]) {
                item.percentage = row.percentage
                item.required = row.required
                item.allowRepeat = row.allowRepeat

                this.$refs.tables.toggleRowSelection(item, true)
              }
            })
          })
        })
      })
    },
    /** 搜索 */
    handleSearchForm() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置 */
    resetSearchForm(isGetList = true) {
      const { pageSize } = this.queryParams
      this.queryParams = { pageNum: 1, pageSize }
      this.$refs.tables && this.$refs.tables.clearSort()
      if (isGetList) {
        this.getList()
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.selected = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 选择授权用户操作 */
    handleSelectUser() {
      const isErr = this.selected.find(item => !item.percentage)
      if (isErr) {
        this.$modal.msgError(
          this.$t('ui.commonReqMsg').replace(
            '$1',
            this.$t('SALES.activityPercentage')
          )
        )
        return
      }
      if (this.btnLoading) {
        return
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 500)
      this.$emit('onSuccess', this.stageIndex, this.selected)
      this.cancel()
    }
  }
}
</script>
<style lang="scss">
.disableSelection .el-checkbox {
  display: none !important;
}
</style>
