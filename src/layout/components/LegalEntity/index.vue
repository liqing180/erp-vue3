<template>
  <el-select
    placeholder=" "
    size="default"
    :model-value="legalEntityId"
    :title="comTitle"
    style="width: 180px"
    @change="change"
    :disabled="loading || isDis"
  >
    <el-option
      v-for="dict in legalEntityList"
      :key="dict.id"
      :label="dict.legalEntityName"
      :value="dict.id"
    ></el-option>
  </el-select>
</template>

<script>
import {
  queryUserOfLegalEntityList,
  refreshLegalEntity
} from '@/api/system/user'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      legalEntityId: '',
      legalEntityList: [],
      loading: false
    }
  },
  computed: {
    ...mapGetters(['topbarRouters', 'legalEntityKey']),
    isDis() {
      const route = this.$route
      let isDis = true
      const { name } = route
      if (route.path === '/index') {
        return false
      }
      this.topbarRouters.forEach(item1 => {
        if (item1.children && item1.children.length > 0) {
          item1.children.forEach(item2 => {
            if (item2.name === name) {
              isDis = false
            }
            if (item2.children && item2.children.length > 0) {
              item2.children.forEach(item3 => {
                if (item3.name === name) {
                  isDis = false
                }
              })
            }
          })
        }
      })
      return isDis
    },
    comTitle() {
      const cur = this.legalEntityList.find(
        item => this.legalEntityId && item.id === this.legalEntityId
      )
      if (cur) {
        return cur.legalEntityName
      } else {
        return ''
      }
    }
  },
  watch: {
    legalEntityKey: function (newVal) {
      console.log('2')
      this.queryUserOfLegalEntityList('reload')
    }
  },
  created() {
    this.queryUserOfLegalEntityList()
  },
  methods: {
    queryUserOfLegalEntityList(type) {
      queryUserOfLegalEntityList().then(res => {
        this.legalEntityList = res.data || []
        let row = this.legalEntityList.find(item => item.isDefault) || {}
        if (JSON.stringify(row) === '{}') {
          row = this.legalEntityList[0]
          if (type === 'reload') {
            this.refreshLegalEntity(row.id, true)
          }
          return
        }
        const legalEntityAddress = row.legalEntityAddress || {}
        this.legalEntityId = row.id
        this.$store.commit('SET_LEGAL_ENTITY', {
          legalEntityId: row.id,
          legalEntityName: row.legalEntityName,
          currency: row.currency,
          currencyId: row.currencyId,
          currencyCode: row.currencyCode,
          country: legalEntityAddress.country,
          countryId: legalEntityAddress.countryId,
          currencySymbol: row.currencySymbol,
          localization: row.localization,
          isSystemDocking: row.isSystemDocking
        })
      })
    },
    refreshLegalEntity(legalEntityId, refreshPage = false) {
      const params = {
        legalEntityId
      }
      this.loading = true
      refreshLegalEntity(params)
        .then(res => {
          this.legalEntityId = legalEntityId
          let row =
            this.legalEntityList.find(item => item.id === legalEntityId) || {}
          if (JSON.stringify(row) === '{}') {
            row = this.legalEntityList[0]
          }
          const legalEntityAddress = row.legalEntityAddress || {}
          this.$store.commit('SET_LEGAL_ENTITY', {
            legalEntityId: row.id,
            legalEntityName: row.legalEntityName,
            currency: row.currency,
            currencyId: row.currencyId,
            currencyCode: row.currencyCode,
            country: legalEntityAddress.country,
            countryId: legalEntityAddress.countryId,
            currencySymbol: row.currencySymbol,
            localization: row.localization,
            isSystemDocking: row.isSystemDocking
          })
          this.loading = false
          if (refreshPage) {
            this.$router.replace({ path: '/index' }).catch(() => {})
            setTimeout(() => {
              location.reload()
            }, 100)
          } else {
            // location.reload()
          }
        })
        .catch(() => {
          this.loading = false
        })
    },

    change(value) {
      this.refreshLegalEntity(value, true)
    }
  }
}
</script>
