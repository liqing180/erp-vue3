<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button type="primary" v-if="editAuth" size="small" @click="editForm"
        >{{ $t('uiBtn.edit1') }}
      </el-button>
      <el-button
        type="primary"
        @click="handleAssignTo"
        size="small"
        v-hasPermi="['customerManagement:prospectiveCustomer:transfer']"
        >{{ $t('menu.transfer') }}</el-button
      >
      <el-button type="primary" @click="cancel" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>
    <template v-slot:content>
      <div class="form-card">
        <div class="p20">
          <div class="fz-12 c-6" style="padding-top: 20px">
            {{ $t('menu.prospectiveCustomer') }}
          </div>
          <div class="mt10 flexStart" style="font-weight: 700">
            <div class="mr10 flow1" :title="form.customerName">
              {{ form.customerName }}
            </div>
            <div
              class="flexCen left-and-right fs-0"
              v-if="page1CustomerIdList.length > 1"
            >
              <el-icon
                @click="leftAndRightChange('left')"
                style="color: #666; font-size: 15px; cursor: pointer"
              >
                <ArrowLeftBold />
              </el-icon>
              <el-icon
                @click="leftAndRightChange('right')"
                style="color: #666; font-size: 15px; cursor: pointer"
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
          <el-row :gutter="20">
            <el-col :span="5">
              <div class="fz-12 c-6">
                {{ $t('customer.salesOpportunityQTY') }}
              </div>
              <div class="mt10 flow1">
                {{ form.customerSalesOpportunity.qty }}
              </div>
            </el-col>
            <el-col :span="5">
              <div class="fz-12 c-6">
                {{ $t('customer.salesOpportunityAmount') }}
              </div>
              <div class="mt10 flow1">
                {{
                  `${form.customerSalesOpportunity.currencySymbol || ''} ${$numberStr(form.customerSalesOpportunity.amount, 2)}`
                }}
              </div>
            </el-col>
            <el-col :span="5">
              <div class="fz-12 c-6 flow1">
                {{ $t('customer.timeWhenTheOpportunityWasFirstCreated') }}
              </div>
              <div class="mt10 flow1">
                {{
                  parseTime(
                    form.customerSalesOpportunity.firstCreatedTime,
                    fmtForYmdhms
                  )
                }}
              </div>
            </el-col>
            <el-col :span="5">
              <div class="fz-12 c-6 flow1">
                {{ $t('customer.opportunityLastCreatedTime') }}
              </div>
              <div class="mt10 flow1">
                {{
                  parseTime(
                    form.customerSalesOpportunity.lastCreatedTime,
                    fmtForYmdhms
                  )
                }}
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

      <div class="form-card p20 mt10" style="padding-bottom: 20px">
        <el-tabs v-model="activeName" class="demo-tabs">
          <el-tab-pane :label="$t('customer.news')" name="1">
            <news
              ref="news"
              documentType="3"
              :documentId="rowId"
              :documentNo="form.customerCode"
            />
          </el-tab-pane>
          <el-tab-pane :label="$t('customer.details')" name="2">
            <fomPageView ref="fomPageViewRef" :isView="true" />
          </el-tab-pane>
          <el-tab-pane :label="$t('customer.contactPerson')" name="3">
            <ContactPersonInfo
              ref="ContactPersonInfoRef"
              :cdsQc="form.syncCustomer"
              :comDisFrom="comDisFrom"
              :isSubmitNow="true"
              :formData="form"
            />
          </el-tab-pane>
          <el-tab-pane :label="$t('customer.salesOpportunity')" name="4">
            <SalesOpportunity
              ref="SalesOpportunity"
              :comDisFrom="comDisFrom"
              :isSubmitNow="true"
              :formData="form"
            />
          </el-tab-pane>
          <el-tab-pane :label="$t('ui.attachment')" name="5">
            <myUpload
              ref="uploadRef"
              :isDelConfirm="true"
              @onSuccess="updateSuccess"
            />
          </el-tab-pane>
          <el-tab-pane :label="$t('ui.systemOperationLog')" name="6">
            <SystemOperationLogTable :tableList="form.operationLogList || []" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>
    <!-- 指派 -->
    <assignDlg ref="assignDlg" :query="form" @onSuccess="handleUpdate" />
  </FormPageLayout>
