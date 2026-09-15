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
    :teleported="appendToBody"
    @change="change"
    @visible-change="visibleChange"
  >
    <el-option-group
      v-for="group in options"
      :key="group.label"
      :label="group.label"
    >
      <el-option
        v-for="item in group.options"
        :key="item[idKey]"
        :label="item[labelKey]"
        :value="item[idKey]"
      />
    </el-option-group>
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
    },
    appendToBody: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change', 'visible-change'],
  computed: {
    elementSize() {
      if (this.size === 'mini') return 'small'
      if (this.size === 'medium') return 'default'
      return this.size
    },
    optionList() {
      return this.options.flatMap(group => group.options || [])
    },
    comShow() {
      if (
        this.id &&
        this.optionList.find(item => item[this.idKey] === this.id)
      ) {
        return this.id
      }
      return this.label || this.id
    }
  },
  watch: {
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
      const item = this.optionList.find(row => row[this.idKey] === value) || {}
      this.$emit('change', item)
    },
    visibleChange(value) {
      this.$refs.mySelect?.resetQuery?.()
      this.$emit('visible-change', value)
    }
  }
}
</script>
