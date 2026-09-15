<template>
  <div class="time-picker">
    <div ref="hourWheel" class="wheel-column" @scroll.passive="onHourScroll">
      <div class="wheel-fill" />
      <div
        v-for="h in 24"
        :key="h"
        class="wheel-item"
        :class="{ active: selectedHour === h - 1 }"
        @click="clickHour(h - 1)"
      >
        {{ padZero(h - 1) }}
      </div>
      <div class="wheel-fill" />
    </div>

    <div class="colon">:</div>

    <div ref="minWheel" class="wheel-column" @scroll.passive="onMinScroll">
      <div class="wheel-fill" />
      <div
        v-for="m in 60"
        :key="m"
        class="wheel-item"
        :class="{ active: selectedMinute === m - 1 }"
        @click="clickMin(m - 1)"
      >
        {{ padZero(m - 1) }}
      </div>
      <div class="wheel-fill" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErpDateTimeWheel',
  props: {
    curValue: {
      type: [Number, String],
      default: undefined
    },
    defaultTime: {
      type: [String, Date],
      default: undefined
    }
  },
  emits: ['pick'],
  data() {
    return {
      selectedHour: 0,
      selectedMinute: 0,
      itemHeight: 30,
      hourScrollTimer: null,
      minuteScrollTimer: null
    }
  },
  watch: {
    curValue() {
      this.showDefault()
    },
    defaultTime() {
      if (!this.curValue) {
        this.showDefault()
      }
    }
  },
  mounted() {
    this.$nextTick(this.showDefault)
  },
  beforeUnmount() {
    clearTimeout(this.hourScrollTimer)
    clearTimeout(this.minuteScrollTimer)
  },
  methods: {
    padZero(num) {
      return num < 10 ? `0${num}` : String(num)
    },
    parseDefaultTime() {
      if (this.defaultTime instanceof Date) {
        return {
          hour: this.defaultTime.getHours(),
          minute: this.defaultTime.getMinutes()
        }
      }
      if (typeof this.defaultTime !== 'string') return null
      const [hour = '0', minute = '0'] = this.defaultTime.split(':')
      return {
        hour: Number(hour),
        minute: Number(minute)
      }
    },
    showDefault() {
      if (
        this.curValue !== undefined &&
        this.curValue !== null &&
        this.curValue !== ''
      ) {
        const current = new Date(Number(this.curValue))
        if (!Number.isNaN(current.getTime())) {
          this.clickHour(current.getHours(), false)
          this.clickMin(current.getMinutes(), false)
          return
        }
      }

      const defaultTime = this.parseDefaultTime()
      if (defaultTime) {
        this.clickHour(defaultTime.hour, false)
        this.clickMin(defaultTime.minute, false)
      }
    },
    scrollWheel(refName, value) {
      this.$refs[refName]?.scrollTo?.({
        top: value * this.itemHeight
      })
    },
    clickHour(hour, isUpdate = true) {
      this.selectedHour = Math.max(0, Math.min(23, Number(hour) || 0))
      this.scrollWheel('hourWheel', this.selectedHour)
      if (isUpdate) this.emitPick()
    },
    clickMin(minute, isUpdate = true) {
      this.selectedMinute = Math.max(0, Math.min(59, Number(minute) || 0))
      this.scrollWheel('minWheel', this.selectedMinute)
      if (isUpdate) this.emitPick()
    },
    onHourScroll() {
      clearTimeout(this.hourScrollTimer)
      this.hourScrollTimer = setTimeout(this.autoSelectHour, 100)
    },
    onMinScroll() {
      clearTimeout(this.minuteScrollTimer)
      this.minuteScrollTimer = setTimeout(this.autoSelectMin, 100)
    },
    autoSelectHour() {
      this.autoSelect('hourWheel', 'selectedHour', 23)
    },
    autoSelectMin() {
      this.autoSelect('minWheel', 'selectedMinute', 59)
    },
    autoSelect(refName, stateName, max) {
      const el = this.$refs[refName]
      if (!el) return
      const index = Math.round(el.scrollTop / this.itemHeight)
      this[stateName] = Math.max(0, Math.min(max, index))
      el.scrollTo({
        top: this[stateName] * this.itemHeight,
        behavior: 'smooth'
      })
      this.emitPick()
    },
    emitPick() {
      // ERP-VUE2 原组件只在已有 curValue 时更新时间，保持相同语义。
      if (
        this.curValue === undefined ||
        this.curValue === null ||
        this.curValue === ''
      ) {
        return
      }
      const date = new Date(Number(this.curValue))
      if (Number.isNaN(date.getTime())) return
      date.setHours(this.selectedHour)
      date.setMinutes(this.selectedMinute)
      if (date.getTime() === Number(this.curValue)) return
      this.$emit('pick', date)
    }
  }
}
</script>

<style scoped>
.time-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 340px;
  position: relative;
  overflow: hidden;
  border-left: 1px solid rgb(204, 204, 204);
}

.wheel-column {
  width: 70px;
  height: 340px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wheel-column::-webkit-scrollbar {
  display: none;
}

.wheel-fill {
  height: 155px;
  width: 100%;
}

.wheel-item {
  height: 30px;
  line-height: 30px;
  text-align: center;
  font-size: 12px;
  color: #333;
  user-select: none;
  cursor: pointer;
}

.wheel-item.active {
  font-size: 14px;
  font-weight: bold;
  color: #1890ff;
}

.time-picker::before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 4px;
  right: 4px;
  height: 30px;
  z-index: -1;
  border-top: 1px solid rgb(204, 204, 204);
  border-bottom: 1px solid rgb(204, 204, 204);
}

.colon {
  font-size: 14px;
  font-weight: bold;
  margin: 0 3px;
  z-index: 1;
}
</style>
