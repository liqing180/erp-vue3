<template>
  <div class="pb20">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          v-if="!comDisFrom"
          @click="handleAdd"
          >{{ $t('uiBtn.add') }}</el-button
        >
      </el-col>
      <right-toolbar
        class="mr5"
        :showSearchBtn="false"
        :showRefreshBtn="false"
        :saveKey="saveKey"
        :columns="configColumn"
        v-if="false"
      ></right-toolbar>
    </el-row>
    <el-table border ref="tables" :row-key="rowIdKey" :data="tableList">
      <!-- <el-table-column
        type="index"
        key="index"
        :label="$t('ui.sn')"
        width="60"
        fixed="left"
        align="center"
        class-name="allowDrag"
      >
        <template v-slot="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column> -->
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
          <template v-if="item.prop === 'isDefault'">
            <el-tag v-if="scope.row.isDefault === '1'">{{ $t('ui.y') }}</el-tag>
            <el-tag v-if="scope.row.isDefault === '0'" type="danger">{{
              $t('ui.n')
            }}</el-tag>
          </template>
          <template v-else-if="item.prop === 'isActive'">
            <el-tag v-if="scope.row.isActive === '1'">{{
              $t('uiBtn.active')
            }}</el-tag>
            <el-tag v-if="scope.row.isActive === '0'" type="danger">{{
              $t('uiBtn.inactive')
            }}</el-tag>
          </template>
          <template v-else-if="item.prop === 'estQuotationAmount'">
            {{ $numberStr(scope.row.estQuotationAmount, 2) }}
          </template>
          <template v-else>{{ scope.row[item.propBy || item.prop] }}</template>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!comDisFrom"
        :label="$t('ui.action')"
        align="center"
        min-width="120"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template v-slot="scope">
          <div class="flexCen">
            <el-icon
              :title="$t('uiBtn.edit')"
              @click="handleTermRowClick(scope.row)"
              :size="20"
              color="#409eff"
              class="pointer mr5"
            >
              <Edit />
            </el-icon>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <addCompetitorTable
      ref="addCompetitorTable"
      :salesOpportunityId="salesOpportunityId"
      @onSuccess="getList"
    />
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import addCompetitorTable from './addCompetitorTable'
import { queryCompetitorList } from '@/api/salesOpportunity/salesOpportunity'
export default {
  props: {
    comDisFrom: {
      type: Boolean,
      default: false
    },
    salesOpportunityId: {
      type: String,
      default: ''
    }
  },
  components: { addCompetitorTable },
  mixins: [pageMixin],
  data() {
    const vm = this
    return {
      saveKey: '3',
      columns: [
        {
          prop: 'competitorName',
          label: vm.$t('customer.competitorName'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'competitorCode',
          label: vm.$t('customer.competitorCode'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'companyRegNo',
          label: vm.$t('ui.companyRegNo'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'estQuotationAmount',
          label: vm.$t('customer.estQuotationAmount'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          align: 'right'
        },
        {
          prop: 'website',
          label: vm.$t('ui.website'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'treatLevel',
          propBy: 'treatLevelShowStr',
          label: vm.$t('customer.treatLevel'),
          minWidth: 140,
          visible: true,
          tooltip: true
        },
        {
          prop: 'country',
          label: vm.$t('ui.country'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'registeredAddress',
          label: vm.$t('ui.address'),
          minWidth: 140,
          visible: true,
          tooltip: true
        },
        {
          prop: 'remarks',
          label: vm.$t('ui.remarks'),
          minWidth: 140,
          visible: true,
          tooltip: true
        }
      ],
      tableList: [],
      selected: [],
      rowIdKey: 'rowTimeId',
      treat_level: []
    }
  },
  created() {},
  methods: {
    async init() {
      const { treat_level } = await this.useDict('treat_level')
      this.treat_level = treat_level || []
      this.getList()
    },
    getList() {
      queryCompetitorList({ salesOpportunityId: this.salesOpportunityId }).then(
        res => {
          this.tableList = res.data || []
          this.tableList.forEach(item => {
            item.treatLevelShowStr = this.selectDictLabel(
              this.treat_level,
              item.treatLevel
            )
          })
        }
      )
    },
    handleTermRowClick(dataRow) {
      const vm = this
      const params = JSON.parse(JSON.stringify(dataRow))
      this.$refs.addCompetitorTable.handleUpdate(params)
    },
    /* 表格表单部分 */
    reset() {
      this.tableList = []
      this.selected = []
    },
    handleAdd() {
      this.$refs.addCompetitorTable.handleAdd()
    }
  }
}
</script>
