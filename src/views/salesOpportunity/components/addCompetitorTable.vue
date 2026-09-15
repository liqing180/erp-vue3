<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="
      !form.competitorId ? $t('menu.addCompetitor') : $t('menu.editCompetitor')
    "
    v-model="dialogTableVisible"
    width="1200px"
    top="5vh"
    @close="close"
    append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="160px">
      <el-row>
        <el-col :span="8">
          <el-form-item
            :label="`${$t('customer.competitorName')}`"
            prop="competitorName"
          >
            <div class="d-flex align-items-center">
              <el-input
                v-if="!form.competitorId"
                v-model="form.competitorName"
                :title="form.competitorName"
                maxlength="200"
              />
              <SelectInput
                v-if="form.competitorId"
                :clearable="true"
                :value="form.competitorName"
                :title="form.competitorName"
                @clear="competitorNameClear"
                @click="openSelectCompetitorName"
                :disabled="comDisFrom || !!form.salesOpportunityCompetitorId"
              />
              <el-icon
                :size="setSize === 'small' ? 24 : 28"
                class="gray-icon"
                v-if="!form.salesOpportunityCompetitorId"
                @click="openSelectCompetitorName"
              >
                <Plus />
              </el-icon>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="`${$t('ui.companyRegNo')}`" prop="companyRegNo">
            <el-input
              v-model="form.companyRegNo"
              :title="form.companyRegNo"
              :disabled="!!form.competitorId"
              maxlength="200"
            ></el-input>
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
            :label="`${$t('customer.estQuotationAmount')}`"
            prop="estQuotationAmount"
          >
            <el-input-number
              v-model="form.estQuotationAmount"
              :precision="2"
              v-thousandSplit="{ precision: 2 }"
              type="number"
              class="form-wd textleft"
              :min="0.01"
              :max="999999999999.99"
              style="width: 100%"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="`${$t('ui.country')}`" prop="country">
            <CountrySelect
              v-model="form.country"
              class="form-wd"
              @select="handleCountrySelect"
              :disabled="!!form.competitorId"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="`${$t('ui.website')}`" prop="website">
            <el-input
              v-model="form.website"
              :title="form.website"
              maxlength="200"
              :disabled="!!form.competitorId"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
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
        <el-col :span="16">
          <el-form-item :label="`${$t('ui.address')}`" prop="registeredAddress">
            <el-input
              v-model="form.registeredAddress"
              maxlength="500"
              :disabled="!!form.competitorId"
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
    </el-form>
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="dialogTableVisible = false">{{
          $t('uiBtn.back')
        }}</el-button>

        <el-button type="primary" @click="submitForm">{{
          $t('uiBtn.submit')
        }}</el-button>
      </div>
    </template>

    <competitorDlg ref="competitorDlg" @onSuccess="competitorUpdate" />
  </el-dialog>
</template>

<script>
import competitorDlg from './competitorDlg.vue'
import {
  saveCompetitor,
  updateCompetitor
} from '@/api/salesOpportunity/salesOpportunity.js'
import CountrySelect from '@/components/select/countrySelect'
function isWebsite(param) {
  const strRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
  const re = new RegExp(strRegex)
  return re.test(param)
}
export default {
  components: {
    CountrySelect,
    competitorDlg
  },
  props: {
    comDisFrom: {
      type: Boolean,
      default: false
    },
    salesOpportunityId: {
      type: String,
      default: ''
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
    return {
      dialogTableVisible: false,
      loading: false,
      salesOpportunityIdList: [],
      form: {},
      rules: {
        competitorName: [
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
        country: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['blur', 'change']
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
        ]
      },
      treat_level: [],

      salesGroupUserList: []
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
    }
  },
  methods: {
    openSelectCompetitorName() {
      this.$refs.competitorDlg.handleAdd()
    },
    competitorUpdate(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.$nextTick(() => {
        this.$refs.form.validateField('competitorName')
      })
    },
    competitorNameClear() {
      const { estQuotationAmount } = this.form
      const amount = estQuotationAmount
      this.reset()
      this.form.estQuotationAmount = amount
    },
    handleCountrySelect(row) {
      if (row) {
        const { id, name } = row
        this.form.country = name
        this.form.countryId = id
      }
    },
    reset() {
      this.form = {
        competitorName: undefined,
        competitorId: undefined,
        companyRegNo: undefined,
        competitorCode: undefined,
        estQuotationAmount: undefined,
        country: undefined,
        website: undefined,
        treatLevel: undefined,
        registeredAddress: undefined,
        remarks: undefined
      }
      this.salesGroupUserList = []
      this.resetForm('form')
    },
    close() {
      this.reset()
      this.dialogTableVisible = false
    },
    // 新增
    handleAdd() {
      this.reset()
      const { treat_level } = this.useDict('treat_level')
      this.treat_level = treat_level || []
      this.dialogTableVisible = true
    },
    // 修改
    handleUpdate(params) {
      this.reset()
      const { treat_level } = this.useDict('treat_level')
      this.treat_level = treat_level || []
      this.dialogTableVisible = true
      this.form = params
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))
          params.salesOpportunityId = this.salesOpportunityId
          if (params.salesOpportunityCompetitorId) {
            updateCompetitor(params).then(res => {
              this.close()
              this.$emit('onSuccess')
            })
            return
          }
          this.$modal
            .confirm(this.$t('customer.submitCompetitorConfirm'))
            .then(() => {
              return saveCompetitor(params)
            })
            .then(response => {
              this.$modal.msgSuccess(
                this.$t('customer.submitCompetitorSuccess').replace(
                  '$1',
                  params.competitorName
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
</style>
