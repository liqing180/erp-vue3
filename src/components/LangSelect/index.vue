<template>
  <div>
    <el-dropdown
      trigger="click"
      class="international"
      @command="handleSetLanguage"
    >
      <div class="size-icon--style">
        <svg-icon
          :icon-class="language === 'zh' ? 'CN' : 'EN'"
          class-name="size-icon"
        />
      </div>
      <template v-slot:dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :disabled="language === 'zh'" command="zh">
            中文
          </el-dropdown-item>
          <el-dropdown-item :disabled="language === 'en'" command="en">
            English
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
/* import {
  changeLanguage
} from '@/api/common/common' */
import i18n from '@/lang'
export default {
  name: 'changeLanguage',
  computed: {
    language() {
      return this.$store.getters.language
    }
  },
  props: {
    loginFlag: {
      type: Boolean,
      default: false
    }
  },
  created() {
    const vm = this
    window.addEventListener('storage', vm.listenerStorage)
    /* this.$once(vm, 'hook:beforeDestroy', () => {
      window.removeEventListener('storage', vm.listenerStorage)
    }) */
  },
  methods: {
    listenerStorage(e) {
      if (e.key === 'language') {
        const newLanguage = e.newValue
        if (newLanguage && newLanguage !== this.language) {
          this.handleSetLanguage(newLanguage)
        }
      }
    },
    handleSetLanguage(lang) {
      this.$i18n.locale = lang
      this.$store.dispatch('app/setLanguage', lang)
      if (this.$store.state.settings.dynamicTitle) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'dynamicTitle',
          value: false
        })
        this.$nextTick(() => {
          this.$store.dispatch('settings/changeSetting', {
            key: 'dynamicTitle',
            value: true
          })
        })
      }
      if (this.loginFlag) {
        setTimeout('window.location.reload()', 100)
      } else {
        setTimeout('window.location.reload()', 100)
        /* changeLanguage({
          language: lang
        })
          .then(response => {
            this.$message({
              message: this.$t('ui.setLanguageSuccess'),
              type: 'success'
            })
            setTimeout('window.location.reload()', 1000)
          })
          .catch(() => {
            setTimeout('window.location.reload()', 1000)
          }) */
      }
      // this.reload()
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
