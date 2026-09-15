<template>
  <div class="tooltip-row">
    <el-popover
      trigger="hover"
      placement="top"
      :disabled="!String(showStr || '').trim()"
      :show-after="400"
    >
      <div class="desc-tooltip">
        <div v-if="showStr" class="desc-content">{{ showStr }}</div>
      </div>
      <template #reference>
        <slot>
          <div class="tooltip-row">{{ showStr }}</div>
        </slot>
      </template>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'DescriptionToolTipShow',
  props: {
    showStr: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.desc-tooltip {
  max-width: 800px;
  max-height: 400px;
  padding-right: 8px;
  overflow-y: auto;
  font-size: 12px;
}

.desc-content {
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
}

.tooltip-row {
  min-width: 50px;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.desc-tooltip::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.desc-tooltip::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
</style>
