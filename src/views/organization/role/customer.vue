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
            <el-switch
              v-if="item.prop === 'isActive'"
              v-model="scope.row.isActive"
              active-value="1"
              inactive-value="0"
              :disabled="true"
            ></el-switch>
            <template v-else-if="item.prop === 'isCompetitor'">
              <el-tag v-if="scope.row.isCompetitor === '1'">{{
                $t('ui.y')
              }}</el-tag>
              <el-tag v-if="scope.row.isCompetitor === '0'" type="danger">{{
                $t('ui.n')
              }}</el-tag>
            </template>
            <template v-else-if="item.prop === 'businessPartnerStatus'"
              >{{
                selectDictLabel(
                  dict.type.bp_business_partner_status,
                  scope.row.businessPartnerStatus
                )
              }}
            </template>
            <template v-else-if="item.prop === 'createdTime'">{{
              parseTime(scope.row.createdTime, fmtForYmdhms)
            }}</template>
            <template v-else-if="item.prop === 'modifiedTime'">{{
              parseTime(scope.row.modifiedTime, fmtForYmdhms)
            }}</template>
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
        v-model="customerBranchCompanyIdList"
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
    <vendorTable
      ref="vendorTable"
      :alreadyIdList="curIdList"
      isCustomer="1"
      @onSuccess="updateTable"
    />
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import vendorTable from '@/views/organization/role/vendorTable'

export default {
  mixins: [pageMixin],
  dicts: ['bp_business_partner_status', 'dp_type_vendor'],
  components: { vendorTable },
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
      saveKey: '3',
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
          prop: 'businessPartnerNo',
          label: vm.$t('organization.businessPartnerNo'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'businessPartnerName',
          label: vm.$t('organization.businessPartnerName'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'country',
          label: vm.$t('organization.country'),
          minWidth: 170,
          visible: true,
          tooltip: true
        },
        {
          prop: 'businessPartnerStatus',
          label: vm.$t('ui.status'),
          minWidth: 170,
          visible: true,
          tooltip: true
        },
        {
          prop: 'currency',
          label: vm.$t('organization.currency'),
          minWidth: 170,
          visible: true,
          tooltip: true
        },
        {
          prop: 'isCompetitor',
          label: vm.$t('organization.isCompetitor'),
          minWidth: 170,
          visible: true,
          tooltip: true
        }
      ],
      customerBranchCompanyIdList: []
    }
  },
  computed: {
    curIdList() {
      return this.tableList.map(item => item.businessPartnerId)
    },
    editAuth() {
      if (this.comDisFrom) {
        return false
      }
      return this.checkPermi(['organization:role:customer:edit'])
    }
  },
  watch: {
    formData: {
      immediate: true,
      handler: function () {
        const {
          roleId,
          dpTypeCustomer,
          customerList,
          customerBranchCompanyIdList
        } = this.formData
        if (roleId) {
          this.radioValue = dpTypeCustomer || '0'
          this.tableList = customerList || []
          this.customerBranchCompanyIdList = customerBranchCompanyIdList || []
        }
      }
    }
  },
  methods: {
    handleAdd() {
      const tableList = JSON.parse(JSON.stringify(this.tableList))
      this.$refs.vendorTable.handleOpen(tableList)
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
        customerBranchCompanyIdList:
          this.radioValue === '2' ? this.customerBranchCompanyIdList : []
      }
    }
  }
}
</script>
