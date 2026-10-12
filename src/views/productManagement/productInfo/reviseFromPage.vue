<template>
  <FormPageLayoutTabs v-loading="submitLoading">
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
    <template v-slot:tabs>
      <el-tabs
        v-model="activeName"
        size="small"
        type="card"
        @tab-click="handleClick"
      >
        <el-tab-pane :label="$t('ui.basicInfo')" name="basicInfo"></el-tab-pane>
        <el-tab-pane
          :label="$t('PRODUCT.specifications')"
          name="specifications"
          v-if="false"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('PRODUCT.expandInfo')"
          name="expandInfo"
          v-if="form.isSystemDocking === '1'"
        ></el-tab-pane>
      </el-tabs>
    </template>
    <template v-slot:content>
      <div v-show="activeName === 'basicInfo'">
        <el-collapse v-model="activeNames">
          <div class="form-card">
            <el-collapse-item name="1">
              <template #title
                ><FormCollapseItemTitle
                  :title="$t('ui.basicInfo')"
                  :warning="collapseWarningForBasicInfo"
                >
                  <span class="info-item mr20" :title="form.productName">
                    {{ $t('PRODUCT.productName') }} : {{ form.productName }}
                  </span>
                  <span class="info-item">
                    {{ $t('ui.status') }} :
                    {{
                      selectDictLabel(
                        dict.type.ivt_material_product_status,
                        form.productStatus
                      )
                    }}
                  </span>
                </FormCollapseItemTitle></template
              >
              <el-form
                ref="form1"
                :model="form"
                @submit.prevent
                :rules="rules"
                :disabled="comDisFrom"
                label-position="top"
              >
                <el-row :gutter="rowGutter">
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PRODUCT.category')}`"
                      prop="productCategoryIdList"
                      key="productCategory11"
                      v-if="!comDisFrom"
                    >
                      <div class="input-switch-box">
                        <div class="con-left">
                          <el-cascader
                            :show-all-levels="true"
                            placeholder=""
                            v-model="form.productCategoryIdList"
                            :options="productCategoryData"
                            :props="{
                              multiple: false,
                              value: 'id',
                              label: 'categoryName',
                              children: 'child',
                              checkStrictly: true
                            }"
                            clearable
                            :collapse-tags="true"
                            popper-class="hide-cascader-scrollbar"
                            style="width: 100%"
                            filterable
                            class="cascader"
                          ></el-cascader>
                        </div>
                      </div>
                    </el-form-item>
                    <el-form-item
                      v-else
                      :label="`${$t('PRODUCT.category')}`"
                      required
                      key="productCategory22"
                    >
                      <ToolTipShowCategory :list="form.categoryNameList || []">
                        <el-input
                          :model-value="form.categoryNameShowStr"
                          disabled
                        ></el-input>
                      </ToolTipShowCategory>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('PRODUCT.materialCode')}`">
                      <el-input
                        v-model="form.internalPartNoShowStr"
                        :title="form.internalPartNoShowStr"
                        disabled
                      ></el-input>
                    </el-form-item>
                  </el-col>

                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PRODUCT.materialName')}`"
                      prop="productName"
                    >
                      <el-input
                        v-model="form.productName"
                        :title="form.productName"
                        maxlength="200"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="rowGutter">
                  <el-col :span="8">
                    <el-form-item :label="`${$t('ui.status')}`">
                      <el-input
                        v-if="form.productStatus === '0'"
                        :model-value="$t('ui.superseded')"
                        disabled
                      ></el-input>
                      <el-input
                        v-else
                        :model-value="
                          selectDictLabel(
                            dict.type.ivt_material_product_status,
                            form.productStatus
                          )
                        "
                        disabled
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('PRODUCT.brand')}`">
                      <el-autocomplete
                        style="width: 100%"
                        v-model="form.brand"
                        :title="form.brand"
                        :fetch-suggestions="queryBrandSugg"
                        placeholder
                        clearable
                        :maxlength="200"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item :label="`${$t('PRODUCT.materialShortName')}`">
                      <el-input
                        v-model="form.alias"
                        :title="form.alias"
                        maxlength="200"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="rowGutter">
                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PRODUCT.materialType1')}`"
                      prop="materialType"
                      :rules="[
                        {
                          required: true,
                          message: $t('ui.reqMsg').replace(
                            '$1',
                            $t('PRODUCT.materialType1')
                          ),
                          trigger: ['change']
                        }
                      ]"
                    >
                      <el-select
                        v-model="form.materialType"
                        @change="changeProductType()"
                        placeholder=""
                        style="width: 100%"
                      >
                        <el-option
                          v-for="item in dict.type.material_type || []"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        ></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :span="8">
                    <el-form-item
                      :label="`${$t('PRODUCT.inventoryUnit')}`"
                      prop="inventoryUnitId"
                    >
                      <el-select
                        v-model="form.inventoryUnitId"
                        :title="
                          showUomLabel(form.inventoryUnit) || form.inventoryUnit
                        "
                        placeholder=""
                        filterable
                        clearable
                        style="width: 100%"
                        @change="changeUom"
                      >
                        <el-option
                          v-for="item in allUomList"
                          :key="item.id"
                          :label="item.uomName"
                          :value="item.id"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-divider></el-divider>

                <el-row>
                  <div class="flexStart">
                    <div class="flexStart" style="margin-right: 50px">
                      <el-switch
                        v-model="form.isActive"
                        active-value="1"
                        inactive-value="0"
                        class="mr10"
                      ></el-switch>
                      <div>{{ $t('ui.isActive') }}</div>
                    </div>
                    <div class="flexStart" style="margin-right: 50px">
                      <el-switch
                        v-model="form.isPhantom"
                        active-value="1"
                        inactive-value="0"
                        class="mr10"
                      ></el-switch>
                      <div>{{ $t('PRODUCT.isPhantom') }}</div>
                    </div>
                    <div class="flexStart">
                      <el-switch
                        v-model="form.isInventoryItem"
                        active-value="1"
                        inactive-value="0"
                        class="mr10"
                      ></el-switch>
                      <div>{{ $t('PRODUCT.nonInventoryItem') }}</div>
                    </div>
                  </div>

                  <div
                    class="mt5"
                    style="
                      padding: 8px 10px;
                      color: #e7a506;
                      background: #fffbe6;
                      border: 1px solid #ffe58f;
                      border-radius: 8px;
                    "
                    v-show="form.isInventoryItem !== '1'"
                  >
                    {{ $t('PRODUCT.notTakeEffect') }}
                  </div>
                </el-row>

                <el-row :gutter="rowGutter" class="mt10">
                  <el-col :span="8" :key="'aa' + form.isInventoryItem">
                    <el-form-item
                      :label="`${$t('PRODUCT.batchManagement')}`"
                      prop="batchManagement"
                      :rules="[
                        {
                          required: form.isInventoryItem === '1',
                          message: $t('ui.reqMsg'),
                          trigger: ['change']
                        }
                      ]"
                    >
                      <el-select
                        v-model="form.batchManagement"
                        placeholder=""
                        filterable
                        clearable
                        @change="changeInventoryControlMode('batchManagement')"
                        style="width: 100%"
                        :disabled="form.isInventoryItem !== '1'"
                      >
                        <el-option
                          v-for="item in switchOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                          :disabled="
                            form.serialNumberManagement === '1' &&
                            item.value === '1'
                              ? true
                              : false
                          "
                        >
                        </el-option>
                      </el-select>
                      <div class="field-dec">
                        {{ $t('PRODUCT.outboundTransactions') }}
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8" :key="'bb' + form.isInventoryItem">
                    <el-form-item
                      :label="`${$t('PRODUCT.serialNumberManagement')}`"
                      prop="serialNumberManagement"
                      :rules="[
                        {
                          required: form.isInventoryItem === '1',
                          message: $t('ui.reqMsg'),
                          trigger: ['change']
                        }
                      ]"
                    >
                      <el-select
                        v-model="form.serialNumberManagement"
                        placeholder=""
                        filterable
                        clearable
                        @change="
                          changeInventoryControlMode('serialNumberManagement')
                        "
                        style="width: 100%"
                        :disabled="form.isInventoryItem !== '1'"
                      >
                        <el-option
                          v-for="item in switchOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                          :disabled="
                            form.batchManagement === '1' && item.value === '1'
                              ? true
                              : false
                          "
                        >
                        </el-option>
                      </el-select>
                      <div class="field-dec">
                        {{ $t('PRODUCT.uniqueSerialNumber') }}
                      </div>
                    </el-form-item>
                  </el-col>

                  <el-col
                    v-if="
                      (form.batchManagement === '1' ||
                        form.serialNumberManagement === '1') &&
                      form.isInventoryItem === '1'
                    "
                    :span="8"
                    key="printMethod11"
                  >
                    <el-form-item
                      :label="`${$t('PRODUCT.printMethod')}`"
                      prop="printMethod"
                      :rules="[
                        {
                          required: true,
                          message: $t('ui.reqMsg'),
                          trigger: ['change']
                        }
                      ]"
                    >
                      <el-select
                        v-model="form.printMethod"
                        placeholder=""
                        style="width: 100%"
                        :disabled="form.isInventoryItem !== '1'"
                      >
                        <el-option
                          v-for="item in dict.type.ivt_print_method"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        ></el-option>
                      </el-select>
                      <!-- <div class="field-dec">{{ $t('PRODUCT.labelSize') }}</div> -->
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="rowGutter">
                  <el-col :span="24">
                    <el-form-item :label="$t('ui.description')">
                      <el-tooltip
                        ref="tooltip"
                        :enterable="true"
                        class="item"
                        effect="light"
                        placement="top"
                        :manual="false"
                        :disabled="isFocus || !form.description"
                      >
                        <template #content
                          ><div class="desc-tooltip">
                            <div
                              v-if="form.description"
                              style="line-height: 20px; white-space: pre-wrap"
                            >
                              <div>{{ form.description }}</div>
                            </div>
                          </div></template
                        >
                        <slot>
                          <div class="w100" :class="{ 'tooltip-row': true }">
                            <MyInput
                              type="textarea"
                              v-model="form.description"
                              :autosize="{ minRows: 2, maxRows: 8 }"
                              resize="none"
                              show-word-limit
                              :maxlength="7000"
                              @focus="isFocus = true"
                              @blur="isFocus = false"
                            ></MyInput>
                          </div>
                        </slot>
                      </el-tooltip>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="24">
                    <el-form-item :label="$t('ui.remarks')">
                      <el-tooltip
                        ref="tooltip"
                        :enterable="true"
                        class="item"
                        effect="light"
                        placement="top"
                        :manual="false"
                        :disabled="isRemarksFocus || !form.remarks"
                      >
                        <template #content
                          ><div class="desc-tooltip">
                            <div
                              v-if="form.remarks"
                              style="line-height: 20px; white-space: pre-wrap"
                            >
                              <div>{{ form.remarks }}</div>
                            </div>
                          </div></template
                        >
                        <slot>
                          <div class="w100">
                            <MyInput
                              type="textarea"
                              v-model="form.remarks"
                              :autosize="{ minRows: 2, maxRows: 8 }"
                              resize="none"
                              show-word-limit
                              :maxlength="3000"
                              @focus="isRemarksFocus = true"
                              @blur="isRemarksFocus = false"
                            ></MyInput>
                          </div>
                        </slot>
                      </el-tooltip>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row>
                  <el-col :span="8" v-if="sysDockingSwitch">
                    <el-form-item
                      :label="`${$t('ui.systemDocking')}`"
                      prop="isSystemDocking"
                    >
                      <el-switch
                        v-model="form.isSystemDocking"
                        active-value="1"
                        inactive-value="0"
                        :disabled="true"
                        @change="systemDockingChange"
                      ></el-switch>
                      <el-tooltip placement="top">
                        <template #content
                          ><div>
                            <div
                              v-html="$t('switchTip.systemDockingTip')"
                            ></div></div
                        ></template>
                        <el-icon class="ml10"><InfoFilled /></el-icon>
                      </el-tooltip>
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
                  :title="$t('PRODUCT.productImage')"
                  :warning="collapseWarningForPicture"
                >
                </FormCollapseItemTitle
              ></template>
              <el-row>
                <el-col :span="24">
                  <div class="mb20">
                    <myUploadTable
                      ref="uploadPictureRef"
                      :disabled="comDisFrom"
                      :limit="9"
                      :accept="['.jpg', '.jpeg', '.png', '.bmp', '.webp']"
                    />
                  </div>
                </el-col>
              </el-row>
            </el-collapse-item>
          </div>
          <div class="form-card mt10">
            <el-collapse-item name="3">
              <template #title
                ><FormCollapseItemTitle :title="$t('ui.attachment')"
              /></template>
              <el-row>
                <el-col :span="24">
                  <div class="mb20">
                    <myUpload ref="uploadRef" :disabled="comDisFrom" />
                  </div>
                </el-col>
              </el-row>
            </el-collapse-item>
          </div>
          <div class="form-card mt10">
            <el-collapse-item name="4">
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
      <div
        v-show="activeName === 'specifications'"
        class="form-card form-card--p20"
      >
        <el-form
          ref="form2"
          :model="specificationsForm"
          @submit.prevent
          :rules="rules"
          label-width="160px"
          :disabled="comDisFrom"
        >
          <el-row>
            <el-col :span="8">
              <el-form-item :label="`${$t('PRODUCT.l')}`">
                <div style="display: flex">
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.length"
                    controls-position="right"
                    :controls="!comDisFrom"
                    :precision="2"
                    v-thousandSplit="{ precision: 2 }"
                    :min="0"
                    :max="999999.99"
                    @change="inputNumberChange('length')"
                  />
                  <el-select
                    class="fs-0"
                    style="width: 80px"
                    v-model="specificationsForm.lengthUom"
                    :title="showUomLabel(specificationsForm.lengthUom)"
                    @change="lengthUomChange('length')"
                    placeholder=""
                  >
                    <el-option
                      v-for="item in lengthUomList"
                      :key="item.lengthUom + 'length'"
                      :label="item.lengthUom"
                      :value="item.lengthUom"
                    >
                    </el-option>
                  </el-select>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`${$t('PRODUCT.w')}`">
                <div style="display: flex">
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.width"
                    controls-position="right"
                    :controls="!comDisFrom"
                    :precision="2"
                    v-thousandSplit="{ precision: 2 }"
                    :min="0"
                    :max="999999.99"
                    @change="inputNumberChange('width')"
                  />
                  <el-select
                    class="fs-0"
                    style="width: 80px"
                    v-model="specificationsForm.widthUom"
                    :title="showUomLabel(specificationsForm.widthUom)"
                    placeholder=""
                    @change="lengthUomChange('width')"
                  >
                    <el-option
                      v-for="item in lengthUomList"
                      :key="item.lengthUom + 'width'"
                      :label="item.lengthUom"
                      :value="item.lengthUom"
                    >
                    </el-option>
                  </el-select>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`${$t('PRODUCT.h')}`">
                <div style="display: flex">
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.height"
                    controls-position="right"
                    :controls="!comDisFrom"
                    :precision="2"
                    v-thousandSplit="{ precision: 2 }"
                    :min="0"
                    :max="999999.99"
                    @change="inputNumberChange('height')"
                  />
                  <el-select
                    class="fs-0"
                    style="width: 80px"
                    v-model="specificationsForm.heightUom"
                    :title="showUomLabel(specificationsForm.heightUom)"
                    placeholder=""
                    @change="lengthUomChange('height')"
                  >
                    <el-option
                      v-for="item in lengthUomList"
                      :key="item.lengthUom + 'height'"
                      :label="item.lengthUom"
                      :value="item.lengthUom"
                    >
                    </el-option>
                  </el-select>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="border-line-solid"></div>
          <el-row>
            <el-col :span="8">
              <el-form-item :label="`${$t('PRODUCT.color')}`">
                <el-input
                  v-model="specificationsForm.color"
                  maxlength="50"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="8">
              <el-form-item :label="`${$t('PRODUCT.volume')}`">
                <div style="display: flex">
                  <el-input-number
                    class="flex-1"
                    v-model="specificationsForm.volume"
                    controls-position="right"
                    :controls="false"
                    :precision="6"
                    :min="0"
                    :max="9999999999999999.99"
                    disabled
                  />
                  <div class="unit">{{ specificationsForm.volumeUom }}</div>
                  <svg-icon
                    class="fs-0"
                    icon-class="jisuanqi"
                    :style="`width: ${iconFontSize}px; height: ${iconFontSize}px; margin-left: 2px; align-self: center`"
                  />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="border-line-dashed"></div>
          <el-row>
            <el-col :span="8">
              <el-form-item :label="`${$t('PRODUCT.netWeight')}`">
                <div style="display: flex">
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.netWeight"
                    controls-position="right"
                    :controls="!comDisFrom"
                    :precision="2"
                    v-thousandSplit="{ precision: 2 }"
                    :min="0"
                    :max="999999.99"
                    @change="inputNumberChange('netWeight')"
                  />
                  <el-select
                    class="fs-0"
                    style="width: 80px"
                    v-model="specificationsForm.netWeightUom"
                    :title="showUomLabel(specificationsForm.netWeightUom)"
                    placeholder=""
                  >
                    <el-option
                      v-for="item in weightUomList"
                      :key="item + 'netWeight'"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="`${$t('PRODUCT.grossWeight')}`">
                <div style="display: flex">
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.grossWeight"
                    controls-position="right"
                    :controls="!comDisFrom"
                    :precision="2"
                    v-thousandSplit="{ precision: 2 }"
                    :min="0"
                    :max="999999.99"
                    @change="inputNumberChange('grossWeight')"
                  />
                  <el-select
                    class="fs-0"
                    style="width: 80px"
                    v-model="specificationsForm.grossWeightUom"
                    :title="showUomLabel(specificationsForm.grossWeightUom)"
                    placeholder=""
                  >
                    <el-option
                      v-for="item in weightUomList"
                      :key="item + 'grossWeight'"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="border-line-dashed"></div>

          <el-row>
            <el-col :span="24">
              <el-form-item :label="$t('ui.remarks')">
                <MyInput
                  type="textarea"
                  v-model="specificationsForm.remarks"
                  :autosize="{ minRows: 2, maxRows: 8 }"
                  resize="none"
                  show-word-limit
                  :maxlength="3000"
                ></MyInput>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div v-if="form.isSystemDocking === '1'">
        <div
          v-show="activeName === 'expandInfo'"
          class="form-card form-card--p20"
        >
          <el-form
            ref="form3"
            :model="specificationsForm"
            @submit.prevent
            :rules="rules"
            label-width="160px"
            :disabled="comDisFrom"
          >
            <el-row>
              <el-col :span="8">
                <el-form-item :label="`${$t('ui.type')}`" prop="type">
                  <el-select
                    style="width: 100%"
                    v-model="specificationsForm.type"
                    placeholder=""
                    clearable
                    @change="changeType"
                    :disabled="form.productStatus === '3'"
                  >
                    <el-option
                      v-for="item in dict.type.mdm_material_type"
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
                  :label="$t('PRODUCT.specificGravity')"
                  prop="specificGravity"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.specificGravity"
                    controls-position="right"
                    :precision="4"
                    v-thousandSplit="{ precision: 4 }"
                    :min="0.0"
                    :max="999.9999"
                    @change="inputNumberChange2('specificGravity')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('PRODUCT.toleranceType')"
                  prop="toleranceType"
                >
                  <el-select
                    style="width: 100%"
                    v-model="specificationsForm.toleranceType"
                    placeholder=""
                    clearable
                  >
                    <el-option
                      v-for="item in dict.type.mdm_material_tolerance_type"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="8">
                <el-form-item
                  :label="$t('PRODUCT.overTolerance')"
                  prop="overTolerance"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.overTolerance"
                    controls-position="right"
                    :precision="4"
                    v-thousandSplit="{ precision: 4 }"
                    :min="0.0"
                    :max="9999.9999"
                    @change="inputNumberChange2('overTolerance')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('PRODUCT.underTolerance')"
                  prop="underTolerance"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.underTolerance"
                    controls-position="right"
                    :precision="4"
                    v-thousandSplit="{ precision: 4 }"
                    :min="0.0"
                    :max="9999.9999"
                    @change="inputNumberChange2('underTolerance')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('PRODUCT.minInMixDesign')"
                  prop="minInMix"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.minInMix"
                    controls-position="right"
                    :precision="4"
                    v-thousandSplit="{ precision: 4 }"
                    :min="0.0"
                    :max="specificationsForm.maxInMix || 999.9999"
                    @change="inputNumberChange2('minInMix')"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="8">
                <el-form-item
                  :label="$t('PRODUCT.maxInMixDesign')"
                  prop="maxInMix"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.maxInMix"
                    controls-position="right"
                    :precision="4"
                    v-thousandSplit="{ precision: 4 }"
                    :min="specificationsForm.minInMix || 0"
                    :max="999.9999"
                    @change="inputNumberChange2('maxInMix')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('PRODUCT.minMoisture')"
                  prop="minMoisture"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.minMoisture"
                    controls-position="right"
                    :precision="4"
                    v-thousandSplit="{ precision: 4 }"
                    :min="0.0"
                    :max="specificationsForm.maxMoisture || 999.9999"
                    @change="inputNumberChange2('minMoisture')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="$t('PRODUCT.maxMoisture')"
                  prop="maxMoisture"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.maxMoisture"
                    controls-position="right"
                    :precision="4"
                    v-thousandSplit="{ precision: 4 }"
                    :min="specificationsForm.minMoisture || 0.0"
                    :max="999.9999"
                    @change="inputNumberChange2('maxMoisture')"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="8">
                <el-form-item :label="$t('PRODUCT.minTemperatureC')">
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.minTemperatureC"
                    controls-position="right"
                    :precision="2"
                    v-thousandSplit="{ precision: 2 }"
                    :min="-999.99"
                    :max="
                      $resultOfBoolean(specificationsForm.maxTemperatureC)
                        ? specificationsForm.maxTemperatureC
                        : 999.99
                    "
                    @change="inputNumberChange2('minTemperatureC')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="$t('PRODUCT.maxTemperatureC')">
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.maxTemperatureC"
                    controls-position="right"
                    :precision="2"
                    v-thousandSplit="{ precision: 2 }"
                    :min="
                      $resultOfBoolean(specificationsForm.minTemperatureC)
                        ? specificationsForm.minTemperatureC
                        : -999.99
                    "
                    :max="999.99"
                    @change="inputNumberChange2('maxTemperatureC')"
                  />
                </el-form-item>
              </el-col>
              <el-col
                :span="8"
                v-if="['1', '2'].indexOf(specificationsForm.type) !== -1"
              >
                <el-form-item
                  :label="$t('PRODUCT.minFinenessModulus')"
                  :rules="{
                    required: true,
                    message: $t('ui.reqMsg'),
                    trigger: ['blur']
                  }"
                  prop="minFinenessModulus"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.minFinenessModulus"
                    controls-position="right"
                    :precision="2"
                    v-thousandSplit="{ precision: 2 }"
                    :min="0.01"
                    :max="specificationsForm.maxFinenessModulus || 9999.99"
                    @change="inputNumberChange2('minFinenessModulus')"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col
                :span="8"
                v-if="['1', '2'].indexOf(specificationsForm.type) !== -1"
              >
                <el-form-item
                  :label="`${$t('PRODUCT.maxFinenessModulus')}`"
                  prop="maxFinenessModulus"
                  :rules="{
                    required: true,
                    message: $t('ui.reqMsg'),
                    trigger: ['blur']
                  }"
                >
                  <el-input-number
                    style="width: 100%"
                    v-model="specificationsForm.maxFinenessModulus"
                    controls-position="right"
                    :precision="2"
                    v-thousandSplit="{ precision: 2 }"
                    :min="specificationsForm.minFinenessModulus || 0.01"
                    :max="9999.99"
                    @change="inputNumberChange2('maxFinenessModulus')"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="24">
                <el-form-item :label="$t('ui.remarks')">
                  <MyInput
                    type="textarea"
                    v-model="specificationsForm.extendRemarks"
                    :autosize="{ minRows: 2, maxRows: 8 }"
                    resize="none"
                    show-word-limit
                    :maxlength="300"
                  ></MyInput>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
      <div
        class="form-card mt10"
        v-show="activeName === 'specifications' && form.setCombination === '1'"
      >
        <el-collapse v-model="activeNames">
          <el-collapse-item name="5">
            <template #title
              ><FormCollapseItemTitle
                :title="$t('PRODUCT.setCombination')"
                :warning="collapseWarningSetCombination"
              >
              </FormCollapseItemTitle
            ></template>
            <div class="pb20">
              <el-row :gutter="10" class="mb8">
                <el-col :span="1.5" v-if="!comDisFrom">
                  <el-button
                    @click="handleBtnAdd"
                    type="primary"
                    icon="Plus"
                    size="small"
                    >{{ $t('uiBtn.add') }}</el-button
                  >
                </el-col>
              </el-row>
              <el-table
                border
                ref="tables"
                max-height="400px"
                :data="setCombinationList"
              >
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
                  v-for="item in visibleColumn"
                  :key="item.prop + item.colSortIndex"
                  :prop="item.prop"
                  :label="item.label"
                  :width="item.width"
                  :min-width="item.minWidth"
                  :show-overflow-tooltip="item.tooltip"
                  :fixed="item.fixed"
                  :sortable="item.sortable"
                  :align="item.align || 'left'"
                  header-align="center"
                >
                  <template #header="{ column }">
                    <span v-if="['qty'].includes(item.prop)">
                      <span style="color: #ff4949; margin-right: 4px">*</span
                      >{{ column.label }}
                    </span>
                    <span v-else>{{ column.label }}</span>
                  </template>
                  <template #default="scope">
                    <template v-if="item.prop === 'qty'">
                      <template v-if="!comDisFrom">
                        <el-input-number
                          style="width: 98%"
                          v-model="scope.row.qty"
                          controls-position="right"
                          :controls="!comDisFrom"
                          :precision="scope.row.decimalNum"
                          v-thousandSplit="{ precision: scope.row.decimalNum }"
                          :min="scope.row.includeDecimal === '1' ? 0.001 : 1"
                          :max="99999"
                        />
                      </template>
                      <template v-else>{{
                        $numberStr(scope.row[item.prop], scope.row.decimalNum)
                      }}</template>
                    </template>
                    <template v-else-if="item.prop === 'uom'">
                      <span :title="showUomLabel(scope.row[item.prop])">{{
                        scope.row[item.prop]
                      }}</span>
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
                  v-if="!comDisFrom"
                >
                  <template #default="scope">
                    <div class="flexCen">
                      <el-icon
                        v-if="!scope.row.productSetCombinationId"
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
          </el-collapse-item>
        </el-collapse>
      </div>
    </template>

    <selectProductTable ref="selectProductTable" @onSuccess="updateTable" />
  </FormPageLayoutTabs>
