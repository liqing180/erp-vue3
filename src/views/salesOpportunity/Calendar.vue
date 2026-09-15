<template>
  <div class="calendar-box">
    <!-- 顶部控制栏 -->
    <div class="calendar-header">
      <div class="flexStart mr10">
        <el-button @click="changeDate('prev')" style="height: 30px"
          ><el-icon><ArrowLeft /></el-icon
        ></el-button>
        <el-button @click="changeDate('next')" style="height: 30px"
          ><el-icon><ArrowRight /></el-icon
        ></el-button>
      </div>
      <el-select v-model="viewType" class="mr10 select">
        <el-option label="天" value="day" />
        <el-option label="周" value="week" />
        <el-option label="月" value="month" />
      </el-select>
      <el-button style="height: 30px">Today</el-button>
      <!-- <span class="ml-2">{{ currentDateDisplay }}</span> -->
    </div>
    <div class="calendar-container">
      <!-- 日历主体 -->
      <div class="calendar-body">
        <template v-if="viewType === 'day'">
          <div class="calendar-grid">
            <div
              v-for="day in daysInMonth"
              :key="day"
              class="calendar-cell"
              :class="{ selected: isSelected(day) }"
              @mousedown.stop="onMouseDown(day)"
              @mousemove.stop="onMouseMove(day)"
              @mouseup.stop="onMouseUp"
            >
              {{ day }}
            </div>
          </div>
        </template>

        <template v-if="viewType === 'week'">
          <div class="calendar-grid">
            <div
              v-for="day in daysInWeek"
              :key="day.date"
              class="calendar-cell"
            >
              {{ day.dayName }}<br />{{ day.date }}
            </div>
          </div>
        </template>

        <template v-if="viewType === 'month'">
          <div class="calendar-grid months">
            <div
              v-for="month in monthsInYear"
              :key="month"
              class="calendar-cell"
            >
              {{ month }}月
            </div>
          </div>
        </template>
      </div>

      <!-- 右侧日期面板 -->
      <div class="calendar-panel">
        <el-calendar ref="elCalendar" v-model="currentDate">
          <template #header="{ date }">
            <div class="flexSb flex-1">
              <el-button
                @click="elCalendarChange('prev-month')"
                style="height: 30px"
                ><el-icon><ArrowLeft /></el-icon
              ></el-button>
              <span>{{ date }}</span>
              <el-button
                @click="elCalendarChange('next-month')"
                style="height: 30px"
                ><el-icon><ArrowRight /></el-icon
              ></el-button>
            </div>
          </template>
        </el-calendar>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  data() {
    return {
      currentDate: new Date(),
      viewType: 'day',
      startDate: null,
      endDate: null,
      isDragging: false
    }
  },

  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    daysInMonth() {
      return Array.from(
        { length: dayjs(this.currentDate).daysInMonth() },
        (_, i) => i + 1
      )
    },

    daysInWeek() {
      const start = dayjs(this.currentDate).startOf('week')
      return Array.from({ length: 7 }, (_, i) => ({
        date: start.add(i, 'day').format('DD'),
        dayName: start.add(i, 'day').format('ddd')
      }))
    },

    monthsInYear() {
      return Array.from({ length: 12 }, (_, i) => i + 1)
    },

    currentDateDisplay() {
      const date = dayjs(this.currentDate)
      switch (this.viewType) {
        case 'day':
          return date.format('YYYY年MM月')
        case 'week':
          return `${date.startOf('week').format('YYYY年MM月DD日')} - ${date.endOf('week').format('MM月DD日')}`
        case 'month':
          return date.format('YYYY年')
      }
      return ''
    }
  },

  methods: {
    elCalendarChange(val) {
      this.$refs.elCalendar && this.$refs.elCalendar.selectDate(val)
    },
    changeDate(type) {
      const date = dayjs(this.currentDate)
      switch (this.viewType) {
        case 'day':
          this.currentDate =
            type === 'prev'
              ? date.subtract(1, 'month').toDate()
              : date.add(1, 'month').toDate()
          break
        case 'week':
          this.currentDate =
            type === 'prev'
              ? date.subtract(1, 'week').toDate()
              : date.add(1, 'week').toDate()
          break
        case 'month':
          this.currentDate =
            type === 'prev'
              ? date.subtract(1, 'year').toDate()
              : date.add(1, 'year').toDate()
          break
      }
    },
    onMouseDown(date) {
      this.startDate = date
      this.isDragging = true
    },
    onMouseMove(date) {
      if (this.isDragging) {
        this.endDate = date
      }
    },
    onMouseUp() {
      this.isDragging = false
      this.getSelectedDates()
    },
    isSelected(date) {
      if (this.startDate && this.endDate) {
        const minDate = Math.min(this.startDate, this.endDate)
        const maxDate = Math.max(this.startDate, this.endDate)
        return date >= minDate && date <= maxDate
      }
      return false
    },
    getSelectedDates() {
      if (this.startDate && this.endDate) {
        const minDate = Math.min(this.startDate, this.endDate)
        const maxDate = Math.max(this.startDate, this.endDate)
        const selectedDates = []
        for (let i = minDate; i <= maxDate; i++) {
          selectedDates.push(i)
        }
        console.log('选中的日期:', selectedDates)
      }
    }
  }
}
</script>

