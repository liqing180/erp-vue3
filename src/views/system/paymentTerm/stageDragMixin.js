import { markRaw } from 'vue'
import Sortable from 'sortablejs'

// Element Plus 固定列与普通列共用 tbody，使用阶段 ID 保持树形行与 DOM 的对应关系。
export default {
  data() {
    return {
      sortableDom: undefined,
      dragInitId: 0
    }
  },
  activated() {
    this.initDraggable()
  },
  deactivated() {
    this.destroyDraggable()
  },
  beforeUnmount() {
    this.destroyDraggable()
  },
  methods: {
    getStageDragRow(element) {
      const rowId = element?.querySelector('[data-stage-row-id]')?.dataset
        .stageRowId
      if (!rowId) return undefined
      return this.treeToTile(this.tableList).find(
        row => String(row.rowTimeId) === rowId
      )
    },
    initDraggable() {
      this.destroyDraggable()
      if (this.comDisFrom) return
      const initId = this.dragInitId
      this.$nextTick(() => {
        if (initId !== this.dragInitId) return
        const el = this.$refs.tables?.$el.querySelector(
          '.el-table__body-wrapper tbody'
        )
        if (!el) return
        this.sortableDom = markRaw(
          Sortable.create(el, {
            draggable: '.allowDrag',
            handle: '.allowDrag .el-table__cell:first-child',
            filter: 'input, textarea, button, .el-icon, .el-table__expand-icon',
            preventOnFilter: false,
            animation: 100,
            chosenClass: 'blue-background-class',
            ghostClass: 'blue-background-class',
            onMove: ({ dragged, related }) => {
              const oldRow = this.getStageDragRow(dragged)
              const newRow = this.getStageDragRow(related)
              if (
                !oldRow ||
                !newRow ||
                related.classList.contains('table-dis-drag-bgcolor')
              ) {
                return false
              }
              return oldRow.parentRowTimeId === newRow.parentRowTimeId
            },
            onStart: ({ item }) => {
              const row = this.getStageDragRow(item)
              ;(row?.nodeList || []).forEach(node => {
                this.$refs.tables.toggleRowExpansion(node, false)
              })
            },
            onEnd: ({ item, oldIndex, newIndex }) => {
              if (oldIndex === newIndex) return
              const row = this.getStageDragRow(item)
              if (row) {
                const nodeList = row.nodeList
                const rowsById = new Map(
                  nodeList.map(node => [String(node.rowTimeId), node])
                )
                const sortedRows = Array.from(el.children)
                  .map(
                    element =>
                      element.querySelector('[data-stage-row-id]')?.dataset
                        .stageRowId
                  )
                  .filter(rowId => rowsById.has(rowId))
                  .map(rowId => rowsById.get(rowId))
                if (
                  sortedRows.length === nodeList.length &&
                  new Set(sortedRows).size === nodeList.length
                ) {
                  nodeList.splice(0, nodeList.length, ...sortedRows)
                  this.resetStageNum(this.tableList)
                }
              }
              // Sortable 移动了实际 DOM，重建表格让 Vue 的行顺序与业务数据一致。
              this.tableKey += 1
              this.initDraggable()
            }
          })
        )
      })
    },
    destroyDraggable() {
      this.dragInitId += 1
      if (this.sortableDom) {
        this.sortableDom.destroy()
        this.sortableDom = undefined
      }
    }
  }
}
