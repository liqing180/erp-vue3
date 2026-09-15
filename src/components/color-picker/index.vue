<template>
  <element-plus-color-picker
    ref="colorPickerRef"
    v-bind="$attrs"
    :model-value="sourceValue"
    :show-alpha="showAlpha"
    :color-format="colorFormat"
    :disabled="disabled"
    :size="elementSize"
    :popper-class="popperClass"
    :predefine="predefine"
    :teleported="appendToBody"
    @update:model-value="handleModelValue"
    @change="handleChange"
    @active-change="handleActiveChange"
  />
</template>

<script>
import { ElColorPicker as ElementPlusColorPicker } from 'element-plus'

export default {
  name: 'MyColorPicker',
  components: {
    ElementPlusColorPicker
  },
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String,
      default: undefined
    },
    value: {
      type: String,
      default: undefined
    },
    showAlpha: Boolean,
    appendToBody: {
      type: Boolean,
      default: true
    },
    colorFormat: {
      type: String,
      default: ''
    },
    disabled: Boolean,
    size: {
      type: String,
      default: ''
    },
    popperClass: {
      type: String,
      default: ''
    },
    predefine: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'update:modelValue',
    'update:value',
    'input',
    'change',
    'active-change'
  ],
  computed: {
    sourceValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    elementSize() {
      if (this.size === 'mini') return 'small'
      if (this.size === 'medium') return 'default'
      return this.size || undefined
    }
  },
  methods: {
    handleModelValue(value) {
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
    },
    handleChange(value) {
      this.$emit('change', value)
    },
    handleActiveChange(value) {
      this.$emit('active-change', value)
    },
    focus() {
      this.$refs.colorPickerRef?.focus?.()
    }
  }
}
</script>
