<template>
  <div>
    <el-dropdown trigger="click" @command="handleSetSize">
      <div class="size-icon--style">
        <svg-icon class-name="size-icon" icon-class="size" />
      </div>
      <template v-slot:dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item of sizeOptions"
            :key="item.value"
            :disabled="size === item.value"
            :command="item.value"
          >
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { addClass, removeClass } from '@/utils'
export default {
  data() {
    return {
      sizeOptions: [
        { label: this.$t('ui.small'), value: 'small' },
        { label: this.$t('ui.medium'), value: 'default' },
        { label: this.$t('ui.large'), value: 'large' }
      ]
    }
  },
  computed: {
    size() {
      return this.$store.getters.size
    }
  },
  created() {
    addClass(document.body, `app-size--${this.size}`)
  },
  methods: {
    handleSetSize(size) {
      removeClass(document.body, `app-size--${this.size}`)
      addClass(document.body, `app-size--${size}`)

      this.$store.dispatch('app/setSize', size)
      this.refreshView()
      this.$message({
        message: this.$t('ui.layoutSizeSuccess'),
        type: 'success'
      })
    },
    refreshView() {
      setTimeout('window.location.reload()', 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.size-icon--style {
  font-size: 18px;
  line-height: 50px;
  // padding-right: 7px;
}
</style>
