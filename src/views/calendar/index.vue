<template>
  <FormPageLayout formClass="form-page-btn--hide">
    <template v-slot:content>
      <div class="demo-app">
        <div class="demo-app-main" style="--fc-event-text-color: #333">
          <FullCalendar
            class="demo-app-calendar"
            :options="calendarOptions"
            ref="FullCalendarRef"
          >
            <!-- @click="handleEventClick(arg.event, $event)" -->
            <template v-slot:eventContent="arg">
              <div
                :class="['event-content', getDurationClass(arg.event, arg)]"
                :style="`${getEventTextColor(arg)}`"
              >
                <!--  -->
                <span
                  v-if="arg.view.type === 'dayGridMonth' && !arg.event.allDay"
                  class="event-icon"
                  :style="{ backgroundColor: arg.borderColor }"
                ></span>
                <span v-if="!arg.event.allDay" class="event-time">
                  {{ arg.timeText }}
                </span>
                <span class="event-title">{{ getEventTitle(arg) }}</span>
              </div>
            </template>
            <template v-slot:dayHeaderContent="arg">
              <b>{{ arg.text }}</b>
            </template>
          </FullCalendar>
        </div>
        <div class="demo-app-sidebar">
          <!-- 添加日历组件 -->
          <div class="right-calendar">
            <Calendar
              class-name="select-mode"
              :monFirst="true"
              :language="language === 'zh' ? 'cn' : language"
              :completion="true"
              @onSelect="changeCurrentDateDate"
            />
          </div>
          <!-- 日程人员列表 -->
          <div class="calendar-list">
            <div class="calendar-list-header">
              <!-- 添加全选复选框 -->
              <el-checkbox
                v-model="checkAll"
                :indeterminate="isIndeterminate"
                @change="handleCheckAllChange"
                style="margin-right: 8px"
              />
              <span>{{ $t('calendar.schedule') }}</span>
            </div>

            <!-- 日历项 -->
            <div class="calendar-items">
              <el-checkbox-group
                v-model="checkedCalendars"
                @change="handleCheckedCalendarsChange"
              >
                <div
                  v-for="(calendarUser, index) in calendarUserList"
                  :key="index"
                  class="calendar-item"
                >
                  <el-checkbox
                    :value="calendarUser.userId"
                    :style="getCheckboxStyle(getColors(index))"
                  >
                    <span class="calendar-name">{{
                      calendarUser.nickName
                    }}</span>
                  </el-checkbox>
                  <!-- 添加删除按钮，当前登录用户不显示 -->
                  <div class="delete-btn-container">
                    <el-icon
                      :size="20"
                      v-if="calendarUser.userId !== $store.state.user.userId"
                      class="delete-btn"
                      @click="handleDeleteCalendar(calendarUser)"
                      ><Close
                    /></el-icon>
                  </div>
                </div>
              </el-checkbox-group>
            </div>

            <!-- 添加人员显示按钮 -->
            <div class="add-calendar">
              <el-popover
                v-model:visible="popoverVisible"
                placement="bottom"
                :width="200"
                trigger="manual"
              >
                <template #reference>
                  <el-button link @click="handleAddCalendar">
                    <el-icon><Plus /></el-icon>
                    {{ $t('calendar.add') }}
                  </el-button>
                </template>
                <el-scrollbar max-height="280px" ref="userDropdown">
                  <div
                    v-for="user in filteredUserList"
                    :key="user.userId"
                    class="user-item"
                    @click="handleUserSelect(user)"
                  >
                    {{ user.nickName }}
                  </div>
                  <div
                    v-if="filteredUserList.length === 0"
                    class="user-item no-data"
                  >
                    {{ $t('calendar.noRecordsFound') }}
                  </div>
                </el-scrollbar>
              </el-popover>
            </div>
          </div>
        </div>
      </div>
      <MeetingFormDialog ref="meetingDialog" @submit="handleMeetingSubmit" />
      <EventPopover
        ref="eventPopover"
        @edit="handleEditMeeting"
        @delete="viewDatesChange()"
      />
    </template>
  </FormPageLayout>
</template>

<script>
/* 	 */
import { defineComponent } from 'vue'
/* 左侧日历组件 */
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { INITIAL_EVENTS, getColors } from './event-utils'

