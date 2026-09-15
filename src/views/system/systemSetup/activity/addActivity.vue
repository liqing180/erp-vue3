<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        :disabled="fullscreenLoading"
        @click="submitForm"
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
      </el-collapse>
    </template>
  </FormPageLayout>
</template>

<script>
import { saveActivity } from '@/api/system/systemSetup/activity'

export default {
  name: 'AddActivity',
  data() {
    const vm = this
    return {
      fullscreenLoading: false,
      activeNames: ['1', '2'],
      createForm: {
        activityType: '',
        activityName: '',
        description: '',
        isActive: '1',
        createdBy: this.$store.state.user.nickName
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
    comDisFrom() {
      return false
    }
  },
  created() {
    const vm = this
    vm.createForm.creatorName = this.$store.state.user.nickName
    const query = vm.$route.query
    this.timeId = this.$route.query.timeId
    vm.createForm = Object.assign(vm.createForm, query)
    const { activity_type } = this.useDict('activity_type')
    this.activity_type = activity_type || []
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.reset()
      const query = this.$route.query
      this.createForm = Object.assign(this.createForm, query)
    }
  },
  methods: {
    saveBusinessGroup(param) {
      const vm = this
      vm.fullscreenLoading = true
      saveActivity(param)
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
        isActive: '1',
        createdBy: this.$store.state.user.nickName
      }
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForTeamMembers = false
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
      const obj = { path: '/system/systemSetup/activity' }
      this.$tab.closeOpenPage(obj)
    }
  }
}
</script>
