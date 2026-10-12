import { h, withMemo } from 'vue'
import { ElTooltip } from 'element-plus'

export default {
  name: 'VirtualTableCell',
  inheritAttrs: false,
  props: {
    rowData: Object,
    column: Object,
    rowIndex: Number,
    showOverflowTooltip: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tooltipContent: '',
      tooltipEnabled: false
    }
  },
  created() {
    // 插槽函数保持非响应式；仅更新渲染作用域，不让滚动导致缓存失效。
    this.cellSlot = this.$slots.default
    this.cellCache = []
  },
  beforeUpdate() {
    this.cellSlot = this.$slots.default
  },
  computed: {
    cellContent() {
      // 插槽内读取的业务字段仍由 Vue 跟踪；滚动位置变化不重新生成编辑控件。
      // 行、列或顺序变化时重新调用插槽，避免保留旧作用域中的行数据。
      return this.cellSlot?.({
        rowData: this.rowData,
        column: this.column,
        rowIndex: this.rowIndex
      })
    }
  },
  render() {
    return [
      withMemo(
        [this.cellContent, ...Object.entries(this.$attrs).flat()],
        () =>
          h(
            'div',
            {
              ...this.$attrs,
              ref: 'cell',
              class: ['virtual-cell-content', this.$attrs.class],
              onMouseenter: this.handleMouseEnter,
              onMouseleave: this.hideTooltip
            },
            this.cellContent
          ),
        this.cellCache,
        0
      ),
      this.tooltipEnabled
        ? h(ElTooltip, {
            virtualTriggering: true,
            virtualRef: this.$refs.cell,
            visible: true,
            content: this.tooltipContent,
            enterable: false,
            effect: 'light',
            placement: 'top'
          })
        : null
    ]
  },
  methods: {
    hideTooltip() {
      this.tooltipEnabled = false
    },
    handleMouseEnter(event) {
      const cell = event.currentTarget
      // 输入控件和已有悬浮交互沿用各自行为，避免出现重复提示。
      if (
        !this.showOverflowTooltip ||
        cell.querySelector(
          'input, textarea, select, [role="button"], [role="combobox"], .el-tooltip__trigger'
        )
      )
        return

      this.tooltipContent = cell.textContent.trim()
      this.tooltipEnabled =
        !!this.tooltipContent && cell.scrollWidth > cell.clientWidth
    }
  }
}
