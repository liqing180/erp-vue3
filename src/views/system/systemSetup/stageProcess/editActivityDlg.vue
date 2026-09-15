<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="title"
    v-model="open"
    width="1000px"
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
        <el-col :span="8">
          <el-form-item :label="$t('SALES.activityType')">
            <el-input
              :value="selectDictLabel(activity_type, form.activityType)"
              class="form-wd"
              maxlength="50"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('SALES.activityName')">
            <el-input
              :value="form.activityName"
              :title="form.activityName"
              class="form-wd"
              maxlength="50"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item :label="$t('SALES.stageName')">
            <el-input
              :value="form.stageItemName"
              :title="form.stageItemName"
              class="form-wd"
              maxlength="50"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item
            :label="$t('SALES.activityPercentage')"
            prop="percentage"
          >
            <el-input-number
              class="w100"
              v-model="form.percentage"
              controls-position="right"
              placeholder="1 - 100"
              :min="1"
              :max="100"
              @change="inputNumberChange('percentage')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item
            :label="$t('SALES.nextActivity')"
            prop="nextActivityName"
          >
            <el-select
              style="width: 100%"
              v-model="form.nextActivityName"
              placeholder=""
              @change="nextActivityChange"
              clearable
            >
              <el-option
                v-for="item in nextActivityList"
                :key="item.activityName"
                :label="item.activityName"
                :value="item.activityName"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item :label="`${$t('ui.description')}`" prop="description">
            <el-input
              type="textarea"
              v-model="form.description"
              :autosize="{ minRows: 2, maxRows: 4 }"
              resize="none"
              show-word-limit
              :maxlength="3000"
              disabled
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="`${$t('SALES.isCompulsory')}`">
            <el-switch
              v-model="form.required"
              active-value="1"
              inactive-value="0"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('SALES.isRepeat')}`">
            <el-switch
              v-model="form.allowRepeat"
              active-value="1"
              inactive-value="0"
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
        percentage: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: 'blur'
          }
        ]
      },
      nextActivityList: [],
      activity_type: []
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
  created() {
    const { activity_type } = this.useDict('activity_type')
    this.activity_type = activity_type || []
  },
  methods: {
    inputNumberChange(code) {
      this.$refs.formRef.validateField(code)
    },
    nextActivityChange(value) {
      if (value) {
        const select = this.nextActivityList.find(
          item => item.activityName === value
        )
        this.form.nextActivityId = select.activityId
        this.form.nextActivityName = select.activityName
      } else {
        this.form.nextActivityId = undefined
        this.form.nextActivityName = undefined
      }
    },
    reset() {
      this.form = {
        activityName: '',
        percentage: undefined,
        nextActivityId: undefined,
        nextActivityName: undefined
      }
      this.resetForm('formRef')
    },
    /** 修改按钮操作 */
    handleUpdate(item, canSelectNextActivityList) {
      this.nextActivityList = canSelectNextActivityList || []
      this.reset()
      this.open = true
      this.title = this.$t('SALES.editStage')
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
          let param = JSON.parse(JSON.stringify(this.form))
          param = this.$trimOfObj(param)

          this.btnLoading = true
          setTimeout(() => {
            this.btnLoading = false
          }, 1000)
          this.open = false
          this.$emit('onSuccess', param)
        }
      })
    }
  }
}
</script>
