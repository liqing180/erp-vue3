<template>
  <el-dialog
    :model-value="modelValue"
    :title="$t('PURCHASE.addProduct')"
    width="1200px"
    append-to-body
    :close-on-click-modal="false"
    @close="close"
    @closed="reset"
  >
    <div class="pr-product-filter">
      <el-input
        v-model="query.condition"
        clearable
        :placeholder="$t('ui.productSearch')"
        @keyup.enter="search"
        @clear="search"
      />
      <el-button type="primary" @click="search">{{ $t('uiBtn.search') }}</el-button>
      <el-button @click="resetSearch">{{ $t('uiBtn.reset') }}</el-button>
    </div>

    <div class="pr-product-body">
      <div class="pr-product-tree">
        <el-tree
          :data="categoryTree"
          :props="treeProps"
          node-key="id"
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleCategoryClick"
        />
      </div>

      <div class="pr-product-table">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="rows"
          row-key="productId"
          border
          max-height="500"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="52" reserve-selection />
          <el-table-column type="index" :label="$t('ui.sn')" width="60" align="center">
            <template #default="scope">
              {{ scope.$index + (query.pageNum - 1) * query.pageSize + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="productName" :label="$t('PURCHASE.productName')" min-width="200" show-overflow-tooltip />
          <el-table-column prop="internalPartNo" :label="$t('PURCHASE.internalPartNo')" min-width="180" show-overflow-tooltip />
          <el-table-column prop="description" :label="$t('ui.description')" min-width="220" show-overflow-tooltip />
          <el-table-column prop="alias" :label="$t('PURCHASE.alias')" min-width="140" show-overflow-tooltip />
          <el-table-column prop="inventoryUom" :label="$t('PURCHASE.uom')" min-width="110" show-overflow-tooltip />
          <el-table-column prop="qtyOnHand" label="Qty On Hand" min-width="130" align="right" />
          <el-table-column prop="availableQty" label="Available Qty" min-width="130" align="right" />
        </el-table>

        <div class="pr-product-pagination">
          <el-pagination
            v-model:current-page="query.pageNum"
            v-model:page-size="query.pageSize"
            :page-sizes="[10, 25, 50, 100]"
            layout="total, sizes, prev, pager, next"
            :total="total"
            @current-change="loadProducts"
            @size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <span class="pr-product-selected">Selected: {{ selectedMap.size }}</span>
      <el-button @click="close">{{ $t('uiBtn.back') }}</el-button>
      <el-button type="primary" @click="confirm">{{ $t('uiBtn.confirm1') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { queryPRCanSelectProductList } from '@/api/purchaseManagement/purchaseRequisition'
import { queryBusinessSelectProductCategoryTreeList } from '@/api/productManagement/productCategory'
import menuKey from '@/config/menuKey'

export default {
  name: 'ProductSelectDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    selectedRows: {
      type: Array,
      default: () => []
    },
    warehouseId: {
      type: [String, Number],
      default: ''
    },
    dropShipping: {
      type: String,
      default: '0'
    },
    costProjectId: {
      type: [String, Number],
      default: ''
    }
  },
  emits: ['update:modelValue', 'confirm'],
  data() {
    return {
      loading: false,
      rows: [],
      total: 0,
      categoryTree: [],
      treeProps: {
        children: 'child',
        label: 'categoryName'
      },
      query: {
        pageNum: 1,
        pageSize: 25,
        condition: '',
        productCategoryId: undefined
      },
      selectedMap: new Map(),
      syncingSelection: false,
      requestToken: 0
    }
  },
  watch: {
    modelValue(value) {
      if (value) this.open()
    }
  },
  methods: {
    open() {
      this.selectedMap = new Map(
        (this.selectedRows || [])
          .filter(row => row?.productId)
          .map(row => [row.productId, row])
      )
      this.query.pageNum = 1
      this.loadCategories()
      this.loadProducts()
    },
    reset() {
      this.rows = []
      this.total = 0
      this.categoryTree = []
      this.query = {
        pageNum: 1,
        pageSize: 25,
        condition: '',
        productCategoryId: undefined
      }
      this.selectedMap = new Map()
    },
    close() {
      this.$emit('update:modelValue', false)
    },
    async loadCategories() {
      try {
        const response = await queryBusinessSelectProductCategoryTreeList()
        this.categoryTree = response.data || []
      } catch {
        this.categoryTree = []
      }
    },
    async loadProducts() {
      const token = ++this.requestToken
      this.loading = true
      const params = {
        ...this.query,
        warehouseId: this.warehouseId || undefined,
        dropShipping: this.dropShipping,
        costProjectId: this.costProjectId || undefined,
        alreadyProductIdList: [],
        selectedIdList: [...this.selectedMap.keys()],
        menuPerms: menuKey.PR
      }

      try {
        const response = await queryPRCanSelectProductList(params)
        if (token !== this.requestToken) return
        this.rows = response.rows || []
        this.total = response.total || 0
        this.restorePageSelection()
      } finally {
        if (token === this.requestToken) this.loading = false
      }
    },
    restorePageSelection() {
      this.$nextTick(() => {
        const table = this.$refs.tableRef
        if (!table) return
        this.syncingSelection = true
        table.clearSelection()
        this.rows.forEach(row => {
          if (this.selectedMap.has(row.productId)) {
            table.toggleRowSelection(row, true)
          }
        })
        this.$nextTick(() => {
          this.syncingSelection = false
        })
      })
    },
    handleSelectionChange(selection) {
      if (this.syncingSelection) return
      const visibleIds = new Set(this.rows.map(row => row.productId))
      visibleIds.forEach(id => this.selectedMap.delete(id))
      selection.forEach(row => this.selectedMap.set(row.productId, row))
    },
    handleRowClick(row, column) {
      if (column?.type === 'selection') return
      const selected = this.selectedMap.has(row.productId)
      if (selected) this.selectedMap.delete(row.productId)
      else this.selectedMap.set(row.productId, row)
      this.$refs.tableRef?.toggleRowSelection?.(row, !selected)
    },
    handleCategoryClick(node) {
      this.query.productCategoryId = node?.id || undefined
      this.query.pageNum = 1
      this.loadProducts()
    },
    search() {
      this.query.pageNum = 1
      this.loadProducts()
    },
    resetSearch() {
      this.query.condition = ''
      this.query.productCategoryId = undefined
      this.query.pageNum = 1
      this.loadProducts()
    },
    handlePageSizeChange() {
      this.query.pageNum = 1
      this.loadProducts()
    },
    normalizeRow(row) {
      const existing = this.selectedRows.find(item => item.productId === row.productId)
      if (existing) return existing
      return {
        ...row,
        productType: row.productType || '1',
        uom: row.uom || row.inventoryUom || row.basicUom || '',
        basicUom: row.basicUom || row.inventoryUom || row.uom || '',
        includeDecimal: row.includeDecimal || '1',
        decimalNum: Number.isFinite(Number(row.decimalNum)) ? Number(row.decimalNum) : 3,
        uomCoefficient: row.uomCoefficient || 1,
        externalPartNoList: row.externalPartNoList || [],
        externalPartNoListJson: row.externalPartNoListJson || []
      }
    },
    confirm() {
      const result = [...this.selectedMap.values()].map(row => this.normalizeRow(row))
      this.$emit('confirm', result)
      this.close()
    }
  }
}
</script>

<style scoped lang="scss">
.pr-product-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;

  .el-input {
    width: 360px;
  }
}

.pr-product-body {
  display: flex;
  gap: 16px;
  min-height: 460px;
}

.pr-product-tree {
  width: 240px;
  max-height: 550px;
  flex-shrink: 0;
  overflow: auto;
  border: 1px solid var(--el-border-color-light);
  padding: 8px;
}

.pr-product-table {
  flex: 1;
  min-width: 0;
}

.pr-product-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.pr-product-selected {
  float: left;
  line-height: 32px;
  color: var(--el-text-color-secondary);
}
</style>
