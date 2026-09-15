<template>
  <FormPageLayout :key="rowId">
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        @click="editForm"
        v-if="form.isCanSubmit === '1' && checkPermi(['salesOpportunity:edit'])"
        >{{ $t('uiBtn.edit1') }}
      </el-button>
      <el-button
        type="primary"
        @click="handleAssignTo"
        size="small"
        v-if="
          form.isCanTransfer === '1' &&
          checkPermi(['salesOpportunity:transfer'])
        "
        >{{ $t('menu.transfer') }}</el-button
      >
      <el-button
        type="primary"
        size="small"
        @click="openSalesQuotation"
        v-if="checkPermi(['salesOpportunity:salesQuotation']) && isShowSQBtn"
        >{{ $t('menu.salesQuotation') }}
      </el-button>
      <el-button
        type="primary"
        size="small"
        @click="submitConvert"
        v-if="
          form.isCanLost === '1' && checkPermi(['salesOpportunity:closeAsLost'])
        "
        >{{ $t('menu.closeAsLost') }}
      </el-button>
      <el-button type="primary" @click="cancel" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>
    <template v-slot:content>
      <div class="form-card">
        <div class="p20">
          <div class="fz-12 c-6" style="padding-top: 20px">
            {{ $t('menu.salesOpportunity') }}
          </div>
          <div class="mt10 flexStart" style="font-weight: 700">
            <div class="mr10">{{ form.salesOpportunityName }}</div>
            <div class="flexCen" v-if="pageSalesOpportunityList.length > 1">
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
            <el-col :span="3">
              <div class="fz-12 c-6">{{ $t('customer.customerName') }}</div>
              <div class="mt10 flow1" :title="form.customerName">
                <span class="primary-link" @click="nav">{{
                  form.customerName
                }}</span>
              </div>
            </el-col>
            <el-col :span="3">
              <div class="fz-12 c-6">{{ $t('customer.estAmount') }}</div>
              <div class="mt10 flow1" :title="form.estAmount">
                {{ form.currencySymbol }} {{ $numberStr(form.estAmount, 2) }}
              </div>
            </el-col>
            <el-col :span="3">
              <div class="fz-12 c-6">{{ $t('ui.status') }}</div>
              <div
                class="mt10 flow1"
                :title="form.salesOpportunityStatusShowStr"
              >
                {{ form.salesOpportunityStatusShowStr }}
              </div>
            </el-col>
            <el-col :span="3">
              <div class="fz-12 c-6">{{ $t('customer.currentProgress') }}</div>
              <div class="mt10 flow1" :title="form.currentPercentage">
                {{ form.currentPercentage }}%
              </div>
            </el-col>
            <el-col :span="4">
              <div class="fz-12 c-6">{{ $t('customer.estClosing') }}</div>
              <div class="mt10 flow1" :title="form.estClosing">
                {{ form.estClosing }}{{ form.estClosing ? '%' : '' }}
              </div>
            </el-col>
            <el-col :span="4">
              <div class="fz-12 c-6">{{ $t('customer.stageDuration') }}</div>
              <div class="mt10 flow1" :title="form.durationShowStr">
                {{ form.durationShowStr }}
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
        <stageListShow
          ref="stageListShow"
          :leadStatus="form.leadStatus"
          :query="form"
          @onSuccess="handleUpdate"
        />
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
              documentType="2"
              :documentId="rowId"
              :documentNo="form.salesOpportunityNo"
            />
          </el-tab-pane>
          <el-tab-pane :label="$t('customer.details')" name="2">
            <fomPage ref="fomPage" :query="form" :isView="true" />
          </el-tab-pane>
          <el-tab-pane :label="$t('customer.salesQuotation')" name="3">
            <SQFormPageView :formData="form.salesQuotation" />
          </el-tab-pane>
          <el-tab-pane :label="$t('customer.competitor')" name="4">
            <competitorTable
              ref="competitorTable"
              :salesOpportunityId="rowId"
            />
          </el-tab-pane>
          <el-tab-pane :label="$t('ui.systemOperationLog')" name="5">
            <SystemOperationLogTable :tableList="form.operationLogList || []" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>

    <!-- 转移 -->
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
import SQFormPageView from '@/views/salesManagement/salesQuotation/fomPageView.vue'
import {
  querySalesOpportunityById,
  updateFileMsg,
  queryOperationLogList
} from '@/api/salesOpportunity/salesOpportunity'

import pageMixin from '@/mixins/tableMinx'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
import stageListShow from './components/stageListShow.vue'
import news from './components/news.vue'
import verificationDlg from './components/verificationDlg'
import convertDlg from './components/convertDlg'
import competitorTable from './components/competitorTable'

