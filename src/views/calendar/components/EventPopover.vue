<template>
  <el-popover
    v-model:visible="visible"
    placement="top"
    :width="400"
    trigger="manual"
    :popper-options="popperOptions"
    :virtual-ref="virtualElement"
    virtual-triggering
    :hide-after="0"
    :show-after="100"
  >
    <div class="event-popover">
      <div class="event-popover-header">
        <span
          class="ellipsis-text"
          style="display: block; max-width: 320px"
          :title="eventData?.meetingSubject"
          >{{ eventData?.meetingSubject || '' }}</span
        >
        <el-icon :size="22" class="close-icon" @click="handleClose"
          ><Close
        /></el-icon>
      </div>
      <div class="event-popover-content">
        <div class="content-item flexStart">
          <div style="line-height: 1">
            <el-icon :size="20" color="#999"><Calendar /></el-icon>
          </div>
          <div class="ml10">
            {{ eventData?.dateTimeShowStr }}
          </div>
        </div>
        <div class="content-item flexStart">
          <div style="line-height: 1">
            <el-icon :size="20" color="#999"><CreditCard /></el-icon>
          </div>
          <el-scrollbar class="ml10" max-height="96px" ref="userDropdown">
            <div style="padding-right: 10px">
              {{ eventData?.meetingContent }}
            </div>
          </el-scrollbar>
        </div>
        <div
          class="content-item flexStart"
          v-if="eventData?.salesOpportunityName"
        >
          <div style="line-height: 1">
            <el-icon :size="20" color="#999"><Link /></el-icon>
          </div>
          <div class="ml10">
            {{ eventData?.salesOpportunityName }}
          </div>
        </div>
        <div class="content-item flexStart">
          <div style="line-height: 1">
            <el-icon :size="20" color="#999"><User /></el-icon>
          </div>
          <div class="ml10">
            {{ eventData?.userNames }}
          </div>
        </div>
      </div>
      <div
        class="event-popover-footer"
        style="justify-content: flex-start; padding-top: 10px"
        v-if="
          eventData?.meetingDataSource === '1' &&
          (eventData?.isCanDelete === '1' || eventData?.isCanUpdate === '1')
        "
      >
        <el-button
          v-if="eventData?.isCanUpdate === '1'"
          type="primary"
          size="small"
          @click="handleEdit"
          >{{ $t('uiBtn.edit') }}</el-button
        >
        <el-button
          v-if="eventData?.isCanDelete === '1'"
          type="danger"
          size="small"
          @click="handleDelete"
          >{{ $t('uiBtn.delete') }}</el-button
        >
      </div>
    </div>
  </el-popover>
</template>

<script>
import { deleteMeeting } from '@/api/calendar'
export default {
  name: 'EventPopover',
  data() {
    return {
      visible: false,
      eventData: null,
      popperOptions: {
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              padding: 10
            }
          }
        ]
      },
      virtualElement: null
    }
  },
  methods: {
    open(data, $event) {
      // 先关闭当前弹窗，然后设置新数据
      this.visible = false
      // 使用nextTick确保DOM更新后再打开新弹窗
      this.$nextTick(() => {
        const extendedProps = data.extendedProps || {}
        this.eventData = extendedProps.eventContent || {}

        // 创建虚拟元素，基于事件DOM元素的位置
        if ($event) {
          // console.log($event) - 可以移除不必要的日志

          this.virtualElement = {
            getBoundingClientRect: () => ({
              width: 0,
              height: 12,
              top: $event.clientY - 6,
              right: $event.clientX,
              bottom: $event.clientY,
              left: $event.clientX
            })
          }
        }

        // 延迟一下再显示弹窗，确保状态已更新
        setTimeout(() => {
          this.visible = true
          this.$nextTick(() => {
            const userDropdown = this.$refs.userDropdown
            if (userDropdown) {
              console.log(userDropdown.setScrollTop)

              userDropdown.setScrollTop(0)
            }
          })
        }, 50)
      })
    },
    handleClose() {
      this.visible = false
    },
    handleEdit() {
      this.$emit('edit', this.eventData)
      this.handleClose()
    },
    handleDelete() {
      this.$modal
        .confirm(this.$t('ui.delConfirm'))
        .then(() => {
          return deleteMeeting({ meetingId: this.eventData.meetingId })
        })
        .then(res => {
          if (res.code === 200) {
            this.$emit('delete', this.eventData)
            this.handleClose()
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.event-popover {
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    font-weight: bold;
    background-color: #ecf5ff;
    margin: -12px -12px 0;
    color: #555;
    font-size: 14px;

    .close-icon {
      cursor: pointer;
      color: #666;

      &:hover {
        color: #444;
      }
    }
  }

  &-content {
    padding-top: 10px;
    font-size: 12px;

    .event-time-range {
      color: #555;
      margin-bottom: 8px;
    }
  }

  &-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
  }
}

.content-item {
  margin: 10px 0;
  vertical-align: middle;
  font-size: 14px;
}

.content-text {
  max-height: 96px; /* 假设每行高度为24px，4行就是96px */
  overflow-y: auto;
}
</style>
