<template>
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
            <template #title
              ><FormCollapseItemTitle
                :title="$t('ui.basicInfo')"
                :warning="collapseWarningForBasicInfo"
              >
              </FormCollapseItemTitle
            ></template>
            <basicForm ref="basicForm" :form="form" />
          </el-collapse-item>
        </div>
        <div
          class="form-card mt10"
          v-hasPermi="['organization:role:assignRule:list']"
        >
          <el-collapse-item name="2">
            <template #title
              ><FormCollapseItemTitle :title="$t('organization.assignRule')">
              </FormCollapseItemTitle
            ></template>
            <AssignRule
              ref="AssignRule"
              :key="timeId"
              :companyList="companyList"
              :form="form"
            ></AssignRule>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>
  </FormPageLayout>
</template>

<script>
import basicForm from '@/views/organization/role/basicForm'
import AssignRule from '@/views/organization/role/AssignRule'
import {
  saveRole,
  getBranchCompanyList,
  getRole
} from '@/api/organization/role'

export default {
  name: 'AddRole',
  dicts: ['sys_user_sex'],
  components: { basicForm, AssignRule },
  data() {
    return {
      timeId: '',
      activeNames: ['1', '2'],
      form: {},
      collapseWarningForBasicInfo: false,
      companyList: [],
      roleId: undefined
    }
  },
  created() {
    this.timeId = this.$route.query.timeId
    this.roleId = this.$route.query.roleId
    this.init()
    if (this.roleId) {
      this.getRole()
    }
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.roleId = this.$route.query.roleId
      this.init()
      if (this.roleId) {
        this.getRole()
      }
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
      this.form = { isActive: '1', createdBy: this.$store.state.user.nickName }
      this.collapseWarningForBasicInfo = false
      this.$refs.basicForm && this.$refs.basicForm.reset()
      this.getBranchCompanyList()
    },
    getRole() {
      getRole(this.roleId).then(res => {
        this.form = res.data
        this.form.roleName = undefined
      })
    },
    getBranchCompanyList() {
      getBranchCompanyList().then(res => {
        this.companyList = res.data || []
      })
    },
    // 取消按钮
    cancel() {
      this.$tab.closeOpenPage({ path: '/organization/role' })
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
          param.menuIdList = [
            ...param.menuIdList,
            ...param.functionalPermissionsLeftCheckedKeys
          ]
          param.menuIdList = [...new Set(param.menuIdList)]
        } else if (
          param.assignUserLeftCheckedKeys &&
          param.assignUserLeftCheckedKeys.length > 0
        ) {
          content = this.$t('organization.notAddCheckData').replace(
            '$1',
            this.$t('organization.assignUser')
          )
        }
        param.roleId = undefined
        this.$modal
          .confirm(content)
          .then(() => {
            return saveRole(param)
          })
          .then(() => {
            this.$modal.msgSuccess(
              `${this.$t('organization.savedSuccess').replace('$1', `${param.roleName}`)}`
            )
            this.cancel()
          })
          .catch(() => {})
      } else {
        this.collapseWarningForBasicInfo = true
        this.$modal.msgError(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
        )
      }
    }
  }
}
</script>
