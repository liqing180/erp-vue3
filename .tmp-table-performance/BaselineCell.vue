<template>
  <el-tooltip
    ref="tooltip"
    :content="tooltipContent"
    :disabled="!tooltipEnabled"
    :enterable="false"
    effect="light"
    placement="top"
  >
    <div class="virtual-cell-content" @mouseenter="handleMouseEnter">
      <slot />
    </div>
  </el-tooltip>
</template>
<script>
export default {
  name: 'VirtualTableCell',
  props: {
    rowData: Object,
    column: Object,
    rowIndex: Number,
    showOverflowTooltip: { type: Boolean, default: false }
  },
  data() {
    return { tooltipContent: '', tooltipEnabled: false }
  },
  methods: {
    async handleMouseEnter(event) {
      const cell = event.currentTarget
      this.tooltipContent = cell.innerText.trim()
      this.tooltipEnabled =
        this.showOverflowTooltip &&
        !!this.tooltipContent &&
        !cell.querySelector(
          'input, textarea, select, [role="button"], [role="combobox"], .el-tooltip__trigger'
        ) &&
        cell.scrollWidth > cell.clientWidth
      if (!this.tooltipEnabled) return
      await this.$nextTick()
      if (cell.matches(':hover')) this.$refs.tooltip?.onOpen(event)
    }
  }
}
</script>
