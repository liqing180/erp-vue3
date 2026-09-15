<template>
  <el-popover
    ref="pop1"
    trigger="hover"
    placement="top"
    :close-delay="0"
    :visible-arrow="true"
    popper-class="pop-warp"
    :offset="-30"
  >
    <div @mouseenter="mouseenterCur($event)" class="pop-box">
      <div class="pp-title ellipsis-text" v-if="params.popoverTitle">
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
              @click="clickItem(item)"
              :title="params.labelKey ? item[params.labelKey] : item"
              >{{ params.labelKey ? item[params.labelKey] : item }}</span
            >
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-popover>
</template>

<script>
export default {
  props: {},
  computed: {},
  data() {
    return {
      timeout: null,
      popoverData: {},
      params: {
        popoverTitle: '',
        labelKey: '',
        itemClass: '',
        list: []
      }
    }
  },

  methods: {
    showPop(e, params) {
      this.params = params || {}
      this.popoverData['hide'] = false
      console.log(this.$refs.pop1)

      this.$refs.pop1.popBy(e.target)
      if (this.$refs.scrollbarRef) {
        this.$refs.scrollbarRef.moveY = 0
      }
    },
    hidePop(e) {
      if (this.popoverData) {
        this.popoverData.hide = true
      }
      setTimeout(() => {
        this.popoverData.hide && this.$refs.pop1.close()
      }, 300)
    },
    mouseenterCur() {
      if (this.popoverData) {
        this.popoverData.hide = false
      }
    },
    clickItem(item) {
      this.$emit(this, 'clickItem', item)
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
  vertical-align: middle; /*// color: #000000;*/
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
  font-size: 12px; /*// color: #000000;*/
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
