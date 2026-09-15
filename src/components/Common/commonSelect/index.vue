<template>
  <el-select
    ref="mySelect"
    :model-value="comShow"
    :disabled="disabled"
    placeholder=""
    style="width: 100%"
    :loading="loading"
    :clearable="clearable"
    :filterable="filterable"
    :size="elementSize"
    default-first-option
    @change="change"
    @visible-change="visibleChange"
  >
    <el-option
      v-for="item in options"
      :key="item[idKey]"
      :label="item[labelKey]"
      :value="item[idKey]"
    >
      <slot :item="item" />
    </el-option>
  </el-select>
</template>

<script>
export default {
  props: {
    label: {
      type: [String, Number],
      default: ''
    },
    id: {
      type: [String, Number],
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    idKey: {
      type: String,
      default: 'value'
    },
    options: {
      type: Array,
      default: () => []
    },
    filterable: {
      type: Boolean,
      default: true
    },
    clearable: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: undefined
    }
  },
  emits: ['change', 'changeItem', 'visible-change'],
  computed: {
    elementSize() {
      if (this.size === 'mini') return 'small'
      if (this.size === 'medium') return 'default'
      return this.size
    },
    comShow() {
      if (this.id && this.options.find(item => item[this.idKey] === this.id)) {
        return this.id
      }
      return this.label || this.id
    }
  },
  watch: {
    // ERP-VUE2：异步 options 返回后重新匹配已选项，避免显示原始 ID。
    options: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.$refs.mySelect?.setSelected?.()
        })
      }
    }
  },
  methods: {
    change(value) {
      const item = this.options.find(row => row[this.idKey] === value) || {}
      this.$emit('change', item)
      // 保留此前 Vue3 版本的事件名，避免已迁页面回归。
      this.$emit('changeItem', item)
    },
    visibleChange(value) {
      this.$refs.mySelect?.resetQuery?.()
      this.$emit('visible-change', value)
    }
  }
}
</script>
