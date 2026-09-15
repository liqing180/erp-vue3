<template>
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
          ref="form"
          :model="form"
          :rules="rules"
          :disabled="true"
          label-width="210px"
        >
          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.leadName')}`"
                prop="leadName"
              >
                <SelectInput
                  clearable
                  :value="
                    form.leadName ? form.leadName + ' - ' + form.leadCode : ''
                  "
                  :title="
                    form.leadName ? form.leadName + ' - ' + form.leadCode : ''
                  "
                  @click="leadNameOpen"
                  @clear="leadNameClear"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.customerName')}`"
                prop="customerName"
              >
                <SelectInput
                  clearable
                  :value="form.customerName"
                  :title="form.customerName"
                  @click="customerNameOpen"
                  @clear="customerNameClear"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.salesOpportunityNo1')}`"
                prop="salesOpportunityNo"
              >
                <el-input
                  v-model="form.salesOpportunityNo"
                  :title="form.salesOpportunityNo"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.salesOpportunityName')}`"
                prop="salesOpportunityName"
              >
                <el-input
                  v-model="form.salesOpportunityName"
                  :title="form.salesOpportunityName"
                  maxlength="50"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('ui.country')" prop="country">
                <el-input
                  v-model="form.country"
                  :title="form.country"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('ui.status')" prop="status">
                <el-input
                  v-model="form.salesOpportunityStatusShowStr"
                  :title="form.salesOpportunityStatusShowStr"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.estClosing')}`"
                prop="estClosing"
              >
                <el-input-number
                  v-model="form.estClosing"
                  :precision="0"
                  v-thousandSplit="{ precision: 0 }"
                  type="number"
                  class="form-wd textleft"
                  :min="1"
                  :max="100"
                  placeholder=""
                  @change="inputNumberChange('estClosing')"
                  style="width: 100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.estAmount')}`"
                prop="estAmount"
              >
                <el-input-number
                  v-model="form.estAmount"
                  :precision="2"
                  v-thousandSplit="{ precision: 0 }"
                  type="number"
                  class="form-wd textleft"
                  :min="0"
                  :max="999999999999.99"
                  title=" "
                  @change="inputNumberChange('estAmount')"
                  style="width: 100%"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="$t('ui.currency')" prop="currency">
                <el-select
                  v-model="form.currency"
                  :title="form.currency"
                  placeholder=""
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="dict in currencyList"
                    :key="dict.id"
                    :label="dict.currency"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="$t('customer.contactPersonName')"
                prop="contactPersonName"
              >
                <el-input
                  v-model="form.contactPersonName"
                  :title="form.contactPersonName"
                  disabled
                />
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item
                :label="$t('customer.contactPersonEmail')"
                prop="contactEmail"
              >
                <el-input
                  v-model="form.contactEmail"
                  :title="form.contactEmail"
                  disabled
                />
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.contactPersonMobilePhone1')}`"
                prop="contactMobilePhone"
                ref="contactMobilePhone"
              >
                <MobilePhoneInput
                  v-model:mobileCode="form.contactMobileCode"
                  v-model:mobileNum="form.contactMobileNum"
                  v-model:mobileNo="form.contactMobilePhone"
                  disabled
                  @clearValidate="$refs.contactMobilePhone.clearValidate()"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.salesGroup')}`"
                prop="salesGroupName"
              >
                <SelectInput
                  clearable
                  :value="form.salesGroupName"
                  :title="form.salesGroupName"
                  @click="openSalesGroupTable"
                  @clear="salesGroupClear"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.salesPerson')}`"
                prop="salesGroupUserId"
              >
                <el-input
                  v-model="form.salesGroupUserName"
                  :title="form.salesGroupUserName"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.validity')}`"
                prop="validityDays"
              >
                <div class="flex flow1">
                  <el-input-number
                    v-model="form.validityDays"
                    :precision="0"
                    v-thousandSplit="{ precision: 0 }"
                    type="number"
                    class="form-wd textleft"
                    :min="1"
                    :max="999"
                    @change="inputNumberChange('validityDays')"
                    style="width: 150px"
                    controls-position="right"
                  />
                  <div style="margin: 0 10px">{{ $t('customer.day') }}</div>
                  <el-date-picker
                    v-model="form.validityDate"
                    :editable="false"
                    type="date"
                    :format="fmtForYmd"
                    value-format="x"
                    class="form-wd"
                    placeholder
                    style="width: 100%"
                    :disabled-date="validityDaysPickerOptions.disabledDate"
                    @change="nextContactTimeDateChange"
                  ></el-date-picker>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item :label="`${$t('ui.address')}`" prop="address1">
                <SelectInput
                  clearable
                  :value="form.address1"
                  :title="form.address1"
                  @click="addressOpen"
                  @clear="addressClear"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item :label="$t('ui.remarks')">
                <el-input
                  type="textarea"
                  v-model="form.remarks"
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

