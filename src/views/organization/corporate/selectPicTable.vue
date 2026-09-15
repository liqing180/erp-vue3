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
    <search-form
      ref="searchForm"
      :value="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :showCustom="false"
      :showMenu="false"
    >
      <right-toolbar
        :saveKey="saveKey"
        @queryTable="queryTable"
        :showRefreshBtn="true"
        :columns="configColumn"
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
      :max-height="tableMaxHeight"
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
          <dict-tag
            v-if="item.prop === 'status'"
            :options="user_status"
            :value="scope.row[item.prop]"
          />
          <template v-else>{{ scope.row[item.prop] }}</template>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :saveKey="saveKey"
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button type="default" @click="handleBack">{{
          $t('ui.back')
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import { queryUsers } from '@/api/organization/corporate'

export default {
  mixins: [pageMixin],
  props: {},
  data() {
    return {
      user_status: [],
      saveKey: 'selectPicTable',
      searchFormKey: Date.now(),
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
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
          tooltip: true
        }
      ],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: ''
      },
      searchData: [
        {
          name: 'condition',
          placeholder: `${this.$t('organization.userId')} / ${this.$t(
            'ui.userName1'
          )} / ${this.$t('organization.employeeNo')}`,
          type: 'InputEle'
        }
      ]
    }
  },
  computed: {},
  created() {
    this.selected = this.value
    const { user_status } = this.useDict('user_status')
    this.user_status = user_status || []
  },
  watch: {
    value(selected) {
      this.selected = selected
    },
    selected(selected) {
      this.$emit('update:value', selected)
      if (selected === undefined) return
      this.dispatch('ElFormItem', 'el.form.change', [selected])
    }
  },

  updated() {
    this.selected = this.value
  },
  methods: {
    handleOpen() {
      this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
      this.$$initColumnVisible(this.saveKey, this.columns)
      this.queryParams.condition = ''
      this.queryParams.pageNum = 1
      this.visible = true
      this.getList()
    },
    getList() {
      const vm = this
      const param = this.queryParams
      queryUsers(param)
        .then(response => {
          this.loading = false
          this.total = response.total
          this.tableList = response.rows
          vm.tableList = this.tableList.map(item => {
            const reg = /\(([\w]*)\)/g
            if (reg.test(item.currency)) {
              item.currencyCode = RegExp.$1
            }
            return item
          })
        })
        .catch(err => {
          vm.table_loading = false
          window.console.error(err)
        })
    },
    handleBack() {
      const vm = this
      vm.visible = false
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
    handleRowClick(row) {
      this.$emit('updatePic', row)
      this.visible = false
    }
  },
  emits: ['update:value', 'updatePic']
}
</script>

<style lang="scss" scoped>
.txt-color {
  color: #f66c6c !important;
}
</style>
