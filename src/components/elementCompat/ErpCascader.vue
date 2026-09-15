<template>
  <ElCascaderOriginal
    ref="cascaderRef"
    v-bind="$attrs"
    :model-value="sourceValue"
    :filterable="filterable"
    @update:model-value="handleUpdate"
  >
    <template
      v-for="(_, slotName) in $slots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </ElCascaderOriginal>
</template>

<script>
import { ElCascader } from 'element-plus'

export default {
  name: 'ErpCascader',
  inheritAttrs: false,
  components: {
    ElCascaderOriginal: ElCascader
  },
  props: {
    modelValue: {
      default: undefined
    },
    value: {
      default: undefined
    },
    filterable: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'update:value', 'input'],
  computed: {
    sourceValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  methods: {
    handleUpdate(value) {
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
    },
    focus() {
      this.$refs.cascaderRef?.focus?.()
    },
    blur() {
      this.$refs.cascaderRef?.blur?.()
    }
  }
}
</script>
