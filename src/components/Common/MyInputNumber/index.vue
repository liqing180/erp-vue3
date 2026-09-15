<template>
  <div
    @dragstart.prevent
    :class="[
      'w100',
      'el-input-number',
      inputNumberSize ? 'el-input-number--' + inputNumberSize : '',
      { 'is-disabled': inputNumberDisabled },
      { 'is-without-controls': !controls },
      { 'is-controls-right': controlsAtRight }
    ]"
  >
    <span
      v-if="controls"
      v-repeat-click="decrease"
      class="el-input-number__decrease"
      role="button"
      :class="{ 'is-disabled': minDisabled }"
      @keydown.enter="decrease"
    >
      <element-plus-icon>
        <ArrowDown v-if="controlsAtRight" />
        <Minus v-else />
      </element-plus-icon>
    </span>
    <span
      v-if="controls"
      v-repeat-click="increase"
      class="el-input-number__increase"
      role="button"
      :class="{ 'is-disabled': maxDisabled }"
      @keydown.enter="increase"
    >
      <element-plus-icon>
        <ArrowUp v-if="controlsAtRight" />
        <Plus v-else />
      </element-plus-icon>
    </span>
    <element-plus-input
      ref="input"
      v-bind="$attrs"
      :model-value="displayValue"
      :placeholder="placeholder"
      :disabled="inputNumberDisabled"
      :size="inputNumberSize"
      :max="max"
      :min="min"
      :name="name"
      :aria-label="label"
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
import {
  ElIcon as ElementPlusIcon,
  ElInput as ElementPlusInput,
  useFormDisabled,
  useFormSize,
  vRepeatClick
} from 'element-plus'
import { ArrowDown, ArrowUp, Minus, Plus } from '@element-plus/icons-vue'
import { getSplitType, numberStr } from '@/utils/numberTofixed/index.js'

