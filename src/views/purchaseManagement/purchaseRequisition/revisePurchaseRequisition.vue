<template>
  <PurchaseRequisitionForm
    :key="$route.query.timeId || $route.query.id"
    mode="revise"
    :id="$route.query.id || ''"
  />
</template>

<script>
import PurchaseRequisitionForm from './PurchaseRequisitionForm.vue'

export default {
  name: 'RevisePurchaseRequisition',
  components: { PurchaseRequisitionForm }
}
</script>
