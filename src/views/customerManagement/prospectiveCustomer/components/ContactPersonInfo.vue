<template>
  <div>
    <el-dialog
      draggable
      :title="$t('customer.contactPerson')"
      v-model="visible"
      width="1140px"
      :modal="true"
      :close-on-click-modal="false"
      @closed="closed"
      append-to-body
    >
      <el-form
        :model="termForm"
        :rules="termFormRules"
        label-width="140px"
        :disabled="comDisFrom"
        ref="termForm"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item
              :label="`${$t('ui.contactPersonName')}`"
              prop="contactPersonName"
            >
              <el-input
                v-model="termForm.contactPersonName"
                maxlength="200"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="`${$t('ui.title')}`" prop="title">
              <el-select
                v-model="termForm.title"
                :disabled="comDisFrom"
                placeholder=""
                style="width: 100%"
                clearable
                filterable
              >
                <el-option
                  v-for="dict in business_contact_person_title"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="`${$t('ui.position')}`">
              <el-autocomplete
                style="width: 100%"
                v-model="termForm.position"
                :fetch-suggestions="queryPositionSugg"
                placeholder
                clearable
                :maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item
              :label="`${$t('ui.mobilePhone')}`"
              prop="mobilePhone"
              ref="mobileNoRef"
            >
              <MobilePhoneInput
                v-model:mobileCode="termForm.mobileCode"
                v-model:mobileNum="termForm.mobileNum"
                v-model:mobileNo="termForm.mobilePhone"
                :disabled="comDisFrom"
                @clearValidate="$refs.mobileNoRef.clearValidate()"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="`${$t('ui.email')}`" prop="email">
              <el-input
                v-model.trim="termForm.email"
                :title="termForm.email"
                maxlength="50"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="`${$t('customer.other')}`">
              <el-input v-model="termForm.other" maxlength="50"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item :label="`${$t('ui.sex')}`" prop="sex">
              <el-select
                v-model="termForm.sex"
                :disabled="comDisFrom"
                placeholder=""
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="dict in sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="cdsQc === '1'">
            <el-form-item
              v-if="!termForm.customerContactPersonId"
              :label="`${$t('customer.contactPersonCode')}`"
              :rules="[
                {
                  required: termForm.isAutoContactPersonCode === '0',
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  message: $t('ui.reqMsg'),
                  trigger: ['blur']
                }
              ]"
              prop="contactPersonCode"
            >
              <div class="input-switch-box">
                <div class="con-left">
                  <el-input
                    :disabled="termForm.isAutoContactPersonCode === '1'"
                    v-model="termForm.contactPersonCode"
                    maxlength="50"
                  />
                </div>
                <div class="con-right">
                  <el-switch
                    v-model="termForm.isAutoContactPersonCode"
                    active-value="1"
                    inactive-value="0"
                    @change="changeEmployeeNoSwitch('contactPersonCode')"
                  ></el-switch>
                </div>
              </div>
            </el-form-item>
            <el-form-item
              :label="`${$t('customer.contactPersonCode')}`"
              prop="contactPersonCode"
              v-else
            >
              <el-input
                disabled
                v-model="termForm.contactPersonCode"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('ui.remarks')">
              <el-input
                type="textarea"
                v-model="termForm.remarks"
                :autosize="{ minRows: 2, maxRows: 4 }"
                resize="none"
                show-word-limit
                :maxlength="3000"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item :label="`${$t('ui.isDefault')}`">
              <el-switch
                v-model="termForm.isDefault"
                :disabled="comDisFrom"
                active-value="1"
                inactive-value="0"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="`${$t('ui.isActive')}`">
              <el-switch
                v-model="termForm.isActive"
                :disabled="comDisFrom"
                active-value="1"
                inactive-value="0"
              ></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- <div style="text-align: center; margin-bottom: 10px"> -->
      <template v-slot:footer>
        <div class="dialog-footer">
          <template v-if="isTermEdit">
            <el-button
              type="primary"
              v-if="!comDisFrom"
              size="small"
              :loading="btnLoading"
              @click="handleEditTerm"
              >{{ $t('uiBtn.save') }}</el-button
            >
            <el-button size="small" @click="visible = false">{{
              $t('uiBtn.back')
            }}</el-button>
          </template>
          <template v-else-if="!comDisFrom">
            <el-button
              type="primary"
              size="small"
              :loading="btnLoading"
              @click="handleAddTerm"
              >{{ $t('uiBtn.add') }}</el-button
            >
            <el-button size="small" @click="handleResetTerm">{{
              $t('uiBtn.reset')
            }}</el-button>
          </template>
        </div>
      </template>
    </el-dialog>
    <div>
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
          ></right-toolbar>
        </el-row>
        <el-table
          border
          ref="tables"
          :row-key="rowIdKey"
          :row-class-name="tableRowClassName"
          :cell-class-name="tableCellClassName"
          :data="tableList"
          @select="handleSelectionChange"
          @select-all="handleSelectAll"
          @row-dblclick="handleTermRowClick"
        >
          <!-- <el-table-column
                  v-if="!comDisFrom"
                  type="selection"
                  key="selection"
                  align="center"
                  width="55"
                ></el-table-column> -->
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
            :min-width="item.minWidth"
            :show-overflow-tooltip="item.tooltip"
            :fixed="item.fixed"
            :sortable="item.sortable"
            :align="item.align || 'left'"
            header-align="center"
          >
            <template v-slot="scope">
              <span v-if="item.prop === 'addressIdList'">
                {{ getAddressLabelList(scope.row[item.prop]).join(', ') }}
              </span>
              <template v-else-if="item.prop === 'title'">{{
                selectDictLabel(
                  business_contact_person_title,
                  scope.row[item.prop] || ''
                ) || scope.row[item.prop]
              }}</template>
              <template v-else-if="item.prop === 'isDefault'">
                <el-tag v-if="scope.row.isDefault === '1'">{{
                  $t('ui.y')
                }}</el-tag>
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
                  :title="$t('uiBtn.edit')"
                  @click="handleTermRowClick(scope.row)"
                  :size="20"
                  color="#409eff"
                  class="pointer mr5"
                >
                  <Edit />
                </el-icon>

                <el-icon
                  :title="$t('uiBtn.delete')"
                  @click.stop="handleDelRow(scope.$index, scope.row)"
                  :size="20"
                  color="#f56c6c"
                  class="pointer"
                >
                  <Delete />
                </el-icon>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'