<style scoped>
.calendar-box {
  user-select: none;
}
.calendar-container {
  display: flex;
  gap: 20px;
}
.select {
  width: 80px;
}
.select :deep(.el-select__wrapper) {
  height: 30px;
}

.calendar-body {
  flex: 1;
}

.calendar-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* gap: 10px; */
}

.calendar-grid > div {
  /* width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer; */
}

.calendar-grid > .selected {
  background-color: #e0f7fa;
}
.calendar-grid.months {
  grid-template-columns: repeat(4, 1fr);
}

.calendar-cell {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.ml-2 {
  margin-left: 8px;
}

.calendar-panel {
  width: 300px;
  /* height: 150px; */
}
.calendar-panel :deep(.el-calendar) {
  --el-calendar-cell-width: auto;
}
</style>

<!-- <template>
  <div class="calendar">
    <div
      v-for="(day, index) in days"
      :key="index"
      :class="{ selected: isSelected(day) }"
      @mousedown="onMouseDown(day)"
      @mousemove="onMouseMove(day)"
      @mouseup="onMouseUp"
    >
      {{ day }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      days: [],
      startDate: null,
      endDate: null,
      isDragging: false
    }
  },
  mounted() {
    // 初始化日历日期，这里简单模拟 1 - 31 号
    for (let i = 1; i <= 31; i++) {
      this.days.push(i)
    }
  },
  methods: {
    onMouseDown(date) {
      this.startDate = date
      this.isDragging = true
    },
    onMouseMove(date) {
      if (this.isDragging) {
        this.endDate = date
      }
    },
    onMouseUp() {
      this.isDragging = false
      this.getSelectedDates()
    },
    isSelected(date) {
      if (this.startDate && this.endDate) {
        const minDate = Math.min(this.startDate, this.endDate)
        const maxDate = Math.max(this.startDate, this.endDate)
        return date >= minDate && date <= maxDate
      }
      return false
    },
    getSelectedDates() {
      if (this.startDate && this.endDate) {
        const minDate = Math.min(this.startDate, this.endDate)
        const maxDate = Math.max(this.startDate, this.endDate)
        const selectedDates = []
        for (let i = minDate; i <= maxDate; i++) {
          selectedDates.push(i)
        }
        console.log('选中的日期:', selectedDates)
      }
    }
  }
}
</script>

<style scoped>
.calendar {
  display: flex;
  flex-wrap: wrap;
}

.calendar > div {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.calendar > div.selected {
  background-color: #e0f7fa;
}
</style> -->
