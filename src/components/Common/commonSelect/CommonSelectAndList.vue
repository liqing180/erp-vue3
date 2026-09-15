<template>
  <div class="input-switch-box">
    <div class="con-left">
      <el-select
        :key="selectVersion"
        ref="mySelect"
        :model-value="comShow"
        :title="title"
        :disabled="disabled"
        :loading="loading"
        :clearable="clearable"
        :filterable="filterable"
        :filter-method="filterMethod"
        :size="elementSize"
        placeholder=""
        style="width: 100%"
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
    </div>
    <div v-if="!disabled && showAdd" class="con-right">
      <svg-icon
        icon-class="list2"
        class="primary-pointer"
        style="font-size: 26px"
        @click="$emit('handleOpen')"
      />
    </div>
  </div>
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
    optionsAll: {
      type: Array,
      default: undefined
    },
    filterable: {
      type: Boolean,
      default: true
    },
    filterMethod: {
      type: Function,
      default: undefined
    },
    clearable: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: undefined
    },
    title: {
      type: String,
      default: undefined
    },
    showAdd: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change', 'handleOpen', 'visible-change'],
  data() {
    return {
      show: false,
      selectVersion: 0
    }
  },
  computed: {
    elementSize() {
      return this.size === 'mini' ? 'small' : this.size
    },
    comShow() {
      const options = this.optionsAll || this.options
      if (this.id && options.some(item => item[this.idKey] === this.id)) {
        return this.id
      }
      return this.label || this.id
    }
  },
  watch: {
    options() {
      this.refreshClosedSelect()
    },
    optionsAll() {
      this.refreshClosedSelect()
    }
  },
  methods: {
    change(value) {
      const item = this.options.find(item => item[this.idKey] === value) || {}
      this.$emit('change', item)
    },
    visibleChange(value) {
      this.show = value
      if (!value) {
        // Vue2 版本通过修改 Element UI 私有 query/setSelected 状态清空筛选。
        // Vue3 通过重建关闭后的 Select 达到同样目的，避免依赖 Element Plus 私有 API。
        this.selectVersion += 1
      }
      this.$emit('visible-change', value)
    },
    refreshClosedSelect() {
      if (!this.show) {
        this.$nextTick(() => {
          this.selectVersion += 1
        })
      }
    },
    handleBlur() {
      this.$refs.mySelect?.blur()
    }
  }
}
</script>
