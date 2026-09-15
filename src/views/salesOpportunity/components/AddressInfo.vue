<template>
  <el-form
    :model="termForm"
    :rules="termFormRules"
    label-width="140px"
    :disabled="comDisFrom"
    ref="termForm"
  >
    <el-row>
      <el-col :span="8">
        <el-form-item :label="`${$t('mapLang.locationMap')}`" prop="latLng">
          <MapPointSelect
            :latLng="termForm.latLng"
            :address="termForm.addressMap"
            :dlgTitle="$t('mapLang.address')"
            :showLatLng="true"
            :splitCountry="true"
            :disabled="comDisFrom"
            @change="addressChange"
          />
        </el-form-item>
      </el-col>

      <el-col :span="8">
        <el-form-item :label="`${$t('ui.country')}`" prop="country">
          <el-select
            v-model="termForm.country"
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
      <el-col :span="8">
        <el-form-item :label="$t('mapLang.provinceState')" prop="province">
          <el-select
            v-model="termForm.province"
            :disabled="!termForm.country"
            :title="termForm.province"
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
    </el-row>

    <el-row>
      <el-col :span="8">
        <el-form-item :label="$t('mapLang.cityTown')" prop="city">
          <el-select
            v-model="termForm.city"
            :disabled="!termForm.country || !termForm.province"
            :title="termForm.city"
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
          <el-input v-model="termForm.postalCode" maxlength="200"></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <el-form-item :label="`${$t('ui.address')}`" prop="address">
          <el-input
            v-model="termForm.address"
            maxlength="200"
            :disabled="!termForm.latLng"
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import {
  queryCitiesByStatesName,
  queryStatesByCountriesName
} from '@/api/countries'
import { queryCountryListBySelect } from '@/api/basic/basic.js'

export default {
  components: {},
  props: {
    comDisFrom: {
      type: [Boolean],
      default: false
    },
    modifyHighlight: {
      type: [Boolean],
      default: false
    },
    cdsQc: {
      type: String,
      default: '0'
    },
    countryItem: {
      type: Object,
      default: () => {}
    },
    projectList: {
      type: Array,
      default: () => []
    },
    geofenceTypeRequired: {
      type: [Boolean],
      default: false
    }
  },
  computed: {
    sysDockingSwitch() {
      return this.$store.getters.sysDockingSwitch
    }
  },
  data() {
    const vm = this
    return {
      saveKey: '1',
      /* 表格表单部分 */
      termForm: {
        label: ''
      },
      termFormRules: {
        label: [
          {
            required: false,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        city: [
          {
            required: false,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        province: [
          {
            required: false,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        country: [
          {
            required: false,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        countryEn: [
          {
            required: false,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        geofenceType: [
          {
            required: false,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('mapLang.geofence')
            ),
            trigger: ['change']
          }
        ],
        latLng: [
          {
            required: false,
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
            required: false,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('mapLang.cityTown')
            ),
            trigger: ['change']
          }
        ],
        address: [
          {
            required: false,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ]
      },
      isTermEdit: false,
      editIndex: undefined,

      tableList: [],
      selected: [],
      sortableDom: undefined,
      rowIdKey: 'rowTimeId',
      visible: false,
      projectListCascader: [],
      countryList: [],
      provinceStateLoading: false,
      provinceStateList: [],
      cityTownLoading: false,
      cityTownList: [],
      btnLoading: false
    }
  },
  mounted() {
    this.handleResetTerm()
    this.getCountriesList()
  },
  methods: {
    init(params) {
      this.termForm = JSON.parse(JSON.stringify(params))
    },
    changeEmployeeNoSwitch(code) {
      this.termForm[code] = ''
      if (this.$refs.termForm) {
        this.$nextTick(() => {
          this.$refs.termForm.clearValidate(code)
        })
      }
    },
    handlerProjectListCascader() {
      this.projectListCascader = JSON.parse(JSON.stringify(this.projectList))
    },
    // 项目下拉变化
    projectChange(e) {},
    geofenceLatLngListChange(data) {
      // console.log(data, '===')
      this.termForm['geofencePolygonLatLng'] = ''
      this.termForm['geofencePolygonLatLngList'] = data.latLngList
      this.termForm['geofenceRadiusLatLng'] = data.circleLatLng
      this.termForm['geofenceRadius'] = data.circleRadius
      this.termForm['geofenceType'] = data.geofenceType
    },
    addressChange(row) {
      if (row.addressData) {
        this.termForm['country'] = row.addressData.country
        this.termForm['countryEn'] = row.addressData.country
        this.termForm['province'] =
          row.addressData.province || row.addressData.city
        this.termForm['city'] = row.addressData.city || row.addressData.province
        this.termForm['postalCode'] = row.addressData.postalCode

        const list = this.countryList.filter(
          x => x.en === this.termForm.country
        )
        this.termForm['countryId'] = list[0].id
      }
      // this.$set(this.termForm, 'address', row.address)
      // this.$set(this.termForm, 'address1', row.address)
      if (!this.termForm.address) {
        this.termForm['address'] = row.address
      }
      this.termForm['addressMap'] = row.address
      this.termForm['validAddress'] = row.address
      this.termForm['latLng'] = row.latLng
    },
    /* 国家相关操作 */
    getCountriesList() {
      queryCountryListBySelect().then(res => {
        this.countryList = res.data || []
      })
    },
    countryIdChange() {
      const list = this.countryList.filter(x => x.en === this.termForm.country)
      this.termForm['countryEn'] = list[0].en
      this.termForm['country'] = list[0].en
      this.termForm['countryId'] = list[0].id
      this.termForm['province'] = ''
      this.termForm['city'] = ''
      this.termForm['postalCode'] = ''
      this.termForm['latLng'] = ''
    },
    /* 省份相关操作 */
    provinceStateVisible(value) {
      if (value) {
        this.provinceStateLoading = true
        queryStatesByCountriesName({ countriesName: this.termForm.country })
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
      this.termForm['city'] = ''
      this.termForm['postalCode'] = ''
      this.termForm['latLng'] = ''
    },
    /* 城市相关操作 */
    cityTownVisible(value) {
      if (value) {
        this.cityTownLoading = true
        queryCitiesByStatesName({ statesName: this.termForm.province })
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
      this.termForm['postalCode'] = ''
      this.termForm['latLng'] = ''
      // this.termForm.city = this.termForm.cityTown
    },

    reset() {
      this.handleResetTerm()
    },
    handleResetTerm() {
      this.isTermEdit = false
      this.editIndex = undefined
      this.termForm = {
        address: '',
        addressMap: '',
        city: '',
        province: '',
        countryId: undefined,
        country: undefined,
        addressCode: undefined,
        latLng: undefined
      }

      setTimeout(() => {
        this.$refs.termForm && this.$refs.termForm.clearValidate()
      }, 200)
    },
    closed() {
      this.btnLoading = false
      this.handleResetTerm()
    }
  }
}
</script>
