<template>
  <div style="vertical-align: top">
    <div v-if="hasWmsPermission && wmsUrl" @click="navToWms">
      <div class="my-nav-btn">
        <el-icon><MenuIcon /></el-icon>
        {{ $t('ui.wmsWarehouse') }}
      </div>
    </div>
  </div>
</template>

<script>
import { Menu as MenuIcon } from '@element-plus/icons-vue'
import { queryDomainName, exchange } from '@/api/login'
import { getToken } from '@/utils/auth'
import { checkPermi } from '@/utils/permission'

export default {
  name: 'NavWMS',
  components: {
    MenuIcon
  },
  data() {
    return {
      wmsUrl: ''
    }
  },
  computed: {
    hasWmsPermission() {
      return checkPermi(['wms:system'])
    }
  },
  created() {
    this.queryDomainName()
  },
  methods: {
    queryDomainName() {
      queryDomainName().then(res => {
        this.wmsUrl = res.data.wmsDomain
      })
    },
    navToWms() {
      exchange({ token: getToken(), tenantType: 2 }).then(res => {
        const data = res.data || {}
        if (data.access_token) {
          const url = `${this.wmsUrl}/authLogin?erpToken=${data.access_token}`
          window.open(url, '_self')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.my-nav-btn {
  cursor: pointer;
  border: 1px solid #409eff;
  padding: 0 10px;
  border-radius: 4px;
  color: #409eff;
  font-size: 12px;
  height: 32px;
  line-height: 32px;
  margin-top: 9px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  .el-icon {
    vertical-align: -2px;
    margin-right: 2px;
  }
}
</style>
