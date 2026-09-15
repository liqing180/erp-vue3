export default {
  data() {
    return {
      $$route: undefined
    }
  },
  created() {
    this.$$route = this.$route
  },
  methods: {
    setRouteTitleView(isDisplayFrom) {
      if (!this.$$route) return

      const route = {
        ...this.$$route,
        meta: { ...(this.$$route.meta || {}) }
      }
      const title = route.meta.title
      if (typeof title !== 'string') return

      route.title = isDisplayFrom
        ? title.replace(/^edit/, 'view')
        : title.replace(/^view/, 'edit')

      this.$store.dispatch('tagsView/updateVisitedView', route)
    }
  }
}
