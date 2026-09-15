<template>
  <el-popover
    :visible="timePickerVisible"
    placement="bottom-start"
    :width="240"
    :show-arrow="false"
    trigger="click"
    popper-class="custom-date-time-popper"
    @update:visible="handleVisibleChange"
  >
    <div class="custom-date-time-panel">
      <el-scrollbar ref="dateScrollbar" height="220px" class="spinner-column">
        <div
          v-for="row in dateOptions"
          :key="row.value"
          class="spinner-item"
          :class="{ active: parseTime(row.value, fmtForMd) === monthDateStr }"
          @click="handleDateClick(row.value)"
        >
          {{ parseTime(row.value, fmtForMd) }}
        </div>
      </el-scrollbar>

      <el-scrollbar ref="timeScrollbar" height="220px" class="spinner-column">
        <div
          v-for="row in timeOptions"
          :key="row.value"
          class="spinner-item"
          :class="{ active: row.label === hoursMinutesStr }"
          @click="handleTimeClick(row.value)"
        >
          {{ row.label }}
        </div>
      </el-scrollbar>
    </div>

    <template #reference>
      <div class="custom-date-time-reference" @click="open">
        <el-input
          :model-value="displayValue"
          :disabled="disabled"
          :size="elementSize"
          readonly
          class="tree-view-item"
        >
          <template #prefix>
            <el-icon><Clock /></el-icon>
          </template>
          <template #suffix>
            <el-icon v-if="!timePickerVisible"><ArrowDown /></el-icon>
            <el-icon v-else><ArrowUp /></el-icon>
            <el-icon
              v-if="sourceValue && clearable && !disabled"
              class="clear-icon"
              @click.stop="clear"
            >
              <CircleClose />
            </el-icon>
          </template>
        </el-input>

        <div v-if="!disabled && controls" class="minute-controls">
          <button type="button" class="minute-button minute-up" @click.stop="minutesIncrease">
            <el-icon><ArrowUp /></el-icon>
          </button>
          <button type="button" class="minute-button minute-down" @click.stop="minutesDecrease">
            <el-icon><ArrowDown /></el-icon>
          </button>
        </div>
      </div>
    </template>
  </el-popover>
</template>

<script>
import {
  ArrowDown,
  ArrowUp,
  CircleClose,
  Clock
} from '@element-plus/icons-vue'

