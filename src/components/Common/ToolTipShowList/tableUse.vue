<template>
  <el-popover
    ref="pop1"
    :visible="visible"
    :virtual-ref="virtualRef"
    virtual-triggering
    placement="top"
    :show-arrow="true"
    popper-class="pop-warp"
    :offset="8"
    persistent
  >
    <div class="pop-box" @mouseenter="cancelHide" @mouseleave="scheduleHide">
      <div v-if="params.popoverTitle" class="pp-title ellipsis-text">
        <span>{{ params.popoverTitle }}</span>
      </div>
      <el-scrollbar ref="scrollbarRef">
        <div class="pp-item-warp">
          <div
            v-for="(item, index) in params.list || []"
            :key="index"
            class="pp-item ellipsis-text"
            :class="[params.itemClass, item.itemClass]"
          >
            <span
              :title="params.labelKey ? item[params.labelKey] : item"
              @click="clickItem(item)"
            >
              {{ params.labelKey ? item[params.labelKey] : item }}
            </span>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-popover>
</template>

<script>
export default {
  emits: ['clickItem'],
  data() {
    return {
      visible: false,
      virtualRef: undefined,
      hideTimer: undefined,
      params: {
        popoverTitle: '',
        labelKey: '',
        itemClass: '',
        list: []
      }
    }
  },
  beforeUnmount() {
    this.clearHideTimer()
  },
  methods: {
    showPop(event, params) {
      const target = event.currentTarget || event.target
      if (!(target instanceof HTMLElement)) return

      this.clearHideTimer()
      this.params = params || {}
      this.virtualRef = target
      this.visible = true

      this.$nextTick(() => {
        this.$refs.scrollbarRef?.setScrollTop?.(0)
      })
    },
    hidePop() {
      this.scheduleHide()
    },
    scheduleHide() {
      this.clearHideTimer()
      this.hideTimer = window.setTimeout(() => {
        this.visible = false
      }, 300)
    },
    cancelHide() {
      this.clearHideTimer()
    },
    clearHideTimer() {
      if (this.hideTimer !== undefined) {
        window.clearTimeout(this.hideTimer)
        this.hideTimer = undefined
      }
    },
    clickItem(item) {
      this.$emit('clickItem', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.pop-box {
  border: 1px solid #efefef;
  border-radius: 4px;
}

.pp-title {
  padding: 1px 5px;
  line-height: 28px;
  vertical-align: middle;
  text-align: left;
  font-weight: bold;
  border-bottom: 1px solid #efefef;
  font-size: 14px;
}

.pp-item-warp {
  max-height: 294px;
}

.pp-item {
  padding: 1px 5px;
  line-height: 28px;
  vertical-align: middle;
  font-size: 12px;
  text-align: left;
  border-bottom: 1px solid #efefef;
}

.pp-item:last-child {
  border-bottom: 0;
}

.ellipsis-text {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
