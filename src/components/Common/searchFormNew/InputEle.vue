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
      :model-value="value"
      clearable
      @input="$emit('updateForm', { value: $event, type })"
      @keyup.enter="$emit('search')"
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
      @input="$emit('updateForm', { value: $event, type })"
      @keyup.enter="$emit('search')"
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
      mouseType: 'blur'
    }
  },
  methods: {
    blurFn() {
      this.mouseType = 'blur'
      setTimeout(() => {
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
      // $emit('updateForm', { value: $event, type })
      // $emit('search')
    }
  },
  emits: ['updateForm', 'search', 'update:value']
}
</script>

<style lang="scss" scoped>
.custom-input {
  transition: width 0.2s;
  :deep(.el-input__wrapper) {
    border-left: 0;
    border-right: 0;
    border-top: 0;
    // background-color: inherit;
    border-radius: 0;
    // border-radius: 20px; /* 将输入框内部边框的圆角设置为0，保持输入框内部为直角 */
  }

  /* :deep(.el-input__inner:focus) {
    .el-input__icon.el-icon-search {
      color: #1090ff;
    }
  } */
}
</style>
