<template>
  <div class="add-item">
    <!-- <i class="icon bqtfont addBtn" @click="handleClick">&#xe603;</i> -->
    <svg-icon
      @click="handleClick"
      icon-class="list"
      style="height: 18px; width: 18px; cursor: pointer; color: #606266"
    />
    <el-dialog
      :key="1112"
      :title="$t('addUserEmail.addItem')"
      v-model="visible"
      width="1200px"
      :destroy-on-close="true"
      :append-to-body="true"
      @open="handleDialogOpen"
      @close="handleDialogClose"
    >
      <el-form
        ref="contactForm"
        :model="contactForm"
        :rules="contactFormRules"
        label-width="180px"
        class="mr20"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item :label="`${$t('addUserEmail.title')}`" prop="title">
              <el-select
                v-model="contactForm.title"
                placeholder
                class="form-wd"
                style="width: 100%"
              >
                <el-option
                  v-for="item in business_contact_person_title"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="`${$t('addUserEmail.contactPersonName')}`"
              prop="contactPersonName"
            >
              <el-input
                v-model="contactForm.contactPersonName"
                :maxlength="200"
                class="form-wd"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item :label="`${$t('addUserEmail.email')}`" prop="email">
              <el-input
                v-model.trim="contactForm.email"
                :title="contactForm.email"
                type="textarea"
                maxlength="400"
                resize="none"
                :autosize="{ minRows: 1, maxRows: 1 }"
                style="width: 100%"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <div style="text-align: center; margin-bottom: 22px">
          <template v-if="isConcactEdit">
            <el-button type="primary" size="small" @click="handleEditTerm">{{
              $t('uiBtn.save')
            }}</el-button>
            <el-button size="small" @click="handleResetConcact">{{
              $t('uiBtn.back')
            }}</el-button>
          </template>
          <template v-else>
            <el-button type="primary" size="small" @click="handleAddConcact">{{
              $t('uiBtn.add')
            }}</el-button>
            <el-button size="small" @click="handleResetConcact">{{
              $t('uiBtn.reset')
            }}</el-button>
          </template>
        </div>
      </el-form>

      <el-table
        ref="businessAddressListTable"
        :data="emailContactPersonList"
        :row-class-name="tableRowClassName"
        stripe
        class="w100 mt22"
        border
        max-height="390"
        header-row-class-name="th-primary"
        highlight-current-row
        @row-click="handleAddressTermRowClick"
      >
        <el-table-column
          type="index"
          :label="$t('ui.sn')"
          width="60"
          fixed="left"
          align="center"
        >
          <template v-slot="scope"
            ><span
              >{{ scope.$index + (curPage - 1) * pageSize + 1 }}
            </span></template
          >
        </el-table-column>
        <el-table-column
          prop="title"
          :label="$t('addUserEmail.title')"
          min-width="70"
          fixed="left"
          align="center"
        >
          <template v-slot="scope">
            {{
              selectDictLabel(business_contact_person_title, scope.row.title)
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="contactPersonName"
          :label="$t('addUserEmail.contactPersonName')"
          min-width="200"
          show-overflow-tooltip
          align="center"
        ></el-table-column>
        <el-table-column
          prop="email"
          :label="$t('addUserEmail.email')"
          min-width="200"
          show-overflow-tooltip
          align="center"
        ></el-table-column>
        <el-table-column
          :label="$t('ui.action')"
          width="170"
          fixed="right"
          align="center"
        >
          <template v-slot="scope">
            <div class="icon-box">
              <el-button
                size="small"
                type="primary"
                link
                @click.stop="handleEditAddressRow(scope.row, scope.$index)"
                >{{ $t('uiBtn.edit') }}</el-button
              >
              <el-button
                size="small"
                type="danger"
                link
                @click.stop="handleDelAddressRow(scope.row, scope.$index)"
                >{{ $t('uiBtn.delete') }}</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">{{ $t('uiBtn.back') }}</el-button>
          <el-button type="primary" @click="handleSave">{{
            $t('uiBtn.submit')
          }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../../utils/gogocodeTransfer'
// tableMinxs 改为 tableMinx
import pageMixin from '@/mixins/tableMinx'
export default {
  directives: {},
  mixins: [pageMixin],
  props: {
    value: {
      type: Array,
      default: function () {
        return []
      }
    },
    business_contact_person_title: {
      type: Array,
      default: function () {
        return []
      }
    },
    clickDefore: Function,
    disabled: Boolean,
    warehouseId: String,
    dataIds: {
      type: [String],
      default: ''
    },
    sicId: {
      type: [String],
      default: ''
    }
  },
  data() {
    const vm = this
    return {
      condition: '',
      selected: [],
      visible: false,
      isInit: false,
      initSelected: [],
      contactForm: {},
      contactFormRules: {
        title: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g), // 不能全部是空格
            message: vm.$t('ui.reqMsg'),
            trigger: 'change'
          }
        ],
        email: [
          {
            required: true,
            message: vm.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          },
          {
            type: 'email',
            validator: this.isEmail,
            trigger: ['blur', 'change']
          }
        ],
        contactPersonName: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g), // 不能全部是空格
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ]
      },
      isConcactEdit: false,
      emailContactPersonList: []
    }
  },
  computed: {},
  beforeCreate() {},
  methods: {
    handleClick() {
      this.visible = true
      this.isInit = true
      this.condition = ''
      this.curPage = 1
      this.pageSize = 10
      this.$refs.multipleTable && this.$refs.multipleTable.clearSelection()
      // this.queryTableList()
      $emit(this, 'click')
    },
    handleSave() {
      this.visible = false
      $emit(this, 'setToUserList', this.emailContactPersonList)
    },
    handleDialogOpen() {},
    handleDialogClose() {},
    // 编辑--save
    handleEditTerm() {
      const vm = this
      vm.$refs.contactForm.validate(valid => {
        if (valid) {
          vm.emailContactPersonList[vm.editIndex] = {
            ...vm.contactForm
          }
          // vm.$set(vm.emailContactPersonList, vm.editIndex, )
          vm.editIndex = undefined
          vm.contactForm = {}
          vm.handleResetConcact()
          vm.isConcactEdit = false
        }
      })
    },
    // 新增--add
    handleAddConcact() {
      const vm = this
      vm.isConcactEdit = false
      vm.$refs.contactForm.validate(valid => {
        if (valid) {
          vm.emailContactPersonList.push({
            ...vm.contactForm,
            timeTemp: new Date().getTime()
          })
          vm.handleResetConcact()
        }
      })
    },
    // 重置表单
    handleResetConcact() {
      const vm = this
      this.resetForm('contactForm')

      vm.isConcactEdit = false
      vm.contactForm = {}
      setTimeout(() => {
        vm.$refs.contactForm && vm.$refs.contactForm.clearValidate()
      }, 20)
    },

    // 行编辑--点击action
    handleEditAddressRow(dataRow, index) {
      const vm = this
      if (index !== undefined) {
        vm.editIndex = index
      }
      vm.isConcactEdit = true
      vm.contactForm = {
        ...dataRow
      }
      setTimeout(() => {
        vm.$refs.contactForm && vm.$refs.contactForm.clearValidate()
      }, 20)
    },
    // 表格行点击
    handleAddressTermRowClick(dataRow) {
      console.log(dataRow, '===')
      const vm = this
      const { index } = dataRow
      vm.handleEditAddressRow(dataRow)
      vm.editIndex =
        index ||
        vm.emailContactPersonList.findIndex(
          item => item.timeTemp === dataRow.timeTemp
        )
    },
    // 表格行删除
    handleDelAddressRow(row, index) {
      const vm = this
      vm.handleResetConcact()
      vm.emailContactPersonList.splice(index, 1)
    },
    tableRowClassName({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
    }
  },
  emits: ['setToUserList', 'click', 'update:value']
}
</script>

<style scoped>
.addBtn {
  font-size: 35px;
  line-height: 40px;
  cursor: pointer;
  position: absolute;
  right: 5px;
  top: 0px;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-user-select: none;
}
</style>
