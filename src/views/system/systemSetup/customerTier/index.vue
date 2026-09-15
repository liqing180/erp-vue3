<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        :disabled="fullscreenLoading"
        @click="submitForm"
        v-if="!comDisFrom"
        >{{ $t('uiBtn.save') }}
      </el-button>
    </template>
    <template v-slot:content>
      <div class="form-card" style="padding: 20px">
        <div class="mb20">{{ $t('menu.customerTier') }}</div>
        <div>
          <el-form>
            <div v-for="(item, index) in tableList" :key="item.rowTimeId">
              <div style="width: 280px">
                <el-form-item :error="item.errorMsg" :key="item.errorMsg">
                  <div class="flexStart w100">
                    <el-input
                      v-model="item.tierName"
                      class="flex-1"
                      maxlength="50"
                      @input="changeItemTierName(item)"
                      :disabled="comDisFrom"
                    />
                    <el-icon
                      class="pointer ml10"
                      color="#f56c6c"
                      :size="20"
                      :title="$t('uiBtn.delete')"
                      @click="handleDelRow(index)"
                      v-if="!comDisFrom"
                    >
                      <Delete />
                    </el-icon>
                  </div>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </div>
        <div style="min-height: 1px" v-if="!comDisFrom">
          <el-button
            type="info"
            plain
            @click="handleAddRow"
            v-if="tableList.length < 10"
            >{{ $t('SALES.addCustomerTier') }}</el-button
          >
        </div>
      </div>
    </template>
  </FormPageLayout>
</template>

<script>
import {
  getActiveCustomerTier,
  updateCustomerTier
} from '@/api/system/systemSetup/customerTier'

export default {
  name: 'CustomerTier',
  components: {},
  data() {
    const vm = this
    return {
      fullscreenLoading: false,
      activeNames: ['1', '2'],

      createRules: {
        activityType: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        activityName: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],
            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ]
      },
      collapseWarningForBasicInfo: false,
      tableList: []
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['systemSetup:customerTier:edit'])
    },
    comDisFrom() {
      return !this.editAuth
    }
  },
  created() {
    this.queryDataById()
  },
  activated() {
    this.queryDataById()
  },
  methods: {
    queryDataById() {
      getActiveCustomerTier().then(res => {
        const data = res.data || []
        this.tableList = data
      })
    },
    handleAddRow() {
      this.tableList.push({ rowTimeId: Date.now() })
    },
    handleDelRow(index) {
      this.$modal.confirm(this.$t('ui.delConfirm')).then(() => {
        this.tableList.splice(index, 1)
      })
    },
    changeItemTierName(item) {
      const tierName = (item.tierName || '').trim()
      if (!tierName) {
        item.errorMsg = this.$t('ui.reqMsg')
      } else {
        item.errorMsg = undefined
      }
    },

    saveBusinessGroup(param) {
      const vm = this
      vm.fullscreenLoading = true
      param.isTopDepartment = 1
      updateCustomerTier(param)
        .then(() => {
          vm.$message.success(`${vm.$t('SALES.savedSuccessfully')}`)
          this.cancel()
          vm.fullscreenLoading = false
        })
        .catch(() => {
          vm.fullscreenLoading = false
        })
    },
    reset() {},
    submitForm() {
      const vm = this
      vm.$trimOfObj(this.tableList)
      let param = JSON.parse(JSON.stringify(this.tableList))

      // const tierNameReq = param.find(item => !item.tierName)
      // if (tierNameReq) {
      //   this.$message.error(
      //     this.$t('ui.commonReqMsg').replace('$1', this.$t('menu.customerTier'))
      //   )
      //   return
      // }

      const index = param.findIndex(item => !item.tierName)
      if (index !== -1) {
        this.changeItemTierName(this.tableList[index])
        this.$message.error(
          this.$t('ui.commonReqMsg').replace('$1', this.$t('menu.customerTier'))
        )
        return
      }

      const nameData = {}
      const alreadyExists = param.find(item => {
        if (nameData[item.tierName]) {
          return true
        }
        nameData[item.tierName] = true
        return false
      })
      if (alreadyExists) {
        this.$message.error(
          this.$t('SALES.customerTierRepeated').replace(
            '$1',
            alreadyExists.tierName
          )
        )
        return
      }
      vm.saveBusinessGroup(param)
      /* this.$modal.confirm(vm.$t('SALES.activityConfirm')).then(() => {
      }) */
    },
    // 取消按钮
    cancel() {}
  }
}
</script>
