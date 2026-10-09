<template>
  <FormPageLayout v-loading="submitLoading">
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        v-if="!comDisFrom"
        @click="submitForm"
        >{{ $t('uiBtn.submit') }}
      </el-button>

      <el-button type="primary" @click="back" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>

    <template v-slot:content>
      <div>
        <el-collapse v-model="activeNames">
          <div class="form-card">
            <el-collapse-item name="1">
              <template #title
                ><FormCollapseItemTitle
                  :title="$t('ui.basicInfo')"
                  :warning="collapseWarningForBasicInfo"
                >
                  <span
                    v-if="form.departmentName"
                    class="info-item mr20"
                    :title="form.departmentName"
                  >
                    {{ $t('ui.dept') }} : {{ form.departmentName }}
                  </span>
                  <span
                    v-if="form.warehouseName"
                    class="info-item mr20"
                    :title="form.warehouseName"
                  >
                    {{ $t('PURCHASE.deliveryAddress') }} :
                    {{ form.warehouseName }}
                  </span>
                  <span class="info-item" v-if="form.purchaseRequisiteStatus">
                    {{ $t('ui.status') }} :
                    {{ form.purchaseRequisiteStatusShowStr }}
                  </span>
                </FormCollapseItemTitle></template
              >
              <el-form
                ref="form1"
                :model="form"
                @submit.prevent
                :rules="rules"
                label-width="180px"
                :disabled="comDisFrom"
              >
                <el-row>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('PURCHASE.requiredFrom')}`">
                      <el-input
                        :model-value="`${selectDictLabel(dict.type.p_required_type, form.requiredType)} ${
                          form.documentNo || ''
                        }`"
                        disabled
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('ui.status')}`">
                      <el-input
                        :model-value="form.purchaseRequisiteStatusShowStr"
                        disabled
                      ></el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PURCHASE.purchaseRequisitionNo')}`"
                    >
                      <el-input
                        v-model="form.purchaseRequisiteNo"
                        disabled
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('ui.dept')}`"
                      prop="departmentId"
                    >
                      <SelectInput
                        :value="form.departmentName"
                        :title="form.allSuperiorName"
                        :disabled="true"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PURCHASE.requiredBy')}`"
                      prop="requiredBy"
                    >
                      <SelectInput
                        :value="form.requiredBy"
                        :title="form.requiredBy"
                        @clear="requiredByClear"
                        clearable
                        @click="openRequiredByTable"
                        :disabled="true"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PURCHASE.projectCode')}`"
                      prop="costProjectCode"
                      :rules="[
                        {
                          required: projectCodeIsReq,
                          message: $t('ui.reqMsg'),
                          trigger: ['change']
                        }
                      ]"
                    >
                      <SelectInput
                        :value="form.costProjectCode"
                        :title="form.costProjectCode"
                        @clear="costProjectNameClear"
                        clearable
                        @click="openCostProjectNameTable"
                        :disabled="true"
                        class="form-wd"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('PURCHASE.dropShipping')}`">
                      <el-switch
                        v-model="form.dropShipping"
                        active-value="1"
                        inactive-value="0"
                        :disabled="
                          tableListIncludeSystemDocking ||
                          form.isSalesDropShipping === '1'
                        "
                        @change="dropShippingChange"
                      ></el-switch>
                    </el-form-item>
                  </el-col>
                  <el-col :span="16">
                    <el-form-item
                      :label="`${$t('PURCHASE.deliveryAddress')}`"
                      prop="receiveAddressName"
                      v-if="form.dropShipping === '1'"
                    >
                      <el-input
                        v-model="form.receiveAddressName"
                        maxlength="200"
                        :disabled="comDisFrom"
                      ></el-input>
                    </el-form-item>

                    <el-form-item
                      :label="`${$t('PURCHASE.deliveryAddress')}`"
                      prop="warehouseName"
                      v-else
                    >
                      <CommonSelectAndList
                        :id="form.warehouseId"
                        :label="form.warehouseName"
                        idKey="warehouseId"
                        labelKey="warehouseName"
                        filterable
                        :options="warehouseOptions"
                        :loading="warehouseOptionsLoading"
                        @change="updateWarehouse"
                        @handleOpen="openWarehouseTable"
                        :disabled="comDisFrom"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row
                  v-if="form.dropShipping === '1'"
                  :key="'contactPerson' + form.dropShipping"
                >
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PURCHASE.consignee')}`"
                      prop="contactPersonName"
                    >
                      <el-input
                        v-model="form.contactPersonName"
                        :title="form.contactPersonName"
                        maxlength="200"
                        style="width: 100%"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PURCHASE.requestedEmail')}`"
                      prop="email"
                    >
                      <el-input
                        v-model.trim="form.email"
                        :title="form.email"
                        maxlength="500"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PURCHASE.requestedMobilePhone')}`"
                      ref="mobileNoRef"
                    >
                      <MobilePhoneInput
                        v-model:mobileCode="form.mobileCode"
                        v-model:mobileNum="form.mobileNum"
                        v-model:mobileNo="form.mobilePhone"
                        :disabled="comDisFrom"
                        @clearValidate="$refs.mobileNoRef.clearValidate()"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <el-form-item :label="$t('ui.reason')">
                      <MyInput
                        type="textarea"
                        v-model="form.reason"
                        :autosize="{ minRows: 1, maxRows: 4 }"
                        resize="none"
                        show-word-limit
                        :maxlength="200"
                        :disabled="true"
                      ></MyInput>
                    </el-form-item>
                  </el-col>
                  <el-col
                    :span="24"
                    v-if="form.reasonType === 'Other'"
                    key="reason11"
                  >
                    <el-form-item :label="$t('ui.remarks')" prop="reason">
                      <MyInput
                        type="textarea"
                        v-model="form.reason"
                        :autosize="{ minRows: 1, maxRows: 4 }"
                        resize="none"
                        show-word-limit
                        :maxlength="3000"
                        :disabled="comDisFrom || true"
                      ></MyInput>
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item :label="`${$t('ui.attachment')}`">
                      <myUpload
                        ref="uploadRef"
                        :disabled="comDisFrom || true"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
          </div>

          <div class="form-card mt10">
            <el-collapse-item name="2">
              <template #title
                ><FormCollapseItemTitle
                  :title="$t('PURCHASE.productInfo')"
                  :warning="collapseWarningForProductInfo"
                >
                  <span v-if="tableList.length" class="info-item mr20">
                    {{ $t('PURCHASE.product') }} : {{ tableList.length }}
                  </span>
                </FormCollapseItemTitle></template
              >
              <div class="pb20">
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5" v-if="false">
                    <el-button
                      @click="handleAddBtn"
                      :disabled="form.dropShipping !== '1' && !form.warehouseId"
                      type="primary"
                      :icon="Plus"
                      size="small"
                      >{{ $t('uiBtn.add') }}</el-button
                    >
                  </el-col>
                  <el-col :span="1.5" v-if="false">
                    <el-button
                      :disabled="selected.length <= 0"
                      @click="handleDelete"
                      type="danger"
                      :icon="Delete"
                      size="small"
                      >{{ $t('uiBtn.delete') }}</el-button
                    >
                  </el-col>
                  <div class="top-right-btn flex" style="gap: 10px">
                    <search-form
                      ref="searchForm"
                      v-model="queryParams"
                      :searchData="searchData"
                      :handleQuery="handleSearchForm"
                      :resetQuery="resetSearchForm"
                      :showCustom="false"
                      :topShowCount="1"
                      :isProductCustomSearch="true"
                    />
                    <right-toolbar
                      :showSearchBtn="false"
                      :showRefreshBtn="false"
                      :saveKey="saveKey"
                      :savePath="savePath"
                      :columns="configColumn"
                      :columnsInit="columns"
                    ></right-toolbar>
                  </div>
                </el-row>
                <el-table
                  border
                  ref="tables"
                  :row-key="rowIdKey"
                  :row-class-name="tableRowClassName"
                  :data="tableList"
                  @select="handleSelectionChange"
                  @select-all="handleSelectAll"
                  @sort-change="handleSortChange"
                  v-table-tab
                >
                  <el-table-column
                    v-if="false"
                    type="selection"
                    key="selection"
                    align="center"
                    width="55"
                  ></el-table-column>
                  <el-table-column
                    type="index"
                    key="index"
                    :label="$t('ui.sn')"
                    width="60"
                    fixed="left"
                    align="center"
                    class-name="allowDrag"
                  >
                    <template #default="scope">
                      <span>{{ scope.$index + 1 }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    v-for="item in comVisibleColumn"
                    :key="item.prop + item.colSortIndex"
                    :prop="item.prop"
                    :label="item.label"
                    :width="item.width"
                    :min-width="getMinWidth(item)"
                    :show-overflow-tooltip="item.tooltip"
                    :fixed="item.fixed"
                    :sortable="item.sortable"
                    :align="item.align || 'left'"
                    header-align="center"
                  >
                    <template #header="{ column }">
                      <span
                        v-if="
                          [
                            'uom',
                            'qty',
                            'uomCoefficient',
                            'deliveryDate',
                            'deliveryDateForDay'
                          ].includes(item.prop)
                        "
                      >
                        <span style="color: #ff4949; margin-right: 4px">*</span
                        >{{ column.label }}
                      </span>
                      <span v-else>{{ column.label }}</span>
                    </template>
                    <template #default="scope">
                      <template v-if="item.prop === 'uom'">
                        <span :title="showUomLabel(scope.row[item.prop])">{{
                          scope.row[item.prop]
                        }}</span>
                      </template>
                      <template v-else-if="item.prop === 'uomCoefficient'">
                        <div class="flex" style="width: 98%">
                          <el-input-number
                            class="flex-1"
                            :disabled="
                              comDisFrom ||
                              scope.row.uom === scope.row.basicUom ||
                              true
                            "
                            v-model="scope.row.uomCoefficient"
                            controls-position="right"
                            :precision="3"
                            v-thousandSplit="{ precision: 3 }"
                            :min="0.001"
                            :max="99999.999"
                          />
                          <span
                            class="fs-0 ml10"
                            :title="showUomLabel(scope.row.basicUom)"
                            >{{ scope.row.basicUom }}</span
                          >
                        </div>
                      </template>
                      <template v-else-if="item.prop === 'qtyOnHand'">
                        <template>{{
                          $numberStr(scope.row[item.prop], {
                            precision: scope.row.decimalPrecision,
                            roundingType: scope.row.unitRoundingType
                          })
                        }}</template>
                      </template>
                      <template v-else-if="item.prop === 'qty'">
                        <el-input-number
                          v-thousandSplit="{
                            precision: scope.row.decimalPrecision
                          }"
                          style="width: 98%"
                          v-if="false"
                          v-model="scope.row.qty"
                          controls-position="right"
                          :precision="scope.row.decimalPrecision"
                          :roundingType="scope.row.unitRoundingType"
                          :min="$getMinNum(scope.row.decimalPrecision)"
                          :max="999999"
                        />
                        <template v-else>{{
                          $numberStr(scope.row[item.prop], {
                            precision: scope.row.decimalPrecision,
                            roundingType: scope.row.unitRoundingType,
                            keepDec: !(
                              scope.row.isAdhocEntry === '1' ||
                              scope.row.isCustomProduct === '1'
                            )
                          })
                        }}</template>
                      </template>
                      <template v-else-if="item.prop === 'receiptQtyForPr'">
                        {{
                          $numberStr(scope.row[item.prop], {
                            precision: scope.row.decimalPrecision,
                            roundingType: scope.row.unitRoundingType
                          })
                        }}
                      </template>

                      <template v-else-if="item.prop === 'deliveryDateForDay'">
                        <el-input-number
                          v-thousandSplit="{ precision: 0 }"
                          style="width: 98%"
                          v-if="false"
                          v-model="scope.row.deliveryDateForDay"
                          controls-position="right"
                          :precision="0"
                          :min="1"
                          :max="999999"
                        />
                        <template v-else>{{
                          $numberStr(scope.row[item.prop], 0)
                        }}</template>
                      </template>
                      <template v-else-if="item.prop === 'deliveryDate'">
                        <MyDatePicker
                          v-if="false"
                          v-model="scope.row.deliveryDate"
                          :picker-options="timeDatePickerOptions"
                          @change="changeDeliveryDate(scope.$index)"
                          :format="fmtForYmd"
                          value-format="timestamp"
                          style="width: 98%"
                          placeholder=""
                          clearable
                        ></MyDatePicker>
                        <template v-else>{{
                          parseTime(scope.row.deliveryDate, fmtForYmd)
                        }}</template>
                      </template>
                      <template v-else-if="item.prop === 'remarks'">
                        <descriptionEditDlg
                          v-model="scope.row.remarks"
                          :maxlength="200"
                          :disabled="true"
                        />
                      </template>
                      <template v-else-if="item.prop === 'productType'">
                        <el-select
                          style="width: 98%"
                          v-model="scope.row.productType"
                          placeholder=""
                          filterable
                          v-if="!comDisFrom && scope.row.isAdhocEntry === '1'"
                        >
                          <el-option
                            v-for="item in (
                              dict.type.product_type || []
                            ).filter(i => ['1', '2'].indexOf(i.value) !== -1)"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                          >
                          </el-option>
                        </el-select>
                        <span v-else>{{
                          selectDictLabel(
                            dict.type.product_type,
                            scope.row.productType
                          )
                        }}</span>
                      </template>
                      <template v-else-if="item.prop === 'description'">
                        <DescriptionToolTipShow
                          :showStr="scope.row[item.prop]"
                        />
                      </template>

                      <template v-else>{{ scope.row[item.prop] }}</template>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('ui.action')"
                    key="action"
                    align="center"
                    min-width="120"
                    class-name="small-padding fixed-width"
                    fixed="right"
                    v-if="false"
                  >
                    <template #default="scope">
                      <el-icon
                        class="pointer"
                        style="font-size: 20px; color: #f56c6c"
                        :title="$t('uiBtn.delete')"
                        @click="handleDelRow(scope.$index, scope.row)"
                        ><Delete
                      /></el-icon>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-form @submit.prevent label-width="180px">
                <el-row>
                  <el-col :span="24">
                    <el-form-item :label="$t('ui.remarks')" prop="remarks">
                      <MyInput
                        type="textarea"
                        v-model="form.remarks"
                        :autosize="{ minRows: 1, maxRows: 4 }"
                        resize="none"
                        show-word-limit
                        :disabled="comDisFrom || true"
                        :maxlength="3000"
                      ></MyInput>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
          </div>

          <div class="form-card mt10">
            <el-collapse-item name="3">
              <template #title
                ><FormCollapseItemTitle :title="$t('ui.systemOperationLog')">
                  <template v-if="form.operationLogForLast">
                    <span
                      v-if="form.operationLogForLast.operatorBy"
                      class="info-item mr20"
                      :title="form.operationLogForLast.operatorBy"
                    >
                      {{ $t('ui.operName') }} :
                      {{ form.operationLogForLast.operatorBy }}
                    </span>
                    <span
                      v-if="form.operationLogForLast.operatorTime"
                      class="info-item"
                    >
                      {{ $t('ui.operTime') }} :
                      {{ parseTime(form.operationLogForLast.operatorTime) }}
                    </span>
                  </template>
                </FormCollapseItemTitle></template
              >
              <div class="pb20">
                <SystemOperationLogTable
                  :tableList="form.operationLogList || []"
                />
              </div>
            </el-collapse-item>
          </div>
        </el-collapse>
      </div>
    </template>
    <selectRequiredByTable
      ref="selectRequiredByTable"
      @update="updateRequiredBy"
    />
    <selectWarehouseTable
      ref="selectWarehouseTable"
      @update="updateWarehouse"
    />
    <selectProductTable ref="selectProductTable" @onSuccess="updateTable" />
    <selectCostProjectTable
      ref="selectCostProjectTable"
      :departmentId="form.departmentId"
      @update="updateCostProjectName"
    />
  </FormPageLayout>