function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  name: 'ViewSalesOpportunity',
  mixins: [pageMixin],
  components: {
    SystemOperationLogTable,
    assignDlg,
    fomPage,
    SQFormPageView,
    news,
    verificationDlg,
    stageListShow,
    convertDlg,
    competitorTable
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
      pageSalesOpportunityList: [],
      loading: false
    }
  },
  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.isView = this.$route.query.isView === '1'
    this.handleUpdate()
    const idsList = sessionStorage.getItem('pageSalesOpportunityList')
      ? JSON.parse(sessionStorage.getItem('pageSalesOpportunityList'))
      : []
    this.pageSalesOpportunityList = idsList || []
  },
  activated() {
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.isView = this.$route.query.isView === '1'
    const idsList = sessionStorage.getItem('pageSalesOpportunityList')
      ? JSON.parse(sessionStorage.getItem('pageSalesOpportunityList'))
      : []
    this.pageSalesOpportunityList = idsList || []
    this.handleUpdate()
  },
  computed: {
    isShowSQBtn() {
      return (
        (this.form.isCanCreateSalesQuotation === '1' ||
          this.form.isCanSeeSalesQuotation === '1' ||
          this.form.isCanUpdateSalesQuotation === '1') &&
        this.form.salesOpportunityStatus !== '1'
      )
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['organization:user:edit'])
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
    nav() {
      if (this.form.customerType === '1') {
        this.$router.push({
          path: '/customerManagement/viewProspectiveCustomer',
          query: {
            id: this.form.customerId,
            backType: '2',
            timeId: Date.now()
          }
        })
      } else {
        this.$router.push({
          path: '/customerManagement/viewCustomer',
          query: {
            id: this.form.customerId,
            backType: '2',
            timeId: Date.now()
          }
        })
      }
    },
    handleClick() {
      // console.log(this.activeName, '===429')
      if (this.activeName === '1') {
        this.$nextTick(() => {
          this.$refs.news && this.$refs.news.init()
        })
      } else if (this.activeName === '2') {
        // const params = JSON.parse(JSON.stringify(this.form))
        // this.$refs.fomPage && this.$refs.fomPage.init(params)
      } else if (this.activeName === '4') {
        this.$nextTick(() => {
          this.$refs.competitorTable && this.$refs.competitorTable.init()
        })
      } else if (this.activeName === '5') {
        this.$nextTick(() => {
          queryOperationLogList({ salesOpportunityId: this.rowId }).then(
            res => {
              this.form.operationLogList = res.data || []
            }
          )
        })
      }
    },
    leftAndRightChange(type) {
      const idsList = this.pageSalesOpportunityList
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

      this.$router.replace({
        path: '/redirect' + '/salesOpportunity/viewSalesOpportunity',
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

      updateFileMsg({
        commonFileList: fileList,
        salesOpportunityId: this.rowId
      }).then(res => {
        console.log(res, '===')
      })
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
      if (this.loading) return
      this.loading = true
      const salesOpportunityId = this.rowId
      querySalesOpportunityById({ salesOpportunityId })
        .then(response => {
          const data = response.data || {}
          this.form = data
          this.$nextTick(() => {
            this.$refs.stageListShow && this.$refs.stageListShow.init()
            // this.$refs.news && this.$refs.news.init()
            // this.$refs.competitorTable && this.$refs.competitorTable.init()
            this.handleClick()
          })
          this.loading = false
        })
        .catch(() => {
          this.loading = false
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

      if (this.isView) {
        this.$tab.closePage()
        return
      }

      const obj = { path: '/salesOpportunity' }
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
      this.activeNames = ['1', '2', '3', '4', '5']
      this.collapseWarningForAddressInfo = false
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForContactPersonInfo = false
      this.resetForm('form')
    },
    editForm() {
      this.$router.push({
        path: '/salesOpportunity/editSalesOpportunity',
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
    openSalesQuotation() {
      if (this.form.syncCustomer !== '1') {
        this.$message.error(this.$t('SALES.customerNoPermission'))
        return
      }
      if (this.form.isCanCreateSalesQuotation === '1') {
        this.$router.push({
          path: '/salesManagement/addSalesQuotation',
          query: {
            salesOpportunityId: this.rowId,
            timeId: Date.now()
          }
        })
      } else if (this.form.isCanUpdateSalesQuotation === '1') {
        this.$router.push({
          path: '/salesManagement/editSalesQuotation',
          query: {
            salesOpportunityId: this.rowId,
            id: this.form.salesQuotationMainId,
            timeId: Date.now()
          }
        })
      } else {
        this.$router.push({
          path: '/salesManagement/viewSalesQuotation',
          query: {
            salesOpportunityId: this.rowId,
            id: this.form.salesQuotationMainId,
            timeId: Date.now()
          }
        })
      }
    },
    // 丢失
    submitConvert() {
      this.$refs.convertDlg.open(this.rowId, this.form.salesOpportunityNo)
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
