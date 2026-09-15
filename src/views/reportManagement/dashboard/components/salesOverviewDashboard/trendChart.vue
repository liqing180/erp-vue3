<template>
  <div ref="chartRef" style="width: 100%; height: 400px" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
const chartRef = ref(null)
let myChart = null

const initChart = options => {
  if (!myChart) {
    const chartDom = chartRef.value
    myChart = echarts.init(chartDom)
  }
  myChart.setOption(options)
}
const disposeChart = () => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
}

const handleResize = () => {
  if (myChart) {
    myChart.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (myChart) {
    myChart.dispose()
  }
})

defineExpose({
  initChart,
  disposeChart,
  handleResize
})
</script>

<style scoped>
div {
  width: 100%;
  height: 400px;
}
</style>
