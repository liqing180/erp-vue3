<template>
  <FormPageLayout :key="rowId">
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        @click="editForm"
        v-if="form.isCanUpdate === '1' && checkPermi(['leads:edit'])"
        >{{ $t('uiBtn.edit1') }}
      </el-button>
      <el-button
        type="primary"
        @click="handleAssignTo"
        size="small"
        v-if="form.isCanAssignTo === '1' && checkPermi(['leads:assignTo'])"
        >{{ $t('menu.assignTo1') }}</el-button
      >
      <el-button
        type="primary"
        size="small"
        @click="submitVerification"
        v-if="
          form.isCanVerification === '1' && checkPermi(['leads:verification'])
        "
        >{{ $t('customer.verification') }}
      </el-button>
      <el-button
        type="primary"
        size="small"
        @click="submitConvert"
        v-if="form.isCanConvert === '1' && checkPermi(['leads:convert'])"
        >{{ $t('customer.convert') }}
      </el-button>
      <el-button type="primary" @click="cancel" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>
    <template v-slot:content>
      <div class="form-card">
        <div class="p20">
          <div class="fz-12 c-6" style="padding-top: 20px">
            {{ $t('menu.leads') }}
          </div>
          <div class="mt10 flexStart" style="font-weight: 700">
            <div class="mr10 flow1" :title="form.leadName">
              {{ form.leadName }}
            </div>
            <div
              class="flexCen left-and-right fs-0"
              v-if="pageLeadsIdList.length > 1"
            >
              <el-icon
                style="color: #666; font-size: 15px; cursor: pointer"
                @click="leftAndRightChange('left')"
              >
                <ArrowLeftBold />
              </el-icon>
              <el-icon
                style="color: #666; font-size: 15px; cursor: pointer"
                @click="leftAndRightChange('right')"
              >
                <ArrowRightBold />
              </el-icon>
            </div>
          </div>
          <div class="mt10">
            <el-tag
              type="info"
              class="mr10"
              size="default"
              v-for="(item, index) in form.labelList"
              :key="index"
              :color="'#' + item.labelColor"
              ><span
                :style="`color: ${getContrastColor('#' + item.labelColor)}`"
                >{{ item.labelName }}</span
              ></el-tag
            >
          </div>
        </div>
        <el-divider />
        <div class="p20" style="padding-bottom: 20px">
          <el-row>
            <el-col :span="4">
              <div class="fz-12 c-6">{{ $t('customer.companyName') }}</div>
              <div class="mt10 flow1" :title="form.companyName">
                {{ form.companyName }}
              </div>
            </el-col>
            <el-col :span="4">
              <div class="fz-12 c-6">{{ $t('customer.leadSource') }}</div>
              <div class="mt10 flow1" :title="form.leadSourceShowStr">
                {{ form.leadSourceShowStr }}
              </div>
            </el-col>
            <el-col :span="4">
              <div class="fz-12 c-6">{{ $t('customer.phone') }}</div>
              <div class="mt10 flow1" :title="form.mobilePhone">
                {{ form.mobilePhone }}
              </div>
            </el-col>
            <el-col :span="4">
              <div class="fz-12 c-6">{{ $t('ui.email') }}</div>
              <div class="mt10 flow1" :title="form.email">{{ form.email }}</div>
            </el-col>
            <el-col :span="4">
              <div class="fz-12 c-6">{{ $t('customer.leadCategory') }}</div>
              <div class="mt10 flow1" :title="form.leadCategoryShowStr">
                {{ form.leadCategoryShowStr }}
              </div>
            </el-col>
            <el-col :span="4">
              <div class="fz-12 c-6">{{ $t('customer.salesGroup') }}</div>
              <div
                class="mt10 flow1"
                :title="form.salesGroupName + ' / ' + form.salesGroupUserName"
              >
                {{ form.salesGroupName }} / {{ form.salesGroupUserName }}
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="form-card mt10" style="padding: 10px 20px">
        <stageListShow :leadStatus="form.leadStatus" />

        <div
          class="mt10"
          v-if="
            leadQualificationCriteria.leadQualificationCriteriaList &&
            leadQualificationCriteria.leadQualificationCriteriaList.length > 0
          "
          style="font-size: 14px"
        >
          <div style="font-weight: 700">
            {{ $t('SALES.validationCriteria') }}
          </div>
          <div class="mt10 flexStart" style="flex-wrap: wrap">
            <div
              class="mr20"
              v-for="(
                item, index
              ) in leadQualificationCriteria.leadQualificationCriteriaList"
              :key="index"
            >
              <div class="flex">
                <div style="flex-shrink: 0; word-break: break-all">
                  {{ item.criteria }} ：
                </div>
                <el-checkbox
                  :model-value="item.validationStrValue === '1'"
                  disabled
                  v-if="item.categoryType === 'checkBox'"
                >
                </el-checkbox>
                <div
                  style="word-break: break-all"
                  v-else-if="item.categoryType === 'textField'"
                >
                  {{ item.validationStrValue }}
                </div>
                <div
                  style="word-break: break-all"
                  v-else-if="item.categoryType === 'numberBox'"
                >
                  {{ item.validationIntValue }}
                </div>
                <div
                  style="word-break: break-all"
                  v-else-if="
                    item.categoryType === 'singleOption' ||
                    item.categoryType === 'multiOption'
                  "
                >
                  {{
                    item.optionList
                      .filter(x => x.isSelect === '1')
                      .map(k => k.optionName)
                      .join('，')
                  }}
                </div>
                <div
                  style="word-break: break-all"
                  v-else-if="item.categoryType === 'dateSelection'"
                >
                  {{ parseTime(item.validationIntValue, fmtForYmd) }}
                </div>
              </div>
            </div>
          </div>
          <div class="mt10 flex">
            <div
              class="mr20"
              style="flex-shrink: 0"
              v-if="!!leadQualificationCriteria.nextContactTimeDate"
            >
              {{ $t('customer.nextContactTime') }} ：{{
                parseTime(
                  leadQualificationCriteria.nextContactTimeDate,
                  fmtForYmd
                )
              }}
            </div>
            <div
              style="flex-wrap: wrap"
              v-if="!!leadQualificationCriteria.remarks"
            >
              {{ $t('ui.remarks') }} ：
              {{ leadQualificationCriteria.remarks }}
            </div>
          </div>
          <div
            class="mt10 w100"
            v-if="
              leadQualificationCriteria.commonFileList &&
              leadQualificationCriteria.commonFileList.length > 0
            "
          >
            <myUploadNews ref="myUploadNews" :disabled="true" :isView="true" />
          </div>
        </div>
      </div>

      <div class="form-card p20 mt10" style="padding-bottom: 20px">
        <el-tabs
          v-model="activeName"
          class="demo-tabs"
          @tab-click="handleClick"
        >
          <el-tab-pane :label="$t('customer.news')" name="1">
            <news
              ref="news"
              documentType="1"
              :documentId="rowId"
              :documentNo="form.leadCode"
            />
          </el-tab-pane>
          <el-tab-pane :label="$t('customer.details')" name="2">
            <fomPage :isView="true" />
          </el-tab-pane>
          <el-tab-pane :label="$t('ui.attachment')" name="3">
            <myUpload
              ref="uploadRef"
              :isDelConfirm="true"
              @onSuccess="updateSuccess"
            />
          </el-tab-pane>
          <el-tab-pane :label="$t('ui.systemOperationLog')" name="4">
            <SystemOperationLogTable :tableList="form.operationLogList || []" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>

    <!-- 指派 -->
    <assignDlg ref="assignDlg" :query="form" @onSuccess="handleUpdate" />
    <!-- 验证 -->
    <verificationDlg ref="verificationDlg" @onSuccess="handleUpdate" />
    <!-- 转化 -->
    <convertDlg ref="convertDlg" :params="form" @onSuccess="handleUpdate" />
  </FormPageLayout>
