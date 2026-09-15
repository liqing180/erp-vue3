<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        :loading="submitLoading"
        size="small"
        @click="submitForm"
        v-if="!comDisFrom"
        >{{ $t('uiBtn.submit') }}
      </el-button>

      <el-button
        type="primary"
        size="small"
        :loading="submitLoading"
        v-if="generateSOBtnShow"
        @click="handleGenerateSO"
        >{{ $t('menu.generateSO') }}
      </el-button>

      <el-button
        type="primary"
        size="small"
        v-if="reviseBtnShow"
        @click="handleRevise"
        >{{ $t('uiBtn.revise') }}
      </el-button>

      <el-button
        type="primary"
        size="small"
        v-if="previewPDFShow"
        :loading="previewPDFLoading"
        @click="handlePreviewPDF"
        >{{ $t('menu.previewPDF') }}
      </el-button>

      <el-button
        type="primary"
        size="small"
        v-if="printPDFShow"
        @click="handlePrintPDF"
        >{{ $t('menu.printPDF') }}
      </el-button>

      <el-dropdown
        class="ml10 mr10"
        @command="command => settingHandleCommand(command)"
        trigger="click"
        v-if="bpHistoryVersionList.length > 0"
        @visible-change="dropdownVisibleChange"
      >
        <el-button size="small" type="primary">
          {{ $t('uiBtn.revisionRecord') }}
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template v-slot:dropdown>
          <el-dropdown-menu>
            <el-scrollbar :noresize="false" ref="scrollbar">
              <div style="max-height: 200px">
                <el-dropdown-item
                  :command="item.businessId"
                  v-for="item in bpHistoryVersionList"
                  :key="item.businessId"
                  >{{ item.businessNo }}
                </el-dropdown-item>
              </div>
            </el-scrollbar>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button type="primary" @click="cancel" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>
    <template v-slot:content>
      <div>
        <el-collapse v-model="activeNames">
          <!-- 基础信息 -->
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
                ref="form1"
                :model="form"
                :rules="rules"
                label-width="180px"
              >
                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('SALES.salesQuotationType')}`"
                      prop="salesQuotationType"
                    >
                      <el-select
                        v-model="form.salesQuotationType"
                        placeholder=""
                        @change="salesQuotationTypeChange"
                        style="width: 100%"
                        :disabled="!!form.salesQuotationId"
                      >
                        <el-option
                          v-for="item in quotationTypeList"
                          :key="item.dictValue"
                          :label="item.dictLabel"
                          :value="item.dictValue"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('ui.status')}`">
                      <div
                        :title="form.salesQuotationStatusShowStr"
                        class="w100"
                      >
                        <el-input
                          :value="form.salesQuotationStatusShowStr"
                          disabled
                        ></el-input>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('SALES.salesQuotationNo')}`">
                      <el-input
                        v-model="form.salesQuotationNo"
                        disabled
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('SALES.customerName')}`"
                      prop="businessPartnerName"
                    >
                      <SelectInput
                        :disabled="true"
                        clearable
                        :value="form.businessPartnerName"
                        :title="form.businessPartnerName"
                        @click="openSupplierTable"
                        @clear="supplierClear"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('SALES.customerCode')}`">
                      <el-input
                        v-model="form.businessPartnerNo"
                        disabled
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('SALES.ourRef')}`">
                      <el-input
                        v-model="form.ourRef"
                        :title="form.ourRef"
                        :maxlength="50"
                        :disabled="comDisFrom"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('ui.currency')}`"
                      prop="currencyId"
                    >
                      <CommonSelect
                        :disabled="!!form.salesQuotationId"
                        :id="form.currencyId"
                        :label="form.currency"
                        :title="form.currency"
                        idKey="id"
                        labelKey="label"
                        :filterable="true"
                        :clearable="false"
                        :options="currencyOptions || []"
                        @changeItem="currencyChange"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('ui.paymentMethod')}`"
                      prop="paymentMethodIdList"
                    >
                      <ToolTipShowList
                        :list="form.paymentMethodNameList || []"
                        :popoverTitle="$t('ui.paymentMethod')"
                      >
                        <CommonMultipleSelect
                          :disabled="comDisFrom"
                          :ids="form.paymentMethodIdList"
                          :labels="form.paymentMethodNameList"
                          :showTitle="false"
                          idKey="value"
                          labelKey="label"
                          :options="business_partner_payment_method"
                          @change="paymentMethodChange"
                        />
                      </ToolTipShowList>
                    </el-form-item>
                  </el-col>

                  <el-col :span="8">
                    <el-form-item :label="`${$t('SALES.yourRef')}`">
                      <el-input
                        v-model="form.yourRef"
                        :title="form.yourRef"
                        :maxlength="50"
                        :disabled="comDisFrom"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('SALES.department')}`"
                      prop="departmentId"
                    >
                      <CommonSelect
                        :id="form.departmentId"
                        :label="form.departmentName"
                        :title="form.departmentName"
                        idKey="departmentId"
                        labelKey="departmentName"
                        :options="deptOptions"
                        @changeItem="departmentChange"
                        :disabled="comDisFrom"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('SALES.salesPerson')}`"
                      prop="salesPersonBy"
                    >
                      <SelectInput
                        :value="form.salesPersonBy"
                        :title="form.salesPersonBy"
                        @clear="purchasePersonClear"
                        clearable
                        @click="openPurchasePersonTable"
                        :disabled="!form.departmentId || comDisFrom"
                        :key="form.salesQuotationType + '_' + timeStamp"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col
                    :span="8"
                    :key="form.salesQuotationType + 'taxRate_' + timeStamp"
                  >
                    <el-form-item
                      :label="`${$t('SALES.taxRate')}`"
                      prop="taxRate"
                    >
                      <CommonSelect
                        :id="$numberStr(form.taxRate, 1)"
                        :label="$numberStr(form.taxRate, 1)"
                        idKey="taxRateStr"
                        labelKey="taxRateStr"
                        :options="taxRateOptions"
                        :disabled="!form.businessPartnerId || comDisFrom"
                        @changeItem="taxRateChange"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <el-form-item
                      :label="$t('SALES.paymentTerm')"
                      prop="paymentTermName"
                    >
                      <el-input
                        type="textarea"
                        :disabled="!form.businessPartnerId || comDisFrom"
                        v-model="form.paymentTermName"
                        :autosize="{ minRows: 1, maxRows: 4 }"
                        resize="none"
                        show-word-limit
                        :maxlength="1000"
                        :title="form.paymentTermName"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <el-form-item :label="$t('ui.remarks')">
                      <el-input
                        type="textarea"
                        v-model="form.basicRemarks"
                        :autosize="{ minRows: 1, maxRows: 4 }"
                        resize="none"
                        show-word-limit
                        :maxlength="3000"
                        :title="form.basicRemarks"
                        :disabled="comDisFrom"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('SALES.automatedEmail')}`">
                      <el-switch
                        v-model="form.automatedEmail"
                        active-value="1"
                        inactive-value="0"
                        :disabled="comDisFrom"
                      ></el-switch>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('SALES.isNonDigital')}`">
                      <el-switch
                        v-model="form.isNonDigital"
                        active-value="1"
                        inactive-value="0"
                        :disabled="comDisFrom"
                      ></el-switch>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('SALES.COD')}`">
                      <el-switch
                        v-model="form.isCod"
                        active-value="1"
                        inactive-value="0"
                        :disabled="comDisFrom"
                      ></el-switch>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('SALES.sealRequired')}`"
                      prop="sealRequired"
                    >
                      <el-switch
                        v-model="form.sealRequired"
                        active-value="1"
                        inactive-value="0"
                        :disabled="comDisFrom"
                      ></el-switch>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
          </div>
          <!-- 客户采购信息 -->
          <div class="form-card mt10" v-show="generateSOBtnShow">
            <el-collapse-item name="2">
              <template v-slot:title>
                <FormCollapseItemTitle
                  :title="$t('SALES.customerPODetail')"
                  :warning="collapseWarningForPODetail"
                >
                  <span v-if="form.poType" class="info-item mr20">
                    {{ $t('SALES.poType') }} :
                    {{ selectDictLabel(sales_po_type, form.poType) }}
                  </span>
                  <span
                    v-if="form.poContactPersonName"
                    class="info-item mr20"
                    :title="form.poContactPersonName"
                  >
                    {{ $t('SALES.purchaseContactPerson') }} :
                    {{ form.poContactPersonName }}
                  </span>
                </FormCollapseItemTitle>
              </template>
              <el-form
                ref="form3"
                :model="form"
                :rules="rules2"
                label-width="180px"
              >
                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('SALES.poType')}`"
                      prop="poType"
                    >
                      <el-select
                        v-model="form.poType"
                        @change="poTypeChange"
                        placeholder=""
                        style="width: 100%"
                      >
                        <el-option
                          v-for="item in sales_po_type"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('SALES.poNo')}`"
                      prop="poNo"
                      :rules="[
                        {
                          required: ['1', '3'].includes(form.poType),
                          message: $t('ui.reqMsg'),
                          trigger: ['change']
                        }
                      ]"
                    >
                      <el-input
                        :disabled="
                          !form.poType || ['2', '4'].includes(form.poType)
                        "
                        v-model="form.poNo"
                        maxlength="200"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('SALES.poDate')}`"
                      prop="poDate"
                    >
                      <el-date-picker
                        v-model="form.poDate"
                        :format="fmtForYmd"
                        value-format="x"
                        :style="{ width: '100%' }"
                        placeholder=""
                        clearable
                        :disabled-date="poDatePickerOptions.disabledDate"
                      ></el-date-picker>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('SALES.purchaseContactPerson')}`"
                      prop="poContactPersonId"
                      :rules="[
                        {
                          required: true,
                          message: $t('ui.reqMsg'),
                          trigger: ['change']
                        }
                      ]"
                    >
                      <CommonSelect
                        :disabled="!form.businessPartnerId"
                        :id="form.poContactPersonId"
                        :label="form.poContactPersonName"
                        :title="form.poContactPersonName"
                        idKey="contactPersonId"
                        labelKey="contactPersonName"
                        :options="form.bpBusinessContactPersonList || []"
                        @changeItem="poContactPersonChange"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('ui.email')}`">
                      <el-input
                        v-model="form.poEmail"
                        :title="form.poEmail"
                        disabled
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('ui.mobilePhone')}`">
                      <el-input
                        v-model="form.poMobilePhone"
                        :title="form.poMobilePhone"
                        disabled
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <el-form-item :label="`${$t('ui.attachment')}`" required>
                      <myUpload ref="uploadRefPO" :limit="9" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
          </div>
          <!-- 项目信息 -->
          <div class="form-card mt10">
            <el-collapse-item name="4">
              <template v-slot:title>
                <FormCollapseItemTitle
                  :title="$t('SALES.projectInfo')"
                  :warning="collapseWarningForProjectInfo"
                >
                </FormCollapseItemTitle>
              </template>
              <projectInfo
                ref="projectInfo"
                :formData="form"
                :comDisFrom="comDisFrom"
                @specialRequirementChange="specialRequirementChange"
              />
            </el-collapse-item>
          </div>
          <!-- 产品信息 -->
          <div class="form-card mt10 collapse-item-content-pt0">
            <el-collapse-item name="3">
              <template v-slot:title>
                <FormCollapseItemTitle
                  :title="$t('SALES.productInfo')"
                  :warning="collapseWarningForProductInfo"
                >
                </FormCollapseItemTitle>
              </template>
              <div>
                <ProductInfo
                  :comDisFrom="comDisFrom"
                  ref="ProductInfo"
                  :formData="form"
                  :initCommonFileList="initCommonFileList"
                  :salesQuotationType="form.salesQuotationType"
                  :countryId="form.countryId"
                  :businessPartnerId="form.businessPartnerId"
                  :currencyId="form.currencyId"
                  @deliveryDateForDayChange="
                    deliveryDateChange('deliveryDateForDay')
                  "
                />
              </div>
            </el-collapse-item>
          </div>
        </el-collapse>
      </div>
    </template>

    <selectPurchasePersonTable
      ref="selectPurchasePersonTable"
      :departmentId="form.departmentId"
      @update="updatePurchasePerson"
    />
  </FormPageLayout>
