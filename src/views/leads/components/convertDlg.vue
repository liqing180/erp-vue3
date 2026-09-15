<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('customer.convert')"
    v-model="dialogTableVisible"
    width="800px"
    top="5vh"
    @close="close"
    append-to-body
  >
    <div class="box flex">
      <div class="flex-0" style="width: 100px; font-size: 16px">
        {{ $t('menu.customer') }}
      </div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="50px"
        class="flex-1"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="">
              <el-radio-group
                v-model="form.convertCustomerType"
                @change="selectChange('customer')"
              >
                <el-radio value="1">{{ $t('customer.add') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="">
              <el-radio-group
                v-model="form.convertCustomerType"
                @change="selectChange('customer')"
              >
                <el-radio value="2">{{
                  $t('customer.linkingExisting')
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              prop="customerName"
              :rules="[
                {
                  required: form.convertCustomerType === '1',
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  message: this.$t('ui.reqMsg'),
                  trigger: ['blur', 'change']
                }
              ]"
            >
              <div class="flex-1 box">
                <div>
                  <span style="color: #ff4949; margin-right: 4px">*</span>
                  {{ $t('customer.customerName') }}
                </div>
                <el-input
                  v-model="form.customerName"
                  :maxlength="200"
                  :disabled="form.convertCustomerType !== '1'"
                  @blur="customerNameBlur"
                ></el-input>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label=""
              prop="linkingExistingCustomer"
              :rules="[
                {
                  required: form.convertCustomerType === '2',
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  message: this.$t('ui.reqMsg'),
                  trigger: ['change']
                }
              ]"
            >
              <div class="flex-1" @click="addLinkingExistingCustomer">
                <el-input
                  :placeholder="
                    $t('customer.detectedMatchingCustomer').replace(
                      '$1',
                      customerNum
                    )
                  "
                  readonly
                  :disabled="
                    form.convertCustomerType !== '2' || customerNum === 0
                  "
                  v-model="form.linkingExistingCustomer"
                >
                </el-input>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="box flex mt20">
      <div class="flex-0" style="width: 100px; font-size: 16px">
        {{ $t('customer.contactPerson') }}
      </div>
      <el-form
        ref="form1"
        :model="form"
        :rules="rules"
        label-width="50px"
        class="flex-1"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="">
              <el-radio-group
                v-model="form.convertCustomerContactPersonType"
                @change="selectChange('contactPerson')"
              >
                <el-radio value="1">{{ $t('customer.add') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="">
              <el-radio-group
                v-model="form.convertCustomerContactPersonType"
                @change="selectChange('contactPerson')"
              >
                <el-radio value="2">{{
                  $t('customer.linkingExisting')
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              prop="customerContactPersonName"
              :rules="[
                {
                  required: form.convertCustomerContactPersonType === '1',
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  message: this.$t('ui.reqMsg'),
                  trigger: ['blur', 'change']
                }
              ]"
            >
              <div class="flex-1 box">
                <div>
                  <span style="color: #ff4949; margin-right: 4px">*</span>
                  {{ $t('customer.contactPersonName') }}
                </div>
                <el-input
                  v-model="form.customerContactPersonName"
                  :maxlength="200"
                  :disabled="form.convertCustomerContactPersonType !== '1'"
                  @blur="contactPersonBlur"
                ></el-input>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label=""
              prop="linkingExistingContactPerson"
              :rules="[
                {
                  required: form.convertCustomerContactPersonType === '2',
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  message: this.$t('ui.reqMsg'),
                  trigger: ['change']
                }
              ]"
            >
              <div class="flex-1" @click="addLinkingExistingContactPerson">
                <el-input
                  :placeholder="
                    $t('customer.detectedMatchingContacts').replace(
                      '$1',
                      contactPersonNum
                    )
                  "
                  readonly
                  :disabled="
                    form.convertCustomerContactPersonType !== '2' ||
                    contactPersonNum === 0
                  "
                  v-model="form.linkingExistingContactPerson"
                >
                </el-input>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="box flex mt20">
      <div class="flex-0" style="width: 100px; font-size: 16px">
        {{ $t('customer.salesOpportunity') }}
      </div>
      <el-form
        ref="form2"
        :model="form"
        :rules="rules"
        label-width="50px"
        class="flex-1"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="">
              <el-radio-group
                v-model="form.convertSalesOpportunityType"
                @change="selectChange('salesOpportunity')"
              >
                <el-radio value="1">{{ $t('customer.add') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="">
              <el-radio-group
                v-model="form.convertSalesOpportunityType"
                @change="selectChange('salesOpportunity')"
                :disabled="!form.linkingExistingCustomer"
              >
                <el-radio value="2">{{
                  $t('customer.linkingExisting')
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              prop="salesOpportunityName"
              :rules="[
                {
                  required: form.convertSalesOpportunityType === '1',
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  message: this.$t('ui.reqMsg'),
                  trigger: ['blur', 'change']
                }
              ]"
            >
              <div class="flex-1 box">
                <div>
                  <span style="color: #ff4949; margin-right: 4px">*</span>
                  {{ $t('customer.salesOpportunityName') }}
                </div>
                <el-input
                  v-model="form.salesOpportunityName"
                  :maxlength="200"
                  :disabled="form.convertSalesOpportunityType !== '1'"
                  @blur="salesOpportunityBlur"
                ></el-input>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label=""
              prop="linkingExistingSalesOpportunity"
              :rules="[
                {
                  required: form.convertSalesOpportunityType === '2',
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  message: this.$t('ui.reqMsg'),
                  trigger: ['change']
                }
              ]"
            >
              <div class="flex-1" @click="addLinkingExistingSalesOpportunity">
                <el-input
                  :placeholder="
                    $t('customer.detectedMatchingOpportunities').replace(
                      '$1',
                      salesOpportunityNum
                    )
                  "
                  :disabled="
                    form.convertSalesOpportunityType !== '2' ||
                    salesOpportunityNum === 0
                  "
                  readonly
                  v-model="form.linkingExistingSalesOpportunity"
                >
                </el-input>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="dialogTableVisible = false">{{
          $t('uiBtn.back')
        }}</el-button>

        <el-button type="primary" @click="submitForm">{{
          $t('customer.convert')
        }}</el-button>
      </div>
    </template>

    <!-- 客户 -->
    <customerDlg
      ref="customerDlg"
      :params="params"
      :customerName="form.customerName"
      @onSuccess="customerOnsuccess"
    />

    <!-- 联系人 -->
    <contactPersonDlg
      ref="contactPersonDlg"
      :params="params"
      :contactPersonName="form.customerContactPersonName"
      @onSuccess="contactPersonOnsuccess"
    />

    <!-- 商机 -->
    <salesOpportunityDlg
      ref="salesOpportunityDlg"
      :params="params"
      :salesOpportunityName="form.salesOpportunityName"
      @onSuccess="salesOpportunityOnsuccess"
    />
  </el-dialog>
</template>

<script>
import {
  queryLikeProspectiveCustomerList,
  queryLikeProspectiveCustomerContactPersonList,
  queryLikeSalesOpportunityList,
  convertLead
} from '@/api/leads/leads'
import customerDlg from './customerDlg'
import contactPersonDlg from './contactPersonDlg'
import salesOpportunityDlg from './salesOpportunityDlg'
export default {
  components: {
    customerDlg,
    contactPersonDlg,
    salesOpportunityDlg
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogTableVisible: false,
      loading: false,
      form: {},
      rules: {
        // customerName: [
        //   {
        //     required: true,
        //     pattern: new RegExp(/^(?!(\s+$))/g),
        //     message: this.$t('ui.reqMsg'),
        //     trigger: ['blur', 'change']
        //   }
        // ]
      },
      validityDaysPickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },
      rowId: undefined,
      customerNum: 0,
      contactPersonNum: 0,
      salesOpportunityNum: 0,
      customerId: undefined
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    }
  },
  methods: {
    selectChange(type) {
      const { convertCustomerType } = this.form
      if (type === 'customer') {
        if (convertCustomerType === '1') {
          this.form.convertCustomerContactPersonType = '1'
          this.form.convertSalesOpportunityType = '1'
          this.customerId = undefined
          this.clearCustomer()
          this.clearContactPerson()
          this.clearSalesOpportunity()
        }
      }
    },
    // 客户输入
    customerNameBlur() {
      this.queryLikeProspectiveCustomerList()
    },
    // 联系人输入
    contactPersonBlur() {
      this.queryLikeProspectiveCustomerContactPersonList()
    },
    // 商机输入
    salesOpportunityBlur() {
      this.queryLikeSalesOpportunityList()
    },
    // 客户弹窗
    addLinkingExistingCustomer() {
      if (this.form.convertCustomerType !== '2' || this.customerNum === 0)
        return
      this.$refs.customerDlg.handleAdd(this.rowId)
    },
    // 选择客户
    customerOnsuccess(row) {
      const { customerId, customerName } = row
      this.customerId = customerId
      this.form.customerId = customerId
      this.form.linkingExistingCustomer = customerName
      this.queryLikeProspectiveCustomerContactPersonList()
      this.clearContactPerson()
      this.queryLikeSalesOpportunityList()
      this.clearSalesOpportunity()
    },
    // 清空客户
    clearCustomer() {
      this.form.customerId = undefined
      this.form.linkingExistingCustomer = undefined
    },
    // 联系人弹窗
    addLinkingExistingContactPerson() {
      if (
        this.form.convertCustomerContactPersonType !== '2' ||
        this.contactPersonNum === 0
      )
        return
      this.$refs.contactPersonDlg.handleAdd(this.rowId)
    },
    // 选择联系人
    contactPersonOnsuccess(row) {
      const {
        customerContactPersonId,
        contactPersonName,
        customerName,
        customerId
      } = row
      this.form.customerContactPersonId = customerContactPersonId
      this.form.linkingExistingContactPerson = contactPersonName
      this.form.customerId = customerId
      this.form.linkingExistingCustomer = customerName
      this.form.convertCustomerType = '2'
      this.customerId = customerId
    },
    // 清空联系人
    clearContactPerson() {
      this.form.customerContactPersonId = undefined
      this.form.linkingExistingContactPerson = undefined
    },
    // 商机
    addLinkingExistingSalesOpportunity() {
      if (
        this.form.convertSalesOpportunityType !== '2' ||
        this.salesOpportunityNum === 0
      )
        return
      this.$refs.salesOpportunityDlg.handleAdd(this.rowId)
    },
    // 选择商机
    salesOpportunityOnsuccess(row) {
      const { salesOpportunityName, salesOpportunityId } = row
      this.form.linkingExistingSalesOpportunity = salesOpportunityName
      this.form.salesOpportunityId = salesOpportunityId
    },
    // 清空商机
    clearSalesOpportunity() {
      this.form.linkingExistingSalesOpportunity = undefined
      this.form.salesOpportunityId = undefined
    },
    reset() {
      this.form = {
        convertCustomerType: '1',
        linkingExistingCustomer: undefined,
        convertCustomerContactPersonType: '1',
        linkingExistingContactPerson: undefined,
        convertSalesOpportunityType: '1',
        linkingExistingSalesOpportunity: undefined,
        customerName: undefined,
        customerContactPersonName: undefined
      }
      this.resetForm('form')
      this.resetForm('form1')
    },
    close() {
      this.reset()
      this.dialogTableVisible = false
    },
    open(rowId) {
      this.rowId = rowId
      this.reset()
      const { customerName, customerContactPersonName, salesOpportunityName } =
        this.params
      this.form.customerName = customerName || ''
      this.form.customerContactPersonName = customerContactPersonName || ''
      this.form.salesOpportunityName = salesOpportunityName || ''
      this.getList()
      this.dialogTableVisible = true
    },
    getList() {
      this.queryLikeProspectiveCustomerList()
      this.queryLikeProspectiveCustomerContactPersonList()
      this.queryLikeSalesOpportunityList()
    },
    queryLikeProspectiveCustomerList() {
      const params = {
        ...this.params,
        customerName: this.form.customerName
      }
      queryLikeProspectiveCustomerList(params).then(response => {
        const { data } = response
        this.customerNum = data ? data.length : 0
      })
    },
    queryLikeProspectiveCustomerContactPersonList() {
      let params = this.params
      if (this.customerId) {
        params.customerId = this.customerId
      }
      params.contactPersonName = this.form.customerContactPersonName
      queryLikeProspectiveCustomerContactPersonList(params).then(response => {
        const { data } = response
        this.contactPersonNum = data ? data.length : 0
      })
    },
    queryLikeSalesOpportunityList() {
      let params = this.params
      if (this.customerId) {
        params.customerId = this.customerId
      }
      params.salesOpportunityName = this.form.salesOpportunityName
      queryLikeSalesOpportunityList(params).then(response => {
        const { data } = response
        this.salesOpportunityNum = data ? data.length : 0
      })
    },

    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$refs.form1.validate(valid1 => {
            if (!valid1) return
            this.$refs.form2.validate(valid2 => {
              if (!valid2) return
              let params = {
                leadId: this.rowId
              }
              const {
                customerId,
                convertCustomerType,
                linkingExistingCustomer,
                customerName,
                customerContactPersonId,
                convertCustomerContactPersonType,
                linkingExistingContactPerson,
                customerContactPersonName,
                convertSalesOpportunityType,
                linkingExistingSalesOpportunity,
                salesOpportunityName,
                salesOpportunityId
              } = this.form
              if (
                convertCustomerType === '1' ||
                convertSalesOpportunityType === '1'
              ) {
                const { salesGroupName, salesGroupUserName } = this.params
                if (!salesGroupName) {
                  this.$message.error(
                    this.$t('ui.fromIncomplete').replace(
                      '$1',
                      this.$t('customer.salesGroup')
                    )
                  )
                  return
                }
                if (!salesGroupUserName) {
                  this.$message.error(
                    this.$t('ui.fromIncomplete').replace(
                      '$1',
                      this.$t('customer.salesPerson')
                    )
                  )
                  return
                }
              }
              if (convertCustomerType === '2') {
                params.customerName = linkingExistingCustomer
                params.customerId = customerId
              } else {
                params.customerName = customerName
              }
              if (convertCustomerContactPersonType === '2') {
                params.customerContactPersonName = linkingExistingContactPerson
                params.customerContactPersonId = customerContactPersonId
              } else {
                params.customerContactPersonName = customerContactPersonName
              }

              if (convertSalesOpportunityType === '2') {
                params.salesOpportunityName = linkingExistingSalesOpportunity
              } else {
                params.salesOpportunityName = salesOpportunityName
                params.salesOpportunityId = salesOpportunityId
              }

              params.convertCustomerType = convertCustomerType
              params.convertCustomerContactPersonType =
                convertCustomerContactPersonType
              params.convertSalesOpportunityType = convertSalesOpportunityType

              this.$modal
                .confirm(this.$t('ui.submitPageConfirm'))
                .then(() => {
                  return convertLead(params)
                })
                .then(response => {
                  this.$modal.msgSuccess(this.$t('ui.submitPageSuccess'))
                  this.$emit('onSuccess')
                  this.close()
                })
                .catch(err => {
                  if (err && err.code === 701) {
                    this.close()
                  }
                })
            })
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  padding: 10px;
  border: 1px solid #ddd;
}
</style>