/* 右侧日历组件 */
import Calendar from 'mpvue-calendar'
/* 会议弹窗组件 */
import MeetingFormDialog from './meetingFormDlg.vue'
/* 事件弹窗组件 */
import EventPopover from './components/EventPopover.vue'
/* 日历API */
import {
  queryMeetingList,
  updateMeetingTime,
  queryCanViewUserList,
  queryScheduleUserList,
  saveScheduleUser,
  updateScheduleUser,
  deleteScheduleUser
} from '@/api/calendar'
export default defineComponent({
  components: {
    FullCalendar,
    Calendar,
    MeetingFormDialog,
    EventPopover
  },
  data() {
    const vm = this
    return {
      getColors: getColors,
      calendarOptions: {
        height: '100%',
        scrollTime: '00:00:00',
        eventMinHeight: 20,
        slotEventOverlap: false, // 是否事件重叠, false 则使用并排的方式显示
        allDayText: this.$t('calendar.allDay'),
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin // needed for dateClick
        ],
        firstDay: 1,
        locale: computed(() => {
          return this.$store.getters.language
        }),
        headerToolbar: {
          left: 'prev,next dayGridMonth,timeGridWeek,timeGridDay today',
          center: 'title',
          right: computed(() => {
            return this.addAuth ? 'add' : ''
          })
        },
        /* 头部按钮自定义文本 */
        buttonText: {
          today: this.$t('calendar.today'),
          month: this.$t('calendar.month'),
          week: this.$t('calendar.week'),
          day: this.$t('calendar.day')
        },
        /* 头部按钮的title悬浮，可以在这里设置 */
        buttonHints: {
          prev: ' ', // 上一个按钮的title
          next: ' ', // 下一个按钮的title
          today: ' ', // 今天按钮的title
          month: ' ', // 月视图按钮的title
          week: ' ', // 周视图按钮的title
          day: ' ' // 日视图按钮的title
        },
        /* more 按钮自定义文本 */
        moreLinkContent: args => {
          return `${args.shortText} ${this.$t('calendar.more')}`
        },
        /* more 按钮的 title 悬浮提示去除 */
        moreLinkHint: ' ',
        customButtons: {
          add: {
            text: this.$t('uiBtn.add'),
            click: function () {
              vm.$refs.meetingDialog.open()
            }
          }
        },
        eventTimeFormat: {
          // ...userDateTimeFormat, // 从用户配置中获取的格式
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        },
        initialView: 'dayGridMonth',
        views: {
          // 月视图
          dayGridMonth: {
            type: 'dayGrid',
            showNonCurrentDates: true // 是否显示其他月份的日期
          },
          // 周视图
          timeGridWeek: {
            type: 'timeGrid',
            dayHeaders: true, // 是否显示表格头部日期
            titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
            slotLabelFormat: {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }
          },
          // 日视图
          timeGridDay: {
            type: 'timeGrid',
            slotLabelFormat: {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }
          }
        },
        initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
        editable: true,
        selectable: computed(() => {
          return this.addAuth
        }),
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true, // 显示显示周末
        select: this.handleDateSelect,
        eventClick: this.handleEventClick2,
        eventsSet: this.handleEvents,
        datesSet: this.viewDatesChange, // 单击上一个/下一个按钮、更改视图后回调
        eventChange: this.eventChange,
        eventDidMount: function (info) {
          // 创建提示信息
          let tooltip = ''
          // if (info.event.allDay) {
          //   const startTimer = info.event.start.toLocaleString(this.language, {
          //     year: 'numeric',
          //     month: '2-digit',
          //     day: '2-digit'
          //   })
          //   tooltip = `${startTimer}  ${info.event.title}`
          // } else {
          //   const startTimer = info.event.start.toLocaleString(this.language, {
          //     hour: '2-digit',
          //     minute: '2-digit'
          //   })
          //   let endTimer = ''
          //   if (info.event.end) {
          //     endTimer = info.event.end.toLocaleString(this.language, {
          //       hour: '2-digit',
          //       minute: '2-digit'
          //     })
          //   } else {
          //     endTimer = ''
          //   }
          //   tooltip = `${startTimer} - ${endTimer}  ${info.event.title}`
          // }
          if (info.event.extendedProps.eventContent) {
            const timeStr =
              info.event.extendedProps.eventContent.dateTimeShowStr
            tooltip = `${timeStr} \n ${info.event.title}`
          } else {
            tooltip = info.event.title
          }

          // 添加 title 属性
          info.el.setAttribute('title', tooltip)

          // 为非全天事件添加浅灰色背景
          // if (!info.event.allDay) {
          //   info.el.style.backgroundColor = '#f0f0f0'
          //   info.el.style.borderColor = '#cccccc'
          // } else {
          //   info.el.style.backgroundColor = '#f0f0f0'
          //   info.el.style.borderColor = '#cccccc'
          //   info.el.style.color = '#333333'
          // }
        }
        /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
      },
      // 事件列表
      currentEvents: [],
      // 已添加的日程人员列表
      calendarUserList: [
        // { userId: 1, nickName: '当前登录用户', color: '#4285f4' },
        // { userId: 2, nickName: '用户2', color: '#a2845e' }
      ],
      // 已选中的日程人员
      checkedCalendars: [],
      // 是否全选
      checkAll: false,
      // 是否半选
      isIndeterminate: false,
      // 所有可选择的用户列表
      userList: [],
      popoverVisible: false
    }
  },
  computed: {
    filteredUserList() {
      return this.userList.filter(
        user =>
          !this.calendarUserList.some(
            calendar => calendar.userId === user.userId
          )
      )
    },
    language() {
      return this.$store.getters.language
    },
    checkedCalendarsBySort() {
      return this.calendarUserList
        .filter(item => item.isSelected === '1')
        .map(item => item.userId)
    },
    opened() {
      return this.$store.getters.sidebar.opened
    },
    addAuth() {
      return this.checkPermi(['calendar:add'])
    }
  },
  created() {
    // setTimeout(() => {
    // this.clearAndSetNewEvents([])
    // }, 5000);
    this.queryScheduleUserList()
  },
  methods: {
    /** 日历单元格点击或者选择时间段触发，新增会议 */
    handleDateSelect(selectInfo) {
      if (!this.addAuth) {
        return
      }
      let calendarApi = selectInfo.view.calendar
      setTimeout(() => {
        calendarApi.unselect() // 清除日期选择
      }, 1000)

      let endTime = selectInfo.end.getTime()
      if (selectInfo.allDay) {
        endTime -= 1000
      }
      this.$refs.meetingDialog.open({
        startTime: selectInfo.start.getTime(),
        endTime: endTime,
        allDay: selectInfo.allDay ? '1' : '0'
      })
    },
    // 会议提交成功
    handleMeetingSubmit(meetingData) {
      this.viewDatesChange()
    },
    handleEditMeeting(meetingData) {
      this.$refs.meetingDialog.open(meetingData)
    },

    /** 事件点击- 查看事件详情 */
    handleEventClick2(info) {
      this.$refs.eventPopover.open(info.event, info.jsEvent)
    },

    /** 事件列表变更,更新外部 */
    handleEvents(events) {
      this.currentEvents = events
    },

    /** 事件变更 */
    eventChange(info) {
      const event = info.event || {}
      const eventContent = event.extendedProps.eventContent
      // eventContent
      eventContent.allDay = event.allDay ? '1' : '0'
      eventContent.startTime = event.start.getTime()
      if (event.end) {
        eventContent.endTime = event.end.getTime()
      }
      if (event.allDay) {
        if (!event.end) {
          eventContent.endTime =
            eventContent.startTime + 24 * 60 * 60 * 1000 - 1000
        }
        eventContent.endTime = eventContent.endTime - 1000
      }
      updateMeetingTime(eventContent)
        .then(res => {
          // 事件修改成功后重新获取当前视图数据
          this.viewDatesChange()
        })
        .catch(() => {})
    },
    /* 视图修改，调用查询接口 queryMeetingList */
    viewDatesChange(info) {
      if (!this.$refs.FullCalendarRef) return
      if (!this.checkedCalendars.length) {
        this.clearAndSetNewEvents([])
        return
      }

      if (!info) {
        const calendarApi = this.$refs.FullCalendarRef.getApi()
        const currentView = calendarApi.view
        info = {
          start: currentView.activeStart,
          end: currentView.activeEnd
        }
      }
      queryMeetingList({
        startDate: info.start.getTime(),
        endDate: info.end.getTime() - 1,
        permissionUserIdList: this.checkedCalendars
      }).then(res => {
        const data = res.data || []
        let idKey = Date.now()
        const list = data.map(item => {
          idKey++
          let endTime = item.endTime
          if (endTime - item.startTime >= 24 * 60 * 60 * 1000 - 60000) {
            item.allDay = '1'
          }
          if (item.allDay === '1') {
            // 创建一个日期对象来检查时间部分
            const endDate = new Date(endTime)
            const hours = endDate.getHours()
            const minutes = endDate.getMinutes()
            const seconds = endDate.getSeconds()

            // 只有当时间部分不是 00:00:00 时才修改
            if (hours > 0 || minutes > 0 || seconds > 0) {
              // 设置为下一天的 00:00:00
              endDate.setDate(endDate.getDate() + 1)
              endDate.setHours(0, 0, 0, 0)
              endTime = endDate.getTime()
            }
          }
          const userColor = this.getColorByUserId(item.userIds)
          return {
            // ...item,
            eventContent: { ...item },
            id: item.id,
            title: item.subjectShowStr,
            start: this.parseTime(item.startTime, 'YYYY-MM-DD HH:mm:ss'),
            end: this.parseTime(endTime, 'YYYY-MM-DD HH:mm:ss'),
            allDay: item.allDay === '1',
            backgroundColor: userColor ? userColor + '44' : '',
            borderColor: userColor ? userColor + 'ff' : '',
            editable: item.isCanUpdate === '1',
            textColor: item.isCanUpdate ? '#333' : '#666'
          }
        })
        this.calendarOptions.initialEvents = list
        this.clearAndSetNewEvents(list)
      })
    },
    getColorByUserId(userIds) {
      const idList = (userIds || '').split(',')
      const includesId = this.checkedCalendarsBySort.find(item =>
        idList.includes(item)
      )
      if (includesId) {
        const index = this.calendarUserList.findIndex(
          item => item.userId === includesId
        )
        return getColors(index)
      } else {
        return ''
      }
    },

    /** 清除并设置新事件 */
    clearAndSetNewEvents(newEvents) {
      // 获取日历API
      const calendarApi = this.$refs.FullCalendarRef.getApi()
      // 移除所有现有事件
      calendarApi.removeAllEvents()
      // 添加新事件
      if (newEvents && newEvents.length) {
        newEvents.forEach(event => {
          calendarApi.addEvent(event)
        })
      }
    },

    /** 设置事件单元格显示的行数，超出后显示省略... */
    getDurationClass(event, arg) {
      // console.log(event.title, arg)
      const view = arg.view || {}
      /* 月维度查看时，事件都是单行显示 */
      if (view.type === 'dayGridMonth') return 'single-line'
      /* 全天事件,没有 end ，单行显示 */
      if (!event.end) return 'single-line'
      const duration =
        (event.end.getTime() - event.start.getTime()) / (1000 * 60) // 计算分钟差

      if (duration < 60) {
        return 'single-line'
      } else if (duration < 90) {
        return 'two-line'
      } else {
        return 'three-line'
      }
    },
    /* 获取事件单元字体颜色 */
    getEventTextColor(arg) {
      if (arg.event.textColor) {
        return `color: ${arg.event.textColor}`
      }
    },
    getEventTitle(arg) {
      if (arg.event.allDay) {
        const eventContent = arg.event.extendedProps.eventContent || {}
        if (eventContent.startTime) {
          const startTime = new Date(eventContent.startTime)
          const hours = startTime.getHours()
          const minutes = startTime.getMinutes()
          if (hours === 0 && minutes === 0) {
            return arg.event.title
          } else {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${arg.event.title}`
          }
        }
        return arg.event.title
      } else {
        return arg.event.title
      }
    },

    changeCurrentDateDate(date) {
      this.$nextTick(() => {
        const curDate = new Date(date)
        const calendarApi = this.$refs.FullCalendarRef.getApi()
        const isInCurrentWeek = this.isDateInCurrentWeek(curDate)

        // 设置日历视图
        if (isInCurrentWeek) {
          calendarApi.changeView('timeGridDay', curDate)
        } else {
          calendarApi.changeView('timeGridWeek', curDate)
        }
        // calendarApi.gotoDate(curDate)
      })
    },
    isDateInCurrentWeek(date) {
      const today = new Date()
      // 获取当前是星期几 (0-6, 0代表周日)
      const currentDay = today.getDay()

      // 计算到本周一的天数差
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
      // 计算到本周日的天数差
      const sundayOffset = currentDay === 0 ? 0 : 7 - currentDay

      const currentWeekStart = new Date(today)
      currentWeekStart.setDate(today.getDate() + mondayOffset)
      currentWeekStart.setHours(0, 0, 0, 0)

      const currentWeekEnd = new Date(today)
      currentWeekEnd.setDate(today.getDate() + sundayOffset)
      currentWeekEnd.setHours(23, 59, 59, 999)

      return date >= currentWeekStart && date <= currentWeekEnd
    },

    /** 查询已添加到日程组件的用户列表 */
    queryScheduleUserList() {
      queryScheduleUserList({}).then(res => {
        this.calendarUserList = res.data || []
        this.checkedCalendars = this.calendarUserList
          .filter(item => item.isSelected === '1')
          .map(item => item.userId)
        this.handleCheckedCalendarsChange(this.checkedCalendars, false)
        this.viewDatesChange()
      })
    },
    /** 处理添加日历 */
    handleAddCalendar() {
      /** 弹窗开启时重置滚动条位置 */
      this.popoverVisible = true
      this.getUserList()
      this.$nextTick(() => {
        const userDropdown = this.$refs.userDropdown
        if (userDropdown) {
          userDropdown.setScrollTop(0)
        }
      })
    },
    /** 获取用户下拉列表 */
    async getUserList() {
      try {
        const response = await queryCanViewUserList({})
        this.userList = response.data || []
      } catch (error) {
        this.userList = []
      }
    },
    /** 处理用户选择 */
    handleUserSelect(user) {
      saveScheduleUser(user).then(res => {
        const list = res.data || []
        this.calendarUserList = list
        this.checkedCalendars = list
          .filter(item => item.isSelected === '1')
          .map(item => item.userId)
        this.handleCheckedCalendarsChange(this.checkedCalendars, false)
        this.viewDatesChange()
      })
      this.popoverVisible = false // 关闭弹窗
    },
    /** 处理删除日程用户 */
    handleDeleteCalendar(calendarUser) {
      // 从 calendarUserList 中移除
      deleteScheduleUser({ id: calendarUser.id }).then(res => {
        const list = res.data || []
        this.calendarUserList = list
        this.checkedCalendars = this.calendarUserList
          .filter(item => item.isSelected === '1')
          .map(item => item.userId)
        this.handleCheckedCalendarsChange(this.checkedCalendars, false)
        this.viewDatesChange()
      })
    },
    /** 处理全选变更 */
    handleCheckAllChange(val) {
      this.checkedCalendars = val
        ? this.calendarUserList.map(item => item.userId)
        : []
      this.isIndeterminate = false

      this.updateScheduleUser(this.checkedCalendars)
      this.viewDatesChange()
    },

    /** 处理日历选择变更 */
    handleCheckedCalendarsChange(value, isUpdate = true) {
      const selectIds = value || []
      const checkedCount = selectIds.length
      this.checkAll = checkedCount === this.calendarUserList.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.calendarUserList.length

      if (isUpdate) {
        this.updateScheduleUser(selectIds)
        this.viewDatesChange()
      }
    },
    /** 更新日程用户 */
    updateScheduleUser(selectIds) {
      this.calendarUserList.forEach(item => {
        if (!selectIds.includes(item.userId)) {
          item.isSelected = '0'
        } else {
          item.isSelected = '1'
        }
      })
      updateScheduleUser(this.calendarUserList).then(res => {})
    },
    /** 获取复选框样式 */
    getCheckboxStyle(color) {
      return {
        '--el-checkbox-checked-bg-color': color,
        '--el-checkbox-checked-input-border-color': color,
        '--el-checkbox-checked-text-color': color
      }
    }
  },
  watch: {
    opened: {
      handler() {
        // 当侧边栏状态改变时,延迟一帧重新渲染日历布局
        this.$nextTick(() => {
          if (this.$refs.FullCalendarRef) {
            const calendarApi = this.$refs.FullCalendarRef.getApi()
            setTimeout(() => {
              calendarApi.updateSize()
            }, 300)
          }
        })
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.demo-app {
  display: flex;
  height: 100%;
  background-color: #fff;
  font-family:
    Arial,
    Helvetica Neue,
    Helvetica,
    sans-serif;
  font-size: 14px;
}

/* 左侧盒子 */
.demo-app-main {
  flex: 1;
  padding: 10px 10px 10px 10px;
}
/* 左侧日历事件自定义样式 */
.event-content {
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  padding: 0 3px;

  &.single-line {
    display: inline-block;
    white-space: nowrap;
  }

  &.two-line {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  &.three-line {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
}
.event-icon {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 3px;
}
.fc-daygrid-event-harness-abs {
  .event-icon {
    display: none;
  }
}

.event-time {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  margin-right: 5px;
  vertical-align: middle;
}
.event-title {
  vertical-align: middle;
}

/* 日历组件内部样式的自定义 */
.fc {
  :deep(.fc-scrollgrid-section-header .fc-scroller-harness .fc-scroller) {
    overflow: hidden !important;
  }
  /* 自定义顶部按钮样式 */
  :deep(.fc-button-primary) {
    padding: 4px 0.65em !important;
    // line-height: 30px !important;
    vertical-align: middle !important;
    background-color: #409eff !important;
    border-color: #409eff !important;
    color: #fff !important;
    &:hover {
      background-color: #79bbff !important;
      border-color: #79bbff !important;
    }
    &.fc-button-active {
      background-color: #337ecc !important;
      border-color: #337ecc !important;
    }
  }
  :deep(.fc-button-primary:focus) {
    box-shadow: rgba(76, 91, 106, 0.5) 0px 0px 0px 0 !important;
  }

  :deep(.fc-popover) {
    z-index: 1000 !important;
  }

  :deep(td.fc-day-today) {
    // 当前日期颜色自定义
    background-color: #d8ebff !important;
  }
  :deep(td.fc-day-today) {
    // 当前日期颜色自定义
    background-color: #d8ebff !important;
  }
  /* the calendar root */
  margin: 0 auto;
  width: 100%;
  :deep(.fc-timegrid-col.fc-day-today) {
    background-color: #fff !important;
  }
  // :deep(.fc-timeGridWeek-view) {
  //   .fc-daygrid-day.fc-day-today {
  //     background-color: #fff;
  //   }
  // }
  // :deep(.fc-timeGridDay-view) {
  //   .fc-daygrid-day.fc-day-today {
  //     background-color: #fff;
  //   }
  // }
  :deep(.fc-button:disabled) {
    opacity: 0.5;
  }
}

/* 右侧盒子 */
.demo-app-sidebar {
  width: 302px;
  background: #fff;
  height: 100%;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}
// 右侧 小日历控件样式
.right-calendar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  :deep(.vc-calendar-today .vc-calendar-date) {
    // background-color: #d8ebff !important;
    color: #409eff !important;
    font-weight: bold !important;
  }
  :deep(.vc-day-selected .vc-calendar-date) {
    // background-color: #3788d8 !important;
    color: #fff !important;
  }

  :deep(
    .vc-calendar-timetable
      .vc-calendar-timetable-wrap
      .vc-calendar-body
      .vc-calendar-row
  ) {
    .vc-calendar-day.vc-calendar-dayoff:not(.vc-calendar-disabled)
      .vc-calendar-date {
      color: #7c86a2 !important;
    }
    .vc-calendar-day.vc-calendar-dayoff.vc-day-selected .vc-calendar-date {
      color: #fff !important;
    }
  }
}

// 右侧 日程样式
.calendar-list {
  flex: 1;
  padding: 10px;
  padding-left: 0px;
  overflow: hidden;
}
.calendar-list-header {
  font-size: 16px;
  font-weight: 500;
  padding-left: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;

  :deep(.el-checkbox) {
    --el-checkbox-size: 18px;

    .el-checkbox__input {
      transform: scale(1.2);
    }
  }
}
.calendar-items {
  margin-bottom: 10px;
  max-height: calc(100% - 80px);
  overflow-y: auto;
  padding-left: 16px;
}
.calendar-item {
  margin-bottom: 8px;
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  :deep(.el-checkbox) {
    --el-checkbox-font-size: 14px;
    --el-checkbox-size: 18px;
    flex: 1;

    .el-checkbox__input {
      transform: scale(1.2);
    }
  }
  .delete-btn-container {
    height: 20px;
  }
  .delete-btn {
    display: none;
    // padding: 2px;
    color: #909399;

    &:hover {
      color: #f56c6c;
    }
  }

  &:hover {
    .delete-btn {
      display: inline-flex;
    }
  }
}
.calendar-name {
  margin-left: 0px;
  color: #333;
}
.add-calendar {
  display: flex;
  align-items: center;
  padding-left: 16px;
  .el-button {
    padding: 0;
    display: flex;
    align-items: center;
    color: #1a73e8;

    .el-icon {
      margin-right: 4px;
    }
  }
}
.user-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.user-item:hover {
  background-color: #f5f7fa;
}
.user-item.no-data {
  color: #909399;
  cursor: default;
}
.user-item:not(:last-child) {
  border-bottom: 1px solid #ebeef5;
}
</style>
