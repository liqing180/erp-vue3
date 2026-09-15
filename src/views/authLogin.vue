<template>
  <div v-loading.fullscreen.lock="fullscreenLoading"></div>
</template>

<script>
import { setToken } from '@/utils/auth'

export default {
  name: 'AuthLogin',
  data() {
    return {
      fullscreenLoading: false
    }
  },
  created() {
    const { wmsToken } = this.$route.query
    if (!wmsToken) return

    this.fullscreenLoading = true
    setToken(wmsToken)
    this.$store.commit('SET_TOKEN', wmsToken)

    setTimeout(() => {
      this.$router.push({ path: '/' }).catch(() => {})
      this.fullscreenLoading = false
    }, 100)
  }
}
</script>
