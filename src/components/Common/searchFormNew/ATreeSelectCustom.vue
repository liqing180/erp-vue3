<template>
  <el-tree-select
    v-model="selectedValue"
    :data="selectData || []"
    :node-key="valueKey"
    :props="{ value: valueKey, label: labelKey, children: 'children' }"
    :multiple="multiple"
    :check-strictly="checkStrictly"
    :size="size"
    :placeholder="placeholder || ''"
    show-checkbox
    check-on-click-node
    :render-after-expand="false"
    filterable
    clearable
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="1"
    style="width: 100%"
    @check="handleCheck"
    @change="handleChange"
    @clear="handleClear"
  />
</template>

<script>
import { ElTreeSelect, selectEmits } from 'element-plus'

export default {
  name: 'ATreeSelectCustom',
  components: {
    // TreeSelect 与 Select 使用相同事件；显式声明以支持项目的全局 dictReady mixin。
    ElTreeSelect: { ...ElTreeSelect, emits: selectEmits }
  },
  props: [
    'placeholder',
    'selectData',
    'value',
    'mapValue',
    'mapLabel',
    'checkStrictly',
    'multiple',
    'size',
    'type'
  ],
  emits: ['updateForm'],
  data() {
    return { selectedValue: undefined }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.selectedValue = this.multiple
          ? (value || []).map(item => item.value)
          : value?.value
      }
    }
  },
  computed: {
    valueKey() {
      return this.mapValue || 'value'
    },
    labelKey() {
      return this.mapLabel || 'title'
    }
  },
  methods: {
    handleCheck(data, { checkedNodes }) {
      // ERP-VUE2 SHOW_ALL：同时保留已勾选的父分类和子分类，接口接收 { value, label }。
      const value = checkedNodes.map(node => ({
        value: node[this.valueKey],
        label: node[this.labelKey]
      }))
      this.$emit('updateForm', { value, type: this.type })
    },
    handleChange(key) {
      if (this.multiple) return
      const find = nodes => {
        for (const node of nodes || []) {
          if (node[this.valueKey] === key) return node
          const child = find(node.children)
          if (child) return child
        }
      }
      const node = find(this.selectData)
      const value = node
        ? { value: node[this.valueKey], label: node[this.labelKey] }
        : undefined
      this.$emit('updateForm', { value, type: this.type })
    },
    handleClear() {
      this.$emit('updateForm', {
        value: this.multiple ? [] : undefined,
        type: this.type
      })
    }
  }
}
</script>
