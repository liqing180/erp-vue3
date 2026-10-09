<template>
  <reviseFromPage
    :key="pageRoute.query.timeId || pageRoute.query.id"
    :page-route="pageRoute"
    :prop-row-id="String(pageRoute.query.id || '')"
    :prop-time-id="String(pageRoute.query.timeId || '')"
    :is-view="true"
  />
</template>

<script>
import reviseFromPage from './reviseFromPage.vue'

export default {
  name: 'ViewPurchaseRequisition',
  components: { reviseFromPage },
  props: {
    pageRoute: {
      type: Object,
      required: true
    }
  }
}
</script>
