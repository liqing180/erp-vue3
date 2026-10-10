<template>
  <div class="dashboard-header">
    <div class="dashboard-layout">
      <div
        class="dashboard-card task-card"
        :style="{ height: `${isExpand ? 180 : 48}px` }"
      >
        <div class="card-title">
          <el-button
            class="expand-button"
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
          <span class="task-title">{{ $t('DASHBOARD.taskCenter') }}</span>

          <div class="report-switcher">
            <span>{{ $t('DASHBOARD.reportSwitching') }}</span>
            <CommonSelectGroup
              :id="formData.reportId"
              :label="formData.reportName"
              id-key="reportId"
              label-key="reportName"
              :options="reportUrlList"
              :clearable="false"
              class="report-select"
              @change="reportUrlChange"
            />
          </div>
        </div>

        <div v-if="isExpand" class="task-list">
          <div v-for="item in taskItems" :key="item.key" class="task-item">
            <div class="task-icon-box">
              <img class="card-img" :src="item.icon" :alt="item.label" />
            </div>
            <div class="task-data-box">
              <div class="task-label">{{ item.label }}</div>
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
        <div class="card-title">
          <span>{{ $t('DASHBOARD.todayTransactions') }}</span>
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

        <div v-if="isExpand" class="today-list">
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
  emits: ['changeIsExpand', 'handleChangeUrl', 'handleChangeTodays'],
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

.dashboard-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(340px, 1fr);
  gap: 12px;
  padding: 0 20px;
}

.dashboard-card {
  box-sizing: border-box;
  min-width: 0;
  padding: 6px 20px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.task-card {
  padding-right: 16px;
  padding-left: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 34px;
  overflow-x: auto;
  overflow-y: hidden;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.today-card .card-title {
  gap: 8px;
}

.card-title,
.task-list {
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 2px;
  }
}

.card-title > span,
.expand-button {
  flex-shrink: 0;
}

.task-title {
  margin-left: 4px;
}

.report-switcher {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  margin-left: auto;
  font-size: 14px;
  font-weight: 400;
}

.report-select {
  flex: 0 0 180px;
  width: 180px;
}

.task-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(max-content, 1fr));
  align-items: center;
  gap: 12px;
  height: 130px;
  overflow-x: auto;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.task-icon-box {
  flex: 0 0 48px;
}

.task-data-box {
  flex-shrink: 0;
  white-space: nowrap;
}

.task-label {
  line-height: 20px;
  font-size: 14px;
  color: #606266;
}

.card-img {
  display: block;
  width: 48px;
  height: 48px;
}

.tab-num {
  margin-top: 8px;
  line-height: 24px;
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
  user-select: none;
}

.today-select {
  flex: 0 0 112px;
  width: 112px;
  margin-left: auto;
}

.today-list {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content;
  align-items: center;
  gap: 12px 10px;
  margin-top: 12px;
}

.today-row {
  display: contents;
}

.today-label {
  text-align: right;
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.today-progress {
  min-width: 0;
}

.today-value {
  min-width: 24px;
  text-align: right;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
}
</style>
