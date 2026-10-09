<template>
  <FormPageLayout ref="FormPageLayoutRef" v-loading="submitLoading">
    <template v-slot:btn>
      <el-button type="primary" size="small" @click="submitForm"
        >{{ $t('uiBtn.submit') }}
      </el-button>
      <el-button type="primary" size="small" @click="handleSaveDraft"
        >{{ $t('uiBtn.saveDraft') }}
      </el-button>
      <el-button type="primary" @click="backFN" size="small">{{
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
                </FormCollapseItemTitle
              ></template>
              <el-form
                ref="form1"
                :model="form"
                @submit.prevent
                :rules="rules"
                label-width="180px"
              >
                <el-row>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('PURCHASE.requiredFrom')}`">
                      <el-input
                        :model-value="
                          selectDictLabel(
                            dict.type.p_required_type,
                            form.requiredType
                          )
                        "
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
                      <el-select
                        v-model="form.departmentId"
                        :title="form.allSuperiorName"
                        placeholder=""
                        style="width: 100%"
                        clearable
                        @change="departmentChange"
                        :loading="deptOptionsLoading"
                      >
                        <el-option
                          v-for="item in deptOptions"
                          :key="item.departmentId"
                          :label="item.departmentName"
                          :value="item.departmentId"
                        ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PURCHASE.requiredBy')}`"
                      prop="requiredBy"
                    >
                      <CommonSelectAndList
                        :id="form.requiredId"
                        :label="form.requiredBy"
                        idKey="userId"
                        labelKey="nickName"
                        filterable
                        :options="requiredByOptions"
                        :loading="requiredByLoading"
                        :disabled="requiredByLoading || !form.departmentId"
                        @change="updateRequiredBy"
                        @handleOpen="openRequiredByTable"
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
                      <CommonSelectAndList
                        :id="form.costProjectId"
                        :label="form.costProjectCode"
                        idKey="costProjectId"
                        labelKey="costProjectCode"
                        filterable
                        :options="costProjectOptions"
                        :loading="costProjectOptionsLoading"
                        @change="updateCostProjectName"
                        @handleOpen="openCostProjectNameTable"
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
                        :disabled="tableListIncludeSystemDocking"
                        @change="dropShippingChange"
                      ></el-switch>
                    </el-form-item>
                  </el-col>
                  <el-col :span="16">
                    <el-form-item
                      :label="`${$t('PURCHASE.deliveryAddress')}`"
                      prop="receiveAddressName"
                      v-if="form.dropShipping === '1'"
                      key="receiveAddressName11"
                    >
                      <selectDropShippingAddress
                        class="w100"
                        v-model="form.receiveAddressName"
                        :title="form.receiveAddressName"
                        :canSelectOptions="dropShippingAddressOptions"
                        @change="dropShippingAddressChange"
                        :disabled="false"
                      />
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
                      ></MyInput>
                    </el-form-item>
                  </el-col>

                  <el-col :span="24">
                    <el-form-item :label="`${$t('ui.attachment')}`">
                      <myUpload ref="uploadRef" :disabled="false" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
          </div>

          <div class="form-card mt10" ref="collapseScrollPage">
            <el-collapse-item name="2">
              <template #title
                ><FormCollapseItemTitle
                  :title="$t('PURCHASE.productInfo')"
                  :warning="collapseWarningForProductInfo"
                >
                </FormCollapseItemTitle
              ></template>
              <div class="pb20" v-loading="btnLoading">
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button
                      :disabled="form.dropShipping !== '1' && !form.warehouseId"
                      @click="handleAddBtn"
                      type="primary"
                      :icon="Plus"
                      size="small"
                      >{{ $t('uiBtn.add') }}</el-button
                    >
                  </el-col>
                  <el-col :span="1.5" v-if="addAdhocEntryAuth && false">
                    <el-button
                      :disabled="form.dropShipping !== '1' && !form.warehouseId"
                      @click="handleSddAdhocEntry"
                      type="primary"
                      :icon="Plus"
                      size="small"
                      >{{ $t('menu.addAdhocEntry') }}</el-button
                    >
                  </el-col>
                  <el-col :span="1.5" v-if="addCustomProductAuth">
                    <el-button
                      :disabled="form.dropShipping !== '1' && !form.warehouseId"
                      @click="handleAddCustomProduct"
                      type="primary"
                      :icon="Plus"
                      size="small"
                      >{{ $t('menu.addCustomProduct') }}</el-button
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
                  <right-toolbar
                    :showSearchBtn="false"
                    :showRefreshBtn="false"
                    :saveKey="saveKey"
                    :savePath="savePath"
                    :columns="configColumn"
                    :columnsInit="columns"
                  ></right-toolbar>

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
                </el-row>
                <el-table
                  border
                  ref="tables"
                  :row-class-name="tableRowClassName"
                  :cell-class-name="tableCellClassName"
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
                            'productName',
                            'uom',
                            'qty',
                            // 'uomCoefficient',
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
                      <template v-if="item.prop === 'productName'">
                        <el-input
                          v-if="
                            scope.row.isAdhocEntry === '1' ||
                            scope.row.isCustomProduct === '1'
                          "
                          style="width: 98%"
                          :title="scope.row.productName"
                          v-model="scope.row.productName"
                          :maxlength="200"
                          @input="
                            $event => {
                              scope.row.productNameError = false
                              scope.row['ROW-ERROR'] = false
                            }
                          "
                        />
                        <template v-else>{{ scope.row[item.prop] }}</template>

                        <TablePropError v-if="scope.row[item.prop + 'Error']" />
                      </template>
                      <template v-else-if="item.prop === 'internalPartNo'">
                        <span
                          class="primary-link"
                          @click="nav(scope.row, 'internalPartNo')"
                          >{{ scope.row.internalPartNo }}</span
                        >
                      </template>
                      <template v-else-if="item.prop === 'externalPartNo'">
                        <span>{{
                          (scope.row.externalPartNoListJson || []).join(', ')
                        }}</span>
                      </template>
                      <template v-else-if="item.prop === 'alias'">
                        <el-input
                          v-if="
                            scope.row.isAdhocEntry === '1' ||
                            scope.row.isCustomProduct === '1'
                          "
                          style="width: 98%"
                          :title="scope.row.alias"
                          v-model="scope.row.alias"
                          :maxlength="200"
                        />
                        <template v-else>{{ scope.row[item.prop] }}</template>
                      </template>
                      <template v-else-if="item.prop === 'description'">
                        <descriptionEditDlg
                          v-model="scope.row.description"
                          :maxlength="7000"
                        />
                      </template>
                      <template v-else-if="item.prop === 'partNo'">
                        <el-input
                          v-if="
                            scope.row.isAdhocEntry === '1' ||
                            scope.row.isCustomProduct === '1'
                          "
                          style="width: 98%"
                          :title="scope.row.partNo"
                          v-model="scope.row.partNo"
                          :maxlength="200"
                        />
                        <template v-else>{{ scope.row[item.prop] }}</template>
                      </template>
                      <template v-else-if="item.prop === 'uom'">
                        <el-select
                          style="width: 98%"
                          v-model="scope.row.uom"
                          :title="showUomLabel(scope.row.uom)"
                          placeholder=""
                          @change="adhocEntryUomChange(scope.row)"
                          filterable
                          v-if="
                            scope.row.isAdhocEntry === '1' ||
                            scope.row.isCustomProduct === '1'
                          "
                        >
                          <el-option
                            v-for="item in allUomList"
                            :key="item.uomName"
                            :label="item.uomName"
                            :value="item.uomName"
                          >
                          </el-option>
                        </el-select>
                        <span :title="showUomLabel(scope.row.uom)" v-else>
                          {{ scope.row.uom }}
                        </span>

                        <TablePropError v-if="scope.row[item.prop + 'Error']" />
                      </template>
                      <template v-else-if="item.prop === 'uomCoefficient'">
                        <div class="flex" style="width: 98%">
                          <el-input-number
                            class="flex-1"
                            :disabled="scope.row.uom === scope.row.basicUom"
                            v-model="scope.row.uomCoefficient"
                            controls-position="right"
                            :precision="3"
                            v-thousandSplit="{ precision: 3 }"
                            :min="0.001"
                            :max="99999.999"
                            @change="
                              $event => {
                                scope.row.uomCoefficientError = false
                                scope.row['ROW-ERROR'] = false
                              }
                            "
                          />
                          <span
                            class="fs-0 ml10"
                            :title="showUomLabel(scope.row.basicUom)"
                            >{{ scope.row.basicUom }}</span
                          >
                        </div>
                        <TablePropError v-if="scope.row[item.prop + 'Error']" />
                      </template>
                      <template v-else-if="item.prop === 'qty'">
                        <el-input-number
                          style="width: 98%"
                          v-model="scope.row.qty"
                          controls-position="right"
                          v-thousandSplit="{
                            precision: scope.row.decimalPrecision,
                            keepDec: false
                          }"
                          :precision="scope.row.decimalPrecision"
                          :roundingType="scope.row.unitRoundingType"
                          :min="$getMinNum(scope.row.decimalPrecision)"
                          :max="999999"
                          @change="changeAdhocEntryQty(scope.row)"
                          v-if="
                            scope.row.isAdhocEntry === '1' ||
                            scope.row.isCustomProduct === '1'
                          "
                          :key="'qty11' + scope.row.decimalPrecision"
                        />
                        <el-input-number
                          v-else
                          v-thousandSplit="{
                            precision: scope.row.decimalPrecision
                          }"
                          style="width: 98%"
                          v-model="scope.row.qty"
                          controls-position="right"
                          :precision="scope.row.decimalPrecision"
                          :roundingType="scope.row.unitRoundingType"
                          :min="$getMinNum(scope.row.decimalPrecision)"
                          :max="999999"
                          @change="
                            $event => {
                              scope.row.qtyError = false
                              scope.row['ROW-ERROR'] = false
                            }
                          "
                        />

                        <TablePropError v-if="scope.row[item.prop + 'Error']" />
                      </template>

                      <template v-else-if="item.prop === 'deliveryDateForDay'">
                        <el-input-number
                          v-thousandSplit="{ precision: 0 }"
                          style="width: 98%"
                          v-model="scope.row.deliveryDateForDay"
                          controls-position="right"
                          :precision="0"
                          :min="1"
                          :max="999999"
                          @change="
                            changeExpectedDeliveryDate(scope.$index, scope.row)
                          "
                        />
                        <TablePropError v-if="scope.row[item.prop + 'Error']" />
                      </template>
                      <template v-else-if="item.prop === 'deliveryDate'">
                        <MyDatePicker
                          v-model="scope.row.deliveryDate"
                          :picker-options="timeDatePickerOptions"
                          @change="changeDeliveryDate(scope.$index, scope.row)"
                          :format="fmtForYmd"
                          value-format="timestamp"
                          style="width: 98%"
                          placeholder=""
                          clearable
                        ></MyDatePicker>
                        <TablePropError v-if="scope.row[item.prop + 'Error']" />
                      </template>
                      <template v-else-if="item.prop === 'remarks'">
                        <descriptionEditDlg
                          v-model="scope.row.remarks"
                          :maxlength="200"
                        />
                      </template>
                      <template v-else-if="item.prop === 'productType'">
                        <el-select
                          style="width: 98%"
                          v-model="scope.row.productType"
                          placeholder=""
                          filterable
                          v-if="scope.row.isAdhocEntry === '1'"
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
                      <template v-else-if="item.prop === 'qtyOnHand'">
                        <template>{{
                          $numberStr(scope.row[item.prop], {
                            precision: scope.row.decimalPrecision,
                            roundingType: scope.row.unitRoundingType
                          })
                        }}</template>
                      </template>
                      <template v-else-if="item.prop === 'rejectedQtyForBasic'">
                        <template>{{
                          $numberStr(scope.row[item.prop], {
                            precision: scope.row.decimalPrecision,
                            roundingType: scope.row.unitRoundingType
                          })
                        }}</template>
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
                  >
                    <template #default="scope">
                      <div class="flexCen">
                        <el-icon
                          class="pointer"
                          style="font-size: 20px; color: #f56c6c"
                          :title="$t('uiBtn.delete')"
                          @click="handleDelRow(scope.$index, scope.row)"
                          ><Delete
                        /></el-icon>
                      </div>
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
                        :maxlength="3000"
                      ></MyInput>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
          </div>
        </el-collapse>
      </div>
    </template>
    <selectRequiredByTable
      ref="selectRequiredByTable"
      :departmentId="form.departmentId"
      @update="updateRequiredBy"
    />
    <selectWarehouseTable
      ref="selectWarehouseTable"
      @update="updateWarehouse"
    />
    <selectProductTable
      ref="selectProductTable"
      :warehouseId="form.dropShipping !== '1' ? form.warehouseId : ''"
      :dropShipping="form.dropShipping"
      :costProjectId="form.costProjectId"
      @onSuccess="updateTable"
    />

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
  saveDraftPurchaseRequisite,
  savePurchaseRequisite,
  queryCanSelectWarehouseDefaultWarehouse,
  queryDropShippingAddressOptions,
  queryPRCanSelectWarehouseList
} from '@/api/purchaseManagement/purchaseRequisition'
import { queryAllUomListByLocalization } from '@/api/system/uom'
import pageMixin from '@/mixins/tableMinx'
import formRouteMixin from './formRouteMixin'
import qtyPrecisionMixin from './qtyPrecisionMixin'