<script>
import {
  saveSalesOpportunity,
  querySalesOpportunityById,
  submitSalesOpportunity
} from '@/api/salesOpportunity/salesOpportunity'
import { queryCurrencyListBySelect } from '@/api/basic/basic'

import {
  getAllCustomerLabel,
  getAllCustomerTier
} from '@/api/system/systemSetup/customerTier'
import pageMixin from '@/mixins/tableMinx'

function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  name: 'FomPageView',
  mixins: [pageMixin],
  props: {
    query: {
      type: Object
    }
  },
  components: {},
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
      savePath: 'FomPage',
      rowId: '',
      form: {},
      validityDaysPickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },
      rules: {
        salesOpportunityName: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        customerName: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        currency: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        salesGroupName: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        customerContactPersonId: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        contactMobilePhone: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        validityDays: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        salesGroupUserId: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        address: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
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
            required: true,
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
      collapseWarningForBasicInfo: false,
      isView: undefined,
      sales_opportunity_status: [],
      salesGroupUserList: [],
      contactPersonNameList: [],
      customerContactPersonList: [],
      currencyList: [],
      activeNames: ['1']
    }
  },
  watch: {
    query: {
      deep: false,
      immediate: true,
      handler(newValue) {
        this.init(newValue || {})
      }
    }
  },

  created() {
    const { sales_opportunity_status } = this.useDict(
      'sales_opportunity_status'
    )
    this.sales_opportunity_status = sales_opportunity_status || []
    // this.timeId = this.$route.query.timeId
    // this.rowId = this.$route.query.id
    // this.isView = this.$route.query.isView === '1'
    // this.queryCurrencyListBySelect()
    // this.handleUpdate()
  },
  // activated() {
  //   if (this.$route.query.timeId !== this.timeId) {
  //     this.timeId = this.$route.query.timeId
  //     this.rowId = this.$route.query.id
  //     this.isView = this.$route.query.isView === '1'
  //     this.queryCurrencyListBySelect()
  //     this.handleUpdate()
  //   }
  // },
  computed: {
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
    init(e) {
      this.reset()
      this.form = e || {}
      // this.queryCurrencyListBySelect()
      // this.getAllCustomerLabel()
    },
    queryCurrencyListBySelect() {
      queryCurrencyListBySelect().then(res => {
        this.currencyList = res.data || []
      })
    },
    // 线索
    leadNameOpen() {
      this.$refs.leadNameDlg.handleAdd()
    },
    // 更新线索
    leadNameUpdate(e) {
      const { leadName, leadId } = e
      this.form.leadName = leadName
      this.form.leadId = leadId
    },
    // 清空线索
    leadNameClear() {
      this.form.leadName = undefined
      this.form.leadId = undefined
    },
    // 客户
    customerNameOpen() {
      this.$refs.customerNameDlg.handleAdd()
    },
    // 更新客户
    customerNameUpdate(e) {
      const { customerName, customerId, customerContactPersonList } = e
      this.form.customerName = customerName
      this.form.customerId = customerId
      this.customerContactPersonList = customerContactPersonList
      this.contactPersonNameClear()
      this.$refs.form.validateField('customerName')
    },
    // 清空客户
    customerNameClear() {
      this.form.customerName = undefined
      this.form.customerId = undefined
      this.customerContactPersonList = []
      this.contactPersonNameClear()
      this.addressClear()
    },
    // 更新客户联系人
    contactPersonNameChange() {
      const { customerContactPersonId } = this.form
      if (customerContactPersonId) {
        const row = this.customerContactPersonList.filter(
          x => x.customerContactPersonId === customerContactPersonId
        )[0]
        const { contactPersonName, mobileCode, mobilePhone, mobileNum, email } =
          row
        this.form.contactPersonName = contactPersonName
        this.form.contactMobileCode = mobileCode
        this.form.contactMobileNum = mobileNum
        this.form.contactMobilePhone = mobilePhone
        this.form.contactEmail = email
      } else {
        this.contactPersonNameClear()
      }
    },
    // 清空客户联系人
    contactPersonNameClear() {
      this.form.customerContactPersonId = undefined
      this.form.contactPersonName = undefined
      this.form.contactMobileCode = undefined
      this.form.contactMobileNum = undefined
      this.form.contactMobilePhone = undefined
      this.form.contactEmail = undefined
    },
    // 地址
    addressOpen() {
      this.$refs.addressDlg.handleAdd()
    },
    // 更新地址
    addressUpdate(e) {
      const { address, customerAddressId } = e
      this.form.address = address
      this.form.address1 = address1
      this.form.customerAddressId = customerAddressId
      this.$refs.form.validateField('address')
    },
    // 清空地址
    addressClear() {
      this.form.address = undefined
      this.form.address1 = undefined
      this.form.customerAddressId = undefined
    },

    openSalesGroupTable() {
      this.$refs.salesGroupDlg.handleAdd()
    },
    updateSalesGroup(e) {
      const { salesGroupName, salesGroupId, salesGroupUserList } = e
      this.form.salesGroupId = salesGroupId
      this.form.salesGroupName = salesGroupName
      this.salesGroupUserList = salesGroupUserList
      this.form.salesGroupUserId = undefined
      this.$refs.form.validateField('salesGroupName')
    },
    salesGroupClear() {
      this.form.salesGroupId = undefined
      this.form.salesGroupName = undefined
      this.salesGroupUserList = []
      this.form.salesGroupUserId = undefined
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
    // 标签，客户级别
    getAllCustomerLabel() {
      getAllCustomerLabel().then(res => {
        const data = res.data || []
        const curList = this.form.labelIdList || []
        const list = data.filter(
          item => item.delFlag === '0' || curList.includes(item.labelId)
        )
        this.labelList = list
      })
      getAllCustomerTier().then(res => {
        const data = res.data || []
        const curList = this.form.tierIdList || []
        const list = data.filter(
          item => item.delFlag === '0' || curList.includes(item.tierId)
        )
        this.customerTierList = list
      })
    },
    // 下次联系时间
    nextContactTimeDateChange() {
      const current = this.appointTime(Date.now(), '00:00:00')
      const { validityDate } = this.form
      if (validityDate) {
        const validityDays = (validityDate - current) / 24 / 3600 / 1000
        this.form.validityDays = validityDays
      } else {
        this.form.validityDays = undefined
      }
    },
    // 下次联系时间
    inputNumberChange(code) {
      const { validityDays } = this.form
      const current = this.appointTime(Date.now(), '00:00:00')
      if (validityDays) {
        this.form.validityDate = current + validityDays * 24 * 3600 * 1000
      } else {
        this.form.validityDate = undefined
      }
      this.$refs.form.validateField(code)
    },
    handleAdd() {
      this.reset()
      this.getAllCustomerLabel()
    },
    handleUpdate() {
      this.reset()
      const salesOpportunityId = this.rowId
      querySalesOpportunityById({ salesOpportunityId }).then(response => {
        const data = response.data || {}
        this.form = data
        this.getAllCustomerLabel()
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
      this.activeNames = ['1', '2', '3', '4']
      this.collapseWarningForBasicInfo = false
      this.resetForm('form')
    },
    saveForm() {
      this.$refs.form
        .validateField([
          'customerName',
          'salesOpportunityName',
          'salesGroupName',
          'salesGroupUserId'
        ])
        .then(
          valid => {
            console.log(valid, '===')
            this.collapseWarningForBasicInfo = false
            let params = this.$trimOfObj(JSON.parse(JSON.stringify(this.form)))
            this.$modal
              .confirm(this.$t('customer.saveSalesOpportunityConfirm'))
              .then(() => {
                return saveSalesOpportunity(params)
              })
              .then(response => {
                this.$modal.msgSuccess(
                  this.$t('customer.saveSalesOpportunitySuccess').replace(
                    '$1',
                    params.salesOpportunityName
                  )
                )
                this.cancel()
              })
              .catch(() => {})
          },
          err => {
            this.collapseWarningForBasicInfo = true
          }
        )
    },
    submitForm: function () {
      this.$refs.form.validate(valid => {
        this.collapseWarningForBasicInfo = !valid
        if (valid) {
          this.collapseWarningForBasicInfo = false

          let param = this.$trimOfObj(JSON.parse(JSON.stringify(this.form)))
          const params = { ...param }

          this.$modal
            .confirm(this.$t('customer.submitSalesOpportunityConfirm'))
            .then(() => {
              // if (params.salesOpportunityId) {
              //   return updateLead(params)
              // }
              return submitSalesOpportunity(params)
            })
            .then(response => {
              this.$modal.msgSuccess(
                this.$t('customer.submitSalesOpportunitySuccess').replace(
                  '$1',
                  params.salesOpportunityName
                )
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
