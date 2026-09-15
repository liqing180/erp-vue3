<template>
  <element-plus-date-picker
    ref="pickerRef"
    v-bind="$attrs"
    :model-value="sourceValue"
    :type="type"
    :size="elementSize"
    :format="normalizedFormat"
    :value-format="normalizedValueFormat"
    :default-value="normalizedDefaultValue"
    :default-time="normalizedDefaultTime"
    :range-separator="rangeSeparator"
    :unlink-panels="unlinkPanels"
    :validate-event="validateEvent"
    :arrow-control="timeArrowControl"
    :placement="placement"
    :popper-class="mergedPopperClass"
    :disabled-date="legacyPickerOptions.disabledDate"
    :shortcuts="legacyPickerOptions.shortcuts"
    :cell-class-name="legacyPickerOptions.cellClassName"
    :disabled-hours="selectableRangeHandlers.disabledHours"
    :disabled-minutes="selectableRangeHandlers.disabledMinutes"
    :disabled-seconds="selectableRangeHandlers.disabledSeconds"
    @update:model-value="handleModelValue"
    @change="handleChange"
    @clear="handleClear"
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

  <Teleport v-if="sidecarTarget && shouldShowTimeSidecar" :to="sidecarTarget">
    <erp-date-time-wheel
      ref="timeWheelRef"
      :cur-value="sidecarTimestamp"
      :default-time="sidecarDefaultTime"
      @pick="handleTimeSidecarPick"
    />
  </Teleport>
</template>

<script>
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { ElDatePicker as ElementPlusDatePicker } from 'element-plus'
import ErpDateTimeWheel from './src/basic/TimePicker.vue'

dayjs.extend(customParseFormat)

let pickerSeed = 0

const PLACEMENT_MAP = {
  left: 'bottom-start',
  center: 'bottom',
  right: 'bottom-end'
}

function normalizeDateFormat(format) {
  if (!format) return format
  if (format === 'timestamp') return 'x'
  return format.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD')
}

function toTimeDate(value) {
  if (value instanceof Date) return new Date(value)
  if (typeof value !== 'string') return value

  const [hours = '0', minutes = '0', seconds = '0'] = value.split(':')
  const date = new Date(2000, 0, 1)
  date.setHours(Number(hours) || 0, Number(minutes) || 0, Number(seconds) || 0, 0)
  return date
}

function toDateValue(value) {
  if (value instanceof Date) return new Date(value)
  if (value === undefined || value === null || value === '') return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date
}

function parseClock(value) {
  if (value instanceof Date) {
    return value.getHours() * 3600 + value.getMinutes() * 60 + value.getSeconds()
  }
  if (typeof value !== 'string') return null
  const [hours, minutes, seconds = '0'] = value.trim().split(':')
  const h = Number(hours)
  const m = Number(minutes)
  const s = Number(seconds)
  if ([h, m, s].some(Number.isNaN) || h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) {
    return null
  }
  return h * 3600 + m * 60 + s
}

function parseSelectableRanges(selectableRange) {
  if (!selectableRange) return []
  const ranges = Array.isArray(selectableRange) ? selectableRange : [selectableRange]
  return ranges
    .map(range => {
      if (Array.isArray(range) && range.length === 2) {
        const start = parseClock(range[0])
        const end = parseClock(range[1])
        return start === null || end === null ? null : [start, end]
      }
      if (typeof range !== 'string') return null
      const parts = range.split(/\s+-\s+/)
      if (parts.length !== 2) return null
      const start = parseClock(parts[0])
      const end = parseClock(parts[1])
      return start === null || end === null ? null : [start, end]
    })
    .filter(Boolean)
}

function isSecondAllowed(ranges, secondOfDay) {
  return ranges.some(([start, end]) => secondOfDay >= start && secondOfDay <= end)
}

