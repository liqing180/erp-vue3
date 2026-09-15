<template>
  <el-select
    :value="comShow"
    :disabled="disabled"
    placeholder=""
    style="width: 100%"
    :loading="loading"
    :clearable="clearable"
    :filterable="filterable"
    @change="change"
    :size="size"
    @visible-change="visibleChange"
    :popper-append-to-body="appendToBody"
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
      >
      </el-option>
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
    },
    size: {
      type: [String],
      default: undefined
    },
    appendToBody: {
      type: [Boolean],
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    comShow() {
      const list = []
      this.options.forEach(item => {
        if (item.options) {
          list.push(...item.options)
        }
      })
      if (this.id && list.find(item => item[this.idKey] === this.id)) {
        return this.id
      } else {
        return this.label || this.id
      }
    }
  },
  methods: {
    change(value) {
      const list = []
      this.options.forEach(item => {
        if (item.options) {
          list.push(...item.options)
        }
      })
      const item = list.find(item => item[this.idKey] === value) || {}
      this.$emit('change', item)
    },
    visibleChange(value) {
      this.$emit('visible-change', value)
    }
  },
  emits: ['change', 'visible-change']
}
</script>
