<template>
  <addFromPage :propTimeId="timeId" :propRowId="rowId" />
</template>

<script>
import addFromPage from './addFromPage'

export default {
  name: 'AddProductInfo',
  components: {
    addFromPage
  },
  data() {
    return {
      timeId: undefined,
      rowId: undefined
    }
  },
  created() {
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
  },
  activated() {
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
  },
  methods: {}
}
</script>
<style lang="scss"></style>
