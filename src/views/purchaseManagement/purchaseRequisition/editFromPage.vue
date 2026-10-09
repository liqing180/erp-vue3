<template>
  <FormPageLayout ref="FormPageLayoutRef" v-loading="submitLoading">
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        v-if="submitBtnShow && !approvedBtnShow"
        @click="submitForm"
        >{{ $t('uiBtn.submit') }}
      </el-button>
      <el-button
        type="primary"
        size="small"
        v-if="saveDraftBtnShow"
        @click="handleSaveDraft"
        >{{ $t('uiBtn.saveDraft') }}
      </el-button>
      <el-button
        type="primary"
        size="small"
        v-if="approvedBtnShow"
        @click="handleApproved"
        >{{ $t('uiBtn.approve') }}
      </el-button>
      <el-button
        type="primary"
        size="small"
        v-if="rejectedBtnShow"
        @click="handleRejected"
        >{{ $t('uiBtn.reject1') }}
      </el-button>
      <el-button
        type="primary"
        size="small"
        v-if="withdrawApproveBtnShow"
        @click="handleWithdrawApprove"
        >{{ $t('uiBtn.withdrawApprove') }}
      </el-button>
      <el-button
        type="primary"
        size="small"
        v-if="cancelBtnShow"
        @click="handleCancel"
        >{{ $t('uiBtn.cancel') }}
      </el-button>
      <el-button
        type="primary"
        size="small"
        v-if="closeBtnShow"
        @click="handleClose"
        >{{ $t('uiBtn.close') }}
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
        v-if="buttonAuthMsg.isCanSeeUpdateMsg === '1'"
        @click="revisionComparison"
        >{{ $t('uiBtn.revisionComparison') }}</el-button
      >
      <el-button
        type="primary"
        size="small"
        v-if="isShowEditBtn"
        @click="exitComparison"
      >
        {{ $t('uiBtn.edit') }}
      </el-button>
      <el-dropdown
        class="ml10 mr10 fr"
        @command="command => settingHandleCommand(command)"
        trigger="click"
        v-if="bpHistoryVersionList.length > 0 && comeFrom === '1'"
        @visible-change="dropdownVisibleChange"
      >
        <el-button size="small" type="primary">
          {{ $t('uiBtn.revisionRecord')
          }}<el-icon class="ml5"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown
          ><el-dropdown-menu>
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
          </el-dropdown-menu></template
        >
      </el-dropdown>
      <slot name="bpmMoreBtn" :btnAuth="buttonAuthMsg"></slot>
      <el-button type="primary" @click="backFN" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
      <div v-if="comeFrom === '2'" class="bpm-page-menu-title">
        {{ $t('menu.purchaseRequisition') }}
      </div>
    </template>

    <template v-slot:content>
      <div>
        <div class="form-card mb10" v-if="isComparison">
          <div class="legend-bar">
            <span class="legend-text">{{ $t('ui.legend') }}</span>
            <span class="legend-divider"></span>
            <span class="legend-item"
              ><span class="color-block add"></span>{{ $t('ui.added') }}</span
            >
            <span class="legend-divider"></span>
            <span class="legend-item"
              ><span class="color-block edit"></span
              >{{ $t('ui.modified') }}</span
            >
            <span class="legend-divider"></span>
            <span class="legend-item"
              ><span class="color-block del"></span>{{ $t('ui.deleted') }}</span
            >
          </div>
        </div>
        <div
          class="form-card reject-card collapse-item-content-pt0 mb10"
          v-if="
            isComparison && (form.operationLogForLastReject || {}).operatorBy
          "
        >
          <el-collapse v-model="activeNames">
            <el-collapse-item name="11">
              <template #title
                ><FormCollapseItemTitle :title="$t('ui.rejectionOpinion')"
              /></template>
              <div class="mb10">
                <div class="reject-remarks">
                  {{ form.operationLogForLastReject.operationDescription }}
                </div>
                <div class="reject-by">
                  {{ $t('ui.rejectedBy1') }}：{{
                    form.operationLogForLastReject.operatorBy
                  }}
                  |
                  {{
                    parseTime(
                      form.operationLogForLastReject.operatorTime,
                      fmtForYmdhms
                    )
                  }}
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
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
                        :title="form.purchaseRequisiteNo"
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
                      <ComparisonInput
                        v-if="isModified('departmentName')"
                        :beforeValue="getBeforeValue('departmentName')"
                        :afterValue="
                          getAfterValue('departmentName', form.departmentName)
                        "
                      />
                      <CommonSelect
                        v-else
                        :id="form.departmentId"
                        :label="form.departmentName"
                        :title="form.allSuperiorName"
                        idKey="departmentId"
                        labelKey="departmentName"
                        :disabled="comDisFrom"
                        :options="deptOptions"
                        :loading="deptOptionsLoading"
                        @change="departmentChange"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PURCHASE.requiredBy')}`"
                      prop="requiredBy"
                    >
                      <ComparisonInput
                        v-if="isModified('requiredBy')"
                        :beforeValue="getBeforeValue('requiredBy')"
                        :afterValue="
                          getAfterValue('requiredBy', form.requiredBy)
                        "
                      />

                      <CommonSelectAndList
                        v-if="!isModified('requiredBy')"
                        :id="form.requiredId"
                        :label="form.requiredBy"
                        idKey="userId"
                        labelKey="nickName"
                        filterable
                        :options="requiredByOptions"
                        :loading="requiredByLoading"
                        :disabled="
                          comDisFrom || requiredByLoading || !form.departmentId
                        "
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
                      <ComparisonInput
                        v-if="isModified('costProjectCode')"
                        :beforeValue="getBeforeValue('costProjectCode')"
                        :afterValue="
                          getAfterValue('costProjectCode', form.costProjectCode)
                        "
                      />
                      <CommonSelectAndList
                        v-else
                        :id="form.costProjectId"
                        :label="form.costProjectCode"
                        idKey="costProjectId"
                        labelKey="costProjectCode"
                        filterable
                        :options="costProjectOptions"
                        :loading="costProjectOptionsLoading"
                        @change="updateCostProjectName"
                        @handleOpen="openCostProjectNameTable"
                        :disabled="comDisFrom"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PURCHASE.dropShipping')}`"
                      :class="[isModified('dropShipping')]"
                    >
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
                      key="receiveAddressName11"
                    >
                      <ComparisonInput
                        v-if="isModified('receiveAddressName')"
                        :beforeValue="getBeforeValue('receiveAddressName')"
                        :afterValue="
                          getAfterValue(
                            'receiveAddressName',
                            form.costProjectCode
                          )
                        "
                      />
                      <selectDropShippingAddress
                        v-else
                        class="w100"
                        v-model="form.receiveAddressName"
                        :title="form.receiveAddressName"
                        :canSelectOptions="dropShippingAddressOptions"
                        @change="dropShippingAddressChange"
                        :disabled="comDisFrom"
                      />
                    </el-form-item>

                    <el-form-item
                      :label="`${$t('PURCHASE.deliveryAddress')}`"
                      prop="warehouseName"
                      v-else
                    >
                      <ComparisonInput
                        v-if="isModified('warehouseName')"
                        :beforeValue="getBeforeValue('warehouseName')"
                        :afterValue="
                          getAfterValue('warehouseName', form.warehouseName)
                        "
                      />
                      <CommonSelectAndList
                        v-else
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
                      <ComparisonInput
                        v-if="isModified('contactPersonName')"
                        :beforeValue="getBeforeValue('contactPersonName')"
                        :afterValue="
                          getAfterValue(
                            'contactPersonName',
                            form.contactPersonName
                          )
                        "
                      />
                      <el-input
                        v-else
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
                      <ComparisonInput
                        v-if="isModified('email')"
                        :beforeValue="getBeforeValue('email')"
                        :afterValue="getAfterValue('email', form.email)"
                      />
                      <el-input
                        v-else
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
                      <ComparisonInput
                        v-if="isModified('mobilePhone')"
                        :beforeValue="getBeforeValue('mobilePhone')"
                        :afterValue="
                          getAfterValue('mobilePhone', form.mobilePhone)
                        "
                      />
                      <MobilePhoneInput
                        v-else
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
                    <el-form-item
                      :label="$t('ui.reason')"
                      :class="[isModified('reason')]"
                    >
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
                      <myUpload
                        ref="uploadRef"
                        :disabled="comDisFrom"
                        :modifyHighlight="modifyHighlight"
                      />
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
                  <span v-if="tableList.length" class="info-item mr20">
                    {{ $t('PURCHASE.product') }} : {{ tableList.length }}
                  </span>
                </FormCollapseItemTitle></template
              >
              <div class="pb20" v-loading="btnLoading">
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5" v-if="!comDisFrom">
                    <el-button
                      :disabled="form.dropShipping !== '1' && !form.warehouseId"
                      @click="handleAddBtn"
                      type="primary"
                      :icon="Plus"
                      size="small"
                      >{{ $t('uiBtn.add') }}</el-button
                    >
                  </el-col>
                  <el-col
                    :span="1.5"
                    v-if="!comDisFrom && addAdhocEntryAuth && false"
                  >
                    <el-button
                      :disabled="form.dropShipping !== '1' && !form.warehouseId"
                      @click="handleSddAdhocEntry"
                      type="primary"
                      :icon="Plus"
                      size="small"
                      >{{ $t('menu.addAdhocEntry') }}</el-button
                    >
                  </el-col>

                  <el-col
                    :span="1.5"
                    v-if="!comDisFrom && addCustomProductAuth"
                  >
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
                  :key="'table' + modifyHighlight"
                  :cell-class-name="tableCellClassName"
                  :data="tableList"
                  @select="handleSelectionChange"
                  @select-all="handleSelectAll"
                  :max-height="300"
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
                    v-for="item in visibleCurColumns"
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
                      <template v-if="item.prop === 'productName'">
                        <el-input
                          v-if="
                            (scope.row.isAdhocEntry === '1' ||
                              scope.row.isCustomProduct === '1') &&
                            !comDisFrom
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
                      <template
                        v-else-if="
                          item.prop === 'internalPartNo' &&
                          scope.row.isCustomProduct !== '1' &&
                          scope.row.isTemp !== '1'
                        "
                      >
                        <span
                          class="primary-link"
                          @click="nav(scope.row, 'internalPartNo')"
                          >{{ scope.row.internalPartNo }}</span
                        >
                      </template>
                      <template v-else-if="item.prop === 'externalPartNo11'">
                        <span>{{
                          (scope.row.externalPartNoList || []).join(', ')
                        }}</span>
                      </template>
                      <template v-else-if="item.prop === 'alias'">
                        <el-input
                          v-if="
                            (scope.row.isAdhocEntry === '1' ||
                              scope.row.isCustomProduct === '1') &&
                            !comDisFrom
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
                          v-if="!comDisFrom"
                          v-model="scope.row.description"
                          :maxlength="7000"
                        />
                        <template v-else>
                          <DescriptionToolTipShow
                            :showStr="scope.row[item.prop]"
                          />
                        </template>
                      </template>
                      <template v-else-if="item.prop === 'partNo'">
                        <el-input
                          v-if="
                            (scope.row.isAdhocEntry === '1' ||
                              scope.row.isCustomProduct === '1') &&
                            !comDisFrom
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
                          :title="showUomLabel(scope.row[item.prop])"
                          @change="adhocEntryUomChange(scope.row)"
                          placeholder=""
                          v-if="
                            !comDisFrom &&
                            (scope.row.isAdhocEntry === '1' ||
                              scope.row.isCustomProduct === '1')
                          "
                          filterable
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
                            :disabled="
                              comDisFrom || scope.row.uom === scope.row.basicUom
                            "
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
                      <template v-else-if="item.prop === 'qtyOnHand'">
                        <template>{{
                          $numberStr(scope.row[item.prop], {
                            precision: scope.row.decimalPrecision,
                            roundingType: scope.row.unitRoundingType
                          })
                        }}</template>
                      </template>
                      <template v-else-if="item.prop === 'qty'">
                        <template v-if="!comDisFrom">
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
                        </template>
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

                        <TablePropError v-if="scope.row[item.prop + 'Error']" />
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
                          v-if="!comDisFrom"
                          v-model="scope.row.deliveryDateForDay"
                          controls-position="right"
                          :precision="0"
                          :min="1"
                          :max="999999"
                          @change="
                            changeExpectedDeliveryDate(scope.$index, scope.row)
                          "
                        />
                        <template v-else>{{
                          $numberStr(scope.row[item.prop], 0)
                        }}</template>
                        <TablePropError v-if="scope.row[item.prop + 'Error']" />
                      </template>
                      <template v-else-if="item.prop === 'deliveryDate'">
                        <MyDatePicker
                          v-if="!comDisFrom"
                          v-model="scope.row.deliveryDate"
                          :picker-options="timeDatePickerOptions"
                          @change="changeDeliveryDate(scope.$index, scope.row)"
                          :format="fmtForYmd"
                          value-format="timestamp"
                          style="width: 98%"
                          placeholder=""
                          clearable
                        ></MyDatePicker>
                        <template v-else>{{
                          parseTime(scope.row.deliveryDate, fmtForYmd)
                        }}</template>

                        <TablePropError v-if="scope.row[item.prop + 'Error']" />
                      </template>

                      <template v-else-if="item.prop === 'remarks'">
                        <descriptionEditDlg
                          v-model="scope.row.remarks"
                          :maxlength="200"
                          :disabled="comDisFrom"
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
                      <template v-else>{{ scope.row[item.prop] }}</template>
                    </template>
                  </el-table-column>
                  <el-table-column
                    v-if="!comDisFrom"
                    :label="$t('ui.action')"
                    key="action"
                    align="center"
                    min-width="120"
                    class-name="small-padding fixed-width"
                    fixed="right"
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
                    <el-form-item
                      :label="$t('ui.remarks')"
                      prop="remarks"
                      :class="[isModified('remarks')]"
                    >
                      <MyInput
                        type="textarea"
                        v-model="form.remarks"
                        :autosize="{ minRows: 1, maxRows: 4 }"
                        resize="none"
                        show-word-limit
                        :disabled="comDisFrom"
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
                <SystemOperationLogTable :tableList="operationLogList" />
              </div>
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

    <ApprovedDialog
      :id="form.purchaseRequisiteId"
      :taskId="taskId || form.taskId"
      :fromType="dataType"
      :apl-visible="aplVisible"
      :apl-api-url="approvedUrl"
      @submitSuccess="aplSubmitSuccess"
      @aplVisibleChange="aplVisibleChange"
      :formData="approvedFormData"
      formDataKey="purchaseRequisite"
    />
    <RejectDialog
      :id="form.purchaseRequisiteId"
      :taskId="taskId || form.taskId"
      :fromType="dataType"
      :rj-visible="rjVisible"
      :rj-api-url="rejectedUrl"
      @submitSuccess="rjSubmitSuccess"
      @rjVisibleChange="rjVisibleChange"
    />

    <FormCancelDialog
      :id="form.purchaseRequisiteId"
      :taskId="taskId || form.taskId"
      :fromType="dataType"
      :cancel-api-url="cancelledUrl"
      @submitSuccess="cancelSubmitSuccess"
      ref="FormCancelDialog"
    />

    <FormCloseDialog
      :id="form.purchaseRequisiteId"
      :taskId="taskId || form.taskId"
      :fromType="dataType"
      :close-api-url="closedUrl"
      @submitSuccess="closeSubmitSuccess"
      ref="FormCloseDialog"
    />

    <RevisionComparisonDlg
      module-key="purchaseRequisite"
      ref="RevisionComparisonDlg"
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
  queryPurchaseRequisiteById,
  approvedPurchaseRequisite,
  rejectedPurchaseRequisite,
  withdrawApproved,
  cancelledPR,
  closedPR,
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

