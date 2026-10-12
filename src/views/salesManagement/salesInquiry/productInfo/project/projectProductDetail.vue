<template>
  <div class="pb20">
    <el-row :gutter="10" class="mb8">
      <!-- v-if="addAdhocEntryAuth" -->
      <!-- :disabled="!formData.businessPartnerId || !formData.currencyId" -->
      <el-col :span="1.5">
        <el-button
          @click="handleSddAdhocEntry"
          :loading="formData.tableLoading"
          type="primary"
          icon="Plus"
          size="small"
          v-if="addBtnShow"
          >{{ $t('menu.addAdhocEntry') }}</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          @click="handleAddProduct"
          :loading="formData.tableLoading"
          type="primary"
          icon="Plus"
          size="small"
          v-if="addBtnShow"
          >{{ $t('menu.addProduct') }}</el-button
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
    </el-row>
    <div
      class="erp-virtual-table"
      :style="{ height: virtualTableHeight + 'px' }"
      v-loading="formData.tableLoading || isLoading"
    >
      <el-auto-resizer>
        <template #default="{ width, height }">
          <el-table-v2
            ref="tables"
            :columns="virtualColumns"
            :data="virtualRows"
            :width="width"
            :height="height"
            :row-key="rowIdKey"
            :row-height="rowHeight"
            :header-height="44"
            :row-class="virtualRowClass"
            :cell-props="virtualCellProps"
            v-table-tab="virtualTabOptions"
            scrollbar-always-on
            fixed
          >
            <template #empty>
              <div class="virtual-empty">{{ $t('ui.noData') }}</div>
            </template>
            <template #header-cell="{ column }">
              <span
                v-if="
                  [
                    'salesInquiryProductType',
                    'productName',
                    'uom',
                    'uomCoefficient',
                    'qty',
                    // 'unitPrice',
                    'deliveryDateForDay'
                  ].includes(column.prop)
                "
              >
                <span style="color: #ff4949; margin-right: 4px">*</span
                >{{ column.title }}
              </span>
              <span v-else>{{ column.title }}</span>
            </template>
            <template #cell="{ column: item, rowData: row, rowIndex }">
              <VirtualTableCell
                :row-data="row"
                :column="item"
                :row-index="rowIndex"
                :show-overflow-tooltip="!!item.tooltip"
              >
                <template v-if="item.key === '__index0'">
                  <span>{{ rowIndex + 1 }}</span>
                </template>
                <template v-else-if="item.key === '__action'">
                  <div class="flexCen">
                    <el-icon
                      v-if="!row.isTotal"
                      class="pointer"
                      style="font-size: 20px; color: #f56c6c"
                      :title="$t('uiBtn.delete')"
                      @click="handleDelRow(rowIndex, row)"
                      ><Delete
                    /></el-icon>
                  </div>
                </template>
                <template v-else>
                  <template
                    v-if="
                      item.prop === 'salesInquiryProductType' && !row.isTotal
                    "
                  >
                    <el-select
                      v-if="
                        !comDisFrom &&
                        !disType &&
                        row.productType !== '2' &&
                        row.isEdit
                      "
                      style="width: 98%"
                      v-model="row.salesInquiryProductType"
                      placeholder=""
                      @change="salesInquiryProductTypeChange(row)"
                    >
                      <el-option
                        v-for="dict in dict.type.sales_inquiry_product_type"
                        v-show="
                          dict.value === '2' ? freeOfChargeProductAuth : true
                        "
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      ></el-option>
                    </el-select>
                    <template v-else>{{ row[item.propBy] }}</template>
                  </template>

                  <template
                    v-else-if="item.prop === 'salesPartNo' && !row.isTotal"
                  >
                    <el-input
                      v-if="
                        row.isAdhocEntry === '1' && !comDisFrom && row.isEdit
                      "
                      style="width: 98%"
                      :title="row.salesPartNo"
                      v-model="row.salesPartNo"
                      :maxlength="200"
                      @input="commonPropChange(row)"
                    />
                    <template v-else>{{ row[item.prop] }}</template>
                  </template>

                  <template v-else-if="item.prop === 'productName'">
                    <template
                      v-if="
                        row.isAdhocEntry === '1' && !comDisFrom && row.isEdit
                      "
                    >
                      <el-input
                        style="width: 98%"
                        :title="row.productName"
                        v-model="row.productName"
                        :maxlength="200"
                        @input="productNameChange(row)"
                      />
                      <TablePropError v-if="row[item.prop + 'Error']" />
                    </template>

                    <template v-else>{{ row[item.prop] }}</template>
                  </template>

                  <template v-else-if="item.prop === 'description'">
                    <descriptionEditDlg
                      v-if="!comDisFrom && row.isEdit"
                      v-model="row.description"
                      :maxlength="7000"
                      @input="descriptionChange($event, row)"
                    />
                    <template v-else>
                      <DescriptionToolTipShow :showStr="row[item.prop]" />
                    </template>
                  </template>

                  <template v-else-if="item.prop === 'partNo'">
                    <el-input
                      v-if="
                        row.isAdhocEntry === '1' &&
                        !comDisFrom &&
                        row.productType !== '2' &&
                        row.isEdit
                      "
                      style="width: 98%"
                      :title="row.partNo"
                      v-model="row.partNo"
                      :maxlength="200"
                      @input="commonPropChange(row)"
                    />
                    <template v-else>{{ row[item.prop] }}</template>
                  </template>

                  <template v-else-if="item.prop === 'brand'">
                    <el-input
                      v-if="
                        row.isAdhocEntry === '1' && !comDisFrom && row.isEdit
                      "
                      style="width: 98%"
                      :title="row.brand"
                      v-model="row.brand"
                      :maxlength="200"
                      @input="commonPropChange(row)"
                    />
                    <template v-else>{{ row[item.prop] }}</template>
                  </template>

                  <template
                    v-else-if="
                      item.prop === 'purchaseQuotationNo' && !row.isTotal
                    "
                  >
                    <DocumentNoLink
                      :showStr="row[item.prop]"
                      moduleKey="purchaseQuotation"
                      @click="nav(row, item.prop)"
                      v-if="row[item.prop] !== 'ASL' && row.isEdit"
                    />
                    <template v-else>{{ row[item.prop] }}</template>
                  </template>
                  <template v-else-if="item.prop === 'dateQuoted'">
                    <span v-if="row.purchaseQuotationNo !== 'ASL'">{{
                      parseTime(row.dateQuoted, fmtForYmdhms)
                    }}</span>
                    <span v-else>{{
                      parseTime(row.dateQuoted, fmtForYmd)
                    }}</span>
                  </template>
                  <template v-else-if="item.prop === 'uom' && !row.isTotal">
                    <template
                      v-if="
                        row.isAdhocEntry === '1' && !comDisFrom && row.isEdit
                      "
                    >
                      <el-select
                        style="width: 98%"
                        v-model="row.uom"
                        :title="showUomLabel(row.uom)"
                        placeholder=""
                        filterable
                        @change="rowUomChange(row, 'all')"
                      >
                        <el-option
                          v-for="item in allUomList"
                          :key="item"
                          :label="item"
                          :value="item"
                        >
                        </el-option>
                      </el-select>
                      <TablePropError v-if="row[item.prop + 'Error']" />
                    </template>
                    <template
                      v-else-if="
                        !comDisFrom && row.productType !== '2' && row.isEdit
                      "
                    >
                      <el-select
                        style="width: 98%"
                        v-model="row.uom"
                        :title="showUomLabel(row.uom)"
                        placeholder=""
                        @change="rowUomChange(row)"
                        filterable
                      >
                        <el-option
                          v-for="item in row.uomDataList"
                          :key="item.uomName"
                          :label="item.uomName"
                          :value="item.uomName"
                        >
                        </el-option>
                      </el-select>
                      <TablePropError v-if="row[item.prop + 'Error']" />
                    </template>

                    <span v-else :title="showUomLabel(row[item.prop])">{{
                      row[item.prop]
                    }}</span>
                  </template>

                  <template
                    v-else-if="item.prop === 'uomCoefficient' && !row.isTotal"
                  >
                    <div
                      class="flex"
                      style="width: 98%"
                      v-if="row.productType !== '2' && row.isEdit"
                    >
                      <el-input-number
                        class="flex-1"
                        v-model="row.uomCoefficient"
                        :disabled="
                          comDisFrom ||
                          row.uom === row.basicUom ||
                          row.isAdhocEntry === '1'
                        "
                        controls-position="right"
                        :precision="row.includeDecimal === '1' ? 2 : 0"
                        v-thousandSplit="{
                          precision: row.includeDecimal === '1' ? 2 : 0
                        }"
                        :min="1"
                        :max="99999"
                        @change="uomCoefficientChange(row)"
                      />
                      <span
                        class="fs-0 ml10"
                        :title="showUomLabel(row.basicUom)"
                        >{{ row.basicUom }}</span
                      >
                    </div>
                    <TablePropError v-if="row[item.prop + 'Error']" />
                  </template>

                  <template v-else-if="item.prop === 'qty' && !row.isTotal">
                    <template v-if="!comDisFrom && row.isEdit">
                      <el-input-number
                        style="width: 100%"
                        v-model="row.qty"
                        controls-position="right"
                        v-thousandSplit="{ precision: row.decimalNum }"
                        :min="row.includeDecimal === '1' ? 0.001 : 1"
                        :max="999999.999"
                        @change="serviceQtyChange(row)"
                        :key="'qty11' + row.decimalNum"
                      />
                      <TablePropError v-if="row[item.prop + 'Error']" />
                    </template>
                    <template v-else>
                      <div
                        :title="
                          row.qty &&
                          row.uomCoefficient &&
                          row.uomCoefficient > 1
                            ? $numberStr(row.qty, row.decimalNum) +
                              '' +
                              row.uom +
                              ' = ' +
                              $numberStr(
                                row.qty * row.uomCoefficient,
                                row.decimalNum
                              ) +
                              '' +
                              row.basicUom
                            : ''
                        "
                      >
                        {{
                          $numberStr(
                            row[item.prop],
                            row.decimalNum,
                            row.isAdhocEntry !== '1'
                          )
                        }}
                      </div>
                    </template>
                  </template>
                  <template
                    v-else-if="item.prop === 'unitPrice' && !row.isTotal"
                  >
                    <template>{{ $numberStr(row[item.prop], 2) }}</template>
                  </template>
                  <template
                    v-else-if="item.prop === 'unitCost' && !row.isTotal"
                  >
                    <template>{{ $numberStr(row[item.prop], 2) }}</template>
                  </template>

                  <template
                    v-else-if="item.prop === 'discountPer' && !row.isTotal"
                  >
                    <el-input-number
                      v-thousandSplit="{ precision: 3 }"
                      v-if="!comDisFrom && row.isEdit"
                      style="width: 98%"
                      v-model="row.discountPer"
                      controls-position="right"
                      :precision="3"
                      :min="0"
                      :max="100"
                      @change="discountPerChange(row)"
                    />
                    <template v-else>{{
                      $numberStr(row[item.prop], 3)
                    }}</template>
                  </template>
                  <template v-else-if="item.prop === 'targetMargin'">
                    <el-input-number
                      v-thousandSplit="{ precision: 2 }"
                      v-if="!comDisFrom && row.isEdit"
                      style="width: 98%"
                      v-model="row.targetMargin"
                      controls-position="right"
                      :precision="2"
                      :min="0"
                      :max="100"
                      @change="targetMarginChange(row)"
                    />
                    <template v-else>{{
                      $numberStr(row[item.prop], 2)
                    }}</template>
                  </template>

                  <template
                    v-else-if="item.prop === 'discount' && !row.isTotal"
                  >
                    <el-input-number
                      v-thousandSplit="{ precision: 2 }"
                      v-if="!comDisFrom && row.isEdit"
                      style="width: 98%"
                      v-model="row.discount"
                      controls-position="right"
                      :precision="2"
                      :min="0"
                      :max="
                        (row.qty || 0) * (row.unitPrice || 0) || 999999999999.99
                      "
                      @change="discountChange(row)"
                    />
                    <template v-else>{{
                      $numberStr(row[item.prop], 2)
                    }}</template>
                  </template>
                  <template v-else-if="item.prop === 'lineTotal'">
                    <template v-if="!row.isTotal">{{
                      $numberStr(row[item.prop], 2)
                    }}</template>
                    <template v-else
                      ><span v-if="formData.priceTbd === '1'">{{
                        $numberStr(comLineTotal, 2)
                      }}</span></template
                    >
                  </template>

                  <template v-else-if="item.prop === 'pplUnitPrice'">
                    <template
                      v-if="
                        checkPermi([
                          'salesManagement:salesInquiry:purchasePrice'
                        ])
                      "
                      >{{ $numberStr(row[item.prop], 2) }}</template
                    >
                  </template>
                  <template v-else-if="item.prop === 'salesCost'">
                    <template v-if="!row.isTotal">
                      <span v-if="row.productType !== '2'">{{
                        $numberStr(row[item.prop], 2)
                      }}</span>
                    </template>
                    <template v-else>{{
                      $numberStr(comSalesCost, 2)
                    }}</template>
                  </template>
                  <template v-else-if="item.prop === 'salesProfit'">
                    <template v-if="!row.isTotal">
                      <span v-if="row.productType !== '2'">{{
                        $numberStr(row[item.prop], 2)
                      }}</span>
                    </template>
                    <template v-else>{{
                      $numberStr(comSalesProfit, 2)
                    }}</template>
                  </template>

                  <template
                    v-else-if="
                      item.prop === 'deliveryDateForDay' && !row.isTotal
                    "
                  >
                    <template v-if="!comDisFrom && row.isEdit">
                      <el-input-number
                        v-thousandSplit="{ precision: 0 }"
                        style="width: 98%"
                        v-model="row.deliveryDateForDay"
                        controls-position="right"
                        :precision="0"
                        :min="1"
                        :max="999"
                        @change="changeExpectedDeliveryDate(rowIndex, row)"
                      />
                      <TablePropError v-if="row[item.prop + 'Error']" />
                    </template>

                    <template v-else>{{
                      $numberStr(row[item.prop], 0)
                    }}</template>
                  </template>

                  <template
                    v-else-if="item.prop === 'warranty' && !row.isTotal"
                  >
                    <el-input-number
                      v-thousandSplit="{ precision: 0 }"
                      v-if="!comDisFrom && row.isEdit"
                      style="width: 98%"
                      v-model="row.warranty"
                      controls-position="right"
                      :precision="0"
                      :min="0"
                      :max="9999"
                      @change="changeWarranty(rowIndex)"
                    />
                    <template v-else>{{
                      $numberStr(row[item.prop], 0)
                    }}</template>
                  </template>
                  <template v-else-if="item.prop === 'remarks' && !row.isTotal">
                    <descriptionEditDlg
                      v-model="row.remarks"
                      :maxlength="200"
                      :disabled="!(!comDisFrom && row.isEdit)"
                      @input="commonPropChange(row)"
                    />
                  </template>
                  <template v-else>{{ row[item.prop] }}</template>
                </template>
              </VirtualTableCell>
            </template>
          </el-table-v2>
        </template>
      </el-auto-resizer>
    </div>
    <priceControlNoticeDlg
      ref="priceControlNoticeDlg"
      :formData="formData"
      pageType="salesInquiry"
      @updatePriceControlNotice="updatePriceControlNotice"
      @closePriceControlNotice="closePriceControlNotice"
    />
    <priceControlNoticeDlgNoSubmit
      ref="priceControlNoticeDlgNoSubmit"
      :formData="formData"
      @closePriceControlNotice="closePriceControlNotice"
    />
    <totalPriceControlNoticeDlgNoSubmit
      ref="totalPriceControlNoticeDlgNoSubmit"
      :formData="formData"
      @closePriceControlNotice="closePriceControlNotice"
    />

    <!-- 新增产品 -->
    <selectProductTable
      ref="selectProductTable"
      :formData="formData"
      :isFather="true"
      @onSuccess="updateTable"
    />
  </div>
