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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          v-hasPermi="['system:emailTemplate:add']"
          @click="handleAdd"
          >{{ $t('uiBtn.add') }}</el-button
        >
      </el-col>

      <right-toolbar
        :saveKey="saveKey"
        v-model:showSearch="showSearch"
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
      max-height="600"
      @sort-change="handleSortChange"
      @row-dblclick="handleUpdate"
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
          <el-switch
            v-if="item.prop === 'isActive'"
            v-model:value="scope.row.isActive"
            active-value="1"
            inactive-value="0"
            :disabled="true"
          ></el-switch>
          <template v-else-if="item.prop === 'isDefault'">
            <el-tag v-if="scope.row.isDefault === '1'">{{ $t('ui.y') }}</el-tag>
            <el-tag v-if="scope.row.isDefault === '0'" type="danger">{{
              $t('ui.n')
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
      <el-table-column
        :label="$t('ui.action')"
        align="center"
        width="100"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template v-slot="scope">
          <div class="flexCen">
            <el-icon
              size="20"
              color="#409eff"
              class="pointer ml5"
              v-hasPermi="['system:emailTemplate:edit']"
              @click="handleUpdate(scope.row)"
            >
              <EditPen />
            </el-icon>
          </div>
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
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import {
  querySysEmailTemplateList,
  queryUserTemplateFor
} from '@/api/system/emailManagement'

export default {
  mixins: [pageMixin],
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
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        dateRange: []
      },
      columns: [
        {
          prop: 'templateNo',
          label: vm.$t('ETM.templateNo'),
          visible: true,
          sortable: 'custom',
          fixed: true,
          minWidth: 180,
          tooltip: true
        },
        {
          prop: 'templateForShow',
          label: vm.$t('ETM.templateFor'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'templateSubject',
          label: vm.$t('ETM.subject'),
          minWidth: 240,
          visible: true,
          tooltip: true
        },
        {
          prop: 'isDefault',
          label: vm.$t('ETM.isDefault'),
          visible: true,
          sortable: 'custom',
          minWidth: 130,
          tooltip: true
        },
        {
          prop: 'createdBy',
          label: vm.$t('ui.createdBy'),
          minWidth: 140,
          visible: true,
          tooltip: true
        },
        {
          prop: 'createdTime',
          label: vm.$t('ui.createdTime'),
          minWidth: 170,
          visible: true
        },
        {
          prop: 'modifiedBy',
          label: vm.$t('ui.modifiedBy'),
          minWidth: 140,
          visible: true
        },
        {
          prop: 'modifiedTime',
          label: vm.$t('ui.modifiedTime'),
          minWidth: 170,
          visible: true
        }
      ],
      templateForList: [],
      searchData: [
        {
          name: 'condition',
          type: 'InputEle',
          placeholder: `${vm.$t('ETM.templateNo')} / ${vm.$t('ETM.subject')}`
        },
        {
          name: 'templateFor',
          label: vm.$t('ETM.templateFor'),
          type: 'SelectEle',
          width: '200px',
          selectValue: 'dicName',
          selectLabel: 'dicDesc',
          selectData: []
        }
        // {
        //   name: 'dateRange',
        //   label: vm.$t('ui.createdTime'),
        //   type: 'DatePickerEleShortcuts',
        //   startDate: 'startDateCreatedTime',
        //   endDate: 'endDateCreatedTime'
        // }
      ]
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },

  created() {
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.getList()
    this.queryUserTemplateFor()
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      for (const item of this.ids.values()) {
        if (item === row.userId) {
          color = 'table-SelectedRow-bgcolor'
        }
      }
      return color
    },

    getList() {
      const vm = this
      let param = { ...this.queryParams }
      param = this.$trimOfObj(param)
      this.loading = true
      querySysEmailTemplateList(param)
        .then(response => {
          const tableList = response.rows || []
          vm.tableList = tableList.map(item => {
            const dom = document.createElement('p')
            dom.innerHTML = item.templateContent
            item.templateContentShow = dom.innerText
            return item
          })
          this.total = response.total
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    queryUserTemplateFor() {
      queryUserTemplateFor().then(res => {
        this.searchData[1]['selectData'] = res.data || []
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
    handleAdd(row) {
      this.$router.push({
        path: '/system/emailManagement/addEmailTemplate',
        query: { id: row.id, timeId: +new Date() }
      })
    },
    // 修改
    handleUpdate(row) {
      this.$router.push({
        path: '/system/emailManagement/editEmailTemplate',
        query: { id: row.id, timeId: +new Date() }
      })
    }
  }
}
</script>