export default {
  name: 'CustomDateTime',
  components: {
    ArrowDown,
    ArrowUp,
    CircleClose,
    Clock
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined
    },
    value: {
      type: [String, Number],
      default: undefined
    },
    step: {
      type: Number,
      default: 5,
      validator(value) {
        return value > 0 && value <= 1440
      }
    },
    dateCount: {
      type: Number,
      default: 7
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    controls: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'update:value', 'input', 'change'],
  data() {
    return {
      timePickerVisible: false,
      dateOptions: [],
      timeOptions: []
    }
  },
  computed: {
    sourceValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    elementSize() {
      const size = this.$store.getters.size
      if (size === 'mini') return 'small'
      if (size === 'medium') return 'default'
      return size
    },
    fmtForYmdhm() {
      return this.$store.getters.fmtForYmdhm
    },
    fmtForMd() {
      return this.$store.getters.fmtForMd
    },
    displayValue() {
      return this.sourceValue
        ? this.parseTime(this.sourceValue, this.fmtForYmdhm)
        : ''
    },
    monthDateStr() {
      return this.sourceValue
        ? this.parseTime(this.sourceValue, this.fmtForMd)
        : ''
    },
    hoursMinutesStr() {
      return this.sourceValue ? this.parseTime(this.sourceValue, 'HH:mm') : ''
    }
  },
  watch: {
    dateCount: 'buildDateOptions',
    step: 'buildTimeOptions'
  },
  created() {
    this.buildDateOptions()
    this.buildTimeOptions()
  },
  methods: {
    emitValue(value) {
      const oldValue = this.sourceValue
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
      if (oldValue !== value) {
        this.$emit('change', value, oldValue)
      }
    },
    clear() {
      this.emitValue(undefined)
      this.close()
    },
    open() {
      if (this.disabled || this.timePickerVisible) return
      this.timePickerVisible = true
      this.$nextTick(() => {
        requestAnimationFrame(this.adjustSpinners)
      })
    },
    close() {
      this.timePickerVisible = false
    },
    handleVisibleChange(value) {
      if (this.disabled) {
        this.timePickerVisible = false
        return
      }
      this.timePickerVisible = value
      if (value) {
        this.$nextTick(() => {
          requestAnimationFrame(this.adjustSpinners)
        })
      }
    },
    handleDateClick(value) {
      this.emitValue(
        this.modifiedTime(value, this.sourceValue || this.getNearestTime())
      )
      this.$nextTick(this.adjustSpinners)
    },
    handleTimeClick(value) {
      this.emitValue(this.modifiedTime(this.sourceValue || Date.now(), value))
      this.$nextTick(this.adjustSpinners)
    },
    modifiedTime(dateTimer, timeTimer) {
      const date = new Date(Number(dateTimer))
      const time = new Date(Number(timeTimer))
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
      ).getTime()
    },
    getNearestTime(timer) {
      const date = timer ? new Date(Number(timer)) : new Date()
      let minutes = date.getHours() * 60 + date.getMinutes()
      if (minutes % this.step > 0) {
        minutes = Math.floor(minutes / this.step) * this.step + this.step
      }
      date.setHours(Math.floor(minutes / 60) % 24)
      date.setMinutes(minutes % 60, 0, 0)
      return date.getTime()
    },
    minutesDecrease() {
      const value = this.sourceValue ? Number(this.sourceValue) - 60000 : Date.now()
      this.emitValue(value)
    },
    minutesIncrease() {
      const value = this.sourceValue ? Number(this.sourceValue) + 60000 : Date.now()
      this.emitValue(value)
    },
    buildDateOptions() {
      const result = []
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      const count = Math.max(0, this.dateCount)
      for (let index = 0; index < count; index += 1) {
        result.push({ value: date.getTime() })
        date.setDate(date.getDate() + 1)
      }
      this.dateOptions = result
    },
    buildTimeOptions() {
      const result = []
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      const slotCount = Math.ceil((24 * 60) / this.step)
      for (let index = 0; index < slotCount; index += 1) {
        const value = date.getTime() + this.step * 60 * 1000 * index
        if (new Date(value).getDate() !== date.getDate()) break
        result.push({
          value,
          label: this.parseTime(value, 'HH:mm')
        })
      }
      this.timeOptions = result
    },
    adjustSpinners() {
      const dateIndex = this.monthDateStr
        ? this.dateOptions.findIndex(
            item => this.parseTime(item.value, this.fmtForMd) === this.monthDateStr
          )
        : 0
      const timeIndex = this.hoursMinutesStr
        ? this.timeOptions.findIndex(item => item.label === this.hoursMinutesStr)
        : this.timeOptions.findIndex(
            item => item.label === this.parseTime(this.getNearestTime(), 'HH:mm')
          )

      this.$refs.dateScrollbar?.setScrollTop?.(Math.max(0, dateIndex) * 32)
      this.$refs.timeScrollbar?.setScrollTop?.(Math.max(0, timeIndex) * 32)
    }
  }
}
</script>

<style lang="scss">
.custom-date-time-popper {
  padding: 0 !important;
}
</style>

<style lang="scss" scoped>
.custom-date-time-panel {
  display: flex;
  height: 220px;
}

.spinner-column {
  flex: 1;
  text-align: center;
  border-right: 1px solid var(--el-border-color-lighter);
}

.spinner-column:last-child {
  border-right: 0;
}

.spinner-item {
  height: 32px;
  padding: 0 8px;
  overflow: hidden;
  color: var(--el-text-color-regular);
  line-height: 32px;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}

.spinner-item:hover {
  background: var(--el-fill-color-light);
}

.spinner-item.active {
  color: var(--el-color-primary);
  font-weight: bold;
}

.custom-date-time-reference {
  position: relative;
  width: 100%;
}

.clear-icon {
  cursor: pointer;
}

.minute-controls {
  position: absolute;
  top: 1px;
  right: 1px;
  bottom: 1px;
  display: flex;
  flex-direction: column;
  width: 32px;
  overflow: hidden;
  border-left: 1px solid var(--el-border-color);
  border-radius: 0 var(--el-border-radius-base) var(--el-border-radius-base) 0;
}

.minute-button {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border: 0;
  cursor: pointer;
}

.minute-button + .minute-button {
  border-top: 1px solid var(--el-border-color);
}
</style>
