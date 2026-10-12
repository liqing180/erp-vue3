// Element Plus 虚拟表格使用原业务行对象，展开状态不进入单据提交数据。
export default {
  data() {
    return {
      collapsedVirtualRowKeys: []
    }
  },
  computed: {
    virtualTreeEnabled() {
      return false
    },
    virtualTree() {
      const rows = []
      const depths = new Map()
      const collapsed = new Set(this.collapsedVirtualRowKeys)
      const collect = (list, depth) => {
        list.forEach(row => {
          rows.push(row)
          depths.set(row[this.rowIdKey], depth)
          if (this.virtualTreeEnabled && !collapsed.has(row[this.rowIdKey])) {
            collect(row.childProductList || [], depth + 1)
          }
        })
      }
      collect(this.tableList || [], 0)
      return { rows, depths }
    },
    virtualRows() {
      return this.virtualTree.rows
    },
    virtualTableHeight() {
      return Math.min(
        600,
        Math.max(100, this.virtualRows.length * this.rowHeight + 56)
      )
    },
    virtualTabOptions() {
      return {
        getTable: () => this.$refs.tables,
        getRows: () => this.virtualRows,
        getColumns: () => this.virtualColumns,
        activateRow: (row, column) =>
          this.handleRowClick(row, { property: column.prop }),
        // 保持 ERP 默认只用 Tab 跳转；调用方可显式开启 Enter。
        enterToNext: false,
        focusableSelector:
          'input:not([disabled]):not([tabindex="-1"]), ' +
          'select:not([disabled]):not([tabindex="-1"]), ' +
          'textarea:not([disabled]):not([tabindex="-1"])'
      }
    }
  },
  methods: {
    virtualCellProps({ rowData, rowIndex, column }) {
      return {
        class: this.tableCellClassName({
          row: rowData,
          column: { property: column.prop }
        }),
        'data-virtual-row': rowIndex,
        'data-virtual-column': column.key,
        onClick: () => this.handleRowClick(rowData, { property: column.prop })
      }
    },
    virtualRowClass({ rowData, rowIndex }) {
      return this.tableRowClassName({ row: rowData, rowIndex })
    },
    virtualRowDepth(row) {
      return this.virtualTree.depths.get(row[this.rowIdKey]) || 0
    },
    isVirtualRowExpanded(row) {
      return !this.collapsedVirtualRowKeys.includes(row[this.rowIdKey])
    },
    expandVirtualRow(row, expanded) {
      const key = row[this.rowIdKey]
      this.collapsedVirtualRowKeys = this.collapsedVirtualRowKeys.filter(
        item => item !== key
      )
      if (!expanded) this.collapsedVirtualRowKeys.push(key)
    },
    scrollToErrorColumn() {
      const columns = this.virtualColumns.filter(column => column.prop)
      let errorRow
      let errorColumn
      const findError = list =>
        list.some(row => {
          errorColumn = columns.find(
            column =>
              row[column.prop + 'Error'] || row[column.prop + 'ErrorChildren']
          )
          if (errorColumn) {
            errorRow = row
            return true
          }
          if (findError(row.childProductList || [])) {
            this.expandVirtualRow(row, true)
            return true
          }
          return false
        })
      if (!findError(this.tableList || [])) return
      this.$nextTick(() => {
        this.$refs.tables?.scrollToRow(
          this.virtualRows.indexOf(errorRow),
          'center'
        )
        if (!errorColumn.fixed) {
          let left = 0
          for (const column of this.virtualColumns) {
            if (column.key === errorColumn.key) break
            if (!column.fixed) left += column.width
          }
          this.$refs.tables?.scrollToLeft(left)
        }
      })
    }
  }
}
