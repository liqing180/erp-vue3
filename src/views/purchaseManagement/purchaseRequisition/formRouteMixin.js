export default {
  props: {
    pageRoute: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    formRoute() {
      return this.pageRoute || this.$route
    }
  },
  created() {
    this.$$route = this.formRoute
  }
}
