<template>
  <!-- formClass="form-page-btn--hide" -->
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        @click="submitForm"
        v-if="!comDisFrom"
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
              ref="formRef1"
              :model="form"
              :rules="rules"
              :disabled="comDisFrom"
              label-width="200px"
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('customer.competitorName')}`"
                    prop="competitorName"
                  >
                    <div class="d-flex align-items-center">
                      <el-input
                        v-if="!form.customerId"
                        v-model="form.competitorName"
                        :title="form.competitorName"
                        maxlength="200"
                        :disabled="!!form.competitorId"
                      />
                      <SelectInput
                        v-if="form.customerId"
                        :clearable="true"
                        :value="form.competitorName"
                        :title="form.competitorName"
                        @clear="customerClear"
                        :disabled="comDisFrom || form.competitorId"
                      />
                      <el-icon
                        :size="setSize === 'small' ? 24 : 28"
                        class="gray-icon"
                        v-if="!comDisFrom && !form.competitorId"
                        @click="openSelectCustomer"
                      >
                        <Plus />
                      </el-icon>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('customer.treatLevel')}`"
                    prop="treatLevel"
                  >
                    <el-select
                      v-model="form.treatLevel"
                      placeholder=""
                      style="width: 100%"
                      clearable
                    >
                      <el-option
                        v-for="dict in treat_level"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('customer.competitorCode')}`"
                    prop="competitorCode"
                  >
                    <el-input
                      v-model="form.competitorCode"
                      :title="form.competitorCode"
                      disabled
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('customer.phone')}`"
                    prop="mobilePhone"
                    ref="mobileNoRef"
                  >
                    <MobilePhoneInput
                      :disabled="comDisFrom || !!form.customerId"
                      v-model:mobileCode="form.mobileCode"
                      v-model:mobileNum="form.mobileNum"
                      v-model:mobileNo="form.mobilePhone"
                      @clearValidate="$refs.mobileNoRef.clearValidate()"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.email')}`" prop="email">
                    <el-input
                      v-model.trim="form.email"
                      :title="form.email"
                      maxlength="50"
                      :disabled="!!form.customerId"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.currency')}`"
                    prop="currency"
                  >
                    <CommonSelect
                      :id="form.currencyId"
                      :label="form.currency"
                      idKey="id"
                      labelKey="label"
                      filterable
                      :disabled="comDisFrom || !!form.customerId"
                      :options="currencyOptions"
                      @changeItem="salesCurrencyChange"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="$t('customer.label')"
                    prop="labelIdList"
                  >
                    <el-select
                      v-model="form.labelIdList"
                      :title="selectDictLabels(labelList, form.labelIdList)"
                      placeholder=""
                      style="width: 100%"
                      clearable
                      multiple
                      collapse-tags
                    >
                      <el-option
                        v-for="dict in labelList"
                        :key="dict.labelId"
                        :label="dict.labelName"
                        :value="dict.labelId"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="24">
                  <el-form-item
                    :label="$t('customer.businessScope')"
                    prop="businessScope"
                  >
                    <el-input
                      type="textarea"
                      v-model="form.businessScope"
                      :autosize="{ minRows: 1, maxRows: 4 }"
                      resize="none"
                      show-word-limit
                      :maxlength="7000"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="24">
                  <el-form-item :label="$t('ui.remarks')">
                    <el-input
                      type="textarea"
                      v-model="form.remarks"
                      :autosize="{ minRows: 1, maxRows: 4 }"
                      resize="none"
                      show-word-limit
                      :maxlength="3000"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.isActive')}`" prop="isActive">
                    <el-switch
                      v-model="form.isActive"
                      active-value="1"
                      inactive-value="0"
                    ></el-switch>
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
                :title="$t('ui.registrationInfo')"
                :warning="collapseWarningForRegistrationInfo"
              >
              </FormCollapseItemTitle>
            </template>
            <el-form
              ref="formRef2"
              :model="form"
              :rules="rules"
              label-width="180px"
              :disabled="comDisFrom"
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.taxpayerIdentificationNo')}`">
                    <el-input
                      v-model="form.taxpayerIdentificationNo"
                      :title="form.taxpayerIdentificationNo"
                      maxlength="200"
                      :disabled="!!form.customerId"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.website')}`" prop="website">
                    <el-input
                      v-model="form.website"
                      :title="form.website"
                      maxlength="200"
                      :disabled="!!form.customerId"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('ui.fax')}`"
                    prop="fax"
                    ref="faxRef"
                  >
                    <MobilePhoneInput
                      v-model:mobileCode="form.faxCode"
                      v-model:mobileNum="form.fax"
                      v-model:mobileNo="form.faxPhone"
                      @clearValidate="$refs.faxRef.clearValidate()"
                      :disabled="!!form.customerId"
                    />
                    <!-- <el-input v-model="createForm.fax" :maxlength="50" class="form-wd" /> -->
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('ui.companyRegNo')}`"
                    prop="companyRegNo"
                  >
                    <el-input
                      v-model="form.companyRegNo"
                      :title="form.companyRegNo"
                      :disabled="!!form.customerId"
                      maxlength="200"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.registeredCapital')}`">
                    <el-input
                      v-model="form.registeredCapital"
                      :title="form.registeredCapital"
                      :disabled="!!form.customerId"
                      maxlength="200"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.corporateRepresentative')}`">
                    <el-input
                      v-model="form.corporateRepresentative"
                      :title="form.corporateRepresentative"
                      :disabled="!!form.customerId"
                      maxlength="200"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.country')}`" prop="country">
                    <CountrySelect
                      v-model="form.country"
                      class="form-wd"
                      @select="handleCountrySelect"
                      :disabled="!!form.customerId"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item
                    :label="`${$t('ui.registeredAddress')}`"
                    prop="registeredAddress"
                  >
                    <el-input
                      v-model="form.registeredAddress"
                      maxlength="500"
                      :disabled="!!form.customerId"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </div>

        <div class="form-card mt10" v-if="!!form.competitorId">
          <el-collapse-item name="7">
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

    <SelectCustomerDlg @onSuccess="customerSelect" ref="SelectCustomerDlg" />
  </FormPageLayout>
