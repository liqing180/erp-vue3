<template>
  <div ref="chartRef" style="width: 100%; height: 400px"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let myChart = null
const initChart = () => {
  const chartDom = chartRef.value
  myChart = echarts.init(chartDom)

  const option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      // 自定义悬浮框内容
      formatter: function (params) {
        let result = `<div style="color: #333; font-size: 14px;">${params[0].name}</div>`
        for (let i = 0; i < params.length; i++) {
          const color = params[i].color
          const seriesName = params[i].seriesName
          const value = params[i].value
          result += `
            <div style="display: flex; align-items: center; margin-top: 5px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; margin-right: 5px;"></span>
              <span style="color: #666;">${seriesName}: ${value}</span>
            </div>
          `
        }
        return result
      },
      // 自定义悬浮框样式
      extraCssText:
        'width: 150px; background-color: rgba(255, 255, 255, 0.9); border: 1px solid #ccc; border-radius: 4px; padding: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);'
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line'
      }
    ]
  }

  myChart.setOption(option)
}

const handleResize = () => {
  if (myChart) {
    myChart.resize()
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) {
    myChart.dispose()
  }
})
</script>

<style scoped>
div {
  width: 100%;
  height: 400px;
}
</style>
