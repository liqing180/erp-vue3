<template>
  <div class="app-container">
    <search-form
      ref="searchForm"
      :value="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :customSelectData="customSelectData"
      :showCustom="false"
      operator="OR"
      :topShowCount="1"
      @updateSearchData="updateSearchData"
      v-show="showSearch"
    />

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['system:createCodeRule:add']"
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
      ref="tables"
      border
      v-loading="loading"
      :data="tableList"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-dblclick="handleUpdate"
      :max-height="600"
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
        :min-width="item.minWidth"
        :show-overflow-tooltip="item.tooltip"
        :fixed="item.fixed"
        :sortable="item.sortable"
        :align="item.align || 'left'"
        header-align="center"
      >
        <template #default="scope">
          <template v-if="item.prop === 'createdTime'">{{
            parseTime(scope.row.createdTime, fmtForYmdhms)
          }}</template>
          <template v-else-if="item.prop === 'modifiedTime'">{{
            parseTime(scope.row.modifiedTime, fmtForYmdhms)
          }}</template>
          <template v-else-if="item.prop === 'isActive'">
            <el-tag v-if="scope.row.isActive === '1'">{{
              $t('uiBtn.active')
            }}</el-tag>
            <el-tag v-if="scope.row.isActive === '0'" type="danger">{{
              $t('uiBtn.inactive')
            }}</el-tag>
          </template>
          <template v-else>{{ scope.row[item.propBy || item.prop] }}</template>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('ui.action')"
        key="action"
        align="center"
        class-name="small-padding fixed-width"
        width="100"
        fixed="right"
        v-if="editAuth"
      >
        <template #default="scope">
          <div class="flexCen">
            <!-- <i
              class="el-icon-edit pointer mr5"
              style="font-size: 20px; color: #409eff"
              :title="$t('uiBtn.edit')"
              @click="handleUpdate(scope.row)"
            ></i> -->
            <el-icon
              size="20"
              color="#409eff"
              class="pointer ml5"
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
import { queryCodeRuleList, querySearchList } from '@/api/system/createCodeRule'
import pageMixin from '@/mixins/tableMinx'

export default {
  name: 'CreateCodeRule',
  mixins: [pageMixin],
  data() {
    const vm = this
    return {
      saveKey: '1',
      btnLoading: false,
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 岗位表格数据
      tableList: [],
      columns: [
        {
          prop: 'ruleType',
          propBy: 'ruleTypeShowStr',
          label: vm.$t('ui.ruleCode'),
          visible: true,
          sortable: 'custom',
          minWidth: 200,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'template',
          label: vm.$t('ui.template'),
          minWidth: 160,
          visible: true,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'description',
          label: vm.$t('ui.description'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'prefix',
          label: vm.$t('ui.prefix'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'dateType',
          label: vm.$t('ui.ruleDate'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'length',
          label: vm.$t('ui.serialLength'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'createdBy',
          label: vm.$t('ui.createdBy'),
          minWidth: 160,
          visible: true,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'createdTime',
          label: vm.$t('ui.createdTime'),
          minWidth: 160,
          visible: true,
          tooltip: true,
          sortable: 'custom'
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
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: undefined
      },
      searchData: [
        {
          name: 'condition',
          type: 'InputEle',
          placeholder: `${vm.$t('ui.prefix')}`
        },
        {
          name: 'ruleTypeList',
          label: vm.$t('ui.ruleCode'),
          type: 'MultipleSelectEle',
          width: '200px',
          selectValue: 'ruleType',
          selectLabel: 'ruleTypeShowStr',
          filterable: true,
          selectData: []
        }
      ],
      // 自定义搜索
      customSelectData: [
        {
          label: vm.$t('ui.remarks'),
          value: 'remarks',
          type: 'InputEle',
          maxlength: 200,
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('ui.ruleCode'),
          value: 'ruleType',
          type: 'ComplexArrayMultipleSelectEle',
          selectValue: 'ruleType',
          selectLabel: 'ruleTypeShowStr',
          selectData: [],
          operator: 'in'
        },
        {
          label: vm.$t('ui.createdBy'),
          value: 'createdBy',
          type: 'InputEle',
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('ui.createdTime'),
          value: 'createdTime',
          type: 'DatePickerEle',
          format: 'timestamp',
          disabled: false,
          startDate: 'startCreatedTime',
          endDate: 'endCreatedTime',
          operator: 'between'
        },
        {
          label: vm.$t('ui.modifiedBy'),
          value: 'modifiedBy',
          type: 'InputEle',
          disabled: false,
          operator: 'contains'
        },
        {
          label: vm.$t('ui.modifiedTime'),
          value: 'modifiedTime',
          type: 'DatePickerEle',
          format: 'timestamp',
          disabled: false,
          startDate: 'startModifiedTime',
          endDate: 'endModifiedTime',
          operator: 'between'
        }
      ]
    }
  },
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
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['system:createCodeRule:edit'])
    }
  },
  methods: {
    /** 查询岗位列表 */
    getList() {
      this.querySearchList()
      this.loading = true
      let params = { ...this.queryParams }
      params = this.$trimOfObj(params)
      queryCodeRuleList(params).then(response => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    querySearchList() {
      querySearchList({}).then(res => {
        console.log(res)
        const { ruleTypeList } = res.data || {}
        this.searchData.forEach(item => {
          if (item.name === 'ruleTypeList') {
            item.selectData = ruleTypeList
          }
        })
        this.customSelectData.forEach(item => {
          if (item.value === 'ruleType') {
            item.selectData = ruleTypeList
          }
        })
      })
    },
    /** 搜索 */
    handleSearchForm(query) {
      const param = this.$trimOfObj(query)
      this.queryParams = { ...param }
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
    updateSearchData(e) {
      if (e.childType === 'select') {
        this.searchData[e.index].selectId = e.value
        this.searchData[e.index].date = []
      } else {
        this.searchData[e.index].date = e.value
      }
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.postId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({
        path: '/system/addCodeRule',
        query: {
          timeId: Date.now()
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row, column) {
      if (column && column.type === 'selection') {
        return
      }
      this.$router.push({
        path: '/system/editCodeRule',
        query: {
          timeId: Date.now(),
          id: row.codeRuleId
        }
      })
    }
  }
}
</script>
