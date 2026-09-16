<template>
  <FormPageLayout v-loading="loading || submitLoading">
    <template #btn>
      <el-button
        v-if="canSubmit"
        type="primary"
        size="small"
        :loading="submitLoading"
        @click="submitForm('submit')"
      >
        {{ $t('uiBtn.submit') }}
      </el-button>
      <el-button
        v-if="canSaveDraft"
        type="primary"
        size="small"
        :loading="submitLoading"
        @click="submitForm('save')"
      >
        {{ $t('uiBtn.saveDraft') }}
      </el-button>
      <el-button
        v-if="canApprove"
        type="primary"
        size="small"
        @click="openApprove"
      >
        {{ $t('uiBtn.approve') }}
      </el-button>
      <el-button
        v-if="canReject"
        type="primary"
        size="small"
        @click="openAction('reject')"
      >
        {{ $t('uiBtn.reject1') }}
      </el-button>
      <el-button
        v-if="canWithdraw"
        type="primary"
        size="small"
        @click="withdrawApproval"
      >
        {{ $t('uiBtn.withdrawApprove') }}
      </el-button>
      <el-button
        v-if="canCancel"
        type="primary"
        size="small"
        @click="openAction('cancel')"
      >
        {{ $t('uiBtn.cancel') }}
      </el-button>
      <el-button
        v-if="canClose"
        type="primary"
        size="small"
        @click="openAction('close')"
      >
        {{ $t('uiBtn.close') }}
      </el-button>
      <el-button v-if="canRevise" type="primary" size="small" @click="goRevise">
        {{ $t('uiBtn.revise') }}
      </el-button>
      <el-button
        v-if="canCompare"
        type="primary"
        size="small"
        @click="compareVisible = true"
      >
        {{ $t('PURCHASE.revisionComparison') }}
      </el-button>
      <el-button type="primary" size="small" @click="back">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>

    <template #content>
      <el-alert
        v-if="showRevisionAlert"
        class="mb10"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #title>
          <span>{{ $t('PURCHASE.pendingRevisionReview') }}</span>
          <el-button
            link
            type="primary"
            class="ml10"
            @click="compareVisible = true"
          >
            {{ $t('PURCHASE.revisionComparison') }}
          </el-button>
        </template>
      </el-alert>

      <el-collapse v-model="activeNames">
        <div class="form-card">
          <el-collapse-item name="basic">
            <template #title>
              <FormCollapseItemTitle :title="$t('ui.basicInfo')" />
            </template>

            <el-form
              ref="formRef"
              :model="form"
              label-width="180px"
              @submit.prevent
            >
              <el-row :gutter="12">
                <el-col :span="8">
                  <el-form-item :label="$t('PURCHASE.requiredFrom')">
                    <el-input :model-value="requiredTypeLabel" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('ui.status')">
                    <el-input
                      :model-value="form.purchaseRequisiteStatusShowStr || ''"
                      disabled
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('PURCHASE.purchaseRequisitionNo')">
                    <el-input v-model="form.purchaseRequisiteNo" disabled />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="12">
                <el-col :span="8">
                  <el-form-item :label="$t('ui.dept')" required>
                    <el-select
                      v-model="form.departmentId"
                      style="width: 100%"
                      filterable
                      clearable
                      :disabled="formReadOnly"
                      :loading="optionLoading.department"
                      @change="departmentChange"
                    >
                      <el-option
                        v-for="item in departmentOptions"
                        :key="item.departmentId"
                        :label="item.departmentName"
                        :value="item.departmentId"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('PURCHASE.requiredBy')" required>
                    <el-select
                      v-model="form.requiredId"
                      style="width: 100%"
                      filterable
                      clearable
                      :disabled="formReadOnly || !form.departmentId"
                      :loading="optionLoading.requiredBy"
                      @change="requiredByChange"
                    >
                      <el-option
                        v-for="item in requiredByOptions"
                        :key="item.userId"
                        :label="item.nickName"
                        :value="item.userId"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('PURCHASE.projectCode')">
                    <el-select
                      v-model="form.costProjectId"
                      style="width: 100%"
                      filterable
                      clearable
                      :disabled="formReadOnly"
                      :loading="optionLoading.project"
                      @change="costProjectChange"
                    >
                      <el-option
                        v-for="item in projectOptions"
                        :key="item.costProjectId"
                        :label="item.costProjectCode"
                        :value="item.costProjectId"
                      >
                        <span>{{ item.costProjectCode }}</span>
                        <span v-if="item.costProjectName">
                          · {{ item.costProjectName }}</span
                        >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="12">
                <el-col :span="8">
                  <el-form-item :label="$t('PURCHASE.dropShipping')">
                    <el-switch
                      v-model="form.dropShipping"
                      active-value="1"
                      inactive-value="0"
                      :disabled="
                        formReadOnly ||
                        containsSystemDockingProduct ||
                        form.isSalesDropShipping === '1'
                      "
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item
                    v-if="form.dropShipping === '1'"
                    :label="$t('PURCHASE.deliveryAddress')"
                    required
                  >
                    <el-select
                      v-model="form.receiveAddressName"
                      style="width: 100%"
                      filterable
                      allow-create
                      clearable
                      default-first-option
                      :disabled="formReadOnly"
                      @change="dropShippingAddressChange"
                    >
                      <el-option
                        v-for="item in dropShippingAddressOptions"
                        :key="item.receiveAddressName"
                        :label="item.receiveAddressName"
                        :value="item.receiveAddressName"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    v-else
                    :label="$t('PURCHASE.deliveryAddress')"
                    required
                  >
                    <el-select
                      v-model="form.warehouseId"
                      style="width: 100%"
                      filterable
                      clearable
                      :disabled="formReadOnly"
                      :loading="optionLoading.warehouse"
                      @change="warehouseChange"
                    >
                      <el-option
                        v-for="item in warehouseOptions"
                        :key="item.warehouseId"
                        :label="item.warehouseName"
                        :value="item.warehouseId"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row v-if="form.dropShipping === '1'" :gutter="12">
                <el-col :span="8">
                  <el-form-item :label="$t('PURCHASE.consignee')" required>
                    <el-input
                      v-model="form.contactPersonName"
                      maxlength="200"
                      :disabled="formReadOnly"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('PURCHASE.requestedEmail')">
                    <el-input
                      v-model.trim="form.email"
                      maxlength="500"
                      :disabled="formReadOnly"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="$t('PURCHASE.requestedMobilePhone')">
                    <MobilePhoneInput
                      v-model:mobileCode="form.mobileCode"
                      v-model:mobileNum="form.mobileNum"
                      v-model:mobileNo="form.mobilePhone"
                      :disabled="formReadOnly"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="12">
                <el-col :span="24">
                  <el-form-item :label="$t('ui.reason')">
                    <el-input
                      v-model="form.reason"
                      type="textarea"
                      :rows="3"
                      maxlength="200"
                      show-word-limit
                      :disabled="formReadOnly"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="$t('ui.attachment')">
                    <myUpload ref="uploadRef" :disabled="formReadOnly" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="products">
            <template #title>
              <FormCollapseItemTitle :title="$t('PURCHASE.productInfo')" />
            </template>

            <div class="pr-detail-toolbar" v-if="!formReadOnly">
              <el-button
                type="primary"
                size="small"
                :disabled="form.dropShipping !== '1' && !form.warehouseId"
                @click="productDialogVisible = true"
              >
                {{ $t('PURCHASE.addProduct') }}
              </el-button>
              <el-button
                v-if="canAddAdhoc"
                type="primary"
                size="small"
                :disabled="form.dropShipping !== '1' && !form.warehouseId"
                @click="addAdhocRow"
              >
                {{ $t('PURCHASE.addAdhocEntry') }}
              </el-button>
              <el-button
                v-if="canAddCustom"
                type="primary"
                size="small"
                :disabled="form.dropShipping !== '1' && !form.warehouseId"
                @click="addCustomRow"
              >
                {{ $t('PURCHASE.addCustomProduct') }}
              </el-button>
              <el-input
                v-model="detailKeyword"
                class="pr-detail-search"
                clearable
                :placeholder="$t('ui.productSearch1')"
              />
            </div>

            <el-table
              ref="detailTable"
              :data="filteredDetails"
              border
              row-key="_rowKey"
              max-height="520"
              v-table-tab
              :row-class-name="detailRowClassName"
            >
              <el-table-column
                type="index"
                :label="$t('ui.sn')"
                width="60"
                align="center"
              />
              <el-table-column
                prop="productName"
                :label="$t('PURCHASE.productName')"
                min-width="190"
              >
                <template #default="scope">
                  <el-input
                    v-if="isFreeTextProduct(scope.row) && !formReadOnly"
                    v-model="scope.row.productName"
                    maxlength="200"
                  />
                  <span v-else>{{ scope.row.productName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="internalPartNo"
                :label="$t('PURCHASE.internalPartNo')"
                min-width="160"
                show-overflow-tooltip
              />
              <el-table-column
                prop="externalPartNo"
                :label="$t('PURCHASE.externalPartNo')"
                min-width="160"
                show-overflow-tooltip
              >
                <template #default="scope">
                  {{ externalPartNoText(scope.row) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="alias"
                :label="$t('PURCHASE.alias')"
                min-width="130"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <el-input
                    v-if="isFreeTextProduct(scope.row) && !formReadOnly"
                    v-model="scope.row.alias"
                    maxlength="200"
                  />
                  <span v-else>{{ scope.row.alias }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="description"
                :label="$t('ui.description')"
                min-width="200"
              >
                <template #default="scope">
                  <el-input
                    v-if="!formReadOnly"
                    v-model="scope.row.description"
                    maxlength="7000"
                  />
                  <span v-else>{{ scope.row.description }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="uom"
                :label="$t('PURCHASE.uom')"
                min-width="120"
              >
                <template #default="scope">
                  <el-select
                    v-if="isFreeTextProduct(scope.row) && !formReadOnly"
                    v-model="scope.row.uom"
                    filterable
                    style="width: 100%"
                    @change="freeTextUomChange(scope.row)"
                  >
                    <el-option
                      v-for="item in allUomList"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                  <span v-else>{{ scope.row.uom }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="qty"
                :label="$t('PURCHASE.qty')"
                min-width="130"
              >
                <template #default="scope">
                  <el-input-number
                    v-if="!formReadOnly"
                    v-model="scope.row.qty"
                    controls-position="right"
                    :precision="Number(scope.row.decimalNum ?? 3)"
                    :min="scope.row.includeDecimal === '1' ? 0.001 : 1"
                    :max="999999"
                    style="width: 100%"
                  />
                  <span v-else>{{
                    $numberStr(scope.row.qty, scope.row.decimalNum ?? 3)
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="mode !== 'add'"
                prop="receiptQtyForBasic"
                :label="$t('PURCHASE.receivedQty')"
                min-width="125"
              >
                <template #default="scope">
                  {{
                    $numberStr(
                      scope.row.receiptQtyForBasic,
                      scope.row.decimalNum ?? 3
                    )
                  }}
                </template>
              </el-table-column>
              <el-table-column
                prop="deliveryDate"
                :label="$t('PURCHASE.requestedReceiptDate')"
                min-width="170"
              >
                <template #default="scope">
                  <el-date-picker
                    v-if="!formReadOnly"
                    v-model="scope.row.deliveryDate"
                    type="date"
                    value-format="x"
                    style="width: 100%"
                    :disabled-date="disabledDeliveryDate"
                    @change="deliveryDateChange(scope.$index, scope.row)"
                  />
                  <span v-else>{{ formatDate(scope.row.deliveryDate) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="remarks"
                :label="$t('ui.remarks')"
                min-width="180"
              >
                <template #default="scope">
                  <el-input
                    v-if="!formReadOnly"
                    v-model="scope.row.remarks"
                    maxlength="200"
                  />
                  <span v-else>{{ scope.row.remarks }}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="!formReadOnly"
                :label="$t('ui.action')"
                width="90"
                fixed="right"
                align="center"
              >
                <template #default="scope">
                  <el-button
                    link
                    type="danger"
                    @click="removeDetail(scope.row)"
                  >
                    {{ $t('uiBtn.delete') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-form label-width="180px" class="mt20">
              <el-form-item :label="$t('ui.remarks')">
                <el-input
                  v-model="form.remarks"
                  type="textarea"
                  :rows="3"
                  maxlength="3000"
                  show-word-limit
                  :disabled="formReadOnly"
                />
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </div>

        <div v-if="operationLogList.length" class="form-card mt10">
          <el-collapse-item name="log">
            <template #title>
              <FormCollapseItemTitle :title="$t('ui.systemOperationLog')" />
            </template>
            <el-table :data="operationLogList" border max-height="320">
              <el-table-column
                prop="operatorBy"
                :label="$t('ui.operName')"
                min-width="150"
              />
              <el-table-column
                prop="operationDescription"
                :label="$t('ui.description')"
                min-width="260"
                show-overflow-tooltip
              />
              <el-table-column
                prop="operatorTime"
                :label="$t('ui.operTime')"
                min-width="180"
              >
                <template #default="scope">{{
                  formatDateTime(scope.row.operatorTime)
                }}</template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>

    <ProductSelectDialog
      v-model="productDialogVisible"
      :selected-rows="productRows"
      :warehouse-id="form.dropShipping === '1' ? '' : form.warehouseId"
      :drop-shipping="form.dropShipping || '0'"
      :cost-project-id="form.costProjectId"
      @confirm="productSelectionConfirm"
    />

    <PrActionDialog
      v-model="actionVisible"
      :type="actionType"
      :operator="$store.state.user.nickName"
      :loading="actionLoading"
      @confirm="confirmAction"
    />

    <RevisionCompareDialog
      v-model="compareVisible"
      :purchase-requisite-id="form.purchaseRequisiteId || id"
    />
  </FormPageLayout>
</template>

<script>
import { ElMessageBox } from 'element-plus'
import {
  approvedPurchaseRequisite,
  cancelledPR,
  closedPR,
  queryCanSelectWarehouseDefaultWarehouse,
  queryDropShippingAddressOptions,
  queryPRCanSelectWarehouseList,
  queryPurchaseRequisiteById,
  rejectedPurchaseRequisite,
  revisePurchaseRequisite,
  saveDraftPurchaseRequisite,
  savePurchaseRequisite,
  withdrawApproved
} from '@/api/purchaseManagement/purchaseRequisition'
import { queryUserDepartment } from '@/api/system/user'
import { queryAllUomList } from '@/api/system/uom'
import { queryUsersNoPage } from '@/api/organization/corporate'
import { queryCanSelectCostProjectListForPage } from '@/api/projectManagement/project'
import { checkPermi } from '@/utils/permission'
import MyDictDataClass from '@/utils/dict/myDictDataClass'
import menuKey from '@/config/menuKey'
import { formDirtyClass } from '@/mixins/formDirtyClass'
import ProductSelectDialog from './components/ProductSelectDialog.vue'
import PrActionDialog from './components/PrActionDialog.vue'
import RevisionCompareDialog from './components/RevisionCompareDialog.vue'

export default {
  name: 'PurchaseRequisitionForm',
  components: {
    ProductSelectDialog,
    PrActionDialog,
    RevisionCompareDialog
  },
  props: {
    mode: {
      type: String,
      required: true,
      validator: value => ['add', 'edit', 'revise', 'view'].includes(value)
    },
    id: {
      type: [String, Number],
      default: ''
    }
  },
  emits: ['back', 'saved'],
  data() {
    return {
      loading: false,
      submitLoading: false,
      actionLoading: false,
      activeNames: ['basic', 'products', 'log'],
      form: this.createEmptyForm(),
      details: [],
      operationLogList: [],
      buttonAuthMsg: {},
      requiredTypeOptions: [],
      departmentOptions: [],
      requiredByOptions: [],
      projectOptions: [],
      warehouseOptions: [],
      dropShippingAddressOptions: [],
      allUomList: [],
      optionLoading: {
        department: false,
        requiredBy: false,
        project: false,
        warehouse: false
      },
      detailKeyword: '',
      productDialogVisible: false,
      actionVisible: false,
      actionType: 'approve',
      pendingApprovalForm: undefined,
      compareVisible: false,
      initialized: false
    }
  },
  computed: {
    dataType() {
      return String(this.$route.query.dataType || '1')
    },
    taskId() {
      return String(this.$route.query.taskId || this.form.taskId || '')
    },
    editPermission() {
      return checkPermi(['purchaseManagement:purchaseRequisition:edit'])
    },
    formReadOnly() {
      if (this.mode === 'view') return true
      if (this.mode === 'revise' || this.mode === 'add') return false
      return !(this.editPermission && this.buttonAuthMsg.isCanUpdate === '1')
    },
    canSubmit() {
      if (this.mode === 'add' || this.mode === 'revise') return true
      return this.mode === 'edit' && !this.formReadOnly
    },
    canSaveDraft() {
      if (this.mode === 'add') return true
      return (
        this.mode === 'edit' &&
        this.editPermission &&
        this.buttonAuthMsg.isCanSaveDraft === '1'
      )
    },
    canApprove() {
      if (this.mode !== 'edit') return false
      if (this.dataType === '3' && this.form.approvedStatus === '1') return true
      return this.dataType === '1' && this.buttonAuthMsg.isCanApproved === '1'
    },
    canReject() {
      if (this.mode !== 'edit') return false
      if (this.dataType === '3' && this.form.approvedStatus === '1') return true
      return this.dataType === '1' && this.buttonAuthMsg.isCanRejected === '1'
    },
    canWithdraw() {
      return (
        this.mode === 'edit' &&
        checkPermi([
          'purchaseManagement:purchaseRequisition:withdrawApprove'
        ]) &&
        this.buttonAuthMsg.isCanWithdrawApproved === '1'
      )
    },
    canCancel() {
      return (
        this.mode === 'edit' &&
        this.dataType !== '2' &&
        checkPermi(['purchaseManagement:purchaseRequisition:cancel']) &&
        this.buttonAuthMsg.isCanCancelled === '1'
      )
    },
    canClose() {
      return (
        this.mode === 'edit' &&
        this.dataType !== '2' &&
        checkPermi(['purchaseManagement:purchaseRequisition:close']) &&
        this.buttonAuthMsg.isCanClosed === '1'
      )
    },
    canRevise() {
      return (
        this.mode === 'edit' &&
        this.editPermission &&
        this.buttonAuthMsg.isCanRevise === '1' &&
        String(this.$route.query.comeFrom || '1') === '1'
      )
    },
    canCompare() {
      return Boolean(
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanSeeUpdateMsg === '1'
      )
    },
    showRevisionAlert() {
      return this.canApprove && this.canCompare
    },
    canAddAdhoc() {
      return checkPermi([
        'purchaseManagement:purchaseRequisition:addAdhocEntry'
      ])
    },
    canAddCustom() {
      return checkPermi([
        'purchaseManagement:purchaseRequisition:addCustomProduct'
      ])
    },
    productRows() {
      return this.details.filter(row => row.productId)
    },
    filteredDetails() {
      const keyword = this.detailKeyword.trim().toLowerCase()
      if (!keyword) return this.details
      return this.details.filter(row =>
        [row.productName, row.internalPartNo, row.description]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(keyword))
      )
    },
    requiredTypeLabel() {
      const item = this.requiredTypeOptions.find(
        option => String(option.dictValue) === String(this.form.requiredType)
      )
      return item?.dictLabel || this.form.requiredType || ''
    },
    containsSystemDockingProduct() {
      return this.details.some(row => row.isSystemDocking === '1')
    }
  },
  mounted() {
    this.initialize()
  },
  beforeUnmount() {
    if (formDirtyClass.routeStatusData[this.$route.name]?.$vm === this) {
      delete formDirtyClass.routeStatusData[this.$route.name]
    }
  },
  methods: {
    createEmptyForm() {
      return {
        requiredType: '1',
        dropShipping: '0',
        requiredId: this?.$store?.state?.user?.userId || '',
        requiredBy: this?.$store?.state?.user?.nickName || '',
        createdBy: this?.$store?.state?.user?.nickName || '',
        receiveAddressName: ''
      }
    },
    async initialize() {
      this.loading = true
      try {
        await this.loadBaseOptions()
        if (this.mode === 'add') {
          await this.initializeAdd()
        } else if (this.id) {
          await this.loadRecord()
        }
        this.initialized = true
        this.registerDirtyState()
      } finally {
        this.loading = false
      }
    },
    async loadBaseOptions() {
      this.optionLoading.department = true
      this.optionLoading.project = true
      this.optionLoading.warehouse = true
      const results = await Promise.allSettled([
        MyDictDataClass.getDictFn('p_required_type'),
        queryUserDepartment({ menuPerms: menuKey.PR }),
        queryAllUomList(),
        queryDropShippingAddressOptions(),
        queryCanSelectCostProjectListForPage({
          pageNum: 1,
          pageSize: 9999,
          menuPerms: menuKey.PR
        }),
        queryPRCanSelectWarehouseList({
          pageNum: 1,
          pageSize: 9999,
          warehouseType: '1',
          menuPerms: menuKey.PR
        })
      ])

      this.requiredTypeOptions =
        results[0].status === 'fulfilled' ? results[0].value || [] : []
      this.departmentOptions =
        results[1].status === 'fulfilled' ? results[1].value.data || [] : []
      this.allUomList =
        results[2].status === 'fulfilled' ? results[2].value.data || [] : []
      this.dropShippingAddressOptions =
        results[3].status === 'fulfilled' ? results[3].value.data || [] : []
      this.projectOptions =
        results[4].status === 'fulfilled' ? results[4].value.rows || [] : []
      this.warehouseOptions =
        results[5].status === 'fulfilled' ? results[5].value.rows || [] : []

      this.optionLoading.department = false
      this.optionLoading.project = false
      this.optionLoading.warehouse = false
    },
    async initializeAdd() {
      this.form = this.createEmptyForm()
      const defaultDepartment = this.departmentOptions.find(
        item => item.isDefault === '1'
      )
      if (defaultDepartment) {
        this.applyDepartment(defaultDepartment)
        await this.loadRequiredByOptions()
      }

      try {
        const response = await queryCanSelectWarehouseDefaultWarehouse({
          menuPerms: menuKey.PR
        })
        if (response.data?.warehouseId) this.applyWarehouse(response.data)
      } catch {
        // 默认仓库加载失败不阻塞新增页，其它仓库仍可手工选择。
      }
    },
    async loadRecord() {
      const response = await queryPurchaseRequisiteById({
        purchaseRequisiteId: this.id,
        taskId: this.taskId || undefined
      })
      const data = response.data || {}
      if (!data.requiredId) {
        data.requiredId = this.$store.state.user.userId
        data.requiredBy = this.$store.state.user.nickName
      }
      this.form = { ...data }
      this.buttonAuthMsg = data.buttonAuthMsg || {}
      this.operationLogList = data.operationLogList || []
      this.details = (data.purchaseRequisiteDetailList || []).map(
        (row, index) => this.normalizeDetail(row, index)
      )

      if (
        this.mode === 'revise' &&
        this.form.isNoEnoughInventoryPr === '1' &&
        this.form.dropShipping !== '1'
      ) {
        this.form.warehouseName = this.form.documentWarehouseName
        this.form.warehouseId = this.form.documentWarehouseId
      }

      if (this.form.departmentId) await this.loadRequiredByOptions()
      this.$nextTick(() => {
        this.$refs.uploadRef?.initFileList?.(data.commonFileList || [])
      })
    },
    normalizeDetail(row, index = 0) {
      let externalPartNoList = row.externalPartNoList || []
      if (!externalPartNoList.length && row.externalPartNoListJson) {
        try {
          externalPartNoList = Array.isArray(row.externalPartNoListJson)
            ? row.externalPartNoListJson
            : JSON.parse(row.externalPartNoListJson)
        } catch {
          externalPartNoList = []
        }
      }
      return {
        ...row,
        _rowKey:
          row.purchaseRequisiteDetailId ||
          row.productId ||
          row.customId ||
          `pr-${Date.now()}-${index}`,
        productType: row.productType || '1',
        includeDecimal: row.includeDecimal || '1',
        decimalNum: Number.isFinite(Number(row.decimalNum))
          ? Number(row.decimalNum)
          : 3,
        uom: row.uom || row.inventoryUom || row.basicUom || '',
        basicUom: row.basicUom || row.inventoryUom || row.uom || '',
        uomCoefficient: row.uomCoefficient || 1,
        externalPartNoList
      }
    },
    async loadRequiredByOptions() {
      if (!this.form.departmentId) {
        this.requiredByOptions = []
        return
      }
      this.optionLoading.requiredBy = true
      try {
        const response = await queryUsersNoPage({
          departmentId: this.form.departmentId,
          menuPerms: menuKey.PR
        })
        this.requiredByOptions = response.data || []
      } finally {
        this.optionLoading.requiredBy = false
      }
    },
    applyDepartment(item) {
      this.form.departmentId = item?.departmentId || ''
      this.form.departmentName = item?.departmentName || ''
      this.form.allSuperiorName = item?.allSuperiorName || ''
    },
    async departmentChange(value) {
      const item = this.departmentOptions.find(
        option => option.departmentId === value
      )
      this.applyDepartment(item)
      const keepCurrentUser =
        this.form.requiredId === this.$store.state.user.userId
      if (!keepCurrentUser) {
        this.form.requiredId = ''
        this.form.requiredBy = ''
      }
      await this.loadRequiredByOptions()
    },
    requiredByChange(value) {
      const item = this.requiredByOptions.find(
        option => option.userId === value
      )
      this.form.requiredId = item?.userId || ''
      this.form.requiredBy = item?.nickName || ''
    },
    costProjectChange(value) {
      const item = this.projectOptions.find(
        option => option.costProjectId === value
      )
      this.form.costProjectId = item?.costProjectId || ''
      this.form.costProjectCode = item?.costProjectCode || ''
      this.form.costProjectName = item?.costProjectName || ''
      if (item?.receiveAddress && this.form.dropShipping === '1') {
        this.form.receiveAddressName = item.receiveAddress
      }
      const partner = item?.businessPartner || {}
      if (partner.countryMobileCode)
        this.form.mobileCode = partner.countryMobileCode
    },
    applyWarehouse(item) {
      this.form.warehouseId = item?.warehouseId || ''
      this.form.warehouseName = item?.warehouseName || ''
      this.form.noCanSelectProductIdList = item?.noCanSelectProductIdList || []
    },
    warehouseChange(value) {
      const item = this.warehouseOptions.find(
        option => option.warehouseId === value
      )
      this.applyWarehouse(item)
    },
    dropShippingAddressChange(value) {
      const item = this.dropShippingAddressOptions.find(
        option => option.receiveAddressName === value
      )
      if (!item) return
      this.form.receiveAddressName = item.receiveAddressName
      if (item.contactPersonName) {
        this.form.title = item.title
        this.form.contactPersonName = item.contactPersonName
        this.form.email = item.email
        this.form.mobileCode = item.mobileCode
        this.form.mobileNum = item.mobileNum
        this.form.mobilePhone = item.mobilePhone
      }
    },
    isFreeTextProduct(row) {
      return row.isAdhocEntry === '1' || row.isCustomProduct === '1'
    },
    externalPartNoText(row) {
      if (
        Array.isArray(row.externalPartNoList) &&
        row.externalPartNoList.length
      ) {
        return row.externalPartNoList.join(', ')
      }
      return row.externalPartNo || ''
    },
    freeTextUomChange(row) {
      row.basicUom = row.uom
      row.uomCoefficient = 1
    },
    addAdhocRow() {
      this.details.push(
        this.normalizeDetail({
          customId: Date.now(),
          isAdhocEntry: '1',
          productType: '1',
          includeDecimal: '1',
          decimalNum: 3,
          uomCoefficient: 1,
          deliveryDate: this.details[0]?.deliveryDate || ''
        })
      )
    },
    addCustomRow() {
      this.details.push(
        this.normalizeDetail({
          customId: Date.now(),
          isCustomProduct: '1',
          productType: '1',
          includeDecimal: '1',
          decimalNum: 3,
          uomCoefficient: 1,
          deliveryDate: this.details[0]?.deliveryDate || ''
        })
      )
    },
    productSelectionConfirm(rows) {
      const freeTextRows = this.details.filter(row => !row.productId)
      const firstDeliveryDate = this.details[0]?.deliveryDate
      this.details = [
        ...rows.map((row, index) => {
          const normalized = this.normalizeDetail(row, index)
          if (!normalized.deliveryDate && firstDeliveryDate) {
            normalized.deliveryDate = firstDeliveryDate
          }
          return normalized
        }),
        ...freeTextRows
      ]
    },
    async removeDetail(row) {
      try {
        await this.$modal.confirm(this.$t('ui.delConfirm'))
        this.details = this.details.filter(item => item._rowKey !== row._rowKey)
      } catch {
        // user cancelled
      }
    },
    disabledDeliveryDate(time) {
      return time.getTime() < Date.now() - 90 * 24 * 60 * 60 * 1000
    },
    async deliveryDateChange(index, row) {
      row.deliveryDate = row.deliveryDate
        ? Number(row.deliveryDate)
        : row.deliveryDate
      if (index !== 0 || !row.deliveryDate || this.details.length < 2) return
      const hasOtherDate = this.details.slice(1).some(item => item.deliveryDate)
      if (!hasOtherDate) {
        this.details.slice(1).forEach(item => {
          item.deliveryDate = row.deliveryDate
        })
        return
      }
      try {
        await this.$modal.confirm(this.$t('PURCHASE.applyFirstDeliveryDate'))
        this.details.slice(1).forEach(item => {
          item.deliveryDate = row.deliveryDate
        })
      } catch {
        // Keep individual dates.
      }
    },
    formatDate(value) {
      return value ? this.parseTime(value, this.$store.getters.fmtForYmd) : ''
    },
    formatDateTime(value) {
      return value
        ? this.parseTime(value, this.$store.getters.fmtForYmdhms)
        : ''
    },
    detailRowClassName({ row }) {
      if (row['ROW-ERROR']) return 'required-row'
      if (row.updateType === '2') return 'new-add-row'
      if (row.updateType === '3') return 'cancel-row'
      return ''
    },
    validateEmail() {
      if (!this.form.email) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)
    },
    validateForSubmit() {
      if (!this.form.departmentId) {
        this.$modal.msgError(`${this.$t('ui.dept')}: ${this.$t('ui.reqMsg')}`)
        return false
      }
      if (!this.form.requiredId) {
        this.$modal.msgError(
          `${this.$t('PURCHASE.requiredBy')}: ${this.$t('ui.reqMsg')}`
        )
        return false
      }
      if (this.form.dropShipping === '1') {
        if (!String(this.form.receiveAddressName || '').trim()) {
          this.$modal.msgError(
            `${this.$t('PURCHASE.deliveryAddress')}: ${this.$t('ui.reqMsg')}`
          )
          return false
        }
        if (!String(this.form.contactPersonName || '').trim()) {
          this.$modal.msgError(
            `${this.$t('PURCHASE.consignee')}: ${this.$t('ui.reqMsg')}`
          )
          return false
        }
        if (!this.validateEmail()) {
          this.$modal.msgError(this.$t('PURCHASE.invalidEmail'))
          return false
        }
      } else if (!this.form.warehouseId) {
        this.$modal.msgError(
          `${this.$t('PURCHASE.deliveryAddress')}: ${this.$t('ui.reqMsg')}`
        )
        return false
      }

      if (!this.details.length) {
        this.$modal.msgError(this.$t('PURCHASE.prProductTableEmpty'))
        return false
      }

      const requiredFields = [
        ['productName', this.$t('PURCHASE.productName')],
        ['uom', this.$t('PURCHASE.uom')],
        ['qty', this.$t('PURCHASE.qty')],
        ['deliveryDate', this.$t('PURCHASE.requestedReceiptDate')]
      ]
      let hasError = false
      this.details.forEach(row => {
        row['ROW-ERROR'] = false
        requiredFields.forEach(([field]) => {
          if (
            row[field] === undefined ||
            row[field] === null ||
            String(row[field]).trim() === ''
          ) {
            row[`${field}Error`] = true
            row['ROW-ERROR'] = true
            hasError = true
          } else {
            row[`${field}Error`] = false
          }
        })
      })
      if (hasError) {
        this.$modal.msgError(this.$t('PURCHASE.detailIncomplete'))
        return false
      }
      return true
    },
    collectAttachments() {
      const fileIds = this.$refs.uploadRef?.getFileIds?.() ?? []
      return fileIds
    },
    buildPayload() {
      const commonFileList = this.collectAttachments()
      if (commonFileList === false) return false
      const payload = JSON.parse(JSON.stringify(this.form))
      payload.commonFileList = commonFileList
      payload.purchaseRequisiteDetailList = this.details.map(row => {
        const item = { ...row }
        delete item._rowKey
        if (item.deliveryDate) item.deliveryDate = Number(item.deliveryDate)
        const externalList = Array.isArray(item.externalPartNoList)
          ? item.externalPartNoList
          : []
        if (externalList.length) {
          item.externalPartNo = externalList.join(',')
          item.externalPartNoListJson = JSON.stringify(externalList)
        } else {
          item.externalPartNoListJson = item.externalPartNoListJson || undefined
        }
        return item
      })

      if (payload.dropShipping === '1') {
        payload.warehouseId = undefined
        payload.warehouseName = undefined
        payload.noCanSelectProductIdList = undefined
      } else {
        payload.receiveAddressName = undefined
        payload.title = undefined
        payload.contactPersonName = undefined
        payload.email = undefined
        payload.mobileCode = undefined
        payload.mobileNum = undefined
        payload.mobilePhone = undefined
      }
      if (!payload.mobileNum) {
        payload.mobileCode = undefined
        payload.mobilePhone = undefined
      }
      return payload
    },
    async removeUnavailableWarehouseProducts(payload) {
      const blockedIds = payload.noCanSelectProductIdList || []
      if (!blockedIds.length) return payload
      const blockedRows = payload.purchaseRequisiteDetailList.filter(row =>
        blockedIds.includes(row.productId)
      )
      if (!blockedRows.length) return payload

      const names = blockedRows
        .map(row => row.productName)
        .filter(Boolean)
        .join(', ')
      await ElMessageBox.confirm(
        `${this.$t('PURCHASE.switchToTip').replace('$1', payload.warehouseName || '')} ${names}. ${this.$t('PURCHASE.switchToTip2')}`,
        this.$t('PURCHASE.warehouseChangeNotice'),
        {
          confirmButtonText: this.$t('PURCHASE.autoRemoveSubmit'),
          cancelButtonText: this.$t('uiBtn.back'),
          type: 'warning'
        }
      )
      payload.purchaseRequisiteDetailList =
        payload.purchaseRequisiteDetailList.filter(
          row => !blockedIds.includes(row.productId)
        )
      this.details = this.details.filter(
        row => !blockedIds.includes(row.productId)
      )
      if (!payload.purchaseRequisiteDetailList.length) {
        this.$modal.msgError(this.$t('PURCHASE.prProductTableEmpty'))
        return false
      }
      return payload
    },
    async preparePayload(requireComplete = true) {
      if (requireComplete && !this.validateForSubmit()) return false
      let payload = this.buildPayload()
      if (!payload) return false
      if (requireComplete) {
        try {
          payload = await this.removeUnavailableWarehouseProducts(payload)
        } catch {
          return false
        }
      }
      return payload
    },
    async submitForm(type) {
      const isDraft = type === 'save'
      const payload = await this.preparePayload(!isDraft)
      if (!payload) return

      let api = savePurchaseRequisite
      let confirmText = this.$t('PURCHASE.prSubmitConfirm')
      let successText = this.$t('PURCHASE.prSubmitSuccess')
      if (isDraft) {
        api = saveDraftPurchaseRequisite
        confirmText = this.$t('PURCHASE.prSaveConfirm')
        successText = this.$t('PURCHASE.prSaveSuccess')
      } else if (this.mode === 'revise') {
        api = revisePurchaseRequisite
        confirmText = this.$t('PURCHASE.prReviseConfirm')
        successText = this.$t('PURCHASE.prReviseSuccess')
      }

      try {
        await this.$modal.confirm(confirmText)
      } catch {
        return
      }

      this.submitLoading = true
      try {
        const response = await api(payload)
        this.markDirtySaved()
        this.$modal.msgSuccess(response.msg || successText)
        this.$emit('saved', response)
        this.leavePage()
      } finally {
        this.submitLoading = false
      }
    },
    async openApprove() {
      this.pendingApprovalForm = undefined
      if (this.canSubmit) {
        const payload = await this.preparePayload(true)
        if (!payload) return
        this.pendingApprovalForm = payload
      }
      this.openAction('approve')
    },
    openAction(type) {
      this.actionType = type
      this.actionVisible = true
    },
    async confirmAction({ reason, commonFileList }) {
      const base = {
        businessId: this.form.purchaseRequisiteId,
        taskId: this.taskId || undefined,
        fromType: this.dataType,
        reason
      }
      let api
      let payload = base
      if (this.actionType === 'approve') {
        api = approvedPurchaseRequisite
        if (this.pendingApprovalForm) {
          payload = { ...base, purchaseRequisite: this.pendingApprovalForm }
        }
      } else if (this.actionType === 'reject') {
        api = rejectedPurchaseRequisite
      } else if (this.actionType === 'cancel') {
        api = cancelledPR
        payload = { ...base, commonFileList }
      } else {
        api = closedPR
        payload = { ...base, commonFileList }
      }

      this.actionLoading = true
      try {
        const response = await api(payload)
        this.actionVisible = false
        this.pendingApprovalForm = undefined
        this.markDirtySaved()
        this.$modal.msgSuccess(
          response.msg || this.$t('PURCHASE.actionSuccess')
        )
        this.leavePage()
      } finally {
        this.actionLoading = false
      }
    },
    async withdrawApproval() {
      try {
        await this.$modal.confirm(this.$t('PURCHASE.withdrawConfirm'))
        const response = await withdrawApproved({
          businessId: this.form.purchaseRequisiteId,
          taskId: this.taskId || undefined
        })
        this.$modal.msgSuccess(
          response.msg || this.$t('PURCHASE.actionSuccess')
        )
        await this.loadRecord()
        this.registerDirtyState()
      } catch {
        // user cancelled or request failed
      }
    },
    goRevise() {
      this.markDirtySaved()
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({
        path: '/purchaseManagement/revisePurchaseRequisition',
        query: {
          id: this.form.purchaseRequisiteId,
          timeId: Date.now()
        }
      })
    },
    getFormJson() {
      const files = this.$refs.uploadRef?.getFileIds?.()
      return JSON.stringify({
        form: this.form,
        details: this.details,
        files: files === false ? [] : files || []
      })
    },
    registerDirtyState() {
      if (!['add', 'edit'].includes(this.mode)) return
      this.$nextTick(() => {
        formDirtyClass.routeStatusData[this.$route.name] = {
          $vm: this,
          saveShow: this.canSaveDraft,
          submitShow: this.canSubmit,
          initFormJson: this.getFormJson(),
          getFormJson: this.getFormJson,
          isSaveSuccess: false,
          saveOrSubmitFn: () => this.submitForm('save')
        }
      })
    },
    markDirtySaved() {
      const state = formDirtyClass.routeStatusData[this.$route.name]
      if (state) state.isSaveSuccess = true
    },
    async back() {
      if (['add', 'edit'].includes(this.mode)) {
        const result = await formDirtyClass.showNotify(this.$route.name)
        if (result === 'save') {
          await this.submitForm('save')
          return
        }
        if (result === 'stop') return
      }
      this.leavePage()
    },
    leavePage() {
      this.$emit('back')
      this.$store.dispatch('tagsView/delView', this.$route)
      if (this.$route.query.backType === '2') {
        this.$router.back()
        return
      }
      this.$router.push({ path: '/purchaseManagement/purchaseRequisition' })
    }
  }
}
</script>

<style scoped lang="scss">
.pr-detail-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.pr-detail-search {
  width: 320px;
  margin-left: auto;
}
</style>