import selectRequiredByTable from '@/views/purchaseManagement/purchaseRequisition/components/selectRequiredByTable.vue'
import selectWarehouseTable from '@/views/purchaseManagement/purchaseRequisition/components/selectWarehouseTable.vue'
import selectProductTable from './components/selectProductTable.vue'
import selectCostProjectTable from '@/views/purchaseManagement/purchaseRequisition/components/selectCostProjectTable.vue'
import selectDropShippingAddress from './components/selectDropShippingAddress.vue'
import { queryUsersNoPage } from '@/api/organization/corporate'
import { queryCanSelectCostProjectListForPage } from '@/api/projectManagement/project'
import { formDirtyClass } from '@/mixins/formDirtyClass'
export default {
  dicts: [
    'pr_reason_type',
    'p_required_type',
    'valuation_unit',
    'product_type',
    'business_contact_person_title'
  ],
  mixins: [formRouteMixin, pageMixin, qtyPrecisionMixin],
  components: {
    Delete,
    selectDropShippingAddress,
    selectRequiredByTable,
    selectWarehouseTable,
    selectProductTable,
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
      submitLoading: false,
      btnLoading: false,
      saveKey: '27',
      savePath: 'purchaseMTable',
      activeNames: ['1', '2'],
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
      deptOptionsLoading: false,
      requiredByOptions: [],
      requiredByLoading: false,
      costProjectOptions: [],
      costProjectOptionsLoading: false,

      dropShippingAddressOptions: [],
      warehouseOptions: [],
      warehouseOptionsLoading: false,

      columns: [
        {
          prop: 'productName',
          label: vm.$t('PURCHASE.productName'),
          visible: true,
          tooltip: true,
          colMinWidth: 180,
          required: true,
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
      allUomList: [],

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
    propTimeId: {
      type: String,
      default: ''
    },
    propRowId: {
      type: String,
      default: ''
    }
  },
  watch: {
    propTimeId: {
      immediate: true,
      handler: function (selected) {
        this.timeId = this.propTimeId
        this.rowId = this.propRowId
        this.handleAdd()
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
    addAdhocEntryAuth() {
      return this.checkPermi([
        'purchaseManagement:purchaseRequisition:addAdhocEntry'
      ])
    },
    addCustomProductAuth() {
      return this.checkPermi([
        'purchaseManagement:purchaseRequisition:addCustomProduct'
      ])
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
    comVisibleColumn() {
      let arr = [...this.visibleColumn]
      const filterProps1 = []
      if (this.aliasIsHide) {
        filterProps1.push('alias')
      }
      arr = arr.filter(x => !filterProps1.includes(x.prop))
      return arr
    }
  },

  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
  },
  mounted() {},
  methods: {
    queryDropShippingAddressOptions() {
      queryDropShippingAddressOptions().then(res => {
        this.dropShippingAddressOptions = res.data || []
      })
    },
    dropShippingAddressChange(row) {
      this.form['receiveAddressName'] = row.receiveAddressName
      this.$nextTick(() => {
        this.$refs.form1.validateField('receiveAddressName')
      })
      if (row.contactPersonName) {
        this.form['title'] = row.title
        this.form['contactPersonName'] = row.contactPersonName
        this.form['email'] = row.email
        this.form['mobileCode'] = row.mobileCode
        this.form['mobileNum'] = row.mobileNum
        this.form['mobilePhone'] = row.mobilePhone
      }
    },
    handleSortChange({ prop, order }) {
      this.handlerTableList()

      if (!prop || !order) {
        this.tableList = (this.tableList || []).slice().sort((a, b) => {
          const ia = a && a._stableIndex !== undefined ? a._stableIndex : 0
          const ib = b && b._stableIndex !== undefined ? b._stableIndex : 0
          return ia - ib
        })
        return
      }

      this.tableList = (this.tableList || []).slice().sort((a, b) => {
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
    handleAdd() {
      this.reset()
      this.queryCanSelectWarehouseDefaultWarehouse()
      this.queryUserDepartment()
      this.queryAllUomList()
      this.queryDropShippingAddressOptions()
      this.queryCanSelectCostProjectListForPage()
      this.queryPRCanSelectWarehouseList()
    },
    getFormJson() {
      const param = { ...this.form }
      param.createTableList = this.createTableList
      const myFileIds =
        this.$refs.uploadRef && this.$refs.uploadRef.getFileIds()
      param.commonFileList = myFileIds
      return JSON.stringify(param)
    },
    reset() {
      this.form = {
        dropShipping: '0',
        reasonType: undefined,
        reason: undefined,
        requiredType: '1',
        purchaseRequisiteStatus: undefined,
        requiredBy: this.$store.state.user.nickName,
        requiredId: this.$store.state.user.userId,
        createdBy: this.$store.state.user.nickName,
        receiveAddressName: ''
      }
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForProductInfo = false
      this.tableList = []
      this.createTableList = []

      this._stableCounter = 0
      this.changeTableList()
      this.activeNames = ['1', '2']
      setTimeout(() => {
        if (this.$refs.uploadRef) {
          this.$refs.uploadRef.initFileList([])
        }
      }, 300)
      this.resetForm('form1')
    },
    backFN() {
      formDirtyClass.showNotify(this.formRoute.name).then(msg => {
        if (msg === 'save') {
          this.handleSaveDraftNoConFirm()
          return
        } else if (msg === 'stop') {
          return
        }
        this.cancel()
      })
    },

    cancel() {
      this.$store.dispatch('tagsView/delView', this.formRoute)
      this.$router.push({ path: '/purchaseManagement/purchaseRequisition' })
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
          setTimeout(() => {
            const initFormJson = this.getFormJson()
            formDirtyClass.routeStatusData[this.formRoute.name] = {
              $vm: this,
              saveShow: true,
              submitShow: true,
              initFormJson,
              getFormJson: this.getFormJson,
              isSaveSuccess: false,
              saveOrSubmitFn: this.handleSaveDraftNoConFirm
            }
          }, 300)
        })
        .catch(() => {
          this.btnLoading = false
        })
    },
    nav(row) {
      this.$router.push({
        path: '/productManagement/viewExtendedProductInfo',
        query: {
          id: row.productId,
          timeId: Date.now()
        }
      })
    },

    queryUserDepartment() {
      this.deptOptionsLoading = true
      queryUserDepartment({ menuPerms: this.menuKey.PR })
        .then(res => {
          this.deptOptionsLoading = false
          this.deptOptions = res.data || []
          setTimeout(() => {
            this.deptOptions.forEach(item => {
              if (item.isDefault === '1') {
                this.form['departmentId'] = item.departmentId
                this.form['departmentName'] = item.departmentName
                this.form['allSuperiorName'] = item.allSuperiorName
                this.queryRequiredByOptions()
              }
            })
          }, 200)
          setTimeout(() => {
            const initFormJson = this.getFormJson()
            formDirtyClass.routeStatusData[this.formRoute.name] = {
              $vm: this,
              saveShow: true,
              submitShow: true,
              initFormJson,
              getFormJson: this.getFormJson,
              isSaveSuccess: false,
              saveOrSubmitFn: this.handleSaveDraftNoConFirm
            }
          }, 300)
        })
        .catch(() => {
          this.deptOptionsLoading = false
        })
    },
    departmentChange(value) {
      const item =
        this.deptOptions.find(item => item.departmentId === value) || {}
      this.form['departmentId'] = item.departmentId
      this.form['departmentName'] = item.departmentName
      this.form['allSuperiorName'] = item.allSuperiorName
      if (this.form.requiredId !== this.$store.state.user.userId) {
        this.requiredByClear()
      }
      this.queryRequiredByOptions()
    },

    queryRequiredByOptions() {
      if (!this.form.departmentId) {
        this.requiredByOptions = []
        this.requiredByLoading = false
        this.queryRBTimer = Date.now()
      }
      const params = {
        departmentId: this.form.departmentId
      }
      const timer = Date.now()
      this.queryRBTimer = timer
      this.requiredByLoading = true
      queryUsersNoPage(params)
        .then(response => {
          if (this.queryRBTimer !== timer) return
          this.requiredByLoading = false
          this.requiredByOptions = response.data || []
        })
        .catch(() => {
          this.requiredByLoading = false
        })
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

    queryCanSelectCostProjectListForPage() {
      this.costProjectOptionsLoading = true
      queryCanSelectCostProjectListForPage({
        pageNum: 1,
        pageSize: 9999
      })
        .then(res => {
          this.costProjectOptionsLoading = false
          this.costProjectOptions = res.rows || []
        })
        .catch(() => {
          this.costProjectOptionsLoading = false
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
      const {
        costProjectName,
        costProjectId,
        costProjectCode,
        businessPartnerName,
        receiveAddress
      } = row
      this.form['costProjectName'] = costProjectName
      this.form['costProjectId'] = costProjectId
      this.form['costProjectCode'] = costProjectCode
      if (receiveAddress) {
        this.form['receiveAddressName'] = receiveAddress
      }
      this.form['contactPersonName'] = businessPartnerName

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

    dropShippingChange() {},

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

    queryPositionSugg(queryString, cb, row) {
      let positionList = []
      if (row.externalPartNoOptions) {
        positionList = row.externalPartNoOptions
      } else {
        const list = row.externalPartNoList || []
        row.externalPartNoOptions = list.map(externalPartNo => {
          return { value: externalPartNo }
        })
        positionList = row.externalPartNoOptions
      }

      let results
      if (queryString) {
        results = positionList.filter(
          p => p.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      } else {
        results = positionList
      }
      cb(results)
    },

    queryAllUomList() {
      queryAllUomListByLocalization({ menuPerms: this.menuKey.PR }).then(
        res => {
          this.allUomList = res.data || []
        }
      )
    },
    serviceUomChange(row) {
      if (row.uom === row.basicUom) {
        row['uomCoefficient'] = 1
      }
    },
    adhocEntryUomChange(row) {
      this.updateQtyPrecision(
        row,
        this.allUomList.find(item => item.uomName === row.uom)
      )
      row['basicUom'] = row.uom
      row['uomError'] = false
      row['ROW-ERROR'] = false
    },
    changeAdhocEntryQty(row) {
      row['qtyError'] = false
      row['ROW-ERROR'] = false
    },
    changeExpectedDeliveryDate(index, row) {
      row['deliveryDateForDayError'] = false
      row['ROW-ERROR'] = false
      if (index === 0) {
        const topRow = this.tableList[0]
        if (topRow && topRow.deliveryDateForDay) {
          const oldExpectedDeliveryDate = this.tableList.find(
            (item, index) => index > 0 && item.deliveryDateForDay
          )
          if (oldExpectedDeliveryDate) {
            const msg = topRow.deliveryDateForDay
            this.$modal
              .confirm(
                this.$t('PURCHASE.expectedDateForDayConfirm').replace('$1', msg)
              )
              .then(() => {
                this.tableList.forEach(row => {
                  row['deliveryDateForDay'] = topRow.deliveryDateForDay
                })
              })
          } else {
            this.tableList.forEach(row => {
              row['deliveryDateForDay'] = topRow.deliveryDateForDay
            })
          }
        }
      }
    },
    changeDeliveryDate(index, row) {
      row['deliveryDateError'] = false
      row['ROW-ERROR'] = false
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
                  row['deliveryDateError'] = false
                  row['ROW-ERROR'] = false
                })
              })
          } else {
            this.tableList.forEach(row => {
              row['deliveryDate'] = topRow.deliveryDate
              row['deliveryDateError'] = false
              row['ROW-ERROR'] = false
            })
          }
        }
      }
    },

    handleSddAdhocEntry() {
      this.createTableList.push({
        isAdhocEntry: '1',
        productType: '1',
        includeDecimal: '1',
        uomCoefficient: 1,
        decimalPrecision: 3,
        unitRoundingType: undefined,
        customId: +new Date(),
        deliveryDate:
          this.tableList.length > 0 && this.tableList[0].deliveryDate
            ? this.tableList[0].deliveryDate
            : ''
      })

      const newRow = this.createTableList[this.createTableList.length - 1]
      if (newRow && newRow._stableIndex === undefined) {
        this._stableCounter = (this._stableCounter || 0) + 1
        newRow['_stableIndex'] = this._stableCounter
      }
      this.tableList = this.createTableList
      this.$refs.tables && this.$refs.tables.clearSort()
    },
    handleAddCustomProduct() {
      this.createTableList.push({
        isCustomProduct: '1',
        productType: '1',
        includeDecimal: '1',
        uomCoefficient: 1,
        decimalPrecision: 3,
        unitRoundingType: undefined,
        customId: +new Date(),
        deliveryDate:
          this.tableList.length > 0 && this.tableList[0].deliveryDate
            ? this.tableList[0].deliveryDate
            : ''
      })

      const newRow2 = this.createTableList[this.createTableList.length - 1]
      if (newRow2 && newRow2._stableIndex === undefined) {
        this._stableCounter = (this._stableCounter || 0) + 1
        newRow2['_stableIndex'] = this._stableCounter
      }
      this.tableList = this.createTableList
      this.$refs.tables && this.$refs.tables.clearSort()
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
          if (row[this.rowIdKey]) {
            const index = rows.findIndex(
              item => row[this.rowIdKey] === item[this.rowIdKey]
            )
            if (index !== -1) {
              rows[index] = row
            }
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

        rows.forEach(r => {
          if (r && r._stableIndex === undefined) {
            this._stableCounter = (this._stableCounter || 0) + 1
            r._stableIndex = this._stableCounter
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
      if (
        this.tableList &&
        this.tableList.length > 0 &&
        rowIndex === this.tableList.length - 1
      ) {
        const { isAdhocEntry } = this.tableList[this.tableList.length - 1]
        if (isAdhocEntry && isAdhocEntry === '1') {
          color = 'high-row'
        }
      }
      if (row['ROW-ERROR']) {
        color = 'required-row'
      }
      return color
    },
    tableCellClassName({ row, column }) {
      let cellClass = ''
      if (
        this.tableList.find(
          item => !item[column.property] && item[column.property + 'Error']
        )
      ) {
        cellClass = 'is-required-table-cell'
      }
      return cellClass
    },

    scrollPageToTable() {
      try {
        if (!this.$refs.collapseScrollPage) return
        const offsetTop = this.$refs.collapseScrollPage.offsetTop
        if (!this.$refs.FormPageLayoutRef) return
        const pageContent =
          this.$refs.FormPageLayoutRef.$el.querySelector('.form-page-content')
        if (pageContent) {
          pageContent.scrollTo({
            top: offsetTop - 50,
            behavior: 'smooth'
          })
        }
      } catch (err) {}
    },
    errorMessage(code) {
      this.scrollPageToTable()

      let rowIndex
      this.tableList.forEach((item, index) => {
        if (code && !this.$resultOfBoolean(item[code])) {
          item['ROW-ERROR'] = true
          item[code + 'Error'] = true
          if (!this.$resultOfBoolean(rowIndex)) {
            rowIndex = index
          }
        } else {
          item['ROW-ERROR'] = false
          if (code) {
            item[code + 'Error'] = false
          } else {
            Object.keys(item).forEach(key => {
              if (key.endsWith('Error')) {
                item[key] = false
              }
            })
          }
        }
      })
      this.$nextTick(() => {
        this.scrollToErrorColumn()
      })
    },

    async submitForm(submitType, isConfirm = true, gotoRoute) {
      const myFileIds = this.$refs.uploadRef.getFileIds()
      if (myFileIds === false) {
        return
      }
      let valid1 = false
      if (submitType === 'save') {
        valid1 = true
        this.collapseWarningForBasicInfo = false
        this.$refs.form1.clearValidate()
      } else {
        valid1 = await this.$refs.form1.validate().catch(() => false)
        this.collapseWarningForBasicInfo = !valid1
        if (!valid1) {
          this.$modal.msgError(
            this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
          )
        }
      }

      if (valid1) {
        let param = { ...this.form }
        const detailList = this.createTableList
        if (detailList.length <= 0 && submitType !== 'save') {
          this.$modal.msgError(this.$t('PURCHASE.prProductTableEmpty'))
          this.collapseWarningForProductInfo = true
          return
        }
        if (detailList.length > 0 && submitType !== 'save') {
          const productNameReq = detailList.find(item => {
            return !(item.productName || '').trim()
          })
          if (productNameReq) {
            this.errorMessage('productName')
            this.$modal.msgError(
              this.$t('ui.commonReqMsg').replace(
                '$1',
                this.$t('PURCHASE.productName')
              )
            )
            this.collapseWarningForProductInfo = true
            return
          }
          const uomReq = detailList.find(item => {
            return !this.$resultOfBoolean(item.uom)
          })
          if (uomReq) {
            this.errorMessage('uom')

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
            this.errorMessage('qty')

            this.$modal.msgError(
              this.$t('ui.commonReqMsg').replace('$1', this.$t('PURCHASE.qty'))
            )
            this.collapseWarningForProductInfo = true
            return
          }

          const deliveryDateForDay = detailList.find(item => {
            return !this.$resultOfBoolean(item.deliveryDate)
          })
          if (deliveryDateForDay) {
            this.errorMessage('deliveryDate')

            this.$modal.msgError(
              this.$t('ui.commonReqMsg').replace(
                '$1',
                this.$t('PURCHASE.requestedReceiptDate')
              )
            )
            this.collapseWarningForProductInfo = true
            return
          }
        }

        this.collapseWarningForProductInfo = false
        param.purchaseRequisiteDetailList = detailList
        param = this.$trimOfObj(JSON.parse(JSON.stringify(param)))

        param.purchaseRequisiteDetailList.forEach(x => {
          if (x.externalPartNoListJson) {
            x['externalPartNo'] = x.externalPartNoListJson.join(',')
            x.externalPartNoListJson = JSON.stringify(x.externalPartNoListJson)
          } else {
            x['externalPartNo'] = undefined
          }
        })
        param.commonFileList = myFileIds
        let confirmMsg
        let successMsg
        let submitFn
        if (submitType === 'save') {
          confirmMsg = this.$t('PURCHASE.prSaveConfirm')
          successMsg = this.$t('PURCHASE.prSaveSuccess')
          submitFn = saveDraftPurchaseRequisite
        } else {
          confirmMsg = this.$t('PURCHASE.prSubmitConfirm')
          successMsg = this.$t('PURCHASE.prSubmitSuccess')
          submitFn = savePurchaseRequisite
        }

        if (param.dropShipping === '1') {
          param.warehouseName = undefined
          param.warehouseId = undefined
          param.noCanSelectProductIdList = undefined
        }
        if (param.dropShipping !== '1') {
          param.receiveAddressName = undefined
          param.title = undefined
          param.contactPersonName = undefined
          param.email = undefined
          param.mobileCode = undefined
          param.mobileNum = undefined
          param.mobilePhone = undefined
        }
        if (!param.mobileNum) {
          param.mobileCode = undefined
          param.mobilePhone = undefined
        }

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
            submitType,
            gotoRoute
          })
          return
        }
        if (isConfirm) {
          this.$modal
            .confirm(confirmMsg)
            .then(() => {
              this.submitLoading = true
              return submitFn(param)
            })
            .then(response => {
              const pageItem =
                formDirtyClass.routeStatusData[this.formRoute.name]
              if (pageItem) {
                pageItem.isSaveSuccess = true
              }
              this.$modal.msgSuccess(successMsg.replace('$1', response.msg))
              this.cancel()
              this.submitLoading = false
            })
            .catch(() => {
              this.submitLoading = false
            })
        } else {
          this.submitLoading = true
          return submitFn(param)
            .then(response => {
              const pageItem =
                formDirtyClass.routeStatusData[this.formRoute.name]
              if (pageItem) {
                pageItem.isSaveSuccess = true
              }
              this.$modal.msgSuccess(successMsg.replace('$1', response.msg))
              this.submitLoading = false
              if (gotoRoute && gotoRoute.name !== this.formRoute.name) {
                this.$store.dispatch('tagsView/delView', this.formRoute)
                this.$router.push(gotoRoute).catch(() => {})
              } else {
                this.cancel()
              }
            })
            .catch(() => {
              this.submitLoading = false
            })
        }
      }
    },
    autoRemoveAndSubmit({
      delList,
      param,
      successMsg,
      submitFn,
      submitType,
      gotoRoute
    }) {
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
              const pageItem =
                formDirtyClass.routeStatusData[this.formRoute.name]
              if (pageItem) {
                pageItem.isSaveSuccess = true
              }
              this.$modal.msgSuccess(successMsg.replace('$1', response.msg))
              this.submitLoading = false

              if (gotoRoute && gotoRoute.name !== this.formRoute.name) {
                this.$store.dispatch('tagsView/delView', this.formRoute)
                this.$router.push(gotoRoute).catch(() => {})
              } else {
                this.cancel()
              }
            })
            .catch(() => {
              this.submitLoading = false
            })
        })
        .catch(() => {})
    },
    handleSaveDraft() {
      this.submitForm('save')
    },
    handleSaveDraftNoConFirm(gotoRoute) {
      this.submitForm('save', false, gotoRoute)
    }
  }
}
</script>
<style lang="scss">
.high-row td {
  // height: 49px;
}
</style>
