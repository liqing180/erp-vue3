<template>
  <main>
    <h3>销售需求：少量数据滚动性能验证</h3>
    <el-button @click="setRows(8)">8 行</el-button>
    <el-button @click="setRows(40)">40 行</el-button>
    <el-button @click="setMode(true)">优化前</el-button>
    <el-button @click="setMode(false)">当前实现</el-button>
    <el-button @click="showCost">成本表格</el-button>
    <el-button id="benchmark" :disabled="running" @click="benchmark"
      >测试滚动</el-button
    >
    <component
      :is="
        activeCost
          ? 'ProjectCostDetails'
          : baseline
            ? 'BaselineProductDetail'
            : 'ProjectProductDetail'
      "
      :key="rowCount + ':' + baseline"
      ref="product"
      :form-data="form"
      :com-dis-from="viewOnly"
    />
    <el-button @click="updateData">更新业务字段</el-button>
    <el-button @click="replaceRow">替换行对象</el-button>
    <el-button @click="reverseRows">倒序</el-button>
    <el-button @click="viewOnly = !viewOnly">切换查看模式</el-button>
    <el-button @click="toggleError">切换校验错误</el-button>
    <pre id="metrics">{{ metrics }}</pre>
  </main>
</template>
<script>
import ProductDetail from '../src/views/salesManagement/salesInquiry/productInfo/project/projectProductDetail.vue'
import { counts } from './counts'
import Cell from '../src/components/VirtualTableCell/index.js'
import BaselineCell from './BaselineCell.vue'
import CostDetails from '../src/views/salesManagement/salesInquiry/productInfo/project/projectCostDetails.vue'
const InstrumentedCell = {
  ...Cell,
  computed: {
    ...Cell.computed,
    cellContent() {
      counts.cellRenders = (counts.cellRenders || 0) + 1
      return Cell.computed.cellContent.call(this)
    }
  },
  mounted() {
    this.previousContext = {
      rowData: this.rowData,
      column: this.column,
      rowIndex: this.rowIndex
    }
  },
  beforeUpdate() {
    for (const key of ['rowData', 'column', 'rowIndex']) {
      if (this.previousContext[key] !== this[key])
        counts[key + 'Changes'] = (counts[key + 'Changes'] || 0) + 1
      this.previousContext[key] = this[key]
    }
    Cell.beforeUpdate.call(this)
  }
}
const ProductFixture = {
  ...ProductDetail,
  components: Object.fromEntries(
    Object.entries(ProductDetail.components).map(([name, component]) => [
      name,
      name === 'VirtualTableCell' ? InstrumentedCell : { render: () => null }
    ])
  ),
  methods: {
    ...ProductDetail.methods,
    queryAllUomList() {
      this.allUomList = ['BOX', 'ASM']
    },
    $$initColumnVisible(key, columns) {
      columns.forEach((column, index) => {
        column.width = column.prop === 'productName' ? 160 : 140
        column.colSortIndex = index
      })
    }
  }
}
const BaselineProductFixture = {
  ...ProductFixture,
  components: { ...ProductFixture.components, VirtualTableCell: BaselineCell },
  methods: {
    ...ProductFixture.methods,
    tableCellClassName({ row, column }) {
      let cellClass = ''
      if (
        this.modifyHighlight &&
        row.updateType === '1' &&
        (row.updateMsgList || []).some(item => item.name === column.property)
      )
        cellClass = 'edit-table-cell'
      if (
        this.tableList.find(
          item => !item[column.property] && item[column.property + 'Error']
        )
      )
        cellClass = 'is-required-table-cell'
      return cellClass
    }
  }
}
const CostFixture = {
  ...CostDetails,
  components: Object.fromEntries(
    Object.entries(CostDetails.components).map(([name, component]) => [
      name,
      name === 'VirtualTableCell' ? component : { render: () => null }
    ])
  ),
  methods: {
    ...CostDetails.methods,
    queryAllUomList: ProductFixture.methods.queryAllUomList,
    $$initColumnVisible: ProductFixture.methods.$$initColumnVisible
  }
}
function rows(length) {
  return Array.from({ length }, (_, index) => ({
    rowTimeId: `row-${index}`,
    salesPartNo: `SALES-${index}`,
    productName: `828 BHS Sonthofen\nDKXS 4.0 / 第 ${index + 1} 行`,
    internalPartNo: `040301004-${index}`,
    productType: '1',
    isAdhocEntry: index === 3 ? '1' : '0',
    isEdit: true,
    uom: 'BOX',
    basicUom: 'BOX',
    uomDataList: [{ uomName: 'BOX' }],
    qty: 1,
    netQty: 1,
    unitCost: 0,
    includeDecimal: '0',
    decimalNum: 0,
    customIndex: 0,
    description: '',
    remarks: ''
  }))
}
export default {
  components: {
    ProjectProductDetail: ProductFixture,
    ProjectCostDetails: CostFixture,
    BaselineProductDetail: BaselineProductFixture
  },
  data() {
    return {
      rowCount: 8,
      baseline: false,
      activeCost: false,
      viewOnly: false,
      form: {
        salesInquiryType: 'Project',
        salesInquiryStatus: '1',
        salesInquiryProductList: rows(8)
      },
      running: false,
      metrics: ''
    }
  },
  methods: {
    showCost() {
      const data = rows(2)
      data[0].productName = '成本阶段的多行\n长名称应及时更新'
      data[1].customIndex = 1
      data[1].productId = 'TEST'
      data[0].childProductList = [data[1]]
      this.form.salesInquiryProductList = [data[0]]
      this.activeCost = true
      this.metrics = ''
    },
    setMode(baseline) {
      counts.mounted = {}
      this.baseline = baseline
      this.metrics = ''
    },
    updateData() {
      const row = this.form.salesInquiryProductList[0]
      row.productName = '字段修改后应立即显示新的长产品名称'
      row.qty = 9
    },
    replaceRow() {
      this.form.salesInquiryProductList[0] = {
        ...this.form.salesInquiryProductList[0],
        productName: '替换后的新行对象名称',
        qty: 7
      }
    },
    reverseRows() {
      this.form.salesInquiryProductList.reverse()
    },
    toggleError() {
      const row = this.form.salesInquiryProductList[0]
      row.productNameError = !row.productNameError
      row.productName = row.productNameError ? '' : '校验清除后的产品名称'
      row['ROW-ERROR'] = row.productNameError
    },
    setRows(length) {
      this.rowCount = length
      this.form.salesInquiryProductList = rows(length)
      this.metrics = ''
    },
    async benchmark() {
      this.running = true
      counts.updated = {}
      counts.cellRenders = 0
      counts.columnChanges = 0
      counts.rowDataChanges = 0
      counts.rowIndexChanges = 0
      const frames = []
      const tasks = []
      const observer = new PerformanceObserver(list =>
        tasks.push(...list.getEntries().map(entry => entry.duration))
      )
      observer.observe({ type: 'longtask' })
      let previous = performance.now()
      for (let index = 0; index < 40; index++) {
        previous = performance.now()
        this.$refs.product.$refs.tables.scrollToLeft(index % 2 ? 0 : 600)
        await this.$nextTick()
        this.$refs.product.$refs.tables.$el.getBoundingClientRect()
        frames.push(performance.now() - previous)
      }
      observer.disconnect()
      const sorted = [...frames].sort((a, b) => a - b)
      this.metrics = JSON.stringify(
        {
          rows: this.rowCount,
          baseline: this.baseline,
          meanMs: +(frames.reduce((a, b) => a + b, 0) / frames.length).toFixed(
            2
          ),
          p95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
          maxMs: +sorted.at(-1).toFixed(2),
          longTasks: tasks.length,
          longTaskMs: +tasks.reduce((a, b) => a + b, 0).toFixed(2),
          mounted: counts.mounted,
          updated: counts.updated,
          cellRenders: counts.cellRenders,
          columnChanges: counts.columnChanges,
          rowDataChanges: counts.rowDataChanges,
          rowIndexChanges: counts.rowIndexChanges
        },
        null,
        2
      )
      this.running = false
    }
  }
}
</script>
<style scoped>
main {
  padding: 16px 24px;
}
#metrics {
  max-height: 200px;
  overflow: auto;
}
</style>
