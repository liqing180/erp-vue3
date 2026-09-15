<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="title"
    v-model="dialogTableVisible"
    width="1200px"
    top="5vh"
    @close="close"
    append-to-body
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="180px"
      :disabled="!!form.salesOpportunityActivityId && form.isCanSave !== '1'"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item
            :label="`${$t('customer.activityType')}`"
            prop="activityType"
          >
            <el-select
              v-model="form.activityType"
              placeholder=" "
              clearable
              @change="activityTypeChange"
              :disabled="!!form.salesOpportunityActivityId"
            >
              <el-option
                v-for="dict in activity_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            :label="`${$t('customer.activityName')}`"
            prop="activityId"
          >
            <el-select
              v-model="form.activityId"
              placeholder=" "
              clearable
              :disabled="!form.activityType"
              @change="activityNameChange"
              v-if="!form.salesOpportunityActivityId"
            >
              <el-option
                v-for="dict in activityList"
                :key="dict.activityId"
                :label="dict.activityName"
                :value="dict.activityId"
              />
            </el-select>
            <el-input
              :value="form.activityName"
              :title="form.activityName"
              disabled
              v-else
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            :label="`${$t('customer.activityCode')}`"
            prop="salesOpportunityActivityCode"
          >
            <el-input
              v-model="form.salesOpportunityActivityCode"
              :title="form.salesOpportunityActivityCode"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            :label="$t('SALES.activityPercentage')"
            prop="percentage"
          >
            <el-input-number
              class="w100"
              v-model="form.percentage"
              controls-position="right"
              placeholder=""
              :min="1"
              :max="100"
              @change="inputNumberChange('percentage')"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            :label="`${$t('customer.startDateTime')}`"
            prop="activityStartTime"
            class="error"
          >
            <el-date-picker
              v-model="form.activityStartTime"
              :editable="false"
              type="datetime"
              :format="fmtForYmdhm"
              value-format="x"
              class="form-wd"
              placeholder
              style="width: 100%"
            ></el-date-picker>
            <template #error v-if="startError">
              <div
                style="
                  width: auto;
                  max-width: 300px;
                  color: #f56c6c;
                  line-height: 1;
                  padding-top: 2px;
                "
              >
                <span>{{ startError }}</span>
              </div>
            </template>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            :label="`${$t('customer.endDateTime')}`"
            prop="activityEndTime"
            class="error"
          >
            <el-date-picker
              v-model="form.activityEndTime"
              :editable="false"
              type="datetime"
              :format="fmtForYmdhm"
              value-format="x"
              class="form-wd"
              placeholder
              style="width: 100%"
            ></el-date-picker>
            <template #error v-if="endError">
              <div
                style="
                  width: auto;
                  max-width: 300px;
                  color: #f56c6c;
                  line-height: 1;
                  padding-top: 2px;
                "
              >
                <span>{{ endError }}</span>
              </div>
            </template>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('ui.description')">
            <el-input
              type="textarea"
              v-model="form.description"
              :autosize="{ minRows: 1, maxRows: 4 }"
              resize="none"
              show-word-limit
              :maxlength="3000"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            :label="`${$t('customer.contactPerson')}`"
            prop="contactPersonId"
          >
            <el-select
              v-model="form.contactPersonId"
              placeholder=""
              style="width: 100%"
              clearable
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
            :label="`${$t('customer.contactPersonEmail')}`"
            prop="contactEmail"
          >
            <el-input
              v-model.trim="form.contactEmail"
              :title="form.contactEmail"
              maxlength="200"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            :label="`${$t('customer.contactPersonMobilePhone2')}`"
            prop="contactMobilePhone"
            ref="contactMobilePhone"
          >
            <MobilePhoneInput
              v-model:mobileCode="form.contactMobileCode"
              v-model:mobileNum="form.contactMobileNum"
              v-model:mobileNo="form.contactMobilePhone"
              @clearValidate="$refs.contactMobilePhone.clearValidate()"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item :label="`${$t('customer.subject1')}`" prop="subject">
            <el-input
              v-model="form.subject"
              :title="form.subject"
              maxlength="200"
              :disabled="!!form.salesOpportunityActivityId"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('ui.content')">
            <el-input
              type="textarea"
              v-model="form.content"
              :autosize="{ minRows: 4, maxRows: 4 }"
              resize="none"
              show-word-limit
              :maxlength="3000"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            :label="`${$t('SALES.nextActivity')}`"
            prop="nextActivityName"
          >
            <el-input
              v-model="form.nextActivityName"
              :title="form.nextActivityName"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item
            :label="`${$t('mapLang.locationMap')}`"
            prop="activityLatLng"
          >
            <MapPointSelect
              :latLng="form.activityLatLng"
              :address="form.activityAddress"
              :dlgTitle="$t('mapLang.address')"
              :showLatLng="true"
              :splitCountry="true"
              :disabled="
                !!form.salesOpportunityActivityId && form.isCanSave !== '1'
              "
              @change="addressChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="`${$t('ui.country')}`" prop="activityCountry">
            <el-select
              v-model="form.activityCountry"
              placeholder=""
              clearable
              @change="countryIdChange"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="dict in countryList"
                :key="dict.en"
                :label="dict.en"
                :value="dict.en"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            :label="$t('mapLang.provinceState')"
            prop="activityProvince"
          >
            <el-select
              v-model="form.activityProvince"
              :disabled="!form.activityCountry"
              :title="form.activityProvince"
              :loading="provinceStateLoading"
              @change="provinceStateChange"
              @visible-change="provinceStateVisible"
              placeholder=""
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in provinceStateList"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('mapLang.cityTown')" prop="activityCity">
            <el-select
              v-model="form.activityCity"
              :disabled="!form.activityCountry || !form.activityProvince"
              :title="form.activityCity"
              :loading="cityTownLoading"
              @change="cityTownChange"
              @visible-change="cityTownVisible"
              placeholder=""
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in cityTownList"
                :key="item.name"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="`${$t('ui.postalCode')}`">
            <el-input
              v-model="form.activityPostalCode"
              maxlength="200"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item :label="`${$t('ui.address')}`" prop="activityAddress">
            <el-input
              v-model="form.activityAddress"
              maxlength="200"
              :disabled="!form.activityLatLng"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="dialogTableVisible = false">{{
          $t('uiBtn.back')
        }}</el-button>

        <el-button
          v-if="!!form.salesOpportunityActivityId && form.isCanCancel === '1'"
          @click="cancelForm"
          >{{ $t('uiBtn.cancel') }}</el-button
        >

        <el-button
          v-if="!form.salesOpportunityActivityId || form.isCanComplete === '1'"
          @click="completeForm"
          >{{ $t('customer.complete') }}</el-button
        >

        <el-button
          type="primary"
          v-if="!form.salesOpportunityActivityId"
          @click="submitForm"
          >{{ $t('uiBtn.submit') }}</el-button
        >
        <el-button
          type="primary"
          v-if="!!form.salesOpportunityActivityId && form.isCanSave === '1'"
          @click="saveForm"
          >{{ $t('uiBtn.save') }}</el-button
        >
      </div>
    </template>

    <competitorDlg ref="competitorDlg" @onSuccess="competitorUpdate" />
  </el-dialog>
