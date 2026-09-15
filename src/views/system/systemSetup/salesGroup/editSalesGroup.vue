<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        :disabled="fullscreenLoading"
        @click="submitForm"
        v-if="!comDisFrom"
        >{{ $t('uiBtn.submit') }}
      </el-button>
      <el-button type="primary" @click="cancel" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>
    <template v-slot:content>
      <el-collapse v-model="activeNames">
        <div class="form-card">
          <el-collapse-item name="1">
            <template v-slot:title>
              <FormCollapseItemTitle
                :title="$t('ui.basicInfo')"
                :warning="collapseWarningForBasicInfo"
              >
              </FormCollapseItemTitle>
            </template>
            <el-form
              ref="createForm"
              :model="createForm"
              :rules="createRules"
              label-width="195px"
              :disabled="comDisFrom"
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('SALES.salesGroup')}`"
                    prop="salesGroupName"
                  >
                    <el-input
                      v-model="createForm.salesGroupName"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item :label="$t('organization.branchCompany')">
                    <el-input
                      :value="createForm.departmentNameListShowStr"
                      :title="createForm.departmentNameListShowStr"
                      disabled
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item :label="`${$t('SALES.salesGroupCode')}`">
                    <el-input v-model="createForm.salesGroupNo" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="`${$t('ui.remarks')}`" prop="remarks">
                    <el-input
                      type="textarea"
                      v-model="createForm.remarks"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                      resize="none"
                      show-word-limit
                      :maxlength="3000"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="2">
            <template v-slot:title>
              <FormCollapseItemTitle
                :title="$t('SALES.teamMembers')"
                :warning="collapseWarningForTeamMembers"
              >
              </FormCollapseItemTitle>
            </template>
            <div class="pb20">
              <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                  <el-button
                    @click="handleAddBtn"
                    v-if="!comDisFrom"
                    type="primary"
                    icon="Plus"
                    size="small"
                    :disabled="!createForm.superiorId"
                    >{{ $t('uiBtn.add') }}</el-button
                  >
                </el-col>
                <el-col :span="1.5">
                  <el-button
                    v-if="!comDisFrom"
                    :disabled="selected.length <= 0"
                    @click="handleDelete"
                    type="danger"
                    icon="Delete"
                    size="small"
                    >{{ $t('uiBtn.delete') }}</el-button
                  >
                </el-col>
                <right-toolbar
                  :showSearchBtn="false"
                  :showRefreshBtn="false"
                  :saveKey="saveKey"
                  :columns="configColumn"
                ></right-toolbar>
              </el-row>
              <el-table
                border
                ref="tables"
                :row-key="rowIdKey"
                :row-class-name="tableRowClassName"
                :data="tableList"
                @select="handleSelectionChange"
                @select-all="handleSelectAll"
                max-height="600"
              >
                <el-table-column
                  v-if="!comDisFrom"
                  type="selection"
                  align="center"
                  width="55"
                ></el-table-column>
                <el-table-column
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
                  <template v-slot:header="{ column }">
                    <!-- <span v-if="item.prop === 'postId'">
                            <span style="color: #ff4949; margin-right: 4px">*</span>{{ column.label }}
                          </span>
                          <span v-else>{{ column.label }}</span> -->
                    {{ column.label }}
                  </template>
                  <template v-slot="scope">
                    <template v-if="item.prop === 'isPic'">
                      <el-switch
                        v-model="scope.row.isPic"
                        :disabled="comDisFrom"
                        active-value="1"
                        inactive-value="0"
                        v-if="!comDisFrom"
                      ></el-switch>
                      <template v-else>
                        <el-tag v-if="scope.row.isPic === '1'">{{
                          $t('ui.y')
                        }}</el-tag>
                        <el-tag v-if="scope.row.isPic === '0'" type="danger">{{
                          $t('ui.n')
                        }}</el-tag>
                      </template>
                    </template>
                    <template v-else-if="item.prop === 'isActive'">
                      <el-switch
                        v-model="scope.row.isActive"
                        :disabled="comDisFrom"
                        active-value="1"
                        inactive-value="0"
                        v-if="!comDisFrom"
                      ></el-switch>
                      <template v-else>
                        <el-tag v-if="scope.row.isActive === '1'">{{
                          $t('ui.y')
                        }}</el-tag>
                        <el-tag
                          v-if="scope.row.isActive === '0'"
                          type="danger"
                          >{{ $t('ui.n') }}</el-tag
                        >
                      </template>
                    </template>
                    <template v-else-if="item.prop === 'remarks'">
                      <span v-if="comDisFrom">{{ scope.row.remarks }}</span>
                      <el-input
                        v-else
                        style="width: 98%"
                        :title="scope.row.remarks"
                        v-model="scope.row.remarks"
                        :maxlength="200"
                      />
                    </template>
                    <template v-else>{{ scope.row[item.prop] }}</template>
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
                        class="pointer"
                        color="#f56c6c"
                        :size="20"
                        :title="$t('uiBtn.delete')"
                        @click="handleDelRow(scope.$index, scope.row)"
                      >
                        <Delete />
                      </el-icon>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>
        </div>

        <div class="form-card mt10">
          <el-collapse-item name="3">
            <template v-slot:title>
              <FormCollapseItemTitle :title="$t('ui.systemOperationLog')">
                <template v-if="createForm.operationLogForLast">
                  <span
                    v-if="createForm.operationLogForLast.operatorBy"
                    class="info-item mr20"
                    :title="createForm.operationLogForLast.operatorBy"
                  >
                    {{ $t('ui.operName') }} :
                    {{ createForm.operationLogForLast.operatorBy }}
                  </span>
                  <span
                    v-if="createForm.operationLogForLast.operatorTime"
                    class="info-item"
                  >
                    {{ $t('ui.operTime') }} :
                    {{ parseTime(createForm.operationLogForLast.operatorTime) }}
                  </span>
                </template>
              </FormCollapseItemTitle>
            </template>
            <div class="pb20">
              <SystemOperationLogTable
                :tableList="createForm.operationLogList || []"
              />
            </div>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>
    <selectPicTable
      ref="selectPicTable"
      :topDepartmentId="createForm.superiorId"
      @select="updateTable"
    />
  </FormPageLayout>
</template>

<script>
import {
  querySalesGroupById,
  updateSalesGroup
} from '@/api/system/systemSetup/salesGroup'

import selectPicTable from './selectPicTable.vue'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'

import pageMixin from '@/mixins/tableMinx'
export default {
  mixins: [pageMixin],
  name: 'AddSalesGroup',
  components: {
    selectPicTable,
    SystemOperationLogTable
  },
  data() {
    const vm = this
    return {
      saveKey: '1',
      fullscreenLoading: false,
      propVal: 'currencyCode',
      activeNames: ['1', '2', '3'],
      createForm: {
        salesGroupName: '',
        legalEntity: '',
        picUserName: '',
        remarks: '',
        createdBy: this.$store.state.user.nickName,
        postIdList: []
      },
      createRules: {
        superiorId: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        salesGroupName: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],

            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ],
        postIdList: [
          {
            type: 'array',
            required: false,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change'],

            pattern: new RegExp(/^(?!(\s+$))/g)
          }
        ]
      },
      timeId: '',
      collapseWarningForBasicInfo: false,
      collapseWarningForTeamMembers: false,

      tableList: [],
      selected: [],
      rowIdKey: 'userId',
      /* 表格部分 */
      columns: [
        {
          prop: 'nickName',
          label: vm.$t('SALES.name'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'departmentNames',
          label: this.$t('ui.dept'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'postNames',
          label: this.$t('ui.position'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'isPic',
          label: vm.$t('SALES.pic'),
          visible: true,
          minWidth: 200,
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
          prop: 'email',
          label: this.$t('organization.email'),
          visible: true,
          minWidth: 170,
          tooltip: true
        },
        {
          prop: 'isActive',
          label: vm.$t('ui.isActive'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'remarks',
          label: vm.$t('ui.remarks'),
          visible: true,
          width: 200,
          tooltip: true
        }
      ]
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['systemSetup:salesGroup:edit'])
    },
    comDisFrom() {
      return !this.editAuth
    }
  },
  created() {
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.queryDepartmentById()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.rowId = this.$route.query.id
      this.reset()
      this.queryDepartmentById()
    }
  },
  methods: {
    queryDepartmentById() {
      querySalesGroupById({ salesGroupId: this.rowId }).then(res => {
        const data = res.data || {}
        const departmentIdList = data.departmentIdList || []
        data.superiorId = departmentIdList[0]
        this.createForm = data
        this.tableList = data.salesGroupUserList || []
        this.$$getColumnContentMaxWidth(this.columns, this.tableList)
      })
    },
    /* 表格 Start */
    handleAddBtn() {
      const alreadySelectIdList = this.tableList.map(
        item => item[this.rowIdKey]
      )
      this.$refs.selectPicTable.handleAdd(alreadySelectIdList)
    },
    updateTable(list) {
      const rows = JSON.parse(JSON.stringify(list))
      rows.forEach(item => {
        item.isActive = '1'
      })
      this.tableList = [...this.tableList, ...rows]
      if (this.tableList.length === 1) {
        const item = this.tableList[0]
        item['isPic'] = '1'
        item['isActive'] = '1'
      }
      this.$$getColumnContentMaxWidth(this.columns, this.tableList)

      this.$nextTick(() => {
        this.selected.forEach(row => {
          this.tableList.forEach(item => {
            if (row[this.rowIdKey] === item[this.rowIdKey]) {
              this.$refs.tables.toggleRowSelection(item, true)
            }
          })
        })
      })
    },
    /* 选中多个删除 */
    handleDelete() {
      this.$modal
        .confirm(this.$t('ui.delConfirm'))
        .then(() => {
          this.tableList = this.tableList.filter(row => {
            if (
              this.selected.find(
                item => item[this.rowIdKey] === row[this.rowIdKey]
              )
            ) {
              return false
            }
            return true
          })
          this.selected = []
        })
        .catch(() => {})
    },
    /* 行删除 */
    handleDelRow(index, row) {
      this.$modal.confirm(this.$t('ui.delConfirm')).then(() => {
        this.tableList.splice(index, 1)
        const findIndex = this.selected.findIndex(
          item => item[this.rowIdKey] === row[this.rowIdKey]
        )
        if (findIndex !== -1) {
          this.selected.splice(findIndex, 1)
        }
      })
    },
    /* 表格全选 */
    handleSelectAll(selection) {
      const vm = this
      if (selection.length) {
        // 去重添加
        const curSelectedIds = this.selected.map(d => d[this.rowIdKey])
        selection.forEach(item => {
          if (!curSelectedIds.includes(item[this.rowIdKey])) {
            vm.selected.push(item)
          }
        })
      } else {
        // 删除table中在selection 中缓存的内容
        const delArr = this.tableList.map(item => item[this.rowIdKey])
        vm.selected = vm.selected.filter(
          item => !delArr.includes(item[this.rowIdKey])
        )
      }
    },
    /* 行单个选择 */
    handleSelectionChange(selection, row) {
      const vm = this
      for (let i = 0; i < vm.selected.length; i++) {
        if (vm.selected[i][this.rowIdKey] === row[this.rowIdKey]) {
          return vm.selected.splice(i, 1)
        }
      }
      vm.selected.push(row)
    },
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      const cur = this.selected.find(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      if (cur) {
        color = 'table-SelectedRow-bgcolor'
      }
      return color
    },

    saveBusinessGroup(param) {
      const vm = this
      vm.fullscreenLoading = true
      param.isTopDepartment = 1
      updateSalesGroup(param)
        .then(() => {
          vm.$message.success(
            `${vm
              .$t('SALES.salesGroupSuccess')
              .replace('$1', `${param.salesGroupName}`)}`
          )
          this.cancel()
          vm.fullscreenLoading = false
        })
        .catch(() => {
          vm.fullscreenLoading = false
        })
    },
    reset() {
      this.activeNames = ['1', '2', '3']
      this.createForm = {
        departmentName: '',
        branchCompany: '',
        legalEntity: '',
        picUserName: '',
        picUserId: '',
        mobilePhone: '',
        mobileCode: '',
        mobileNum: '',
        email: '',
        remarks: '',
        createdBy: this.$store.state.user.nickName,
        postIdList: []
      }
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForTeamMembers = false
      this.resetForm('createForm')
    },
    submitForm() {
      const vm = this
      this.$refs.createForm.validate(valid => {
        this.collapseWarningForBasicInfo = !valid
        if (!valid) {
          this.$message.error(
            this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
          )
          return
        }
        let param = JSON.parse(JSON.stringify(vm.createForm))
        param.departmentIdList = [param.superiorId]
        param.salesGroupUserList = this.tableList
        param = vm.$trimOfObj(param)
        const valid1 = this.validDetailList(param.salesGroupUserList)
        this.collapseWarningForTeamMembers = !valid1
        if (!valid1) return
        this.$modal.confirm(vm.$t('SALES.salesGroupConfirm')).then(() => {
          vm.saveBusinessGroup(param)
        })
      })
    },
    validDetailList(list) {
      const vaild = false
      if (list.length <= 0) {
        this.$message.error(this.$t('SALES.teamMembersEmpty'))
        return vaild
      }
      const Active = list.find(
        item => item.isPic === '1' && item.isActive === '1'
      )
      if (!Active) {
        this.$message.error(this.$t('SALES.teamMembersLeastOneActive'))
        return vaild
      }
      return true
    },
    // 取消按钮
    cancel() {
      if (this.isView) {
        this.$tab.closePage()
        return
      }
      if (this.$route.query.backType === '2') {
        this.$tab.closePage()
        return
      }
      const obj = { path: '/system/systemSetup/salesGroup' }
      this.$tab.closeOpenPage(obj)
    }
  },
  emits: ['update:value']
}
</script>