</template>

<script>
import virtualTableMixin from '@/mixins/virtualTableMixin'
import VirtualTableCell from '@/components/VirtualTableCell'
import '@/assets/styles/virtual-table.scss'

import pageMixin from '@/mixins/tableMinx'
import {
  calculateOneDetail,
  queryCanSelectPPLListNoPage,
  calculate,
  submitButtonJudgmentDisplay
} from '@/api/salesManagement/salesInquiry'
import { queryAllUomList } from '@/api/system/uom'

import priceControlNoticeDlg from '@/views/salesManagement/salesInquiry/productInfo/priceControlNoticeDlg'
import priceControlNoticeDlgNoSubmit from '@/views/salesManagement/salesInquiry/productInfo/priceControlNoticeDlgNoSubmit'
import totalPriceControlNoticeDlgNoSubmit from '@/views/salesManagement/salesInquiry/productInfo/totalPriceControlNoticeDlgNoSubmit'
import { getMultiplyDecimalPlaces } from '@/utils/bigUtils/bigUtils.js'
import selectProductTable from './selectProductTable.vue'

export default {
  emits: [
    'handleCalculate',
    'updatePriceControlNotice',
    'deliveryDateForDayChange'
  ],
  mixins: [pageMixin, virtualTableMixin],
  dicts: ['sales_inquiry_product_type'],
  components: {
    VirtualTableCell,
    priceControlNoticeDlg,
    priceControlNoticeDlgNoSubmit,
    totalPriceControlNoticeDlgNoSubmit,
    selectProductTable
  },
  props: {
    comDisFrom: {
      type: Boolean,
      default: false
    },
    productList: {
      type: Array,
      default() {
        return []
      }
    },
    countryId: {
      type: String,
      default: ''
    },
    businessPartnerId: {
      type: String,
      default: ''
    },
    modifyHighlight: {
      type: Boolean,
      default: false
    },
    basicUpdateProps: {
      type: Array,
      default() {
        return []
      }
    },
    formData: {
      type: Object,
      required: true,
      default() {
        return {}
      }
    }
  },
  watch: {
    formData: {
      deep: false,
      immediate: true,
      handler(newValue) {
        this.totalForm = newValue || {}
      }
    },
    'formData.salesInquiryProductList': {
      immediate: true,
      handler: function (selected) {
        this.tableList = this.formData.salesInquiryProductList
        if (this.tableListCopy.length <= 0) {
          this.tableListCopy = JSON.parse(JSON.stringify(this.tableList))
        }
        this.changeTableList()
      }
    },
    comDisFrom: {
      immediate: true,
      handler: function (params) {
        // this.initColumnWidth()
      }
    }
  },
  data() {
    const vm = this
    return {
      saveKey: '1225',
      savePath: 'projectProductDetail',
      activeName: '1',
      columns: [
        {
          prop: 'salesPartNo',
          label: vm.$t('PRODUCT.salesPartNo'),
          visible: true,
          colMinWidth: 150,
          tooltip: true
        },
        {
          prop: 'productName',
          label: vm.$t('PRODUCT.productName'),
          visible: true,
          colMinWidth: 180,
          tooltip: true
        },
        {
          prop: 'internalPartNo',
          label: vm.$t('PRODUCT.internalPartNo'),
          visible: true,
          colMinWidth: 150,
          tooltip: true
        },
        {
          prop: 'description',
          label: vm.$t('ui.description'),
          visible: true,
          colMinWidth: 150,
          tooltip: false
        },
        {
          prop: 'uom',
          label: vm.$t('PRODUCT.uom1'),
          visible: true,
          colMinWidth: 150,
          tooltip: true
        },
        {
          prop: 'qty',
          label: vm.$t('SALES.salesQTY1'),
          visible: true,
          colMinWidth: 150,
          tooltip: true
        },
        {
          prop: 'unitCost',
          label: vm.$t('SALES.unitCost1'),
          visible: true,
          colMinWidth: 150,
          tooltip: true,
          padding: 70,
          align: 'right'
        },
        {
          prop: 'targetMargin',
          label: vm.$t('SALES.targetMargin1'),
          visible: true,
          colMinWidth: 150,
          tooltip: true
        },
        {
          prop: 'unitPrice',
          label: vm.$t('SALES.unitPrice'),
          visible: true,
          colMinWidth: 150,
          tooltip: true,
          padding: 70,
          align: 'right'
        },
        {
          prop: 'discountPer',
          label: vm.$t('SALES.discountPer'),
          visible: true,
          colMinWidth: 150,
          tooltip: true,
          padding: 50
        },
        {
          prop: 'discount',
          label: vm.$t('SALES.discount'),
          visible: true,
          colMinWidth: 150,
          tooltip: true,
          padding: 50,
          align: 'right'
        },
        {
          prop: 'lineTotal',
          label: vm.$t('SALES.lineTotal'),
          visible: true,
          colMinWidth: 150,
          tooltip: true,
          padding: 70,
          align: 'right'
        },
        {
          prop: 'deliveryDateForDay',
          label: vm.$t('SALES.leadTimeDays2'),
          visible: true,
          colMinWidth: 150,
          tooltip: true
        },
        {
          prop: 'warranty',
          label: vm.$t('SALES.warrantyDays'),
          visible: true,
          colMinWidth: 150,
          tooltip: true
        },
        {
          prop: 'remarks',
          label: vm.$t('ui.remarks'),
          visible: true,
          colMinWidth: 150,
          tooltip: false
        }
      ],
      timeDatePickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      totalForm: {},
      tableList: [],
      tableListCopy: [],
      selected: [],
      popoverData: {},
      queryTotalTime: Date.now(),
      /* 附件组件实时更新传到外部, 只是为了显示附件数量, 无其他用处 */
      curFileList: [],
      allUomList: [],
      rowIdKey: 'rowTimeId',
      curEditRow: null,
      isLoading: false
    }
  },
  computed: {
    errorColumnProps() {
      const errors = new Set()
      this.comVisibleColumn.forEach(column => {
        if (
          this.tableList.some(
            row => !row[column.prop] && row[column.prop + 'Error']
          )
        )
          errors.add(column.prop)
      })
      return errors
    },
    virtualColumns() {
      const columns = [
        {
          key: '__index0',
          title: this.$t('ui.sn'),
          width: 60,
          fixed: 'left',
          align: 'center'
        }
      ]
      columns.push(
        ...this.comVisibleColumn.map(item => ({
          ...item,
          key: item.prop,
          dataKey: item.prop,
          title: item.label,
          width: item.width || this.getMinWidth(item) || 120,
          fixed: item.fixed === true ? 'left' : item.fixed || false,
          align: item.align || 'left'
        }))
      )
      if (this.addBtnShow)
        columns.push({
          key: '__action',
          title: this.$t('ui.action'),
          width: 120,
          fixed: 'right',
          align: 'center'
        })
      return columns
    },
    rowHeight() {
      const hasRowError = tableList => {
        return tableList.some(item => {
          // 判断当前节点
          if (item['ROW-ERROR'] === true) return true

          return false
        })
      }
      return hasRowError(this.tableList) ? 62 : 38
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },

    // comTableList() {
    //   if (this.salesCostAuth) {
    //     if (this.tableList.length > 1) {
    //       return [...this.tableList, { isTotal: '1' }]
    //     } else {
    //       return this.tableList
    //     }
    //   }
    //   return this.tableList
    // },
    comPurchasePriceAuth() {
      return this.checkPermi(['salesManagement:salesInquiry:purchasePrice'])
    },
    comVisibleColumn() {
      const arr = [...this.visibleColumn]

      return arr
    },
    salesCostAuth() {
      return this.checkPermi(['salesManagement:salesInquiry:salesCostProfit'])
    },
    comLineTotal() {
      const lineTotalList = this.tableList.map(item => item.lineTotal)
      let total = 0
      lineTotalList.forEach(cost => {
        if (cost) {
          total += cost
        }
      })
      return total
    },
    comSalesCost() {
      const list = this.tableList.filter(item => item.productType !== '2')
      const salesCostList = list.map(item => item.salesCost)
      let total = 0
      salesCostList.forEach(cost => {
        if (cost) {
          total += cost
        }
      })
      return total
    },
    comSalesProfit() {
      let total = 0
      this.tableList.forEach(item => {
        if (item.salesProfit && item.productType !== '2') {
          total += item.salesProfit
        }
      })
      return total
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    addBtnShow() {
      /* 项目类型的销售需求, 没有新增按钮 */
      if (this.comDisFrom) {
        return false
      }
      if (this.disInQuotation) {
        return false
      }
      return true
    },

    // addAdhocEntryAuth() {
    //   if (this.comDisFrom) {
    //     return false
    //   }
    //   if (this.disInQuotation) {
    //     return false
    //   }
    //   return this.checkPermi(['salesManagement:salesInquiry:addAdhocEntry'])
    // },
    freeOfChargeProductAuth() {
      return this.checkPermi([
        'salesManagement:salesInquiry:freeOfChargeProduct'
      ])
    },
    disInQuotation() {
      return this.formData.salesInquiryStatus === '4'
    },
    disType() {
      let dis = false
      if (this.formData.salesInquiryStatus === '4') {
        dis = true
      }
      return dis
    },
    disPriceType() {
      let dis = false
      if (
        this.formData.salesInquiryStatus === '4' &&
        this.formData.salesInquiryType !== 'Project'
      ) {
        dis = true
      }
      return dis
    },
    disQty() {
      let dis = false
      if (
        this.formData.salesInquiryStatus === '4' &&
        this.formData.salesInquiryType !== 'Trading'
      ) {
        dis = true
      }
      return dis
    }
  },
  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.createdInitTimer = Date.now()
    this.queryAllUomList()
  },
  activated() {
    if (Date.now() - this.createdInitTimer < 1000) return
    this.queryAllUomList()
  },
  methods: {
    descriptionChange(e, row) {
      this.commonPropChange(row)
    },
    commonPropChange(row) {
      this.updateTreeNode(this.tableList, row)
    },
    /**
     * 更新树形表格中的某一行数据
     * @param {Array} treeData - 树形数组
     * @param {Object} newRow - 变化后的新行数据对象
     * @param {String|Number} idKey - 唯一标识的字段名，默认为 'id'
     */
    updateTreeNode(treeData, newRow) {
      for (let i = 0; i < treeData.length; i++) {
        const node = treeData[i]

        // 1. 匹配当前节点
        if (node[this.rowIdKey] === newRow[this.rowIdKey]) {
          treeData[i] = newRow
          return true // 找到并替换后，直接返回，提高性能
        }

        // 3. 如果当前节点有子节点，递归查找
        if (node.childProductList && node.childProductList.length > 0) {
          const found = this.updateTreeNode(node.childProductList, newRow)
          if (found) return true // 如果在子树中找到了，也直接返回
        }
      }
      return false // 未找到
    },
    productNameChange(row) {
      row.productNameError = false
      row['ROW-ERROR'] = false
      this.updateTreeNode(this.tableList, row)
    },
    submitButtonJudgmentDisplay() {
      if (this.formData.salesInquiryType !== 'Trading') {
        this.formData.showSubmitType = '1'
        return
      }
      if (!this.tableList.length === 0) {
        this.formData.showSubmitType = '1'
        return
      }
      submitButtonJudgmentDisplay(this.formData).then(res => {
        const data = res.data || {}
        this.formData.showSubmitType = data.showSubmitType
      })
    },
    priceTbdChange() {
      this.$nextTick(() => {
        this.totalForm.isUpdateAmount = '0'
        this.$emit('handleCalculate')
      })
    },
    queryAllUomList() {
      queryAllUomList().then(res => {
        this.allUomList = res.data || []
      })
    },
    handleTabClick() {},
    initColumnWidth() {
      const vm = this
      this.columns.forEach(item => {
        const prop = item.prop
        switch (prop) {
          case 'salesInquiryProductType':
            item.colMinWidth = vm.comDisFrom || vm.disType ? undefined : 200
            break
          case 'purchaseQuotationNo':
            item.colMinWidth =
              !vm.comDisFrom && vm.disInQuotation ? 200 : undefined
            break
          case 'salesPartNo':
            item.colMinWidth = !vm.comDisFrom ? 140 : undefined
            break
          case 'description':
            item.colMinWidth = !vm.comDisFrom ? 160 : undefined
            break
          case 'priceType':
            item.colMinWidth =
              vm.comDisFrom || vm.disPriceType ? undefined : 200
            break
          case 'qty':
            item.colMinWidth = vm.comDisFrom ? undefined : 140
            break
          case 'partNo':
            item.colMinWidth = vm.comDisFrom ? undefined : 100
            break
          case 'brand':
            item.colMinWidth = vm.comDisFrom ? undefined : 100
            break
          case 'uom':
            item.colMinWidth = vm.comDisFrom ? undefined : 120
            break
          case 'unitPrice':
            item.colMinWidth = vm.comDisFrom ? undefined : 140
            break
          case 'unitCost':
            item.colMinWidth = vm.comDisFrom ? 100 : 140
            break
          case 'discountPer':
            item.colMinWidth = vm.comDisFrom ? undefined : 140
            break
          case 'discount':
            item.colMinWidth = vm.comDisFrom ? undefined : 140
            break
          case 'targetMargin':
            item.colMinWidth = vm.comDisFrom ? undefined : 140
            break

          case 'warranty':
            item.colMinWidth = vm.comDisFrom ? undefined : 120
            break
          case 'deliveryDateForDay':
            item.colMinWidth = vm.comDisFrom ? undefined : 120
            break
          case 'remarks':
            item.colMinWidth = vm.comDisFrom ? undefined : 200
            break
        }
      })
    },
    handleRowClick(row, column) {
      // if (!column || !column.property) return
      // if (this.curEditRow) {
      // }
      // this.curEditRow = row
    },
    errorMessage(code) {
      // this.tableList.forEach((item) => {
      //   if (!this.$resultOfBoolean(item[code])) {
      //   }
      // })
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
    getList() {
      return this.tableList
    },
    salesInquiryProductTypeChange(row) {
      if (row.salesInquiryProductType === '2') {
        row.taxAmountProcess = undefined
        row.discount = undefined
      } else {
        row.discount = undefined
      }
      this.updateTreeNode(this.tableList, row)
      this.getLineTotal(row)
    },
    salesPartNoChange(selectRow, row) {
      row.salesPriceStrategyDetails =
        selectRow.salesPriceStrategyDetailList || []
      row.salesPartNo = selectRow.salesPartNo
      row.salesPartId = selectRow.salesPartId
      const defaultRow =
        row.salesPriceStrategyDetails.find(item => item.isDefault) || {}
      row.priceType = defaultRow.priceType
      row.priceTypeShowStr = defaultRow.priceTypeShowStr
      row.unitPrice = defaultRow.canUseUnitPrice
    },
    PQNoVisible(value, row) {
      const vm = this
      if (value) {
        const params = {
          currencyId: vm.formData.currencyId,
          productId: row.productId
        }
        if (!params.currencyId) {
          return
        }
        row.PQNoLoading = true
        queryCanSelectPPLListNoPage(params)
          .then(res => {
            const list = res.data || []
            row.pplList = list
            row.PQNoLoading = false
          })
          .catch(err => {
            row.pplList = []
            row.PQNoLoading = false
            window.console.error(err)
          })
      }
    },
    purchaseQuotationNoChange(row) {
      const selectRow =
        (row.pplList || []).find(
          item => item.purchaseQuotationNo === row.purchaseQuotationNo
        ) || {}
      row.purchaseQuotationNo = selectRow.purchaseQuotationNo
      row.purchaseQuotationId = selectRow.purchaseQuotationId
      row.purchaseQuotationUnitPrice = selectRow.purchaseQuotationUnitPrice
      row.pplUnitPrice = selectRow.pplUnitPrice
      row.purchasePriceId = selectRow.purchasePriceId
      row.dateQuoted = selectRow.dateQuoted
    },

    priceTypeChange(selectRow, row) {
      row.priceType = selectRow.priceType
      row.priceTypeShowStr = selectRow.priceTypeShowStr
      /* costOfGoods 与库存成本取max */
      row.unitPriceForBase = selectRow.canUseUnitPrice
      this.setRowUnitPrice(row)
      this.getLineTotal(row)
    },
    rowUomChange(row, type) {
      row.uomError = false
      row['ROW-ERROR'] = false
      if (type === 'all') {
        this.updateTreeNode(this.tableList, row)
        return
      }
      const selectItem = row.uomDataList.find(item => item.uomName === row.uom)
      row.uomCoefficient = selectItem.uomCoefficient
      this.setRowUnitPrice(row)
      this.queryRowTaxAmount(row)
    },
    uomCoefficientChange(row) {
      row.uomCoefficientError = false
      row['ROW-ERROR'] = false

      this.setRowUnitPrice(row)
      this.queryRowTaxAmount(row)
    },
    setRowUnitPrice(row) {
      if (row.unitPriceForBase) {
        const unitPrice = row.unitPriceForBase * (row.uomCoefficient || 1)
        row.unitPrice = unitPrice
      }
      // originalUnitPriceForBase ("原始单价(系统带出的默认价格)(基础单位)")
      // minPriceForBase ("最低限价(基础单位)")
      // maxPriceForBase ("最高限价(基础单位)")
      if (row.originalUnitPriceForBase) {
        const originalUnitPrice =
          row.originalUnitPriceForBase * (row.uomCoefficient || 1)
        row.originalUnitPrice = originalUnitPrice
      }
      if (row.minPriceForBase) {
        const minPrice = row.minPriceForBase * (row.uomCoefficient || 1)
        row.minPrice = minPrice
      }
      if (row.maxPriceForBase) {
        const maxPrice = row.maxPriceForBase * (row.uomCoefficient || 1)
        row.maxPrice = maxPrice
      }
    },

    serviceQtyChange(row) {
      row['qty-CELL-ERROR'] = false
      row.qtyError = false
      row['ROW-ERROR'] = false
      this.$nextTick(() => {
        if (row.qty) {
          row.qty = this.$num(row.qty, row.decimalNum)
          row.pricingQty = this.$num(row.qty, row.decimalNum)
          row.netQty = this.$num(row.qty, row.decimalNum)
        }
        this.getLineTotal(row)
      })
    },

    validCoefficientIsTrue(row) {
      if (!row.uomCoefficient || !row.qty) return true
      const { decimalPlaces, formulaStr } = getMultiplyDecimalPlaces(
        row.qty,
        row.uomCoefficient
      )
      const decimalPrecision = row.decimalPrecision
      if (decimalPlaces <= decimalPrecision) return true

      this.$modal.msgError(
        this.$t(
          decimalPrecision > 0
            ? 'SALES.validCoefficientErrForPrecision'
            : 'SALES.validCoefficientErr'
        )
          .replace('$1', row.productName)
          .replace('$2', formulaStr)
          .replace('$3', decimalPrecision)
      )
      return false
    },

    qtyChange(row, type) {
      if (type === 'unitPrice') {
        row.unitPriceError = false
      } else {
        row.qtyError = false
        this.validCoefficientIsTrue(row)
      }
      row['ROW-ERROR'] = false

      if (type === 'unitPrice' && !this.$resultOfBoolean(row.unitPrice)) {
        row.isNeedTips = undefined
      }
      row.discountType = '2'
      this.getLineTotal(row, type)
    },
    discountPerChange(row) {
      if (this.$resultOfBoolean(row.discountPer)) {
        row.discountType = '2'
      } else {
        row.discountType = undefined
        row.discount = undefined
      }
      this.getLineTotal(row, 'isCalculate')
    },
    targetMarginChange(row) {
      this.getLineTotal(row, 'isCalculate')
    },
    discountChange(row) {
      if (this.$resultOfBoolean(row.discount)) {
        row.discountType = '1'
      } else {
        row.discountType = undefined
        row.discountPer = undefined
      }
      this.getLineTotal(row, 'isCalculate')
    },
    getLineTotal(row, type) {
      this.$nextTick(() => {
        if (
          this.$resultOfBoolean(row.qty) &&
          this.$resultOfBoolean(row.unitPrice)
        ) {
          const lineTotal = row.unitPrice * row.qty
          if (row.salesInquiryProductType === '2') {
            row.discount = lineTotal
          } else if (row.discount > lineTotal) {
            row.discount = lineTotal
          }
          row.lineTotal = lineTotal - (row.discount || 0)
        } else {
          row.lineTotal = undefined
        }
        this.queryRowTaxAmount(row, type)
      })
    },
    queryRowTaxAmount(row, type) {
      this.updateTreeNode(this.tableList, row)
      // if (this.$resultOfBoolean(row.qty) && this.$resultOfBoolean(row.unitPrice)) {
      const timer = Date.now()
      row.queryTime = timer
      row.currencyId = this.formData.currencyId
      const params = {
        ...this.totalForm,
        discountType: row.discountType
      }
      this.isLoading = true

      calculate(params)
        .then(res => {
          if (row.queryTime === timer) {
            const rowKey =
              this.totalForm.salesInquiryType === 'Project'
                ? 'salesInquiryProductId'
                : 'salesPartId'
            const { salesInquiryProductList } = res.data
            // 赋值
            const handlerProductList = (list = []) => {
              const resultMap = new Map()

              const buildMap = (data = []) => {
                data.forEach(item => {
                  if (item.rowTimeId !== undefined && item.rowTimeId !== null) {
                    resultMap.set(String(item.rowTimeId), item)
                  }

                  if (
                    item.childProductList &&
                    item.childProductList.length > 0
                  ) {
                    buildMap(item.childProductList)
                  }
                })
              }

              const updateList = (data = []) => {
                data.forEach(item => {
                  const result = resultMap.get(String(item.rowTimeId))

                  if (result) {
                    item.unitCost = result.unitCost
                    item.lineTotal = result.lineTotal
                    item.scrapRate = result.scrapRate
                  }

                  if (
                    item.childProductList &&
                    item.childProductList.length > 0
                  ) {
                    updateList(item.childProductList)
                  }
                })
              }

              buildMap(salesInquiryProductList || [])
              updateList(list)
            }
            handlerProductList(this.tableList)
            const data = salesInquiryProductList.find(
              x => x[rowKey] === row[rowKey]
            )

            // isNeedTips 1:最大  2:最小
            // const { isNeedTips } = data
            row.unitPrice = data.unitPrice
            row.lineTotal = data.lineTotal
            row.taxAmountProcess = data.taxAmountProcess
            row.salesCost = data.salesCost
            row.salesProfit = data.salesProfit
            row.pplUnitPrice = data.pplUnitPrice
            row.discount = data.discount
            row.discountPer = data.discountPer

            const totalForm = JSON.parse(JSON.stringify(res.data))
            this.$emit('updatePriceControlNotice', totalForm, 'totalForm')

            // (type === 'isCalculate' || !this.checkPermi(['salesManagement:salesInquiry:AllowSellingBelowCost']))
            // if (isNeedTips && ['1', '2'].indexOf(isNeedTips) !== -1 && type === 'isCalculate') {
            //   this.$refs.priceControlNoticeDlg.open(data, row, totalForm)
            // } else {
            //   this.tableListCopy = JSON.parse(JSON.stringify(this.tableList))
            //   this.$emit('updatePriceControlNotice', totalForm, 'totalForm')
            // }

            this.changeTableList()
            // this.calculateOneDetailRow(row, type)
          }
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false

          this.closePriceControlNotice(row)
        })
      // } else {
      // }
    },
    calculateOneDetailRow(row, type) {
      const timer = Date.now()
      row.queryTime = timer

      calculateOneDetail(row).then(res => {
        if (row.queryTime === timer) {
          const data = res.data || {}
          // isNeedTips 1:最大  2:最小
          const { isNeedTips } = data
          row.unitPrice = data.unitPrice
          row.lineTotal = data.lineTotal
          row.taxAmountProcess = data.taxAmountProcess
          row.salesCost = data.salesCost
          row.salesProfit = data.salesProfit
          row.pplUnitPrice = data.pplUnitPrice
          row.discount = data.discount
          row.discountPer = data.discountPer

          if (
            isNeedTips &&
            ['1', '2'].indexOf(isNeedTips) !== -1 &&
            (type === 'isCalculate' ||
              !this.checkPermi([
                'salesManagement:salesInquiry:AllowSellingBelowCost'
              ]))
          ) {
            this.$refs.priceControlNoticeDlg.open(data, row)
          } else {
            row.isNeedTips = data.isNeedTips
            row.maxPrice = data.maxPrice
            row.minPrice = data.minPrice
            this.tableListCopy = JSON.parse(JSON.stringify(this.tableList))
          }
          this.changeTableList()
        }
      })
    },
    updatePriceControlNotice(data, row, totalForm) {
      row.isNeedTips = data.isNeedTips
      row.maxPrice = data.maxPrice
      row.minPrice = data.minPrice
      this.tableListCopy = JSON.parse(JSON.stringify(this.tableList))
      // 更新外层总金额
      this.$emit('updatePriceControlNotice', totalForm, 'totalForm')
    },
    closePriceControlNotice(row) {
      const list = this.tableListCopy.filter(x => x.productId === row.productId)
      if (list.length > 0) {
        const oldRow = list[0]
        if (!oldRow.discount) {
          oldRow.discount = undefined
        }
        if (!oldRow.discountPer) {
          oldRow.discountPer = undefined
        }
        Object.keys(oldRow).forEach(key => {
          row[key] = oldRow[key]
        })
      }
    },
    changeExpectedDeliveryDate(index, row) {
      this.commonPropChange(row)

      if (row) {
        row.deliveryDateForDayError = false
        row['ROW-ERROR'] = false
      }
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
                this.$t('SALES.expectedDateForDayConfirm').replace('$1', msg)
              )
              .then(() => {
                const newTableList = this.tableList.map(row => {
                  return {
                    ...row, // 保留原有数据
                    deliveryDateForDay: topRow.deliveryDateForDay,
                    deliveryDateForDayError: false,
                    ROW_ERROR: false
                  }
                })
                this.tableList.length = 0
                this.tableList.push(...newTableList)

                // this.timestamp = Date.now()
                this.setMaxExpectedDeliveryDate()
                this.$forceUpdate()
              })
          } else {
            this.tableList.forEach(row => {
              row.deliveryDateForDay = topRow.deliveryDateForDay
              row.deliveryDateForDayError = false
              row['ROW-ERROR'] = false
            })
          }
        }
      }
      this.setMaxExpectedDeliveryDate()
    },
    setMaxExpectedDeliveryDate() {
      const expectedDeliveryDateList1 = this.tableList.map(
        item => item.deliveryDateForDay || 0
      )
      const max = Math.max(0, ...expectedDeliveryDateList1)
      if (max > 0) {
        this.totalForm.deliveryDateForDay = max
        this.$emit('deliveryDateForDayChange')
      } else {
        if (this.tableList.length > 0) {
          this.totalForm.deliveryDateForDay = undefined
        } else {
          this.totalForm.deliveryDateForDay = undefined
        }
      }
    },
    changeWarranty(index) {
      if (index === 0) {
        const topRow = this.tableList[0]
        if (topRow && this.$resultOfBoolean(topRow.warranty)) {
          const oldDeliveryDate = this.tableList.find(
            (item, index) =>
              index > 0 &&
              this.$resultOfBoolean(item.warranty) &&
              item.warranty !== topRow.warranty
          )
          if (oldDeliveryDate) {
            const msg = this.$numberStr(topRow.warranty, 0)
            this.$modal
              .confirm(this.$t('SALES.warrantyDaysConfirm').replace('$1', msg))
              .then(() => {
                this.tableList.forEach(row => {
                  row.warranty = topRow.warranty
                })
              })
          } else {
            this.tableList.forEach(row => {
              row.warranty = topRow.warranty
            })
          }
        }
      }
    },

    handleSddAdhocEntry() {
      const topRow = this.tableList[0] || {}

      this.tableList.push({
        isAdhocEntry: '1',
        salesInquiryProductType: '1',
        includeDecimal: '1',
        uomCoefficient: 1,
        decimalNum: 3,
        productType: '1',
        rowTimeId: Date.now(),
        deliveryDateForDay: this.totalForm.deliveryDateForDay,
        warranty: topRow.warranty,
        customIndex: 0,
        itemIndex: 10,
        childProductList: [],
        isEdit: true
      })
      // setTimeout(() => {
      //   this.setDragTable()
      // }, 200)
    },
    handleAddProduct() {
      const ids = this.tableList.filter(x => x.productId).map(k => k.productId)
      this.$refs.selectProductTable.handleAdd(ids)
    },

    updateTable(list) {
      // if (list.length > 0) {
      const topRow = this.tableList[0] || {}
      const rows = JSON.parse(JSON.stringify(list))
      rows.forEach((item, index) => {
        item.isEdit = true
        item.salesInquiryProductType = '1'
        item.rowTimeId = Date.now() + index
        item.customIndex = 0
        item.itemIndex = 10
        item.childProductList = []
        if (!this.$resultOfBoolean(item.deliveryDateForDay)) {
          item.deliveryDateForDay = this.totalForm.deliveryDateForDay
        }
        if (!this.$resultOfBoolean(item.warranty)) {
          item.warranty = topRow.warranty
        }
      })
      // this.tableList.length = 0
      this.tableList.push(...rows)
      this.changeTableList()
      this.submitButtonJudgmentDisplay()
    },
    changeTableList() {
      const allList = JSON.parse(JSON.stringify(this.tableList || []))
      allList.forEach(item => {
        item.unitCost = this.$numberStr(item.unitCost, 2)
        item.unitPrice = this.$numberStr(item.unitPrice, 2)
        item.lineTotal = this.$numberStr(item.lineTotal, 2)
        item.scrapRate = this.$numberStr(item.scrapRate, 2)
        item.pricingQty = this.$numberStr(item.pricingQty, 3)
        item.qty = this.$numberStr(item.qty, 3)
        item.netQty = this.$numberStr(item.netQty, 3)
        item.lineTotalPricingCost = this.$numberStr(
          item.lineTotalPricingCost,
          2
        )
      })
      // this.$$getColumnContentMaxWidth(this.columns, allList)
      // setTimeout(() => {
      //   this.setDragTable()
      // }, 200)
    },
    // 行删除
    handleDelRow(index, row) {
      this.$modal.confirm(this.$t('ui.delConfirm')).then(() => {
        this.tableList.splice(index, 1)
        this.changeExpectedDeliveryDate()
        this.submitButtonJudgmentDisplay()
      })
    },
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      if (this.modifyHighlight) {
        if (row.updateType === '2') {
          color = 'new-add-row'
        } else if (row.updateType === '3') {
          color = 'cancel-row'
        }
      }
      const cur = this.selected.find(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      if (cur) {
        color = 'table-SelectedRow-bgcolor'
      }
      if (row['ROW-ERROR'] && row.customIndex === 0) {
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
      if (this.errorColumnProps.has(column.property)) {
        cellClass = 'is-required-table-cell'
      }
      return cellClass
    }
  }
}
</script>

<style lang="scss" scoped>
.footer-content {
  float: right;
  display: flex;
  justify-content: center;
  margin-right: 20px;
  // height: 40px;
  line-height: 28px;
  font-weight: 600;
  color: #606266;
  font-size: 12px;
}
</style>
