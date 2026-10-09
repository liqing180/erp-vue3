<template>
  <addFromPage
    ref="FromPage"
    :key="pageRoute.query.timeId || 'add'"
    :pageRoute="pageRoute"
    :prop-time-id="String(pageRoute.query.timeId || '')"
  />
</template>

<script>
import addFromPage from './addFromPage.vue'

export default {
  name: 'AddPurchaseRequisition',
  components: { addFromPage },
  props: {
    pageRoute: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleSave() {
      return this.$refs.FromPage.handleSaveDraft()
    }
  }
}
</script>
