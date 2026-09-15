<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        :disabled="fullscreenLoading"
        @click="submitForm"
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
              ref="createForm"
              :model="createForm"
              :rules="createRules"
              label-width="195px"
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.branchCompany')}`"
                    prop="branchCompanyName"
                  >
                    <el-input
                      v-model="createForm.branchCompanyName"
                      :title="createForm.branchCompanyName"
                      class="form-wd"
                      maxlength="200"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.email')}`"
                    prop="email"
                  >
                    <el-input
                      v-model.trim="createForm.email"
                      :title="createForm.email"
                      class="form-wd"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('organization.legalEntity')}`">
                    <el-input
                      v-model="createForm.legalEntity"
                      :title="createForm.legalEntity"
                      disabled
                      class="form-wd"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.pic')}`"
                    prop="picUserName"
                  >
                    <SelectInput
                      :value="createForm.picUserName"
                      :title="createForm.picUserName"
                      @clear="picUserNameClear"
                      clearable
                      @click="openPicTable"
                      class="form-wd"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.fax')}`"
                    prop="fax"
                    ref="faxRef"
                  >
                    <MobilePhoneInput
                      v-model:mobileCode="createForm.faxCode"
                      v-model:mobileNum="createForm.fax"
                      v-model:mobileNo="createForm.faxPhone"
                      @clearValidate="$refs.faxRef.clearValidate()"
                    />
                    <!-- <el-input v-model="createForm.fax" :maxlength="50" class="form-wd" /> -->
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('organization.landlineNumber')}`">
                    <el-input
                      v-model="createForm.landlineNumber"
                      :maxlength="50"
                      class="form-wd"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.currency')}`"
                    prop="currency"
                  >
                    <CountryCurrencySelect
                      :value="createForm.currency"
                      class="form-wd"
                      :cur-path="curPath"
                      @select="handleCurrencyChange"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.website')}`"
                    prop="website"
                  >
                    <el-input
                      v-model="createForm.website"
                      :maxlength="100"
                      class="form-wd"
                    />
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
                :title="$t('organization.titleAddress')"
                :warning="collapseWarningForTitleAddress"
              >
              </FormCollapseItemTitle>
            </template>
            <div>
              <el-form
                ref="addressForm"
                :model="addressForm"
                :rules="addressRules"
                label-width="195px"
              >
                <el-row class="mt22">
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('organization.address1')}`"
                      prop="address1"
                    >
                      <el-input
                        v-model="addressForm.address1"
                        :maxlength="500"
                        class="form-wd"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('organization.address2')}`"
                      prop="address2"
                    >
                      <el-input
                        v-model="addressForm.address2"
                        :maxlength="500"
                        class="form-wd"
                      />
                    </el-form-item>
                  </el-col>

                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('organization.province')}`"
                      prop="province"
                    >
                      <el-input
                        v-model="addressForm.province"
                        :maxlength="200"
                        class="form-wd"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('organization.city')}`"
                      prop="city"
                    >
                      <el-input
                        v-model="addressForm.city"
                        :maxlength="200"
                        class="form-wd"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('organization.location')}`"
                      prop="location"
                    >
                      <el-input
                        v-model="addressForm.location"
                        :maxlength="200"
                        class="form-wd"
                      />
                    </el-form-item>
                  </el-col>

                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('organization.postalCode')}`"
                      prop="postalCode"
                    >
                      <el-input
                        v-model="addressForm.postalCode"
                        :maxlength="20"
                        placeholder=""
                        class="form-wd"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('organization.country')}`"
                      prop="country"
                    >
                      <country-select
                        v-model="addressForm.country"
                        class="form-wd"
                        @select="handleCountrySelect2"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <el-form-item :label="`${$t('ui.remarks')}`" prop="remarks">
                      <el-input
                        type="textarea"
                        v-model="addressForm.remarks"
                        :autosize="{ minRows: 2, maxRows: 4 }"
                        resize="none"
                        show-word-limit
                        :maxlength="3000"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>
    <selectPicTable ref="selectPicTable" @updatePic="updatePic" />
  </FormPageLayout>
</template>

<script>
import {
  saveBranchCompany,
  queryLegalEntityById
} from '@/api/organization/corporate'
import CountryCurrencySelect from '@/components/select/countryCurrencySelect.vue'
import countrySelect from '@/components/select/countrySelect'
import selectPicTable from '@/views/organization/corporate/selectPicTable.vue'
function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  name: 'AddBranchCompany',
  components: {
    CountryCurrencySelect,
    selectPicTable,
    countrySelect
  },
  data() {
    const vm = this
    const validWebsite = (rule, value, callback) => {
      if (value && !isWebsite(value)) {
        callback(new Error(vm.$t('organization.validWebsite')))
      } else {
        callback()
      }
    }

    return {
      fullscreenLoading: false,
      // 一定要放在当前文件
      curPath: this.$options.__file,

      propVal: 'currencyCode',

      createForm: {
        createdBy: this.$store.state.user.nickName
      },
      createRules: {
        branchCompanyName: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],

            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ],

        phoneNo1: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],

        companyRegNo: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],

            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ],

        website: [
          {
            validator: validWebsite,
            trigger: ['blur', 'change']
          }
        ],

        email: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
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
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ]
      },

      addressForm: {},
      addressRules: {
        address1: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],

            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ],

        province: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],

            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ],

        city: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],

            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ],

        country: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ]
      },
      activeNames: ['1', '2'],
      isInit: true,
      timeId: '',
      collapseWarningForBasicInfo: false,
      collapseWarningForTitleAddress: false
    }
  },

  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  created() {
    const vm = this
    vm.createForm.creatorName = this.$store.state.user.nickName
    const query = vm.$route.query
    this.timeId = this.$route.query.timeId
    vm.createForm = Object.assign(vm.createForm, query)
    this.handleAdd()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.reset()
      const query = this.$route.query
      this.createForm = Object.assign(this.createForm, query)
      this.handleAdd()
    }
  },
  methods: {
    handleAdd() {
      queryLegalEntityById(this.createForm.legalEntityId).then(res => {
        // vm.fullscreenLoading = false
        const data = res.data || {}
        const legalEntityAddress = data.legalEntityAddress || {}
        this.createForm['legalEntity'] = data.legalEntityName
        this.addressForm['country'] = legalEntityAddress.country
        this.addressForm['countryId'] = legalEntityAddress.countryId
        this.createForm['currency'] = data.currency
      })
    },
    changeInputNum(num) {
      // const reg = /^[0-9]*$/g
      num = num.replace(/[^\d]/g, '').replace(/\s/g, '')
      return num
    },
    // 清空pic
    picUserNameClear() {
      this.createForm['picUserName'] = undefined
      this.createForm['picUserId'] = undefined
      this.createForm['mobilePhone'] = undefined
      this.createForm['mobileCode'] = undefined
      this.createForm['mobileNum'] = undefined
    },
    // 打开pic弹窗
    openPicTable() {
      this.$refs.selectPicTable.handleOpen()
    },
    updatePic(row) {
      const { nickName, userId, mobilePhone, mobileCode, mobileNum } = row
      this.createForm['picUserName'] = nickName
      this.createForm['picUserId'] = userId
      this.createForm['mobilePhone'] = mobilePhone
      this.createForm['mobileCode'] = mobileCode
      this.createForm['mobileNum'] = mobileNum
    },
    reset() {
      this.createForm = {
        branchCompanyName: '',
        picUserName: '',
        picUserId: '',
        mobilePhone: '',
        mobileCode: '',
        mobileNum: '',
        email: '',
        website: '',
        fax: '',
        createdBy: this.$store.state.user.nickName
      }
      this.addressForm = {
        address1: '',
        address2: '',
        province: '',
        location: '',
        postalCode: '',
        city: '',
        country: undefined,
        countryId: undefined,
        remarks: ''
      }
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForTitleAddress = false

      this.activeNames = ['1', '2']
      this.resetForm('createForm')
      this.resetForm('addressForm')
    },

    handleCountrySelect2(row) {
      if (row) {
        const { id, name } = row
        this.addressForm['country'] = name
        this.addressForm['countryId'] = id
      }
    },

    handleCurrencyChange(row) {
      this.$nextTick(() => {
        this.createForm['currencyId'] = row.id || ''
        this.createForm['currency'] =
          `${row.currencyCode} (${row.currencyDesc})`
        this.createForm['currencyCode'] = row.currencyCode
      })
    },

    saveBranchCompany(param) {
      const vm = this
      vm.fullscreenLoading = true
      saveBranchCompany(param)
        .then(res => {
          vm.$message.success(
            `${vm
              .$t('organization.branchCompanySuccess')
              .replace('$1', param.branchCompanyName)}`
          )
          this.cancel()
          vm.fullscreenLoading = false
        })
        .catch(() => {
          vm.fullscreenLoading = false
        })
    },
    // 取消按钮
    cancel() {
      const obj = { path: '/organization/corporate' }
      this.$tab.closeOpenPage(obj)
    },
    submitForm() {
      const vm = this
      this.$refs.createForm.validate(valid => {
        this.collapseWarningForBasicInfo = !valid
        if (valid) {
          vm.$refs.addressForm.validate(addressFormValid => {
            this.collapseWarningForTitleAddress = !addressFormValid
            if (!addressFormValid) {
              this.$message.error(
                this.$t('ui.fromIncomplete').replace(
                  '$1',
                  this.$t('organization.titleAddress')
                )
              )
              return
            }
            this.$modal
              .confirm(vm.$t('organization.branchCompanyConfirm'))
              .then(() => {
                const param = JSON.parse(JSON.stringify(vm.createForm))
                param.branchCompanyAddress = JSON.parse(
                  JSON.stringify(vm.addressForm)
                )
                vm.saveBranchCompany(param)
              })
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