</template>

<script>
import assignDlg from './components/assignDlg'
import fomPage from './fomPageView'
import myUploadNews from '@/components/Common/htz-image-upload/my-upload-news.vue'

import {
  saveLead,
  queryLeadById,
  updateLead,
  queryPositionList,
  updateFileMsg,
  queryOperationLogList
} from '@/api/leads/leads'

import pageMixin from '@/mixins/tableMinx'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
import stageListShow from './components/stageListShow.vue'
import news from './components/news.vue'
import verificationDlg from './components/verificationDlg'
import convertDlg from './components/convertDlg'

function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  name: 'ViewLeads',
  mixins: [pageMixin],
  components: {
    SystemOperationLogTable,
    assignDlg,
    fomPage,
    news,
    verificationDlg,
    stageListShow,
    convertDlg,
    myUploadNews
  },
  data() {
    const vm = this
    const validatorPhoneNo = (rule, value, callback) => {
      if (!this.form.mobileCode || !this.form.mobileNum) {
        callback(this.$t('ui.reqMsg').replace('$1', this.$t('ui.mobilePhone')))
      } else {
        callback()
      }
    }
    const validWebsite = (rule, value, callback) => {
      if (value && !isWebsite(value)) {
        callback(new Error(vm.$t('ui.validWebsite')))
      } else {
        callback()
      }
    }
    return {
      saveKey: '1',
      activeName: '1',
      savePath: 'FomPage',
      rowId: '',
      activeNames: [],
      // 默认密码
      initPassword: undefined,
      // 是否自动生成 EmployeeNo
      isAutoCreateEmployeeNo: '1',
      form: {
        isAutoCreateEmployeeNo: '1'
      },
      validityDaysPickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },
      rules: {
        leadName: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        // mobilePhone: [
        //   { required: false, validator: validatorPhoneNo, trigger: 'change' }
        // ],
        email: [
          {
            required: false,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.email')),
            trigger: ['blur', 'change']
          },
          {
            type: 'email',
            validator: this.isEmail,
            trigger: ['blur', 'change']
          }
        ],
        contactEmail: [
          {
            required: false,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.email')),
            trigger: ['blur', 'change']
          },
          {
            type: 'email',
            validator: this.isEmail,
            trigger: ['blur', 'change']
          }
        ],
        website: [
          {
            validator: validWebsite,
            trigger: ['blur', 'change']
          }
        ]
      },

      /* 表格部分 */
      columns: [
        {
          prop: 'legalEntityName',
          label: vm.$t('ui.legalEntity'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'departmentName',
          label: vm.$t('ui.deptName'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'postId',
          label: vm.$t('ui.position'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'isDefault',
          label: vm.$t('system.isDefaultDepartment'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'remarks',
          label: vm.$t('ui.remarks'),
          visible: true,
          minWidth: 200,
          tooltip: true
        }
      ],
      tableList: [],
      selected: [],
      sortableDom: undefined,
      rowIdKey: 'departmentId',
      positionOptions: [],
      selectLoading: false,
      collapseWarningForAddressInfo: false,
      collapseWarningForBasicInfo: false,
      collapseWarningForContactPersonInfo: false,
      roleList: [],
      isView: undefined,
      lead_source: [],
      lead_status: [],
      lead_category: [],
      business_contact_person_title: [],
      pageLeadsIdList: [],
      leadQualificationCriteria: {}
    }
  },
  created() {
    const {
      lead_source,
      lead_status,
      lead_category,
      business_contact_person_title
    } = this.useDict(
      'lead_source',
      'lead_status',
      'lead_category',
      'business_contact_person_title'
    )
    this.lead_source = lead_source || []
    this.lead_status = lead_status || []
    this.lead_category = lead_category || []
    this.business_contact_person_title = business_contact_person_title || []
    // this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.isView = this.$route.query.isView === '1'
    if (this.rowId) {
      this.handleUpdate()
    } else {
      this.handleAdd()
    }
    const idsList = JSON.parse(sessionStorage.getItem('pageLeadsIdList'))
    this.pageLeadsIdList = idsList || []
  },
  activated() {
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.isView = this.$route.query.isView === '1'
    const idsList = JSON.parse(sessionStorage.getItem('pageLeadsIdList'))
    this.pageLeadsIdList = idsList || []
    this.handleUpdate()
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['leads:edit'])
    },
    comDisFrom() {
      if (this.isView) {
        return true
      }
      if (this.rowId) {
        // return !!this.form.leadName
        return !this.editAuth
      }
      return false
    }
  },
  methods: {
    handleClick() {
      if (this.activeName === '4') {
        queryOperationLogList({ leadId: this.rowId }).then(res => {
          this.form.operationLogList = res.data || []
        })
      }
    },
    leftAndRightChange(type) {
      const idsList = this.pageLeadsIdList
      let index = idsList.findIndex(x => x === this.rowId)
      let id = undefined
      if (index === -1) {
        id = idsList[0]
      } else if (type === 'left') {
        index--
        if (index < 0) {
          id = idsList[idsList.length - 1]
        } else {
          id = idsList[index]
        }
      } else {
        index++
        if (index > idsList.length - 1) {
          id = idsList[0]
        } else {
          id = idsList[index]
        }
      }

      this.$router.push({
        path: '/redirect' + '/leads/viewLeads',
        query: {
          id,
          timeId: Date.now()
        }
      })
    },
    // 根据背景色返回合适的反差字体颜色（黑色或白色）
    getContrastColor(hexcolor) {
      // 验证输入的十六进制颜色值
      if (!hexcolor || !/^#[0-9A-Fa-f]{6}$/.test(hexcolor)) {
        return '#333' // 返回默认颜色
      }

      let r = parseInt(hexcolor.substring(1, 3), 16)
      let g = parseInt(hexcolor.substring(3, 5), 16)
      let b = parseInt(hexcolor.substring(5, 7), 16)

      // 将RGB值标准化到0-1范围，然后计算亮度
      let luminance =
        0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255)

      // 根据亮度值返回对比色
      return luminance > 0.5 ? '#333' : '#fff'
    },
    updateSuccess() {
      const fileList = this.$refs.uploadRef.getFileList()
      const uploading = fileList.find(item => item.uploading)
      if (uploading) return

      updateFileMsg({ commonFileList: fileList, leadId: this.rowId }).then(
        res => {
          console.log(res, '===')
        }
      )
    },
    queryPositionList() {
      queryPositionList().then(res => {
        const list = res.data || []
        this.positionList = list.map(position => {
          return { value: position }
        })
      })
    },
    queryPositionSugg(queryString, cb) {
      const vm = this
      const positionList = vm.positionList

      let results
      if (queryString) {
        results = positionList.filter(
          umo =>
            umo.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      } else {
        results = positionList
      }
      cb(results)
    },
    // 标签
    labelChange(ids, labels) {
      this.form['labelIdList'] = ids
      this.form['labelIds'] = (ids || []).join(',')
      this.form['labelNames'] = labels
    },
    // 客户级别
    customerTierChange(ids, labels) {
      this.form['tierIdList'] = ids
      this.form['tierIds'] = (ids || []).join(',')
      this.form['tierNames'] = labels
    },

    // 下次联系时间
    nextContactTimeDateChange() {
      const current = this.appointTime(Date.now(), '00:00:00')
      const { nextContactTimeDate } = this.form
      if (nextContactTimeDate) {
        const nextContactTimeDays =
          (nextContactTimeDate - current) / 24 / 3600 / 1000
        this.form.nextContactTimeDays = nextContactTimeDays
      } else {
        this.form.nextContactTimeDays = undefined
      }
    },
    // 下次联系时间
    inputNumberChange(code) {
      const { nextContactTimeDays } = this.form
      const current = this.appointTime(Date.now(), '00:00:00')
      if (nextContactTimeDays) {
        this.form.nextContactTimeDate =
          current + nextContactTimeDays * 24 * 3600 * 1000
      } else {
        this.form.nextContactTimeDate = undefined
      }
      this.$refs.form.validateField(code)
    },
    handleAdd() {
      this.reset()
    },
    handleUpdate() {
      this.reset()
      const leadId = this.rowId
      queryLeadById({ leadId }).then(response => {
        const data = response.data || {}
        this.form = data
        const {
          address,
          addressMap,
          city,
          country,
          cityTown,
          latLng,
          postalCode,
          province,
          validAddress,
          countryId,
          commonFileList,
          leadQualificationCriteria
        } = data
        this.leadQualificationCriteria = leadQualificationCriteria || {}
        const params = {
          address,
          addressMap,
          city,
          country,
          cityTown,
          latLng,
          postalCode,
          province,
          validAddress,
          countryId
        }
        this.$nextTick(() => {
          this.$refs.AddressInfo && this.$refs.AddressInfo.init(params)
          this.$refs.news && this.$refs.news.init()
          this.$refs.uploadRef &&
            this.$refs.uploadRef.initFileList(commonFileList || [])
          if (this.$refs.myUploadNews) {
            this.$refs.myUploadNews.initFileList(
              leadQualificationCriteria.commonFileList || []
            )
          }
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

      const obj = { path: '/leads' }
      this.$tab.closeOpenPage(obj)
    },
    // 表单重置
    reset() {
      this.form = {
        leadName: undefined,
        mobileCode: undefined,
        mobileNum: undefined,
        mobilePhone: undefined,
        email: undefined,
        remarks: undefined,
        labelIdList: [],
        labelIds: undefined,
        labelNames: undefined,
        contactPersonName: undefined,
        contactTitle: undefined,
        contactPosition: undefined,
        contactMobileCode: undefined,
        contactMobileNum: undefined,
        contactMobilePhone: undefined,
        contactEmail: undefined
      }
      this.activeNames = ['1', '2', '3', '4']
      this.collapseWarningForAddressInfo = false
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForContactPersonInfo = false
      this.leadQualificationCriteria = {}
      this.resetForm('form')
    },
    editForm() {
      this.$router.push({
        path: '/leads/editLeads',
        query: {
          id: this.rowId,
          backType: '2',
          timeId: Date.now()
        }
      })
    },
    // 指派
    handleAssignTo() {
      this.$refs.assignDlg.open([this.rowId])
    },
    // 验证
    submitVerification() {
      this.$refs.verificationDlg.open(this.rowId)
    },
    // 转化
    submitConvert() {
      const {
        leadSource,
        mobilePhone,
        email,
        companyName,
        businessRegNo,
        country,
        address,
        contactPersonName,
        contactTitle,
        contactMobilePhone,
        contactEmail
      } = this.form
      if (!leadSource) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace(
            '$1',
            this.$t('customer.leadSource')
          )
        )
        return
      } else if (!mobilePhone) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.mobilePhone'))
        )
        return
      } else if (!email) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.email'))
        )
        return
      } else if (!companyName) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace(
            '$1',
            this.$t('login.companyName')
          )
        )
        return
      } else if (!businessRegNo) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.companyRegNo'))
        )
        return
      } else if (!country) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.country'))
        )
        return
      } else if (!address) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.address'))
        )
        return
      } else if (!contactPersonName) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace(
            '$1',
            this.$t('customer.contactPersonName1')
          )
        )
        return
      } else if (!contactTitle) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.title'))
        )
        return
      } else if (!contactMobilePhone) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace(
            '$1',
            this.$t('customer.contactPersonMobilePhone')
          )
        )
        return
      } else if (!contactEmail) {
        this.$message.error(
          this.$t('ui.fromIncomplete').replace(
            '$1',
            this.$t('customer.contactPersonEmail')
          )
        )
        return
      }
      this.$refs.convertDlg.open(this.rowId)
    },
    submitForm: function () {
      this.$refs.form.validate(valid => {
        this.collapseWarningForBasicInfo = !valid
        if (valid) {
          let param = this.$trimOfObj(JSON.parse(JSON.stringify(this.form)))
          const AddressInfo = this.$refs.AddressInfo.termForm || {}
          const params = { ...param, ...AddressInfo }
          this.$modal
            .confirm(this.$t('customer.leadConfirm'))
            .then(() => {
              if (params.leadId) {
                return updateLead(params)
              }
              return saveLead(params)
            })
            .then(response => {
              this.$modal.msgSuccess(
                this.$t('customer.leadSuccess').replace('$1', params.leadName)
              )
              this.cancel()
            })
            .catch(() => {})
        } else {
          this.$message.error(
            this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
          )
        }
      })
    }
  }
}
</script>

<style lang="scss">
.p20 {
  padding: 0 20px;
}
.c-6 {
  color: #666;
}
.fz-12 {
  font-size: 12px;
}
</style>
