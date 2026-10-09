<template>
  <PurchaseRequisitionForm
    :key="pageRoute.query.timeId || pageRoute.query.id"
    :page-route="pageRoute"
    mode="revise"
    :id="pageRoute.query.id || ''"
  />
</template>

<script>
import PurchaseRequisitionForm from './PurchaseRequisitionForm.vue'

export default {
  name: 'RevisePurchaseRequisition',
  components: { PurchaseRequisitionForm },
  props: {
    pageRoute: {
      type: Object,
      required: true
    }
  }
}
</script>
