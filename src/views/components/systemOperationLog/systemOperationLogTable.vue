<template>
  <el-table
    v-loading="loading"
    border
    ref="tables"
    :max-height="300"
    :data="tableList"
  >
    <el-table-column
      type="index"
      key="index"
      :label="$t('ui.sn')"
      width="60"
      fixed="left"
      align="center"
    >
      <template #default="scope">
        <span>{{ scope.$index + 1 }}</span>
      </template>
    </el-table-column>
    <el-table-column
      v-for="item in visibleColumn"
      :key="item.prop + item.colSortIndex"
      :prop="item.prop"
      :label="item.label"
      :width="item.width"
      :min-width="getMinWidth(item)"
      :show-overflow-tooltip="item.tooltip"
      :fixed="item.fixed"
      :sortable="item.sortable"
      :align="item.align || 'left'"
      header-align="center"
    >
      <template v-slot="scope">
        {{ scope.row[item.prop] }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
export default {
  mixins: [pageMixin],
  props: {
    tableList: {
      type: Array,
      default() {
        return []
      }
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const vm = this
    return {
      /* 表格部分 */
      columns: [
        {
          prop: 'operationTypeShowStr',
          label: vm.$t('sysOL.operationType'),
          visible: true,
          minWidth: 180,
          tooltip: true
        },
        {
          prop: 'operatorBy',
          label: vm.$t('sysOL.operator'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'operationResultShowStr',
          label: vm.$t('sysOL.result'),
          visible: true,
          minWidth: 180,
          tooltip: true
        },
        {
          prop: 'operatorTimeStr',
          label: vm.$t('sysOL.time'),
          visible: true,
          width: 160,
          tooltip: true
        },
        {
          prop: 'operationDescriptionShowStr',
          label: vm.$t('sysOL.description'),
          visible: true,
          minWidth: 200,
          tooltip: true
        }
      ]
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  watch: {
    tableList: {
      deep: true,
      immediate: true,

      handler: function () {
        this.changeTable()
      }
    }
  },
  beforeCreate() {},
  created() {
    this.$$initColumnHeaderWidth(this.columns)
  },
  methods: {
    changeTable() {
      this.tableList.forEach(item => {
        item.operatorTimeStr = this.parseTime(
          item.operatorTime,
          this.fmtForYmdhms
        )
      })
      this.$$getColumnContentMaxWidth(this.columns, this.tableList)
    }
  }
}
</script>
