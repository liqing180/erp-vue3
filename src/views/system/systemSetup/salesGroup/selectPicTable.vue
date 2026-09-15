<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('ui.user')"
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

    <el-table
      border
      :row-class-name="tableRowClassName"
      ref="tables"
      :data="userList"
      @row-click="handleRowClick"
      @select="handleSelectionChange"
      @select-all="handleSelectAll"
      @sort-change="handleSortChange"
      :max-height="tableMaxHeight"
      v-loading="loading"
    >
      <el-table-column
        type="selection"
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
        :min-width="item.minWidth"
        :show-overflow-tooltip="item.tooltip"
        :fixed="item.fixed"
        :sortable="item.sortable"
        :align="item.align || 'left'"
        header-align="center"
      >
        <template v-slot="scope">
          <template v-if="item.prop === 'isActive'">
            <el-tag v-if="scope.row.isActive === '1'">{{
              $t('uiBtn.active')
            }}</el-tag>
            <el-tag v-if="scope.row.isActive === '0'" type="danger">{{
              $t('uiBtn.inactive')
            }}</el-tag>
          </template>
          <dict-tag
            v-else-if="item.prop === 'status'"
            :options="user_status"
            :value="scope.row[item.prop]"
          />
          <template v-else>{{ scope.row[item.prop] }}</template>
        </template>
      </el-table-column>
    </el-table>

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
          >{{ $t('uiBtn.add') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { querySalesGroupCanSelectUserList } from '@/api/system/systemSetup/salesGroup'
import pageMixin from '@/mixins/tableMinx'
// import searchForm from '@/components/Common/searchForm/Index.vue'
export default {
  mixins: [pageMixin],
  // components: { searchForm },
  props: {
    topDepartmentId: {
      type: [Number, String]
    }
  },
  data() {
    const vm = this
    return {
      user_status: [],
      rowIdKey: 'userId',
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
          prop: 'employeeNo',
          label: this.$t('organization.employeeNo'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'userName',
          label: this.$t('organization.userId'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'nickName',
          label: this.$t('ui.userName'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'departmentNames',
          label: this.$t('ui.dept'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'postName',
          label: this.$t('ui.position'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'email',
          label: this.$t('organization.email'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'mobilePhone',
          label: this.$t('organization.mobilePhone'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'status',
          label: this.$t('organization.status'),
          visible: true,
          minWidth: 170,
          tooltip: true
        }
      ],
      searchData: [
        {
          name: 'condition',
          placeholder: `${this.$t('organization.userId')} / ${this.$t(
            'ui.userName1'
          )} / ${this.$t('organization.employeeNo')}`,
          type: 'InputEle'
        }
      ],
      /* 已经选择的联系人Id(过滤) */
      alreadySelectUserIdList: []
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
    const { user_status } = this.useDict('user_status')
    this.user_status = user_status || []
  },
  methods: {
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
    handleAdd(alreadySelectUserIdList) {
      this.alreadySelectUserIdList = alreadySelectUserIdList || []
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
    handleRowClick(row) {
      const index = this.selected.findIndex(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      const isSelected = index > -1
      if (isSelected) {
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
      params.alreadySelectUserIdList = this.alreadySelectUserIdList
      params.topDepartmentId = this.topDepartmentId
      querySalesGroupCanSelectUserList(params).then(res => {
        this.total = res.total
        this.loading = false
        const list = res.rows || []
        this.userList = list.map(item => {
          delete item.remarks
          return item
        })
        this.$nextTick(() => {
          this.selected.forEach(row => {
            this.userList.forEach(item => {
              if (row[this.rowIdKey] === item[this.rowIdKey]) {
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
      if (this.btnLoading) {
        return
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 500)
      this.$emit('select', this.selected)
      this.cancel()
    }
  },
  emits: ['select']
}
</script>
