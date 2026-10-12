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
  methods: {
    async handleMouseEnter(event) {
      const cell = event.currentTarget
      this.tooltipContent = cell.innerText.trim()
      // 输入控件和已有悬浮交互沿用各自行为，避免出现重复提示。
      this.tooltipEnabled =
        this.showOverflowTooltip &&
        !!this.tooltipContent &&
        !cell.querySelector(
          'input, textarea, select, [role="button"], [role="combobox"], .el-tooltip__trigger'
        ) &&
        cell.scrollWidth > cell.clientWidth
      if (!this.tooltipEnabled) return

      // 首次进入时 Tooltip 原先处于禁用状态，更新后再打开。
      await this.$nextTick()
      if (cell.matches(':hover')) this.$refs.tooltip?.onOpen(event)
    }
  }
}
</script>
