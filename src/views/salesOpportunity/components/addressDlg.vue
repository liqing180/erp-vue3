<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('ui.address')"
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
        :data="tableList"
        @row-click="handleRowClick"
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
            <span>{{ scope.$index + 1 }}</span>
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
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { queryCustomerAddressList } from '@/api/salesOpportunity/salesOpportunity'

import pageMixin from '@/mixins/tableMinx'
// import searchForm from '@/components/Common/searchForm/Index.vue'
export default {
  dicts: ['sys_user_sex'],
  mixins: [pageMixin],
  // components: { searchForm },
  props: {
    customerId: {
      type: [Number, String]
    },
    params: {
      type: Object,
      default: () => {}
    },
    customerName: {
      type: String,
      default: ''
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
      tableList: [],
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
          prop: 'label',
          label: vm.$t('ui.label'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          fixed: true
        },

        {
          prop: 'address1',
          label: vm.$t('ui.addressLine1'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'address2',
          label: vm.$t('ui.addressLine2'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'location',
          label: vm.$t('ui.locationPrecinct'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'city',
          label: vm.$t('ui.cityTown'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'province',
          label: vm.$t('ui.provinceState'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'postalCode',
          label: vm.$t('ui.postalCode'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'country',
          label: vm.$t('ui.country'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'remarks',
          label: vm.$t('ui.remarks'),
          visible: true,
          minWidth: 200,
          tooltip: true
        }
        // {
        //   prop: 'isActive',
        //   label: vm.$t('ui.isActive'),
        //   visible: true,
        //   minWidth: 200,
        //   tooltip: true
        // }
      ],
      searchData: [
        {
          name: 'condition',
          placeholder: `${vm.$t('ui.label')}`,
          type: 'InputEle'
        }
      ],
      customColumns: [],
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
    handleAdd() {
      this.getList()
      this.visible = true
    },
    // 查询表数据
    getList() {
      this.loading = true
      const params = {
        condition: this.queryParams.condition,
        customerId: this.customerId
      }
      queryCustomerAddressList(params).then(response => {
        this.tableList = response.data
        this.loading = false
        this.$$getColumnContentMaxWidth(this.columns, this.tableList)
      })
    },
    cancel() {
      this.visible = false
    },
    closed() {
      this.resetSearchForm(false)
    },
    handleRowClick(row) {
      if (this.btnLoading) {
        return
      }
      this.btnLoading = true
      setTimeout(() => {
        this.btnLoading = false
      }, 500)
      const item = JSON.parse(JSON.stringify(row))
      this.$emit('onSuccess', item)
      this.visible = false
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
        .then(() => {})
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
