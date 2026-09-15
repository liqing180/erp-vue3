<template>
  <!-- formClass="form-page-btn--hide" -->
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        @click="submitForm"
        v-if="submitAuth"
        >{{ $t('uiBtn.submit') }}
      </el-button>
      <el-button type="primary" size="small" @click="saveForm" v-if="saveAuth"
        >{{ $t('uiBtn.save') }}
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
              ref="form"
              :model="form"
              :rules="rules"
              :disabled="comDisFrom"
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
                        form.leadName
                          ? form.leadName + ' - ' + form.leadCode
                          : ''
                      "
                      :title="
                        form.leadName
                          ? form.leadName + ' - ' + form.leadCode
                          : ''
                      "
                      @click="leadNameOpen"
                      @clear="leadNameClear"
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
                      :disabled="
                        !!form.salesOpportunityId || !!form.targetCustomerId
                      "
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
                      :disabled="!!form.salesQuotationId"
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
                      placeholder="1 - 100"
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
                      v-thousandSplit="{ precision: 2 }"
                      type="number"
                      class="form-wd textleft"
                      :min="0"
                      :max="999999999999.99"
                      title=" "
                      @change="inputNumberChange('estAmount')"
                      style="width: 100%"
                      controls-position="right"
                      :disabled="form.amountAlreadyCertain === '1'"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('ui.currency')" prop="currencyCode">
                    <el-select
                      v-model="form.currencyCode"
                      placeholder=""
                      class="w100"
                      clearable
                      filterable
                      :disabled="form.amountAlreadyCertain === '1'"
                    >
                      <el-option
                        v-for="dict in currencyList"
                        :key="dict.currencyCode"
                        :label="dict.currency"
                        :value="dict.currencyCode"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="$t('customer.contactPersonName')"
                    prop="customerContactPersonId"
                  >
                    <el-select
                      v-model="form.customerContactPersonId"
                      placeholder=""
                      style="width: 100%"
                      clearable
                      :disabled="!form.customerId"
                      @change="contactPersonNameChange"
                    >
                      <el-option
                        v-for="dict in customerContactPersonList"
                        :key="dict.customerContactPersonId"
                        :label="dict.contactPersonName"
                        :value="dict.customerContactPersonId"
                      ></el-option>
                    </el-select>
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
                      :clearable="true"
                      :value="form.salesGroupName"
                      :title="form.salesGroupName"
                      @click="openSalesGroupTable"
                      @clear="salesGroupClear"
                      :disabled="!!form.salesOpportunityId"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('customer.salesPerson')}`"
                    prop="salesGroupUserId"
                  >
                    <!-- <el-select
                      v-model="form.salesGroupUserId"
                      placeholder=""
                      style="width: 100%"
                      clearable
                      :disabled="
                        !form.salesGroupId || !!form.salesOpportunityId
                      "
                    >
                      <el-option
                        v-for="dict in salesGroupUserList"
                        :key="dict.salesGroupUserId"
                        :label="dict.salesGroupUserName"
                        :value="dict.salesGroupUserId"
                      ></el-option>
                    </el-select> -->

                    <CommonSelect
                      :id="form.salesGroupUserId"
                      :label="form.salesGroupUserName"
                      idKey="salesGroupUserId"
                      labelKey="salesGroupUserName"
                      filterable
                      :disabled="
                        !form.salesGroupId || !!form.salesOpportunityId
                      "
                      :options="salesGroupUserList"
                      @changeItem="salesPersonChange"
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
                      :disabled="!form.customerId"
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

        <div class="form-card mt10" v-if="false">
          <el-collapse-item name="4">
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

    <!-- 线索 -->
    <leadNameDlg ref="leadNameDlg" @onSuccess="leadNameUpdate" />
    <!-- 客户 -->
    <customerNameDlg ref="customerNameDlg" @onSuccess="customerNameUpdate" />
    <!-- 地址 -->
    <addressDlg
      ref="addressDlg"
      :customerId="form.customerId"
      @onSuccess="addressUpdate"
    />

    <salesGroupDlg
      ref="salesGroupDlg"
      :query="form"
      @onSuccess="updateSalesGroup"
    />
  </FormPageLayout>
</template>

<script>
import {
  saveSalesOpportunity,
  querySalesOpportunityById,
  submitSalesOpportunity,
  queryCanSelectCustomerList
} from '@/api/salesOpportunity/salesOpportunity'
import { queryCurrencyListBySelect } from '@/api/basic/basic'
import { queryCanSelectSalesGroupList } from '@/api/leads/leads'
import { queryCustomerById } from '@/api/customerManagement/customer.js'
import pageMixin from '@/mixins/tableMinx'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
import leadNameDlg from './components/leadNameDlg'
import customerNameDlg from './components/customerNameDlg'
import salesGroupDlg from './components/salesGroupDlg.vue'
import addressDlg from './components/addressDlg.vue'

function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  name: 'FomPage',
  mixins: [pageMixin],
  components: {
    SystemOperationLogTable,
    leadNameDlg,
    salesGroupDlg,
    customerNameDlg,
    addressDlg
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
      curPath: this.$options.__file,
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
        currencyCode: [
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
        address1: [
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
      currencyList: []
    }
  },

  created() {
    const { sales_opportunity_status } = this.useDict(
      'sales_opportunity_status'
    )
    this.sales_opportunity_status = sales_opportunity_status || []
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.isView = this.$route.query.isView === '1'
    this.queryCurrencyListBySelect()
    if (this.rowId) {
      this.handleUpdate()
    } else {
      this.handleAdd()
    }
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.rowId = this.$route.query.id
      this.isView = this.$route.query.isView === '1'
      this.queryCurrencyListBySelect()
      if (this.rowId) {
        this.handleUpdate()
      } else {
        this.handleAdd()
      }
    }
  },
  computed: {
    legalEntityInfo() {
      return this.$store.state.user.legalEntityInfo
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['salesOpportunity:edit'])
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
    },
    submitAuth() {
      if (this.isView) {
        return false
      }
      if (this.rowId) {
        return this.editAuth && this.form.isCanSubmit === '1'
      }
      return true
    },
    saveAuth() {
      if (this.isView) {
        return false
      }
      if (this.rowId) {
        return this.editAuth && this.form.isCanSave === '1'
      }
      return true
    }
  },
  methods: {
    salesPersonChange(row) {
      this.form.salesGroupUserId = row.salesGroupUserId
      this.form.salesGroupUserName = row.salesGroupUserName
    },
    queryCurrencyListBySelect() {
      queryCurrencyListBySelect().then(res => {
        this.currencyList = res.data || []
        if (!this.form.currencyCode && !this.rowId) {
          this.form.currency = this.legalEntityInfo.currency
          this.form.currencyId = this.legalEntityInfo.currencyId
          this.form.currencyCode = this.legalEntityInfo.currencyCode
          this.form.currencySymbol = this.legalEntityInfo.currencySymbol
        }
      })
    },
    // 线索
    leadNameOpen() {
      this.$refs.leadNameDlg.handleAdd()
    },
    // 更新线索
    leadNameUpdate(e) {
      const {
        leadName,
        leadId,
        leadCode,
        salesGroupId,
        salesGroupName,
        salesGroupUserId,
        salesGroupUserName
      } = e
      this.form.leadName = leadName
      this.form.leadId = leadId
      this.form.leadCode = leadCode
      if (salesGroupId) {
        // this.queryCanSelectSalesGroupList()

        queryCanSelectSalesGroupList({}).then(res => {
          const list = res.data || []
          const arr = list.filter(x => x.salesGroupId === salesGroupId)
          if (arr.length > 0) {
            this.form.salesGroupId = salesGroupId
            this.form.salesGroupName = salesGroupName
            this.salesGroupUserList = (arr[0].salesGroupUserList || []).filter(
              x => x.isActive === '1'
            )
            const flag = this.salesGroupUserList.some(
              x => x.salesGroupUserId === salesGroupUserId
            )
            if (flag) {
              this.form.salesGroupUserId = salesGroupUserId
              this.form.salesGroupUserName = salesGroupUserName
            }
          }
        })
      }
    },
    queryCanSelectSalesGroupList() {
      queryCanSelectSalesGroupList({}).then(res => {
        const list = res.data || []
        const arr = list.filter(x => x.salesGroupId === this.form.salesGroupId)
        this.salesGroupUserList = (arr[0].salesGroupUserList || []).filter(
          x => x.isActive === '1'
        )
      })
    },
    // 清空线索
    leadNameClear() {
      this.form.leadName = undefined
      this.form.leadId = undefined
      this.form.leadCode = undefined
    },
    // 客户
    customerNameOpen() {
      this.$refs.customerNameDlg.handleAdd()
    },
    // 更新客户
    customerNameUpdate(e) {
      const {
        customerName,
        customerId,
        customerContactPersonList,
        country,
        countryId,
        customerCode
      } = e
      this.form.customerName = customerName
      this.form.customerId = customerId
      this.form.country = country
      this.form.countryId = countryId
      this.form.customerCode = customerCode
      this.customerContactPersonList = (customerContactPersonList || []).filter(
        x => x.isActive === '1'
      )
      this.contactPersonNameClear()
      const list = this.customerContactPersonList.filter(
        x => x.isDefault === '1'
      )
      if (list.length > 0) {
        this.form.customerContactPersonId = list[0].customerContactPersonId
        this.contactPersonNameChange()
      }
      this.$refs.form && this.$refs.form.validateField('customerName')
    },
    // 清空客户
    customerNameClear() {
      this.form.customerName = undefined
      this.form.customerId = undefined
      this.form.country = undefined
      this.form.countryId = undefined
      this.form.customerCode = undefined
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
      this.form.address1 = address
      this.form.customerAddressId = customerAddressId
      this.$refs.form && this.$refs.form.validateField('address1')
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
      this.salesGroupUserList = (salesGroupUserList || []).filter(
        x => x.isActive === '1'
      )
      this.form.salesGroupUserId = undefined
      this.form.salesGroupUserName = undefined
      this.$refs.form && this.$refs.form.validateField('salesGroupName')
    },
    salesGroupClear() {
      this.form.salesGroupId = undefined
      this.form.salesGroupName = undefined
      this.salesGroupUserList = []
      this.form.salesGroupUserId = undefined
      this.form.salesGroupUserName = undefined
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
      this.$refs.form && this.$refs.form.validateField(code)
    },
    handleAdd() {
      this.reset()
      this.form.validityDays = 30
      this.inputNumberChange('validityDays')
      const customerId = this.$route.query.customerId
      if (customerId) {
        queryCustomerById({ customerId }).then(response => {
          this.form.targetCustomerId = customerId
          this.customerNameUpdate(response.data || {})
          // let list = response.data
          // const row = list.filter(x => x.customerId === customerId)[0] || {}
          // if (row) {
          //   this.form.targetCustomerId = customerId
          //   this.customerNameUpdate(row)
          // }
        })
      }
    },
    handleUpdate() {
      this.reset()
      const salesOpportunityId = this.rowId
      querySalesOpportunityById({ salesOpportunityId }).then(response => {
        const data = response.data || {}
        this.form = data
        queryCustomerById({ customerId: this.form.customerId }).then(
          response => {
            const { customerContactPersonList } = response.data || {}
            this.customerContactPersonList = customerContactPersonList || []
          }
        )
      })
    },
    queryCanSelectCustomerList() {
      queryCanSelectCustomerList({}).then(response => {
        let list = response.data
        const row =
          list.filter(x => x.customerId === this.form.customerId)[0] || {}
        this.customerContactPersonList = row.customerContactPersonList || []
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

      if (this.$route.query.backType === '3' && this.$route.query.customerId) {
        const obj = {
          path: '/customerManagement/viewProspectiveCustomer',
          query: {
            id: this.$route.query.customerId,
            timeId: Date.now(),
            activeName: '4'
          }
        }
        this.$tab.closeOpenPage(obj)
        return
      }
      if (this.$route.query.backType === '4' && this.$route.query.customerId) {
        const obj = {
          path: '/customerManagement/viewCustomer',
          query: {
            id: this.$route.query.customerId,
            timeId: Date.now(),
            activeName: '4'
          }
        }
        this.$tab.closeOpenPage(obj)
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
            this.collapseWarningForBasicInfo = false
            let params = this.$trimOfObj(JSON.parse(JSON.stringify(this.form)))

            this.$modal
              .confirm(this.$t('customer.saveSalesOpportunityConfirm'))
              .then(() => {
                if (!this.form.salesOpportunityId) {
                  const salesGroupUserName = this.salesGroupUserList.filter(
                    x => x.salesGroupUserId === params.salesGroupUserId
                  )[0].salesGroupUserName
                  params.salesGroupUserName = salesGroupUserName
                }

                if (params.currencyCode) {
                  const { currency, currencyCode, currencySymbol, id } =
                    this.currencyList.filter(
                      x => x.currencyCode === params.currencyCode
                    )[0]
                  params.currency = currency
                  params.currencyId = id
                  params.currencyCode = currencyCode
                  params.currencySymbol = currencySymbol
                }
                return saveSalesOpportunity(params)
              })
              .then(response => {
                const { salesOpportunityNo } = response.data
                this.$modal.msgSuccess(
                  this.$t('customer.saveSalesOpportunitySuccess').replace(
                    '$1',
                    salesOpportunityNo
                  )
                )
                this.cancel()
              })
              .catch(err => {})
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
              if (!this.form.salesOpportunityId) {
                const salesGroupUserName = this.salesGroupUserList.filter(
                  x => x.salesGroupUserId === params.salesGroupUserId
                )[0].salesGroupUserName
                params.salesGroupUserName = salesGroupUserName
              }
              if (params.currencyCode) {
                const { currency, currencyCode, currencySymbol, id } =
                  this.currencyList.filter(
                    x => x.currencyCode === params.currencyCode
                  )[0]
                params.currency = currency
                params.currencyId = id
                params.currencyCode = currencyCode
                params.currencySymbol = currencySymbol
              }

              return submitSalesOpportunity(params)
            })
            .then(response => {
              const { salesOpportunityNo } = response.data
              this.$modal.msgSuccess(
                this.$t('customer.submitSalesOpportunitySuccess').replace(
                  '$1',
                  salesOpportunityNo
                )
              )
              this.cancel()
            })
            .catch(err => {
              console.log(err, '===1047')
            })
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
