<template>
  <PurchaseRequisitionForm :key="$route.query.timeId || 'add'" mode="add" />
</template>

<script>
import PurchaseRequisitionForm from './PurchaseRequisitionForm.vue'

export default {
  name: 'AddPurchaseRequisition',
  components: { PurchaseRequisitionForm }
}
</script>
