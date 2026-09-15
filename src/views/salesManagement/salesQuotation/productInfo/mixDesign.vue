<template>
  <div class="pb20">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-if="!comDisFrom">
        <el-button
          @click="handleAddBtn"
          :disabled="!formData.projectId"
          type="primary"
          icon="Plus"
          size="small"
          >{{ $t('uiBtn.add') }}</el-button
        >
      </el-col>
      <right-toolbar
        :showSearchBtn="false"
        :showRefreshBtn="false"
        :saveKey="saveKey"
        :savePath="savePath"
        :columns="configColumn"
      ></right-toolbar>
    </el-row>
    <el-table
      border
      ref="tables"
      v-loading="loading"
      :row-class-name="tableRowClassName"
      :cell-class-name="tableCellClassName"
      :data="tableList"
      @select="handleSelectionChange"
      @select-all="handleSelectAll"
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
        <template v-slot="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-for="item in visibleColumn"
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
        <template v-slot:header="{ column }">
          <span
            v-if="['salesPartNo', 'volume', 'unitPrice'].includes(item.prop)"
          >
            <span style="color: #ff4949; margin-right: 4px">*</span
            >{{ column.label }}
          </span>
          <span v-else>{{ column.label }}</span>
        </template>
        <template v-slot="scope">
          <template v-if="item.prop === 'volume'">
            <el-input-number
              style="width: 96%"
              v-model="scope.row.volume"
              controls-position="right"
              :precision="2"
              v-thousandSplit="{ precision: 2 }"
              :min="formData.productMinVol || 0.01"
              :max="
                formData.projectMaxVol
                  ? Math.min(formData.projectMaxVol, 999999999.99)
                  : 999999999.99
              "
              @change="volumeChange(scope.row)"
              v-if="!comDisFrom"
            />
            <template v-else>{{
              $numberStr(scope.row[item.prop], 2)
            }}</template>
          </template>
          <!-- <template v-else-if="item.prop === 'salesPartNo'">
            <CommonSelect
              v-if="!comDisFrom"
              style="width: 98%"
              :id="scope.row.salesPartNo"
              :label="scope.row.salesPartNo"
              :title="scope.row.salesPartNo"
              :clearable="false"
              idKey="salesPartNo"
              labelKey="salesPartNo"
              :options="scope.row.salesPriceList || []"
              @change="salesPartNoChange($event, scope.row)"
            />
            <template v-else>{{ scope.row[item.prop] }}</template>
          </template> -->
          <template v-else-if="item.prop === 'unitPrice'">
            <template v-if="!comDisFrom">
              <el-input-number
                v-thousandSplit="{ precision: 2 }"
                style="width: 98%"
                v-model="scope.row.unitPrice"
                controls-position="right"
                :precision="2"
                :min="0.01"
                :max="999999999999.99"
                @change="volumeChange(scope.row)"
              />
            </template>
            <template v-else>{{
              $numberStr(scope.row[item.prop], 2)
            }}</template>
          </template>
          <template v-else-if="item.prop === 'lineTotal'">
            {{ $numberStr(scope.row[item.prop], 2) }}
          </template>
          <template v-else-if="item.prop === 'natureOfCasting'">
            <el-input
              style="width: 96%"
              v-model="scope.row.natureOfCasting"
              maxlength="100"
              v-if="!comDisFrom"
            />
            <template v-else>{{ scope.row.natureOfCasting }}</template>
          </template>
          <template v-else-if="item.prop === 'productRemarks'">
            <el-input
              v-if="!comDisFrom"
              style="width: 98%"
              :title="scope.row.productRemarks"
              v-model="scope.row.productRemarks"
              :maxlength="300"
            />
            <template v-else>{{ scope.row[item.prop] }}</template>
          </template>
          <!-- <template v-else-if="['productCode'].includes(item.prop)">
            <span class="primary-link" @click="nav(scope.row)">{{
              scope.row[item.prop]
            }}</span>
          </template> -->
          <template v-else>{{ scope.row[item.prop] }}</template>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('ui.action')"
        key="action"
        align="center"
        width="120"
        class-name="small-padding fixed-width"
        fixed="right"
        v-if="!comDisFrom"
      >
        <template v-slot="scope">
          <div class="flexCen">
            <el-icon
              :title="$t('uiBtn.delete')"
              @click.stop="handleDelRow(scope.$index, scope.row)"
              :size="20"
              color="#f56c6c"
              class="pointer"
            >
              <Delete />
            </el-icon>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <selectMixDesignList
      ref="selectMixDesignList"
      :projectId="formData.projectId"
      @update="updateTable"
    />
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import selectMixDesignList from '../components/selectMixDesignList.vue'

