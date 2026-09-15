<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('customer.verification')"
    v-model="dialogTableVisible"
    width="600px"
    top="5vh"
    @close="close"
    append-to-body
  >
    <ul class="">
      <li class="item" v-for="(item, index) in list" :key="item.customId">
        <el-form
          :model="item"
          label-width="120px"
          @submit.prevent
          style="padding-right: 50px"
        >
          <!-- :label="item.criteria" -->
          <el-form-item
            prop="value"
            class="custom-label"
            :rules="{
              required: false,
              message: $t('ui.reqMsg'),
              type:
                ['multiOption'].indexOf(item.categoryType) !== -1
                  ? 'array'
                  : ['numberBox', 'dateSelection'].indexOf(
                        item.categoryType
                      ) !== -1
                    ? 'number'
                    : ['checkBox'].indexOf(item.categoryType) !== -1
                      ? 'boolean'
                      : 'string',
              pattern: new RegExp(/^(?!(\s+$))/g),
              trigger:
                ['numberBox'].indexOf(item.categoryType) !== -1
                  ? ['blur']
                  : ['change', 'blur']
            }"
          >
            <template v-slot:label>
              <div class="flow1" :title="item.criteria">
                {{ item.criteria }}
              </div>
            </template>
            <!-- 文本 -->
            <el-input
              v-model="item.value"
              maxlength="50"
              v-if="['textField'].indexOf(item.categoryType) !== -1"
            ></el-input>

            <!-- 单选，多选 -->
            <el-select
              v-model="item.value"
              placeholder=""
              style="width: 100%"
              clearable
              :multiple="['multiOption'].indexOf(item.categoryType) !== -1"
              :collapse-tags="['multiOption'].indexOf(item.categoryType) !== -1"
              class="flex-1"
              v-if="
                ['singleOption', 'multiOption'].indexOf(item.categoryType) !==
                -1
              "
            >
              <el-option
                v-for="dict in item.optionList.filter(
                  x => x.optionName && x.optionName.trim() !== ''
                )"
                :key="dict.customId"
                :label="dict.optionName"
                :value="dict.customId"
              ></el-option>
            </el-select>
            <!-- 日期 -->
            <el-date-picker
              v-model="item.value"
              :editable="false"
              type="date"
              :format="fmtForYmd"
              value-format="x"
              class="form-wd"
              placeholder
              style="width: 100%"
              v-if="['dateSelection'].indexOf(item.categoryType) !== -1"
            ></el-date-picker>

            <!-- 数字 -->
            <el-input-number
              v-model="item.value"
              :precision="0"
              v-thousandSplit="{ precision: 0 }"
              type="number"
              class="form-wd textleft"
              :min="1"
              :max="999999999999"
              placeholder="1 - 999999999999"
              style="width: 100%"
              controls-position="right"
              v-if="['numberBox'].indexOf(item.categoryType) !== -1"
            />
            <!-- 复选框 -->
            <el-checkbox
              v-model="item.value"
              v-if="['checkBox'].indexOf(item.categoryType) !== -1"
            >
            </el-checkbox>
          </el-form-item>
        </el-form>
      </li>
    </ul>

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="dialogTableVisible = false">{{
          $t('uiBtn.back')
        }}</el-button>

        <el-button type="primary" @click="submitForm">{{
          $t('uiBtn.submit')
        }}</el-button>
      </div>
    </template>
    <verificationFailDlg
      ref="verificationFailDlg"
      :list="list"
      @onSuccess="dialogTableVisible = false"
    />
  </el-dialog>
</template>

