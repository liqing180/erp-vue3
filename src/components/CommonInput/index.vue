<template>
  <div class="common-input" :title="title">
    <el-input-original
      ref="inputRef"
      v-bind="$attrs"
      :model-value="sourceValue"
      @update:model-value="handleModelValue"
    >
      <template
        v-for="(_, slotName) in $slots"
        :key="slotName"
        #[slotName]="props"
      >
        <slot :name="slotName" v-bind="props || {}" />
      </template>
    </el-input-original>
  </div>
</template>

<script>
import { ElInput } from 'element-plus'

export default {
  name: 'CommonInput',
  inheritAttrs: false,
  components: {
    'el-input-original': ElInput
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined
    },
    // 兼容 ERP-VUE2 迁移过程中仍使用 value / v-model:value 的页面。
    value: {
      type: [String, Number],
      default: undefined
    },
    title: {
      type: [String, Number],
      default: ''
    }
  },
  emits: ['update:modelValue', 'update:value', 'input'],
  computed: {
    sourceValue() {
      const value = this.modelValue !== undefined ? this.modelValue : this.value
      return value ?? ''
    }
  },
  methods: {
    handleModelValue(value) {
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
    },
    focus() {
      this.$refs.inputRef?.focus?.()
    },
    blur() {
      this.$refs.inputRef?.blur?.()
    },
    select() {
      this.$refs.inputRef?.select?.()
    },
    resizeTextarea() {
      this.$refs.inputRef?.resizeTextarea?.()
    }
  }
}
</script>

<style scoped>
.common-input {
  width: 100%;
}
</style>
