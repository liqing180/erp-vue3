<template>
  <div class="dashboard-header">
    <div class="dashboard-row">
      <div
        class="dashboard-card task-card"
        :style="{ height: `${isExpand ? 180 : 48}px` }"
      >
        <div class="card-title task-title">
          <el-button
            link
            type="primary"
            size="small"
            @click="$emit('changeIsExpand')"
          >
            <el-icon>
              <CaretTop v-if="isExpand" />
              <CaretBottom v-else />
            </el-icon>
            {{ isExpand ? $t('ui.minimise') : $t('ui.expand') }}
          </el-button>
          <span class="ml20">{{ $t('DASHBOARD.taskCenter') }}</span>
          <div class="report-switcher">
            <span>{{ $t('DASHBOARD.reportSwitching') }}</span>
            <CommonSelectGroup
              :id="formData.reportId"
              :label="formData.reportName"
              id-key="reportId"
              label-key="reportName"
              :options="reportUrlList"
              :clearable="false"
              style="width: 160px"
              @change="reportUrlChange"
            />
          </div>
        </div>

        <div v-if="isExpand" class="task-list">
          <div v-for="item in taskItems" :key="item.key" class="task-item">
            <div class="task-icon-wrap">
              <img class="card-img" :src="item.icon" :alt="item.label" />
            </div>
            <div class="task-content">
              <div>{{ item.label }}</div>
              <div
                class="tab-num"
                :class="{ pointer: item.value > 0 }"
                @click="numberClick(item.key, item.value)"
              >
                {{ $numberStr(item.value, 0) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="dashboard-card today-card"
        :style="{ height: `${isExpand ? 180 : 48}px` }"
      >
        <div class="card-title today-title">
          {{ $t('DASHBOARD.todayTransactions') }}
          <el-select
            v-if="isExpand"
            :model-value="formData.todaysDataActive"
            class="today-select"
            size="small"
            :clearable="false"
            @change="todaysDataActiveChange"
          >
            <el-option
              v-for="item in todaysDataOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div v-if="isExpand">
          <div
            v-for="(item, index) in comTodaysData"
            :key="`today-${index}`"
            class="today-row"
          >
            <div class="today-label">{{ item.label }}</div>
            <div class="today-progress">
              <el-progress
                :percentage="item.percentage"
                :stroke-width="16"
                :show-text="false"
              />
            </div>
            <div class="today-value">{{ $numberStr(item.value) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CaretBottom, CaretTop } from '@element-plus/icons-vue'
import openIcon from './img/a.svg'
import overdueIcon from './img/b.svg'
import processedIcon from './img/c.svg'
import initiatedIcon from './img/d.svg'
import notificationIcon from './img/e.svg'

export default {
  name: 'DashboardBoardHeader',
  components: {
    CaretBottom,
    CaretTop
  },
  props: {
    isShowFullScreen: {
      type: Boolean,
      default: false
    },
    isExpand: {
      type: Boolean,
      default: true
    },
    reportUrlList: {
      type: Array,
      default: () => []
    },
    formData: {
      type: Object,
      required: true
    },
    todaysDataOptions: {
      type: Array,
      default: () => []
    },
    comTodaysData: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'changeIsExpand',
    'handleChangeUrl',
    'handleChangeTodays',
    'setMaskShow',
    'toggleFullscreen'
  ],
  computed: {
    taskItems() {
      return [
        {
          key: 'openQty',
          label: this.$t('DASHBOARD.open'),
          value: this.formData.openQty,
          icon: openIcon
        },
        {
          key: 'overdueQty',
          label: this.$t('DASHBOARD.overdue'),
          value: this.formData.overdueQty,
          icon: overdueIcon
        },
        {
          key: 'processedQty',
          label: this.$t('DASHBOARD.processed'),
          value: this.formData.processedQty,
          icon: processedIcon
        },
        {
          key: 'myInitiatedQty',
          label: this.$t('DASHBOARD.myInitiated'),
          value: this.formData.myInitiatedQty,
          icon: initiatedIcon
        },
        {
          key: 'notificationsQty',
          label: this.$t('DASHBOARD.notifications'),
          value: this.formData.notificationsQty,
          icon: notificationIcon
        }
      ]
    }
  },
  methods: {
    reportUrlChange(row) {
      this.$emit('handleChangeUrl', row)
    },
    todaysDataActiveChange(value) {
      this.$cache.local.setJSON('dashboardTodaysId', value)
      this.$emit('handleChangeTodays', value)
    },
    pushTaskRoute(route) {
      this.$router.push(route).catch(() => {})
    },
    numberClick(clickType, value) {
      if (!value || clickType === 'notificationsQty') return

      const routeMap = {
        openQty: {
          permission: 'bpm:myTask:toDoTask:list',
          route: {
            name: 'ToDoTask',
            query: { timeId: Date.now() },
            params: { isGetList: true }
          }
        },
        overdueQty: {
          permission: 'bpm:myTask:toDoTask:list',
          route: {
            name: 'ToDoTask',
            query: { timeId: Date.now() },
            params: { isGetList: true, isTimeOut: '1' }
          }
        },
        processedQty: {
          permission: 'bpm:myTask:completedTask:list',
          route: {
            name: 'CompletedTask',
            query: { timeId: Date.now() },
            params: { isGetList: true }
          }
        },
        myInitiatedQty: {
          permission: 'bpm:processManagement:myInitiatedProcess:list',
          route: {
            name: 'MyInitiatedProcess',
            query: { timeId: Date.now() },
            params: { isGetList: true }
          }
        }
      }

      const target = routeMap[clickType]
      if (!target) return
      if (!this.checkPermi([target.permission])) {
        this.$modal.msgError(this.$t('DASHBOARD.noAuthMsg'))
        return
      }
      this.pushTaskRoute(target.route)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-header {
  margin-top: 10px;
  margin-bottom: 2px;
}

.dashboard-row {
  display: flex;
  padding: 0 20px;
}

.dashboard-card {
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.13) 0 1px 3px 1px;
  overflow: hidden;
}

.task-card {
  width: 66%;
  padding: 6px;
  margin-right: 6px;
}

.today-card {
  width: 34%;
  padding: 6px 20px;
}

.card-title {
  height: 30px;
  line-height: 30px;
  font-size: 20px;
  font-weight: 600;
}

.task-title {
  padding: 0 20px;
}

.report-switcher {
  float: right;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 400;
}

.task-list {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 130px;
}

.task-item {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  max-width: 20%;
}

.task-icon-wrap,
.task-content {
  width: 50%;
}

.card-img {
  width: 60px;
  height: 60px;
}

.tab-num {
  margin-top: 12px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
  user-select: none;
}

.pointer {
  cursor: pointer;
}

.today-title {
  position: relative;
}

.today-select {
  float: right;
  width: 140px;
}

.today-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 10px;
}

.today-label {
  width: 110px;
  padding-right: 10px;
  text-align: right;
  font-size: 12px;
}

.today-progress {
  flex: 1;
}

.today-value {
  width: 60px;
  padding-left: 10px;
}

.ml20 {
  margin-left: 20px;
}
</style>
