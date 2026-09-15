<template>
  <div class="input-switch-box">
    <div class="con-left">
      <el-select
        ref="mySelect"
        :model-value="comShow"
        :title="title"
        :disabled="disabled"
        placeholder=""
        style="width: 100%"
        :loading="loading"
        :clearable="clearable"
        :filterable="filterable"
        :filter-method="filterMethod"
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
      show: false
    }
  },
  computed: {
    elementSize() {
      if (this.size === 'mini') return 'small'
      if (this.size === 'medium') return 'default'
      return this.size
    },
    comShow() {
      const options = this.optionsAll || this.options
      if (this.id && options.find(item => item[this.idKey] === this.id)) {
        return this.id
      }
      return this.label || this.id
    }
  },
  watch: {
    options: {
      immediate: true,
      handler() {
        // ERP-VUE2 在自定义过滤且下拉正打开时不强制刷新 selected，
        // 避免远程/动态 options 更新打断用户正在输入的筛选词。
        if (this.show && this.filterMethod) return
        this.refreshSelected()
      }
    },
    optionsAll: {
      immediate: true,
      handler() {
        this.refreshSelected()
      }
    }
  },
  methods: {
    refreshSelected() {
      this.$nextTick(() => {
        this.$refs.mySelect?.setSelected?.()
      })
    },
    change(value) {
      const item = this.options.find(row => row[this.idKey] === value) || {}
      this.$emit('change', item)
    },
    visibleChange(value) {
      this.show = value
      this.$refs.mySelect?.resetQuery?.()
      this.$emit('visible-change', value)
    },
    handleBlur() {
      this.$refs.mySelect?.blur?.()
    }
  }
}
</script>
