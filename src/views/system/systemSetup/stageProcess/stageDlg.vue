<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="title"
    v-model="open"
    width="800px"
    append-to-body
    @closed="closed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="160px"
      class="mr20"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('SALES.stageName')" prop="stageName">
            <el-input
              v-model="form.stageName"
              :title="form.stageName"
              class="form-wd"
              maxlength="50"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.stageType !== '4'">
          <el-form-item
            :label="$t('SALES.stagePercentage')"
            prop="occupyPercentage"
          >
            <el-input-number
              class="w100"
              v-model="form.occupyPercentage"
              controls-position="right"
              :placeholder="`${1} - ${max}`"
              :min="1"
              :max="max"
              @change="inputNumberChange('occupyPercentage')"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="form.stageType !== '4'">
        <el-col :span="24">
          <el-form-item
            :label="`${$t('SALES.stageCompletionRules')}`"
            prop="stageCompletionRules"
          >
            <el-checkbox-group v-model="form.stageCompletionRules">
              <el-checkbox
                :label="$t('SALES.compulsoryActivitiesCompleted')"
                value="1"
              />
              <el-checkbox
                :label="$t('SALES.stagePercentageReached')"
                value="2"
              />
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="form.stageType === '2'">
        <el-col :span="12">
          <el-form-item :label="`${$t('SALES.quotedStage')}`">
            <el-switch
              v-model="form.isActive"
              active-value="1"
              inactive-value="0"
              :disabled="!isCanEditStage"
            ></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="cancel">{{ $t('uiBtn.back') }}</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="btnLoading"
          v-if="!comDisFrom"
          >{{ $t('uiBtn.save') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      btnLoading: false,
      open: false,
      title: '',
      form: {},
      // 表单校验
      rules: {
        stageName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: 'blur'
          }
        ],
        occupyPercentage: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: 'blur'
          }
        ],
        stageCompletionRules: [
          {
            type: 'array',
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: 'change'
          }
        ]
      },
      max: 99
    }
  },
  props: {
    isCanEditStage: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['system:role:edit'])
    },
    comDisFrom() {
      return false
    }
  },
  methods: {
    inputNumberChange(code) {
      this.$refs.formRef.validateField(code)
    },
    reset() {
      this.form = {
        stageName: '',
        occupyPercentage: undefined,
        stageCompletionRules: [],
        isActive: '1'
      }
      this.resetForm('formRef')
    },
    handleAdd(stageList) {
      this.stageList = stageList
      this.title = this.$t('SALES.addStage')
      let percentage = 0
      stageList.forEach((item, index) => {
        if (index === stageList.length - 1) return
        percentage += item.occupyPercentage
      })
      if (percentage >= 99) {
        this.$message.error(this.$t('SALES.stagesAddErrTip'))
        return
      }
      this.open = true
      this.max = 99 - percentage
    },
    /** 修改按钮操作 */
    handleUpdate(stageList, item, itemIndex) {
      this.stageList = stageList
      this.reset()
      this.open = true
      let percentage = 0
      stageList.forEach((item, index) => {
        if (index === stageList.length - 1) return
        if (index === itemIndex) return
        percentage += item.occupyPercentage
      })
      this.max = 99 - percentage

      this.title = this.$t('SALES.editStage')
      item.stageCompletionRules = []
      if (item.requiredActivityComplete === '1') {
        item.stageCompletionRules.push('1')
      }
      if (item.requiredPercentageComplete === '1') {
        item.stageCompletionRules.push('2')
      }
      this.form = Object.assign(this.form, item)
    },
    // 取消按钮
    cancel() {
      this.open = false
    },
    closed() {
      this.reset()
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          let param = { ...this.form }
          param.stageName = param.stageName.trim()

          if (param.stageCompletionRules.includes('1')) {
            param.requiredActivityComplete = '1'
          } else {
            param.requiredActivityComplete = '0'
          }
          if (param.stageCompletionRules.includes('2')) {
            param.requiredPercentageComplete = '1'
          } else {
            param.requiredPercentageComplete = '0'
          }

          const alreadyExists = this.stageList.find(item => {
            return (
              item.stageName === param.stageName &&
              item.rowTimeId !== param.rowTimeId
            )
          })
          if (alreadyExists) {
            this.$message.error(
              this.$t('SALES.stagesAddExistsTip').replace(
                '$1',
                alreadyExists.stageName
              )
            )
            return
          }

          this.btnLoading = true
          setTimeout(() => {
            this.btnLoading = false
          }, 1000)
          this.open = false
          this.$emit('onSuccess', param)

          /* this.$modal
            .confirm(this.$t('SALES.stageSaveConfirm'))
            .then(() => {
              this.btnLoading = true
              setTimeout(() => {
                this.btnLoading = false
              }, 1000)
              this.$modal.msgSuccess(
                this.$t('SALES.stageSaveSuccess').replace(
                  '$1',
                  this.form.stageName
                )
              )
              this.open = false
              this.$emit('onSuccess', param)
            })
            .catch(() => {
              setTimeout(() => {
                this.btnLoading = false
              }, 1000)
            }) */
        }
      })
    }
  },
  emits: ['onSuccess']
}
</script>