</template>

<script>
import assignDlg from '@/views/customerManagement/prospectiveCustomer/components/assignDlg'
import fomPageView from './fomPageView'
import ContactPersonInfo from '@/views/customerManagement/prospectiveCustomer/components/ContactPersonInfo.vue'
import SalesOpportunity from '@/views/customerManagement/prospectiveCustomer/components/SalesOpportunity.vue'
import news from '@/views/customerManagement/prospectiveCustomer/components/news.vue'

import {
  queryCustomerById,
  updateFileMsg
} from '@/api/customerManagement/customer'

import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'

export default {
  name: 'ViewProspectiveCustomer',
  components: {
    SystemOperationLogTable,
    assignDlg,
    fomPageView,
    ContactPersonInfo,
    SalesOpportunity,
    news
  },
  data() {
    const vm = this

    return {
      activeName: '1',
      rowId: '',
      // 是否自动生成 EmployeeNo
      form: {},
      isView: undefined,
      lead_source: [],
      lead_status: [],
      lead_category: [],
      business_contact_person_title: [],
      page1CustomerIdList: []
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
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.isView = this.$route.query.isView === '1'
    if (this.rowId) {
      this.handleUpdate()
    }
    const idsList = JSON.parse(sessionStorage.getItem('page1CustomerIdList'))
    this.page1CustomerIdList = idsList || []
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.rowId = this.$route.query.id
      this.isView = this.$route.query.isView === '1'
      if (this.rowId) {
        this.handleUpdate()
      }

      const idsList = JSON.parse(sessionStorage.getItem('page1CustomerIdList'))
      this.page1CustomerIdList = idsList || []
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
      return this.checkPermi(['customerManagement:prospectiveCustomer:edit'])
    },
    comDisFrom() {
      if (this.isView) {
        return true
      }
      if (this.rowId) {
        return !this.editAuth
      }
      return false
    }
  },
  methods: {
    leftAndRightChange(type) {
      const idsList = this.page1CustomerIdList
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
      this.$router
        .replace({
          path: '/redirect' + '/customerManagement/viewProspectiveCustomer',
          query: {
            id,
            timeId: Date.now()
          }
        })
        .catch()
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

      updateFileMsg({ commonFileList: fileList, customerId: this.rowId }).then(
        res => {
          console.log(res, '===')
        }
      )
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

    handleUpdate() {
      this.reset()
      const customerId = this.rowId
      queryCustomerById({ customerId }).then(response => {
        const data = response.data || {}
        data.customerSalesOpportunity = data.customerSalesOpportunity || {}
        data.salesOpportunityList = data.salesOpportunityList || []
        this.form = data

        const customerContactPersonList = data.customerContactPersonList || []
        customerContactPersonList.forEach(item => {
          item.rowTimeId = item.customerContactPersonId
        })
        this.contactPersonList = customerContactPersonList
        setTimeout(() => {
          this.$refs.ContactPersonInfoRef &&
            this.$refs.ContactPersonInfoRef.initList(customerContactPersonList)
          this.$refs.news && this.$refs.news.init()
          this.$refs.uploadRef &&
            this.$refs.uploadRef.initFileList(data.commonFileList || [])
          this.$refs.fomPageViewRef &&
            this.$refs.fomPageViewRef.handleUpdate(data)
        }, 500)
      })
    },
    // 取消按钮
    cancel() {
      if (this.$route.query.backType === '2') {
        this.$tab.closePage()
        return
      }
      const obj = { path: '/customerManagement/prospectiveCustomer' }
      this.$tab.closeOpenPage(obj)
    },
    // 表单重置
    reset() {
      this.form = {
        customerName: undefined,
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
        contactEmail: undefined,
        customerSalesOpportunity: {}
      }
      this.activeName = this.$route.query.activeName || '1'
      this.resetForm('form')
    },
    editForm() {
      this.$router.push({
        path: '/customerManagement/editProspectiveCustomer',
        query: {
          id: this.rowId,
          timeId: Date.now()
        }
      })
    },
    // 指派
    handleAssignTo() {
      this.$refs.assignDlg.open([this.rowId])
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
