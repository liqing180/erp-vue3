<template>
  <!-- formClass="form-page-btn--hide" -->
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
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
              ref="form"
              :model="form"
              :rules="rules"
              :disabled="comDisFrom"
              label-width="140px"
            >
              <el-row>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.userName')}`" prop="nickName">
                    <el-input
                      v-model="form.nickName"
                      :title="form.nickName"
                      maxlength="200"
                      :disabled="comDisFrom"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.userId')}`" prop="userName">
                    <el-input
                      :disabled="!!form.userId"
                      v-model="form.userName"
                      :title="form.userName"
                      maxlength="200"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    v-if="!form.userId"
                    :label="`${$t('ui.employeeNo')}`"
                    :rules="[
                      {
                        required: form.isAutoCreateEmployeeNo === '0',
                        pattern: new RegExp(/^(?!(\s+$))/g),
                        message: $t('ui.reqMsg').replace(
                          '$1',
                          $t('ui.employeeNo')
                        ),
                        trigger: ['blur']
                      }
                    ]"
                    prop="employeeNo"
                  >
                    <div class="input-switch-box">
                      <div class="con-left">
                        <el-input
                          :disabled="form.isAutoCreateEmployeeNo === '1'"
                          v-model="form.employeeNo"
                          :title="form.employeeNo"
                          maxlength="50"
                        />
                      </div>
                      <div class="con-right">
                        <el-switch
                          v-model="form.isAutoCreateEmployeeNo"
                          active-value="1"
                          inactive-value="0"
                          :disabled="$store.state.user.autoCode !== '2'"
                          @change="changeEmployeeNoSwitch('employeeNo')"
                        ></el-switch>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item
                    :label="`${$t('ui.employeeNo')}`"
                    prop="employeeNo"
                    :rules="[
                      {
                        required: true,
                        pattern: new RegExp(/^(?!(\s+$))/g),
                        message: $t('ui.reqMsg').replace(
                          '$1',
                          $t('ui.employeeNo')
                        ),
                        trigger: ['blur']
                      }
                    ]"
                    v-else
                  >
                    <el-input
                      :disabled="comDisFrom"
                      v-model="form.employeeNo"
                      :title="form.employeeNo"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.sex')}`" prop="sex">
                    <el-select
                      v-model="form.sex"
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
                <el-col :span="8">
                  <el-form-item
                    :label="`${$t('ui.mobilePhone')}`"
                    prop="mobilePhone"
                    ref="mobileNoRef"
                  >
                    <MobilePhoneInput
                      :disabled="comDisFrom"
                      v-model:mobileCode="form.mobileCode"
                      v-model:mobileNum="form.mobileNum"
                      v-model:mobileNo="form.mobilePhone"
                      @clearValidate="$refs.mobileNoRef.clearValidate()"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.email')}`" prop="email">
                    <el-input
                      v-model.trim="form.email"
                      :title="form.email"
                      :disabled="comDisFrom"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item :label="$t('ui.status')" prop="status">
                    <el-select
                      v-model="form.status"
                      placeholder=""
                      class="w100"
                      clearable
                    >
                      <el-option
                        v-for="dict in user_status"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :label="`${$t('ui.role')}`">
                    <div class="input-switch-box">
                      <div class="con-left">
                        <el-select
                          v-model="form.roleIdList"
                          :disabled="comDisFrom"
                          placeholder=""
                          style="width: 100%"
                          multiple
                          :collapse-tags="true"
                          clearable
                          class="log-msg-ellipsis"
                        >
                          <el-option
                            v-for="dict in roleList"
                            :key="dict.roleId"
                            :label="dict.roleName"
                            :value="dict.roleId"
                          ></el-option>
                        </el-select>
                      </div>

                      <div
                        class="con-right"
                        v-if="form.roleIdList && form.roleIdList.length > 0"
                      >
                        <svg-icon
                          @click="handleView"
                          icon-class="board-05"
                          class="primary-pointer"
                          style="height: 28px; width: 28px"
                        />
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="false">
                  <el-form-item
                    v-if="!form.userId"
                    :label="$t('ui.password')"
                    prop="password"
                  >
                    <el-input
                      v-model="form.password"
                      autocomplete="new-password"
                      type="password"
                      maxlength="20"
                      show-password
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="24">
                  <el-form-item :label="$t('ui.remarks')">
                    <el-input
                      type="textarea"
                      v-model="form.remarks"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                      resize="none"
                      show-word-limit
                      :maxlength="3000"
                      :disabled="comDisFrom"
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
                :title="$t('ui.dept')"
                :warning="collapseWarningForDept"
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
                  :min-width="item.minWidth"
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
                    <template v-if="item.prop === 'postId'">
                      <span v-if="comDisFrom">{{ scope.row.postName }}</span>
                      <el-select
                        v-else
                        style="width: 98%"
                        :model-value="scope.row.postItem"
                        value-key="postId"
                        placeholder=""
                        @change="positionIdChange($event, scope.row)"
                        @focus="focus(scope.row)"
                        :loading="selectLoading"
                      >
                        <el-option
                          v-for="dict in scope.row.positionOptions"
                          :key="dict.postId"
                          :label="dict.postName"
                          :value="dict"
                        ></el-option>
                      </el-select>
                    </template>
                    <template v-else-if="item.prop === 'isDefault'">
                      <el-switch
                        v-model="scope.row.isDefault"
                        :disabled="comDisFrom"
                        active-value="1"
                        inactive-value="0"
                        @change="rowIsDefaultChange(scope.row)"
                        v-if="!comDisFrom"
                      ></el-switch>
                      <template v-else>
                        <el-tag v-if="scope.row.isDefault === '1'">{{
                          $t('ui.y')
                        }}</el-tag>
                        <el-tag
                          v-if="scope.row.isDefault === '0'"
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
        <div class="form-card mt10" v-if="!!form.userId">
          <el-collapse-item name="3">
            <template v-slot:title>
              <FormCollapseItemTitle :title="$t('ui.systemOperationLog')">
                <template v-if="form.operationLogForLast">
                  <span
                    v-if="form.operationLogForLast.operatorBy"
                    class="info-item mr20"
                    :title="form.operationLogForLast.operatorBy"
                  >
                    {{ $t('ui.operName') }} :
                    {{ form.operationLogForLast.operatorBy }}
                  </span>
                  <span
                    v-if="form.operationLogForLast.operatorTime"
                    class="info-item"
                  >
                    {{ $t('ui.operTime') }} :
                    {{ parseTime(form.operationLogForLast.operatorTime) }}
                  </span>
                </template>
              </FormCollapseItemTitle>
            </template>
            <div class="pb20">
              <SystemOperationLogTable
                :tableList="form.operationLogList || []"
              />
            </div>
          </el-collapse-item>
        </div>
      </el-collapse>
    </template>
    <selectDeptDlg ref="selectDeptDlg" @select="updateTable" />
    <authDlg ref="authDlg" />
  </FormPageLayout>
