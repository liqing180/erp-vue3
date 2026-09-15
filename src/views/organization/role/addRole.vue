<template>
  <!-- formClass="form-page-btn--hide" -->
  <FormPageLayout>
    <template v-slot:btn>
      <el-button type="primary" size="small" @click="submitForm"
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
            <basicForm ref="basicForm" />
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
            <AssignRule ref="AssignRule"></AssignRule>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>
  </FormPageLayout>
</template>

<script>
import basicForm from '@/views/organization/role/basicForm'
import AssignRule from '@/views/organization/role/AssignRule'
import { saveRole } from '@/api/organization/role'

export default {
  name: 'AddRole',
  dicts: ['sys_user_sex'],
  components: {
    basicForm,
    AssignRule
  },
  data() {
    return {
      timeId: '',
      activeNames: ['1', '2'],
      form: {},
      collapseWarningForBasicInfo: false
    }
  },
  beforeCreate() {},
  created() {
    this.timeId = this.$route.query.timeId
    this.init()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.init()
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  methods: {
    init() {
      this.collapseWarningForBasicInfo = false
      this.$refs.basicForm && this.$refs.basicForm.reset()
    },
    // 取消按钮
    cancel() {
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
        this.$modal
          .confirm(content)
          .then(() => {
            return saveRole(param)
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
