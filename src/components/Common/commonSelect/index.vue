<template>
  <el-select
    :model-value="comShow"
    :disabled="disabled"
    placeholder=""
    style="width: 100%"
    :loading="loading"
    :clearable="clearable"
    :filterable="filterable"
    @change="change"
    @visible-change="visibleChange"
  >
    <el-option
      v-for="item in options"
      :key="item[idKey]"
      :label="item[labelKey]"
      :value="item[idKey]"
    >
      <slot :item="item"></slot>
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
      type: [Boolean],
      default: false
    },
    loading: {
      type: [Boolean],
      default: false
    },
    labelKey: {
      type: [String],
      default: 'label'
    },
    idKey: {
      type: [String],
      default: 'value'
    },
    options: {
      type: [Array],
      default() {
        return []
      }
    },
    filterable: {
      type: [Boolean],
      default: false
    },
    clearable: {
      type: [Boolean],
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    comShow() {
      if (this.id && this.options.find(item => item[this.idKey] === this.id)) {
        return this.id
      } else {
        return this.label || this.id
      }
    }
  },
  methods: {
    change(value) {
      const item = this.options.find(item => item[this.idKey] === value) || {}
      this.$emit('changeItem', item)
    },
    visibleChange(value) {
      this.$emit('visible-change', value)
    }
  },
  emits: ['changeItem', 'visible-change']
}
</script>