</template>

<script>
import competitorDlg from './competitorDlg.vue'
import {
  queryCanSelectCustomerList,
  queryActiveActivityListByStageId,
  submitSalesOpportunityActivity,
  queryActivityById,
  complete,
  cancelActivity
} from '@/api/salesOpportunity/salesOpportunity'
import {
  queryCitiesByStatesName,
  queryStatesByCountriesName
} from '@/api/countries'
import { queryCustomerById } from '@/api/customerManagement/customer.js'

import { queryCountryListBySelect } from '@/api/basic/basic.js'
function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  components: {
    competitorDlg
  },
  props: {
    comDisFrom: {
      type: Boolean,
      default: false
    },
    query: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    const validWebsite = (rule, value, callback) => {
      if (value && !isWebsite(value)) {
        callback(new Error(vm.$t('ui.validWebsite')))
      } else {
        callback()
      }
    }
    const validStartDate = (rule, value, callback) => {
      let startTime = value
      let endTime = vm.form.activityEndTime
      let createdTime = vm.query.createdTime
      if (!startTime) {
        this.startError = this.$t('ui.reqMsg')
        callback(new Error(this.$t('ui.reqMsg')))
        return
      }
      if (typeof startTime === 'number') {
        startTime = new Date(startTime)
      }
      if (endTime && typeof endTime === 'number') {
        endTime = new Date(endTime)
      }
      if (createdTime && typeof createdTime === 'number') {
        createdTime = new Date(createdTime)
      }
      if (endTime && startTime - endTime >= 0) {
        this.startError = this.$t('customer.startLessEnd')
        callback(new Error(this.$t('customer.startLessEnd')))
      } else if (createdTime && createdTime - startTime > 0) {
        this.startError = this.$t('customer.startGreaterOpportunityDate')
        callback(new Error(this.$t('customer.startGreaterOpportunityDate')))
      } else {
        this.startError = ''
        callback()
      }
    }
    const validEndDate = (rule, value, callback) => {
      let endTime = value
      let startTime = vm.form.activityStartTime
      // if (!startTime) {
      //   callback()
      // }
      if (!endTime) {
        this.endError = this.$t('ui.reqMsg')
        callback(new Error(this.$t('ui.reqMsg')))
        return
      }
      if (typeof startTime === 'number') {
        startTime = new Date(startTime)
      }
      if (typeof endTime === 'number') {
        endTime = new Date(endTime)
      }

      if (endTime - startTime <= 0) {
        this.endError = this.$t('customer.endGreaterStart')
        callback(new Error(this.$t('customer.endGreaterStart')))
      } else {
        this.endError = ''
        callback()
      }
    }
    return {
      startError: '',
      endError: '',
      dialogTableVisible: false,
      loading: false,
      salesOpportunityIdList: [],
      form: {},
      rules: {
        activityStartTime: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          },
          {
            validator: validStartDate,
            trigger: ['blur', 'change']
          }
        ],
        activityEndTime: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          },
          {
            validator: validEndDate,
            trigger: ['blur', 'change']
          }
        ],
        activityType: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['change']
          }
        ],
        activityId: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['change']
          }
        ],
        contactPersonId: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['change']
          }
        ],
        subject: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['change', 'blur']
          }
        ],
        treatLevel: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['blur', 'change']
          }
        ],
        website: [
          {
            validator: validWebsite,
            trigger: ['blur', 'change']
          }
        ],
        label: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        activityCity: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        activityProvince: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        activityCountry: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        countryEn: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        geofenceType: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('mapLang.geofence')
            ),
            trigger: ['change']
          }
        ],
        activityLatLng: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('mapLang.locationMap')
            ),
            trigger: ['change', 'blur']
          }
        ],
        cityTown: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('mapLang.cityTown')
            ),
            trigger: ['change']
          }
        ],
        activityAddress: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ]
      },
      treat_level: [],
      salesGroupUserList: [],
      activity_type: [],
      countryList: [],
      provinceStateLoading: false,
      provinceStateList: [],
      cityTownLoading: false,
      cityTownList: [],
      btnLoading: false,
      customerContactPersonList: [],
      activityList: [],
      title: '',
      activityId: undefined
    }
  },
  computed: {
    setSize() {
      return this.$store.getters.size
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhm() {
      return this.$store.getters.fmtForYmdhm
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  methods: {
    activityTypeChange() {
      if (this.form.activityType) {
        this.queryActiveActivityListByStageId()
      }
      this.form.activityId = undefined
      this.activityNameClear()
    },
    activityNameChange() {
      const { activityId } = this.form
      if (activityId) {
        const {
          activityName,
          nextActivityId,
          nextActivityName,
          percentage,
          description
        } = this.activityList.filter(x => x.activityId === activityId)[0]
        this.form.activityName = activityName
        this.form.nextActivityId = nextActivityId
        this.form.nextActivityName = nextActivityName
        this.form.percentage = percentage
        this.form.description = description
      } else {
        this.activityNameClear()
      }
    },
    activityNameClear() {
      this.form.activityName = undefined
      this.form.nextActivityId = undefined
      this.form.nextActivityName = undefined
      this.form.percentage = undefined
    },
    queryActiveActivityListByStageId() {
      queryActiveActivityListByStageId({
        salesOpportunityId: this.query.salesOpportunityId,
        currentOpportunityStageId: this.query.currentOpportunityStageId,
        activityType: this.form.activityType
      }).then(res => {
        this.activityList = res.data || []
      })
    },
    queryCanSelectCustomerList() {
      // queryCanSelectCustomerList({}).then(response => {
      //   let list = response.data
      //   const { customerContactPersonList } =
      //     list.filter(x => x.customerId === this.query.customerId)[0] || {}
      //   this.customerContactPersonList = customerContactPersonList || []
      //   if (!this.form.contactPersonId && !this.activityId) {
      //     this.form.contactPersonId = this.query.customerContactPersonId
      //   }
      //   this.contactPersonNameChange()
      // })

      queryCustomerById({ customerId: this.query.customerId }).then(
        response => {
          const { customerContactPersonList } = response.data || {}
          this.customerContactPersonList = (
            customerContactPersonList || []
          ).filter(x => x.isActive === '1')
          if (!this.form.contactPersonId && !this.activityId) {
            this.form.contactPersonId = this.query.customerContactPersonId
          }
          this.contactPersonNameChange()
        }
      )
    },

    // 更新客户联系人
    contactPersonNameChange() {
      const { contactPersonId } = this.form
      if (contactPersonId) {
        const row = this.customerContactPersonList.filter(
          x => x.customerContactPersonId === contactPersonId
        )
        if (row && row.length > 0) {
          const {
            contactPersonName,
            mobileCode,
            mobilePhone,
            mobileNum,
            email
          } = row[0]
          this.form.contactPersonName = contactPersonName
          this.form.contactMobileCode = mobileCode
          this.form.contactMobileNum = mobileNum
          this.form.contactMobilePhone = mobilePhone
          this.form.contactEmail = email
        } else {
          this.contactPersonNameClear()
        }
      } else {
        this.contactPersonNameClear()
      }
    },
    // 清空客户联系人
    contactPersonNameClear() {
      this.form.contactPersonId = undefined
      this.form.contactPersonName = undefined
      this.form.contactMobileCode = undefined
      this.form.contactMobileNum = undefined
      this.form.contactMobilePhone = undefined
      this.form.contactEmail = undefined
    },
    // 活动名称
    activityNameOpen() {
      this.$refs.competitorDlg.handleAdd()
    },
    // 更新活动名称
    activityNameUpdate() {},

    openSelectCompetitorName() {
      this.$refs.competitorDlg.handleAdd()
    },
    competitorUpdate(row) {
      this.form = JSON.parse(JSON.stringify(row))
    },
    competitorNameClear() {},
    handleCountrySelect(row) {
      if (row) {
        const { id, name } = row
        this.form.activityCountry = name
        this.form.activityCountryId = id
      }
    },
    reset() {
      this.form = {}
      this.activityId = undefined
      this.salesGroupUserList = []
      this.resetForm('form')
    },
    close() {
      this.reset()
      this.dialogTableVisible = false
    },
    handleAdd(ids) {
      this.reset()
      this.title = this.$t('menu.addActivity')
      this.getCountriesList()
      const { activity_type } = this.useDict('activity_type')
      this.activity_type = activity_type || []
      this.queryCanSelectCustomerList()
      this.dialogTableVisible = true
    },
    handlerUpdate(id) {
      this.reset()
      this.activityId = id
      this.title = this.$t('menu.editActivity')
      this.getCountriesList()
      const { activity_type } = this.useDict('activity_type')
      this.activity_type = activity_type || []
      this.dialogTableVisible = true
      this.queryActivityById(id)
    },
    queryActivityById(id) {
      queryActivityById(id).then(res => {
        this.form = res.data || {}
        this.queryCanSelectCustomerList()
      })
    },
    geofenceLatLngListChange(data) {
      // console.log(data, '===')
      this.form['geofencePolygonLatLng'] = ''
      this.form['geofencePolygonLatLngList'] = data.latLngList
      this.form['geofenceRadiusLatLng'] = data.circleLatLng
      this.form['geofenceRadius'] = data.circleRadius
      this.form['geofenceType'] = data.geofenceType
    },
    addressChange(row) {
      if (row.addressData) {
        this.form['activityCountry'] = row.addressData.country
        this.form['countryEn'] = row.addressData.country
        this.form['activityProvince'] =
          row.addressData.province || row.addressData.city
        this.form['activityCity'] =
          row.addressData.city || row.addressData.province
        this.form['activityPostalCode'] = row.addressData.postalCode

        const list = this.countryList.filter(
          x => x.en === this.form.activityCountry
        )
        this.form['activityCountryId'] = list[0].id
      }
      // this.$set(this.form, 'address', row.address)
      // this.$set(this.form, 'address1', row.address)
      if (!this.form.activityAddress) {
        this.form['activityAddress'] = row.address
      }
      this.form['addressMap'] = row.address
      this.form['validAddress'] = row.address
      this.form['activityLatLng'] = row.latLng
    },
    /* 国家相关操作 */
    getCountriesList() {
      queryCountryListBySelect().then(res => {
        this.countryList = res.data || []
      })
    },
    countryIdChange() {
      const list = this.countryList.filter(
        x => x.en === this.form.activityCountry
      )
      this.form['countryEn'] = list[0].en
      this.form['activityCountry'] = list[0].en
      this.form['activityCountryId'] = list[0].id
      this.form['activityProvince'] = ''
      this.form['activityCity'] = ''
      this.form['activityPostalCode'] = ''
      this.form['activityLatLng'] = ''
    },
    /* 省份相关操作 */
    provinceStateVisible(value) {
      if (value) {
        this.provinceStateLoading = true
        queryStatesByCountriesName({ countriesName: this.form.activityCountry })
          .then(res => {
            this.provinceStateList = res.data || []
            this.provinceStateLoading = false
          })
          .catch(() => {
            this.provinceStateLoading = false
          })
      }
    },
    provinceStateChange() {
      this.form['activityCity'] = ''
      this.form['activityPostalCode'] = ''
      this.form['activityLatLng'] = ''
    },
    /* 城市相关操作 */
    cityTownVisible(value) {
      if (value) {
        this.cityTownLoading = true
        queryCitiesByStatesName({ statesName: this.form.activityProvince })
          .then(res => {
            this.cityTownList = res.data || []
            this.cityTownLoading = false
          })
          .catch(() => {
            this.cityTownLoading = false
          })
      }
    },
    cityTownChange() {
      this.form['activityPostalCode'] = ''
      this.form['activityLatLng'] = ''
      // this.form.city = this.form.cityTown
    },
    cancelForm() {
      const params = JSON.parse(JSON.stringify(this.form))
      params.salesOpportunityId = this.query.salesOpportunityId
      params.salesOpportunityName = this.query.salesOpportunityName
      params.salesOpportunityNo = this.query.salesOpportunityNo

      this.$modal
        .confirm(
          this.$t('customer.activityCancel').replace('$1', params.activityName)
        )
        .then(() => {
          return cancelActivity(params)
        })
        .then(response => {
          this.$modal.msgSuccess(
            this.$t('customer.activityCancelSuccess').replace(
              '$1',
              params.activityName
            )
          )
          this.$emit('onSuccess')
          this.close()
        })
        .catch(() => {})
    },
    completeForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.form.content || !this.form.content.trim()) {
            this.$message.error(this.$t('customer.contentIsRequire'))
            return
          }
          const params = JSON.parse(JSON.stringify(this.form))

          params.salesOpportunityId = this.query.salesOpportunityId
          params.salesOpportunityName = this.query.salesOpportunityName
          params.salesOpportunityNo = this.query.salesOpportunityNo

          this.$modal
            .confirm(
              this.$t('customer.activityComplete').replace(
                '$1',
                params.activityName
              )
            )
            .then(() => {
              return complete(params)
            })
            .then(response => {
              if (params.nextActivityName) {
                this.$modal.msgSuccess(
                  this.$t('customer.nextActivitySuccess')
                    .replace('$1', params.activityName)
                    .replace('$2', params.nextActivityName)
                )
              } else {
                this.$modal.msgSuccess(
                  this.$t('customer.activityCompleteSuccess').replace(
                    '$1',
                    params.activityName
                  )
                )
              }

              this.$emit('onSuccess')
              this.close()
            })
            .catch(() => {})
        }
      })
    },
    saveForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))

          params.salesOpportunityId = this.query.salesOpportunityId
          params.salesOpportunityName = this.query.salesOpportunityName
          params.salesOpportunityNo = this.query.salesOpportunityNo

          this.$modal
            .confirm(
              this.$t('customer.activitySave').replace(
                '$1',
                params.activityName
              )
            )
            .then(() => {
              return submitSalesOpportunityActivity(params)
            })
            .then(response => {
              this.$modal.msgSuccess(
                this.$t('customer.activitySaveSuccess').replace(
                  '$1',
                  params.activityName
                )
              )
              this.$emit('onSuccess')
              this.close()
            })
            .catch(() => {})
        }
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))

          params.salesOpportunityId = this.query.salesOpportunityId
          params.salesOpportunityName = this.query.salesOpportunityName
          params.salesOpportunityNo = this.query.salesOpportunityNo

          this.$modal
            .confirm(
              this.$t('customer.activitySubmit').replace(
                '$1',
                params.activityName
              )
            )
            .then(() => {
              return submitSalesOpportunityActivity(params)
            })
            .then(response => {
              this.$modal.msgSuccess(
                this.$t('customer.activitySuccess').replace(
                  '$1',
                  params.activityName
                )
              )
              this.$emit('onSuccess')
              this.close()
            })
            .catch(() => {})
        }
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
.error :deep(.el-form-item__error) {
  z-index: 9;
}
</style>
