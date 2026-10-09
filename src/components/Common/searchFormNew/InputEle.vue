<template>
  <el-tooltip
    class="item"
    effect="light"
    :content="tooltip"
    placement="bottom"
    :disabled="!(tooltip && tooltipVisible)"
  >
    <el-input
      v-if="isLine"
      class="custom-input"
      style="vertical-align: baseline"
      :size="size"
      prefix-icon="Search"
      :style="{ width: mouseType === 'focus' ? '360px' : '240px' }"
      :placeholder="placeholder"
      :disabled="disabled"
      :model-value="value"
      clearable
      @input="handleInput"
      @keyup.enter="handleEnter"
      @blur="blurFn"
      @focus="focusFn"
      @clear="clear"
      :maxlength="maxlength || 50"
    >
    </el-input>
    <el-input
      v-else
      style="width: 100%; vertical-align: baseline"
      :size="size"
      :placeholder="placeholder"
      :disabled="disabled"
      :model-value="value"
      clearable
      @input="handleInput"
      @keyup.enter="handleEnter"
      @blur="blurFn"
      @focus="focusFn"
      @clear="clear"
      :maxlength="maxlength || 50"
    >
    </el-input>
  </el-tooltip>
</template>

<script>
export default {
  name: 'InputEle',
  components: {},
  props: {
    placeholder: undefined,
    value: undefined,
    maxlength: undefined,
    tooltip: undefined,
    width: undefined,
    type: undefined,
    disabled: undefined,
    interval: {
      type: Number,
      default: 2000
    },
    isLine: {
      type: Boolean,
      default: true
    },
    size: {
      default: 'small'
    }
  },
  data() {
    return {
      tooltipVisible: true,
      mouseType: 'blur',
      searchTimer: null,
      tooltipTimer: null
    }
  },
  methods: {
    blurFn() {
      this.mouseType = 'blur'
      clearTimeout(this.tooltipTimer)
      this.tooltipTimer = setTimeout(() => {
        if (this.mouseType === 'blur') {
          this.tooltipVisible = true
        }
      }, 100)
    },
    focusFn() {
      this.mouseType = 'focus'
      this.tooltipVisible = false
    },
    clear() {
      this.$emit('updateForm', { value: '', type: this.type })
      this.clearSearchTimer()
      this.$nextTick(() => {
        this.clearSearchTimer()
        this.$emit('search')
      })
    },
    clearSearchTimer() {
      clearTimeout(this.searchTimer)
      this.searchTimer = null
    },
    handleInput(value) {
      this.$emit('updateForm', { value, type: this.type })
      this.clearSearchTimer()
      this.searchTimer = setTimeout(() => {
        this.$emit('search')
      }, this.interval)
    },
    handleEnter() {
      this.clearSearchTimer()
      this.$emit('search')
    }
  },
  deactivated() {
    this.clearSearchTimer()
  },
  beforeUnmount() {
    this.clearSearchTimer()
    clearTimeout(this.tooltipTimer)
  },
  emits: ['updateForm', 'search']
}
</script>

<style lang="scss" scoped>
.custom-input {
  transition: width 0.2s;
  :deep(.el-input__wrapper) {
    box-shadow: none;
    border-bottom: 1px solid var(--el-border-color);
    border-radius: 0;
    &.is-focus {
      border-bottom-color: var(--el-color-primary);
    }
  }
}
</style>
