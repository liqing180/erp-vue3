<template>
  <PurchaseRequisitionForm
    :key="$route.query.timeId || $route.query.id"
    mode="view"
    :id="$route.query.id || ''"
  />
</template>

<script>
import PurchaseRequisitionForm from './PurchaseRequisitionForm.vue'

export default {
  name: 'ViewPurchaseRequisition',
  components: { PurchaseRequisitionForm }
}
</script>
