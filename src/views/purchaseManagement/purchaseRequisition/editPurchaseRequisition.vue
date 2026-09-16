<template>
  <PurchaseRequisitionForm
    :key="$route.query.timeId || $route.query.id"
    mode="edit"
    :id="$route.query.id || ''"
  />
</template>

<script>
import PurchaseRequisitionForm from './PurchaseRequisitionForm.vue'

export default {
  name: 'EditPurchaseRequisition',
  components: { PurchaseRequisitionForm }
}
</script>
