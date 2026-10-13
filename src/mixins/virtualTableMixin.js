// Element Plus 虚拟表格使用原业务行对象，展开状态不进入单据提交数据。
export default {
  data() {
    return {
      collapsedVirtualRowKeys: [],
      virtualRowHeights: new Map()
    }
  },
  created() {
    this.virtualRowObservers = new Map()
  },
  beforeUnmount() {
    this.virtualRowObservers.forEach(({ observer }) => observer.disconnect())
    this.virtualRowObservers.clear()
  },
  watch: {
    virtualRows(rows) {
      const keys = new Set(rows.map(row => row[this.rowIdKey]))
      this.virtualRowHeights.forEach((height, key) => {
        if (!keys.has(key)) this.virtualRowHeights.delete(key)
      })
    }
  },
  computed: {
    rowHeight() {
      return 38
    },
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
        Math.max(
          100,
          this.virtualRows.reduce(
            (height, row) =>
              height +
              Math.max(
                this.rowHeight,
                ...Object.values(
                  this.virtualRowHeights.get(row[this.rowIdKey]) || {}
                )
              ),
            56
          )
        )
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
    virtualRowProps() {
      return {
        ref: this.observeVirtualRow,
        onVnodeUpdated: vnode => this.refreshVirtualRowObserver(vnode.el),
        onVnodeBeforeUnmount: vnode => {
          this.virtualRowObservers.get(vnode.el)?.observer.disconnect()
          this.virtualRowObservers.delete(vnode.el)
        }
      }
    },
    observeVirtualRow(row) {
      const element = row?.$el
      if (!element || this.virtualRowObservers.has(element)) return
      // Table V2 默认只在行挂载时测量；继续观察内容，保持编辑后的行高和固定列一致。
      const observer = new ResizeObserver(() => {
        if (!element.isConnected) return
        const rowStyle = getComputedStyle(element)
        const borderHeight =
          parseFloat(rowStyle.borderTopWidth) +
          parseFloat(rowStyle.borderBottomWidth)
        const contentHeight = Math.max(
          this.rowHeight - borderHeight,
          ...Array.from(element.children).map(cell => {
            const style = getComputedStyle(cell)
            return (
              Math.max(
                0,
                ...Array.from(cell.children).map(
                  child => child.getBoundingClientRect().height
                )
              ) +
              parseFloat(style.paddingTop) +
              parseFloat(style.paddingBottom)
            )
          })
        )
        const height = Math.ceil(contentHeight + borderHeight)
        const { rowKey, rowIndex, onRowHeightChange } = row.$props
        const direction = element.closest('.el-table-v2__left')
          ? 'left'
          : element.closest('.el-table-v2__right')
            ? 'right'
            : false
        onRowHeightChange?.({ rowKey, rowIndex, height }, direction)
        // 容器高度取主表和固定列的最大自然高度，测量信息不写入业务行。
        const heights = this.virtualRowHeights.get(rowKey) || {}
        const area = direction || 'main'
        if (heights[area] !== height) {
          this.virtualRowHeights.set(rowKey, { ...heights, [area]: height })
        }
      })
      this.virtualRowObservers.set(element, { observer, cells: [] })
      this.refreshVirtualRowObserver(element)
    },
    refreshVirtualRowObserver(element) {
      const record = this.virtualRowObservers.get(element)
      if (!record) return
      const cells = Array.from(
        element.querySelectorAll('.virtual-cell-content')
      )
      if (
        cells.length === record.cells.length &&
        cells.every((cell, index) => cell === record.cells[index])
      )
        return
      record.observer.disconnect()
      cells.forEach(cell => record.observer.observe(cell))
      record.cells = cells
    },
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
