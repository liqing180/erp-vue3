<template>
  <div>
    <div>
      <div class="pb20">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="Plus"
              size="small"
              v-if="!comDisFrom"
              @click="handleAdd"
              >{{ $t('uiBtn.add') }}</el-button
            >
          </el-col>
          <right-toolbar
            class="mr5"
            :showSearchBtn="false"
            :showRefreshBtn="false"
            :saveKey="saveKey"
            :columns="configColumn"
          ></right-toolbar>
        </el-row>
        <el-table
          border
          ref="tables"
          :row-key="rowIdKey"
          :row-class-name="tableRowClassName"
          :cell-class-name="tableCellClassName"
          :data="tableList"
          @select="handleSelectionChange"
          @select-all="handleSelectAll"
          @row-dblclick="handleTermRowClick"
        >
          <!-- <el-table-column
                  v-if="!comDisFrom"
                  type="selection"
                  key="selection"
                  align="center"
                  width="55"
                ></el-table-column> -->
          <el-table-column
            type="index"
            key="index"
            :label="$t('ui.stage')"
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
            <template v-slot="scope">
              <template v-if="item.prop === 'isDefault'">
                <el-tag v-if="scope.row.isDefault === '1'">{{
                  $t('ui.y')
                }}</el-tag>
                <el-tag v-if="scope.row.isDefault === '0'" type="danger">{{
                  $t('ui.n')
                }}</el-tag>
              </template>
              <template v-else-if="item.prop === 'salesOpportunityName'">
                <span class="primary-link" @click="nav(scope.row)">{{
                  scope.row[item.prop]
                }}</span>
              </template>
              <template v-else>{{ scope.row[item.prop] }}</template>
            </template>
          </el-table-column>
          <el-table-column
            v-if="false"
            :label="$t('ui.action')"
            align="center"
            min-width="120"
            class-name="small-padding fixed-width"
            fixed="right"
          >
            <template v-slot="scope">
              <div class="flexCen">
                <el-icon
                  :title="$t('uiBtn.edit')"
                  @click="handleTermRowClick(scope.row)"
                  :size="20"
                  color="#409eff"
                  class="pointer mr5"
                >
                  <Edit />
                </el-icon>

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
      </div>
    </div>
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import { deleteContactPerson } from '@/api/customerManagement/customer'
export default {
  mixins: [pageMixin],
  props: {
    /* 是否实时提交 */
    isSubmitNow: {
      type: [Boolean],
      default: false
    },
    comDisFrom: {
      type: [Boolean],
      default: false
    },

    modifyHighlight: {
      type: [Boolean],
      default: false
    },
    cdsQc: {
      type: String,
      default: '0'
    },
    formData: {
      type: [Object],
      default() {
        return {}
      }
    }
  },
  watch: {
    'formData.salesOpportunityList': {
      deep: true,
      handler() {
        const list = this.formData.salesOpportunityList || []
        list.forEach(item => {
          item.estAmountLegalEntityStr = this.$numberStr(
            item.estAmountLegalEntity,
            2
          )
        })
        this.tableList = list
        this.$$getColumnContentMaxWidth(this.columns, this.tableList)
      }
    },
    'legalEntityInfo.currencyCode': {
      handler(newVal) {
        this.$$initColumnVisible(this.saveKey, this.columns)
      }
    }
  },
  data() {
    const vm = this
    return {
      saveKey: '8',
      /* 表格表单部分 */
      positionList: [],
      termForm: {
        addressIdList: []
      },
      isTermEdit: false,
      editIndex: undefined,
      /* 表格部分 */
      columns: [
        {
          prop: 'salesOpportunityName',
          label: vm.$t('customer.salesOpportunityName'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'salesOpportunityNo',
          label: vm.$t('customer.salesOpportunityNo'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'estAmountLegalEntityStr',
          label: computed(() => {
            const currencyCode = vm.legalEntityInfo.currencyCode || ''
            return `${vm.$t('customer.estAmount')}${currencyCode ? ' (' + currencyCode + ')' : ''}`
          }),
          visible: true,
          minWidth: 200,
          tooltip: true,
          align: 'right'
        },
        {
          prop: 'estClosing',
          label: vm.$t('customer.estClosing'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'currentPercentage',
          label: vm.$t('customer.currentProgress'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'currentStageName',
          label: vm.$t('customer.stage'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'salesOpportunityStatusShowStr',
          label: vm.$t('ui.status'),
          visible: true,
          minWidth: 140,
          tooltip: true
        },
        {
          prop: 'remarks',
          label: vm.$t('ui.remarks'),
          visible: true,
          minWidth: 200,
          tooltip: true
        }
      ],
      tableList: [],
      selected: [],
      sortableDom: undefined,
      rowIdKey: 'rowTimeId',
      visible: false,
      btnLoading: false,
      business_contact_person_title: [],
      sys_user_sex: []
    }
  },
  computed: {
    legalEntityInfo() {
      return this.$store.state.user.legalEntityInfo
    }
  },
  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
    const { sys_user_sex, business_contact_person_title } = this.useDict(
      'sys_user_sex',
      'business_contact_person_title'
    )
    this.sys_user_sex = sys_user_sex || []
    this.business_contact_person_title = business_contact_person_title || []
  },
  methods: {
    nav(row) {
      if (row.salesOpportunityStatus === '1') {
        this.$router.push({
          path: '/salesOpportunity/editSalesOpportunity',
          query: {
            id: row.salesOpportunityId,
            backType: '2',
            timeId: Date.now()
          }
        })
      } else {
        sessionStorage.removeItem('pageSalesOpportunityList')
        this.$router.push({
          path: '/salesOpportunity/viewSalesOpportunity',
          query: {
            id: row.salesOpportunityId,
            backType: '2',
            timeId: Date.now()
          }
        })
      }
    },
    changeEmployeeNoSwitch(code) {
      this.termForm[code] = ''
      if (this.$refs.termForm) {
        this.$nextTick(() => {
          this.$refs.termForm.clearValidate(code)
        })
      }
    },
    /* 版本比对 */
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
    },
    getTableList() {
      return this.tableList
    },
    initList(list) {
      this.tableList = list
      this.$emit('change', this.tableList)
    },
    /* 表格表单部分 */
    reset() {
      this.tableList = []
      this.selected = []
    },
    handleAdd() {
      sessionStorage.removeItem('pageSalesOpportunityList')
      this.$router.push({
        path: '/salesOpportunity/addSalesOpportunity',
        query: {
          timeId: Date.now(),
          customerId: this.formData.customerId,
          backType: '3'
        }
      })
    },
    handleTermRowClick(dataRow) {
      this.visible = true
    },
    /* 行删除 */
    handleDelRow(index, row) {
      this.$modal.confirm(this.$t('ui.delConfirm')).then(() => {
        if (this.isSubmitNow) {
          deleteContactPerson({
            customerContactPersonId: row.customerContactPersonId
          })
            .then(res => {
              this.tableList.splice(index, 1)
              this.$emit('change', this.tableList, 'delete')
            })
            .catch(() => {})
          return
        }
        this.tableList.splice(index, 1)
        this.$emit('change', this.tableList, 'delete')

        setTimeout(() => {
          this.handleResetTerm()
        }, 20)
        const findIndex = this.selected.findIndex(
          item => item[this.rowIdKey] === row[this.rowIdKey]
        )
        if (findIndex !== -1) {
          this.selected.splice(findIndex, 1)
        }
      })
    },
    /* 表格全选 */
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
    /* 行单个选择 */
    handleSelectionChange(selection, row) {
      const vm = this
      for (let i = 0; i < vm.selected.length; i++) {
        if (vm.selected[i][this.rowIdKey] === row[this.rowIdKey]) {
          return vm.selected.splice(i, 1)
        }
      }
      vm.selected.push(row)
    }
  },
  emits: ['change']
}
</script>
