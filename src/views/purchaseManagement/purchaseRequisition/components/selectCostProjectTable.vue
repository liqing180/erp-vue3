<template>
  <el-dialog
    draggable
    :title="$t('menu.project')"
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
          <template v-else-if="item.prop === 'actualCost'">
            {{ $numberStr(scope.row[item.prop], 2) }}
          </template>
          <template v-else-if="item.prop === 'salesAmount'">
            {{ $numberStr(scope.row[item.prop], 2) }}
          </template>
          <template v-else-if="item.prop === 'profit'">
            {{ $numberStr(scope.row[item.prop], 2) }}
          </template>
          <template v-else-if="item.prop === 'profitMargin'">
            {{ $numberStr(scope.row[item.prop], 2) }}
          </template>
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
import { queryCanSelectCostProjectListForPage } from '@/api/projectManagement/project'
import locale from '@/views/productManagement/lang/index'
import i18n from '@/lang'
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
    const vm = this

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
          prop: 'costProjectCode',
          label: vm.$t('PRODUCT.projectNameNo'),
          visible: true,
          minWidth: 140,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'costProjectName',
          label: vm.$t('PRODUCT.projectName'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'receiveAddress',
          label: vm.$t('ui.address'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          sortable: 'custom'
        },
        {
          prop: 'costProjectDescription',
          label: vm.$t('PRODUCT.projectDescription'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'businessPartnerName',
          label: vm.$t('SALES.customer'),
          visible: true,
          minWidth: 200,
          padding: 50,
          tooltip: true
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

      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: ''
      },
      searchData: [
        {
          name: 'condition',
          placeholder: `${vm.$t('PRODUCT.projectTemplateSearch')} / ${vm.$t('SALES.customerName')}`,
          type: 'InputEle'
        }
      ]
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  beforeCreate() {
    i18n.global.mergeLocaleMessage('zh', locale.zh)
    i18n.global.mergeLocaleMessage('en', locale.en)
  },
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
      this.loading = true
      queryCanSelectCostProjectListForPage(param)
        .then(response => {
          this.loading = false
          this.total = response.total

          const rows = response.rows || []
          rows.forEach(item => {
            item.createdTime = this.parseTime(
              item.createdTime,
              this.fmtForYmdhms
            )
            item.modifiedTime = this.parseTime(
              item.modifiedTime,
              this.fmtForYmdhms
            )
          })
          this.tableList = rows

          this.$$getColumnContentMaxWidth(this.columns, this.tableList)
        })
        .catch(err => {
          vm.loading = false
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
