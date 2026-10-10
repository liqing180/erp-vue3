<template>
  <FormPageLayout v-loading="submitLoading">
    <template v-slot:btn>
      <el-button type="primary" size="small" @click="submitForm"
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
            <template #title>
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
                        v-for="dict in dict.type.sys_localization"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      ></el-option>
                    </el-select>
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
                      v-model:value="createForm.country"
                      class="form-wd"
                      @select="handleCountrySelect"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.landlineNumber')}`"
                    ref="landlineNumberRef"
                  >
                    <MobilePhoneInput
                      v-model:mobileCode="createForm.landlineCode"
                      v-model:mobileNum="createForm.landlineNumber"
                      v-model:mobileNo="createForm.landlinePhone"
                      @clearValidate="$refs.landlineNumberRef.clearValidate()"
                      :clearableCode="true"
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
                      :clearableCode="true"
                    />
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
                      :maxlength="350"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.pic')}`"
                    prop="picUserName"
                  >
                    <div class="flexStart">
                      <el-select
                        v-model="createForm.title"
                        placeholder=""
                        style="width: 84px"
                        class="fs-0"
                        clearable
                        filterable
                      >
                        <el-option
                          v-for="dict in dict.type
                            .business_contact_person_title"
                          :key="dict.value"
                          :label="dict.label"
                          :value="dict.value"
                        ></el-option>
                      </el-select>
                      <SelectInput
                        :value="createForm.picUserName"
                        :title="createForm.picUserName"
                        @clear="picUserNameClear"
                        clearable
                        @click="openPicTable"
                        class="form-wd"
                        style="width: 100%"
                      />
                    </div>
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
                    :label="`${$t('organization.companyRegNo')}`"
                    prop="companyRegNo"
                  >
                    <el-input
                      v-model.trim="createForm.companyRegNo"
                      class="form-wd"
                      :maxlength="30"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.currency')}`"
                    prop="currency"
                  >
                    <CommonSelectAndList
                      :id="createForm.currencyId"
                      :label="createForm.currency"
                      :title="createForm.currency"
                      idKey="id"
                      labelKey="currency"
                      filterable
                      :options="currencyOptions"
                      :loading="currencyOptionsLoading"
                      @change="handleCurrencyChange"
                      @handleOpen="
                        () => {
                          $refs.currencySelectRef.handleClick()
                        }
                      "
                    />
                    <country-currency-select
                      :showInput="false"
                      ref="currencySelectRef"
                      v-model:value="createForm.currency"
                      class="form-wd"
                      :props="propVal"
                      :is-currency="true"
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
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('organization.companySeal')}`"
                    prop="companySeal"
                  >
                    <div class="text-center" style="width: 120px">
                      <userAvatar
                        :dlgTitle="$t('organization.companySeal')"
                        :photoUrl="createForm.companySealUrl"
                        @change="changeCompanySeal"
                        :documentName="
                          createForm.legalEntityName
                            ? createForm.legalEntityName +
                              ' - ' +
                              'Company Stamp'
                            : 'Company Stamp'
                        "
                        :commonFileList="
                          createForm.commonFileListCompanySeal || []
                        "
                        :isDelBG="true"
                      />
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('organization.trademark')}`">
                    <div class="text-center" style="width: 120px">
                      <userAvatar
                        :dlgTitle="$t('organization.trademark')"
                        :photoUrl="createForm.trademarkUrl"
                        @change="changeTrademark"
                        :documentName="
                          createForm.legalEntityName
                            ? createForm.legalEntityName + ' - ' + 'Trademark'
                            : 'Trademark'
                        "
                        :commonFileList="
                          createForm.commonFileListTrademark || []
                        "
                      />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </div>
        <div class="form-card mt10">
          <el-collapse-item name="2">
            <template #title>
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
                  <el-col :span="24">
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
                </el-row>
                <el-row>
                  <el-col :span="24">
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
                </el-row>
                <el-row>
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
                </el-row>
                <el-row>
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
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('organization.country')}`"
                      prop="country"
                    >
                      <country-select
                        v-model:value="addressForm.country"
                        class="form-wd"
                        @select="handleCountrySelect2"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <el-form-item :label="`${$t('ui.remarks')}`" prop="remarks">
                      <MyInput
                        type="textarea"
                        v-model="addressForm.remarks"
                        :autosize="{ minRows: 2, maxRows: 4 }"
                        resize="none"
                        show-word-limit
                        :maxlength="3000"
                      ></MyInput>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="3">
            <template #title>
              <FormCollapseItemTitle
                :title="$t('organization.bankInfo')"
                :warning="collapseWarningForBankInfo"
              >
              </FormCollapseItemTitle>
            </template>

            <bankInfo ref="bankInfo" :createForm="createForm" />
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
import countryCurrencySelect from '@/components/select/countryCurrencySelect.vue'
import selectPicTable from '@/views/organization/corporate/selectPicTable.vue'
import userAvatar from '@/components/Common/htz-image-upload/userAvatar.vue'
import { queryCurrencyListBySelect } from '@/api/basic/basic'
import bankInfo from './components/bankInfo.vue'
function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  name: 'AddLegalEntity',
  components: {
    countryCurrencySelect,
    countrySelect,
    selectPicTable,
    userAvatar,
    bankInfo
  },
  dicts: ['sys_localization', 'business_contact_person_title'],
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
      submitLoading: false,
      // 一定要放在当前文件
      curPath: this.$options.__file,

      propVal: 'currencyCode',

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
        country: [
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
      currencyOptions: [],
      currencyOptionsLoading: false,

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
      activeNames: ['1', '2', '3'],
      isInit: true,
      timeId: '',
      collapseWarningForBasicInfo: false,
      collapseWarningForTitleAddress: false,
      collapseWarningForBankInfo: false
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
      return (
        this.$store.getters.sysDockingSwitch ||
        this.$store.getters.sysDockingSwitchQC
      )
    }
  },

  created() {
    const vm = this
    this.timeId = this.$route.query.timeId
    this.queryCurrencyListBySelect()
    vm.createForm.creatorName = this.$store.state.user.nickName
    const fn = async function () {
      const bgId = vm.$route.query.bgId
      if (bgId) {
        await vm.queryBusinessGroupById(bgId)
      }
    }
    fn()
    if (this.sysDockingSwitch) {
      this.createForm.isSystemDocking = '1'
    } else {
      this.createForm.isSystemDocking = '0'
    }
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.queryCurrencyListBySelect()
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
      this.createForm.picUserName = undefined
      this.createForm.picUserId = undefined
      this.createForm.mobilePhone = undefined
      this.createForm.mobileCode = undefined
      this.createForm.mobileNum = undefined
    },
    // 打开pic弹窗
    openPicTable() {
      this.$refs.selectPicTable.handleOpen()
    },
    updatePic(row) {
      const { nickName, userId, mobilePhone, mobileCode, mobileNum } = row
      this.createForm.picUserName = nickName
      this.createForm.picUserId = userId
      this.createForm.mobilePhone = mobilePhone
      this.createForm.mobileCode = mobileCode
      this.createForm.mobileNum = mobileNum
    },
    changeCompanySeal(file) {
      this.createForm.commonFileListCompanySeal = file.url ? [file] : []
      this.createForm.companySealUrl = file.url
      this.createForm.fileIdsCompanySeal = file.id || ''
    },
    changeTrademark(file) {
      this.createForm.commonFileListTrademark = file.url ? [file] : []
      this.createForm.trademarkUrl = file.url
      this.createForm.fileIdsTrademark = file.id || ''
    },

    queryBusinessGroupById(id) {
      const vm = this
      return new Promise(resolve => {
        queryBusinessGroupById(id).then(res => {
          const result = res.data
          vm.createForm.businessGroupName = result.businessGroupName
          vm.createForm.businessGroupNo = result.businessGroupNo
          vm.createForm.businessGroupId = result.id
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
        isSystemDocking: '0',
        bankInfoList: []
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
      this.resetForm('addressForm')

      if (this.sysDockingSwitch) {
        this.createForm.isSystemDocking = '1'
      } else {
        this.createForm.isSystemDocking = '0'
      }
    },
    handleCountrySelect(row) {
      if (row) {
        const { id, name, en } = row
        this.createForm.country = name
        this.createForm.countryId = id
        this.createForm.countryEn = en
        this.handleCountrySelect2(row)
        if (row.mobileCode) {
          this.createForm.landlineCode = row.mobileCode
          this.createForm.faxCode = row.mobileCode
        } else {
          this.createForm.landlineCode = undefined
          this.createForm.faxCode = undefined
        }
      }
    },
    handleCountrySelect2(row) {
      if (row) {
        const { id, name, en } = row
        this.addressForm.country = name
        this.addressForm.countryId = id
        this.addressForm.countryEn = en
      }
    },
    queryCurrencyListBySelect() {
      this.currencyOptionsLoading = true
      queryCurrencyListBySelect()
        .then(res => {
          this.currencyOptionsLoading = false
          const list = res.data || []
          this.currencyOptions = list.map(item => {
            item.label = `${item.currencyCode} (${item.currencyDesc})`
            return item
          })
        })
        .catch(() => {
          this.currencyOptionsLoading = false
        })
    },
    handleCurrencyChange(row) {
      this.$nextTick(() => {
        this.createForm.currencyId = row.id || ''

        this.createForm.currency = row.currency
        this.createForm.currencyCode = row.currencyCode
      })
    },

    saveLegalEntity(param) {
      const vm = this
      vm.submitLoading = true
      saveLegalEntity(param)
        .then(() => {
          vm.$message.success(
            `${vm
              .$t('organization.legalEntitySubmitSuccess')
              .replace('$1', `${param.legalEntityName}`)}`
          )
          this.cancel()
          vm.submitLoading = false
        })
        .catch(() => {
          vm.submitLoading = false
        })
    },
    // 取消按钮
    cancel() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/organization/corporate' })
    },
    submitForm() {
      const vm = this
      this.$refs.createForm.validate(async valid => {
        this.collapseWarningForBasicInfo = !valid
        if (valid) {
          const createValid = await vm.$refs.addressForm
            .validate()
            .catch(() => false)
          this.collapseWarningForTitleAddress = !createValid
          if (!createValid) {
            this.$modal.msgError(
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
              param.bankInfoList = this.$refs.bankInfo.getTableList()
              if (!param.landlineNumber) {
                param.landlineCode = ''
                param.landlinePhone = ''
              }
              if (!param.fax) {
                param.faxCode = ''
                param.faxPhone = ''
              }
              vm.saveLegalEntity(param)
            })
        } else {
          this.$modal.msgError(
            this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
          )
        }
      })
    }
  }
}
</script>
