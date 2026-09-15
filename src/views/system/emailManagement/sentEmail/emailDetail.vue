<template>
  <!-- formClass="form-page-btn--hide" -->
  <FormPageLayout>
    <template v-slot:btn>
      <el-button type="primary" @click="cancel" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>
    <template v-slot:content>
      <el-collapse v-model="activeNames">
        <div class="form-card">
          <el-collapse-item name="1">
            <template v-slot:title>
              <i class="el-icon-caret-right mr5" style="font-size: 20px"></i>
              <strong>{{ $t('ui.basicInfo') }}</strong>
            </template>
            <el-form ref="createForm" :model="createForm" label-width="195px">
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="`${$t('system.to')}`" prop="toUser">
                    <el-input
                      :value="createForm.toUser"
                      disabled
                      resize="none"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item :label="`${$t('system.cc')}`" prop="ccUser">
                    <el-input
                      :value="createForm.ccUser"
                      disabled
                      class="form-wd"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="`${$t('system.bcc')}`" prop="bccUser">
                    <el-input
                      :value="createForm.bccUser"
                      disabled
                      class="form-wd"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item
                    :label="`${$t('system.subject')}`"
                    prop="templateSubject"
                  >
                    <el-input
                      :value="createForm.templateSubject"
                      :maxlength="100"
                      disabled
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item
                    :label="`${$t('system.content')}`"
                    prop="content"
                  >
                    <quillEditor
                      ref="quillEditor"
                      :readOnly="true"
                      :initContent="initContent"
                      @editorChange="editorChange"
                    />
                    <!-- readOnly -->
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item
                    :label="`${$t('system.sendMode')}`"
                    prop="sentMode"
                  >
                    <el-input
                      :value="
                        selectDictLabel(email_send_status, createForm.sentMode)
                      "
                      :maxlength="200"
                      class="form-wd"
                      disabled
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    :label="`${$t('system.sendStatus')}`"
                    prop="sentStatus"
                  >
                    <el-input
                      :value="
                        selectDictLabel(email_send_mode, createForm.sentStatus)
                      "
                      :maxlength="200"
                      class="form-wd"
                      disabled
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item
                    :label="`${$t('system.sendBy')}`"
                    prop="sendUserName"
                  >
                    <el-input
                      :value="createForm.sendUserName || nickName"
                      disabled
                      class="form-wd"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    :label="`${$t('system.dateSend')}`"
                    prop="sendTime"
                  >
                    <el-date-picker
                      v-model="createForm.sendTime"
                      :editable="false"
                      disabled
                      type="date"
                      :format="fmtForYmdhms"
                      class="form-wd"
                      placeholder
                      style="width: 100%"
                    ></el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </div>
        <div
          class="form-card mt10"
          v-if="
            createForm &&
            createForm.commonFileList &&
            createForm.commonFileList.length > 0
          "
        >
          <el-collapse-item name="2">
            <template v-slot:title>
              <i class="el-icon-caret-right mr5" style="font-size: 20px"></i>
              <strong>{{ $t('ui.attachment') }}</strong>
            </template>
            <el-row>
              <el-col :span="24">
                <div class="mb20">
                  <myUpload ref="uploadRef" :disabled="true" />
                </div>
              </el-col>
            </el-row>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>
  </FormPageLayout>
</template>

<script>
import { mapState } from 'vuex'
import { saveRole } from '@/api/organization/role'
import { getSentEmailHistoryById } from '@/api/system/emailManagement'
import quillEditor from '@/views/system/emailManagement/quillEditor/index'

function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  name: 'AddUser',
  components: { quillEditor },
  data() {
    const vm = this
    const validWebsite = (rule, value, callback) => {
      if (value && !isWebsite(value)) {
        callback(new Error(vm.$t('organization.validWebsite')))
      } else {
        callback()
      }
    }
    return {
      timeId: '',
      id: '',
      activeNames: ['1', '2'],
      createForm: {},
      createRules: {
        legalEntityName: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],
            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ],

        phoneNo1: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],

        companyRegNo: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],
            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ],

        website: [
          {
            validator: validWebsite,
            trigger: ['blur', 'change']
          }
        ],

        email: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          },
          {
            type: 'email',
            validator: this.isEmail,
            trigger: ['blur', 'change']
          }
        ],

        currency: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ]
      },
      initContent: '',
      config: {
        width: '100%', // px
        height: 140, // px
        contentReadOnly: true,
        isShowToolBar: false,
        disabled: true,
        buttonsOption: [
          {
            componentName: 'BtnServTpl',
            isShow: true
          }
        ]
      },
      email_send_status: [],
      email_send_mode: []
    }
  },
  beforeCreate() {},
  created() {
    this.timeId = this.$route.query.timeId
    this.id = this.$route.query.id

    const { email_send_status, email_send_mode } = this.useDict(
      'email_send_status',
      'email_send_mode'
    )
    this.email_send_status = email_send_status || []
    this.email_send_mode = email_send_mode || []
    this.getSentEmailHistoryById()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.getSentEmailHistoryById()
    }
  },
  computed: {
    ...mapState({
      nickName: state => state.user.nickName
    }),
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  methods: {
    editorChange(e) {
      this.createForm.content = e
    },
    getSentEmailHistoryById() {
      const vm = this
      getSentEmailHistoryById(this.id).then(res => {
        const results = res.data
        const { templateContent } = results
        vm.createForm = results
        vm.createForm.content = templateContent
        vm.initContent = templateContent
        this.$refs.quillEditor.initContent(templateContent)
        setTimeout(() => {
          vm.$refs.uploadRef &&
            vm.$refs.uploadRef.initFileList(results.commonFileList)
        }, 100)
      })
    },
    // 取消按钮
    cancel() {
      const obj = { path: '/system/emailManagement/sentEmail' }
      this.$tab.closeOpenPage(obj)
    },
    async submitForm() {
      const res = await this.$refs.basicForm.submit()
      if (res) {
        for (const key in res) {
          this.form[key] = res[key]
        }
        const param = this.$trimOfObj(JSON.parse(JSON.stringify(this.form)))
        this.$modal
          .confirm(this.$t('ui.addUserConfirm'))
          .then(() => {
            return saveRole(param)
          })
          .then(response => {
            this.$modal.msgSuccess(
              `${this.$t('organization.savedSuccess').replace(
                '$1',
                `[${param.roleName}]`
              )}`
            )
            this.cancel()
          })
          .catch(() => {})
      }
    }
  }
}
</script>
