<template>
  <editFromPage
    ref="FromPage"
    :key="pageRoute.query.timeId || pageRoute.query.id"
    :page-route="pageRoute"
    :prop-row-id="String(pageRoute.query.id || '')"
    :prop-time-id="String(pageRoute.query.timeId || '')"
    :task-id="String(pageRoute.query.taskId || '')"
    :come-from="String(pageRoute.query.comeFrom || '1')"
    :data-type="String(pageRoute.query.dataType || '1')"
    @back="back"
  />
</template>

<script>
import editFromPage from './editFromPage.vue'

export default {
  name: 'EditPurchaseRequisition',
  components: { editFromPage },
  props: {
    pageRoute: {
      type: Object,
      required: true
    }
  },
  methods: {
    submitForm() {
      return this.$refs.FromPage.submitForm()
    },
    back() {
      this.$store.dispatch('tagsView/delView', this.pageRoute)
      if (this.pageRoute.query.backType === '2') {
        this.$router.back()
      } else {
        this.$router.push({ path: '/purchaseManagement/purchaseRequisition' })
      }
    }
  }
}
</script>
