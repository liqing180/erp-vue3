<template>
  <el-dialog
    draggable
    :title="$t('SALES.product')"
    v-model="visible"
    width="1200px"
    :modal="true"
    :close-on-click-modal="false"
    @closed="closed"
    append-to-body
  >
    <search-form
      ref="searchForm"
      :value="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :showCustom="false"
      :showMenu="false"
      v-show="showSearch"
    >
      <right-toolbar
        :saveKey="saveKey"
        :savePath="savePath"
        :showRefreshBtn="true"
        @queryTable="queryTable"
        :columns="configColumn"
      ></right-toolbar>
    </search-form>

    <div
      class="mt20"
      style="display: flex; align-items: flex-start"
      v-loading="loading"
    >
      <div class="tree-box" :style="{ width: isCollapse ? '2px' : '300px' }">
        <div class="tree">
          <el-tree
            ref="tree"
            :data="treeList"
            :props="defaultProps"
            default-expand-all
            :expand-on-click-node="false"
            node-key="id"
            @node-click="handleNodeClick"
          >
            <template v-slot="{ node }">
              <span class="node-label flow1" :title="node.label">
                {{ node.label }}
              </span>
            </template>
          </el-tree>
        </div>
        <div class="collapse-warp">
          <el-icon
            :size="20"
            v-if="isCollapse"
            @click="isCollapse = !isCollapse"
          >
            <DArrowRight />
          </el-icon>
          <el-icon :size="20" v-else @click="isCollapse = !isCollapse">
            <DArrowLeft />
          </el-icon>
        </div>
        <div
          class="menu-resize"
          :data-collapse="isCollapse"
          v-show="!isCollapse"
          v-dragTree
        ></div>
      </div>
      <div class="w100" style="overflow: hidden">
        <el-table
          border
          ref="tables"
          :data="tableList"
          :max-height="tableMaxHeight"
          @sort-change="handleSortChange"
          @row-click="handleRowClick"
          @select="handleSelectionChange"
          @select-all="handleSelectAll"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="selectable"
            align="center"
          />
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
            <template v-slot="scope">
              <template v-if="item.prop === 'valuationAmount'">{{
                $numberStr(scope.row[item.prop], 2)
              }}</template>
              <template v-else-if="item.prop === 'isActive'">
                <el-tag v-if="scope.row.isActive === '1'">{{
                  $t('uiBtn.active')
                }}</el-tag>
                <el-tag v-if="scope.row.isActive === '0'" type="danger">{{
                  $t('uiBtn.inactive')
                }}</el-tag>
              </template>
              <template v-else-if="item.prop === 'uom'">
                <span>{{ scope.row[item.prop] }}</span>
              </template>
              <template v-else>{{
                scope.row[item.propBy || item.prop]
              }}</template>
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
      </div>
    </div>

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="handleBack">{{ $t('ui.back') }}</el-button>
        <el-button type="primary" :loading="btnLoading" @click="submit"
          >{{ $t('uiBtn.save') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import {
  queryBusinessSelectServiceCategoryTreeList,
  queryCanSelectServiceListFromSalesInquiry,
  dealAddProductMsg
} from '@/api/salesManagement/salesQuotation'

export default {
  directives: {
    // transferDom
  },
  mixins: [pageMixin],
  props: {
    formData: {
      type: Object,
      required: true,
      default() {
        return {}
      }
    }
  },
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  data() {
    const vm = this
    return {
      saveKey: '20',
      savePath: 'salesMTable',
      searchFormKey: Date.now(),
      loading: false,
      btnLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      rowIdKey: 'productId',
      tableList: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      selectList: [],
      visible: false,
      columns: [
        {
          prop: 'productName',
          label: vm.$t('SALES.productName'),
          visible: true,
          minWidth: 200,
          sortable: 'custom',
          tooltip: true,
          fixed: true
        },
        {
          prop: 'internalPartNo',
          label: vm.$t('SALES.internalPartNo'),
          visible: true,
          minWidth: 200,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'alias',
          label: vm.$t('SALES.alias'),
          visible: true,
          minWidth: 200,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'uom',
          label: vm.$t('ui.uom'),
          visible: true,
          minWidth: 200,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'valuationAmount',
          label: vm.$t('SALES.unitPrice'),
          visible: true,
          minWidth: 200,
          padding: 50,
          tooltip: true,
          align: 'right'
        },
        {
          prop: 'valuationCurrency',
          label: vm.$t('ui.currency'),
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
        },
        {
          prop: 'isActive',
          label: vm.$t('ui.isActive'),
          minWidth: 140,
          visible: true,
          tooltip: true,
          sortable: 'custom'
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: ''
      },
      searchData: [
        {
          name: 'condition',
          placeholder: `${this.$t('ui.productSearch')}`,
          type: 'InputEle'
        }
      ],
      treeList: [],
      defaultProps: {
        children: 'child',
        label: 'categoryName'
      },
      /* 已经选择的联系人Id(过滤) */
      alreadySelectIdList: [],
      isCollapse: false
    }
  },
  computed: {},
  watch: {},
  created() {
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
  },
  updated() {},
  methods: {
    handleAdd(alreadySelectIdList) {
      this.alreadySelectIdList = alreadySelectIdList || []
      this.queryParams.productCategoryId = ''
      this.queryParams.condition = ''
      this.queryParams.pageNum = 1
      this.visible = true
      this.getList()
      this.queryAllProductCategoryTreeList()
    },
    queryAllProductCategoryTreeList() {
      queryBusinessSelectServiceCategoryTreeList().then(res => {
        const list = res.data || []
        this.treeList = list
      })
    },
    queryTable() {
      this.queryParams.isAsc = this.queryParams.orderByColumn = undefined
      this.$refs.tables.clearSort()
      this.queryParams.productCategoryId = ''
      this.getList()
    },
    getList() {
      const vm = this
      const param = this.queryParams
      param.alreadyProductIdList = this.alreadySelectIdList
      param.targetCurrencyId = this.formData.currencyId

      this.loading = true
      param.purpose = '2'
      queryCanSelectServiceListFromSalesInquiry(param)
        .then(response => {
          this.loading = false
          this.total = response.total
          const rows = response.rows || []
          /* rows.forEach((item) => {
            item.uom = item.valuationUnit
          }) */
          this.tableList = rows
          this.$$getColumnContentMaxWidth(this.columns, this.tableList)

          this.$nextTick(() => {
            this.selectList.forEach(row => {
              this.tableList.forEach(item => {
                if (row[this.rowIdKey] === item[this.rowIdKey]) {
                  this.$refs.tables.toggleRowSelection(item, true)
                }
              })
            })
          })
        })
        .catch(err => {
          vm.loading = false
          window.console.error(err)
        })
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.productCategoryId = data.id
      this.getList()
    },
    selectable(row, rowIndex) {
      return true // 不禁用
    },
    handleSelectAll(selection) {
      const vm = this
      if (selection.length) {
        // 去重添加
        const curSelectedIds = this.selectList.map(d => d[this.rowIdKey])
        selection.forEach(item => {
          if (!curSelectedIds.includes(item[this.rowIdKey])) {
            vm.selectList.push(item)
          }
        })
      } else {
        // 删除table中在selection 中缓存的内容
        const delArr = this.tableList.map(item => item[this.rowIdKey])
        vm.selectList = vm.selectList.filter(
          item => !delArr.includes(item[this.rowIdKey])
        )
      }
    },
    // 有则删除，无则添加
    handleSelectionChange(selection, row) {
      const vm = this
      for (let i = 0; i < vm.selectList.length; i++) {
        if (vm.selectList[i][this.rowIdKey] === row[this.rowIdKey]) {
          return vm.selectList.splice(i, 1)
        }
      }
      vm.selectList.push(row)
    },
    handleRowClick(row, column) {
      if (column && column.property === 'picture') {
        return
      }
      const index = this.selectList.findIndex(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      const isSelected = index > -1
      if (isSelected) {
        this.selectList.splice(index, 1)
      } else {
        this.selectList.push(row)
      }
      this.$refs.tables.toggleRowSelection(row, !isSelected)
    },
    handleBack() {
      const vm = this
      vm.visible = false
    },
    /** 搜索 */
    handleSearchForm() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置 */
    resetSearchForm() {
      const { pageSize } = this.queryParams
      this.queryParams = { pageNum: 1, pageSize }
      this.$refs.tables.clearSort()
      this.getList()
    },
    closed() {
      this.isCollapse = false
      this.selectList = []
      this.tableList = []
      this.$refs.tables.clearSelection()
      this.$refs.tree.setCheckedKeys([])
    },
    submit() {
      if (this.btnLoading) return
      this.btnLoading = true
      if (this.selectList.length <= 0) {
        this.btnLoading = false
        this.$emit('onSuccess', this.selectList)
        this.visible = false
        return
      }
      dealAddProductMsg({
        salesInquiryServiceList: this.selectList,
        businessPartnerId: this.formData.businessPartnerId,
        currencyId: this.formData.currencyId,
        customerGroup: this.formData.customerGroup
      })
        .then(res => {
          setTimeout(() => {
            this.btnLoading = false
          }, 1000)
          const data = res.data || {}
          this.$emit('onSuccess', data.salesInquiryServiceList || [])
          this.visible = false
        })
        .catch(() => {
          this.btnLoading = false
        })
      /* this.$emit('onSuccess', this.selectList1, this.selectList2)
      this.visible = false */
    }
  }
}
</script>

<style lang="scss" scoped>
.txt-color {
  color: #f66c6c !important;
}

.tree-box {
  flex-shrink: 0;
  position: relative;
  max-height: 600px;
  margin-right: 20px;
  //  transition: width 0.28s;
}
.tree {
  min-height: 200px;
  max-height: 600px;
  overflow: hidden auto;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.collapse-warp {
  position: absolute;
  top: 50%;
  right: -4px;
  z-index: 300;
  font-size: 16px;
  // background-color: #888;
  // right: 100%;
  // border: 1px solid #000;
  background-color: #fff;
  border-radius: 4px;
}
.tree::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: initial;
}

.tree::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(127, 135, 146, 0.5);
}

.tree::-webkit-scrollbar-track {
  width: 10px;
  box-shadow: none;
  border-radius: 0;
  background-color: initial;
}
</style>