export default {
  mixins: [pageMixin],
  components: { selectMixDesignList },
  props: {
    loading: {
      type: Boolean,
      default: false
    },

    comDisFrom: {
      type: Boolean,
      default: false
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
    'formData.salesQuotationMixDesignList': {
      immediate: true,
      handler: function (selected) {
        if (!this.formData.salesQuotationMixDesignList) {
          this.formData.salesQuotationMixDesignList = []
        }
        this.tableList = this.formData.salesQuotationMixDesignList
        this.changeTableList()
      }
    },
    comDisFrom: {
      immediate: true,
      handler: function (params) {
        this.initColumnWidth()
      }
    }
  },
  data() {
    const vm = this
    return {
      saveKey: '48',
      savePath: 'salesMTable',
      activeName: '1',
      columns: [
        {
          prop: 'mixDesignName',
          label: vm.$t('SALES.mixDesignName'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'productName',
          label: vm.$t('SALES.productName'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'productCode',
          label: vm.$t('SALES.productCode'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        /* {
          prop: 'variationShowStr',
          label: vm.$t('SALES.variation'),
          visible: true,
          minWidth: 200,
          tooltip: true
        }, */
        {
          prop: 'salesPartNo',
          label: vm.$t('SALES.salesPartNo'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'volume',
          label: vm.$t('SALES.volume'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'unitPrice',
          label: vm.$t('SALES.price'),
          visible: true,
          minWidth: 140,
          tooltip: true,
          padding: 50,
          align: 'right'
        },
        {
          prop: 'lineTotal',
          label: vm.$t('SALES.lineTotal'),
          visible: true,
          minWidth: 140,
          tooltip: true,
          padding: 50,
          align: 'right'
        },
        {
          prop: 'productRemarks',
          label: vm.$t('SALES.productRemarks'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'natureOfCasting',
          label: vm.$t('SALES.natureOfCasting'),
          visible: true,
          minWidth: 200,
          tooltip: true
        }
      ],
      totalForm: {},
      tableList: [],
      selected: [],
      sortableDom: undefined,
      rowIdKey: 'salesPartId',
      popoverData: {},
      queryTotalTime: Date.now(),
      /* 附件组件实时更新传到外部, 只是为了显示附件数量, 无其他用处 */
      curFileList: []
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    }
  },
  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
  },
  methods: {
    handleTabClick() {},
    initColumnWidth() {
      const vm = this
      this.columns.forEach(item => {
        const prop = item.prop
        switch (prop) {
          case 'salesPartNo':
            item.fixedWidth = vm.comDisFrom ? undefined : 180
            break
          case 'volume':
            item.fixedWidth = vm.comDisFrom ? undefined : 180
            break
          case 'unitPrice':
            item.fixedWidth = vm.comDisFrom ? undefined : 180
            break
          case 'productRemarks':
            item.fixedWidth = vm.comDisFrom ? undefined : 180
            break
          case 'natureOfCasting':
            item.fixedWidth = vm.comDisFrom ? undefined : 180
            break
        }
      })
    },
    handleAddBtn() {
      this.tableList.forEach(x => {
        x.customId = x.mixDesignId + '_' + x.salesPartNo
      })
      this.$refs.selectMixDesignList.handleOpen(this.tableList)
    },
    updateTable(data = []) {
      this.tableList = data
      this.totalForm.salesQuotationMixDesignList = data
      this.changeTableList()
    },
    salesPartNoChange(selectRow, row) {
      row.mixDesignSalesPriceId = selectRow.mixDesignSalesPriceId
      row.salesPartNo = selectRow.salesPartNo
      row.unitPrice = selectRow.unitPrice
      row.basicUnitPrice = selectRow.basicUnitPrice
      row.basicCurrencyId = selectRow.basicCurrencyId
      row.basicCurrencyCode = selectRow.basicCurrencyCode
      this.volumeChange(row)
    },
    volumeChange(row) {
      const { volume, unitPrice } = row
      if (volume && unitPrice) {
        const lineTotal = row.volume * row.unitPrice
        row.lineTotal = lineTotal
        this.$emit('handleCalculate')
      } else {
        row.lineTotal = undefined
      }
    },
    nav(row, type) {
      this.$router.push({
        path: '/productManagement/viewMixDesign',
        query: {
          id: row.mixDesignId,
          timeId: Date.now()
        }
      })
    },
    changeTableList() {
      this.$$getColumnContentMaxWidth(this.columns, this.tableList)
    },
    // 行删除
    handleDelRow(index, row) {
      this.$modal.confirm(this.$t('ui.delConfirm')).then(() => {
        this.tableList.splice(index, 1)
        if (this.tableList.length === 0) {
          this.totalForm.salesQuotationMixDesignList = []
          this.totalForm.subTotal = undefined
          this.totalForm.totalFreight = undefined
          this.totalForm.totalTaxAmount = undefined
          this.totalForm.totalAmount = undefined
          this.totalForm.totalDiscount = undefined
          this.totalForm.expenseAmount = undefined
          this.totalForm.otherCosts = undefined
        }
        this.$emit('handleCalculate')
      })
    },
    // 表格全选
    handleSelectAll(selection) {
      const vm = this
      if (selection.length) {
        // 去重添加
        const curSelectedIds = this.selected.map(d => d[this.rowIdKey])
        selection.forEach(item => {
          if (!curSelectedIds.includes(item[this.rowIdKey])) {
            vm.selected.push(item)
          }
        })
      } else {
        // 删除table中在selection 中缓存的内容
        const delArr = this.tableList.map(item => item[this.rowIdKey])
        vm.selected = vm.selected.filter(
          item => !delArr.includes(item[this.rowIdKey])
        )
      }
    },
    // 行单个选择
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
      }
      const cur = this.selected.find(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      if (cur) {
        color = 'table-SelectedRow-bgcolor'
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

      return cellClass
    }
  }
}
</script>

<style lang="scss" scoped>
.pop-box {
  max-width: 600px;
  max-height: 60vh;
  overflow-y: auto;
  // padding: 12px;
  box-sizing: border-box;
  background-color: #333;
  div {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
