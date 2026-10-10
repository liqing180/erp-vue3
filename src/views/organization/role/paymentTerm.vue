<template>
  <div style="padding-bottom: 20px">
    <div>
      <el-radio-group v-model="radioValue" :disabled="!editAuth">
        <el-radio
          v-for="dict in dict.type.dp_type_vendor"
          :key="dict.value"
          :value="dict.value"
        >
          {{ dict.label }}</el-radio
        >
      </el-radio-group>
    </div>

    <div v-if="radioValue === '1'">
      <el-row class="mt10" :gutter="10">
        <el-col :span="2">
          <el-button
            type="primary"
            icon="Plus"
            size="small"
            @click="handleAdd()"
            v-if="radioValue === '1' && editAuth"
            >{{ $t('uiBtn.add') }}</el-button
          >
        </el-col>
        <right-toolbar
          :saveKey="saveKey"
          v-model:showSearch="showSearch"
          :showSearchBtn="false"
          :showRefreshBtn="false"
          @queryTable="queryTable"
          :columns="configColumn"
          :columnsInit="columns"
        ></right-toolbar>
      </el-row>

      <el-table
        border
        ref="tables"
        class="mt10"
        :row-class-name="tableRowClassName"
        v-loading="loading"
        :data="tableList"
        max-height="540"
        @sort-change="handleSortChange"
      >
        <el-table-column
          type="index"
          :label="$t('ui.sn')"
          width="60"
          fixed="left"
          align="center"
        >
          <template #default="scope">
            <span>{{
              scope.$index +
              (queryParams.pageNum - 1) * queryParams.pageSize +
              1
            }}</span>
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
          <template #default="scope">
            <template v-if="item.prop === 'isActive'">
              <el-tag v-if="scope.row.isActive === '1'">{{
                $t('ui.y')
              }}</el-tag>
              <el-tag v-if="scope.row.isActive === '0'" type="danger">{{
                $t('ui.n')
              }}</el-tag>
            </template>
            <template v-else-if="item.prop === 'isDefault'">
              <el-tag v-if="scope.row.isDefault === '1'">{{
                $t('ui.y')
              }}</el-tag>
              <el-tag v-if="scope.row.isDefault === '0'" type="danger">{{
                $t('ui.n')
              }}</el-tag>
            </template>
            <template v-else-if="item.prop === 'paymentTermType'">
              <ToolTipPaymentTerm :paymentTermObj="scope.row.paymentTerm || {}">
                {{
                  selectDictLabel(
                    dict.type.payment_term_type,
                    scope.row[item.prop]
                  )
                }}
              </ToolTipPaymentTerm>
            </template>
            <template v-else>{{ scope.row[item.prop] }}</template>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('ui.action')"
          align="center"
          min-width="200"
          class-name="small-padding fixed-width"
          fixed="right"
          v-if="editAuth"
        >
          <template #default="scope">
            <div class="flexCen">
              <el-icon
                class="pointer"
                style="font-size: 20px; color: #f56c6c"
                :title="$t('uiBtn.delete')"
                @click="handleDelete(scope.$index)"
                ><Delete
              /></el-icon>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="radioValue === '2'">
      <el-checkbox-group
        v-model="paymentTermBranchCompanyIdList"
        :disabled="!editAuth"
      >
        <el-checkbox
          v-for="(item, index) in companyList"
          :key="index"
          :value="item.id"
          class="mt10"
          >{{ item.name }}</el-checkbox
        >
      </el-checkbox-group>
    </div>
    <paymentTermTable
      ref="paymentTermTable"
      :alreadyIdList="curIdList"
      @onSuccess="updateTable"
    />
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import paymentTermTable from '@/views/organization/role/paymentTermTable'

export default {
  mixins: [pageMixin],
  dicts: ['dp_type_vendor', 'payment_term_type'],
  components: { paymentTermTable },
  props: {
    comDisFrom: Boolean,
    formData: {
      type: Object,
      default: () => ({})
    },
    companyList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const vm = this
    return {
      radioValue: '0',
      saveKey: '4',
      searchFormKey: Date.now(),
      // 总条数
      total: 0,
      // 角色表格数据
      tableList: [],
      ids: [],
      // 显示搜索条件
      showSearch: true,
      loading: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: ''
      },
      columns: [
        {
          prop: 'paymentTermNo',
          label: vm.$t('ui.paymentTermNo'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'paymentTermName',
          label: vm.$t('menu.paymentTerm'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'paymentTermType',
          label: vm.$t('ui.type'),
          minWidth: 160,
          visible: true,
          tooltip: true
        },

        {
          prop: 'description',
          label: vm.$t('ui.description'),
          minWidth: 160,
          visible: true,
          tooltip: true
        },
        {
          prop: 'isDefault',
          label: vm.$t('ui.isDefault'),
          minWidth: 160,
          visible: true,
          tooltip: true
        },
        {
          prop: 'isActive',
          label: vm.$t('ui.isActive'),
          minWidth: 160,
          visible: true,
          tooltip: true
        }
      ],
      paymentTermBranchCompanyIdList: []
    }
  },
  computed: {
    curIdList() {
      return this.tableList.map(item => item.paymentTermId)
    },
    editAuth() {
      if (this.comDisFrom) {
        return false
      }
      return this.checkPermi(['organization:role:paymentTerm:edit'])
    }
  },
  watch: {
    formData: {
      immediate: true,
      handler: function () {
        const {
          roleId,
          dpTypePaymentTerm,
          paymentTermList,
          paymentTermBranchCompanyIdList
        } = this.formData
        if (roleId) {
          this.radioValue = dpTypePaymentTerm || '0'
          this.tableList = paymentTermList || []
          this.paymentTermBranchCompanyIdList =
            paymentTermBranchCompanyIdList || []
        }
      }
    }
  },
  methods: {
    handleAdd() {
      const tableList = JSON.parse(JSON.stringify(this.tableList))
      this.$refs.paymentTermTable.handleOpen(tableList)
    },
    updateTable(list) {
      this.tableList = list
    },
    handleDelete(index) {
      this.tableList.splice(index, 1)
    },
    tableRowClassName({ row }) {
      let color = ''
      for (const item of this.ids.values()) {
        if (item === row.userId) {
          color = 'table-SelectedRow-bgcolor'
        }
      }
      return color
    },
    submitForm() {
      return {
        dpTypeVendor: this.radioValue,
        vendorIdList: this.radioValue === '1' ? this.curIdList : [],
        paymentTermBranchCompanyIdList:
          this.radioValue === '2' ? this.paymentTermBranchCompanyIdList : []
      }
    }
  }
}
</script>