import ApprovedDialog from '@/views/bpm/history/approvedDialog/approvedDialog.vue'
import RejectDialog from '@/views/bpm/history/rejectDialog/rejectDialog.vue'
import FormCancelDialog from '@/views/bpm/history/cancelDialog/formCancelDialog'
import FormCloseDialog from '@/views/bpm/history/closeDialog/formCloseDialog'
import selectCostProjectTable from '@/views/purchaseManagement/purchaseRequisition/components/selectCostProjectTable.vue'

import RevisionComparisonDlg from '@/components/RevisionComparison'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
import selectDropShippingAddress from './components/selectDropShippingAddress.vue'
import { queryUsersNoPage } from '@/api/organization/corporate'
import { queryCanSelectCostProjectListForPage } from '@/api/projectManagement/project'
import { formDirtyClass } from '@/mixins/formDirtyClass'

export default {
  emits: ['back'],
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
    ApprovedDialog,
    RejectDialog,
    FormCancelDialog,
    FormCloseDialog,
    RevisionComparisonDlg,
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
      submitLoading: false,
      btnLoading: false,
      saveKey: '28',
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
      allUomList: [],

      rowIdKey: 'productId',
      collapseWarningForProductInfo: false,
      operationLogList: [],

      buttonAuthMsg: {
        isCanApproved: '0',
        isCanRejected: '0',
        isCanRevise: '0',
        isCanUpdate: '0',
        isCanCancelled: '0',
        isCanClosed: '0'
      },

      rjVisible: false,
      aplVisible: false,
      approvedUrl: approvedPurchaseRequisite,
      rejectedUrl: rejectedPurchaseRequisite,
      cancelledUrl: cancelledPR,
      closedUrl: closedPR,
      approvedFormData: undefined,

      basicUpdateProps: [],
      basicUpdateMsgList: [],
      updateMsg: {},
      isComparison: false,
      detailListCur: [],
      commonFileListCur: [],
      bpHistoryVersionList: [],
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
    aliasIsHide() {
      return !this.tableList.find(x => x.alias)
    },
    inventoryConversionIsHide() {
      return !this.tableList.find(x => x.uom !== x.basicUom)
    },
    configCurColumn() {
      let arr = [...this.columns]
      if (this.form.approvedStatus !== '3') {
        arr = arr.filter(
          x =>
            ['closedQTY', 'rejectedQtyForBasicShowStr'].indexOf(x.prop) === -1
        )
      }

      function compare(value1, value2) {
        if (value1.colSortIndex < value2.colSortIndex) {
          return -1
        } else if (value1.colSortIndex > value2.colSortIndex) {
          return 1
        } else {
          return 0
        }
      }
      arr.sort(compare)
      return arr
    },
    visibleCurColumns() {
      let arr = this.columns.filter(column => column.visible === true)
      if (this.form.approvedStatus !== '3') {
        arr = arr.filter(
          x =>
            ['closedQTY', 'rejectedQtyForBasicShowStr'].indexOf(x.prop) === -1
        )
      }
      const filterProps1 = []
      if (this.aliasIsHide) {
        filterProps1.push('alias')
      }
      if (this.inventoryConversionIsHide) {
        filterProps1.push('inventoryUOMConversionStr')
      }
      arr = arr.filter(x => !filterProps1.includes(x.prop))
      function compare(value1, value2) {
        if (value1.colSortIndex < value2.colSortIndex) {
          return -1
        } else if (value1.colSortIndex > value2.colSortIndex) {
          return 1
        } else {
          return 0
        }
      }
      arr.sort(compare)
      return arr
    },
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
      if (this.approvedBtnShow && this.isComparison) {
        return true
      }
      let dis = true
      if (!this.editAuth) {
        return true
      }

      if (
        ['1', '3'].includes(this.dataType) &&
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanUpdate === '1'
      ) {
        dis = false
      }
      return dis
    },
    isShowEditBtn() {
      return (
        this.editAuth &&
        ['1', '3'].includes(this.dataType) &&
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanUpdate === '1' &&
        this.approvedBtnShow &&
        this.isComparison
      )
    },
    submitBtnShow() {
      let show = false
      if (!this.editAuth) {
        return false
      }
      if (
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanUpdate === '1'
      ) {
        show = true
      }
      return show
    },
    saveDraftBtnShow() {
      let show = false
      if (!this.editAuth) {
        return false
      }
      if (
        ['1', '3'].includes(this.dataType) &&
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanSaveDraft === '1'
      ) {
        show = true
      }
      return show
    },
    reviseBtnShow() {
      let show = false
      if (!this.editAuth) {
        return false
      }
      if (
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanRevise === '1' &&
        this.comeFrom === '1'
      ) {
        show = true
      }
      return show
    },
    approvedBtnShow() {
      let show = false

      if (this.dataType === '3' && this.form.approvedStatus === '1') {
        show = true
      } else if (
        this.dataType === '1' &&
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanApproved === '1'
      ) {
        show = true
      }
      return show
    },
    rejectedBtnShow() {
      let show = false
      if (this.dataType === '3' && this.form.approvedStatus === '1') {
        show = true
      } else if (
        this.dataType === '1' &&
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanRejected === '1'
      ) {
        show = true
      }
      return show
    },
    withdrawApproveBtnShow() {
      if (
        !this.checkPermi([
          'purchaseManagement:purchaseRequisition:withdrawApprove'
        ])
      ) {
        return false
      }
      let show = false

      if (
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanWithdrawApproved === '1'
      ) {
        show = true
      }
      return show
    },
    cancelBtnShow() {
      if (!this.checkPermi(['purchaseManagement:purchaseRequisition:cancel'])) {
        return false
      }
      let show = false
      if (
        this.dataType !== '2' &&
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanCancelled === '1'
      ) {
        show = true
      }
      return show
    },
    closeBtnShow() {
      if (!this.checkPermi(['purchaseManagement:purchaseRequisition:close'])) {
        return false
      }
      let show = false
      if (
        this.dataType !== '2' &&
        this.form.purchaseRequisiteId &&
        this.buttonAuthMsg.isCanClosed === '1'
      ) {
        show = true
      }
      return show
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

    modifyHighlight() {
      return (
        this.approvedBtnShow &&
        this.buttonAuthMsg.isCanSeeUpdateMsg === '1' &&
        this.isComparison
      )
    },

    tableListIncludeSystemDocking() {
      if (!this.tableList || this.tableList.length <= 0) return false
      return this.tableList.some(x => x.isSystemDocking === '1')
    }
  },
  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
  },
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
    handleWithdrawApprove() {
      this.$modal
        .confirm(this.$t('ui.withdrawApproveConfirm'))
        .then(() => {
          return withdrawApproved({
            businessId: this.form.purchaseRequisiteId,
            taskId: this.taskId || this.form.taskId
          })
        })
        .then(response => {
          this.$modal.msgSuccess(this.$t('ui.withdrawApproveSuccess'))
          this.handleUpdate()
        })
        .catch(() => {})
    },
    handleUpdate() {
      this.reset()
      const rowId = this.rowId
      this.queryProductHistoryVersion()
      this.queryAllUomList()
      this.queryDropShippingAddressOptions()
      this.queryCanSelectCostProjectListForPage()
      this.queryPRCanSelectWarehouseList()
      queryPurchaseRequisiteById({
        purchaseRequisiteId: rowId,
        taskId: this.taskId || this.form.taskId
      }).then(res => {
        const data = res.data || {}

        if (!data.requiredId) {
          data.requiredBy = this.$store.state.user.nickName
          data.requiredId = this.$store.state.user.userId
        }

        const list = data.purchaseRequisiteDetailList || []
        const timer = Date.now()
        list.forEach((item, index) => {
          if (!item[this.rowIdKey]) {
            item.customId = timer + index
          }
          if (item.externalPartNoListJson) {
            item['externalPartNoList'] = JSON.parse(item.externalPartNoListJson)
          } else {
            item['externalPartNoList'] = []
          }
        })
        this.createTableList = list
        this.tableList = this.createTableList
        this.changeTableList()
        this.operationLogList = data.operationLogList || []
        this.form = data
        this.buttonAuthMsg = data.buttonAuthMsg || {}

        setTimeout(() => {
          const initFormJson = this.getFormJson()
          formDirtyClass.routeStatusData[this.formRoute.name] = {
            $vm: this,
            saveShow: this.saveDraftBtnShow,
            submitShow: this.submitBtnShow,
            initFormJson,
            getFormJson: this.getFormJson,
            isSaveSuccess: false,
            saveOrSubmitFn: this.handleSaveDraftNoConFirm
          }
        }, 300)

        this.initVersionComparison(data, list)
        setTimeout(() => {
          this.setRouteTitleView(this.comDisFrom)
        }, 0)
        if (this.form.departmentId) {
          this.queryRequiredByOptions()
        }
        this.queryUserDepartment()
      })
    },
    initVersionComparison(data, currentDetailList) {
      const updateMsg = data.updateMsg || {}
      const cloneList = list => JSON.parse(JSON.stringify(list || []))
      const onlyDeleted = list =>
        cloneList(list).filter(item => item.updateType === '3')

      this.updateMsg = updateMsg
      this.basicUpdateMsgList = updateMsg.basicUpdateMsgList || []
      this.basicUpdateProps = this.basicUpdateMsgList.map(item => item.name)
      if (
        (updateMsg.beforeCommonFileList || []).length ||
        (updateMsg.afterCommonFileList || []).length
      ) {
        this.basicUpdateProps.push('attachment')
      }
      this.detailListCur = cloneList(currentDetailList)
      this.commonFileListCur = cloneList(data.commonFileList)
      this.isComparison =
        this.buttonAuthMsg.isCanSeeUpdateMsg === '1' && this.approvedBtnShow
      if (this.isComparison === true) {
        setTimeout(() => {
          if (this.isComparison) {
            this.revisionComparison({ autoOpen: true })
          }
        }, 300)
      }

      this.createTableList = this.isComparison
        ? [
            ...cloneList(currentDetailList),
            ...onlyDeleted(updateMsg.beforeDetailList)
          ]
        : cloneList(currentDetailList)
      this.tableList = this.createTableList
      this.changeTableList()
      this.$nextTick(() => {
        this.$refs.uploadRef &&
          this.$refs.uploadRef.initFileList(
            this.isComparison
              ? [
                  ...cloneList(data.commonFileList),
                  ...onlyDeleted(updateMsg.beforeCommonFileList)
                ]
              : this.commonFileListCur
          )
      })
    },
    getFormJson() {
      return JSON.stringify({
        ...this.form,
        createTableList: this.createTableList
      })
    },
    backFN() {
      formDirtyClass.showNotify(this.formRoute.name).then(msg => {
        if (msg === 'save') {
          const pageItem = formDirtyClass.routeStatusData[this.formRoute.name]
          pageItem.saveOrSubmitFn && pageItem.saveOrSubmitFn()
          return
        } else if (msg === 'stop') {
          return
        }
        this.$emit('back')
      })
    },

    back(type) {
      this.$emit('back', type)
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
      this.tableList = []
      this.createTableList = []

      this._stableCounter = 0
      this.changeTableList()
      this.operationLogList = []
      this.activeNames = ['1', '2', '3', '11']
      this.basicUpdateProps = []
      this.basicUpdateMsgList = []
      this.updateMsg = {}
      this.isComparison = false
      this.detailListCur = []
      this.commonFileListCur = []
      setTimeout(() => {
        if (this.$refs.uploadRef) {
          this.$refs.uploadRef.initFileList([])
        }
      }, 300)

      this.basicUpdateProps = []
      this.bpHistoryVersionList = []

      this.resetForm('form1')
    },
    dropShippingChange() {
      if (this.form.dropShipping !== '1') {
      } else {
        if (this.form.salesReceiveAddress && !this.form.receiveAddressName) {
          this.form['receiveAddressName'] = this.form.salesReceiveAddress
        }
        if (
          this.form.isNoEnoughInventoryPr === '1' &&
          this.form.consignee &&
          !this.form.contactPersonName
        ) {
          this.form['contactPersonName'] = this.form.consignee
        }
      }
    },

    queryUserDepartment() {
      this.deptOptionsLoading = true
      queryUserDepartment({ menuPerms: this.menuKey.PR })
        .then(res => {
          this.deptOptionsLoading = false
          this.deptOptions = res.data || []
          if (!this.form.departmentId && this.deptOptions.length > 0) {
            this.deptOptions.forEach(item => {
              if (item.isDefault === '1') {
                this.form['departmentId'] = item.departmentId
                this.form['departmentName'] = item.departmentName
                this.form['allSuperiorName'] = item.allSuperiorName
                this.queryRequiredByOptions()
              }
            })
          }
        })
        .catch(() => {
          this.deptOptionsLoading = false
        })
    },
    departmentChange(item) {
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
    queryAllUomList() {
      queryAllUomListByLocalization({}).then(res => {
        this.allUomList = res.data || []
      })
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
        customId: +new Date()
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
        customId: +new Date()
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
        this.tableList.forEach(x => {})
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
      if (this.modifyHighlight) {
        if (row.updateType === '2') {
          color = 'new-add-row'
        }
        if (row.updateType === '3') {
          color = 'cancel-row'
        }
      }
      const cur = this.selected.find(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      if (cur) {
        color = 'table-SelectedRow-bgcolor'
      }
      if (row['ROW-ERROR']) {
        color = 'required-row'
      }
      return color
    },
    tableCellClassName({ row, column }) {
      let cellClass = ''
      if (this.modifyHighlight) {
        if (row.updateType === '1') {
          if (
            (row.updateMsgList || []).find(
              item => item.name === column.property
            )
          ) {
            cellClass = 'edit-table-cell'
          }
        }
      }
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
        param.purchaseRequisiteDetailList = JSON.parse(
          JSON.stringify(detailList)
        )
        param = this.$trimOfObj(JSON.parse(JSON.stringify(param)))

        param.purchaseRequisiteDetailList.forEach(x => {
          if (x.externalPartNoList && x.externalPartNoList.length > 0) {
            x.externalPartNo = x.externalPartNoList.join(',')
            x.externalPartNoListJson = JSON.stringify(x.externalPartNoList)
          } else {
            x.externalPartNo = undefined
            x.externalPartNoListJson = undefined
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

        if (submitType === 'approvedAndSubmit') {
          this.approvedFormData = param
          this.aplVisible = true
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
              this.back()
              this.submitLoading = false
            })
            .catch(() => {
              this.submitLoading = false
            })
        } else {
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
                this.back()
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
          this.createTableList = newDetailList
          this.tableList = this.createTableList
          if (newDetailList.length <= 0 && submitType !== 'save') {
            this.$modal.msgError(this.$t('PURCHASE.prProductTableEmpty'))
            this.collapseWarningForProductInfo = true
            return
          }
          param.purchaseRequisiteDetailList.forEach(x => {
            if (x.externalPartNoList && x.externalPartNoList.length > 0) {
              x.externalPartNo = x.externalPartNoList.join(',')
              x.externalPartNoListJson = JSON.stringify(x.externalPartNoList)
            } else {
              x.externalPartNo = undefined
              x.externalPartNoListJson = undefined
            }
          })

          if (submitType === 'approvedAndSubmit') {
            this.approvedFormData = param
            this.aplVisible = true
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
              this.back()
              this.submitLoading = false
              if (gotoRoute && gotoRoute.name !== this.formRoute.name) {
                this.$store.dispatch('tagsView/delView', this.formRoute)
                this.$router.push(gotoRoute).catch(() => {})
              } else {
                this.back()
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
    },

    handleRevise() {
      this.$store.dispatch('tagsView/delView', this.formRoute)
      this.$router.push({
        path: '/purchaseManagement/revisePurchaseRequisition',
        query: {
          id: this.form.purchaseRequisiteId,
          timeId: Date.now()
        }
      })
    },

    revisionComparison(options = {}) {
      this.$refs.RevisionComparisonDlg.handleOpen(
        this.form.purchaseRequisiteId,
        options
      )
    },
    exitComparison() {
      this.isComparison = false
      this.createTableList = JSON.parse(JSON.stringify(this.detailListCur))
      this.tableList = this.createTableList
      this.changeTableList()
      this.$nextTick(() => {
        this.$refs.uploadRef &&
          this.$refs.uploadRef.initFileList(this.commonFileListCur)
      })
    },
    getBeforeValue(prop) {
      const item = this.basicUpdateMsgList.find(row => row.name === prop) || {}
      return item.beforeValue
    },
    getAfterValue(prop, fallback) {
      const item = this.basicUpdateMsgList.find(row => row.name === prop)
      return item && item.afterValue !== undefined ? item.afterValue : fallback
    },
    isModified(prop) {
      if (!this.modifyHighlight) {
        return ''
      }
      if (this.basicUpdateProps.includes(prop)) {
        return 'edit-outline'
      }
      return ''
    },
    queryProductHistoryVersion() {},
    settingHandleCommand(purchaseRequisiteId) {
      this.$router.push({
        path: '/purchaseManagement/viewPurchaseRequisition',
        query: {
          id: purchaseRequisiteId,
          timeId: Date.now()
        }
      })
    },
    dropdownVisibleChange() {
      if (this.$refs.scrollbar) {
        this.$refs.scrollbar.moveY = 0
      }
    },

    handleApproved() {
      if (!this.submitBtnShow) {
        this.approvedFormData = undefined
        this.aplVisible = true
      } else {
        this.submitForm('approvedAndSubmit')
      }
    },
    aplVisibleChange(data) {
      this.aplVisible = data || false
    },
    aplSubmitSuccess() {
      const vm = this
      vm.$message.success(
        `${vm.$t('ui.approvedSuccess')}`.replace(
          '$1',
          `[${vm.form.purchaseRequisiteNo}]`
        )
      )
      this.aplVisible = false
      vm.back('onApprovedSuccess')
    },
    handleRejected() {
      this.rjVisible = true
    },
    rjVisibleChange(data) {
      this.rjVisible = data || false
    },
    rjSubmitSuccess() {
      const vm = this
      vm.$message.success(
        `${vm.$t('ui.rejectedSuccess')}`.replace(
          '$1',
          `[${vm.form.purchaseRequisiteNo}]`
        )
      )
      this.rjVisible = false
      vm.back('onRejectedSuccess')
    },
    handleCancel() {
      this.$refs.FormCancelDialog.handleOpen()
    },
    cancelSubmitSuccess() {
      const vm = this
      vm.$message.success(
        `${vm.$t('ui.cancelledSuccess')}`.replace(
          '$1',
          `[${vm.form.purchaseRequisiteNo}]`
        )
      )
      vm.back('onCancelSuccess')
    },

    handleClose() {
      this.$refs.FormCloseDialog.handleOpen()
    },
    closeSubmitSuccess() {
      const vm = this
      vm.$message.success(
        `${vm.$t('ui.closedSuccess')}`.replace(
          '$1',
          `[${vm.form.purchaseRequisiteNo}]`
        )
      )
      vm.back('onCloseSuccess')
    }
  }
}
</script>
