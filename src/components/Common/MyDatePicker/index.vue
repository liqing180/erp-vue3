<template>
  <element-plus-date-picker
    ref="pickerRef"
    v-bind="$attrs"
    :model-value="sourceValue"
    :type="type"
    :size="elementSize"
    :format="normalizedFormat"
    :value-format="normalizedValueFormat"
    :disabled-date="legacyPickerOptions.disabledDate"
    :shortcuts="legacyPickerOptions.shortcuts"
    :cell-class-name="legacyPickerOptions.cellClassName"
    @update:model-value="handleModelValue"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    @visible-change="handleVisibleChange"
    @calendar-change="handleCalendarChange"
    @panel-change="handlePanelChange"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </element-plus-date-picker>
</template>

<script>
import { ElDatePicker as ElementPlusDatePicker } from 'element-plus'

function normalizeDateFormat(format) {
  if (!format || format === 'timestamp') return format
  return format.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD')
}

export default {
  name: 'MyDatePicker',
  components: {
    ElementPlusDatePicker
  },
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Date, Array],
      default: undefined
    },
    // 兼容迁移阶段仍使用 value / v-model:value 的页面。
    value: {
      type: [String, Number, Date, Array],
      default: undefined
    },
    type: {
      type: String,
      default: 'date'
    },
    size: {
      type: String,
      default: ''
    },
    format: {
      type: String,
      default: undefined
    },
    valueFormat: {
      type: String,
      default: undefined
    },
    pickerOptions: {
      type: Object,
      default: () => ({})
    }
  },
  emits: [
    'update:modelValue',
    'update:value',
    'input',
    'change',
    'blur',
    'focus',
    'visible-change',
    'calendar-change',
    'panel-change'
  ],
  computed: {
    sourceValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    elementSize() {
      if (this.size === 'mini') return 'small'
      if (this.size === 'medium') return 'default'
      return this.size || undefined
    },
    normalizedFormat() {
      return normalizeDateFormat(this.format)
    },
    normalizedValueFormat() {
      return normalizeDateFormat(this.valueFormat)
    },
    legacyPickerOptions() {
      const options = this.pickerOptions || {}
      return {
        disabledDate: options.disabledDate,
        shortcuts: options.shortcuts,
        cellClassName: options.cellClassName
      }
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
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
    handleVisibleChange(value) {
      this.$emit('visible-change', value)
    },
    handleCalendarChange(value) {
      this.$emit('calendar-change', value)
    },
    handlePanelChange(date, mode, view) {
      this.$emit('panel-change', date, mode, view)
    },
    focus() {
      this.$refs.pickerRef?.focus?.()
    },
    blur() {
      this.$refs.pickerRef?.blur?.()
    },
    handleOpen() {
      this.$refs.pickerRef?.handleOpen?.()
    },
    handleClose() {
      this.$refs.pickerRef?.handleClose?.()
    }
  }
}
</script>
