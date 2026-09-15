<template>
  <div class="erp-input" :title="title">
    <element-plus-input
      ref="inputRef"
      v-bind="$attrs"
      :model-value="sourceValue"
      :size="inputSize"
      :disabled="disabled"
      :autocomplete="resolvedAutocomplete"
      :aria-label="label || undefined"
      @update:model-value="handleModelValue"
      @change="handleChange"
      @clear="handleClear"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionupdate="handleCompositionUpdate"
      @compositionend="handleCompositionEnd"
    >
      <template
        v-for="(_, slotName) in $slots"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps || {}" />
      </template>
    </element-plus-input>
  </div>
</template>

<script>
import { ElInput as ElementPlusInput } from 'element-plus'

export default {
  name: 'MyInput',
  components: {
    ElementPlusInput
  },
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined
    },
    // ERP-VUE2 历史 value/input 调用兼容。
    value: {
      type: [String, Number],
      default: undefined
    },
    size: {
      type: String,
      default: ''
    },
    disabled: Boolean,
    label: {
      type: String,
      default: ''
    },
    title: {
      type: [String, Number],
      default: ''
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    // ERP-VUE2 保留的旧属性；Element Plus 使用 autocomplete。
    autoComplete: {
      type: String,
      default: undefined,
      validator() {
        if (import.meta.env.DEV) {
          console.warn(
            "[ERP Input] 'auto-complete' 已废弃，请使用 'autocomplete'。"
          )
        }
        return true
      }
    }
  },
  emits: [
    'update:modelValue',
    'update:value',
    'input',
    'change',
    'clear',
    'focus',
    'blur',
    'compositionstart',
    'compositionupdate',
    'compositionend'
  ],
  computed: {
    sourceValue() {
      const value = this.modelValue !== undefined ? this.modelValue : this.value
      return value ?? ''
    },
    inputSize() {
      if (this.size === 'mini') return 'small'
      if (this.size === 'medium') return 'default'
      return this.size || undefined
    },
    resolvedAutocomplete() {
      return this.autoComplete || this.autocomplete
    },
    upperLimit() {
      return this.$attrs.maxlength
    }
  },
  methods: {
    emitInput(value) {
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
    },
    handleModelValue(value) {
      this.emitInput(value)
    },
    handleChange(value) {
      let nextValue = String(value ?? '')
      const upperLimit = Number(this.upperLimit)

      // ERP-VUE2 MyInput 相对 Element UI 原组件的核心改动：
      // change 时再次保证 maxlength，并将截断值同步回父级。
      if (
        this.upperLimit !== undefined &&
        this.upperLimit !== null &&
        this.upperLimit !== '' &&
        Number.isFinite(upperLimit) &&
        nextValue.length > upperLimit
      ) {
        nextValue = nextValue.slice(0, upperLimit)
        this.emitInput(nextValue)
        this.$nextTick(() => this.setNativeInputValue(nextValue))
      }

      this.$emit('change', nextValue)
    },
    handleClear() {
      this.$emit('clear')
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleCompositionStart(event) {
      // ERP-VUE2 在 Element UI 原实现基础上额外透出了三个 composition 事件。
      this.$emit('compositionstart', event)
    },
    handleCompositionUpdate(event) {
      this.$emit('compositionupdate', event)
    },
    handleCompositionEnd(event) {
      this.$emit('compositionend', event)
    },
    getInput() {
      const input = this.$refs.inputRef
      return input?.input || input?.textarea || input?.ref
    },
    setNativeInputValue(value) {
      const input = this.getInput()
      if (input && input.value !== value) {
        input.value = value
      }
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
    inputSelect() {
      this.select()
    },
    clear() {
      this.$refs.inputRef?.clear?.()
    },
    resizeTextarea() {
      this.$refs.inputRef?.resizeTextarea?.()
    }
  }
}
</script>

<style scoped>
.erp-input {
  width: 100%;
}
</style>
