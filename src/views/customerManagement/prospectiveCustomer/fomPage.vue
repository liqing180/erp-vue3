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
                    :label="`${$t('customer.prospectiveCustomerName')}`"
                    prop="customerName"
                  >
                    <el-input
                      v-model="form.customerName"
                      :title="form.customerName"
                      maxlength="200"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('customer.customerSource')}`"
                    prop="customerSource"
                  >
                    <el-select
                      v-model="form.customerSource"
                      placeholder=""
                      style="width: 100%"
                      clearable
                    >
                      <el-option
                        v-for="dict in lead_source"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('customer.prospectiveCustomerCode')}`"
                    prop="customerCode"
                  >
                    <el-input
                      v-model="form.customerCode"
                      :title="form.customerCode"
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
                      :disabled="comDisFrom"
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
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('customer.customerType')">
                    <el-input
                      :value="$t('menu.prospectiveCustomer')"
                      :title="$t('menu.prospectiveCustomer')"
                      disabled
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
                      :disabled="!!form.customerId || comDisFrom"
                    />
                  </el-form-item>
                </el-col>

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

                <el-col :span="8">
                  <el-form-item
                    :label="$t('customer.customerTier')"
                    prop="tierIdList"
                  >
                    <el-select
                      v-model="form.tierIdList"
                      :title="
                        selectDictLabels(customerTierList, form.tierIdList)
                      "
                      placeholder=""
                      style="width: 100%"
                      clearable
                      multiple
                      collapse-tags
                    >
                      <el-option
                        v-for="dict in customerTierList"
                        :key="dict.tierId"
                        :label="dict.tierName"
                        :value="dict.tierId"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('customer.salesPerson')}`"
                    prop="salesGroupUserId"
                  >
                    <CommonSelect
                      :id="form.salesGroupUserId"
                      :label="form.salesGroupUserName"
                      idKey="salesGroupUserId"
                      labelKey="salesGroupUserName"
                      filterable
                      :disabled="
                        comDisFrom || !form.salesGroupName || !!form.customerId
                      "
                      :options="salesGroupUserList"
                      @changeItem="salesPersonChange"
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
                      :disabled="comDisFrom"
                      :options="currencyOptions"
                      @changeItem="salesCurrencyChange"
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

              <el-row>
                <el-col
                  :span="8"
                  v-if="sysDockingSwitch && isSystemDocking === '1'"
                >
                  <el-form-item
                    :label="`${$t('ui.systemDocking')}`"
                    prop="syncCustomer"
                  >
                    <el-switch
                      v-model="form.syncCustomer"
                      active-value="1"
                      inactive-value="0"
                      @change="syncCustomerChange"
                      :disabled="
                        !form.customerId
                          ? false
                          : form.isCanEditSyncCustomer !== '1'
                      "
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
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.website')}`" prop="website">
                    <el-input
                      v-model="form.website"
                      :title="form.website"
                      maxlength="200"
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
                      :disabled="comDisFrom"
                      v-model:mobileCode="form.faxCode"
                      v-model:mobileNum="form.fax"
                      v-model:mobileNo="form.faxPhone"
                      @clearValidate="$refs.faxRef.clearValidate()"
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
                      :disabled="form.isRevise === '1'"
                      maxlength="200"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.registeredCapital')}`">
                    <el-input
                      v-model="form.registeredCapital"
                      :title="form.registeredCapital"
                      maxlength="200"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.corporateRepresentative')}`">
                    <el-input
                      v-model="form.corporateRepresentative"
                      :title="form.corporateRepresentative"
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
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="3">
            <template v-slot:title>
              <FormCollapseItemTitle
                :title="$t('ui.addressInfo')"
                :warning="collapseWarningForAddressInfo"
              >
              </FormCollapseItemTitle>
            </template>
            <AddressInfo
              ref="AddressInfoRef"
              :formData="form"
              :projectList="projectList || []"
              :cdsQc="form.syncCustomer"
              :countryItem="{
                countryId: form.countryId,
                country: form.country
              }"
              :geofenceTypeRequired="form.syncCustomer === '1' ? true : false"
              @change="addressListChange"
              :comDisFrom="comDisFrom"
            />
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="4">
            <template v-slot:title>
              <FormCollapseItemTitle
                :title="$t('ui.contactPersonInfo')"
                :warning="collapseWarningForContactPersonInfo"
              >
              </FormCollapseItemTitle>
            </template>
            <ContactPersonInfo
              ref="ContactPersonInfoRef"
              :addressList="addressList"
              :cdsQc="form.syncCustomer"
              @change="contactPersonListChange"
              :comDisFrom="comDisFrom"
            />
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="5">
            <template v-slot:title>
              <FormCollapseItemTitle :title="$t('ui.attachment')">
              </FormCollapseItemTitle>
            </template>

            <el-row>
              <el-col :span="24">
                <div class="mb20">
                  <myUpload ref="uploadRef" />
                </div>
              </el-col>
            </el-row>
          </el-collapse-item>
        </div>

        <div class="form-card mt10" v-if="form.syncCustomer === '1'">
          <el-collapse-item name="6">
            <template v-slot:title>
              <FormCollapseItemTitle
                :title="$t('customer.project')"
                :warning="collapseWarningForProject"
              >
              </FormCollapseItemTitle>
            </template>
            <projectTable
              ref="projectTable"
              :addressList="addressList"
              :contactPersonList="contactPersonList"
              :comDisFrom="comDisFrom"
              @change="projectListChange"
              :businessPartnerMainId="form.businessPartnerMainId"
            />
          </el-collapse-item>
        </div>

        <div class="form-card mt10" v-if="!!form.customerId">
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

    <salesGroupDlg ref="salesGroupDlg" @onSuccess="updateSalesGroup" />

    <alikeCustomerDlg ref="alikeCustomerDlg" @onSuccess="cancel" />
  </FormPageLayout>