</template>

<script>
import { queryUserDepartment } from '@/api/system/user'
import { queryCurrencyListBySelect } from '@/api/basic/basic'
import { getToken } from '@/utils/auth'
import {
  querySaveSalesQuotationMsg,
  saveSalesQuotation,
  reviseSalesQuotation,
  preview,
  conversionCurrencyUnitPrice,
  querySalesQuotationHistoryVersion,
  querySalesQuotationById,
  generateSO
} from '@/api/salesManagement/salesQuotation'

import pageMixin from '@/mixins/tableMinx'

import selectPurchasePersonTable from './components/selectPurchasePersonTable.vue'
import projectInfo from './components/projectInfo.vue'
import ProductInfo from './productInfo/productInfo.vue'
export default {
  mixins: [pageMixin],
  components: {
    selectPurchasePersonTable,
    ProductInfo,
    projectInfo
  },
  props: {
    pageType: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      previewPDFLoading: false,
      activeNames: [],
      timeId: '',
      submitLoading: false,
      form: {
        salesQuotationProductList: [],
        salesQuotationProjectList: [],
        salesQuotationServiceList: [],
        projectCostDetailList: []
      },

      collapseWarningForBasicInfo: false,
      collapseWarningForPODetail: false,
      collapseWarningForProductInfo: false,
      collapseWarningForProjectInfo: false,
      rules: {
        salesQuotationType: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        businessPartnerName: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        departmentId: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        salesPersonBy: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        currencyId: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        taxRate: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        paymentMethodIdList: [
          {
            type: 'array',
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        validityForDay: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        deliveryDateForDay: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        paymentTermName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],

        productMsgTypeList: [
          {
            required: true,
            type: 'array',

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.uom')),
            trigger: ['blur', 'change']
          }
        ],

        incotermId: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],

        warehouseName: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        bpContactPersonName: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        bpBusinessAddressId: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        consignmentStartTime: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        consignmentEndTime: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ]
      },
      rules2: {
        poType: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        poDate: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        poContactPersonId: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ]
      },
      poDatePickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      deptOptions: [],
      currencyOptions: [],
      incotermOptions: [],
      taxRateOptions: [],
      /* 表格部分 */
      initCommonFileList: [],
      shipToAddressRows: [
        {
          label: this.$t('SALES.port'),
          showLabel: 'portName'
        },
        {
          label: this.$t('SALES.code1'),
          showLabel: 'portCode'
        },
        {
          label: this.$t('SALES.latLong'),
          showLabel: 'latLong'
        },
        {
          label: this.$t('SALES.telephone'),
          showLabel: 'telephone'
        },
        {
          label: this.$t('SALES.website'),
          showLabel: 'website'
        },
        {
          label: this.$t('SALES.country'),
          showLabel: 'country'
        }
      ],
      warehouseRows: [
        {
          label: this.$t('INVENTORY.warehouseCode'),
          showLabel: 'warehouseCode'
        },
        {
          label: this.$t('INVENTORY.warehouseName'),
          showLabel: 'warehouseName'
        },
        {
          label: this.$t('INVENTORY.warehouseType'),
          showLabel: 'warehouseTypeShowStr'
        },
        {
          label: this.$t('INVENTORY.label'),
          showLabel: 'label'
        },
        {
          label: this.$t('organization.address1'),
          showLabel: 'address1'
        },
        {
          label: this.$t('organization.address2'),
          showLabel: 'address2'
        },
        {
          label: this.$t('organization.city'),
          showLabel: 'city'
        },
        {
          label: this.$t('organization.province'),
          showLabel: 'province'
        },
        {
          label: this.$t('organization.postalCode'),
          showLabel: 'postalCode'
        },
        {
          label: this.$t('organization.country'),
          showLabel: 'country'
        }
      ],
      bpAddressRows: [
        {
          label: this.$t('INVENTORY.label'),
          showLabel: 'label'
        },
        {
          label: this.$t('organization.address1'),
          showLabel: 'address1'
        },
        {
          label: this.$t('organization.address2'),
          showLabel: 'address2'
        },
        {
          label: this.$t('organization.city'),
          showLabel: 'city'
        },
        {
          label: this.$t('organization.province'),
          showLabel: 'province'
        },
        {
          label: this.$t('organization.postalCode'),
          showLabel: 'postalCode'
        },
        {
          label: this.$t('organization.country'),
          showLabel: 'country'
        }
      ],
      salesQuotationTypeList: [],
      timeStamp: +new Date(),
      business_partner_payment_method: [],
      sales_po_type: [],
      buttonAuthMsg: {},
      basicUpdateProps: [],
      bpHistoryVersionList: []
    }
  },
  computed: {
    editAuth() {
      return this.checkPermi(['salesOpportunity:edit'])
    },
    comDisFrom() {
      if (this.isView) {
        return true
      }
      if (this.pageType === 'revise') {
        return !this.editAuth || this.buttonAuthMsg.isCanRevise !== '1'
      }
      if (this.pageType === 'edit') {
        return !this.editAuth || this.buttonAuthMsg.isCanUpdate !== '1'
      }
      if (this.pageType === 'add') {
        return !this.editAuth
      }
      if (this.pageType === 'view') {
        return true
      }
      return false
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    legalEntityInfo() {
      return this.$store.state.user.legalEntityInfo
    },
    // 法人对接
    isSystemDocking() {
      return this.$store.state.user.legalEntityInfo.isSystemDocking
    },
    quotationTypeList() {
      return [
        {
          dictValue: 'MixDesign',
          dictLabel: this.$t('SALES.concreteProduct')
        }
      ]
    },
    previewPDFShow() {
      return this.buttonAuthMsg.isCanPreviewPDF === '1'
    },
    printPDFShow() {
      return (
        this.buttonAuthMsg.isCanPrintPDF === '1' && this.pageType !== 'revise'
      )
    },
    reviseBtnShow() {
      return (
        this.buttonAuthMsg.isCanRevise === '1' &&
        this.pageType !== 'add' &&
        this.pageType !== 'revise'
      )
    },
    generateSOBtnShow() {
      return (
        this.buttonAuthMsg.isCanGenerateSO === '1' &&
        this.pageType !== 'add' &&
        this.pageType !== 'revise'
      )
    }
  },

  created() {
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.salesOpportunityId = this.$route.query.salesOpportunityId
    this.isView = this.$route.query.isView === '1'
    if (this.rowId) {
      this.handleUpdate()
    } else {
      this.handleAdd()
    }

    const { business_partner_payment_method, sales_po_type } = this.useDict(
      'business_partner_payment_method',
      'sales_po_type'
    )
    this.business_partner_payment_method = business_partner_payment_method || []
    this.sales_po_type = sales_po_type || []
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.rowId = this.$route.query.id
      this.salesOpportunityId = this.$route.query.salesOpportunityId
      this.isView = this.$route.query.isView === '1'
      if (this.rowId) {
        this.handleUpdate()
      } else {
        this.handleAdd()
      }
    }
  },

  methods: {
    specialRequirementChange() {
      if (
        this.form.specialRequirement !== '3' &&
        this.$refs.ProductInfo.activeName === 'projectTaskMixDesign'
      ) {
        this.$refs.ProductInfo.activeName = 'mixDesign'
      }
    },
    handleAdd() {
      this.reset()
      this.queryUserDepartment()
      this.queryCurrencyListBySelect()
      this.querySaveSalesQuotationMsg()
      this.buttonAuthMsg.isCanPreviewPDF = '1'
    },
    handleUpdate() {
      this.reset()
      this.queryUserDepartment()
      this.queryCurrencyListBySelect()
      this.querySalesQuotationHistoryVersion()
      querySalesQuotationById({ salesQuotationMainId: this.rowId }).then(
        res => {
          const data = res.data || {}
          data.salesQuotationProductList = data.salesQuotationProductList || []
          data.salesQuotationProjectList = data.salesQuotationProjectList || []
          data.salesQuotationServiceList = data.salesQuotationServiceList || []
          data.projectCostDetailList = data.projectCostDetailList || []

          data.productMsgTypeList = data.productMsgTypeList || []

          this.initCommonFileList = data.commonFileList || []

          this.form = data
          this.buttonAuthMsg = data.buttonAuthMsg || {}

          const taxCodeList = data.taxCodeList || []
          taxCodeList.forEach(item => {
            item.taxRateStr = this.$numberStr(item.taxRate, 1)
          })
          this.taxRateOptions = taxCodeList

          /* 版本比对 */
          const updateMsg = data.updateMsg || {}
          const basicUpdateMsgList = updateMsg.basicUpdateMsgList || []
          const beforeCommonFileList = updateMsg.beforeCommonFileList || []
          const afterCommonFileList = updateMsg.afterCommonFileList || []

          setTimeout(() => {
            this.basicUpdateProps = basicUpdateMsgList.map(item => item.name)
            if (
              beforeCommonFileList.length > 0 ||
              afterCommonFileList.length > 0
            ) {
              this.basicUpdateProps.push('attachment')
            }
          }, 100)
        }
      )
    },
    querySaveSalesQuotationMsg() {
      querySaveSalesQuotationMsg({
        salesOpportunityId: this.salesOpportunityId
      }).then(res => {
        const data = res.data || {}
        this.form.salesOpportunityId = data.salesOpportunityId
        this.form.salesOpportunityNo = data.salesOpportunityNo
        this.form.salesOpportunityName = data.salesOpportunityName
        this.form.paymentTermName = data.lastPaymentTermName

        const businessPartner = data.businessPartner || {}
        const taxCodeList = data.taxCodeList || []
        taxCodeList.forEach(item => {
          item.taxRateStr = this.$numberStr(item.taxRate, 1)
        })
        const defaultRow = taxCodeList.find(item => item.isDefault === '1')
        if (defaultRow) {
          this.taxRateChange(defaultRow)
        }
        this.taxRateOptions = taxCodeList

        this.updateSupplier(businessPartner)
      })
    },
    getSystemSetup() {
      getSystemSetup().then(res => {
        const { quotationValidityDays } = res.data
        let date = +new Date()
        const ValidityDays = quotationValidityDays || 30
        if (ValidityDays) {
          date = date + ValidityDays * 24 * 60 * 60 * 1000
        }
        this.form.validityForDay = ValidityDays
        this.form.validity = date
      })
    },
    reset() {
      this.form = {
        /* 基础信息 */
        salesQuotationType: 'MixDesign',
        documentType: 'SelfCreated',
        salesQuotationNo: undefined,
        businessPartnerName: undefined,
        salesQuotationStatus: undefined,
        businessPartnerId: undefined,
        bpContactPersonName: undefined,
        bpBusinessContactPersonList: [],
        departmentId: undefined,
        departmentName: undefined,
        allSuperiorName: undefined,
        salesPersonBy: this.$store.state.user.nickName,
        salesPersonId: this.$store.state.user.userId,
        currencyId: undefined,
        currency: undefined,
        paymentTermId: undefined,
        paymentTermName: undefined,
        paymentMethodIdList: [],
        paymentMethodNameList: [],
        validityForDay: undefined,
        validity: undefined,
        deliveryDateForDay: undefined,
        deliveryDate: undefined,
        ourRef: undefined,
        yourRef: undefined,
        basicRemarks: undefined,
        automatedEmail: '1',
        isNonDigital: '1',
        isCod: '0',
        productMsgTypeList: ['1', '2', '3'],
        dropShipping: '0',

        bpEmail: undefined,
        mobilePhone: undefined,

        incotermId: '20',
        incotermName: 'EXW- Self Collection (Place)',
        incotermAddressType: '0',
        incotermAbbreviation: 'EXW',
        receiveAddressId: undefined,
        receiveAddressName: undefined,
        receiveAddressForPort: {},
        addressForWarehouse: {},
        salesQuotationProductList: [],
        salesQuotationProjectList: [],
        salesQuotationServiceList: [],
        projectCostDetailList: [],
        tableLoading: false,
        consignmentStartTime: undefined,
        consignmentEndTime: undefined,
        projectTemplateContentList: [],

        taxId: undefined,
        taxNo: undefined,
        taxRate: undefined,

        // 配合比
        projectId: undefined,
        projectCode: undefined,
        zoneName: undefined,
        zoneId: undefined,
        receiveAddress: undefined,
        bpBusinessAddressId: undefined,
        projectContactPersonNames: undefined,
        specialRequirement: undefined,
        cubeSpacingNum: undefined,
        projectContactPersonList: [],
        projectBusinessContactPersonIds: undefined,
        projectContactPersonIds: undefined,
        salesQuotationMixDesignList: [],
        sealRequired: '0'
      }

      this.collapseWarningForBasicInfo = false
      this.collapseWarningForPODetail = false
      this.collapseWarningForProductInfo = false
      this.collapseWarningForProjectInfo = false
      this.initCommonFileList = []
      this.activeNames = ['1', '2', '3', '4']

      this.form.currency = this.legalEntityInfo.currency
      this.form.currencyId = this.legalEntityInfo.currencyId
      this.form.currencyCode = this.legalEntityInfo.currencyCode

      this.basicUpdateProps = []
      this.bpHistoryVersionList = []

      setTimeout(() => {
        if (this.$refs.uploadRefPO) {
          this.$refs.uploadRefPO.initFileList([])
        }
      }, 300)

      this.resetForm('form1')
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

      const obj = {
        path: '/salesOpportunity/viewSalesOpportunity',
        query: {
          id: this.$route.query.salesOpportunityId,
          timeId: Date.now()
        }
      }
      this.$tab.closeOpenPage(obj)
    },
    submitSuccess(sqId) {
      const obj = {
        path: '/salesManagement/viewSalesQuotation',
        query: {
          salesOpportunityId: this.salesOpportunityId,
          id: sqId,
          timeId: Date.now()
        }
      }
      this.$tab.closeOpenPage(obj)
    },
    /* 表单部分Start */
    /* 第一部分表单 */
    inputNumberChange(code) {
      this.$refs.form1 && this.$refs.form1.validateField(code)
    },
    salesQuotationTypeChange() {
      this.tableTimer = Date.now()
      this.timeStamp = Date.now()
      this.form.tableLoading = false
      this.form.salesQuotationProductList = []
      this.form.salesQuotationProjectList = []
      this.form.salesQuotationServiceList = []
      this.supplierClear()
      this.$nextTick(() => {
        this.$refs.form1 &&
          this.$refs.form1.clearValidate('customerQuestionnaireId')
      })
    },
    openSupplierTable() {
      this.$refs.selectCustomerTable.handleOpen()
    },
    // 清空供应商
    supplierClear() {
      this.form.businessPartnerMainId = undefined
      this.form.businessPartnerId = undefined
      this.form.businessPartnerName = undefined
      this.form.businessPartnerNo = undefined
      this.form.countryId = undefined
      this.form.country = undefined
      this.form.customerGroup = undefined
      this.tableTimer = Date.now()
      this.form.tableLoading = false
      if (this.form.currencyId !== this.legalEntityInfo.currencyId) {
        this.currencyClear()
      }
      this.paymentMethodChange([], [])

      this.contactPersonClear()
      // this.deliveryAddressClear()
    },
    updateSupplier(row) {
      this.form.businessPartnerMainId = row.businessPartnerMainId
      this.form.businessPartnerId = row.businessPartnerId
      this.form.businessPartnerName = row.businessPartnerName
      this.form.businessPartnerNo = row.businessPartnerNo
      this.form.abbreviation = row.abbreviation
      this.form.countryId = row.countryId
      this.form.country = row.country
      this.form.customerGroup = row.customerGroup
      this.form.bpBusinessContactPersonList = row.bpBusinessContactPersonList
      const account = row.bpBusinessAccountCustomer || {}

      if (!this.form.currencyId) {
        this.form.currency = this.legalEntityInfo.currency
        this.form.currencyId = this.legalEntityInfo.currencyId
        this.form.currencyCode = this.legalEntityInfo.currencyCode
      }

      this.form.paymentMethodIdList = account.paymentMethodIdList || []
      this.form.paymentMethodNameList = account.paymentMethodNameList || []
      this.contactPersonClear()

      const ContactPersonList = this.form.bpBusinessContactPersonList || []
      if (ContactPersonList.length > 0) {
        const defaultContact = ContactPersonList.find(
          item => item.isDefault === '1'
        )
        if (defaultContact) {
          this.contactPersonChange(defaultContact)
        }
      }
      this.tableTimer = Date.now()
      this.form.tableLoading = false
      if (this.form.salesQuotationType !== 'Project') {
        this.form.salesQuotationProductList = []
        this.form.salesQuotationServiceList = []
      }
    },
    queryUserDepartment() {
      queryUserDepartment({}).then(res => {
        this.deptOptions = res.data || []
        this.deptOptions.forEach(item => {
          if (item.isDefault === '1') {
            this.form.departmentId = item.departmentId
            this.form.departmentName = item.departmentName
            this.form.allSuperiorName = item.allSuperiorName
          }
        })
      })
    },
    departmentChange(item) {
      this.form.departmentId = item.departmentId
      this.form.departmentName = item.departmentName
      this.form.allSuperiorName = item.allSuperiorName
      if (this.form.salesPersonId !== this.$store.state.user.userId) {
        this.purchasePersonClear()
      }
    },

    taxRateChange(row) {
      this.form.taxId = row.taxId
      this.form.taxNo = row.taxNo
      this.form.taxRate = row.taxRate
      // this.$nextTick(() => {
      //   this.$refs.form1.validateField('taxRate')
      // })
    },

    openPurchasePersonTable() {
      this.$refs.selectPurchasePersonTable.handleOpen()
    },
    purchasePersonClear() {
      this.form.salesPersonBy = undefined
      this.form.salesPersonId = undefined
      this.$nextTick(() => {
        this.$refs.form1.validateField('salesPersonBy')
      })
    },
    updatePurchasePerson(row) {
      this.form.salesPersonBy = row.nickName
      this.form.salesPersonId = row.userId
      this.$nextTick(() => {
        this.$refs.form1.validateField('salesPersonBy')
      })
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
    currencyChange(row) {
      const oldCurrencyId = this.form.currencyId
      this.form.currencyId = row.id
      this.form.currency = row.label
      this.form.currencyCode = row.currencyCode
      if (
        this.form.salesQuotationProductList.length > 0 ||
        this.form.salesQuotationServiceList.length > 0
      ) {
        const tableTimer = Date.now()
        this.tableTimer = tableTimer
        this.form.tableLoading = true
        conversionCurrencyUnitPrice({
          ...this.form,
          oldCurrencyId: oldCurrencyId,
          currencyId: row.id,
          salesQuotationProductList: this.form.salesQuotationProductList,
          salesQuotationServiceList: this.form.salesQuotationServiceList
        })
          .then(res => {
            if (this.tableTimer !== tableTimer) return
            this.form.tableLoading = false
            const data = res.data || {}
            this.form.salesQuotationProductList =
              data.salesQuotationProductList || []
            this.form.salesQuotationServiceList =
              data.salesQuotationServiceList || []

            this.form.subTotal = data.subTotal
            this.form.totalTaxAmount = data.totalTaxAmount
            this.form.totalAmount = data.totalAmount
          })
          .catch(() => {
            if (this.tableTimer !== tableTimer) return
            this.form.tableLoading = false
          })
      }
    },
    currencyClear() {
      this.form.currencyId = undefined
      this.form.currency = undefined
      this.form.salesQuotationProductList = []
      this.form.salesQuotationServiceList = []
    },

    paymentMethodChange(ids, labels) {
      this.form.paymentMethodIdList = ids
      this.form.paymentMethodNameList = labels
    },

    deliveryDateChange(changeType) {
      const cur = this.appointTime(Date.now(), '00:00:00')
      const dayTimer = 24 * 60 * 60 * 1000
      if (changeType === 'deliveryDateForDay') {
        if (this.form.deliveryDateForDay) {
          this.form.deliveryDate = dayTimer * this.form.deliveryDateForDay + cur
        } else {
          this.form.deliveryDate = undefined
        }
        this.$nextTick(() => {
          this.$refs.form1.validateField('deliveryDateForDay')
        })
      }
      if (changeType === 'deliveryDate') {
        if (this.form.deliveryDate) {
          const timer = Math.floor((this.form.deliveryDate - cur) / dayTimer)
          this.form.deliveryDateForDay = timer
        } else {
          this.form.deliveryDateForDay = undefined
          this.$nextTick(() => {
            this.$refs.form1.validateField('deliveryDateForDay')
          })
        }
      }
    },

    contactPersonChange(row) {
      this.form.bpBusinessContactPersonId = row.customerContactPersonId
      this.form.bpContactPersonId = row.contactPersonId
      this.form.bpContactPersonName = row.contactPersonName
      this.form.bpMobileNum = row.mobileNum
      this.form.bpMobileCode = row.mobileCode
      this.form.bpMobilePhone = row.mobilePhone
      this.form.bpEmail = row.email
      this.form.isAdhocEntryContactPerson = undefined
      this.form.bpBusinessContactPerson = undefined
    },
    contactPersonClear() {
      this.form.bpBusinessContactPersonId = undefined
      this.form.bpContactPersonId = undefined
      this.form.bpContactPersonName = undefined
      this.form.bpMobileNum = undefined
      this.form.bpMobileCode = undefined
      this.form.bpMobilePhone = undefined
      this.form.bpEmail = undefined
      this.form.isAdhocEntryContactPerson = undefined
      this.form.bpBusinessContactPerson = undefined
    },

    /* 客户采购信息 */
    poTypeChange(value) {
      if (value === '2') {
        this.form.poNo = this.form.salesQuotationNo
      } else {
        this.form.poNo = undefined
      }
      this.$nextTick(() => {
        this.$refs.form3.clearValidate('poNo')
      })
    },
    poContactPersonChange(row) {
      this.form.poBusinessContactPersonId = row.customerContactPersonId
      this.form.poContactPersonId = row.contactPersonId
      this.form.poContactPersonName = row.contactPersonName
      this.form.poMobileNum = row.mobileNum
      this.form.poMobileCode = row.mobileCode
      this.form.poMobilePhone = row.mobilePhone
      this.form.poEmail = row.email
    },

    /* 表单部分End */
    getSQSubmitConfirm() {
      const bpBusinessAddress = this.form.bpBusinessAddress || {}
      if (
        this.form.incotermAddressType === '2' &&
        bpBusinessAddress.country &&
        this.legalEntityInfo.country !== bpBusinessAddress.country
      ) {
        return this.$t('SALES.SQinternationalTransactionsSubmitConfirm')
      } else {
        return this.$t('SALES.SQSubmitConfirm')
      }
    },

    async submitForm(submitType) {
      const myFileIds = this.$refs.ProductInfo.getFileIds()
      if (myFileIds === false) {
        return
      }
      const valid1 = await this.$refs.form1.validate().catch(err => {
        return false
      })

      this.collapseWarningForBasicInfo = !valid1
      if (!valid1) {
        this.$modal.msgError(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
        )
        return
      }

      if (submitType === 'generateSO') {
        const valid3 = await this.$refs.form3.validate().catch(err => {
          return false
        })
        this.collapseWarningForPODetail = !valid3
        if (!valid3) {
          this.$modal.msgError(
            this.$t('ui.fromIncomplete').replace(
              '$1',
              this.$t('SALES.customerPODetail')
            )
          )
          return
        }
        const myFileIdsForPO = this.$refs.uploadRefPO.getFileIds({
          required: true,
          requiredMsg: this.$t('ui.commonReqMsg').replace(
            '$1',
            this.$t('ui.attachment')
          )
        })
        if (myFileIdsForPO === false) {
          this.collapseWarningForPODetail = true
          return
        }
        this.form.commonFileListForPO = myFileIdsForPO
        this.collapseWarningForPODetail = false
      }

      if (this.form.salesQuotationType === 'MixDesign') {
        const valid3 = await this.$refs.projectInfo.submitForm()
        if (!valid3) {
          this.$modal.msgError(
            this.$t('ui.fromIncomplete').replace(
              '$1',
              this.$t('SALES.projectInfo')
            )
          )
          this.collapseWarningForProjectInfo = true
          return
        }
        this.collapseWarningForProjectInfo = false
      }

      let param = { ...this.form }
      if (param.salesQuotationType === 'MixDesign') {
        // 配合比
        const validProject = this.validMixDesignList(
          param.salesQuotationMixDesignList
        )
        if (!validProject) {
          this.$refs.ProductInfo.activeName = 'mixDesign'
          this.collapseWarningForProductInfo = true
          return
        }

        // 项目任务
        if (param.specialRequirement === '3') {
          const validService = this.validMixDesignServiceList(
            param.salesQuotationServiceList
          )
          if (!validService) {
            this.$refs.ProductInfo.activeName = 'projectTaskMixDesign'
            this.collapseWarningForProductInfo = true
            return
          }
        }
      }

      this.collapseWarningForProductInfo = false
      param.commonFileList = myFileIds
      param.productMsgType = param.productMsgTypeList.join(',')
      param = this.$trimOfObj(JSON.parse(JSON.stringify(param)))

      let confirmMsg
      let successMsg
      let submitFn
      if (submitType === 'generateSO') {
        confirmMsg = this.$t('SALES.SQGenerateSOConfirm')
        successMsg = this.$t('SALES.SQGenerateSOSuccess')
        submitFn = generateSO
      } else {
        confirmMsg = this.getSQSubmitConfirm()
        successMsg = this.$t('SALES.SQSubmitSuccess')
        submitFn = saveSalesQuotation
      }

      if (this.pageType === 'revise') {
        submitFn = reviseSalesQuotation
      }

      this.$modal
        .confirm(confirmMsg)
        .then(() => {
          this.submitLoading = true
          return submitFn(param)
        })
        .then(response => {
          const resData = response.data || {}
          const orderNo =
            submitType === 'generateSO'
              ? resData.salesOrderNo
              : resData.salesQuotationNo
          this.$modal.msgSuccess(successMsg.replace('$1', orderNo))
          this.submitLoading = false

          if (submitType === 'generateSO') {
            this.cancel()
          } else {
            this.submitSuccess(resData.salesQuotationMainId)
          }
        })
        .catch(() => {
          this.submitLoading = false
        })
    },

    async handleGenerateSO() {
      this.submitForm('generateSO')
    },
    validMixDesignList(detailList) {
      const valid = false
      if (detailList.length <= 0) {
        this.$modal.msgError(this.$t('SALES.mixDesignTableEmpty'))
        return valid
      }
      const salesPartNoReq = detailList.find(item => {
        return !this.$resultOfBoolean(item.salesPartNo)
      })
      if (salesPartNoReq) {
        this.$modal.msgError(
          this.$t('ui.commonReqMsg').replace('$1', this.$t('SALES.salesPartNo'))
        )
        return valid
      }

      const volumeReq = detailList.find(item => {
        return !this.$resultOfBoolean(item.volume)
      })
      if (volumeReq) {
        this.$modal.msgError(
          this.$t('ui.commonReqMsg').replace('$1', this.$t('SALES.volume'))
        )
        return valid
      }

      const unitPriceReq = detailList.find(item => {
        return !this.$resultOfBoolean(item.unitPrice)
      })
      if (unitPriceReq) {
        this.$modal.msgError(
          this.$t('ui.commonReqMsg').replace('$1', this.$t('SALES.price'))
        )
        return valid
      }

      return true
    },
    validMixDesignServiceList(detailList) {
      const valid = false
      if (detailList.length <= 0) {
        // ERP 1.1.0-26-4 版本 改为选填
        return true
        // this.$modal.msgError(this.$t('SALES.projectTaskTableEmpty'))
        // return valid
      }
      const qtyReq = detailList.find(item => {
        return !this.$resultOfBoolean(item.qty)
      })
      if (qtyReq) {
        this.$modal.msgError(
          this.$t('ui.commonReqMsg').replace('$1', this.$t('SALES.qty'))
        )
        return valid
      }

      const unitPriceReq = detailList.find(item => {
        return !this.$resultOfBoolean(item.unitPrice)
      })
      if (unitPriceReq) {
        this.$modal.msgError(
          this.$t('ui.commonReqMsg').replace('$1', this.$t('SALES.unitPrice'))
        )

        return valid
      }
      return true
    },
    handlePreviewPDF() {
      const token = getToken()
      const params = { ...this.form }
      this.previewPDFLoading = true
      preview(params)
        .then(res => {
          this.previewPDFLoading = false
          const fileID = res.data || ''
          if (fileID) {
            const myUrl =
              import.meta.env.VITE_APP_BASE_API +
              '/system/oss/filePreview/' +
              `${fileID}` +
              '?token=' +
              `${token}`
            window.open(myUrl, 'print')
          }
        })
        .catch(() => {
          this.previewPDFLoading = false
        })
    },
    handlePrintPDF() {
      const token = getToken()
      const myUrl =
        import.meta.env.VITE_APP_BASE_API +
        '/erp/salesQuotation/preview' +
        `/${this.form.salesQuotationMainId}` +
        '?token=' +
        `${token}`
      window.open(myUrl, 'print')
    },
    querySalesQuotationHistoryVersion() {
      querySalesQuotationHistoryVersion({ businessId: this.rowId }).then(
        res => {
          this.bpHistoryVersionList = res.data || []
        }
      )
    },
    settingHandleCommand(businessId) {
      this.$router.push({
        path: '/redirect' + '/salesManagement/viewSalesQuotation',
        query: {
          id: businessId,
          salesOpportunityId: this.form.salesOpportunityId,
          timeId: Date.now()
        }
      })
    },
    dropdownVisibleChange() {
      /* 下拉菜单关闭后滚动条 手动还原 */
      if (this.$refs.scrollbar) {
        this.$refs.scrollbar.moveY = 0
      }
    },

    handleRevise() {
      const obj = {
        path: '/salesManagement/reviseSalesQuotation',
        query: {
          salesOpportunityId: this.form.salesOpportunityId,
          id: this.form.salesQuotationMainId,
          timeId: Date.now()
        }
      }
      this.$tab.closeOpenPage(obj)
    }
  }
}
</script>
<style lang="scss">
.collapse-item-content-pt0 {
  .el-collapse-item__content {
    padding-top: 10px;
  }
}
</style>
