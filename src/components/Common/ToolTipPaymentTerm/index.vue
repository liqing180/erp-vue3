<template>
  <el-popover
    trigger="hover"
    placement="top"
    :disabled="showList.length === 0"
    :show-after="400"
  >
    <div class="desc-tooltip">
      <div>
        <div
          v-for="(item, index) in showList"
          :key="item.paymentTermDetailId || `${item.level}_${index}`"
          :style="{ marginTop: index > 0 ? '8px' : '0' }"
        >
          <div :class="`stage-level-${Math.min(item.level, 4)}`">
            <div class="flex-row">
              <div class="prefix-text">{{ getPrefix(item) }}</div>
              <div>{{ item.stageName }}</div>
            </div>
          </div>

          <div
            v-if="item.stageDescription"
            :class="`stage-level-${Math.min(item.level + 1, 4)}`"
            class="stage-description"
          >
            {{ item.stageDescription }}
          </div>
        </div>
      </div>

      <div v-if="paymentTermObj.remarks" class="remarks">
        {{ paymentTermObj.remarks }}
      </div>
    </div>

    <template #reference>
      <div class="tooltip-reference">
        <slot v-if="$slots.default" />
        <div v-else class="tooltip-row">
          <span>{{ showStr }}</span>
        </div>
      </div>
    </template>
  </el-popover>
</template>

<script>
export default {
  name: 'ToolTipPaymentTerm',
  props: {
    paymentTermObj: {
      type: Object,
      default: () => ({})
    },
    showStr: {
      type: String,
      default: ''
    }
  },
  computed: {
    showList() {
      const detailList = this.paymentTermObj?.paymentTermDetailList || []
      return this.flattenDetails(detailList)
    }
  },
  methods: {
    flattenDetails(dataList, level = 0, result = []) {
      dataList.forEach((node, index) => {
        result.push({
          ...node,
          level: level + 1,
          index
        })
        if (node.childList?.length) {
          this.flattenDetails(node.childList, level + 1, result)
        }
      })
      return result
    },
    getPrefix(item) {
      if (item.level > 2) return '- '
      if (item.level === 1) {
        return this.showList.length > 1
          ? `${String.fromCharCode(97 + item.index)}) `
          : ''
      }
      if (item.level === 2) {
        return `${this.convertToRoman(item.index + 1)}. `
      }
      return ''
    },
    convertToRoman(num) {
      if (num < 1 || num > 99) return ''

      const romanNumerals = [
        { value: 90, symbol: 'xc' },
        { value: 50, symbol: 'l' },
        { value: 40, symbol: 'xl' },
        { value: 10, symbol: 'x' },
        { value: 9, symbol: 'ix' },
        { value: 5, symbol: 'v' },
        { value: 4, symbol: 'iv' },
        { value: 1, symbol: 'i' }
      ]

      let result = ''
      let value = num
      romanNumerals.forEach(item => {
        while (value >= item.value) {
          result += item.symbol
          value -= item.value
        }
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.tooltip-reference {
  width: 100%;
}

.desc-tooltip {
  max-width: 820px;
  max-height: 400px;
  padding-right: 8px;
  overflow-y: auto;
  font-family: 'Microsoft YaHei';
  font-size: 12px;
}

.flex-row {
  display: flex;
}

.prefix-text {
  flex: 0 0 auto;
}

.stage-level-1 {
  padding-left: 0;
  white-space: pre-wrap;
}

.stage-level-2 {
  padding-left: 20px;
  white-space: pre-wrap;
}

.stage-level-3 {
  padding-left: 40px;
  white-space: pre-wrap;
}

.stage-level-4 {
  padding-left: 60px;
  white-space: pre-wrap;
}

.stage-description {
  margin-top: 8px;
}

.remarks {
  margin-top: 20px;
  line-height: 20px;
  white-space: pre-wrap;
}

.tooltip-row {
  min-width: 50px;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
