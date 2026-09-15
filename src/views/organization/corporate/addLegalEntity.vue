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
                    :label="`${$t('organization.legalEntityName')}`"
                    prop="legalEntityName"
                  >
                    <el-input
                      v-model="createForm.legalEntityName"
                      maxlength="200"
                      class="form-wd"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.businessGroupName')}`"
                    prop="businessGroupName"
                  >
                    <el-input
                      v-model="createForm.businessGroupName"
                      :title="createForm.businessGroupName"
                      class="form-wd"
                      disabled
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('ui.localization')}`"
                    prop="localization"
                  >
                    <el-select
                      v-model="createForm.localization"
                      clearable
                      placeholder=""
                      style="width: 100%"
                      class="log-msg-ellipsis"
                    >
                      <el-option
                        v-for="dict in sys_localization"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>

                <!-- <el-col :span="8">
                        <el-form-item
                          :label="`${$t('organization.legalEntityCode')}`"
                          prop="legalEntityNo"
                        >
                          <el-input
                            v-model="createForm.legalEntityNo"
                            :title="createForm.legalEntityNo"
                            class="form-wd"
                            disabled
                          />
                        </el-form-item>
                      </el-col> -->
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.companyRegNo')}`"
                    prop="companyRegNo"
                  >
                    <el-input
                      v-model.trim="createForm.companyRegNo"
                      class="form-wd"
                      :maxlength="30"
                    />

                    <!-- @input="(e) => (createForm.companyRegNo = changeInputNum(e))"  -->
                  </el-form-item>
                </el-col>

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
                  <el-form-item :label="`${$t('organization.landlineNumber')}`">
                    <el-input
                      v-model="createForm.landlineNumber"
                      :maxlength="50"
                      class="form-wd"
                    />
                    <!-- <MobilePhoneInput
                            :mobileCode.sync="createForm.faxCode"
                            :mobileNum.sync="createForm.landlineNumber"
                            :mobileNo.sync="createForm.mobilePhone"
                            @clearValidate="$refs.mobileNoRef.clearValidate()"
                          /> -->
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
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
                  <el-form-item
                    :label="`${$t('organization.website')}`"
                    prop="website"
                  >
                    <el-input
                      v-model="createForm.website"
                      :maxlength="200"
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
                <el-col :span="8" v-if="sysDockingSwitch">
                  <el-form-item
                    :label="`${$t('organization.systemDocking')}`"
                    prop="isSystemDocking"
                  >
                    <el-switch
                      v-model="createForm.isSystemDocking"
                      active-value="1"
                      inactive-value="0"
                      :disabled="!sysDockingSwitch"
                    ></el-switch>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item
                    :label="`${$t('organization.companySeal')}`"
                    prop="companySeal"
                  >
                    <photo
                      ref="companySealPhotoRef"
                      :limit="1"
                      :accept="['.jpg', '.jpeg', '.png', '.bmp', '.webp']"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="`${$t('organization.trademark')}`">
                    <photo
                      ref="trademarkPhotoRef"
                      :limit="1"
                      :accept="['.jpg', '.jpeg', '.png', '.bmp', '.webp']"
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
                ref="addressFormRef"
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
                        palceholder
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
import countrySelect from '@/components/select/countrySelect'
import {
  queryBusinessGroupById,
  saveLegalEntity
} from '@/api/organization/corporate'
import CountryCurrencySelect from '@/components/select/countryCurrencySelect.vue'
import selectPicTable from '@/views/organization/corporate/selectPicTable.vue'
import photo from './driversPhoto.vue'

