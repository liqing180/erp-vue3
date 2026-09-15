size="small"
<template>
  <!-- formClass="form-page-btn--hide" -->
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
            <template #title>
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
              label-width="120px"
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('ETM.templateFor')}`"
                    prop="templateFor"
                  >
                    <el-select
                      v-model="createForm.templateFor"
                      :title="createForm.templateForShow"
                      filterable
                      placeholder
                      class="form-wd"
                      @change="handleTemplateFor"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in templateForList"
                        :key="item.dicName"
                        :label="item.dicDesc"
                        :value="item.dicName"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('ETM.templateNo')}`"
                    prop="templateNo"
                  >
                    <el-input
                      v-model="createForm.templateNo"
                      maxlength="400"
                      disabled
                      class="form-wd"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('ETM.subject')}`"
                    prop="templateSubject"
                  >
                    <el-input
                      v-model="createForm.templateSubject"
                      :title="createForm.templateSubject"
                      style="width: 100%"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item
                    :label="`${$t('ETM.isDefault')}`"
                    prop="isDefault"
                  >
                    <el-switch
                      v-model="createForm.isDefault"
                      :active-value="1"
                      :inactive-value="0"
                      @change="handleIsDefault"
                    ></el-switch>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item
                    :label="`${$t('ETM.content')}`"
                    prop="templateContent"
                  >
                    <quillEditor
                      ref="quillEditor"
                      :initContent="initContent"
                      :templateFor="createForm.templateFor"
                      @editorChange="editorChange"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="`${$t('ETM.remarks')}`" prop="remarks">
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
      </el-collapse>
    </template>
  </FormPageLayout>
</template>

<script>
import {
  queryUserCanCreateTemplateFor,
  saveSysEmailTemplate,
  checkTemplateForIsHaveDefault,
  getDefaultSysEmailTemplateVoByTemplateFor
} from '@/api/system/emailManagement'
import quillEditor from '@/views/system/emailManagement/quillEditor/index'
export default {
  name: 'AddEmailTemplate',
  components: { quillEditor },
  data() {
    const vm = this
    const htmlChartGtTenThousand = (rule, value, callback) => {
      if (typeof value === 'undefined' || value === '') {
        callback()
      } else if (value.length > 10000) {
        const obj = document.createElement('div')
        obj.innerHTML = value
        const curVal = obj.childNodes
        let strLen = 0
        Array.from([])
          .slice.apply(curVal, [0])
          .map(item => {
            if (item.nodeType === 3) {
              strLen += item.toString().trim().length
            } else {
              strLen += item.innerText.trim().length
            }
          })
        if (strLen <= 0) {
          // required.
          callback(new Error(vm.$t('ETM.contentReq')))
        } else {
          callback(new Error(vm.$t('ETM.htmlChartGtTenThousand')))
        }
      } else {
        callback()
      }
    }
    return {
      fullscreenLoading: false,
      activeNames: ['1', '2'],
      initContent: '',
      config: {
        width: 800, // px
        height: 140, // px
        contentReadOnly: false,
        isShowToolBar: true,
        disabled: false,
        buttonsOption: [
          {
            componentName: 'BtnServTpl',
            isShow: true
          }
        ]
      },
      createVisible: false,
      createForm: {
        isDefault: 1,
        createdBy: this.$store.state.user.nickName,
        templateSubject: undefined,
        templateContent: undefined
      },
      createRules: {
        templateFor: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g), // 不能全部是空格
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        templateSubject: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g), // 不能全部是空格
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        templateContent: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g), // 不能全部是空格
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          },
          {
            validator: htmlChartGtTenThousand,
            trigger: ['change', 'blur']
          }
        ]
      },
      templateForList: [],
      collapseWarningForBasicInfo: false
    }
  },
  computed: {
    cpuTemplateFor() {
      return this.createForm.templateFor
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  beforeCreate() {},
  created() {
    const vm = this
    vm.queryUserCanCreateTemplateFor()
  },
  methods: {
    editorChange(e) {
      this.createForm.templateContent = e
      if (e) {
        this.$refs.createForm.validateField('templateContent')
      }
    },
    queryUserCanCreateTemplateFor() {
      const vm = this
      queryUserCanCreateTemplateFor().then(res => {
        vm.templateForList = res.data || []
      })
    },
    getDefaultSysEmailTemplateVoByTemplateFor(templateFor) {
      const vm = this
      getDefaultSysEmailTemplateVoByTemplateFor(templateFor).then(res => {
        const { templateSubject, templateContent } = res.data
        vm.createForm.templateSubject = templateSubject
        vm.createForm.templateContent = templateContent
        // vm.initContent = templateContent
        this.$refs.quillEditor.initContent(templateContent)
      })
    },
    handleTemplateFor(key) {
      const vm = this
      const curItem = vm.templateForList.find(item => {
        return item.dicName === key
      })
      if (curItem) {
        vm.createForm.templateForShow = curItem.dicDesc
      }
      vm.getDefaultSysEmailTemplateVoByTemplateFor(key)
    },
    handleIsDefault(value) {
      if (value === 1) {
        this.createForm['active'] = 1
      } else {
        this.createForm['active'] = 0
      }
    },
    async submitForm() {
      const vm = this
      vm.$refs.createForm.validate(async valid => {
        this.collapseWarningForBasicInfo = !valid
        if (valid) {
          console.log(this.createForm)
          let confirmMsg = vm.$t('ETM.submitConfirm')
          if (vm.createForm.isDefault) {
            const { data } = await checkTemplateForIsHaveDefault(
              vm.createForm.templateFor
            )
            if (data && data.msg) {
              confirmMsg = vm.$t('ETM.replaceDefaultConfirm')
              confirmMsg = confirmMsg.replace('$1', data.msg)
              confirmMsg = confirmMsg.replace(
                '$2',
                vm.createForm.templateForShow
              )
            }
          }
          this.$modal.confirm(confirmMsg).then(() => {
            vm.saveSysEmailTemplate(vm.createForm)
          })
        } else {
          this.$message.error(
            this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
          )
        }
      })
    },
    saveSysEmailTemplate(param) {
      const vm = this
      vm.fullscreenLoading = true
      saveSysEmailTemplate(param)
        .then(res => {
          const msg = res.msg
          vm.$message.success(
            `${vm.$t('ETM.submitSuccess').replace('$1', `${msg}`)}`
          )
          vm.cancel()
          vm.fullscreenLoading = false
        })
        .catch(err => {
          vm.fullscreenLoading = false
          window.console.error(err)
        })
    },
    cancel() {
      const obj = { path: '/system/emailManagement/emailTemplate' }
      this.$tab.closeOpenPage(obj)
    }
  }
}
</script>