</template>

<script>
import {
  addUser,
  getUser,
  updateUser,
  queryRoleListNoPage
} from '@/api/system/user'
import { queryDepartmentPost } from '@/api/system/post'

import pageMixin from '@/mixins/tableMinx'
import selectDeptDlg from './selectDeptDlg.vue'
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
import authDlg from './authDlg.vue'

export default {
  mixins: [pageMixin],
  components: {
    selectDeptDlg,
    SystemOperationLogTable,
    authDlg
  },
  data() {
    const vm = this
    const validatorPhoneNo = (rule, value, callback) => {
      if (!this.form.mobileCode || !this.form.mobileNum) {
        callback(this.$t('ui.reqMsg').replace('$1', this.$t('ui.mobilePhone')))
      } else {
        callback()
      }
    }
    return {
      saveKey: '1',
      savePath: 'AddUser',
      rowId: '',
      activeNames: [],
      // 默认密码
      initPassword: undefined,
      // 是否自动生成 EmployeeNo
      isAutoCreateEmployeeNo: '1',
      form: {
        isAutoCreateEmployeeNo: '1'
      },
      rules: {
        userName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: 'blur'
          }
        ],
        nickName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userName')),
            trigger: 'blur'
          }
        ],
        status: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.status')),
            trigger: ['blur', 'change']
          }
        ],
        sex: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.sex')),
            trigger: ['blur', 'change']
          }
        ],
        roleIdList: [
          {
            type: 'array',
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.sex')),
            trigger: ['blur', 'change']
          }
        ],
        mobilePhone: [
          { required: true, validator: validatorPhoneNo, trigger: 'change' }
        ],
        password: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.password')),
            trigger: 'blur'
          },
          {
            min: 6,
            max: 20,
            message: this.$t('ui.validPassword'),
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.email')),
            trigger: ['blur', 'change']
          },
          {
            type: 'email',
            validator: this.isEmail,
            trigger: ['blur', 'change']
          }
        ]
      },

      /* 表格部分 */
      columns: [
        {
          prop: 'legalEntityName',
          label: vm.$t('ui.legalEntity'),
          visible: true,
          minWidth: 160,
          tooltip: true,
          fixed: true
        },
        {
          prop: 'departmentName',
          label: vm.$t('ui.deptName'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'postId',
          label: vm.$t('ui.position'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'isDefault',
          label: vm.$t('system.isDefaultDepartment'),
          visible: true,
          minWidth: 200,
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
      rowIdKey: 'departmentId',
      positionOptions: [],
      selectLoading: false,
      collapseWarningForDept: false,
      collapseWarningForBasicInfo: false,
      roleList: [],
      isView: undefined,
      sys_user_sex: [],
      user_status: []
    }
  },

  created() {
    const { sys_user_sex, user_status } = this.useDict(
      'sys_user_sex',
      'user_status'
    )
    this.sys_user_sex = sys_user_sex || []
    this.user_status = user_status || []
    // this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.timeId = this.$route.query.timeId
    this.rowId = this.$route.query.id
    this.isView = this.$route.query.isView === '1'
    if (this.rowId) {
      this.handleUpdate()
    } else {
      this.handleAdd()
    }
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.rowId = this.$route.query.id
      this.isView = this.$route.query.isView === '1'
      if (this.rowId) {
        this.handleUpdate()
      } else {
        this.handleAdd()
      }
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
      return this.checkPermi(['organization:user:edit'])
    },
    sysDockingSwitch() {
      return this.$store.getters.sysDockingSwitch
    },
    comDisFrom() {
      if (this.sysDockingSwitch) {
        return true
      }
      if (this.isView) {
        return true
      }
      if (this.rowId) {
        // return !!this.form.nickName
        return !this.editAuth
      }
      return false
    }
  },
  methods: {
    handleView() {
      this.$refs.authDlg.open(this.form.roleIdList)
    },
    handleAdd() {
      this.reset()
      this.queryRoleListNoPage()
      // this.queryPositionOptions()
      this.getConfigKey('sys.user.initPassword').then(response => {
        this.initPassword = response.msg
        this.form.password = this.initPassword
      })
    },
    handleUpdate() {
      this.reset()
      this.queryRoleListNoPage()
      // this.queryPositionOptions()
      const userId = this.rowId
      getUser(userId).then(response => {
        const data = response.data || {}
        this.form = data
        this.updateTable(data.departmentList || [])
        this.form.password = ''
      })
    },
    // 角色
    queryRoleListNoPage() {
      queryRoleListNoPage({}).then(res => {
        this.roleList = res.data || []
      })
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
      const obj = { path: '/organization/user' }
      this.$tab.closeOpenPage(obj)
    },
    /* 表格部分 */
    queryPositionOptions(id, row) {
      this.selectLoading = true
      queryDepartmentPost(id)
        .then(res => {
          row['positionOptions'] = res.data || []
          // this.positionOptions = res.data || []
          this.selectLoading = false
        })
        .catch(() => {
          this.selectLoading = false
        })
    },
    focus(row) {
      row['positionOptions'] = []
      // this.positionOptions = []
      this.queryPositionOptions(row.departmentId, row)
    },
    positionIdChange(e, row) {
      row['postId'] = e.postId
      row['postName'] = e.postName
      row['postItem'] = {
        postId: e.postId,
        postName: e.postName
      }
    },
    rowIsDefaultChange(row) {
      const { legalEntityId } = row
      this.tableList.forEach(item => {
        if (item.legalEntityId === legalEntityId) {
          if (item.departmentId !== row.departmentId) {
            item['isDefault'] = '0'
          }
        }
      })
    },
    handleAddBtn() {
      const alreadySelectIdList = this.tableList.map(
        item => item[this.rowIdKey]
      )
      this.$refs.selectDeptDlg.handleAdd(alreadySelectIdList)
    },
    updateTable(list) {
      const rows = JSON.parse(JSON.stringify(list))
      this.tableList = [...this.tableList, ...rows]
      if (this.tableList.length === 1) {
        const item = this.tableList[0]
        item['isDefault'] = '1'
      }
      this.tableList.forEach(x => {
        if (x.postId) {
          x['postItem'] = {
            postId: x.postId,
            postName: x.postName
          }
          x['positionOptions'] = [
            {
              postId: x.postId,
              postName: x.postName
            }
          ]
        }
      })
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

    destroyDraggable() {
      if (this.sortableDom) {
        this.sortableDom.destroy()
        this.sortableDom = undefined
      }
    },

    /* 表单部分 */
    // 表单重置
    reset() {
      this.form = {
        employeeNo: '',
        isAutoCreateEmployeeNo: '1',
        userId: '',
        userName: '',
        nickName: '',
        password: '',
        mobileCode: '',
        mobileNum: '',
        mobilePhone: '',
        email: '',
        sex: '',
        status: '0',
        remarks: '',
        roleIdList: [],
        createdBy: this.$store.state.user.nickName
      }
      this.activeNames = ['1', '2', '3']
      this.tableList = []
      this.selected = []
      this.collapseWarningForDept = false
      this.collapseWarningForBasicInfo = false

      this.destroyDraggable()
      this.resetForm('form')
    },

    changeEmployeeNoSwitch(code) {
      this.form[code] = ''
      if (this.$refs.form) {
        this.$nextTick(() => {
          this.$refs.form.clearValidate(code)
        })
      }
    },
    submitForm: function () {
      this.$refs.form.validate(valid => {
        this.collapseWarningForBasicInfo = !valid
        if (valid) {
          const password = this.form.password
          let param = { ...this.form }
          const departmentList = this.tableList
          if (departmentList.length <= 0) {
            this.$modal.msgError(this.$t('system.departmentTableEmpty'))
            this.collapseWarningForDept = true
            return
          }
          // const positionReqObj = departmentList.find((item) => {
          //   return !this.$resultOfBoolean(item.postId)
          // })
          // if (positionReqObj) {
          //   this.$modal.msgError(this.$t('ui.commonReqMsg').replace('$1', this.$t('ui.position')))
          //   this.collapseWarningForDept = true
          //   return
          // }
          const legalEntityIdList = departmentList
            .filter(x => x.isDefault === '1')
            .map(x => x.legalEntityId)
          if (legalEntityIdList.length > 0) {
            const list = departmentList.filter(
              x => legalEntityIdList.indexOf(x.legalEntityId) === -1
            )
            if (list.length > 0) {
              const { legalEntityName } = list[0]
              this.$modal.msgError(
                this.$t('ui.positionIsDefaultReq').replace(
                  '$1',
                  legalEntityName
                )
              )
              this.collapseWarningForDept = true
              return
            }
          } else {
            const { legalEntityName } = departmentList[0]
            this.$modal.msgError(
              this.$t('ui.positionIsDefaultReq').replace('$1', legalEntityName)
            )
            this.collapseWarningForDept = true
            return
          }
          // const isDefaultReqObj = departmentList.find((item) => {
          //   return item.isDefault === '1'
          // })
          // if (!isDefaultReqObj) {
          //   this.$modal.msgError(this.$t('ui.positionIsDefaultReq'))
          //   this.collapseWarningForDept = true
          //   return
          // }

          this.collapseWarningForDept = false
          param = this.$trimOfObj(JSON.parse(JSON.stringify(this.form)))
          param.departmentList = departmentList
          param.password = password
          this.$modal
            .confirm(this.$t('ui.addUserConfirm'))
            .then(() => {
              if (param.userId) {
                return updateUser(param)
              }
              return addUser(param)
            })
            .then(response => {
              this.$modal.msgSuccess(
                this.$t('ui.addUserSuccess').replace('$1', this.form.nickName)
              )
              this.cancel()
              if (this.$store.state.user.userId === param.userId) {
                setTimeout(() => {
                  this.$store.commit('SET_LEGAL_ENTITY_KEY')
                }, 100)
              }
            })
            .catch(() => {})
        } else {
          this.$message.error(
            this.$t('ui.fromIncomplete').replace('$1', this.$t('ui.basicInfo'))
          )
        }
      })
    }
  }
}
</script>
