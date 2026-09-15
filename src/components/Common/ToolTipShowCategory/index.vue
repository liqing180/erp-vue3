<template>
  <el-popover
    :disabled="comList.length === 0"
    trigger="hover"
    placement="top"
    :show-after="100"
    @hide="hide"
  >
    <div class="pop-box">
      <el-scrollbar ref="scrollbarRef">
        <div class="category-table-wrap">
          <table>
            <thead>
              <tr>
                <th
                  v-for="columnIndex in maxColumns"
                  :key="`head_${columnIndex}`"
                >
                  {{ columnIndex <= 6 ? layerLabel(columnIndex) : '' }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, rowIndex) in comList" :key="rowIndex">
                <td
                  v-for="columnIndex in maxColumns"
                  :key="`cell_${rowIndex}_${columnIndex}`"
                >
                  <span class="child-label">
                    {{ item[columnIndex - 1] || '' }}
                  </span>
                  <span v-if="columnIndex < item.length" class="split-icon">
                    ›
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-scrollbar>
    </div>

    <template #reference>
      <div class="tooltip-reference">
        <slot v-if="$slots.default" />
        <div v-else class="tooltip-row">{{ labelJoinStr }}</div>
      </div>
    </template>
  </el-popover>
</template>

<script>
export default {
  name: 'ToolTipShowCategory',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    comList() {
      return this.list || []
    },
    maxColumns() {
      return this.comList.reduce(
        (max, item) => Math.max(max, Array.isArray(item) ? item.length : 0),
        0
      )
    },
    labelJoinStr() {
      return ''
    }
  },
  methods: {
    layerLabel(index) {
      const zhLabels = [
        '一级分类',
        '二级分类',
        '三级分类',
        '四级分类',
        '五级分类',
        '六级分类'
      ]
      const enLabels = [
        'First Layer',
        'Second Layer',
        'Third Layer',
        'Fourth Layer',
        'Fifth Layer',
        'Sixth Layer'
      ]
      const locale = this.$i18n?.locale || this.$i18n?.global?.locale
      const localeValue = locale?.value || locale
      return (localeValue === 'en' ? enLabels : zhLabels)[index - 1] || ''
    },
    hide() {
      this.$refs.scrollbarRef?.setScrollTop?.(0)
      this.$refs.scrollbarRef?.setScrollLeft?.(0)
    }
  }
}
</script>

<style lang="scss" scoped>
.tooltip-reference {
  width: 100%;
}

.tooltip-row {
  min-width: 50px;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.pop-box {
  max-width: 80vw;
  overflow: hidden;
  border: 1px solid #efefef;
  border-radius: 4px;
}

.category-table-wrap {
  max-height: 360px;
}

table {
  border-collapse: collapse;
  color: #606266;
  font-size: 12px;
}

th,
td {
  padding: 4px 10px;
  white-space: nowrap;
  border-right: 1px solid #efefef;
}

th {
  font-weight: bold;
  border-bottom: 1px solid #efefef;
}

th:last-child,
td:last-child {
  border-right: 0;
}

.split-icon {
  float: right;
  padding-left: 10px;
}
</style>
