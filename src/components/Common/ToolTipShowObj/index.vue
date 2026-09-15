<template>
  <el-popover
    trigger="hover"
    placement="top"
    :disabled="!showStr"
    :show-after="400"
  >
    <div class="desc-tooltip">
      <div v-for="(item, index) in rows" :key="index" class="desc-tooltip-item">
        <div class="item-title">{{ item.label }} :</div>
        <div class="item-content">
          {{ getDisplayValue(item) }}
        </div>
      </div>
    </div>

    <template #reference>
      <div class="tooltip-reference">
        <slot v-if="$slots.default" />
        <div v-else class="tooltip-row">
          <span>{{ showStr }}</span>
        </div>
      </div>
    </template>
  </el-popover>
</template>

<script>
export default {
  name: 'ToolTipShowObj',
  props: {
    mData: {
      type: Object,
      default: () => ({})
    },
    rows: {
      type: Array,
      default: () => []
    },
    showStr: {
      type: String,
      default: ''
    }
  },
  computed: {
    comData() {
      return this.mData || {}
    }
  },
  methods: {
    getDisplayValue(item) {
      const value = this.comData[item.showLabel]
      if (item.showLabel === 'isActive') {
        return value === '1' ? this.$t('uiBtn.active') : this.$t('uiBtn.inactive')
      }
      return value
    }
  }
}
</script>

<style lang="scss" scoped>
.tooltip-reference {
  width: 100%;
}

.desc-tooltip {
  display: grid;
  grid-template-columns: max-content minmax(100px, 1fr);
  max-width: 800px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Microsoft YaHei';
}

.desc-tooltip-item {
  display: contents;
}

.item-title,
.item-content {
  padding: 3px 0;
  border-bottom: 1px solid #efefef;
  color: #606266;
  font-size: 13px;
  line-height: 25px;
}

.item-title {
  padding-right: 6px;
  font-weight: bold;
  text-align: right;
}

.item-content {
  min-width: 100px;
  padding-left: 6px;
  word-break: break-all;
}

.tooltip-row {
  min-width: 50px;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
