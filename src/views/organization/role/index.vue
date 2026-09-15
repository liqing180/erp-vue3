<template>
  <div class="app-container">
    <search-form
      ref="searchForm"
      :value="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :showCustom="false"
      v-show="showSearch"
    />

    <el-row :gutter="10">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          v-hasPermi="['organization:role:add']"
          @click="hanldeCreateVisible()"
          >{{ $t('uiBtn.add') }}</el-button
        >
      </el-col>
      <right-toolbar
        :saveKey="saveKey"
        v-model:showSearch="showSearch"
        :showSearchBtn="false"
        @queryTable="queryTable"
        :columns="configColumn"
      ></right-toolbar>
    </el-row>

    <el-table
      border
      ref="tables"
      class="mt10"
      :row-class-name="tableRowClassName"
      v-loading="loading"
      :data="tableList"
      @sort-change="handleSortChange"
      @row-dblclick="handleRowDbclick"
    >
      <el-table-column
        type="index"
        :label="$t('ui.sn')"
        width="60"
        fixed="left"
        align="center"
      >
        <template v-slot="scope">
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
        :min-width="item.minWidth"
        :show-overflow-tooltip="item.tooltip"
        :fixed="item.fixed"
        :sortable="item.sortable"
        :align="item.align || 'left'"
        header-align="center"
      >
        <template v-slot="scope">
          <template v-if="item.prop === 'isActive'">
            <el-tag v-if="scope.row.isActive === '1'">{{
              $t('uiBtn.active')
            }}</el-tag>
            <el-tag v-if="scope.row.isActive === '0'" type="danger">{{
              $t('uiBtn.inactive')
            }}</el-tag>
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
      <!-- <el-table-column
              :label="$t('ui.action')"
              align="center"
              min-width="200"
              class-name="small-padding fixed-width"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-setting"
                  size="small"
                  v-hasPermi="['organization:role:functionalPermissions']"
                  :title="$t('organization.functionalPermissions')"
                  @click="handleFunctionalPermissions(scope.row)"
                ></el-button>
                <el-button
                  type="primary"
                  icon="el-icon-folder-opened"
                  size="small"
                  v-hasPermi="['organization:role:accessPermissions']"
                  :title="$t('organization.accessPermissions')"
                  @click="handleAccessPermissions(scope.row)"
                ></el-button>
                <el-button
                  type="primary"
                  icon="el-icon-user"
                  size="small"
                  v-hasPermi="['organization:role:assignUser']"
                  :title="$t('organization.assignUser')"
                  @click="handleAssignUser(scope.row)"
                ></el-button>
              </template>
            </el-table-column> -->
    </el-table>
    <pagination
      :saveKey="saveKey"
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import { queryRoleList } from '@/api/organization/role'
// import accessPermissionsDlg from '@/views/system/role/accessPermissionsDlg'

export default {
  name: 'Role',
  mixins: [pageMixin],
  components: {
    // accessPermissionsDlg
  },
  data() {
    const vm = this
    return {
      saveKey: '1',
      searchFormKey: Date.now(),
      // 总条数
      total: 0,
      // 角色表格数据
      tableList: [],
      ids: [],
      // 显示搜索条件
      showSearch: true,
      loading: false,
      columns: [
        {
          prop: 'roleName',
          label: vm.$t('organization.roleName'),
          visible: true,
          sortable: 'custom',
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'isActive',
          label: vm.$t('ui.isActive'),
          visible: true,
          sortable: 'custom',
          minWidth: 100
        },
        {
          prop: 'createdBy',
          label: vm.$t('ui.createdBy'),
          minWidth: 170,
          visible: true,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'createdTime',
          label: vm.$t('ui.createdTime'),
          minWidth: 170,
          sortable: 'custom',
          visible: true
        },
        {
          prop: 'modifiedBy',
          label: vm.$t('ui.modifiedBy'),
          minWidth: 170,
          visible: true,
          sortable: 'custom',
          tooltip: true
        },
        {
          prop: 'modifiedTime',
          label: vm.$t('ui.modifiedTime'),
          minWidth: 170,
          sortable: 'custom',
          visible: true
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25
      },
      searchData: [
        {
          name: 'condition',
          type: 'InputEle',
          placeholder: `${vm.$t('organization.roleName')}`
        },
        {
          name: 'isActive',
          label: vm.$t('ui.isActive'),
          type: 'SelectEle',
          width: '200px',
          selectValue: 'value',
          selectLabel: 'label',
          dict: 'system_active',
          selectData: []
        }
      ]
    }
  },
  watch: {},
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['organization:role:edit'])
    }
  },
  beforeCreate() {},
  created() {
    this.createdInitTimer = Date.now()
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.getList()
  },
  activated() {
    if (Date.now() - this.createdInitTimer < 1000) return
    this.getList()
  },
  methods: {
    getList() {
      let param = { ...this.queryParams }
      param = this.$trimOfObj(param)
      this.loading = true
      queryRoleList(param)
        .then(response => {
          this.tableList = response.rows
          this.total = response.total
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      for (const item of this.ids.values()) {
        if (item === row.salesOrderId) {
          color = 'table-SelectedRow-bgcolor'
        }
      }
      return color
    },
    hanldeCreateVisible(row) {
      this.$router.push({
        path: '/organization/addRole',
        query: { timeId: +new Date() }
      })
    },
    handleFunctionalPermissions(row) {
      this.$router.push({
        path: '/organization/functionalPermissions',
        query: {
          roleId: row.roleId,
          timeId: +new Date()
        }
      })
    },
    // Organization start
    handleAccessPermissions(row) {
      this.$router.push({
        path: '/organization/accessPermissions',
        query: {
          roleId: row.roleId,
          timeId: +new Date()
        }
      })
    },
    handleAssignUser(row) {
      this.$router.push({
        path: '/organization/assignUser',
        query: {
          roleId: row.roleId,
          timeId: +new Date()
        }
      })
    },
    /** 搜索 */
    handleSearchForm() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置 */
    resetSearchForm() {
      const { pageSize } = this.queryParams
      this.queryParams = { pageNum: 1, pageSize }
      this.$refs.tables.clearSort()
      this.getList()
    },
    handleRowDbclick(row) {
      this.$router.push({
        path: '/organization/editRole',
        query: { roleId: row.roleId, timeId: +new Date() }
      })
    }
  }
}
</script>
