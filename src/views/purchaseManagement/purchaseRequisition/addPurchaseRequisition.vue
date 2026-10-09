<template>
  <PurchaseRequisitionForm
    :key="pageRoute.query.timeId || 'add'"
    :pageRoute="pageRoute"
    mode="add"
  />
</template>

<script>
import PurchaseRequisitionForm from './PurchaseRequisitionForm.vue'

export default {
  name: 'AddPurchaseRequisition',
  components: { PurchaseRequisitionForm },
  props: {
    pageRoute: {
      type: Object,
      required: true
    }
  }
}
</script>