function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  name: 'AddLegalEntity',
  components: {
    CountryCurrencySelect,
    countrySelect,
    selectPicTable,
    photo
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
      sys_localization: [],
      fullscreenLoading: false,
      // 一定要放在当前文件
      curPath: this.$options.__file,

      createForm: {
        createdBy: this.$store.state.user.nickName
      },
      createRules: {
        legalEntityName: [
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
        ],
        localization: [
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
    },
    sysDockingSwitch() {
      return this.$store.getters.sysDockingSwitch
    }
  },

  created() {
    const vm = this
    this.timeId = this.$route.query.timeId
    vm.createForm.creatorName = this.$store.state.user.nickName
    const fn = async function () {
      const bgId = vm.$route.query.bgId
      if (bgId) {
        await vm.queryBusinessGroupById(bgId)
      }
    }
    fn()
    if (this.sysDockingSwitch) {
      this.createForm['isSystemDocking'] = '1'
    } else {
      this.createForm['isSystemDocking'] = '0'
    }
    const { sys_localization } = this.useDict('sys_localization')
    this.sys_localization = sys_localization || []
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.reset()
      const vm = this
      const fn = async function () {
        const bgId = vm.$route.query.bgId
        if (bgId) {
          await vm.queryBusinessGroupById(bgId)
        }
      }
      fn()
    }
  },
  methods: {
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
    queryBusinessGroupById(id) {
      const vm = this
      return new Promise(resolve => {
        queryBusinessGroupById(id).then(res => {
          const result = res.data
          vm.createForm.businessGroupName = result.businessGroupName
          vm.createForm.businessGroupNo = result.businessGroupNo
          vm.createForm.businessGroupId = result.id
          vm.createForm.currency = result.currency
          vm.createForm.currencyId = result.currencyId
          this.createForm['currencyCode'] = result.currencyCode
          resolve()
        })
      })
    },
    reset() {
      this.createForm = {
        businessGroupName: '',
        legalEntityName: '',
        picUserName: '',
        picUserId: '',
        mobilePhone: '',
        mobileCode: '',
        mobileNum: '',
        legalEntityNo: '',
        companyRegNo: '',
        email: '',
        website: '',
        fax: '',
        currency: undefined,
        currencyId: undefined,
        createdBy: this.$store.state.user.nickName,
        isSystemDocking: '0'
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

      this.activeNames = ['1', '2', '3']
      this.resetForm('createForm')
      this.resetForm('addressFormRef')
      this.$refs.companySealPhotoRef &&
        this.$refs.companySealPhotoRef.initFileList([])
      this.$refs.trademarkPhotoRef &&
        this.$refs.trademarkPhotoRef.initFileList([])

      if (this.sysDockingSwitch) {
        this.createForm['isSystemDocking'] = '1'
      } else {
        this.createForm['isSystemDocking'] = '0'
      }
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

    saveLegalEntity(param) {
      const vm = this
      vm.fullscreenLoading = true
      saveLegalEntity(param)
        .then(res => {
          vm.$message.success(
            `${vm
              .$t('organization.legalEntitySubmitSuccess')
              .replace('$1', `${param.legalEntityName}`)}`
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
          const companySealPhotoFileIds =
            this.$refs.companySealPhotoRef.getFileIds()
          if (companySealPhotoFileIds === false) {
            return
          }
          const trademarkPhotoFileIds = this.$refs.trademarkPhotoRef.getFileIds(
            {
              required: false,
              requiredMsg: this.$t('ui.commonReqMsg').replace(
                '$1',
                this.$t('organization.trademark')
              )
            }
          )
          if (trademarkPhotoFileIds === false) {
            this.collapseWarningForBasicInfo = true
            return
          }
          this.collapseWarningForBasicInfo = false

          vm.$refs.addressFormRef.validate(addressFormValid => {
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
              .confirm(vm.$t('organization.legalEntityConfirm'))
              .then(() => {
                const param = JSON.parse(JSON.stringify(vm.createForm))
                param.legalEntityAddress = JSON.parse(
                  JSON.stringify(vm.addressForm)
                )
                param.commonFileListCompanySeal = companySealPhotoFileIds
                param.commonFileListTrademark = trademarkPhotoFileIds
                vm.saveLegalEntity(param)
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
