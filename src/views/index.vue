<template>
  <div class="home-page">
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from '@/views/reportManagement/dashboard/index.vue'

export default {
  name: 'Index',
  components: {
    Dashboard
  }
}
</script>

<style scoped lang="scss">
.home-page {
  height: 100%;
}
</style>
