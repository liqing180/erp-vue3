<template>
  <!-- formClass="form-page-btn--hide" -->
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        v-if="!comDisFrom"
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
            <basicForm ref="basicForm" :comDisFrom="comDisFrom" :form="form" />
          </el-collapse-item>
        </div>
        <div
          class="form-card mt10"
          v-hasPermi="['organization:role:assignRule:list']"
        >
          <el-collapse-item name="2">
            <template v-slot:title>
              <FormCollapseItemTitle :title="$t('organization.assignRule')">
              </FormCollapseItemTitle>
            </template>
            <AssignRule ref="AssignRule" :comDisFrom="comDisFrom"></AssignRule>
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="3">
            <template v-slot:title>
              <FormCollapseItemTitle :title="$t('ui.systemOperationLog')">
                <template v-if="form.operationLogForLast">
                  <span
                    v-if="form.operationLogForLast.operatorBy"
                    class="info-item mr20"
                    :title="form.operationLogForLast.operatorBy"
                  >
                    {{ $t('ui.operName') }} :
                    {{ form.operationLogForLast.operatorBy }}
                  </span>
                  <span
                    v-if="form.operationLogForLast.operatorTime"
                    class="info-item"
                  >
                    {{ $t('ui.operTime') }} :
                    {{ parseTime(form.operationLogForLast.operatorTime) }}
                  </span>
                </template>
              </FormCollapseItemTitle>
            </template>
            <div class="pb20">
              <SystemOperationLogTable
                :tableList="form.operationLogList || []"
              />
            </div>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>
  </FormPageLayout>
</template>

<script>
import basicForm from '@/views/organization/role/basicForm'
import AssignRule from '@/views/organization/role/AssignRule'

import { getRole, updateNewRole } from '@/api/organization/role'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'

export default {
  name: 'EditRole',
  dicts: ['sys_user_sex'],
  components: { basicForm, AssignRule, SystemOperationLogTable },
  data() {
    return {
      timeId: '',
      activeNames: ['1', '2', '3'],
      form: {},
      roleId: '',
      parentsId: '',
      collapseWarningForBasicInfo: false,
      isView: undefined
    }
  },
  beforeCreate() {},
  created() {
    this.timeId = this.$route.query.timeId
    this.roleId = this.$route.query.roleId
    this.isView = this.$route.query.isView === '1'
    this.init()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.roleId = this.$route.query.roleId
      this.isView = this.$route.query.isView === '1'
      this.init()
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
      return this.checkPermi(['organization:role:edit'])
    },
    comDisFrom() {
      if (this.isView) {
        return true
      }
      return !this.editAuth
    }
  },
  methods: {
    init() {
      this.collapseWarningForBasicInfo = false
      this.$refs.basicForm && this.$refs.basicForm.reset()
      this.getRole()
    },
    getRole() {
      getRole(this.roleId).then(res => {
        this.form = res.data
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
      const obj = { path: '/organization/role' }
      this.$tab.closeOpenPage(obj)
    },
    async submitForm() {
      const res = await this.$refs.basicForm.submit()
      if (res) {
        this.collapseWarningForBasicInfo = false

        for (const key in res) {
          this.form[key] = res[key]
        }
        const param = this.$trimOfObj(JSON.parse(JSON.stringify(this.form)))
        this.$refs.AssignRule.getFromData(param)
        let content = this.$t('organization.addRoleConfirm')
        if (
          param.functionalPermissionsLeftCheckedKeys &&
          param.functionalPermissionsLeftCheckedKeys.length > 0 &&
          param.assignUserLeftCheckedKeys &&
          param.assignUserLeftCheckedKeys.length > 0
        ) {
          console.log(param.functionalPermissionsLeftCheckedKeys)
          content = this.$t('organization.notAddCheckData').replace(
            '$1',
            this.$t('organization.functionalPermissions') +
              '/' +
              this.$t('organization.assignUser')
          )
        } else if (
          param.functionalPermissionsLeftCheckedKeys &&
          param.functionalPermissionsLeftCheckedKeys.length > 0
        ) {
          content = this.$t('organization.notAddCheckData').replace(
            '$1',
            this.$t('organization.functionalPermissions')
          )
        } else if (
          param.assignUserLeftCheckedKeys &&
          param.assignUserLeftCheckedKeys.length > 0
        ) {
          content = this.$t('organization.notAddCheckData').replace(
            '$1',
            this.$t('organization.assignUser')
          )
        }
        param.parentsId = this.parentsId
        this.$modal
          .confirm(content)
          .then(() => {
            return updateNewRole(param)
          })
          .then(response => {
            this.$modal.msgSuccess(
              `${this.$t('organization.savedSuccess').replace(
                '$1',
                `${param.roleName}`
              )}`
            )
            this.cancel()
          })
          .catch(() => {})
      } else {
        this.collapseWarningForBasicInfo = true
        this.$message.error(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
        )
      }
    }
  }
}
</script>