export default {
  name: 'MyDatePicker',
  components: {
    ElementPlusDatePicker,
    ErpDateTimeWheel
  },
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Date, Array],
      default: undefined
    },
    // ERP-VUE2 value/input 调用兼容。
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
    defaultValue: {
      type: [String, Number, Date, Array],
      default: undefined
    },
    defaultTime: {
      type: [String, Date, Array],
      default: undefined
    },
    rangeSeparator: {
      type: String,
      default: '-'
    },
    pickerOptions: {
      type: Object,
      default: () => ({})
    },
    unlinkPanels: Boolean,
    validateEvent: {
      type: Boolean,
      default: true
    },
    timeArrowControl: Boolean,
    align: {
      type: String,
      default: 'left'
    },
    popperClass: {
      type: String,
      default: ''
    }
  },
  emits: [
    'update:modelValue',
    'update:value',
    'input',
    'change',
    'clear',
    'blur',
    'focus',
    'visible-change',
    'calendar-change',
    'panel-change'
  ],
  data() {
    const instanceClass = `erp-my-date-picker-${++pickerSeed}`
    return {
      instanceClass,
      sidecarTarget: null,
      sidecarMountTimer: null,
      sidecarMountAttempts: 0
    }
  },
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
    normalizedDefaultValue() {
      if (Array.isArray(this.defaultValue)) {
        return this.defaultValue.map(toDateValue)
      }
      return toDateValue(this.defaultValue)
    },
    normalizedDefaultTime() {
      if (Array.isArray(this.defaultTime)) {
        return this.defaultTime.map(toTimeDate)
      }
      return toTimeDate(this.defaultTime)
    },
    sidecarDefaultTime() {
      if (Array.isArray(this.defaultTime)) return this.defaultTime[0]
      return this.defaultTime
    },
    placement() {
      return PLACEMENT_MAP[this.align] || PLACEMENT_MAP.left
    },
    shouldShowTimeSidecar() {
      return !this.type.includes('range') && !['time', 'time-select'].includes(this.type)
    },
    mergedPopperClass() {
      return [
        this.popperClass,
        this.instanceClass,
        this.shouldShowTimeSidecar ? 'erp-my-date-picker-single-panel' : ''
      ]
        .filter(Boolean)
        .join(' ')
    },
    legacyPickerOptions() {
      const options = this.pickerOptions || {}
      return {
        disabledDate: options.disabledDate,
        shortcuts: (options.shortcuts || []).map(this.normalizeShortcut),
        cellClassName: options.cellClassName
      }
    },
    selectableRanges() {
      return parseSelectableRanges(this.pickerOptions?.selectableRange)
    },
    selectableRangeHandlers() {
      if (!this.selectableRanges.length) {
        return {
          disabledHours: undefined,
          disabledMinutes: undefined,
          disabledSeconds: undefined
        }
      }

      return {
        disabledHours: () => {
          const disabled = []
          for (let hour = 0; hour < 24; hour++) {
            let allowed = false
            for (let minute = 0; minute < 60 && !allowed; minute++) {
              allowed = isSecondAllowed(this.selectableRanges, hour * 3600 + minute * 60)
            }
            if (!allowed) disabled.push(hour)
          }
          return disabled
        },
        disabledMinutes: hour => {
          const disabled = []
          for (let minute = 0; minute < 60; minute++) {
            let allowed = false
            for (let second = 0; second < 60 && !allowed; second++) {
              allowed = isSecondAllowed(
                this.selectableRanges,
                hour * 3600 + minute * 60 + second
              )
            }
            if (!allowed) disabled.push(minute)
          }
          return disabled
        },
        disabledSeconds: (hour, minute) => {
          const disabled = []
          for (let second = 0; second < 60; second++) {
            if (
              !isSecondAllowed(
                this.selectableRanges,
                hour * 3600 + minute * 60 + second
              )
            ) {
              disabled.push(second)
            }
          }
          return disabled
        }
      }
    },
    sourceDate() {
      if (Array.isArray(this.sourceValue)) return null
      if (this.sourceValue instanceof Date) return new Date(this.sourceValue)
      if (this.sourceValue === undefined || this.sourceValue === null || this.sourceValue === '') {
        return null
      }

      if (this.normalizedValueFormat === 'x') {
        const date = new Date(Number(this.sourceValue))
        return Number.isNaN(date.getTime()) ? null : date
      }

      if (typeof this.sourceValue === 'string' && this.normalizedValueFormat) {
        const parsed = dayjs(this.sourceValue, this.normalizedValueFormat, true)
        return parsed.isValid() ? parsed.toDate() : null
      }

      const parsed = dayjs(this.sourceValue)
      return parsed.isValid() ? parsed.toDate() : null
    },
    sidecarTimestamp() {
      return this.sourceDate?.getTime()
    }
  },
  beforeUnmount() {
    clearTimeout(this.sidecarMountTimer)
    this.removeSidecarTarget()
  },
  methods: {
    emitModelValue(value) {
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
    },
    normalizeShortcut(shortcut) {
      if (!shortcut || typeof shortcut !== 'object' || shortcut.value !== undefined) {
        return shortcut
      }
      if (typeof shortcut.onClick !== 'function') return shortcut

      return {
        ...shortcut,
        value: () => {
          let pickedValue
          const pickerCompat = {
            $emit(event, value) {
              if (event === 'pick') pickedValue = value
            }
          }
          const result = shortcut.onClick(pickerCompat)
          return pickedValue ?? result
        }
      }
    },
    serializeDate(date) {
      if (this.normalizedValueFormat === 'x') return date.getTime()
      if (this.normalizedValueFormat) {
        return dayjs(date).format(this.normalizedValueFormat)
      }
      return date
    },
    handleModelValue(value) {
      this.emitModelValue(value)
    },
    handleChange(value) {
      this.$emit('change', value)
    },
    handleClear() {
      this.$emit('clear')
    },
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
    handleVisibleChange(value) {
      this.$emit('visible-change', value)
      if (value && this.shouldShowTimeSidecar) {
        this.sidecarMountAttempts = 0
        this.$nextTick(this.mountSidecarTarget)
      }
    },
    handleCalendarChange(value) {
      this.$emit('calendar-change', value)
    },
    handlePanelChange(date, mode, view) {
      this.$emit('panel-change', date, mode, view)
    },
    handleTimeSidecarPick(date) {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) return
      if (this.type !== 'datetime') return
      this.emitModelValue(this.serializeDate(date))
    },
    mountSidecarTarget() {
      clearTimeout(this.sidecarMountTimer)
      const popper = document.querySelector(`.${this.instanceClass}`)
      const bodyWrapper = popper?.querySelector('.el-picker-panel__body-wrapper')

      if (!bodyWrapper) {
        if (this.sidecarMountAttempts < 8) {
          this.sidecarMountAttempts += 1
          this.sidecarMountTimer = setTimeout(this.mountSidecarTarget, 30)
        }
        return
      }

      let target = bodyWrapper.querySelector('.erp-date-time-sidecar-host')
      if (!target) {
        target = document.createElement('div')
        target.className = 'erp-date-time-sidecar-host'
        bodyWrapper.appendChild(target)
      }
      this.sidecarTarget = target
    },
    removeSidecarTarget() {
      const target = this.sidecarTarget
      this.sidecarTarget = null
      target?.parentNode?.removeChild(target)
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

<style scoped>
:global(.erp-my-date-picker-single-panel .el-date-picker) {
  width: 467px;
}

:global(.erp-my-date-picker-single-panel .el-picker-panel__body-wrapper) {
  display: flex;
}

:global(.erp-my-date-picker-single-panel .el-picker-panel__body) {
  flex: 1 1 auto;
  min-width: 0;
}

:global(.erp-my-date-picker-single-panel .el-date-picker__time-header) {
  display: none;
}

:global(.erp-my-date-picker-single-panel .erp-date-time-sidecar-host) {
  flex: 0 0 140px;
  width: 140px;
}
</style>
