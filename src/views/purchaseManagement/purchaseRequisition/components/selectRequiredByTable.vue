<template>
  <el-dialog
    draggable
    :title="$t('ui.user')"
    v-model="visible"
    width="1140px"
    append-to-body
    :modal="true"
    :close-on-click-modal="false"
  >
    <div v-dialogDragWidth aria-hidden="true"></div>
    <search-form
      ref="searchForm"
      v-model="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :showCustom="false"
      :showMenu="false"
      v-show="showSearch"
    >
      <right-toolbar
        :saveKey="saveKey"
        :savePath="savePath"
        :showRefreshBtn="true"
        @queryTable="queryTable"
        :columns="configColumn"
        :columnsInit="columns"
      ></right-toolbar>
    </search-form>

    <el-table
      border
      ref="tables"
      class="mt10"
      v-loading="loading"
      :data="tableList"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
      :row-class-name="'pointer'"
      :max-height="tableMaxHeight"
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
            scope.$index + (queryParams.pageNum - 1) * queryParams.pageSize + 1
          }}</span>
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
        <template #default="scope">
          <dict-tag
            v-if="item.prop === 'status'"
            :options="dict.type.user_status"
            :value="scope.row[item.prop]"
          />
          <template v-else>{{ scope.row[item.prop] }}</template>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :saveKey="saveKey"
      :savePath="savePath"
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <template #footer
      ><div class="dialog-footer">
        <el-button @click="handleBack">{{ $t('ui.back') }}</el-button>
      </div></template
    >
  </el-dialog>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import { queryUsers } from '@/api/organization/corporate'

export default {
  emits: ['update'],
  dicts: ['user_status'],
  mixins: [pageMixin],
  props: {
    departmentId: {
      type: String,
      default: ''
    }
  },
  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  data() {
    return {
      saveKey: '31',
      savePath: 'purchaseMTable',
      searchFormKey: Date.now(),
      loading: false,

      showSearch: true,

      total: 0,
      tableList: [],
      tableMaxHeightResize: true,
      selected: '',
      visible: false,
      columns: [
        {
          prop: 'employeeNo',
          label: this.$t('organization.employeeNo'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'userName',
          label: this.$t('organization.userId'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'nickName',
          label: this.$t('ui.userName'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'departmentName',
          label: this.$t('organization.department'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'postName',
          label: this.$t('organization.positionName'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'email',
          label: this.$t('organization.email'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'mobilePhone',
          label: this.$t('organization.mobilePhone'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'status',
          label: this.$t('organization.status'),
          visible: true,
          minWidth: 170,
          colMinWidth: 90,
          tooltip: true
        }
      ],

      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: ''
      },
      searchData: [
        {
          name: 'condition',
          placeholder: `${this.$t('organization.userId')} / ${this.$t('ui.userName1')} / ${this.$t(
            'organization.employeeNo'
          )}`,
          type: 'InputEle'
        }
      ]
    }
  },
  computed: {},
  created() {
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
  },
  methods: {
    handleOpen() {
      this.queryParams.condition = ''
      this.queryParams.pageNum = 1
      this.visible = true
      this.getList()
    },
    getList() {
      const vm = this
      const param = this.queryParams
      this.$trimOfObj(param)
      param.departmentId = this.departmentId
      param.menuPerms = this.menuKey.PR
      queryUsers(param)
        .then(response => {
          this.loading = false
          this.total = response.total
          this.tableList = response.rows
          this.$$getColumnContentMaxWidth(this.columns, this.tableList)
        })
        .catch(err => {
          vm.table_loading = false
        })
    },
    handleBack() {
      const vm = this
      vm.visible = false
    },

    handleSearchForm() {
      this.queryParams.pageNum = 1
      this.getList()
    },

    resetSearchForm() {
      const { pageSize } = this.queryParams
      this.queryParams = { pageNum: 1, pageSize }
      this.$refs.tables.clearSort()
      this.getList()
    },
    handleRowClick(row) {
      this.$emit('update', row)
      this.visible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.txt-color {
  color: #f66c6c !important;
}
</style>
