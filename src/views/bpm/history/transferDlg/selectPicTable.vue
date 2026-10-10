<template>
  <el-dialog
    draggable
    :title="$t('ui.user')"
    v-model="visible"
    width="1140px"
    append-to-body
    :modal="true"
    :close-on-click-modal="false"
    @close="close"
  >
    <div v-dialogDragWidth>
      <search-form
        ref="searchForm"
        v-model="queryParams"
        :searchData="searchData"
        :handleQuery="handleSearchForm"
        :resetQuery="resetSearchForm"
        :showCustom="false"
        :showMenu="false"
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
        :max-height="tableMaxHeight"
        @selection-change="handleSelectionChange"
        :row-class-name="'pointer'"
      >
        <!-- <el-table-column type="selection" width="55" :selectable="selectable" align="center" /> -->
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
    </div>
    <template #footer
      ><div class="dialog-footer">
        <el-button @click="handleBack">{{ $t('ui.back') }}</el-button>
        <!-- <el-button type="primary" :disabled="ids.length <= 0" @click="submit"
        >{{ $t('uiBtn.submit') }}
      </el-button> -->
      </div></template
    >
  </el-dialog>
</template>

<script>
import i18n from '@/lang'

import pageMixin from '@/mixins/tableMinx'
import { queryUsersNeedSameLegalEntity } from '@/api/organization/corporate'
import locale from '@/lang/organization'

export default {
  emits: ['updatePic'],
  directives: {
    // transferDom
  },
  dicts: ['user_status'],
  mixins: [pageMixin],
  props: {},

  data() {
    return {
      saveKey: '3',
      savePath: 'bpmTable',
      searchFormKey: Date.now(),
      loading: false,
      // 显示搜索条件
      showSearch: true,
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      selectList: [],
      // 总条数
      total: 0,
      tableList: [],
      tableMaxHeightResize: true,
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
          propBy: 'statusStr',
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
          placeholder: `${this.$t('organization.userId')} / ${this.$t('ui.userName1')} / ${this.$t(
            'organization.employeeNo'
          )}`,
          type: 'InputEle'
        }
      ],
      alreadySelectUserIdList: []
    }
  },
  computed: {},

  beforeCreate() {
    i18n.global.mergeLocaleMessage('zh', locale.zh)
    i18n.global.mergeLocaleMessage('en', locale.en)
  },
  created() {
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
  },

  methods: {
    handleOpen(selectList = [], todoUserIdList) {
      if (selectList.length > 0) {
        this.selectList = JSON.parse(JSON.stringify(selectList))
      }
      this.alreadySelectUserIdList = todoUserIdList || []
      this.queryParams.condition = ''
      this.queryParams.pageNum = 1
      this.visible = true
      this.getList()
    },
    getList() {
      const vm = this
      const param = this.queryParams
      param.alreadySelectUserIdList = this.alreadySelectUserIdList
      this.loading = true
      this.$trimOfObj(param)
      queryUsersNeedSameLegalEntity(param)
        .then(response => {
          const rows = response.rows || []
          rows.forEach(item => {
            item.statusStr =
              this.selectDictLabel(this.dict.type.user_status, item.status) +
              'AA'
          })
          this.tableList = rows
          this.loading = false
          this.total = response.total
          this.$$getColumnContentMaxWidth(this.columns, this.tableList)

          /* this.$nextTick(() => {
            this.selectList.forEach((row) => {
              this.tableList.forEach((item) => {
                if (row.userId === item.userId) {
                  this.$refs.tables.toggleRowSelection(item, true)
                }
              })
            })
          }) */
        })
        .catch(err => {
          vm.loading = false
          window.console.error(err)
        })
    },
    onDictReady() {
      this.tableList.forEach(item => {
        item.statusStr =
          this.selectDictLabel(this.dict.type.user_status, item.status) + 'AA'
      })
      this.$$getColumnContentMaxWidth(this.columns, this.tableList)
    },
    selectable() {
      return true // 不禁用
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId)
      this.selectList = [...selection]
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleRowClick(row) {
      this.$emit('updatePic', [row])
      this.visible = false
      /* const index = this.selectList.findIndex((item) => item.userId === row.userId)
      const isSelected = index > -1
      if (isSelected) {
        this.selectList.splice(index, 1)
      } else {
        this.selectList.push(row)
      }
      this.ids = this.selectList.map((item) => item.userId)
      this.$refs.tables.toggleRowSelection(row, !isSelected) */
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
    close() {
      this.$refs.tables.clearSelection()
    },
    submit() {
      this.$emit('updatePic', this.selectList)
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