import Sortable from 'sortablejs'
import {
  queryPositionList,
  saveContactPerson,
  deleteContactPerson
} from '@/api/customerManagement/customer'
export default {
  mixins: [pageMixin],
  props: {
    /* 是否实时提交 */
    isSubmitNow: {
      type: [Boolean],
      default: false
    },
    comDisFrom: {
      type: [Boolean],
      default: false
    },

    modifyHighlight: {
      type: [Boolean],
      default: false
    },
    addressList: {
      type: [Array],
      default() {
        return []
      }
    },
    cdsQc: {
      type: String,
      default: '0'
    },
    formData: {
      type: [Object],
      default() {
        return {}
      }
    }
  },
  watch: {
    addressList: {
      deep: true,

      handler(list) {
        // this.changeAddressList()
      }
    }
  },
  computed: {
    comAddressIdList() {
      return this.addressList.map(item => item.rowTimeId)
    }
  },
  data() {
    const vm = this
    const validatorPhoneNo = (rule, value, callback) => {
      if (!this.termForm.mobileCode || !this.termForm.mobileNum) {
        callback(this.$t('ui.reqMsg').replace('$1', this.$t('ui.mobilePhone')))
      } else {
        callback()
      }
    }
    return {
      saveKey: '3',
      /* 表格表单部分 */
      positionList: [],
      termForm: {
        addressIdList: []
      },
      termFormRules: {
        addressIdList: [
          {
            type: 'array',
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        title: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        contactPersonName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        sex: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        email: [
          {
            required: true,
            trigger: ['blur', 'change'],
            message: this.$t('ui.reqMsg')
          },
          {
            type: 'email',
            validator: this.isEmail,
            trigger: ['blur', 'change']
          }
        ],
        mobilePhone: [
          { required: true, validator: validatorPhoneNo, trigger: 'change' }
        ]
      },
      isTermEdit: false,
      editIndex: undefined,
      /* 表格部分 */
      columns: [
        {
          prop: 'title',
          label: vm.$t('ui.title'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          fixed: true
        },

        {
          prop: 'position',
          label: vm.$t('ui.position'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'contactPersonName',
          label: vm.$t('ui.contactPersonName'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        // {
        //   prop: 'addressIdList',
        //   label: vm.$t('ui.address'),
        //   visible: true,
        //   minWidth: 200,
        //   tooltip: true
        // },
        {
          prop: 'mobilePhone',
          label: vm.$t('ui.mobilePhone'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'email',
          label: vm.$t('ui.email'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },
        {
          prop: 'other',
          label: vm.$t('customer.other'),
          visible: true,
          minWidth: 200,
          tooltip: true
        },

        {
          prop: 'isDefault',
          label: vm.$t('ui.isDefault'),
          visible: true,
          minWidth: 140,
          tooltip: true
        },
        {
          prop: 'isActive',
          label: vm.$t('ui.isActive'),
          visible: true,
          minWidth: 140,
          tooltip: true
        },
        {
          prop: 'remarks',
          label: vm.$t('ui.remarks'),
          visible: true,
          minWidth: 200,
          tooltip: true
        }
      ],
      tableList: [],
      selected: [],
      sortableDom: undefined,
      rowIdKey: 'rowTimeId',
      visible: false,
      btnLoading: false,
      business_contact_person_title: [],
      sys_user_sex: []
    }
  },
  created() {
    this.queryPositionList()
    const { sys_user_sex, business_contact_person_title } = this.useDict(
      'sys_user_sex',
      'business_contact_person_title'
    )
    this.sys_user_sex = sys_user_sex || []
    this.business_contact_person_title = business_contact_person_title || []
  },
  methods: {
    changeEmployeeNoSwitch(code) {
      this.termForm[code] = ''
      if (this.$refs.termForm) {
        this.$nextTick(() => {
          this.$refs.termForm.clearValidate(code)
        })
      }
    },
    /* 版本比对 */
    tableRowClassName({ row, rowIndex }) {
      let color = ''
      if (this.modifyHighlight) {
        if (row.updateType === '2') {
          color = 'new-add-row'
        }
      }
      const cur = this.selected.find(
        item => item[this.rowIdKey] === row[this.rowIdKey]
      )
      if (cur) {
        color = 'table-SelectedRow-bgcolor'
      }

      return color
    },
    tableCellClassName({ row, column }) {
      let cellClass = ''
      if (this.modifyHighlight) {
        if (row.updateType === '1') {
          if (
            (row.updateMsgList || []).find(
              item => item.name === column.property
            )
          ) {
            cellClass = 'edit-table-cell'
          }
        }
      }
      return cellClass
    },
    getAddressLabelList(ids) {
      if (ids && ids.length > 0) {
        return this.addressList
          .filter(item => ids.includes(item.rowTimeId))
          .map(item => item.label)
      }
      return []
    },
    getTableList() {
      return this.tableList
    },
    initList(list) {
      this.tableList = list
      this.$emit('change', this.tableList)
    },
    /* 地址部分修改, 处理联系人地址关联 */
    changeAddressList() {
      const ids = this.termForm.addressIdList
      if (ids && ids.length > 0) {
        this.termForm.addressIdList = this.getNewIdList(ids)
      }
      this.tableList.forEach(item => {
        const rowIds = item.addressIdList
        if (rowIds && rowIds.length > 0) {
          item.addressIdList = this.getNewIdList(rowIds)
        }
      })
    },
    getNewIdList(ids) {
      return ids.filter(item => this.comAddressIdList.includes(item))
    },
    /* 表格表单部分 */
    reset() {
      this.tableList = []
      this.selected = []
      this.destroyDraggable()
      this.handleResetTerm()
    },

    handleResetTerm() {
      this.isTermEdit = false
      this.editIndex = undefined
      this.termForm = {
        addressIdList: [],
        title: '',
        contactPersonName: '',
        mobilePhone: '',
        mobileCode: '',
        mobileNum: '',
        email: '',
        isDefault: '0',
        isActive: '1',
        isAutoContactPersonCode: '1',
        contactPersonCode: undefined,
        sex: undefined
      }
      this.$nextTick(() => {
        this.$refs.termForm && this.$refs.termForm.clearValidate()
      })
    },
    closed() {
      this.handleResetTerm()
    },
    handleAdd() {
      this.handleResetTerm()
      this.visible = true
    },
    handleAddTerm() {
      const vm = this
      vm.isTermEdit = false
      vm.$refs.termForm.validate(valid => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(vm.termForm))

          const row = {
            ...params,
            rowTimeId: Date.now(),
            isNewData: 1,
            customerId: this.formData.customerId
          }

          if (this.isSubmitNow) {
            vm.btnLoading = true
            saveContactPerson(row)
              .then(res => {
                const data = res.data || {}
                if (row.isDefault === '1') {
                  vm.tableList.forEach(item => {
                    item['isDefault'] = '0'
                  })
                }
                vm.tableList.push(data)
                this.$emit('change', vm.tableList)
                vm.visible = false
                vm.btnLoading = false
              })
              .catch(() => {
                vm.btnLoading = false
              })
            return
          }

          vm.btnLoading = true
          setTimeout(() => {
            vm.btnLoading = false
          }, 1000)

          if (row.isDefault === '1') {
            vm.tableList.forEach(item => {
              item['isDefault'] = '0'
            })
          }
          vm.tableList.push(row)
          this.$emit('change', vm.tableList)
          vm.visible = false

          // vm.initDraggable()
        }
      })
    },
    handleTermRowClick(dataRow) {
      const vm = this
      vm.isTermEdit = true
      vm.editIndex = vm.tableList.findIndex(
        item => item.rowTimeId === dataRow.rowTimeId
      )
      const params = JSON.parse(JSON.stringify(dataRow))
      vm.termForm = {
        ...params
      }
      this.visible = true
    },
    handleEditTerm() {
      const vm = this
      vm.$refs.termForm.validate(valid => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(vm.termForm))
          if (this.isSubmitNow) {
            vm.btnLoading = true
            saveContactPerson(params)
              .then(res => {
                if (params.isDefault === '1') {
                  vm.tableList.forEach(item => {
                    item['isDefault'] = '0'
                  })
                }
                vm.tableList[vm.editIndex] = { ...params }
                this.$emit('change', vm.tableList)
                vm.visible = false
                vm.btnLoading = false
              })
              .catch(() => {
                vm.btnLoading = false
              })
            return
          }

          vm.btnLoading = true
          setTimeout(() => {
            vm.btnLoading = false
          }, 1000)
          if (params.isDefault === '1') {
            vm.tableList.forEach(item => {
              if (item.rowTimeId !== params.rowTimeId) {
                item['isDefault'] = '0'
              }
            })
          }
          vm.tableList[vm.editIndex] = { ...params }
          this.$emit('change', vm.tableList)
          vm.visible = false
        }
      })
    },
    queryPositionSugg(queryString, cb) {
      const vm = this
      const positionList = vm.positionList

      let results
      if (queryString) {
        results = positionList.filter(
          umo =>
            umo.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      } else {
        results = positionList
      }
      cb(results)
    },
    queryPositionList() {
      queryPositionList().then(res => {
        const list = res.data || []
        this.positionList = list.map(position => {
          return { value: position }
        })
      })
    },

    /* 表格部分 */
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
        if (this.isSubmitNow) {
          deleteContactPerson({
            customerContactPersonId: row.customerContactPersonId
          })
            .then(res => {
              this.tableList.splice(index, 1)
              this.$emit('change', this.tableList, 'delete')
            })
            .catch(() => {})
          return
        }
        this.tableList.splice(index, 1)
        this.$emit('change', this.tableList, 'delete')

        setTimeout(() => {
          this.handleResetTerm()
        }, 20)
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

    initDraggable() {
      this.destroyDraggable()
      if (this.comDisFrom) {
        return
      }
      setTimeout(() => {
        const el = this.$refs.tables.$el.querySelectorAll(
          '.el-table__fixed-body-wrapper > table > tbody'
        )[0]
        this.sortableDom = Sortable.create(el, {
          handle: '.allowDrag',
          animation: 100,
          ghostClass: 'blue-background-class',
          onEnd: evt => {
            if (evt.oldIndex === evt.newIndex) return
            const targetRow = this.tableList.splice(evt.oldIndex, 1)[0]
            this.tableList.splice(evt.newIndex, 0, targetRow)
          }
        })
      }, 300)
    },
    destroyDraggable() {
      if (this.sortableDom) {
        this.sortableDom.destroy()
        this.sortableDom = undefined
      }
    }
  },
  emits: ['change']
}
</script>
