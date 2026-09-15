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
                    :label="$t('organization.parentStructure')"
                    prop="superiorId"
                  >
                    <el-cascader
                      v-model="createForm.superiorId"
                      :options="departmentList"
                      :props="props"
                      collapse-tags
                      clearable
                      :show-all-levels="false"
                      style="width: 100%"
                      placeholder=" "
                      popper-class="hide-cascader-scrollbar"
                    ></el-cascader>
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.departmentName')}`"
                    prop="departmentName"
                  >
                    <el-input
                      v-model="createForm.departmentName"
                      class="form-wd"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.pic')}`"
                    prop="picUserName"
                  >
                    <SelectInput
                      :value="createForm.picUserName"
                      :title="createForm.picUserName"
                      @clear="picUserNameClear"
                      clearable
                      @click="openPicTable"
                      class="form-wd"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="`${$t('ui.remarks')}`" prop="remarks">
                    <el-input
                      type="textarea"
                      v-model="createForm.remarks"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                      resize="none"
                      show-word-limit
                      :maxlength="3000"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="2">
            <template v-slot:title>
              <FormCollapseItemTitle
                :title="$t('menu.accessPermissions')"
                :warning="collapseWarningForAccessPermissions"
              >
              </FormCollapseItemTitle>
            </template>
            <div>
              <el-form
                ref="accessPermissionsForm"
                :model="createForm"
                :rules="createRules"
                label-width="195px"
              >
                <el-row class="mt22">
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('ui.position')}`"
                      prop="postIdList"
                    >
                      <el-select
                        v-model="createForm.postIdList"
                        :multiple="true"
                        :collapse-tags="true"
                        clearable
                        placeholder=""
                        style="width: 100%"
                        class="log-msg-ellipsis"
                      >
                        <el-option
                          v-for="dict in positionOptions"
                          :key="dict.postId"
                          :label="dict.postName"
                          :value="dict.postId"
                        ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>
    <selectPicTable ref="selectPicTable" @updatePic="updatePic" />
  </FormPageLayout>
</template>

<script>
import { queryAllSysPost } from '@/api/organization/corporate'
import {
  saveDepartment,
  queryNowLegalEntityCascade
} from '@/api/organization/department'

import selectPicTable from '@/views/organization/corporate/selectPicTable.vue'

export default {
  name: 'AddDepartment',
  components: {
    selectPicTable
  },
  data() {
    const vm = this
    return {
      fullscreenLoading: false,
      propVal: 'currencyCode',
      activeNames: ['1', '2'],
      createForm: {
        departmentName: '',
        legalEntity: '',
        picUserName: '',
        remarks: '',
        createdBy: this.$store.state.user.nickName,
        postIdList: []
      },
      createRules: {
        superiorId: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        departmentName: [
          {
            required: true,
            message: vm
              .$t('ui.reqMsg')
              .replace('$1', vm.$t('organization.departmentName')),
            trigger: ['blur', 'change'],

            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ],
        postIdList: [
          {
            type: 'array',
            required: false,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],

            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ]
      },
      positionOptions: [],
      timeId: '',
      collapseWarningForBasicInfo: false,
      collapseWarningForAccessPermissions: false,
      props: {
        multiple: false,
        value: 'id',
        label: 'name',
        children: 'child',
        emitPath: false,
        checkStrictly: true
      },
      departmentList: []
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
  created() {
    const vm = this
    vm.createForm.creatorName = this.$store.state.user.nickName
    const query = vm.$route.query
    this.timeId = this.$route.query.timeId
    vm.createForm = Object.assign(vm.createForm, query)
    this.queryAllSysPost()
    this.queryNowLegalEntityCascade()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.reset()
      const query = this.$route.query
      this.createForm = Object.assign(this.createForm, query)
      this.queryAllSysPost()
      this.queryNowLegalEntityCascade()
    }
  },
  methods: {
    // 查询职位
    queryAllSysPost() {
      queryAllSysPost().then(res => {
        this.positionOptions = res.data || []
      })
    },
    // 查可以选择的上一级
    queryNowLegalEntityCascade() {
      queryNowLegalEntityCascade({}).then(res => {
        const fromData = res.data || []
        this.departmentList = JSON.parse(JSON.stringify(fromData))
      })
    },
    // 清空pic
    picUserNameClear() {
      this.createForm['picUserName'] = undefined
      this.createForm['picUserId'] = undefined
      this.createForm['mobilePhone'] = undefined
      this.createForm['mobileCode'] = undefined
      this.createForm['mobileNum'] = undefined
      this.createForm['email'] = undefined
    },
    // 打开pic弹窗
    openPicTable() {
      this.$refs.selectPicTable.handleOpen()
    },
    updatePic(row) {
      const { nickName, userId, mobilePhone, mobileCode, mobileNum, email } =
        row
      this.createForm['picUserName'] = nickName
      this.createForm['picUserId'] = userId
      this.createForm['mobilePhone'] = mobilePhone
      this.createForm['mobileCode'] = mobileCode
      this.createForm['mobileNum'] = mobileNum
      this.createForm['email'] = email
    },

    saveBusinessGroup(param) {
      const vm = this
      vm.fullscreenLoading = true
      param.isTopDepartment = 1
      saveDepartment(param)
        .then(() => {
          vm.$message.success(
            `${vm
              .$t('organization.submitDepartmentSuccess')
              .replace('$1', `${param.departmentName}`)}`
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
        departmentName: '',
        branchCompany: '',
        legalEntity: '',
        picUserName: '',
        picUserId: '',
        mobilePhone: '',
        mobileCode: '',
        mobileNum: '',
        email: '',
        remarks: '',
        createdBy: this.$store.state.user.nickName,
        postIdList: []
      }
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForAccessPermissions = false
      this.resetForm('createForm')
      this.resetForm('accessPermissionsForm')
    },
    submitForm() {
      const vm = this
      this.$refs.createForm.validate(valid => {
        this.collapseWarningForBasicInfo = !valid
        if (valid) {
          this.$refs.accessPermissionsForm.validate(valid1 => {
            this.collapseWarningForAccessPermissions = !valid1
            if (valid1) {
              this.$modal
                .confirm(vm.$t('organization.submitDepartment'))
                .then(() => {
                  let param = JSON.parse(JSON.stringify(vm.createForm))
                  param = vm.$trimOfObj(param)
                  vm.saveBusinessGroup(param)
                })
            } else {
              this.$message.error(
                this.$t('ui.fromIncomplete').replace(
                  '$1',
                  this.$t('menu.accessPermissions')
                )
              )
            }
          })
        } else {
          this.$message.error(
            this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
          )
        }
      })
    },
    // 取消按钮
    cancel() {
      const obj = { path: '/organization/departmentManagement' }
      this.$tab.closeOpenPage(obj)
    }
  },
  emits: ['update:value']
}
</script>
