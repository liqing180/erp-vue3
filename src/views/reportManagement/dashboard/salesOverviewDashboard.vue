<template>
  <div style="display: flex; flex-direction: column" v-resize="divResizeFn">
    <!-- 第一行图表 -->
    <div class="charts-row">
      <div class="chart-item">
        <div
          ref="sourceChart"
          style="height: 300px"
          v-if="customerSourceList.length > 0"
        ></div>
        <div v-else>
          <div class="title-top">
            {{ $t('customer.customerSource') }}
          </div>
          <el-empty style="height: 300px" :description="$t('ui.noData')" />
        </div>
      </div>
      <div class="chart-item">
        <div
          ref="typeChart"
          style="height: 300px"
          v-if="customerTypeList.length > 0"
        ></div>
        <div v-else>
          <div class="title-top">
            {{ $t('customer.customerType') }}
          </div>
          <el-empty style="height: 300px" :description="$t('ui.noData')" />
        </div>
      </div>
      <div class="chart-item">
        <div
          ref="stageChart"
          style="height: 300px"
          v-if="salesOpportunityStageList.length > 0"
        ></div>
        <div v-else>
          <div class="title-top">
            {{ $t('customer.salesOpportunityStage') }}
          </div>
          <el-empty style="height: 300px" :description="$t('ui.noData')" />
        </div>
      </div>
    </div>

    <!-- 第二行图表 -->
    <div class="charts-row">
      <div class="chart-item">
        <div
          ref="funnelChart"
          style="height: 400px"
          v-if="salesStageFunnelList.length > 0"
        ></div>
        <div v-else>
          <div class="title-top">
            {{ $t('customer.salesFunnel') }}
          </div>
          <el-empty style="height: 300px" :description="$t('ui.noData')" />
        </div>
      </div>
      <div class="chart-item">
        <template v-if="salesOpportunityTrendList.length > 0">
          <div class="subtext flexStart">
            <div class="mr20 flow1">
              <div>
                {{ $t('customer.salesOpportunityAmount2') }}
              </div>
              <div
                class="mt5 flow1"
                :title="
                  legalEntityInfo.currencySymbol + ' ' + extra.totalAmount
                "
              >
                {{ legalEntityInfo.currencySymbol }}
                {{ extra.totalAmount }}
              </div>
            </div>
            <div class="flow1">
              <div>{{ $t('customer.salesOpportunityWonAmount1') }}</div>
              <div
                class="mt5 flow1"
                :title="
                  legalEntityInfo.currencySymbol + ' ' + extra.dealTotalAmount
                "
              >
                {{ legalEntityInfo.currencySymbol }}
                {{ extra.dealTotalAmount }}
              </div>
            </div>
          </div>
          <trendChart
            ref="trendChart"
            :key="queryParams.dashboardOverviewType"
            style="width: 100%; height: 400px"
          />
        </template>
        <div v-else>
          <div class="title-top">
            {{ $t('customer.salesOpportunityTrend') }}
          </div>
          <el-empty style="height: 300px" :description="$t('ui.noData')" />
        </div>
      </div>
    </div>
    <!-- 商机分析 -->
    <div class="tables-row">
      <div class="tables-left">
        <div class="tables-item">
          <div class="title">{{ $t('customer.salesOpportunityAnalysis') }}</div>
          <div>
            <salesOpportunityAnalysisTable
              ref="salesOpportunityAnalysisTable"
              :permissionUserIdList="permissionUserIdList"
              :searchQueryParams="queryParams"
              class="mt10"
            />
          </div>
        </div>
        <div class="tables-item mt20">
          <div class="title">{{ $t('customer.salesAnalysis') }}</div>
          <salesAnalysisTable
            ref="salesAnalysisTable"
            :permissionUserIdList="permissionUserIdList"
            :searchQueryParams="queryParams"
            class="mt10"
          />
        </div>
      </div>
      <div class="tables-right">
        <div class="tables-item">
          <div class="title">{{ $t('customer.customerAnalysis') }}</div>
          <customerAnalysisTable
            ref="customerAnalysisTable"
            :permissionUserIdList="permissionUserIdList"
            :searchQueryParams="queryParams"
            class="mt10"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  queryCustomerSource,
  queryCustomerType,
  querySalesOpportunityStage,
  querySalesStageFunnel,
  querySalesOpportunityTrend
} from '@/api/reportManagement/dashboard'
import salesOpportunityAnalysisTable from './components/salesOverviewDashboard/salesOpportunityAnalysisTable.vue'
import salesAnalysisTable from './components/salesOverviewDashboard/salesAnalysisTable.vue'
import customerAnalysisTable from './components/salesOverviewDashboard/customerAnalysisTable.vue'
import trendChart from './components/salesOverviewDashboard/trendChart.vue'
import resize from '@/directive/resize'

