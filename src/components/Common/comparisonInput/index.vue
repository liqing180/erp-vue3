<template>
  <div class="comparison-box" :class="[sizeClass, comparisonType]">
    <div
      v-if="beforeValueShow || comparisonType === 'comp-add'"
      class="old-value"
      :title="String(beforeValue ?? '')"
    >
      {{ beforeValue }}
    </div>
    <div class="new-value" :title="String(afterValue ?? '')">
      {{ afterValue }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComparisonInput',
  props: {
    size: {
      type: String,
      default: ''
    },
    showEditType: Boolean,
    beforeValue: {
      type: [String, Number],
      default: ''
    },
    afterValue: {
      type: [String, Number],
      default: ''
    }
  },
  computed: {
    sizeClass() {
      const sizeMap = {
        mini: 'comparison-box--small',
        small: 'comparison-box--small',
        medium: 'comparison-box--default',
        default: 'comparison-box--default',
        large: 'comparison-box--large'
      }
      return sizeMap[this.size] || 'comparison-box--small'
    },
    beforeValueShow() {
      return this.$resultOfBoolean(this.beforeValue)
    },
    afterValueShow() {
      return this.$resultOfBoolean(this.afterValue)
    },
    comparisonType() {
      const before = this.beforeValueShow
      const after = this.afterValueShow
      if (!before && !after) return ''
      if (this.showEditType) return 'comp-edit'
      if (!before && after) return 'comp-add'
      if (before && !after) return 'comp-delete'
      return 'comp-edit'
    }
  }
}
</script>

<style lang="scss" scoped>
.comparison-box {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 15px;
  overflow: hidden;
  color: var(--el-text-color-regular, #606266);
  font-size: inherit;
  background: var(--el-fill-color-light, #f5f7fa);
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: var(--el-border-radius-base, 4px);
}

.comparison-box--small {
  min-height: var(--el-component-size-small, 24px);
}

.comparison-box--default {
  min-height: var(--el-component-size, 32px);
}

.comparison-box--large {
  min-height: var(--el-component-size-large, 40px);
}

.comp-edit {
  padding-left: 12px;
  background: #f0f7ff;
  border-left: 3px solid #c2d7fb;
}

.comp-add {
  padding-left: 12px;
  background: #d2e3fc;
  border-left: 3px solid #1a73e8;

  .old-value::before {
    content: '—';
  }
}

.comp-delete {
  padding-left: 12px;
  background: #f5f5f4;
  border-left: 3px solid #78716c;
}

.old-value,
.new-value {
  max-width: 70%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.old-value {
  margin-right: 6px;
  color: #bbb;
  text-decoration: line-through;
}

.new-value {
  color: #1557b0;
  font-weight: bold;
}
</style>
