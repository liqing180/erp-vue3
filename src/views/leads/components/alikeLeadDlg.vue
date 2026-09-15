<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('menu.leads')"
    v-model="visible"
    width="1100px"
    top="5vh"
    append-to-body
    @closed="closed"
  >
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
      >
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
            <template v-else>{{ scope.row[item.prop] }}</template>
          </template>
        </el-table-column>
        <el-table-column
          v-for="item in customColumns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :min-width="item.minWidth"
          :show-overflow-tooltip="item.tooltip"
          :sortable="item.sortable"
          :align="item.align || 'left'"
          header-align="center"
        >
          <template v-slot="scope">
            <el-switch
              v-if="item.prop === 'isActive'"
              v-model="scope.row.isActive"
              active-value="1"
              inactive-value="0"
              :disabled="true"
            ></el-switch>
            <template v-else-if="item.prop === 'createdTime'">{{
              parseTime(scope.row.createdTime, fmtForYmdhms)
            }}</template>
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
    </el-row>
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="cancel">{{ $t('uiBtn.back') }}</el-button>
        <el-button type="primary" @click="submitForm">{{
          $t('uiBtn.add')
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { queryCanSelectSalesGroupList, saveLead } from '@/api/leads/leads'

import pageMixin from '@/mixins/tableMinx'
// import searchForm from '@/components/Common/searchForm/Index.vue'
export default {
  dicts: ['sys_user_sex'],
  mixins: [pageMixin],
  // components: { searchForm },
  props: {
    customerId: {
      type: [Number, String]
    }
  },
  data() {
    const vm = this
    return {
      rowIdKey: 'departmentId',
      saveKey: '2',
      savePath: 'SalesGroupDlg',
      searchFormKey: Date.now(),
      // 遮罩层
      visible: false,
      // 遮罩层
      loading: false,
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
          prop: 'leadName',
          label: vm.$t('customer.leadName'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'leadCode',
          label: vm.$t('customer.leadCode'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'companyName',
          label: vm.$t('customer.companyName'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'postalCode',
          label: vm.$t('customer.postalCode'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'mobilePhone',
          label: vm.$t('customer.phone'),
          minWidth: 140,
          visible: true,
          tooltip: true
        },

        {
          prop: 'email',
          label: vm.$t('ui.email'),
          minWidth: 180,
          visible: true,
          tooltip: true
        },
        {
          prop: 'businessRegNo',
          label: vm.$t('customer.businessRegNo'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'website',
          label: vm.$t('customer.website'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'contactPersonName',
          label: vm.$t('customer.contactPersonName'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'contactMobilePhone',
          label: vm.$t('customer.contactPersonMobilePhone'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'contactEmail',
          label: vm.$t('customer.contactPersonEmail'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'leadSourceShowStr',
          label: vm.$t('customer.leadSource'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'leadCategoryShowStr',
          label: vm.$t('customer.leadCategory'),
          minWidth: 140,
          visible: true,
          tooltip: true
        }
      ],
      searchData: [
        {
          name: 'condition',
          placeholder: `${vm.$t('customer.salesGroup')} / ${vm.$t('customer.code')}`,
          type: 'InputEle'
        }
      ],
      customColumns: [],
      params: {},
      /* 已经选择的联系人Id(过滤) */
      alreadySelectDepartmentIdList: []
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
    handleAdd(data, params) {
      this.userList = data || []
      this.params = params || {}
      console.log(this.userList, '====281')
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
      if (this.btnLoading) {
        return
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 500)

      this.$emit('onSuccess', row)
      this.visible = false
    },
    // 查询表数据
    getList() {
      this.loading = true
      let params = { ...this.queryParams }
      params = this.$trimOfObj(params)
      params.alreadySelectDepartmentIdList = this.alreadySelectDepartmentIdList
      queryCanSelectSalesGroupList(params).then(res => {
        this.loading = false
        const list = res.data || []
        this.userList = list.map(item => {
          delete item.remarks
          return item
        })
        // this.total = res.total
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
    submitForm() {
      this.$modal
        .confirm(this.$t('customer.leadConfirm'))
        .then(() => {
          return saveLead(this.params)
        })
        .then(response => {
          this.$emit('onSuccess')
          this.$modal.msgSuccess(
            this.$t('customer.leadSuccess').replace('$1', this.params.leadName)
          )
          this.cancel()
        })
        .catch(() => {})
    }
  },
  emits: ['select']
}
</script>
