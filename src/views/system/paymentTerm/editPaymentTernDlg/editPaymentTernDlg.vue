<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('menu.editPaymentTerm')"
    v-model="dialogVisible"
    width="1000px"
    top="5vh"
    @closed="closed"
  >
    <div v-dialogDragWidth>
      <div class="pb20">
        <el-row :gutter="10" class="mb8" v-if="false">
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="Plus"
              size="small"
              @click="handleAddStage({})"
              >{{ $t('uiBtn.add') }}</el-button
            >
          </el-col>
        </el-row>
        <el-table
          border
          ref="tables"
          :row-key="rowIdKey"
          :row-class-name="tableRowClassName"
          :tree-props="{ children: 'childList', hasChildren: 'hasChildren' }"
          :data="tableList"
          default-expand-all
          @row-dblclick="handleDblclick"
          @select="handleSelectionChange"
          @select-all="handleSelectAll"
          :key="tableKey"
          style="cursor: pointer"
        >
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
              <template v-if="item.prop === 'stageName'">
                <span
                  v-if="
                    (scope.row.childList || []).length <= 0 &&
                    scope.row.levelNum === 1 &&
                    existLevel2
                  "
                  style="display: inline-block; width: 23px"
                ></span>
                <span
                  v-if="
                    (scope.row.childList || []).length <= 0 &&
                    scope.row.levelNum === 2
                  "
                  style="display: inline-block; width: 4px"
                ></span>
                <span
                  :data-stage-row-id="scope.row.rowTimeId"
                  style="
                    display: inline-block;
                    margin-right: 4px;
                    font-size: 14px;
                    font-weight: bold;
                    color: #409eff;
                  "
                  >{{ scope.row.stage + '. ' }}</span
                >
                {{ `${scope.row[item.prop]}` }}
              </template>
              <el-tag
                v-else-if="
                  item.prop === 'downPayment' || item.prop === 'goodsIssue'
                "
                :type="scope.row[item.prop] === '1' ? '' : 'info'"
                >{{
                  scope.row[item.prop] === '1'
                    ? $t('uiBtn.yes')
                    : $t('uiBtn.no')
                }}</el-tag
              >
              <template v-else-if="item.prop === 'days'">{{
                $numberStr(scope.row[item.prop], 0)
              }}</template>
              <template v-else-if="item.prop === 'trigger'">
                <span v-if="scope.row.trigger">
                  {{
                    selectDictLabel(
                      dict.type.payment_term_detail_trigger,
                      scope.row[item.prop]
                    )
                  }}
                </span>
                <span v-else>
                  {{
                    selectDictLabel(
                      dict.type
                        .payment_term_detail_trigger_civil_works_progress_milestone,
                      scope.row.triggerCivilWorksProgressMilestone
                    )
                  }}
                </span>
              </template>
              <template v-else-if="item.prop === 'dueBasis'">
                {{
                  selectDictLabel(
                    dict.type.payment_term_detail_due_basis,
                    scope.row[item.prop]
                  )
                }}
              </template>
              <template v-else-if="item.prop === 'triggerDescription'">
                <DescriptionToolTipShow :showStr="scope.row[item.prop]" />
              </template>
              <template v-else-if="item.prop === 'stageDescription'">
                <DescriptionToolTipShow :showStr="scope.row[item.prop]" />
              </template>
              <template v-else-if="item.prop === 'percentage'">
                <div>
                  <el-input-number
                    style="width: 98%"
                    v-model="scope.row.percentage"
                    placeholder="1 - 100"
                    controls-position="right"
                    v-thousandSplit="{ precision: 0 }"
                    :precision="0"
                    :min="1"
                    :max="100"
                    @change="percentageChange(scope.row)"
                  />
                </div>
              </template>

              <template v-else>{{ scope.row[item.prop] }}</template>
            </template>
          </el-table-column>
          <el-table-column
            v-if="!comDisStage"
            :label="$t('ui.action')"
            key="action"
            align="center"
            width="120"
            class-name="small-padding fixed-width"
            fixed="right"
          >
            <template #default="scope">
              <el-icon
                class="pointer"
                style="font-size: 20px; color: #409eff"
                :title="$t('uiBtn.edit')"
                @click="handleEditStage(scope.row)"
                ><Edit
              /></el-icon>
            </template>
          </el-table-column>
        </el-table>
        <el-form
          class="mt20"
          @submit.prevent
          label-width="110px"
          :disabled="comDisFrom"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item :label="$t('ui.remarks')">
                <MyInput
                  type="textarea"
                  v-model="form.remarks"
                  :title="form.remarks"
                  :autosize="{ minRows: 4, maxRows: 8 }"
                  resize="none"
                  show-word-limit
                  :maxlength="3000"
                ></MyInput>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    <addStageFormDlg
      ref="addStageFormDlg"
      :isFormEdit="true"
      @onSuccess="updateStage"
      :comDisFrom="comDisStage"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">{{
          $t('uiBtn.back')
        }}</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitLoading"
          >{{ $t('uiBtn.save') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import stageDragMixin from '../stageDragMixin'
import addStageFormDlg from './addStageFormDlg'

export default {
  dicts: [
    'payment_term_status',
    'payment_term_type',
    'business_partner_payment_method',
    'payment_term_purpose',
    'payment_term_detail_trigger',
    'payment_term_detail_trigger_civil_works_progress_milestone',
    'payment_term_detail_due_basis'
  ],
  mixins: [pageMixin, stageDragMixin],
  components: { addStageFormDlg },
  emits: ['onSuccess'],
  data() {
    const vm = this
    return {
      dialogVisible: false,
      saveKey: '1',
      activeNames: [],
      rowId: '',
      // 是否自动生成 EmployeeNo
      submitLoading: false,
      form: {},
      collapseWarningForBasicInfo: false,
      collapseWarningForContent: false,
      rules: {
        paymentTermType: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        paymentTermPurposeList: [
          {
            type: 'array',
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        paymentTermName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        paymentTermCode: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ]
      },

      /* 表格表单部分 */
      /* 表格部分 */
      columns: [
        {
          prop: 'stageName',
          label: vm.$t('ui.stageName'),
          visible: true,
          minWidth: 400,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'percentage',
          label: vm.$t('ui.paymentPercentage'),
          visible: true,
          width: 160,
          tooltip: true
        },
        {
          prop: 'trigger',
          label: vm.$t('ui.trigger'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'dueBasis',
          label: vm.$t('ui.dueBasis'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'days',
          label: vm.$t('ui.dueDays'),
          visible: true,
          minWidth: 120,
          tooltip: true
        },
        {
          prop: 'triggerDescription',
          label: vm.$t('ui.triggerDescription'),
          visible: true,
          minWidth: 200,
          tooltip: false
        },
        {
          prop: 'stageDescription',
          label: vm.$t('ui.stageDescription'),
          visible: true,
          minWidth: 200,
          tooltip: false
        },
        {
          prop: 'downPayment',
          label: vm.$t('ui.downPayment'),
          visible: true,
          minWidth: 140,
          tooltip: true
        },
        {
          prop: 'goodsIssue',
          label: vm.$t('ui.goodsIssue'),
          visible: true,
          minWidth: 140,
          tooltip: true
        }
      ],
      tableList: [],
      tableKey: Date.now(),
      selected: [],
      rowIdKey: 'rowTimeId'
    }
  },
  created() {
    this.$$initColumnVisible('undefined', this.columns)
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    comDisFrom() {
      return false
    },
    comDisStage() {
      return this.comDisFrom
      // return false
    },
    existLevel2() {
      const item = this.tableList.find(
        item => (item.childList || []).length > 0
      )
      return !!item
    },
    isDefaultValue() {
      return this.form.isDefault === '1'
    }
  },
  methods: {
    changeEmployeeNoSwitch(code) {
      this.form[code] = ''
      if (this.$refs.form) {
        this.$nextTick(() => {
          this.$refs.form.clearValidate(code)
        })
      }
    },
    handleUpdate(row) {
      this.reset()
      this.dialogVisible = true
      const data = JSON.parse(JSON.stringify(row))
      if (data.paymentTermPurpose) {
        data.paymentTermPurposeList = data.paymentTermPurpose.split(',')
      }
      this.form = data
      const list = this.form.paymentTermDetailList || []
      this.setNodeRowId(list, 0)
      this.resetStageNum(list)
      if (list[0]) {
        this.resetIsTopRow(list[0])
      }
      this.tableList = list
      this.initDraggable()
    },
    setNodeRowId(dataList, levelNum, plantNode) {
      for (const node of dataList) {
        // 如果找到匹配的ID，返回该节点
        node.rowTimeId = node.paymentTermDetailId
        node.levelNum = levelNum + 1
        if (plantNode) {
          node.parentRowTimeId = plantNode.rowTimeId
          node.isCivilWorks =
            plantNode.trigger === '9' || plantNode.isCivilWorks
        }
        // 如果当前节点有子节点，递归查找
        if (node.childList && node.childList.length > 0) {
          this.setNodeRowId(node.childList, node.levelNum, node)
        }
      }
    },
    // 取消按钮
    closed() {
      this.reset()
    },
    cancel() {
      this.dialogVisible = false
    },
    /* 表单部分 */
    // 表单重置
    reset() {
      this.form = {
        paymentTermType: undefined,
        paymentTermPurposeList: [],
        paymentTermPurpose: undefined,
        paymentTermNo: undefined,
        paymentTermCode: undefined,
        paymentTermName: undefined,
        description: '',
        isDefault: '0',
        isActive: '1',
        isAutoNo: '1',
        createdBy: this.$store.state.user.nickName
      }
      this.collapseWarningForBasicInfo = false
      this.collapseWarningForContent = false
      this.activeNames = ['1', '2', '3']
      this.resetForm('form')

      this.tableList = []
      this.selected = []
      this.destroyDraggable()
    },
    handlePaymentTermType() {
      this.$refs.form.clearValidate(['days', 'description'])
    },
    handlePaymentTermPurpose() {
      this.$nextTick(() => {
        this.form.paymentTermPurpose = (
          this.form.paymentTermPurposeList || []
        ).join(',')
      })
    },
    handleIsDefault(value) {
      if (value === '1') {
        this.form.isActive = '1'
      }
    },

    /* 表格表单部分 */
    inputNumberChange(code) {
      this.$refs.form.validateField(code)
    },

    handleAddStage(row) {
      const params = {}
      if (row.rowTimeId) {
        params.parentRowTimeId = row.rowTimeId
        // params.isTopRow = row.isTopRow
        const parentNode = this.findNodeById(this.tableList, row.rowTimeId)
        const parentStage = parentNode.stage
        const curStage = (parentNode.childList || []).length + 1
        params.stage = `${parentStage}.${curStage}`
        params.isCivilWorks = row.trigger === '9' || row.isCivilWorks
      } else {
        params.stage = this.tableList.length + 1 + ''
      }
      if (this.tableList.length === 0) {
        params.isTopRow = true
      }

      this.$refs.addStageFormDlg.handleOpen(params)
    },
    handleDblclick(row, column, event) {
      /* 展开收起的时候会触发行双击 */
      if (event?.target?.closest?.('.el-table__expand-icon')) {
        return
      }
      this.handleEditStage(row)
    },
    handleEditStage(row) {
      // 如果子级输入了百分比，则父级不能编辑百分比
      // const isChildNum = (row.childList || []).find((item) => item.percentage)
      // if (isChildNum) {
      //   row.isDisabledPercentage = true
      // } else {
      //   row.isDisabledPercentage = false
      // }
      this.$refs.addStageFormDlg.handleOpen(row)
    },
    updateStage(row) {
      // 编辑与新增节点
      if (row.rowTimeId) {
        const node = this.findNodeById(this.tableList, row.rowTimeId)
        const oldTrigger = node.trigger
        const newTrigger = row.trigger
        if (node) {
          node.stageName = row.stageName
          node.days = row.days
          node.percentage = row.percentage
          node.downPayment = row.downPayment
          node.goodsIssue = row.goodsIssue
          node.stage = row.stage
          node.dueBasis = row.dueBasis
          node.trigger = row.trigger
          node.triggerCivilWorksProgressMilestone =
            row.triggerCivilWorksProgressMilestone
          node.stageDescription = row.stageDescription
          node.triggerDescription = row.triggerDescription
        }
        if (
          node.childList &&
          node.childList.length > 0 &&
          oldTrigger !== newTrigger &&
          (oldTrigger === '9' || newTrigger === '9')
        ) {
          this.resetChildTrigger(node.childList, newTrigger === '9')
        }
        this.updateParents(this.tableList, node)
      } else {
        // 新增节点
        if (row.parentRowTimeId) {
          const parentNode = this.findNodeById(
            this.tableList,
            row.parentRowTimeId
          )
          if (parentNode) {
            if (!parentNode.childList) {
              parentNode.childList = []
            }
            const newRow = {
              ...row,
              levelNum: parentNode.levelNum + 1,
              rowTimeId: Date.now()
            }
            parentNode.childList.push(newRow)
            this.$nextTick(() => {
              this.updateParents(this.tableList, newRow)
            })
            this.$nextTick(() => {
              this.$refs.tables.toggleRowExpansion(parentNode, true)
            })
          }
        } else {
          this.tableList.push({
            ...row,
            levelNum: 1,
            rowTimeId: Date.now()
          })
        }
      }
      this.initDraggable()
    },
    // 重置阶段名称前面的序号 stage 字段
    resetStageNum(list, plantStage) {
      list.forEach((item, index) => {
        item.stage = plantStage ? `${plantStage}.${index + 1}` : `${index + 1}`
        // 如果当前节点有子节点，递归查找
        if (item.childList && item.childList.length > 0) {
          this.resetStageNum(item.childList, item.stage)
        }
      })
    },
    resetChildTrigger(list, isCivilWorks) {
      list.forEach((item, index) => {
        item.isCivilWorks = isCivilWorks
        item.trigger = undefined
        item.triggerCivilWorksProgressMilestone = undefined
        // 如果当前节点有子节点，递归查找
        if (item.childList && item.childList.length > 0) {
          this.resetChildTrigger(item.childList, isCivilWorks)
        }
      })
    },
    // 根据节点Id 找节点行
    findNodeById(data, targetId) {
      // 遍历当前层级的每个节点
      for (const node of data) {
        // 如果找到匹配的ID，返回该节点
        if (node.rowTimeId === targetId) {
          return node
        }

        // 如果当前节点有子节点，递归查找
        if (node.childList && node.childList.length > 0) {
          const found = this.findNodeById(node.childList, targetId)
          if (found) {
            return found
          }
        }
      }
      // 没找到返回null
      return null
    },
    percentageChange(row) {
      this.updateParents(this.tableList, row)
    },
    /* 子集输入后，自动汇总填入到父级 */
    updateParents(rootArray, modifiedNode) {
      /* ---- 产品要求，先关闭自动汇总功能 */
      if (this.form) return

      for (const node of rootArray) {
        // 检查当前节点是否是修改节点的直接父节点
        if (node.childList?.includes(modifiedNode)) {
          const isChildNum = (node.childList || []).find(
            item => item.percentage
          )
          if (isChildNum) {
            const percentage = (node.childList || []).reduce(
              (sum, child) => sum + (child.percentage || 0),
              0
            )
            node.percentage = percentage
          }
          return true
        }

        // 递归检查子节点
        if (this.updateParents(node.childList || [], modifiedNode)) {
          // 子节点中找到修改节点，更新当前节点数值
          const isChildNum = (node.childList || []).find(
            item => item.percentage
          )
          if (isChildNum) {
            const percentage = (node.childList || []).reduce(
              (sum, child) => sum + (child.percentage || 0),
              0
            )
            node.percentage = percentage
          }

          return true
        }
      }
      return false
    },

    /* 表格部分 */
    /* 行删除 */
    handleDelRow(row) {
      this.$modal.confirm(this.$t('ui.delConfirm')).then(() => {
        const delChildList = this.deleteCascadeNode(
          this.tableList,
          row.rowTimeId
        )
        if (delChildList && delChildList.length > 0) {
          this.updateParents(this.tableList, delChildList[0])
        }
        // 重置阶段名称前面的序号 stage 字段
        this.resetStageNum(this.tableList)
        if (this.tableList[0]) {
          this.resetIsTopRow(this.tableList[0])
        }
        this.initDraggable()
      })
    },
    /* 重新设置 isTopRow */
    resetIsTopRow(row) {
      row.isTopRow = true
    },
    // 删除节点行
    deleteCascadeNode(data, targetId) {
      // 遍历当前节点的子节点
      for (let i = 0; i < data.length; i++) {
        const child = data[i]
        // 找到目标节点，直接从父节点的children中删除
        if (child.rowTimeId === targetId) {
          data.splice(i, 1)
          return data // 删除成功
        }
        // 递归查找子节点的后代
        if (child.childList && child.childList.length > 0) {
          const delChildList = this.deleteCascadeNode(child.childList, targetId)
          if (delChildList) return delChildList
        }
      }
      return false // 未找到目标节点
    },
    // 获取节点行的百分比是否等于子级百分比的和
    getNodeIsErr(node) {
      if (node.childList && node.childList.length > 0) {
        let num = 0
        node.childList.forEach(item => {
          num += item.percentage || 0
        })
        if (num !== (node.percentage || 0)) {
          return true
        }
        return false
      }
      return false
    },
    // 获取百分比不等于子级百分比的节点， 返回节点信息
    findErrNode(data) {
      for (const node of data) {
        // 如果找到匹配的ID，返回该节点
        if (node.childList && node.childList.length > 0) {
          let num = 0
          node.childList.forEach(item => {
            num += item.percentage || 0
          })
          if (num !== (node.percentage || 0)) {
            node.childAllPercentage = num
            return node
          }
        }

        // 如果当前节点有子节点，递归查找
        if (node.childList && node.childList.length > 0) {
          const found = this.findErrNode(node.childList)
          if (found) {
            return found
          }
        }
      }
      // 没找到返回null
      return null
    },
    findErrNodeForPercentageEmpty(data) {
      for (const node of data) {
        // 如果找到匹配的ID，返回该节点
        if (!this.$resultOfBoolean(node.percentage)) {
          return node
        }

        // 如果当前节点有子节点，递归查找
        if (node.childList && node.childList.length > 0) {
          const found = this.findErrNodeForPercentageEmpty(node.childList)
          if (found) {
            return found
          }
        }
      }
      // 没找到返回null
      return null
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
      if (rowIndex === 0) {
        return 'table-dis-drag-bgcolor'
      }
      return 'allowDrag'
    },
    treeToTile(treeData, childKey = 'childList') {
      const arr = []
      const expanded = data => {
        if (data && data.length > 0) {
          data.forEach(e => {
            arr.push({
              ...e,
              nodeList: data
            })
            expanded(e[childKey] || [])
          })
        }
      }
      expanded(treeData)
      return arr
    },
    submitForm() {
      const vm = this
      let param = { ...this.form }
      param.paymentTermDetailList = vm.tableList
      param = this.$trimOfObj(JSON.parse(JSON.stringify(param)))
      this.collapseWarningForContent = true
      if (vm.tableList.length <= 0) {
        this.$modal.msgError(vm.$t('ui.conditionValid'))
        return
      }
      const errNode1 = this.findErrNodeForPercentageEmpty(this.tableList)
      if (errNode1) {
        this.$modal.msgError(
          this.$t('ui.commonReqMsg').replace(
            '$1',
            this.$t('ui.paymentPercentage')
          )
        )
        return
      }
      const totalPercent = this.tableList.reduce((total, curVal) => {
        return total + (curVal.percentage || 0)
      }, 0)
      if (totalPercent !== 100) {
        this.$modal.msgError(vm.$t('ui.no100Msg'))
        return
      }
      const errNode2 = this.findErrNode(this.tableList)
      if (errNode2) {
        let msg = vm.$t('ui.stageDiffChildAll')
        msg = msg.replace('$1', errNode2.stageName)
        msg = msg.replace('$2', errNode2.percentage)
        msg = msg.replace('$3', errNode2.childAllPercentage)
        this.$modal.msgError(msg)
        return
      }
      this.$emit('onSuccess', param)
      this.collapseWarningForContent = false

      this.submitLoading = true
      setTimeout(() => {
        this.submitLoading = false
      }, 2000)
      this.cancel()
    }
  }
}
</script>
