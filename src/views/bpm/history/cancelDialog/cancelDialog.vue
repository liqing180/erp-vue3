<template>
  <el-dialog
    draggable
    :title="$t('cancel.dialogTitle')"
    v-model="visible"
    width="1140px"
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="195px">
      <el-row>
        <el-col :span="24">
          <el-form-item :label="`${$t('ui.cancelledBy')}`" prop="cancelledBy">
            <el-input
              v-model="form.cancelledBy"
              :title="!form.cancelledBy"
              type="text"
              disabled
              class="form-wd"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="false">
          <el-form-item
            :label="`${$t('cancel.dateCancelled')}`"
            prop="dateCancelled"
          >
            <el-date-picker
              :model-value="form.dateCancelled"
              :editable="false"
              disabled
              type="date"
              :format="fmtForYmdhms"
              :style="{ width: '100%' }"
              placeholder
            ></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item :label="`${$t('ui.reason')}`" prop="reason">
            <MyInput
              type="textarea"
              v-model="form.reason"
              :autosize="{ minRows: 1, maxRows: 4 }"
              resize="none"
              show-word-limit
              :maxlength="200"
            ></MyInput>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="`${$t('ui.attachment')}`" prop="fileIds">
            <myUpload ref="uploadRef" :disabled="false" :limit="9" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer
      ><div class="dialog-footer">
        <el-button @click="back">{{ $t('ui.back') }}</el-button>
        <el-button
          type="primary"
          :loading="fullscreenLoading"
          @click="submitForm"
          >{{ $t('uiBtn.submit') }}</el-button
        >
      </div></template
    >
  </el-dialog>
</template>

<script>
import i18n from '@/lang'

import locale from './locale'
import { cancelleActivitiTask, cancelleActivitiProcess } from '@/api/bpm/bpm'

export default {
  emits: ['onSuccess'],
  components: {},
  props: {
    /* 后端使用 业务审批或正常审批:1, 管理员审批: 3 */
    fromType: {
      type: String,
      default: '1'
    }
  },
  data() {
    const vm = this
    return {
      visible: false,
      fullscreenLoading: false,
      form: {},
      rules: {
        reason: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g), // 不能全部是空格
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  beforeCreate() {
    i18n.global.mergeLocaleMessage('zh', locale.zh)
    i18n.global.mergeLocaleMessage('en', locale.en)
  },
  methods: {
    handleOpen(row) {
      this.reset()
      if (row) {
        this.form = Object.assign(this.form, row)
      }
      this.visible = true
    },
    reset() {
      this.form = {
        reason: '',
        cancelledBy: this.$store.state.user.nickName
      }
      this.$refs.uploadRef && this.$refs.uploadRef.initFileList([])
      this.resetForm('form')
    },
    back() {
      this.visible = false
    },
    submitForm() {
      if (this.fullscreenLoading) {
        return
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          const vm = this
          vm.fullscreenLoading = true
          const param = {
            processInstance: vm.form.processInstance,
            reason: vm.form.reason,
            taskId: vm.form.taskId || undefined,
            fromType: this.fromType,
            moduleKey: vm.form.moduleKey,
            businessId: vm.form.businessId
          }
          const fileIds = this.$refs.uploadRef.getFileIds()
          if (fileIds === false) {
            vm.fullscreenLoading = false
            return
          }
          param.commonFileList = fileIds
          let fnApi = cancelleActivitiProcess
          if (vm.form.taskId) {
            fnApi = cancelleActivitiTask
          }
          fnApi(param)
            .then(() => {
              vm.$message.success(
                `${vm.$t('cancel.cancelSubmit').replace('$1', vm.form.processName)}`
              )
              this.back()
              vm.$emit('onSuccess')
              vm.fullscreenLoading = false
            })
            .catch(() => {
              vm.fullscreenLoading = false
            })
        }
      })
    }
  }
}
</script>