</template>

<script>
import {
  saveCompetitor,
  queryCompetitorById,
  updateCompetitor
} from '@/api/competitor/index.js'

import CountrySelect from '@/components/select/countrySelect'
import SelectCustomerDlg from './selectCustomerDlg'

import { queryCurrencyListBySelect } from '@/api/basic/basic'
import { getAllCustomerLabel } from '@/api/system/systemSetup/customerTier'

import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  mixins: [],
  components: {
    CountrySelect,
    SystemOperationLogTable,
    SelectCustomerDlg
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
      rowId: '',
      activeNames: [],
      form: {},
      rules: {
        competitorName: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        treatLevel: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['change']
          }
        ],
        mobilePhone: [
          { required: true, validator: validatorPhoneNo, trigger: 'change' }
        ],
        email: [
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

        currency: [
          {
            required: false,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        businessScope: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],

        website: [
          {
            validator: validWebsite,
            trigger: ['blur', 'change']
          }
        ],
        companyRegNo: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        country: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        registeredAddress: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ]
      },

      collapseWarningForBasicInfo: false,
      collapseWarningForRegistrationInfo: false,
      isView: undefined,
      treat_level: [],
      labelList: [],
      currencyOptions: []
    }
  },

  created() {
    const { treat_level } = this.useDict('treat_level')
    this.treat_level = treat_level || []

    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.isView = this.$route.query.isView === '1'
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
      if (this.rowId) {
        this.handleUpdate()
      } else {
        this.handleAdd()
      }
    }
  },
  computed: {
    setSize() {
      return this.$store.getters.size
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['competitor:edit'])
    },
    comDisFrom() {
      if (this.isView) {
        return true
      }
      if (this.rowId) {
        return !this.editAuth
      }
      return false
    },
    sysDockingSwitch() {
      return this.$store.getters.sysDockingSwitch
    },
    // 法人对接
    isSystemDocking() {
      return this.$store.state.user.legalEntityInfo.isSystemDocking
    }
  },
  methods: {
    openSelectCustomer() {
      this.$refs.SelectCustomerDlg.handleOpen()
    },
    customerClear() {
      this.form.competitorName = undefined
      this.form.customerId = undefined
      this.form.mobileCode = undefined
      this.form.mobileNum = undefined
      this.form.mobilePhone = undefined
      this.form.email = undefined
      this.form.currencyId = undefined
      this.form.currency = undefined
      this.form.currencyCode = undefined
      this.form.labelIdList = []

      this.form.taxpayerIdentificationNo = undefined
      this.form.website = undefined
      this.form.faxCode = undefined
      this.form.fax = undefined
      this.form.faxPhone = undefined
      this.form.companyRegNo = undefined
      this.form.registeredCapital = undefined
      this.form.corporateRepresentative = undefined
      this.form.country = undefined
      this.form.countryId = undefined
      this.form.registeredAddress = undefined

      setTimeout(() => {
        this.$refs.formRef1 && this.$refs.formRef1.clearValidate()
        this.$refs.formRef2 && this.$refs.formRef2.clearValidate()
      }, 100)
    },
    customerSelect(row) {
      this.form.competitorName = row.customerName
      this.form.customerId = row.customerId
      this.form.mobileCode = row.mobileCode
      this.form.mobileNum = row.mobileNum
      this.form.mobilePhone = row.mobilePhone
      this.form.email = row.email
      this.form.currencyId = row.currencyId
      this.form.currency = row.currency
      this.form.currencyCode = row.currencyCode
      this.form.labelIdList = row.labelIdList

      this.form.taxpayerIdentificationNo = row.taxpayerIdentificationNo
      this.form.website = row.website
      this.form.faxCode = row.faxCode
      this.form.fax = row.fax
      this.form.faxPhone = row.faxPhone
      this.form.companyRegNo = row.companyRegNo
      this.form.registeredCapital = row.registeredCapital
      this.form.corporateRepresentative = row.corporateRepresentative
      this.form.country = row.country
      this.form.countryId = row.countryId
      this.form.registeredAddress = row.registeredAddress

      this.$nextTick(() => {
        this.$refs.formRef1 &&
          this.$refs.formRef1.validateField([
            'competitorName',
            'mobilePhone',
            'email'
          ])
        this.$refs.formRef2 &&
          this.$refs.formRef2.validateField([
            'companyRegNo',
            'country',
            'registeredAddress'
          ])
      })
    },
    /* 货币 */
    queryCurrencyListBySelect() {
      queryCurrencyListBySelect().then(res => {
        const list = res.data || []
        this.currencyOptions = list.map(item => {
          item.label = `${item.currencyCode} (${item.currencyDesc})`
          return item
        })
      })
    },
    salesCurrencyChange(row) {
      console.log(row)
      this.form['currencyId'] = row.id
      this.form['currency'] = row.label
      this.form['currencyCode'] = row.currencyCode
    },

    // 标签，客户级别
    getAllCustomerLabel() {
      getAllCustomerLabel().then(res => {
        const data = res.data || []
        const curList = this.form.labelIdList || []
        const list = data.filter(
          item => item.delFlag === '0' || curList.includes(item.labelId)
        )
        list.forEach(item => {
          item.value = item.labelId
          item.label = item.labelName
        })
        this.labelList = list
      })
    },
    handleCountrySelect(row) {
      if (row) {
        const { id, name } = row
        this.form.country = name
        this.form.countryId = id
      }
    },

    handleAdd() {
      this.reset()
      this.queryCurrencyListBySelect()
      this.getAllCustomerLabel()
    },
    handleUpdate() {
      this.reset()
      this.queryCurrencyListBySelect()
      const competitorId = this.rowId
      queryCompetitorById({ competitorId }).then(response => {
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

      const obj = { path: '/competitor' }
      this.$tab.closeOpenPage(obj)
    },
    // 表单重置
    reset() {
      this.form = {
        competitorName: undefined,
        mobileCode: undefined,
        mobileNum: undefined,
        mobilePhone: undefined,
        email: undefined,
        salesGroupUserId: undefined,
        salesGroupUserName: undefined,
        remarks: undefined,
        labelIdList: [],
        treatLevel: undefined,
        isActive: '1'
      }
      this.activeNames = ['1', '2', '3', '4', '5', '6', '7']
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForRegistrationInfo = false
      this.resetForm('formRef1')
    },

    submitForm: function () {
      this.$refs.formRef1.validate(valid1 => {
        this.collapseWarningForBasicInfo = !valid1
        if (!valid1) {
          this.$message.error(
            this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
          )
          return
        }
        this.$refs.formRef2.validate(valid2 => {
          this.collapseWarningForRegistrationInfo = !valid2
          if (!valid2) {
            this.$message.error(
              this.$t('ui.fromIncomplete').replace(
                '$1',
                this.$t('ui.registrationInfo')
              )
            )
            return
          }

          let param = { ...this.form }
          param = this.$trimOfObj(JSON.parse(JSON.stringify(param)))
          delete param.labelIds
          delete param.labelList
          delete param.labelNames

          this.$modal
            .confirm(this.$t('customer.submitCompetitorConfirm'))
            .then(() => {
              if (param.competitorId) {
                return updateCompetitor(param)
              } else {
                return saveCompetitor(param)
              }
            })
            .then(response => {
              this.$modal.msgSuccess(
                this.$t('customer.submitCompetitorSuccess').replace(
                  '$1',
                  param.competitorName
                )
              )
              this.cancel()
            })
            .catch(() => {})
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.d-flex {
  display: flex;
  width: 100%;
  align-items: center;
}
.gray-icon {
  margin-left: 10px;
  background-color: #efefef;
  padding: 0 2px;
  // color: #fff;
  border-radius: 2px;
  cursor: pointer;
  height: 100%;
  &:hover {
    opacity: 0.8;
  }
}
</style>