export default {
  name: 'ElInputNumber',
  components: {
    ElementPlusInput,
    ElementPlusIcon,
    ArrowDown,
    ArrowUp,
    Minus,
    Plus
  },
  directives: {
    repeatClick: vRepeatClick
  },
  inheritAttrs: false,
  props: {
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
    modelValue: {
      default: undefined
    },
    // ERP-VUE2 历史 value/input 调用兼容。
    value: {
      default: undefined
    },
    disabled: Boolean,
    size: String,
    // ERP-VUE2 中 controls prop 已被移除，组件固定不显示加减按钮；
    // 保留 controlsPosition 仅保持原组件 API 形状。
    controlsPosition: {
      type: String,
      default: ''
    },
    name: String,
    label: String,
    placeholder: String,
    precision: {
      type: Number,
      validator(val) {
        return val >= 0 && val === parseInt(val, 10)
      }
    },
    minPrecision: {
      type: Number,
      validator(val) {
        return val >= 0 && val === parseInt(val, 10)
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
  setup() {
    // 对应 ERP-VUE2 的 elForm / elFormItem / $ELEMENT size、disabled 注入。
    // 使用 Element Plus 2.9.2 对外导出的表单 hooks，避免依赖私有实例。
    const formSize = useFormSize()
    const formDisabled = useFormDisabled()
    return {
      formSize,
      formDisabled
    }
  },
  data() {
    return {
      currentValue: 0,
      userInput: null,
      // ERP-VUE2 原组件固定关闭 controls。
      controls: false
    }
  },
  watch: {
    sourceValue: {
      immediate: true,
      handler(value) {
        let newVal = value === undefined ? value : Number(value)
        if (newVal !== undefined) {
          if (isNaN(newVal)) {
            return
          }

          if (this.stepStrictly) {
            const stepPrecision = this.getPrecision(this.step)
            const precisionFactor = Math.pow(10, stepPrecision)
            newVal =
              (Math.round(newVal / this.step) * precisionFactor * this.step) /
              precisionFactor
          }

          if (this.precision !== undefined) {
            newVal = this.toPrecision(newVal, this.precision)
          }
        }
        if (newVal >= this.max) newVal = this.max
        if (newVal <= this.min) newVal = this.min
        this.currentValue = newVal
        this.userInput = null
        this.emitInput(newVal)
      }
    }
  },
  computed: {
    sourceValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    minDisabled() {
      return this._decrease(this.sourceValue, this.step) < this.min
    },
    maxDisabled() {
      return this._increase(this.sourceValue, this.step) > this.max
    },
    numPrecision() {
      const value = this.sourceValue
      const { step, getPrecision, precision } = this
      const stepPrecision = getPrecision(step)
      if (precision !== undefined) {
        if (stepPrecision > precision) {
          console.warn(
            '[Element Warn][InputNumber]precision should not be less than the decimal places of step'
          )
        }
        return precision
      }
      return Math.max(getPrecision(value), stepPrecision)
    },
    controlsAtRight() {
      return this.controls && this.controlsPosition === 'right'
    },
    inputNumberSize() {
      // Element UI 的 mini / medium 映射到 Element Plus 对应尺寸；
      // 其他值以及 Form/FormItem/全局尺寸由 useFormSize 保留。
      const size = this.formSize
      if (size === 'mini') return 'small'
      if (size === 'medium') return 'default'
      return size
    },
    inputNumberDisabled() {
      return this.formDisabled
    },
    displayValue() {
      if (this.userInput !== null) {
        return this.userInput
      }

      let currentValue = this.currentValue

      if (typeof currentValue === 'number') {
        if (this.stepStrictly) {
          const stepPrecision = this.getPrecision(this.step)
          const precisionFactor = Math.pow(10, stepPrecision)
          currentValue =
            (Math.round(currentValue / this.step) *
              precisionFactor *
              this.step) /
            precisionFactor
        }

        if (this.precision !== undefined) {
          const displayPrecision =
            this.minPrecision === undefined
              ? this.precision
              : Math.max(
                  Math.min(this.minPrecision, this.precision),
                  Math.min(this.getPrecision(currentValue), this.precision)
                )
          currentValue = currentValue.toFixed(displayPrecision)
        }
      }

      return currentValue
    }
  },
  methods: {
    emitInput(value) {
      // input 保留 ERP-VUE2 事件；两个 update 事件承接 Vue3 v-model。
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
    },
    toPrecision(num, precision) {
      if (precision === undefined) precision = this.numPrecision
      if (this.minPrecision !== undefined) {
        return Number(numberStr(num, precision, false))
      }
      return parseFloat(
        Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision)
      )
    },
    getPrecision(value) {
      if (value === undefined) return 0
      const valueString = value.toString()
      const dotPosition = valueString.indexOf('.')
      let precision = 0
      if (dotPosition !== -1) {
        precision = valueString.length - dotPosition - 1
      }
      return precision
    },
    _increase(val, step) {
      if (typeof val !== 'number' && val !== undefined) {
        return this.currentValue
      }

      const precisionFactor = Math.pow(10, this.numPrecision)
      return this.toPrecision(
        (precisionFactor * val + precisionFactor * step) / precisionFactor
      )
    },
    _decrease(val, step) {
      if (typeof val !== 'number' && val !== undefined) {
        return this.currentValue
      }

      const precisionFactor = Math.pow(10, this.numPrecision)
      return this.toPrecision(
        (precisionFactor * val - precisionFactor * step) / precisionFactor
      )
    },
    increase() {
      if (this.inputNumberDisabled || this.maxDisabled) return
      const value = this.sourceValue || 0
      const newVal = this._increase(value, this.step)
      this.setCurrentValue(newVal)
    },
    decrease() {
      if (this.inputNumberDisabled || this.minDisabled) return
      const value = this.sourceValue || 0
      const newVal = this._decrease(value, this.step)
      this.setCurrentValue(newVal)
    },
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
    setCurrentValue(newVal) {
      const oldVal = this.currentValue
      if (typeof newVal === 'number' && this.precision !== undefined) {
        newVal = this.toPrecision(newVal, this.precision)
      }
      if (newVal >= this.max) newVal = this.max
      if (newVal <= this.min) newVal = this.min
      if (oldVal === newVal) return
      this.userInput = null
      this.emitInput(newVal)
      this.$emit('change', newVal, oldVal)
      this.currentValue = newVal
    },
    handleInput(value) {
      this.userInput = value
    },
    handleInputChange(value) {
      const splitType = getSplitType()
      if (splitType === '2') {
        value = value.replace(/\./g, '')
        value = value.replace(',', '.')
      } else {
        value = value.replace(/,/g, '')
      }
      const newVal = value === '' ? undefined : Number(value)
      if (!isNaN(newVal) || value === '') {
        this.setCurrentValue(newVal)
      }
      this.userInput = null
    },
    focus() {
      this.$refs.input?.focus()
    },
    blur() {
      this.$refs.input?.blur()
    },
    select() {
      this.$refs.input?.select()
    },
    syncAria() {
      const innerInput = this.$refs.input?.input
      if (!innerInput) return
      innerInput.setAttribute('role', 'spinbutton')
      innerInput.setAttribute('aria-valuemax', this.max)
      innerInput.setAttribute('aria-valuemin', this.min)
      innerInput.setAttribute('aria-valuenow', this.currentValue)
      innerInput.setAttribute('aria-disabled', this.inputNumberDisabled)
    }
  },
  mounted() {
    this.syncAria()
  },
  updated() {
    this.syncAria()
  }
}
</script>
