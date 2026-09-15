<template>
  <div class="w100">
    <SelectInput
      :value="value"
      :title="value"
      @click="handleClick"
      :disabled="disabled"
      class="w100"
      :clearable="clearable"
      @clear="$emit('clear')"
    />
    <el-dialog
      draggable
      :title="$t('ui.currency')"
      v-model="visible"
      width="1140px"
      :modal="true"
      :close-on-click-modal="false"
      @opened="dlgOpened"
    >
      <search-form
        ref="searchForm"
        :value="queryParams"
        :searchData="searchData"
        :handleQuery="handleSearchForm"
        :resetQuery="resetSearchForm"
        :showCustom="false"
        :showMenu="false"
      />
      <el-table
        border
        ref="tables"
        class="mt10"
        v-loading="loading"
        :data="tableList"
        @sort-change="handleSortChange"
        @row-click="handleRowDbclick"
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
          <el-button type="default" @click="visible = false">{{
            $t('ui.back')
          }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { queryCurrencyList } from '@/api/organization/corporate'
import pageMixin from '@/mixins/tableMinx'

export default {
  mixins: [pageMixin],
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    disabled: [Boolean, String],
    curPath: {
      type: [String],
      default: ''
    },
    clearable: {
      type: [Boolean],
      default() {
        return false
      }
    }
  },
  data() {
    return {
      searchFormKey: Date.now(),
      loading: false,
      // 总条数
      total: 0,
      tableList: [],
      visible: false,
      selected: '',
      selectedRow: {},
      inputVal: '',
      saveKey: 'countryCurrencySelect',
      columns: [
        {
          prop: 'currencyCode',
          label: this.$t('countrySelect.currencyCode'),
          visible: true,
          minWidth: 200,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'currencySymbol',
          label: this.$t('countrySelect.currencySymbol'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'currencyDesc',
          label: this.$t('countrySelect.currencyDesc'),
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
          placeholder: `${this.$t('countrySelect.currencyCode')} / ${this.$t(
            'countrySelect.currencyDesc'
          )}`,
          type: 'InputEle'
        }
      ]
    }
  },
  created() {
    this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
  },
  methods: {
    dlgOpened() {},

    handlePageSizeChangeAndSave(pageSize) {
      const vm = this
      vm.handlePageSizeChange(pageSize)
      vm.$$pageSizeSave('bpmCommonModule', 2, vm.curPath)
    },

    handleClick() {
      if (this.disabled) return
      this.queryParams.condition = ''
      this.queryParams.pageNum = 1
      this.visible = true
      this.tableList = []
      this.getList()
    },

    handleRowDbclick(row) {
      this.visible = false
      this.$emit('select', row)
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
    getList() {
      const vm = this
      const param = this.queryParams
      vm.loading = true
      queryCurrencyList(param)
        .then(response => {
          this.tableList = response.rows
          this.total = response.total
          this.loading = false
        })
        .catch(err => {
          vm.loading = false
          window.console.error(err)
        })
    }
  }
}
</script>
