<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        :disabled="fullscreenLoading"
        @click="submitForm"
        v-if="!comDisFrom"
        >{{ $t('uiBtn.submit') }}
      </el-button>
      <el-button type="primary" @click="cancel" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>
    <template v-slot:content>
      <el-collapse v-model="activeNames">
        <div class="form-card">
          <el-collapse-item name="1">
            <template v-slot:title>
              <FormCollapseItemTitle
                :title="$t('ui.basicInfo')"
                :warning="collapseWarningForBasicInfo"
              >
              </FormCollapseItemTitle>
            </template>
            <el-form
              ref="createForm"
              :model="createForm"
              :rules="createRules"
              label-width="195px"
              :disabled="comDisFrom"
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('SALES.activityType')}`"
                    prop="activityType"
                  >
                    <el-select
                      v-model="createForm.activityType"
                      placeholder=" "
                      clearable
                      style="width: 200px"
                      :disabled="true"
                    >
                      <el-option
                        v-for="dict in activity_type"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('SALES.activityName')}`"
                    prop="activityName"
                  >
                    <el-input
                      v-model="createForm.activityName"
                      class="form-wd"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item :label="`${$t('SALES.activityCode')}`">
                    <el-input
                      v-model="createForm.activityNo"
                      class="form-wd"
                      disabled
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item
                    :label="`${$t('ui.description')}`"
                    prop="description"
                  >
                    <el-input
                      type="textarea"
                      v-model="createForm.description"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                      resize="none"
                      show-word-limit
                      :maxlength="3000"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.isActive')}`" prop="isActive">
                    <el-switch
                      v-model="createForm.isActive"
                      active-value="1"
                      inactive-value="0"
                    ></el-switch>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="2">
            <template v-slot:title>
              <FormCollapseItemTitle :title="$t('ui.systemOperationLog')">
                <template v-if="createForm.operationLogForLast">
                  <span
                    v-if="createForm.operationLogForLast.operatorBy"
                    class="info-item mr20"
                    :title="createForm.operationLogForLast.operatorBy"
                  >
                    {{ $t('ui.operName') }} :
                    {{ createForm.operationLogForLast.operatorBy }}
                  </span>
                  <span
                    v-if="createForm.operationLogForLast.operatorTime"
                    class="info-item"
                  >
                    {{ $t('ui.operTime') }} :
                    {{ parseTime(createForm.operationLogForLast.operatorTime) }}
                  </span>
                </template>
              </FormCollapseItemTitle>
            </template>
            <div class="pb20">
              <SystemOperationLogTable
                :tableList="createForm.operationLogList || []"
              />
            </div>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>
  </FormPageLayout>
</template>

<script>
import {
  queryActivityById,
  updateActivity
} from '@/api/system/systemSetup/activity'

import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'

import pageMixin from '@/mixins/tableMinx'
export default {
  mixins: [pageMixin],
  name: 'AddSalesGroup',
  components: {
    SystemOperationLogTable
  },
  data() {
    const vm = this
    return {
      fullscreenLoading: false,
      activeNames: ['1', '2'],
      createForm: {
        activityType: '',
        activityName: '',
        description: '',
        isActive: '0'
      },
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
      timeId: '',
      collapseWarningForBasicInfo: false,
      activity_type: []
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
      return this.checkPermi(['systemSetup:salesGroup:edit'])
    },
    comDisFrom() {
      return !this.editAuth
    }
  },
  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.queryDataById()
    const { activity_type } = this.useDict('activity_type')
    this.activity_type = activity_type || []
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.rowId = this.$route.query.id
      this.reset()
      this.queryDataById()
    }
  },
  methods: {
    queryDataById() {
      queryActivityById(this.rowId).then(res => {
        const data = res.data || {}
        this.createForm = data
      })
    },

    saveBusinessGroup(param) {
      const vm = this
      vm.fullscreenLoading = true
      param.isTopDepartment = 1
      updateActivity(param)
        .then(() => {
          vm.$message.success(
            `${vm
              .$t('SALES.activitySuccess')
              .replace('$1', `${param.activityName}`)}`
          )
          this.cancel()
          vm.fullscreenLoading = false
        })
        .catch(() => {
          vm.fullscreenLoading = false
        })
    },
    reset() {
      this.activeNames = ['1', '2']
      this.createForm = {
        activityType: '',
        activityName: '',
        description: '',
        isActive: '0'
      }
      this.collapseWarningForBasicInfo = false
      this.resetForm('createForm')
    },
    submitForm() {
      const vm = this
      this.$refs.createForm.validate(valid => {
        this.collapseWarningForBasicInfo = !valid
        if (!valid) {
          this.$message.error(
            this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
          )
          return
        }
        let param = JSON.parse(JSON.stringify(vm.createForm))
        param = vm.$trimOfObj(param)
        this.$modal.confirm(vm.$t('SALES.activityConfirm')).then(() => {
          vm.saveBusinessGroup(param)
        })
      })
    },

    // 取消按钮
    cancel() {
      if (this.isView) {
        this.$tab.closePage()
        return
      }
      if (this.$route.query.backType === '2') {
        this.$tab.closePage()
        return
      }
      const obj = { path: '/system/systemSetup/activity' }
      this.$tab.closeOpenPage(obj)
    }
  }
}
</script>
