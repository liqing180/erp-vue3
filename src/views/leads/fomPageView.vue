<template>
  <el-collapse v-model="activeNames">
    <div class="form-card mb5">
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
          label-width="140px"
        >
          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.leadName')}`"
                prop="leadName"
              >
                <el-input
                  v-model="form.leadName"
                  :title="form.leadName"
                  maxlength="200"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.leadSource')}`"
                prop="leadSource"
              >
                <el-select
                  v-model="form.leadSource"
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
                :label="`${$t('customer.leadCode')}`"
                prop="leadCode"
              >
                <el-input
                  v-model="form.leadCode"
                  :title="form.leadCode"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('ui.mobilePhone')}`"
                prop="mobilePhone"
                ref="mobileNoRef"
              >
                <MobilePhoneInput
                  :disabled="true"
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
              <el-form-item
                :label="$t('customer.leadStatus')"
                prop="leadStatus"
              >
                <el-select
                  v-model="form.leadStatus"
                  placeholder=""
                  class="w100"
                  clearable
                  disabled
                >
                  <el-option
                    v-for="dict in lead_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('login.companyName')}`"
                prop="companyName"
              >
                <el-input
                  v-model.trim="form.companyName"
                  :title="form.companyName"
                  maxlength="200"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('ui.companyRegNo')}`"
                prop="businessRegNo"
              >
                <el-input
                  v-model.trim="form.businessRegNo"
                  :title="form.businessRegNo"
                  :disabled="comDisFrom"
                  maxlength="200"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`${$t('ui.website')}`" prop="website">
                <el-input
                  v-model.trim="form.website"
                  :title="form.website"
                  :disabled="comDisFrom"
                  maxlength="200"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item :label="$t('customer.label')" prop="labelIdList">
                <el-select
                  v-model="form.labelIdList"
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

            <el-col :span="8">
              <el-form-item
                :label="$t('customer.leadCategory')"
                prop="leadCategory"
              >
                <el-select
                  v-model="form.leadCategory"
                  placeholder=""
                  class="w100"
                  clearable
                >
                  <el-option
                    v-for="dict in lead_category"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('customer.nextContactTime')}`"
                prop="nextContactTimeDays"
              >
                <div class="flex">
                  <el-input-number
                    v-model="form.nextContactTimeDays"
                    :precision="0"
                    v-thousandSplit="{ precision: 0 }"
                    type="number"
                    class="form-wd textleft"
                    :min="1"
                    :max="999"
                    @change="inputNumberChange('nextContactTimeDays')"
                    style="width: 150px"
                    controls-position="right"
                  />
                  <div style="margin: 0 10px">{{ $t('customer.day') }}</div>
                  <el-date-picker
                    v-model="form.nextContactTimeDate"
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
    <div class="form-card mb5">
      <el-collapse-item name="2">
        <template v-slot:title>
          <FormCollapseItemTitle
            :title="$t('ui.addressInfo')"
            :warning="collapseWarningForAddressInfo"
          >
          </FormCollapseItemTitle>
        </template>
        <AddressInfo ref="AddressInfo" :comDisFrom="true" />
      </el-collapse-item>
    </div>

    <div class="form-card">
      <el-collapse-item name="3">
        <template v-slot:title>
          <FormCollapseItemTitle
            :title="$t('ui.contactPersonInfo')"
            :warning="collapseWarningForContactPersonInfo"
          >
          </FormCollapseItemTitle>
        </template>
        <el-form
          :model="form"
          :rules="rules"
          label-width="140px"
          :disabled="true"
          ref="form3"
        >
          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('ui.contactPersonName')}`"
                prop="contactPersonName"
              >
                <el-input
                  v-model="form.contactPersonName"
                  maxlength="200"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`${$t('ui.title')}`" prop="contactTitle">
                <el-select
                  v-model="form.contactTitle"
                  :title="form.contactTitle"
                  :disabled="comDisFrom"
                  placeholder=""
                  style="width: 100%"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="dict in business_contact_person_title"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('ui.position')}`"
                prop="contactPosition"
              >
                <el-autocomplete
                  style="width: 100%"
                  v-model="form.contactPosition"
                  :fetch-suggestions="queryPositionSugg"
                  placeholder
                  clearable
                  :maxlength="200"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item
                :label="`${$t('ui.mobilePhone')}`"
                prop="contactMobilePhone"
                ref="contactMobilePhone"
              >
                <MobilePhoneInput
                  v-model:mobileCode="form.contactMobileCode"
                  v-model:mobileNum="form.contactMobileNum"
                  v-model:mobileNo="form.contactMobilePhone"
                  :disabled="true"
                  @clearValidate="$refs.contactMobilePhone.clearValidate()"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`${$t('ui.email')}`" prop="contactEmail">
                <el-input
                  v-model.trim="form.contactEmail"
                  :title="form.contactEmail"
                  maxlength="200"
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
  saveLead,
  queryLeadById,
  updateLead,
  queryPositionList
} from '@/api/leads/leads'
import {
  getAllCustomerLabel,
  getAllCustomerTier
} from '@/api/system/systemSetup/customerTier'
import pageMixin from '@/mixins/tableMinx'
import AddressInfo from './components/AddressInfo'
function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  mixins: [pageMixin],
  components: {
    AddressInfo
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
      labelList: [],
      customerTierList: []
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
    this.queryPositionList()
    if (this.rowId) {
      this.handleUpdate()
    } else {
      this.handleAdd()
    }
  },
  activated() {
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
      this.getAllCustomerLabel()
    },
    handleUpdate() {
      this.reset()
      const leadId = this.rowId
      queryLeadById({ leadId }).then(response => {
        const data = response.data || {}
        this.form = data
        this.getAllCustomerLabel()
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
          countryId
        } = data
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
        })
      })
    },
    // 取消按钮
    cancel() {
      if (this.isView) {
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
      this.resetForm('form')
    },

    submitForm: function () {
      this.$refs.form.validate(valid => {
        this.collapseWarningForBasicInfo = !valid
        if (valid) {
          let param = this.$trimOfObj(JSON.parse(JSON.stringify(this.form)))
          const AddressInfo = this.$refs.AddressInfo.termForm || {}
          setTimeout(() => {
            console.log(AddressInfo, '===834')
          }, 1000)
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
