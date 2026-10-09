<template>
  <reviseFromPage
    ref="FromPage"
    :key="pageRoute.query.timeId || pageRoute.query.id"
    :page-route="pageRoute"
    :prop-row-id="String(pageRoute.query.id || '')"
    :prop-time-id="String(pageRoute.query.timeId || '')"
  />
</template>

<script>
import reviseFromPage from './reviseFromPage.vue'

export default {
  name: 'RevisePurchaseRequisition',
  components: { reviseFromPage },
  props: {
    pageRoute: {
      type: Object,
      required: true
    }
  },
  methods: {
    submitForm() {
      return this.$refs.FromPage.submitForm()
    }
  }
}
</script>
