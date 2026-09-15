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
        <div class="mb20">{{ $t('SALES.customerLabel') }}</div>
        <div>
          <el-form>
            <div v-for="(item, index) in tableList" :key="item.rowTimeId">
              <div style="width: 420px">
                <el-form-item :error="item.errorMsg">
                  <div class="flexStart w100">
                    <el-input
                      v-model="item.labelName"
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
                  <div class="w100"></div>
                  <div class="flexStart mt10">
                    <div
                      class="color-warp"
                      v-for="color in colorList"
                      :key="color"
                      :class="{ selected: item.labelColor === color }"
                      @click="item.labelColor = color"
                    >
                      <div
                        class="color-item"
                        :style="`background-color: #${color}`"
                      ></div>
                    </div>
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
            v-if="tableList.length < 22"
            >{{ $t('SALES.addLabel') }}</el-button
          >
        </div>
      </div>
    </template>
  </FormPageLayout>
</template>

<script>
import {
  getActiveCustomerLabel,
  updateCustomerLabel
} from '@/api/system/systemSetup/customerTier'

export default {
  name: 'CustomerLabel',
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
      tableList: [],
      colorList: [
        'FF9C9C',
        'F7C698',
        'FDE388',
        'BBD7F8',
        'D9A8CC',
        'F8D6C8',
        '89E1DB',
        '97A6F9',
        'FF9ECC',
        'B7EDBE',
        'E6DBFC'
      ]
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
      getActiveCustomerLabel().then(res => {
        const data = res.data || []
        this.tableList = data
      })
    },
    handleAddRow() {
      const curIndex = this.tableList.length
      const color = this.colorList[curIndex % 11]

      this.tableList.push({ rowTimeId: Date.now(), labelColor: color })
    },
    handleDelRow(index) {
      this.$modal.confirm(this.$t('ui.delConfirm')).then(() => {
        this.tableList.splice(index, 1)
      })
    },
    changeItemTierName(item) {
      const labelName = (item.labelName || '').trim()
      if (!labelName) {
        item.errorMsg = this.$t('ui.reqMsg')
      } else {
        item.errorMsg = undefined
      }
    },

    saveBusinessGroup(param) {
      const vm = this
      vm.fullscreenLoading = true
      param.isTopDepartment = 1
      updateCustomerLabel(param)
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

      const labelNameReq = param.find(item => !item.labelName)
      if (labelNameReq) {
        this.$message.error(
          this.$t('ui.commonReqMsg').replace(
            '$1',
            this.$t('SALES.customerLabel')
          )
        )
        return
      }
      const nameData = {}
      const alreadyExists = param.find(item => {
        if (nameData[item.labelName]) {
          return true
        }
        nameData[item.labelName] = true
        return false
      })
      if (alreadyExists) {
        this.$message.error(
          this.$t('SALES.customerLabelRepeated').replace(
            '$1',
            alreadyExists.labelName
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
<style lang="scss" scoped>
.color-warp {
  margin-right: 6px;
  width: 30px;
  height: 24px;
  cursor: pointer;
  padding: 1px;
  position: relative;
  border-width: 0px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0);
}
.color-item {
  position: absolute;
  left: 1px;
  top: 1px;
  width: 28px;
  height: 22px;
}
.selected.color-warp {
  // border-color: #1890ff;
  box-shadow: 0 0 0 2px #1890ff;
}
</style>
