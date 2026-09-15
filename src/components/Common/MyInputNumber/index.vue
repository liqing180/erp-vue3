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
      v-bind="$attrs"
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
    // ERP-VUE2 固定隐藏 controls；保留此 prop 仅兼容历史调用参数。
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
    minDisabled() {
      return this._decrease(this.currentValue, this.step) < this.min
    },
    maxDisabled() {
      return this._increase(this.currentValue, this.step) > this.max
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
    emitValue(value, oldValue, emitChange = false) {
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
      if (emitChange) {
        this.$emit('change', value, oldValue)
      }
    },
    syncExternalValue(value) {
      if (value === undefined) {
        this.currentValue = undefined
        this.userInput = null
        return
      }

      // 保留 ERP-VUE2 行为：外部 null / '' / 数字字符串均先 Number 化。
      const numberValue = Number(value)
      if (Number.isNaN(numberValue)) return

      const normalizedValue = this.normalizeValue(numberValue)
      this.currentValue = normalizedValue
      this.userInput = null

      // 旧组件会通过 input 将规范化后的值同步回父级。Vue3 仅在值确实
      // 发生类型/范围/精度变化时回写，避免无意义的更新循环。
      if (!Object.is(value, normalizedValue)) {
        this.emitValue(normalizedValue)
      }
    },
    normalizeValue(value) {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return undefined
      }

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
    _increase(value, step) {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return this.currentValue
      }
      const precisionFactor = Math.pow(10, this.numPrecision)
      return this.toPrecision(
        (precisionFactor * value + precisionFactor * step) / precisionFactor
      )
    },
    _decrease(value, step) {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return this.currentValue
      }
      const precisionFactor = Math.pow(10, this.numPrecision)
      return this.toPrecision(
        (precisionFactor * value - precisionFactor * step) / precisionFactor
      )
    },
    increase() {
      if (this.disabled || this.maxDisabled) return
      const value = Number(this.currentValue ?? 0)
      this.setCurrentValue(this._increase(value, this.step))
    },
    decrease() {
      if (this.disabled || this.minDisabled) return
      const value = Number(this.currentValue ?? 0)
      this.setCurrentValue(this._decrease(value, this.step))
    },
    setCurrentValue(value) {
      const oldValue = this.currentValue

      let nextValue
      if (value === undefined || value === '') {
        nextValue = undefined
      } else {
        const numberValue = Number(value)
        if (Number.isNaN(numberValue)) {
          this.userInput = null
          return
        }
        nextValue = this.normalizeValue(numberValue)
      }

      if (Object.is(oldValue, nextValue)) {
        this.userInput = null
        return
      }

      this.currentValue = nextValue
      this.userInput = null
      this.emitValue(nextValue, oldValue, true)
    },
    handleInput(value) {
      this.userInput = value
    },
    parseInputValue(value) {
      let normalized = String(value ?? '')

      if (getSplitType() === '2') {
        // 印尼：1.234,56 -> 1234.56
        normalized = normalized.replace(/\./g, '').replace(',', '.')
      } else {
        // 默认：1,234.56 -> 1234.56
        normalized = normalized.replace(/,/g, '')
      }

      if (normalized === '') return undefined

      const numberValue = Number(normalized)
      return Number.isNaN(numberValue) ? null : numberValue
    },
    handleInputChange(value) {
      const numberValue = this.parseInputValue(value)
      if (numberValue === null) {
        this.userInput = null
        return
      }
      this.setCurrentValue(numberValue)
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