</template>

<script>
import i18n from '@/lang'
import { checkInventoryUom } from '@/api/productManagement/productInfo'
import {
  queryMaterialProductById,
  reviseMaterialProduct,
  queryAllBrandList
} from '@/api/productManagement/material'

import {
  // queryAllUomList,
  queryAllUomListByLocalization
  // queryVolumeUomList,
  // queryWeightUomList,
  // queryLengthUomList
} from '@/api/system/uom'
import { queryActiveProductCategoryTreeList } from '@/api/productManagement/productCategory'
import pageMixin from '@/mixins/tableMinx'
import FormPageLayoutTabs from '@/components/formPageLayoutTabs/index.vue'
import locale from '@/views/productManagement/lang/index'
import myUploadTable from '@/components/Common/htz-image-upload/my-upload-table.vue'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
import selectProductTable from './selectProductTable'

export default {
  dicts: [
    'product_type',
    'ivt_material_product_status',
    'mdm_material_type',
    'mdm_material_tolerance_type',
    'ivt_print_method',
    'inventory_control_mode',
    'material_type'
  ],
  mixins: [pageMixin],
  components: {
    FormPageLayoutTabs,
    myUploadTable,
    SystemOperationLogTable,
    selectProductTable
  },
  data() {
    return {
      submitLoading: false,
      isFocus: false,
      isRemarksFocus: false,
      activeName: 'basicInfo',
      activeNames: [],
      rowId: '',
      timeId: '',
      // 是否自动生成 EmployeeNo
      form: {},
      collapseWarningForBasicInfo: false,
      collapseWarningForPicture: false,
      collapseWarningSetCombination: false,
      specificationsForm: {},

      rules: {
        productCategoryIdList: [
          {
            required: true,
            type: 'array',
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
        purposeList: [
          {
            required: true,
            type: 'array',

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        companyRegNo: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        productName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        barcodeControl: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        inventoryUnitId: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        defaultUom: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        purchaseUom: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        salesUom: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        inventoryUom: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        materialName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        roleAlias: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        roleKey: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        specificGravity: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        toleranceType: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        type: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        productionRate: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        contactPersonName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        overTolerance: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        underTolerance: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ]
      },
      productCategoryData: [],
      allUomList: [],
      volumeUomList: [],
      weightUomList: [],
      lengthUomList: [],
      setCombinationList: [],
      brandList: [],
      inventoryControlModeList: [],
      switchOptions: [
        { label: this.$t('uiBtn.yes'), value: '1' },
        { label: this.$t('uiBtn.no'), value: '0' }
      ]
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

    isView: {
      type: Boolean,
      default: false
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
    }
  },
  computed: {
    size() {
      return this.$store.getters.size
    },
    iconFontSize() {
      const fontSizes = {
        medium: 36,
        small: 32,
        mini: 28
      }
      return fontSizes[this.size]
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    defaultUomList() {
      const list = [
        this.specificationsForm.uom,
        this.specificationsForm.minimumPackagingUnit,
        this.specificationsForm.supplementaryPackagingUnit,
        this.specificationsForm.packagingUnit
      ]
      return list.filter(item => !!item)
    },

    editAuth() {
      return this.checkPermi(['productManagement:productInfo:edit'])
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

    comDIsInventoryControlMode() {
      // this.form.isAlreadyHaveDocument === '1' ||
      // return this.form.existsStockIn === '1'
      return false
    },
    comDisPrintMethod() {
      // this.form.isAlreadyHaveDocument === '1' ||
      // return this.form.existsStockIn === '1'
      return false
    },

    modifyHighlight() {
      if (this.approvedBtnShow) {
        return true
      }
      return false
    },
    sysDockingSwitch() {
      return (
        this.$store.getters.sysDockingSwitch ||
        this.$store.getters.sysDockingSwitchQC
      )
    },
    canSelectInventoryControlModeList() {
      this.inventoryControlModeList.forEach(item => {
        item.disabled = false
        item.value = item.dictValue
        item.label = item.dictLabel
        if (this.form.includeDecimal === '1' && item.dictValue === '1') {
          item.disabled = true
        } else {
          item.disabled = false
        }
      })
      return this.inventoryControlModeList
    }
  },
  beforeCreate() {
    i18n.global.mergeLocaleMessage('zh', locale.zh)
    i18n.global.mergeLocaleMessage('en', locale.en)
  },
  methods: {
    queryBrandSugg(queryString, cb) {
      const vm = this
      const brandList = vm.brandList

      let results
      if (queryString) {
        results = brandList.filter(
          umo =>
            umo.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      } else {
        results = brandList
      }
      cb(results)
    },
    // 品牌
    queryAllBrandList() {
      queryAllBrandList().then(res => {
        const list = res.data || []
        this.brandList = list.map(x => {
          return { value: x }
        })
      })
    },
    changeProductType() {
      if (this.form.productType === '3') {
        this.form.includeDecimal = '0'
        this.form.isSystemDocking = '0'
        this.form.assembledProduct = '1'
      }
    },
    nonInventoryItemChange() {
      this.form.labelManagement = undefined
      this.form.inventoryControlMode = undefined
      this.form.printMethod = undefined
    },
    changeIsPhantomSwitch() {
      if (this.form.isPhantom === '1') {
        this.form.isSystemDocking = '0'
        this.form.assembledProduct = '0' // 生产制造产品
        this.form.isSequenceCode = '0' // 序列码(供应商)
        this.form.setCombination = '0' // 套装组合
        this.form.packingNotice = '0' // 打包
        if ((this.form.purposeList || []).includes('3')) {
          this.form.purposeList = this.form.purposeList.filter(x => x !== '3')
        }
      }
      this.form.labelManagement = undefined
      this.form.inventoryControlMode = undefined
      this.form.printMethod = undefined
    },
    changeLabelManagementSwitch() {
      this.form.inventoryControlMode = undefined
      this.form.printMethod = undefined
    },
    changeInventoryControlMode(type) {
      if (type === 'batchManagement') {
        if (this.form.batchManagement === '1') {
          if (this.form.serialNumberManagement === '1') {
            this.form.serialNumberManagement = '0'
          }
        }
      } else {
        if (this.form.serialNumberManagement === '1') {
          if (this.form.batchManagement === '1') {
            this.form.batchManagement = '0'
          }
        }
      }
    },
    changeType() {
      this.$refs.form3.clearValidate('minMoisture')
      this.$refs.form3.clearValidate('maxMoisture')
    },
    // 系统对接开关
    systemDockingChange() {
      if (this.form.isSystemDocking === '1') {
        this.form.purposeList = ['1']
        this.form.includeDecimal = '1'
        this.form.assembledProduct = '0'
        this.form.isSequenceCode = '0'
        this.form.packingNotice = '0'
        this.form.setCombination = '0'
      }
    },
    handleClick() {},
    getDict() {
      this.getDicts('inventory_control_mode').then(res => {
        this.inventoryControlModeList = res.data || []
      })
    },
    handleUpdate() {
      this.reset()
      this.getDict()
      const rowId = this.rowId
      this.queryAllBrandList()
      this.queryAllUomList()
      queryMaterialProductById({ productMainId: rowId }).then(res => {
        const data = res.data || {}
        /* 初始化 AddressInfo */
        setTimeout(() => {
          this.$refs.uploadPictureRef.initFileList(
            data.commonFileListForImage || []
          )
          this.$refs.uploadRef.initFileList(data.commonFileList || [])
        }, 300)

        data.purposeList = data.purpose ? data.purpose.split(',') : []
        this.form = data
        this.$refs.form1 &&
          this.$refs.form1.clearValidate('productCategoryIdList')

        this.specificationsForm = data.ivtSpecifications || {}
        const { uom } = this.specificationsForm
        this.form.uom = uom || undefined
        this.setCombinationList = data.setCombinationList || []
        this.queryActiveProductCategoryTreeList(data.categoryIdList)
      })
    },
    // 取消按钮
    back() {
      if (this.isView) {
        this.$store.dispatch('tagsView/delView', this.$route)
        this.$router.back()
        return
      }
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/productManagement/productInfo' })
    },
    /* 表单部分 */
    // 表单重置
    reset() {
      this.form = {
        purposeList: [],
        isActive: '1',
        includeDecimal: '0',
        isRawMaterial: '1',
        isSequenceCode: '0',
        packingNotice: '0',
        setCombination: '0',
        isPhantom: '0',
        isInventoryItem: '1',
        // 标签管理（0代表有标签 1代表无标签）
        labelManagement: '1',
        printMethod: undefined,
        productStatus: '1',
        barcodeControl: '1',
        assembledProduct: '0',
        createdBy: this.$store.state.user.nickName,
        isSystemDocking: '0'
      }
      this.specificationsForm = {
        uom: undefined
      }
      this.collapseWarningForBasicInfo = false
      this.collapseWarningSetCombination = false
      this.activeName = 'basicInfo'
      this.activeNames = ['1', '2', '3', '4', '5']
      setTimeout(() => {
        if (this.$refs.uploadPictureRef) {
          this.$refs.uploadPictureRef.initFileList([])
        }
        if (this.$refs.uploadRef) {
          this.$refs.uploadRef.initFileList([])
        }
      }, 300)

      this.resetForm('form1')
      this.resetForm('form2')
      this.resetForm('form3')

      if (this.sysDockingSwitch) {
        this.form.isSystemDocking = '1'
        this.form.purposeList = ['1']
        this.form.includeDecimal = '0'
        this.form.assembledProduct = '0'
        this.form.isSequenceCode = '0'
        this.form.packingNotice = '0'
        this.form.setCombination = '0'
      } else {
        this.form.isSystemDocking = '0'
      }
    },

    queryActiveProductCategoryTreeList(id = []) {
      queryActiveProductCategoryTreeList().then(res => {
        const arr = res.data
        this.handle(arr)
        this.productCategoryData = arr
        if (id) {
          const ids = this.findParentChains(this.productCategoryData, id) || []
          this.form.productCategoryIdList = ids[0]
          this.$refs.form1 &&
            this.$refs.form1.clearValidate('productCategoryIdList')
        }
      })
    },
    /**
     * 在树形结构中根据ID数组查找所有父级链ID
     * @param {Array} tree - 树形结构数组
     * @param {Array} ids - 需要查找的ID数组
     * @returns {Array} 二维ID数组集合，每个元素包含ID及其所有父级ID
     */
    findParentChains(tree, ids) {
      const result = []
      // 遍历每个ID
      ids.forEach(id => {
        // 查找ID对应的所有父级ID
        const parentChain = this.findParentIds(tree, id)
        if (parentChain.length > 0) {
          result.push(parentChain)
        }
      })
      return result
    },
    /**
     * 递归查找指定ID的所有父级ID
     * @param {Array} tree - 树形结构数组
     * @param {number} targetId - 目标ID
     * @param {Array} parents - 父级ID数组（递归使用）
     * @returns {Array} 包含目标ID及其所有父级ID的数组
     */
    findParentIds(tree, targetId, parents = []) {
      for (const node of tree) {
        // 复制当前父级链并添加当前节点ID
        const currentParents = [...parents, node.productCategoryId]

        if (node.productCategoryId === targetId) {
          // 找到目标ID，返回包含所有父级ID的数组
          return currentParents
        }

        if (node.child && node.child.length > 0) {
          // 递归查找子节点
          const result = this.findParentIds(
            node.child,
            targetId,
            currentParents
          )
          if (result.length > 0) {
            return result
          }
        }
      }

      // 未找到目标ID，返回空数组
      return []
    },
    handle(data) {
      if (data && data.length > 0) {
        data.forEach(x => {
          if (x.child && x.child.length > 0) {
            this.handle(x.child)
          } else {
            x.child = undefined
          }
        })
      }
    },
    purposeChange() {
      if (
        (this.form.purposeList || []).includes('2') &&
        this.form.setCombination === '1'
      ) {
        this.$modal.msgError(this.$t('PRODUCT.setCombinationCannotSales'))
      }
    },
    setCombinationSwitchChange() {
      if (
        this.form.setCombination === '1' &&
        this.form.assembledProduct === '1'
      ) {
        this.form.assembledProduct = '0'
        this.$modal.msgError(this.$t('PRODUCT.notUsed'))
      } else if (
        (this.form.purposeList || []).includes('2') &&
        this.form.setCombination === '1'
      ) {
        this.$modal.msgError(this.$t('PRODUCT.setCombinationCannotSales'))
      }
    },
    assembledProductSwitchChange() {
      if (
        this.form.setCombination === '1' &&
        this.form.assembledProduct === '1'
      ) {
        this.form.setCombination = '0'
        this.$modal.msgError(this.$t('PRODUCT.notUsed'))
      }
      if (this.form.assembledProduct === '1') {
        this.form.includeDecimal = '0'
      }
    },
    inputNumberChange(code) {
      this.$refs.form2.validateField(code).catch(() => {})
      if (['length', 'width', 'height'].includes(code)) {
        const { length, width, height } = this.specificationsForm
        if (
          this.$resultOfBoolean(length) &&
          this.$resultOfBoolean(width) &&
          this.$resultOfBoolean(height)
        ) {
          const a = this.$bigMathTimes(length, width, height)
          this.specificationsForm.volume = +a
        } else {
          this.specificationsForm.volume = undefined
        }
      }
    },
    inputNumberChange2(code) {
      this.$refs.form3.validateField(code).catch(() => {})
    },
    queryAllUomList() {
      // queryAllUomList().then((res) => {
      //   this.allUomList = res.data || []
      // })
      queryAllUomListByLocalization({}).then(res => {
        this.allUomList = res.data || []
        // this.allUomList = (res.data || []).map((x) => x.uomName)
      })
      // queryVolumeUomList().then((res) => {
      //   this.volumeUomList = res.data || []
      // })
      // queryWeightUomList().then((res) => {
      //   this.weightUomList = res.data || []
      // })
      // queryLengthUomList().then((res) => {
      //   this.lengthUomList = res.data || []
      // })
    },

    lengthUomChange(type) {
      let lengthUom
      switch (type) {
        case 'length':
          lengthUom = this.specificationsForm.lengthUom
          break
        case 'width':
          lengthUom = this.specificationsForm.widthUom
          break
        case 'height':
          lengthUom = this.specificationsForm.heightUom
          break
      }
      this.specificationsForm.lengthUom = lengthUom
      this.specificationsForm.widthUom = lengthUom
      this.specificationsForm.heightUom = lengthUom
      const selectItem =
        this.lengthUomList.find(item => item.lengthUom === lengthUom) || {}
      this.specificationsForm.volumeUom = selectItem.volumeUom
    },

    changeUom() {
      const { inventoryUnitId } = this.form
      if (inventoryUnitId) {
        const { decimalPrecision, unitRoundingType, uomName } =
          this.allUomList.find(x => x.id === inventoryUnitId)
        this.form.inventoryUnit = uomName
        this.form.unitRoundingType = unitRoundingType
        this.form.decimalPrecision = decimalPrecision
      } else {
        this.form.inventoryUnit = undefined
        this.form.unitRoundingType = undefined
        this.form.decimalPrecision = undefined
      }

      const timer = Date.now()
      this.queryTimer = timer
      if (this.form.inventoryUnit) {
        checkInventoryUom({
          productMainId: this.rowId,
          inventoryUom: this.form.inventoryUnit
        })
          .then(res => {
            if (this.queryTimer !== timer) return
            const data = res.data || {}
            this.form.isShowUomTip = data.isInventoryItem !== '1' ? '0' : '1'
            this.form.curUom = data.uom
            this.form.qtyOnHand = data.qtyOnHand
            this.form.qtyOnHandDecimalNum = data.decimalNum
            if (data.legalEntityNames) {
              this.$modal.msgError(
                this.$t('PRODUCT.inventoryUomExtendedTip').replace(
                  '$1',
                  data.legalEntityNames
                )
              )
              this.form.inventoryUnit = undefined
              this.form.unitRoundingType = undefined
              this.form.decimalPrecision = undefined
              this.form.inventoryUnitId = undefined
            }
          })
          .catch(() => {})
      }
    },
    changeDefaultUOM() {
      const uom = this.specificationsForm.defaultUom
      if (uom) {
        this.specificationsForm.purchaseUom = uom
        this.specificationsForm.salesUom = uom
        this.specificationsForm.inventoryUom = uom
      }
    },

    handleBtnAdd() {
      const alreadySelectIdList = this.setCombinationList.map(
        item => item.productId
      )
      this.$refs.selectProductTable.handleAdd(alreadySelectIdList)
    },
    /* 行删除 */
    handleDelRow(index, row) {
      this.$modal.confirm(this.$t('ui.delConfirm')).then(() => {
        this.setCombinationList.splice(index, 1)
      })
    },
    updateTable(list) {
      if (list.length > 0) {
        const rows = JSON.parse(JSON.stringify(list))
        this.setCombinationList.push(...rows)
      }
    },

    async submitForm() {
      const pictureFiles = this.$refs.uploadPictureRef.getFileIds()
      if (pictureFiles === false) {
        return
      }
      const defaultPicture = pictureFiles.find(item => {
        return item.isDefault === '1'
      })
      const myFileIds = this.$refs.uploadRef.getFileIds()
      if (myFileIds === false) {
        return
      }
      const valid1 = await this.$refs.form1.validate().catch(() => false)
      const valid2 = await this.$refs.form2.validate().catch(() => false)
      if (!valid1) {
        this.$modal.msgError(
          this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
        )
        this.activeName = 'basicInfo'
        return
      }
      if (
        (this.form.purposeList || []).includes('2') &&
        this.form.setCombination === '1'
      ) {
        this.$modal.msgError(this.$t('PRODUCT.setCombinationCannotSales'))
        this.collapseWarningForBasicInfo = true
        this.activeName = 'basicInfo'
        return
      }
      this.collapseWarningForBasicInfo = !valid1

      if (pictureFiles.length > 0 && !defaultPicture) {
        this.collapseWarningForPicture = true
        this.$modal.msgError(this.$t('PRODUCT.pictureNoDefault'))
        return
      }
      this.collapseWarningForPicture = false
      if (!valid2) {
        this.$modal.msgError(
          this.$t('ui.fromIncomplete').replace(
            '$1',
            this.$t('PRODUCT.specifications')
          )
        )
        this.activeName = 'specifications'
        return
      }
      if (this.form.setCombination === '1') {
        if (this.setCombinationList.length <= 0) {
          this.$modal.msgError(
            this.$t('ui.commonReqMsg').replace(
              '$1',
              this.$t('PRODUCT.setCombination')
            )
          )
          this.collapseWarningSetCombination = true
          this.activeName = 'specifications'
          return
        }
        const qtyReq = this.setCombinationList.find(item => !item.qty)
        if (qtyReq) {
          this.$modal.msgError(
            this.$t('ui.commonReqMsg').replace('$1', this.$t('PRODUCT.qty'))
          )
          this.collapseWarningSetCombination = true
          this.activeName = 'specifications'
          return
        }
      }
      this.collapseWarningSetCombination = false

      if (this.form.isSystemDocking === '1') {
        const valid3 = await this.$refs.form3.validate().catch(() => false)

        if (!valid3) {
          this.$modal.msgError(
            this.$t('ui.fromIncomplete').replace(
              '$1',
              this.$t('PRODUCT.expandInfo')
            )
          )
          this.activeName = 'expandInfo'
          return
        }
      }
      if (valid1 && valid2) {
        let param = {
          ...this.form,
          setCombinationList: this.setCombinationList
        }
        param.ivtSpecifications = { ...this.specificationsForm }
        param = this.$trimOfObj(JSON.parse(JSON.stringify(param)))
        param.purpose = param.purposeList.join(',')
        if (param.productCategoryIdList) {
          param.categoryIdList = [
            param.productCategoryIdList[param.productCategoryIdList.length - 1]
          ]
          param.productCategoryId = param.productCategoryIdList[0]
        }

        param.commonFileListForImage = pictureFiles
        param.commonFileList = myFileIds
        param.ivtSpecifications.uom = this.form.uom
        delete param.categoryNameShowStr
        if (this.submitLoading) return
        this.$modal
          .confirm(this.$t('PRODUCT.productSubmit'))
          .then(() => {
            this.submitLoading = true
            return reviseMaterialProduct(param)
          })
          .then(response => {
            setTimeout(() => {
              this.submitLoading = false
            }, 1000)
            this.$modal.msgSuccess(
              this.$t('PRODUCT.productSuccess').replace('$1', response.msg)
            )
            this.back()
          })
          .catch(() => {
            this.submitLoading = false
          })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.cascader :deep(.el-cascader__tags) {
  flex-wrap: nowrap;
}
.cascader :deep(.el-cascader__tags > span) {
  display: flex;
  max-width: calc(100% - 100px);
}
.cascader :deep(.el-input__wrapper) {
  height: 28px !important;
}
.unit {
  flex-shrink: 0;
  min-width: 30px;
  padding: 0 8px;
  text-align: center;
  background-color: #f5f7fa;
  position: relative;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
}
.border-line-solid {
  height: 1px;
  width: 100%;
  border-top: 1px solid #dcdfe6;
  // background-color: #dcdfe6;
  margin-bottom: 20px;
}
.border-line-dashed {
  height: 1px;
  width: 100%;
  border-top: 2px dashed #dcdfe6;
  // background-color: #dcdfe6;
  margin-bottom: 20px;
  border-spacing: 6px;
}
.field-dec {
  color: #909399;
  font-size: 12px;
  line-height: 20px;
}
</style>