</template>

<script>
import { Plus, Delete } from '@element-plus/icons-vue'
import { markRaw } from 'vue'
import { queryUserDepartment } from '@/api/system/user'
import {
  revisePurchaseRequisite,
  queryPurchaseRequisiteById,
  queryCanSelectWarehouseDefaultWarehouse,
  queryPRCanSelectWarehouseList
} from '@/api/purchaseManagement/purchaseRequisition'
import pageMixin from '@/mixins/tableMinx'
import formRouteMixin from './formRouteMixin'

import selectRequiredByTable from '@/views/purchaseManagement/purchaseRequisition/components/selectRequiredByTable.vue'
import selectWarehouseTable from '@/views/purchaseManagement/purchaseRequisition/components/selectWarehouseTable.vue'
import selectProductTable from './components/selectProductTable.vue'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
import selectCostProjectTable from '@/views/purchaseManagement/purchaseRequisition/components/selectCostProjectTable.vue'

export default {
  dicts: [
    'pr_reason_type',
    'p_required_type',
    'product_type',
    'business_contact_person_title'
  ],
  mixins: [formRouteMixin, pageMixin],
  components: {
    Delete,
    selectRequiredByTable,
    selectWarehouseTable,
    selectProductTable,
    SystemOperationLogTable,
    selectCostProjectTable
  },
  data() {
    const vm = this
    const validatorPhoneNo = (rule, value, callback) => {
      if (!vm.form.mobileCode || !vm.form.mobileNum) {
        callback(vm.$t('ui.reqMsg').replace('$1', vm.$t('ui.mobilePhone')))
      } else {
        callback()
      }
    }

    return {
      Plus: markRaw(Plus),
      Delete: markRaw(Delete),
      saveKey: '29',
      savePath: 'purchaseMTable',
      submitLoading: false,
      activeNames: ['1', '2', '3'],
      rowId: '',
      timeId: '',
      form: {},
      collapseWarningForBasicInfo: false,
      rules: {
        departmentId: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.uom')),
            trigger: ['change']
          }
        ],
        requiredBy: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('PURCHASE.requiredBy')
            ),
            trigger: ['change']
          }
        ],
        costProjectCode: [
          {
            required: false,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('PURCHASE.requiredBy')
            ),
            trigger: ['change']
          }
        ],
        warehouseName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('PURCHASE.deliveryAddress')
            ),
            trigger: ['change']
          }
        ],
        receiveAddressName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('PURCHASE.deliveryAddress')
            ),
            trigger: ['change']
          }
        ],
        contactPersonName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        email: [
          {
            type: 'email',
            validator: this.isEmail,
            trigger: ['blur', 'change']
          }
        ],
        mobilePhone: [
          { required: true, validator: validatorPhoneNo, trigger: 'change' }
        ],
        reasonType: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        reason: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ]
      },
      deptOptions: [],
      warehouseOptions: [],
      warehouseOptionsLoading: false,

      columns: [
        {
          prop: 'productName',
          label: vm.$t('PURCHASE.productName'),
          visible: true,
          colMinWidth: 180,
          required: true,
          tooltip: true,
          fixed: true,
          sortable: 'custom'
        },
        {
          prop: 'internalPartNo',
          label: vm.$t('PURCHASE.internalPartNo'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'externalPartNo',
          label: vm.$t('PURCHASE.externalPartNo'),
          visible: true,
          colMinWidth: 180,
          tooltip: true
        },
        {
          prop: 'alias',
          label: vm.$t('PURCHASE.alias'),
          visible: true,
          colMinWidth: 120,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'description',
          label: vm.$t('ui.description'),
          visible: true,
          colMinWidth: 120,
          tooltip: false,
          sortable: 'custom'
        },

        {
          prop: 'uom',
          label: vm.$t('PURCHASE.uom'),
          visible: true,
          colMinWidth: 120,
          tooltip: true,
          sortable: 'custom'
        },

        {
          prop: 'qty',
          label: vm.$t('PURCHASE.qty'),
          visible: true,
          colMinWidth: 120,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'inventoryUOMConversionStr',
          label: vm.$t('PURCHASE.inventoryConversion'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          sortable: 'custom'
        },

        {
          prop: 'receiptQtyForPr',
          label: vm.$t('PURCHASE.receivedQty'),
          visible: true,
          minWidth: 140,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'deliveryDate',
          label: vm.$t('PURCHASE.requestedReceiptDate'),
          visible: true,
          colMinWidth: 160,
          required: true,
          tooltip: true,
          sortable: 'custom'
        },

        {
          prop: 'remarks',
          label: vm.$t('ui.remarks'),
          visible: true,
          minWidth: 200,
          fixedWidth: 200,
          tooltip: false,
          sortable: 'custom'
        }
      ],
      timeDatePickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 90 * 24 * 60 * 60 * 1000
        }
      },
      tableList: [],
      selected: [],

      rowIdKey: 'productId',
      collapseWarningForProductInfo: false,
      searchData: [
        {
          name: 'condition',
          placeholder: `${this.$t('ui.productSearch1')}`,
          type: 'InputEle'
        }
      ],

      queryParams: {
        condition: undefined
      },
      createTableList: []
    }
  },
  props: {
    isView: {
      type: Boolean,
      default: false
    },
    propTimeId: {
      type: String,
      default: ''
    },
    propRowId: {
      type: String,
      default: ''
    },
    taskId: {
      type: String,
      default: ''
    },
    comeFrom: {
      type: [String],

      default: '1'
    },
    dataType: {
      type: [String, Number],
      default: '1'
    }
  },
  watch: {
    propTimeId: {
      immediate: true,
      handler: function (selected) {
        this.timeId = this.propTimeId
        this.rowId = this.propRowId
        if (this.rowId) {
          this.handleUpdate()
        }
      }
    },
    projectCodeIsReq: {
      immediate: false,
      handler: function (selected) {
        if (this.$refs.form1) {
          this.$refs.form1.clearValidate('costProjectCode')
        }
      }
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    editAuth() {
      return this.checkPermi(['purchaseManagement:purchaseRequisition:edit'])
    },
    comDisFrom() {
      if (this.isView) {
        return true
      }
      if (this.rowId) {
        return !this.editAuth
      }
      return false
    },

    projectCodeIsReq() {
      return false
    },
    tableListIncludeCustomProduct() {
      if (!this.tableList || this.tableList.length <= 0) return false
      return this.tableList.some(x => x.isCustomProduct === '1')
    },

    tableListIncludeSystemDocking() {
      if (!this.tableList || this.tableList.length <= 0) return false
      return this.tableList.some(x => x.isSystemDocking === '1')
    },
    aliasIsHide() {
      return !this.tableList.find(x => x.alias)
    },
    inventoryConversionIsHide() {
      return !this.tableList.find(x => x.uom !== x.basicUom)
    },
    comVisibleColumn() {
      let arr = [...this.visibleColumn]
      const filterProps1 = []
      if (this.aliasIsHide) {
        filterProps1.push('alias')
      }
      if (this.inventoryConversionIsHide) {
        filterProps1.push('inventoryUOMConversionStr')
      }
      arr = arr.filter(x => !filterProps1.includes(x.prop))
      return arr
    }
  },
  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
  },
  methods: {
    handleSortChange({ prop, order }) {
      this.handlerTableList()
      if (!prop || !order) {
        if (!prop || !order) {
          this.tableList = (this.tableList || []).slice().sort((a, b) => {
            const ia = a && a._stableIndex !== undefined ? a._stableIndex : 0
            const ib = b && b._stableIndex !== undefined ? b._stableIndex : 0
            return ia - ib
          })
          return
        }
        return
      }

      this.tableList.sort((a, b) => {
        const valueA = a[prop] !== undefined && a[prop] !== null ? a[prop] : ''
        const valueB = b[prop] !== undefined && b[prop] !== null ? b[prop] : ''

        if (valueA === valueB) {
          const ia = a && a._stableIndex !== undefined ? a._stableIndex : 0
          const ib = b && b._stableIndex !== undefined ? b._stableIndex : 0
          return ia - ib
        }

        if (order === 'ascending') {
          return valueA > valueB ? 1 : -1
        } else if (order === 'descending') {
          return valueA < valueB ? 1 : -1
        }
        return 0
      })
    },
    handlerTableList() {
      let table = this.createTableList
      if (this.queryParams.condition) {
        table = table.filter(item => {
          return this.$isContain(this.queryParams.condition, [
            item.productName,
            item.internalPartNo,
            item.description
          ])
        })
      }

      table.forEach(row => {
        if (row && row._stableIndex === undefined) {
          this._stableCounter = (this._stableCounter || 0) + 1
          row['_stableIndex'] = this._stableCounter
        }
      })
      this.tableList = table
    },

    handleSearchForm() {
      this.queryParams.pageNum = 1
      this.handlerTableList()
      this.$refs.tables && this.$refs.tables.clearSort()
    },

    resetSearchForm() {
      this.$refs.tables && this.$refs.tables.clearSort()
    },
    handleUpdate() {
      this.reset()
      this.queryPRCanSelectWarehouseList()
      const rowId = this.rowId

      queryPurchaseRequisiteById({ purchaseRequisiteId: rowId }).then(res => {
        const data = res.data || {}
        this.createTableList = data.purchaseRequisiteDetailList || []
        this.tableList = this.createTableList
        this.changeTableList()

        setTimeout(() => {
          if (this.$refs.uploadRef) {
            this.$refs.uploadRef.initFileList(data.commonFileList || [])
          }
        }, 300)

        this.form = data
        if (
          this.form.isNoEnoughInventoryPr === '1' &&
          this.form.dropShipping !== '1'
        ) {
          this.form.warehouseName = this.form.documentWarehouseName
          this.form.warehouseId = this.form.documentWarehouseId
        }
      })
    },

    back(type) {
      if (this.isView) {
        this.$store.dispatch('tagsView/delView', this.formRoute)
        this.$router.back()
        return
      }
      this.$store.dispatch('tagsView/delView', this.formRoute)
      this.$router.push({ path: '/purchaseManagement/purchaseRequisition' })
    },
    reset() {
      this.form = {
        requiredType: undefined,
        reasonType: undefined,
        reason: undefined,
        purchaseRequisiteStatus: undefined,
        createdBy: this.$store.state.user.nickName
      }
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForProductInfo = false
      this.activeNames = ['1', '2', '3']
      this.tableList = []
      this.createTableList = []

      this._stableCounter = 0
      this.changeTableList()
      setTimeout(() => {
        if (this.$refs.uploadRef) {
          this.$refs.uploadRef.initFileList([])
        }
      }, 300)
      this.resetForm('form1')
    },

    queryUserDepartment() {
      queryUserDepartment({ menuPerms: this.menuKey.PR }).then(res => {
        this.deptOptions = res.data || []
      })
    },
    departmentChange(item) {
      this.form['departmentId'] = item.departmentId
      this.form['departmentName'] = item.departmentName
      this.form['allSuperiorName'] = item.allSuperiorName
    },
    openRequiredByTable() {
      this.$refs.selectRequiredByTable.handleOpen()
    },

    requiredByClear() {
      this.form['requiredBy'] = undefined
      this.form['requiredId'] = undefined
    },
    updateRequiredBy(row) {
      const { nickName, userId } = row
      this.form['requiredBy'] = nickName
      this.form['requiredId'] = userId
    },
    dropShippingChange() {
      this.warehouseNameClear()
      if (this.form.dropShipping !== '1') {
        this.queryCanSelectWarehouseDefaultWarehouse()
        if (this.form.isNoEnoughInventoryPr === '1') {
          this.form.warehouseName = this.form.documentWarehouseName
          this.form.warehouseId = this.form.documentWarehouseId
        }
        this.form['receiveAddressName'] = this.form.warehouseName
      } else {
        if (this.form.salesReceiveAddress) {
          this.form['receiveAddressName'] = this.form.salesReceiveAddress
        }
      }
    },

    queryCanSelectWarehouseDefaultWarehouse() {
      this.btnLoading = true
      queryCanSelectWarehouseDefaultWarehouse({
        menuPerms: this.menuKey.PR
      })
        .then(res => {
          const row = res.data || {}
          this.btnLoading = false
          setTimeout(() => {
            this.updateWarehouse(row)
          }, 0)
        })
        .catch(() => {
          this.btnLoading = false
        })
    },

    openCostProjectNameTable() {
      this.$refs.selectCostProjectTable.handleOpen()
    },

    costProjectNameClear() {
      this.form['costProjectName'] = undefined
      this.form['costProjectId'] = undefined
      this.form['costProjectCode'] = undefined
    },
    updateCostProjectName(row) {
      const { costProjectName, costProjectId, costProjectCode } = row
      this.form['costProjectName'] = costProjectName
      this.form['costProjectId'] = costProjectId
      this.form['costProjectCode'] = costProjectCode
      const businessPartner = row.businessPartner || {}
      if (businessPartner.countryMobileCode) {
        this.form['mobileCode'] = businessPartner.countryMobileCode
        this.$nextTick(() => {
          if (this.$refs.mobileNoRef) {
            this.$refs.mobileNoRef.clearValidate()
          }
        })
      }
    },

    queryPRCanSelectWarehouseList() {
      this.warehouseOptionsLoading = true
      queryPRCanSelectWarehouseList({
        pageNum: 1,
        pageSize: 9999,
        warehouseType: '1',
        menuPerms: this.menuKey.PR
      })
        .then(res => {
          this.warehouseOptionsLoading = false
          this.warehouseOptions = res.rows || []
        })
        .catch(() => {
          this.warehouseOptionsLoading = false
        })
    },
    openWarehouseTable() {
      this.$refs.selectWarehouseTable.handleOpen()
    },

    warehouseNameClear() {
      this.form['warehouseName'] = undefined
      this.form['warehouseId'] = undefined
      this.form['receiveAddressName'] = undefined
      this.form['noCanSelectProductIdList'] = undefined
    },
    updateWarehouse(row) {
      const { warehouseName, warehouseId } = row
      const noCanSelectProductIdList = row.noCanSelectProductIdList || []
      if (this.createTableList.length <= 0) {
        this.form['warehouseName'] = warehouseName
        this.form['warehouseId'] = warehouseId
        this.form['noCanSelectProductIdList'] = noCanSelectProductIdList
        return
      }
      const delList = this.createTableList.filter(item => {
        return noCanSelectProductIdList.includes(item.productId)
      })
      if (delList.length <= 0) {
        this.form['warehouseName'] = warehouseName
        this.form['warehouseId'] = warehouseId
        this.form['noCanSelectProductIdList'] = noCanSelectProductIdList
        return
      }

      let htmlStr = '<div>'
      htmlStr += `<div>${this.$t('PURCHASE.switchToTip').replace('$1', row.warehouseName)}</div>`
      htmlStr += '<ul>'
      const icon =
        '<i style="display: inline-block;height: 6px;width: 6px;border-radius: 50%;background-color: #666;margin-right: 4px"></i>'
      delList.forEach(item => {
        htmlStr += `<li>${icon} ${item.productName}</li>`
      })
      htmlStr += '</ul></div>'
      this.$confirm(htmlStr, this.$t('PURCHASE.warehouseChangeNotice'), {
        dangerouslyUseHTMLString: true,
        confirmButtonText: this.$t('PURCHASE.switchTo').replace(
          '$1',
          row.warehouseName
        ),
        cancelButtonText: this.$t('uiBtn.cancel')
      })
        .then(() => {
          this.form['warehouseName'] = warehouseName
          this.form['warehouseId'] = warehouseId
          this.form['noCanSelectProductIdList'] = noCanSelectProductIdList
        })
        .catch(() => {})
    },
    titleChange() {
      if (this.form.contactPersonName) {
        this.$refs.form1.validateField('contactPersonName')
      }
    },
    reasonTypeChange() {
      this.form['reason'] = ''
    },

    nav(row) {
      if (row.isAdhocEntry === '1') {
        this.$router.push({
          path: '/productManagement/editProductInfo',
          query: {
            id: row.productMainId,
            timeId: Date.now(),
            back: '1'
          }
        })
      } else {
        this.$router.push({
          path: '/productManagement/viewExtendedProductInfo',
          query: {
            id: row.productMainId,
            timeId: Date.now()
          }
        })
      }
    },
    changeDeliveryDate(index) {
      if (index === 0) {
        const topRow = this.tableList[0]
        if (topRow && topRow.deliveryDate) {
          const oldDeliveryDate = this.tableList.find(
            (item, index) => index > 0 && item.deliveryDate
          )
          if (oldDeliveryDate) {
            const msg = this.parseTime(topRow.deliveryDate, this.fmtForYmd)
            this.$modal
              .confirm(
                this.$t('PURCHASE.committedDateConfirm').replace('$1', msg)
              )
              .then(() => {
                this.tableList.forEach(row => {
                  row['deliveryDate'] = topRow.deliveryDate
                })
              })
          } else {
            this.tableList.forEach(row => {
              row['deliveryDate'] = topRow.deliveryDate
            })
          }
        }
      }
    },
    handleAddBtn() {
      const tableList = JSON.parse(JSON.stringify(this.createTableList))
      this.$refs.selectProductTable.handleAdd(tableList)
    },
    updateTable(list) {
      if (list.length > 0) {
        const rows = JSON.parse(JSON.stringify(list))
        const topRow = this.createTableList[0]
        if (topRow && topRow.deliveryDate) {
          rows.forEach(row => {
            row['deliveryDate'] = topRow.deliveryDate
          })
        }
        this.createTableList.forEach(row => {
          const index = rows.findIndex(
            item => row[this.rowIdKey] === item[this.rowIdKey]
          )
          if (index !== -1) {
            rows[index] = row
          }
        })

        rows.forEach(x => {
          const index = this.createTableList.findIndex(
            item => x[this.rowIdKey] === item[this.rowIdKey]
          )
          if (index === -1) {
            if (x.externalPartNoList) {
              x['externalPartNoListJson'] = x.externalPartNoList
            }
          }
        })

        this.createTableList.length = 0
        this.createTableList.push(...rows)
        this.tableList = this.createTableList
        this.changeTableList()
        this.$nextTick(() => {
          this.selected.forEach(row => {
            this.tableList.forEach(item => {
              if (row[this.rowIdKey] === item[this.rowIdKey]) {
                this.$refs.tables.toggleRowSelection(item, true)
              }
            })
          })
        })
      } else {
        this.tableList = []
        this.createTableList = []
      }
      this.$refs.tables && this.$refs.tables.clearSort()
    },
    changeTableList() {
      this.tableList.forEach(item => {
        item.poUseQtyShowStr = item.poUseQty
          ? `${this.$numberStr(item.poUseQty, {
              precision: item.decimalPrecision,
              roundingType: item.unitRoundingType
            })} ${item.basicUom || ''}`
          : ''
        item.stockInQtyShowStr = item.stockInQty
          ? `${this.$numberStr(item.stockInQty, {
              precision: item.decimalPrecision,
              roundingType: item.unitRoundingType
            })} ${item.basicUom || ''}`
          : ''
        item.closedQtyShowStr = item.closedQty
          ? `${this.$numberStr(item.closedQty, {
              precision: item.decimalPrecision,
              roundingType: item.unitRoundingType
            })} ${item.basicUom || ''}`
          : ''
        item.rejectedQtyForBasicShowStr = item.rejectedQtyForBasic
          ? `${this.$numberStr(item.rejectedQtyForBasic, {
              precision: item.decimalPrecision,
              roundingType: item.unitRoundingType
            })} ${item.basicUom || ''}`
          : ''
      })
      this.$$getColumnContentMaxWidth(this.columns, this.tableList)
    },

    handleDelete() {
      this.$modal
        .confirm(this.$t('ui.delConfirm'))
        .then(() => {
          this.tableList = this.tableList.filter(row => {
            if (
              this.selected.find(
                item => item[this.rowIdKey] === row[this.rowIdKey]
              )
            ) {
              return false
            }
            return true
          })
          this.changeTableList()
          this.selected = []
        })
        .catch(() => {})
    },

    handleDelRow(index, row) {
      this.$modal.confirm(this.$t('ui.delConfirm')).then(() => {
        this.tableList.splice(index, 1)
        this.createTableList = this.createTableList.filter(x =>
          x.customId
            ? x.customId !== row.customId
            : x[this.rowIdKey] !== row[this.rowIdKey]
        )
        const findIndex = this.selected.findIndex(
          item => item[this.rowIdKey] === row[this.rowIdKey]
        )
        if (findIndex !== -1) {
          this.selected.splice(findIndex, 1)
        }
      })
    },

    handleSelectAll(selection) {
      const vm = this
      if (selection.length) {
        const curSelectedIds = this.selected.map(d => d[this.rowIdKey])
        selection.forEach(item => {
          if (!curSelectedIds.includes(item[this.rowIdKey])) {
            vm.selected.push(item)
          }
        })
      } else {
        const delArr = this.tableList.map(item => item[this.rowIdKey])
        vm.selected = vm.selected.filter(
          item => !delArr.includes(item[this.rowIdKey])
        )
      }
    },

    handleSelectionChange(selection, row) {
      const vm = this
      for (let i = 0; i < vm.selected.length; i++) {
        if (vm.selected[i][this.rowIdKey] === row[this.rowIdKey]) {
          return vm.selected.splice(i, 1)
        }
      }
      vm.selected.push(row)
    },
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      const cur = this.selected.find(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      if (cur) {
        color = 'table-SelectedRow-bgcolor'
      }
      return color
    },

    async submitForm(submitType) {
      const myFileIds = this.$refs.uploadRef.getFileIds()
      if (myFileIds === false) {
        return
      }
      const valid1 = await this.$refs.form1.validate().catch(() => false)
      this.collapseWarningForBasicInfo = !valid1
      if (!valid1) {
        this.$modal.msgError(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
        )
      }
      if (valid1) {
        let param = { ...this.form }
        const detailList = this.createTableList
        if (detailList.length <= 0) {
          this.$modal.msgError(this.$t('PURCHASE.prProductTableEmpty'))
          this.collapseWarningForProductInfo = true
          return
        }
        const uomReq = detailList.find(item => {
          return !this.$resultOfBoolean(item.uom)
        })
        if (uomReq) {
          this.$modal.msgError(
            this.$t('ui.commonReqMsg').replace('$1', this.$t('PURCHASE.uom'))
          )
          this.collapseWarningForProductInfo = true
          return
        }
        const qtyReq = detailList.find(item => {
          return !this.$resultOfBoolean(item.qty)
        })
        if (qtyReq) {
          this.$modal.msgError(
            this.$t('ui.commonReqMsg').replace('$1', this.$t('PURCHASE.qty'))
          )
          this.collapseWarningForProductInfo = true
          return
        }

        const uomCoefficientReq = detailList.find(item => {
          return !this.$resultOfBoolean(item.uomCoefficient)
        })
        if (uomCoefficientReq) {
          this.$modal.msgError(
            this.$t('ui.commonReqMsg').replace('$1', this.$t('PURCHASE.ratio'))
          )
          this.collapseWarningForProductInfo = true
          return
        }

        const deliveryDateForDay = detailList.find(item => {
          return !this.$resultOfBoolean(item.deliveryDate)
        })
        if (deliveryDateForDay) {
          this.$modal.msgError(
            this.$t('ui.commonReqMsg').replace(
              '$1',
              this.$t('PURCHASE.requestedReceiptDate')
            )
          )
          this.collapseWarningForProductInfo = true
          return
        }

        this.collapseWarningForProductInfo = false
        param.purchaseRequisiteDetailList = detailList
        param = this.$trimOfObj(JSON.parse(JSON.stringify(param)))
        param.commonFileList = myFileIds
        const confirmMsg = this.$t('PURCHASE.prSubmitConfirm')
        const successMsg = this.$t('PURCHASE.prSubmitSuccess')
        const submitFn = revisePurchaseRequisite
        const noCanSelectProductIdList = param.noCanSelectProductIdList || []
        const delList = this.createTableList.filter(item => {
          return noCanSelectProductIdList.includes(item.productId)
        })
        if (delList.length > 0) {
          this.autoRemoveAndSubmit({
            delList,
            param,
            successMsg,
            submitFn,
            submitType
          })
          return
        }
        this.$modal
          .confirm(confirmMsg)
          .then(() => {
            return submitFn(param)
          })
          .then(response => {
            this.$modal.msgSuccess(successMsg.replace('$1', response.msg))
            this.back()
          })
          .catch(() => {})
      }
    },
    autoRemoveAndSubmit({ delList, param, successMsg, submitFn, submitType }) {
      let htmlStr = '<div>'
      htmlStr += `<div>${this.$t('PURCHASE.switchToTip').replace('$1', param.warehouseName)}</div>`
      htmlStr += '<ul>'
      const icon =
        '<i style="display: inline-block;height: 6px;width: 6px;border-radius: 50%;background-color: #666;margin-right: 4px"></i>'
      delList.forEach(item => {
        htmlStr += `<li>${icon} ${item.productName}</li>`
      })
      htmlStr += '</ul>'
      htmlStr += `<div>${this.$t('PURCHASE.switchToTip2')}</div>`
      htmlStr += '</div>'

      this.$confirm(htmlStr, '', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: this.$t('PURCHASE.autoRemoveSubmit'),
        cancelButtonText: this.$t('uiBtn.back')
      })
        .then(() => {
          const newDetailList = param.purchaseRequisiteDetailList.filter(
            item => {
              return !param.noCanSelectProductIdList.includes(item.productId)
            }
          )
          param.purchaseRequisiteDetailList = newDetailList
          this.createTableList = newDetailList
          this.tableList = this.createTableList
          if (newDetailList.length <= 0 && submitType !== 'save') {
            this.$modal.msgError(this.$t('PURCHASE.prProductTableEmpty'))
            this.collapseWarningForProductInfo = true
            return
          }
          this.submitLoading = true
          submitFn(param)
            .then(response => {
              this.$modal.msgSuccess(successMsg.replace('$1', response.msg))
              this.back()
              this.submitLoading = false
            })
            .catch(() => {
              this.submitLoading = false
            })
        })
        .catch(() => {})
    },
    handleSaveDraft() {
      this.submitForm('save')
    }
  }
}
</script>