<script>
import { leadVerificationPassed } from '@/api/leads/leads'
import { queryLeadQualificationCriteriaById } from '@/api/system/leadValidationCriteria'
import verificationFailDlg from './verificationFailDlg'
export default {
  components: { verificationFailDlg },
  data() {
    return {
      dialogTableVisible: false,
      loading: false,
      form: {},
      rules: {},
      list: [],
      rowId: undefined
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    }
  },
  methods: {
    // 验证标准输入值是否必填/是否禁用
    isFieldRequired(item) {
      const { categoryType, validationType } = item
      if (
        ['textField', 'singleOption', 'multiOption'].indexOf(categoryType) !==
        -1
      ) {
        if (['null', 'notNull'].indexOf(validationType) !== -1) {
          return false
        }
        return true
      }
      return true
    },
    queryLeadQualificationCriteriaById() {
      queryLeadQualificationCriteriaById({}).then(res => {
        const { leadQualificationCriteriaList } = res.data
        if (
          leadQualificationCriteriaList &&
          leadQualificationCriteriaList.length > 0
        ) {
          this.list = leadQualificationCriteriaList || []
          // 验证标准数据转换
          this.list.forEach(x => {
            x.customId = x.leadQualificationCriteriaId
            x.value = undefined
            if (
              ['singleOption', 'multiOption'].indexOf(x.categoryType) !== -1
            ) {
              x.validationValue = x.validationStrValue.split(',') || ''
            } else if (
              ['numberBox', 'dateSelection'].indexOf(x.categoryType) !== -1
            ) {
              x.validationValue = x.validationIntValue
            } else {
              x.validationValue = x.validationStrValue
            }
          })
        } else {
          const obj = JSON.parse(JSON.stringify(row))
          obj.customId = Date.now()
          this.list = [obj]
        }
      })
    },

    reset() {
      this.form = {}
      this.list = []
      this.resetForm('form')
    },
    close() {
      this.reset()
      this.dialogTableVisible = false
      this.$emit('onSuccess')
    },
    open(rowId) {
      this.rowId = rowId
      this.reset()
      this.queryLeadQualificationCriteriaById()
      this.dialogTableVisible = true
    },
    // 文本框验证
    textFieldValidation(item) {
      // equalTo: '等于'
      // notEqualTo: '不等于'
      // like: '包含'
      // notLike: '不含'
      // null: '为空'
      // notNull: '不为空'
      const { validationType, validationStrValue, value } = item
      if (validationType === 'equalTo') {
        // 验证等于：值不相等时不通过
        if (!value || value !== validationStrValue) return true
      } else if (validationType === 'notEqualTo') {
        // 验证不等于：值相等时不通过
        if (value === validationStrValue) return true
      } else if (validationType === 'like') {
        if (!value) return true
        // 验证包含：值不包含时不通过
        if (!value.includes(validationStrValue)) return true
      } else if (validationType === 'notLike') {
        if (!value) return false
        // 验证不包含：值包含时不通过
        if (value.includes(validationStrValue)) return true
      } else if (validationType === 'null') {
        // 验证为空：值不为空时不通过
        if (value) return true
      } else if (validationType === 'notNull') {
        // 验证不为空：值为空时不通过
        if (!value) return true
      }
      return false
    },
    // 下拉验证
    selectValidation(item) {
      // equalTo: '等于'
      // notEqualTo: '不等于'
      // like: '包含'
      // notLike: '不含'
      // null: '为空'
      // notNull: '不为空'
      let { validationType, validationStrValue, categoryType, value } = item
      let newValue = value
      /* 空值验证 */
      if (categoryType === 'singleOption') {
        // 单选
        if (!value) {
          // 值为空时，验证类型为空，不含，不等于时通过
          if (['null', 'notLike', 'notEqualTo'].indexOf(validationType) !== -1)
            return false
          return true
        } else {
          newValue = [value]
        }
      } else if (categoryType === 'multiOption') {
        // 多选
        if (!value || value.length <= 0) {
          // 值为空时，验证类型为空，不含，不等于时通过
          if (['null', 'notLike', 'notEqualTo'].indexOf(validationType) !== -1)
            return false
          return true
        }
      }

      if (validationType === 'null') {
        // 验证为空：直接不通过
        return true
      } else if (validationType === 'notNull') {
        // 验证不为空：直接通过
        return false
      }

      /* 有值验证 */
      let newValidationStrValue = validationStrValue.split(',')
      // 值排序转字符串数组，判断是否相等 true：等于 false：不等于
      const isEqual =
        JSON.stringify(newValue.sort()) ===
        JSON.stringify(newValidationStrValue.sort())
      // 验证数组值是否包含，用户所选择的值 true：包含 false：不包含
      const isContained = newValidationStrValue.every(item =>
        newValue.includes(item)
      )
      if (validationType === 'equalTo') {
        // 验证等于：不等于时不通过
        if (!isEqual) return true
      } else if (validationType === 'notEqualTo') {
        // 验证不等于：等于时不通过
        if (isEqual) return true
      } else if (validationType === 'like') {
        // 验证包含：不包含时不通过
        if (!isContained) return true
      } else if (validationType === 'notLike') {
        // 验证不包含：包含时不通过
        if (isContained) return true
      }
      return false
    },
    // 时间验证
    dateSelectionValidation(item) {
      // equalTo: '等于'
      // notEqualTo: '不等于'
      // greaterThan: '大于'
      // lessThan: '小于'

      // hour: '小时',
      // day: '天',
      // week: '周',
      // month: '月',
      // year: '年',
      const { validationType, validationIntValue, value, validationDateType } =
        item
      // 时间值为空，只有验证条件等于'notEqualTo'时，才验证通过，否则验证不通过
      if (!value) {
        if (validationType === 'notEqualTo') {
          return false
        }
        return true
      }
      // 验证时间转换为天
      let newValidationStrValue = undefined
      if (validationDateType === 'hour') {
        newValidationStrValue = validationIntValue / 24
      } else if (validationDateType === 'day') {
        newValidationStrValue = validationIntValue * 1
      } else if (validationDateType === 'week') {
        newValidationStrValue = validationIntValue * 7
      } else if (validationDateType === 'month') {
        newValidationStrValue = validationIntValue * 30
      } else if (validationDateType === 'year') {
        newValidationStrValue = validationIntValue * 365
      }
      // 表单输入时间转化为天
      const current = this.appointTime(Date.now(), '00:00:00')
      const newValue = (value - current) / 60 / 60 / 24 / 1000
      if (validationType === 'equalTo') {
        // 验证等于：值不相等时不通过
        if (newValidationStrValue * 1 !== newValue * 1) return true
      } else if (validationType === 'notEqualTo') {
        // 验证不等于：值相等时不通过
        if (newValidationStrValue * 1 === newValue * 1) return true
      } else if (validationType === 'greaterThan') {
        // 验证大于：值小于时不通过
        if (newValidationStrValue * 1 > newValue * 1) return true
      } else if (validationType === 'lessThan') {
        // 验证小于：值大于时不通过
        if (newValidationStrValue * 1 < newValue * 1) return true
      }
      return false
    },
    // 数字验证
    numberBoxValidation(item) {
      // equalTo: '等于'
      // notEqualTo: '不等于'
      // greaterThan: '大于'
      // lessThan: '小于'
      const { validationType, validationIntValue, value } = item
      if (value === undefined || isNaN(value)) {
        if (validationType === 'notEqualTo') {
          return false
        }
        return true
      }
      if (validationType === 'equalTo') {
        // 验证等于：值不相等时不通过
        if (validationIntValue * 1 !== value * 1) return true
      } else if (validationType === 'notEqualTo') {
        // 验证不等于：值相等时不通过
        if (validationIntValue * 1 === value * 1) return true
      } else if (validationType === 'greaterThan') {
        // 验证大于：值小于等于时不通过
        if (validationIntValue * 1 >= value * 1) return true
      } else if (validationType === 'lessThan') {
        // 验证小于：值大于等于时不通过
        if (validationIntValue * 1 <= value * 1) return true
      }
      return false
    },
    // 复选框验证
    checkBoxValidation(item) {
      // null: '为空'
      // notNull: '不为空'
      const { validationType, value } = item
      if (validationType === 'null') {
        // 验证为空：值不为空时不通过
        if (value) return true
      } else if (validationType === 'notNull') {
        // 验证不为空：值为空时不通过
        if (!value) return true
      }
      return false
    },
    submitForm() {
      let valid = false
      const flag = this.list.some(x => {
        const { categoryType } = x
        if (categoryType === 'textField') {
          valid = this.textFieldValidation(x)
          if (valid) return valid
        } else if (
          ['singleOption', 'multiOption'].indexOf(categoryType) !== -1
        ) {
          valid = this.selectValidation(x)
          if (valid) return valid
        } else if (categoryType === 'dateSelection') {
          valid = this.dateSelectionValidation(x)
          if (valid) return valid
        } else if (categoryType === 'numberBox') {
          valid = this.numberBoxValidation(x)
          if (valid) return valid
        } else if (categoryType === 'checkBox') {
          valid = this.checkBoxValidation(x)
          if (valid) return valid
        }
        return false
      })

      if (flag) {
        this.$message.error(this.$t('customer.verificationFailed1'))
        this.$refs.verificationFailDlg.open(this.rowId)
        return
      }

      this.$modal
        .confirm(this.$t('ui.submitPageConfirm'))
        .then(() => {
          this.list.forEach(x => {
            if (['multiOption'].indexOf(x.categoryType) !== -1) {
              x.validationStrValue = (x.value || []).join(',')
            } else if (
              ['numberBox', 'dateSelection'].indexOf(x.categoryType) !== -1
            ) {
              x.validationIntValue = x.value * 1
            } else if (['checkBox'].indexOf(x.categoryType) !== -1) {
              x.validationStrValue = x.value ? '1' : '0'
            } else {
              x.validationStrValue = x.value
            }
          })
          let params = {
            leadQualificationCriteria: {
              leadQualificationCriteriaList: this.list
            },
            leadId: this.rowId
          }
          return leadVerificationPassed(params)
        })
        .then(response => {
          this.$modal.msgSuccess(this.$t('customer.verificationPassed1'))
          this.close()
        })
        .catch(() => {})
    }
  }
}
</script>
