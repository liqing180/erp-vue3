<template>
  <div style="width: 100%; height: 100%">
    <div
      v-if="divResize"
      v-resize="resizeChart"
      style="width: 100%; height: 100%"
    >
      <div ref="echart" style="height: 100%"></div>
    </div>
    <div v-else ref="echart" style="height: 100%"></div>
  </div>
</template>

<script>
import { markRaw } from 'vue'
import * as echarts from 'echarts'
import resize from '@/directive/resize'

export default {
  name: 'Echart',
  directives: {
    resize
  },
  props: {
    chartData: {
      type: Object,
      default: () => ({})
    },
    windowResize: {
      type: Boolean,
      default: false
    },
    // 弹窗、侧栏等容器的大小变化不一定触发 window resize。
    divResize: {
      type: Boolean,
      default: false
    }
  },
  emits: ['clickBar', 'clickGrid', 'dataZoom'],
  data() {
    return {
      echart: null
    }
  },
  watch: {
    chartData() {
      this.initChart()
    }
  },
  mounted() {
    this.initChart()
    if (this.windowResize) {
      window.addEventListener('resize', this.resizeChart)
    }
  },
  activated() {
    this.$nextTick(this.resizeChart)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeChart)
    this.echart?.dispose()
    this.echart = null
  },
  methods: {
    initChart() {
      if (!this.$refs.echart) return
      if (!this.echart) {
        // ECharts 实例不参与 Vue3 深层响应式转换。
        this.echart = markRaw(echarts.init(this.$refs.echart))
        this.echart.on('click', params => this.$emit('clickBar', params))
        this.echart.on('dataZoom', params => this.$emit('dataZoom', params))
        this.echart.getZr().on('click', this.handleGridClick)
      }
      // 不合并上次配置，避免刷新或切换年份后残留 series / dataZoom。
      this.echart.setOption(this.chartData, true)
    },
    handleGridClick(params) {
      const chart = this.echart
      // 饼图和空配置没有坐标轴，不执行趋势图的下钻逻辑。
      if (!chart || !chart.getOption().xAxis?.length) return
      const pointInPixel = [params.offsetX, params.offsetY]
      if (!chart.containPixel({ gridIndex: 0 }, pointInPixel)) return
      const xIndex = chart.convertFromPixel({ xAxisIndex: 0 }, pointInPixel[0])
      if (!Number.isInteger(xIndex)) return
      this.$emit('clickGrid', params, xIndex)
    },
    resizeChart() {
      if (!this.echart || this.echart.isDisposed()) return
      this.echart.resize()
    }
  }
}
</script>