</template>

<script>
import {
  saveCustomer,
  queryCustomerById,
  updateCustomer,
  queryLikeCustomerList
} from '@/api/customerManagement/customer.js'

import AddressInfo from '@/views/customerManagement/prospectiveCustomer/components/AddressInfo.vue'
import ContactPersonInfo from '@/views/customerManagement/prospectiveCustomer/components/ContactPersonInfo.vue'
import ProjectTable from '@/views/customerManagement/prospectiveCustomer/components/ProjectTable.vue'

import salesGroupDlg from '@/views/customerManagement/prospectiveCustomer/components/salesGroupDlg.vue'
import CountrySelect from '@/components/select/countrySelect'
import alikeCustomerDlg from './alikeCustomerDlg'

import {
  getAllCustomerLabel,
  getAllCustomerTier
} from '@/api/system/systemSetup/customerTier'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
import { queryCurrencyListBySelect } from '@/api/basic/basic'

function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  mixins: [],
  components: {
    AddressInfo,
    ContactPersonInfo,
    ProjectTable,
    salesGroupDlg,
    CountrySelect,
    alikeCustomerDlg,
    SystemOperationLogTable
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
        customerName: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
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
        salesGroupName: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['change']
          }
        ],
        salesGroupUserId: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
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
      collapseWarningForAddressInfo: false,
      collapseWarningForContactPersonInfo: false,
      collapseWarningForProject: false,
      roleList: [],
      isView: undefined,
      lead_source: [],
      business_contact_person_title: [],
      labelList: [],
      customerTierList: [],
      salesGroupUserList: [],

      addressList: [],
      contactPersonList: [],
      projectList: [],
      currencyOptions: []
    }
  },

  created() {
    const { lead_source, business_contact_person_title } = this.useDict(
      'lead_source',
      'business_contact_person_title'
    )
    this.lead_source = lead_source || []
    this.business_contact_person_title = business_contact_person_title || []
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
  watch: {
    isSystemDocking: {
      handler(newVal) {
        this.isSystemDockingChange()
      },
      immediate: true
    },
    sysDockingSwitch: {
      handler(newVal) {
        this.isSystemDockingChange()
      },
      immediate: true
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
        return !this.editAuth || !this.form.customerName
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
    openSalesGroupTable() {
      this.$refs.salesGroupDlg.handleAdd()
    },
    updateSalesGroup(e) {
      const { salesGroupName, salesGroupId, salesGroupUserList } = e
      this.form.salesGroupId = salesGroupId
      this.form.salesGroupName = salesGroupName
      this.salesGroupUserList = salesGroupUserList
      this.form.salesGroupUserId = undefined
      this.form.salesGroupUserName = undefined
      this.$refs.formRef1.validateField('salesGroupName')
    },
    salesGroupClear() {
      this.form.salesGroupId = undefined
      this.form.salesGroupName = undefined
      this.salesGroupUserList = []
      this.form.salesGroupUserId = undefined
      this.form.salesGroupUserName = undefined
    },
    salesPersonChange(row) {
      this.form.salesGroupUserId = row.salesGroupUserId
      this.form.salesGroupUserName = row.salesGroupUserName
    },

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
      getAllCustomerTier().then(res => {
        const data = res.data || []
        const curList = this.form.tierIdList || []
        const list = data.filter(
          item => item.delFlag === '0' || curList.includes(item.tierId)
        )
        list.forEach(item => {
          item.value = item.tierId
          item.label = item.tierName
        })
        this.customerTierList = list
      })
    },
    isSystemDockingChange() {
      if (this.form.customerId) return
      if (this.sysDockingSwitch && this.isSystemDocking === '1') {
        this.form.syncCustomer = '1'
      } else {
        this.form.syncCustomer = '0'
      }
    },
    /* 系统对接开关 */
    syncCustomerChange() {
      this.addressList = []
      this.$refs.AddressInfoRef &&
        this.$refs.AddressInfoRef.initList(this.addressList)
      this.projectList = []
      this.$refs.projectTable &&
        this.$refs.projectTable.initList(this.projectList)
    },
    handleCountrySelect(row) {
      if (row) {
        const { id, name } = row
        this.form.country = name
        this.form.countryId = id
      }
    },
    /* 地址部分 */
    addressListChange(data) {
      this.addressList = data || []
      this.projectCustomerAddressList = []
      if (this.addressList.length > 0) {
        this.addressList.forEach(x => {
          if (x.projectIdList) {
            this.projectCustomerAddressList.push({
              customerAddressId: x.rowTimeId,
              projectId: x.projectIdList
            })
          }
        })
        this.handlerProject()
      } else {
        this.projectCustomerAddressList = []
        this.projectList.forEach(x => {
          x.customerAddressList = []
          x.siteAddress = ''
        })
      }
    },
    // 更新项目中的地址数据
    handlerProject() {
      this.projectList.forEach(x => {
        x.customerAddressList = []
        x.siteAddress = ''

        const arr = this.projectCustomerAddressList
          .filter(k => k.projectId === x.rowTimeId)
          .map(j => j.customerAddressId)
          .join(',')
        this.addressList.forEach(m => {
          if (arr.indexOf(m.rowTimeId) !== -1) {
            x.customerAddressList.push(m)
          }
        })

        x.siteAddress = this.siteAddressTitle(x.customerAddressList || [])
      })
      // this.$refs.projectTable && this.$refs.projectTable.initList(this.projectList)
    },
    siteAddressTitle(e) {
      if (!e || e.length <= 0) return ''
      let location = ''
      e.forEach(x => {
        const { country, provinceState, cityTown, address1, province, city } = x
        location +=
          address1 + '-' + city ||
          cityTown + '-' + province ||
          provinceState + '-' + country + ' / '
      })
      location = location.substring(0, location.length - 3)
      return location
    },
    contactPersonListChange(data, type) {
      this.contactPersonList = data || []
      if (type === 'delete') {
        // 删除 同步更新项目中绑定的项目联系人
        if (this.contactPersonList.length > 0) {
          const arr = this.contactPersonList.map(x => x.rowTimeId)
          this.projectList.forEach(x => {
            if (
              x.projectContactPersonList &&
              x.projectContactPersonList.length > 0
            ) {
              x.projectContactPersonList.forEach((k, j) => {
                if (arr.indexOf(k.rowTimeId) === -1) {
                  x.projectContactPersonList.splice(j, 1)
                }
              })
              x['projectContactPersonName'] = x.projectContactPersonList
                .map(m => m.contactPersonName)
                .join(',')
            } else {
              x.projectContactPersonList = []
              x.projectContactPersonName = ''
            }
          })
        } else {
          this.projectList.forEach(x => {
            x.projectContactPersonList = []
            x.projectContactPersonName = ''
          })
        }
      }
    },
    projectListChange(data) {
      this.projectList = data || []
      this.projectCustomerAddressList = []

      if (this.projectList.length > 0) {
        this.projectList.forEach(x => {
          x.customerAddressList.forEach(k => {
            this.projectCustomerAddressList.push({
              customerAddressId: k.rowTimeId,
              projectId: x.rowTimeId
            })
          })
        })
        this.handlerAddress()
      } else {
        this.projectCustomerAddressList = []
        this.addressList.forEach(x => {
          x.projectIdList = ''
        })
      }
    },
    // 更新地址中的项目数据
    handlerAddress() {
      this.addressList.forEach(x => {
        const arr = this.projectCustomerAddressList
          .filter(k => k.customerAddressId === x.rowTimeId)
          .map(j => j.projectId)
          .join(',')
        x.projectIdList = ''
        if (!arr || arr.length <= 0) return
        this.projectList.forEach(m => {
          if (arr.indexOf(m.rowTimeId) !== -1) {
            x.projectIdList = m.rowTimeId
          }
        })
      })
    },

    handleAdd() {
      this.reset()
      this.getAllCustomerLabel()
      this.queryCurrencyListBySelect()

      setTimeout(() => {
        if (this.sysDockingSwitch && this.isSystemDocking === '1') {
          this.form.syncCustomer = '1'
        } else {
          this.form.syncCustomer = '0'
        }
      }, 500)
    },
    handleUpdate() {
      this.reset()
      this.queryCurrencyListBySelect()
      const customerId = this.rowId
      queryCustomerById({ customerId }).then(response => {
        const data = response.data || {}
        const customerAddressList = data.customerAddressList || []
        customerAddressList.forEach(item => {
          item.rowTimeId = item.customerAddressId
        })

        const customerContactPersonList = data.customerContactPersonList || []
        customerContactPersonList.forEach(item => {
          item.rowTimeId = item.customerContactPersonId
        })

        const projectList = data.projectList || []
        projectList.forEach(x => {
          x.rowTimeId = x.projectId
          x.isNewProject = 0
          if (x.credit !== '1') {
            x.credit = '0'
          }
          x.projectContactPersonList &&
            x.projectContactPersonList.forEach(
              k => (k.rowTimeId = k.customerContactPersonId)
            )
        })

        this.addressList = customerAddressList
        this.contactPersonList = customerContactPersonList
        this.projectList = projectList
        this.projectCustomerAddressList = data.projectCustomerAddressList || []

        if (customerAddressList.length > 0) {
          this.handlerAddress()
          if (projectList.length > 0) {
            this.handlerProject()
          }
        }

        setTimeout(() => {
          this.$refs.AddressInfoRef &&
            this.$refs.AddressInfoRef.initList(this.addressList)
          this.$refs.ContactPersonInfoRef &&
            this.$refs.ContactPersonInfoRef.initList(customerContactPersonList)
          this.$refs.uploadRef &&
            this.$refs.uploadRef.initFileList(data.commonFileList || [])
          this.$refs.projectTable &&
            this.$refs.projectTable.initList(this.projectList)
        }, 300)

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

      if (this.rowId) {
        this.$tab.closeOpenPage({
          path: '/customerManagement/viewProspectiveCustomer',
          query: {
            id: this.rowId,
            timeId: Date.now()
          }
        })
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
        salesGroupUserId: undefined,
        salesGroupUserName: undefined,
        remarks: undefined,
        labelIdList: [],
        customerType: '1'
      }
      this.activeNames = ['1', '2', '3', '4', '5', '6', '7']
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForRegistrationInfo = false
      setTimeout(() => {
        if (this.$refs.uploadRef) {
          this.$refs.uploadRef.initFileList([])
        }
      }, 300)
      this.resetForm('formRef1')
    },

    submitForm: function () {
      console.log(saveCustomer)

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
          const myFileIds = this.$refs.uploadRef.getFileIds()
          if (myFileIds === false) {
            return
          }
          let param = { ...this.form }

          param.customerAddressList = this.addressList || []
          param.customerContactPersonList = this.contactPersonList || []
          param.projectCustomerAddressList =
            this.projectCustomerAddressList || []
          param.projectList = this.projectList || []

          param.customerAddressList.forEach(x => {
            if (!x.customerAddressId) {
              x.customerAddressId = x.rowTimeId
            }
          })

          param.customerContactPersonList.forEach(x => {
            if (!x.contactPersonId) {
              x.contactPersonId = x.rowTimeId
            }
          })

          param.projectList.forEach(x => {
            if (!x.projectId) {
              x.projectId = x.rowTimeId
            }
            if (x.customerAddressList && x.customerAddressList.length > 0) {
              x.customerAddressList.forEach(k => {
                if (!k.customerAddressId) {
                  k.customerAddressId = k.rowTimeId
                }
              })
            }
            if (
              x.projectContactPersonList &&
              x.projectContactPersonList.length > 0
            ) {
              x.projectContactPersonList.forEach(x => {
                if (!x.contactPersonId) {
                  x.contactPersonId = x.rowTimeId
                }
              })
            }
          })

          param.commonFileList = myFileIds
          param = this.$trimOfObj(JSON.parse(JSON.stringify(param)))
          delete param.labelIds
          delete param.labelList
          delete param.labelNames

          const siteAddress = param.projectList.find(item => {
            return !this.$resultOfBoolean(item.siteAddress)
          })
          if (siteAddress) {
            this.$modal.msgError(
              this.$t('ui.commonReqMsg').replace(
                '$1',
                this.$t('customer.projectAddress')
              )
            )
            this.activeName = 'customerInfo'
            this.collapseWarningForProject = true
            return
          }

          const projectContactPersonIdList = param.projectList.find(item => {
            return !this.$resultOfBoolean(item.projectContactPersonList)
          })
          if (projectContactPersonIdList) {
            this.$modal.msgError(
              this.$t('ui.commonReqMsg').replace(
                '$1',
                this.$t('customer.projectContactPersonName')
              )
            )
            this.activeName = 'customerInfo'
            this.collapseWarningForProject = true
            return
          }

          this.collapseWarningForProject = false

          if (!param.customerId) {
            queryLikeCustomerList(param).then(res => {
              const { data } = res
              if (data && data.length > 0) {
                this.$refs.alikeCustomerDlg.handleAdd(data, param)
              } else {
                this.$modal
                  .confirm(this.$t('customer.prospectiveCustomerConfirm'))
                  .then(() => {
                    return saveCustomer(param)
                  })
                  .then(response => {
                    this.$modal.msgSuccess(
                      this.$t('customer.prospectiveCustomerSuccess').replace(
                        '$1',
                        param.customerName
                      )
                    )
                    this.cancel()
                  })
                  .catch(() => {})
              }
            })
            return
          }

          this.$modal
            .confirm(this.$t('customer.prospectiveCustomerConfirm'))
            .then(() => {
              if (param.customerId) {
                return updateCustomer(param)
              }
            })
            .then(response => {
              this.$modal.msgSuccess(
                this.$t('customer.prospectiveCustomerSuccess').replace(
                  '$1',
                  param.customerName
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
