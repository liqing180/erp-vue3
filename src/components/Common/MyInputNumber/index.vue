<template>
  <div
    class="erp-input-number el-input-number is-without-controls"
    :class="[
      inputSize ? `el-input-number--${inputSize}` : '',
      { 'is-disabled': disabled }
    ]"
    @dragstart.prevent
  >
    <element-plus-input
      ref="inputRef"
      :model-value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :size="inputSize"
      :name="name"
      :aria-label="label"
      role="spinbutton"
      :aria-valuemax="max"
      :aria-valuemin="min"
      :aria-valuenow="currentValue"
      @keydown.up.prevent="increase"
      @keydown.down.prevent="decrease"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
      @change="handleInputChange"
    />
  </div>
</template>

<script>
import { ElInput as ElementPlusInput } from 'element-plus'
import { getSplitType, numberStr } from '@/utils/numberTofixed/index.js'

export default {
  name: 'ErpInputNumber',
  components: {
    ElementPlusInput
  },
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Number, String],
      default: undefined
    },
    // 兼容迁移过程中仍使用 value / v-model:value 的页面。
    value: {
      type: [Number, String],
      default: undefined
    },
    step: {
      type: Number,
      default: 1
    },
    stepStrictly: {
      type: Boolean,
      default: false
    },
    max: {
      type: Number,
      default: Infinity
    },
    min: {
      type: Number,
      default: -Infinity
    },
    disabled: Boolean,
    size: {
      type: String,
      default: ''
    },
    controlsPosition: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    precision: {
      type: Number,
      default: undefined,
      validator(value) {
        return value >= 0 && value === parseInt(value, 10)
      }
    },
    minPrecision: {
      type: Number,
      default: undefined,
      validator(value) {
        return value >= 0 && value === parseInt(value, 10)
      }
    }
  },
  emits: [
    'update:modelValue',
    'update:value',
    'input',
    'change',
    'blur',
    'focus'
  ],
  data() {
    return {
      currentValue: undefined,
      userInput: null
    }
  },
  computed: {
    sourceValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    inputSize() {
      if (this.size === 'mini') return 'small'
      if (this.size === 'medium') return 'default'
      return this.size
    },
    numPrecision() {
      const stepPrecision = this.getPrecision(this.step)
      if (this.precision !== undefined) {
        return this.precision
      }
      return Math.max(this.getPrecision(this.currentValue), stepPrecision)
    },
    displayValue() {
      if (this.userInput !== null) {
        return this.userInput
      }

      let value = this.currentValue
      if (value === undefined || value === null || value === '') {
        return ''
      }

      if (this.stepStrictly) {
        value = this.normalizeStep(value)
      }

      if (this.precision !== undefined) {
        const displayPrecision =
          this.minPrecision === undefined
            ? this.precision
            : Math.max(
                Math.min(this.minPrecision, this.precision),
                Math.min(this.getPrecision(value), this.precision)
              )
        return Number(value).toFixed(displayPrecision)
      }

      return value
    }
  },
  watch: {
    sourceValue: {
      immediate: true,
      handler(value) {
        this.syncExternalValue(value)
      }
    }
  },
  methods: {
    syncExternalValue(value) {
      if (value === undefined || value === null || value === '') {
        this.currentValue = value === '' ? undefined : value
        this.userInput = null
        return
      }

      const numberValue = Number(value)
      if (Number.isNaN(numberValue)) return

      this.currentValue = this.normalizeValue(numberValue)
      this.userInput = null
    },
    normalizeValue(value) {
      let nextValue = value

      if (this.stepStrictly) {
        nextValue = this.normalizeStep(nextValue)
      }

      if (this.precision !== undefined) {
        nextValue = this.toPrecision(nextValue, this.precision)
      }

      if (nextValue >= this.max) nextValue = this.max
      if (nextValue <= this.min) nextValue = this.min
      return nextValue
    },
    normalizeStep(value) {
      const stepPrecision = this.getPrecision(this.step)
      const precisionFactor = Math.pow(10, stepPrecision)
      return (
        (Math.round(value / this.step) * precisionFactor * this.step) /
        precisionFactor
      )
    },
    toPrecision(num, precision = this.numPrecision) {
      if (this.minPrecision !== undefined) {
        return Number(numberStr(num, precision, false))
      }
      const factor = Math.pow(10, precision)
      return parseFloat(Math.round(num * factor) / factor)
    },
    getPrecision(value) {
      if (value === undefined || value === null || value === '') return 0
      const valueString = value.toString()
      const dotPosition = valueString.indexOf('.')
      return dotPosition === -1 ? 0 : valueString.length - dotPosition - 1
    },
    increase() {
      if (this.disabled) return
      const value = Number(this.currentValue ?? 0)
      const precisionFactor = Math.pow(10, this.numPrecision)
      const nextValue = this.toPrecision(
        (precisionFactor * value + precisionFactor * this.step) /
          precisionFactor
      )
      this.setCurrentValue(nextValue)
    },
    decrease() {
      if (this.disabled) return
      const value = Number(this.currentValue ?? 0)
      const precisionFactor = Math.pow(10, this.numPrecision)
      const nextValue = this.toPrecision(
        (precisionFactor * value - precisionFactor * this.step) /
          precisionFactor
      )
      this.setCurrentValue(nextValue)
    },
    setCurrentValue(value) {
      const oldValue = this.currentValue
      const nextValue =
        value === undefined || value === ''
          ? undefined
          : this.normalizeValue(Number(value))

      if (oldValue === nextValue) {
        this.userInput = null
        return
      }

      this.currentValue = nextValue
      this.userInput = null
      this.$emit('update:modelValue', nextValue)
      this.$emit('update:value', nextValue)
      this.$emit('input', nextValue)
      this.$emit('change', nextValue, oldValue)
    },
    handleInput(value) {
      this.userInput = value
    },
    handleInputChange(value) {
      let normalized = String(value ?? '')
      const splitType = getSplitType()

      if (splitType === '2') {
        normalized = normalized.replace(/\./g, '').replace(',', '.')
      } else {
        normalized = normalized.replace(/,/g, '')
      }

      if (normalized === '') {
        this.setCurrentValue(undefined)
        return
      }

      const numberValue = Number(normalized)
      if (!Number.isNaN(numberValue)) {
        this.setCurrentValue(numberValue)
      } else {
        this.userInput = null
      }
    },
    handleBlur(event) {
      this.userInput = null
      this.$emit('blur', event)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
    focus() {
      this.$refs.inputRef?.focus()
    },
    blur() {
      this.$refs.inputRef?.blur()
    },
    select() {
      this.$refs.inputRef?.select()
    }
  }
}
</script>

<style scoped>
.erp-input-number {
  width: 100%;
}

.erp-input-number :deep(.el-input) {
  width: 100%;
}
</style>