export default {
  directives: {
    resize
  },
  name: 'SalesOverviewDashboard',
  components: {
    salesOpportunityAnalysisTable,
    salesAnalysisTable,
    customerAnalysisTable,
    trendChart
  },
  props: {
    permissionUserIdList: {
      type: Array,
      default: () => []
    },
    queryParams: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      charts: {
        sourceChart: null,
        typeChart: null,
        stageChart: null,
        funnelChart: null,
        trendChart: null
      },
      // 颜色
      colors: [
        '#165DFF',
        '#14C9C9',
        '#F7BA1E',
        '#722ED1',
        '#3491FA',
        '#28E375'
      ],
      // 客户来源
      customerSourceList: [],
      // 客户类型
      customerTypeList: [],
      // 商机阶段
      salesOpportunityStageList: [],
      // 商机漏斗
      salesStageFunnelList: [],
      // 商机趋势
      salesOpportunityTrendList: [],
      extra: {},
      timer: undefined
    }
  },
  computed: {
    legalEntityInfo() {
      return this.$store.state.user.legalEntityInfo
    }
  },
  mounted() {
    const that = this
    // 监听窗口尺寸变化事件
    // window.addEventListener('resize', function () {
    //   Object.values(that.charts).forEach(chart => {
    //     chart && chart.resize()
    //   })
    // })
  },
  methods: {
    divResizeFn() {
      const that = this
      Object.values(that.charts).forEach(chart => {
        chart && chart.resize()
      })
      this.$refs.trendChart && this.$refs.trendChart.handleResize()
    },
    init(e) {
      const that = this
      // if (e && e.type === 'init') {
      //   Object.values(that.charts).forEach(chart => {
      //     chart && chart.resize()
      //   })
      //   this.$refs.trendChart && this.$refs.trendChart.handleResize()
      // }
      this.queryCustomerSource()
      this.queryCustomerType()
      this.querySalesOpportunityStage()
      this.querySalesStageFunnel()
      this.querySalesOpportunityTrend()
      this.initTable()
    },
    dispose() {
      Object.values(this.charts).forEach(chart => {
        chart && chart.dispose()
      })
      this.charts = {
        sourceChart: null,
        typeChart: null,
        stageChart: null,
        funnelChart: null,
        trendChart: null
      }
    },
    // 客户来源
    queryCustomerSource() {
      const { dateRange, ...params } = this.queryParams || {}
      queryCustomerSource({
        permissionUserIdList: this.permissionUserIdList,
        ...params
      }).then(res => {
        const { dashboardDetailVOList } = res.data || {}
        this.customerSourceList = dashboardDetailVOList || []
        if (this.customerSourceList.length > 0) {
          const legendData = this.customerSourceList.map(
            x => x.customerSourceShowStr
          )
          const seriesData = this.customerSourceList.map((x, index) => ({
            value: x.count,
            allCount: x.allCount,
            name: x.customerSourceShowStr,
            itemStyle: {
              color: this.colors[index]
            }
          }))
          const params = {
            legendData,
            seriesData
          }
          this.$nextTick(() => {
            this.initSourceChart(params)
          })
        } else {
          this.charts.sourceChart && this.charts.sourceChart.clear()
          this.charts.sourceChart = null
        }
      })
    },
    // 客户来源图表
    initSourceChart(params) {
      if (!this.charts.sourceChart) {
        this.charts.sourceChart = echarts.init(this.$refs.sourceChart)
      }
      const { legendData, seriesData } = params || {}
      const that = this
      let options = {
        title: {
          text: this.$t('customer.customerSource'),
          top: 10,
          left: 20
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          },
          borderColor: '#ffffff',
          // 自定义提示框内容
          formatter: function (params) {
            const { value, percent, name, data } = params
            const { allCount } = data || {}
            let result = `
            <table>
              <tbody>
                <tr>
                  <td style="text-align: right">${that.$t('customer.customerSource')} : </td>
                  <td>${name}</td>
                </tr>
                <tr>
                  <td style="text-align: right">${that.$t('customer.totalQty')} : </td>
                  <td>${that.$numberStr(allCount, 0)}</td>
                </tr>
                <tr>
                  <td style="text-align: right">${that.$t('customer.qty')} : </td>
                  <td>${that.$numberStr(value, 0)}</td>
                </tr>
                <tr>
                  <td style="text-align: right">% : </td>
                  <td>${that.$numberStr(percent, 2)}</td>
                </tr>
              </tbody>
            </table>
            `
            return result
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          icon: 'circle',
          top: 'center',
          data: legendData
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '60%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            data: seriesData
          }
        ]
      }
      this.charts.sourceChart.setOption(options)
    },
    // 客户类型
    queryCustomerType() {
      const { dateRange, ...params } = this.queryParams || {}

      queryCustomerType({
        permissionUserIdList: this.permissionUserIdList,
        ...params
      }).then(res => {
        const { dashboardDetailVOList } = res.data || {}
        this.customerTypeList = dashboardDetailVOList || []
        if (this.customerTypeList.length > 0) {
          const legendData = this.customerTypeList.map(
            x => x.customerTypeShowStr
          )
          const seriesData = this.customerTypeList.map((x, index) => ({
            value: x.count,
            allCount: x.allCount,
            name: x.customerTypeShowStr,
            itemStyle: {
              color: this.colors[index]
            }
          }))
          const params = {
            legendData,
            seriesData
          }
          this.$nextTick(() => {
            this.initTypeChart(params)
          })
        } else {
          this.charts.typeChart && this.charts.typeChart.clear()
          this.charts.typeChart = null
        }
      })
    },
    // 客户类型图表
    initTypeChart(params) {
      if (!this.charts.typeChart) {
        this.charts.typeChart = echarts.init(this.$refs.typeChart)
      }
      const { legendData, seriesData } = params || {}
      const that = this
      let options = {
        title: {
          text: this.$t('customer.customerType'),
          top: 10,
          left: 20
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          },
          borderColor: '#ffffff',
          // 自定义提示框内容
          formatter: function (params) {
            const { value, percent, name, data } = params
            const { allCount } = data || {}
            // let result = `
            //   <div>${that.$t('customer.customerType')} : ${name}</div>
            //   <div>${that.$t('customer.totalQty')} : ${that.$numberStr(allCount, 0)}</div>
            //   <div>${that.$t('customer.qty')} : ${that.$numberStr(value, 0)}</div>
            //   <div>% : ${that.$numberStr(percent, 2)}</div>
            //   `
            let result = `
              <table>
              <tbody>
                <tr>
                  <td style="text-align: right">${that.$t('customer.customerType')} : </td>
                  <td>${name}</td>
                </tr>
                <tr>
                  <td style="text-align: right">${that.$t('customer.totalQty')} : </td>
                  <td>${that.$numberStr(allCount, 0)}</td>
                </tr>
                <tr>
                  <td style="text-align: right">${that.$t('customer.qty')} : </td>
                  <td>${that.$numberStr(value, 0)}</td>
                </tr>
                <tr>
                  <td style="text-align: right">% : </td>
                  <td>${that.$numberStr(percent, 2)}</td>
                </tr>
              </tbody>
            </table>
              `
            return result
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          icon: 'circle',
          top: 'center',
          data: legendData
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '60%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            data: seriesData
          }
        ]
      }
      this.charts.typeChart.setOption(options)
    },
    // 商机阶段
    querySalesOpportunityStage() {
      const { dateRange, ...params } = this.queryParams || {}
      querySalesOpportunityStage({
        permissionUserIdList: this.permissionUserIdList,
        ...params
      }).then(res => {
        const { dashboardDetailVOList } = res.data || {}
        this.salesOpportunityStageList = dashboardDetailVOList || []
        if (this.salesOpportunityStageList.length > 0) {
          const legendData = this.salesOpportunityStageList.map(
            x => x.stageName
          )
          const seriesData = this.salesOpportunityStageList.map((x, index) => ({
            value: x.count,
            allCount: x.allCount,
            name: x.stageName,
            itemStyle: {
              color: this.colors[index]
            }
          }))
          const params = {
            legendData,
            seriesData
          }
          this.$nextTick(() => {
            this.initStageChart(params)
          })
        } else {
          this.charts.stageChart && this.charts.stageChart.clear()
          this.charts.stageChart = null
        }
      })
    },
    // 商机阶段图表
    initStageChart(params) {
      if (!this.charts.stageChart) {
        this.charts.stageChart = echarts.init(this.$refs.stageChart)
      }
      const { legendData, seriesData } = params || {}
      const that = this
      let options = {
        title: {
          text: this.$t('customer.salesOpportunityStage'),
          top: 10,
          left: 20
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          },
          borderColor: '#ffffff',
          // 自定义提示框内容
          formatter: function (params) {
            const { value, percent, name, data } = params
            const { allCount } = data || {}
            // let result = `<div style="min-width: 100px">
            //   <div>${that.$t('customer.salesOpportunityStage')} : ${name}</div>
            //   <div>${that.$t('customer.totalQty')} : ${that.$numberStr(allCount, 0)}</div>
            //   <div>${that.$t('customer.qty')} : ${that.$numberStr(value, 0)}</div>
            //   <div>% : ${that.$numberStr(percent, 2)}</div>
            //   `
            let result = `
              <table>
              <tbody>
                <tr>
                  <td style="text-align: right">${that.$t('customer.salesOpportunityStage')} : </td>
                  <td>${name}</td>
                </tr>
                <tr>
                  <td style="text-align: right">${that.$t('customer.totalQty')} : </td>
                  <td>${that.$numberStr(allCount, 0)}</td>
                </tr>
                <tr>
                  <td style="text-align: right">${that.$t('customer.qty')} : </td>
                  <td>${that.$numberStr(value, 0)}</td>
                </tr>
                <tr>
                  <td style="text-align: right">% : </td>
                  <td>${that.$numberStr(percent, 2)}</td>
                </tr>
              </tbody>
            </table>
              `
            return result
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          icon: 'circle',
          top: 'center',
          data: legendData
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '60%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            data: seriesData
          }
        ]
      }
      this.charts.stageChart.setOption(options)
    },
    // 商机漏斗
    querySalesStageFunnel() {
      const { dateRange, ...params } = this.queryParams || {}
      querySalesStageFunnel({
        permissionUserIdList: this.permissionUserIdList,
        ...params
      }).then(res => {
        const { dashboardDetailVOList } = res.data || {}
        this.salesStageFunnelList = dashboardDetailVOList || []
        if (this.salesStageFunnelList.length > 0) {
          const legendData = this.salesStageFunnelList.map(x => x.stageName)
          const color1 = ['#00B8D9', '#36B37E', '#FFAB00', '#FF5931']

          const colors2 = [
            '#FF9C9C',
            '#F7C698',
            '#FDE388',
            '#BBD7F8',
            '#D9A8CC',
            '#F8D6C8',
            '#89E1DB',
            '#97A6F9',
            '#FF9ECC',
            '#B7EDBE',
            '#E6DBFC'
          ]
          const seriesData = this.salesStageFunnelList.map((x, index) => ({
            value: x.count,
            name: x.stageName,
            totalAmount: x.totalAmount,
            itemStyle: {
              color: index <= 3 ? color1[index] : colors2[index - 4]
            }
          }))
          const params = {
            legendData,
            seriesData
          }
          this.$nextTick(() => {
            this.initFunnelChart(params)
          })
        } else {
          this.charts.funnelChart && this.charts.funnelChart.clear()
          this.charts.funnelChart = null
        }
      })
    },
    // 商机漏斗图表
    initFunnelChart(params) {
      if (!this.charts.funnelChart) {
        this.charts.funnelChart = echarts.init(this.$refs.funnelChart)
      }
      const { legendData, seriesData } = params || {}
      const that = this
      let options = {
        title: {
          text: this.$t('customer.salesFunnel'),
          top: 10,
          left: 20
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          },
          borderColor: '#ffffff',
          // 自定义提示框内容
          formatter: function (params) {
            const { value, percent, name, data } = params
            const { totalAmount } = data || {}
            // let result = `<div style="min-width: 100px">
            //   <div>${name} : ${that.$numberStr(totalAmount, 2)}</div>
            //   <div>${that.$t('customer.salesOpportunityQTY')} : ${that.$numberStr(value, 0)}</div>
            //   `
            let result = `
              <table>
              <tbody>
                <tr>
                  <td style="text-align: right">${name} : </td>
                  <td>${that.$numberStr(totalAmount, 2)}</td>
                </tr>
                <tr>
                  <td style="text-align: right">${that.$t('customer.salesOpportunityQTY')} : </td>
                  <td>${that.$numberStr(value, 0)}</td>
                </tr>
              </tbody>
            </table>
              `
            return result
          }
        },
        legend: {
          right: 10,
          icon: 'circle',
          top: 50,
          data: legendData
        },
        series: [
          {
            type: 'funnel',
            left: '10%',
            top: 100,
            bottom: 30,
            width: '40%',
            min: 0,
            // max: 100,
            minSize: '50%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: true,
              position: 'right',
              formatter: function (params) {
                const { totalAmount, name } = params.data || {}
                return `${name} - ${that.legalEntityInfo.currencySymbol} ${that.$numberStr(totalAmount, 2)}`
              },
              color: '#333'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            },
            // itemStyle: {
            //   borderColor: '#fff',
            //   borderWidth: 1
            // },
            emphasis: {
              label: {
                fontSize: 20
              }
            },
            data: seriesData
          }
        ]
      }
      if (that.legalEntityInfo.currencySymbol) {
        this.charts.funnelChart.setOption(options)
      } else {
        this.timer = setInterval(() => {
          if (that.legalEntityInfo.currencySymbol) {
            that.charts.funnelChart.setOption(options)
            clearInterval(that.timer)
            that.timer = undefined
          }
        }, 100)
      }
    },
    // 商机趋势
    querySalesOpportunityTrend() {
      const { dateRange, ...params } = this.queryParams || {}
      querySalesOpportunityTrend({
        permissionUserIdList: this.permissionUserIdList,
        ...params
      }).then(res => {
        const { dashboardDetailVOList, extra } = res.data || {}
        this.extra = extra || {}
        this.salesOpportunityTrendList = dashboardDetailVOList || []
        if (this.salesOpportunityTrendList.length > 0) {
          const legendData = [
            this.$t('customer.salesOpportunityAmount1'),
            this.$t('customer.salesOpportunityWonAmount')
          ]
          const seriesData1 = this.salesOpportunityTrendList.map(
            (x, index) => ({
              value: x.totalAmount,
              salesOpportunityAmount: x.totalAmount,
              salesOpportunityWonAmount: x.dealTotalAmount,
              name: x.timeAxisLabel,
              itemStyle: {
                color: this.colors[0]
              }
            })
          )
          const seriesData2 = this.salesOpportunityTrendList.map(
            (x, index) => ({
              value: x.dealTotalAmount,
              salesOpportunityAmount: x.totalAmount,
              salesOpportunityWonAmount: x.dealTotalAmount,
              name: x.timeAxisLabel,
              itemStyle: {
                color: this.colors[1]
              }
            })
          )
          // const seriesData1 = this.salesOpportunityTrendList.map(x => )
          // const seriesData2 = this.salesOpportunityTrendList.map(
          //   x => x.dealTotalAmount
          // )
          const line1 = {
            data: seriesData1,
            name: this.$t('customer.salesOpportunityAmount1'),
            type: 'line',
            itemStyle: {
              color: this.colors[0]
            }
          }
          const line2 = {
            data: seriesData2,
            name: this.$t('customer.salesOpportunityWonAmount'),
            type: 'line',
            itemStyle: {
              color: this.colors[1]
            }
          }
          const seriesData = [line1, line2]

          const xData = this.salesOpportunityTrendList.map(x => x.timeAxisLabel)
          const params = {
            legendData,
            seriesData,
            xData
          }
          this.$nextTick(() => {
            this.initTrendChart(params)
          })
        } else {
          this.$refs.trendChart && this.$refs.trendChart.disposeChart()
        }
      })
    },
    // 商机趋势图表
    initTrendChart(params) {
      const { legendData, seriesData, xData } = params || {}
      const that = this
      const options = {
        title: {
          text: this.$t('customer.salesOpportunityTrend'),
          top: 10,
          left: 20
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line'
          },
          // 自定义提示框内容
          formatter: function (params) {
            const { name, data } = params[0]
            const { salesOpportunityAmount, salesOpportunityWonAmount } =
              data || {}
            // let result = `<div style="min-width: 100px">
            //   <div>${that.$t('customer.date')} : ${name}</div>
            //   <div>${that.$t('customer.salesOpportunityAmount1')} : ${that.$numberStr(salesOpportunityAmount, 2)}</div>
            //   <div>${that.$t('customer.salesOpportunityWonAmount')} : ${that.$numberStr(salesOpportunityWonAmount, 2)}</div>
            //   `
            let result = `
              <table>
              <tbody>
                <tr>
                  <td style="text-align: right">${that.$t('customer.date')} : </td>
                  <td>${name}</td>
                </tr>
                <tr>
                  <td style="text-align: right">${that.$t('customer.salesOpportunityAmount1')} : </td>
                  <td>${that.$numberStr(salesOpportunityAmount, 2)}</td>
                </tr>
                <tr>
                  <td style="text-align: right">${that.$t('customer.salesOpportunityWonAmount')} : </td>
                  <td>${that.$numberStr(salesOpportunityWonAmount, 2)}</td>
                </tr>
              </tbody>
            </table>
              `
            return result
          },
          borderColor: '#ffffff'
        },
        grid: {
          top: 110,
          bottom: 80,
          left: 120,
          right: 20
        },
        xAxis: {
          type: 'category',
          data: xData
        },
        yAxis: {
          type: 'value',
          name: that.legalEntityInfo.currencySymbol
          // axisLabel: {
          //   formatter: function (value) {
          //     return (
          //       that.$numberStr(value, 2)
          //     )
          //   }
          // }
        },
        legend: {
          left: 10,
          top: 50,
          data: legendData
        },
        series: seriesData,
        dataZoom: [
          {
            type: 'slider',
            showDetail: false, // 拖拽时候显示详细数值信息
            start: 0, // 数据窗口范围的起始百分比
            end: (7 / xData.length) * 100, // 数据窗口范围的结束百分比
            // zoomLock: true, // 是否锁定选择区域, 只能平移，不能缩放
            handleIcon: 'null',
            height: 25,
            // brushSelect: false, // 是否开启刷选功能
            bottom: 20
          }
        ]
      }
      this.$refs.trendChart.initChart(options)
    },

    // 表格数据
    initTable() {
      this.$nextTick(() => {
        this.$refs.salesOpportunityAnalysisTable &&
          this.$refs.salesOpportunityAnalysisTable.init()
        this.$refs.salesAnalysisTable && this.$refs.salesAnalysisTable.init()
        this.$refs.customerAnalysisTable &&
          this.$refs.customerAnalysisTable.init()
      })
    }
  }
}
</script>

<style scoped lang="scss">
.charts-row {
  display: flex;
  margin-bottom: 20px;
  gap: 20px;
  .chart-item {
    position: relative;
    flex: 1;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    .subtext {
      position: absolute;
      right: 20px;
      top: 10px;
      max-width: 55%;
      font-size: 14px;
      color: #333;
      z-index: 99;
    }
  }
}

// 添加新的样式
.tables-row {
  display: flex;
  justify-content: space-between;
  gap: 20px; // 设置两个盒子之间的间距

  .tables-left,
  .tables-right {
    flex: 1; // 让两个盒子平均分配空间
    min-width: 0; // 防止内容溢出
  }
  .tables-item {
    padding: 10px 20px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  .title {
    color: #464646;
    font-weight: 700;
    font-size: 18px;
  }
}

.title-top {
  color: #464646;
  font-weight: 700;
  font-size: 18px;
  padding: 10px 0 0 25px;
}
</style>
