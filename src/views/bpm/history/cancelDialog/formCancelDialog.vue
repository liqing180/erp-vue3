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
            <MyDatePicker
              :model-value="form.dateCancelled"
              :editable="false"
              disabled
              type="date"
              :format="fmtForYmdhms"
              :style="{ width: '100%' }"
              placeholder
            ></MyDatePicker>
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
import locale from './locale'
import i18n from '@/lang'

export default {
  emits: ['submitSuccess'],
  components: {},
  props: {
    cancelApiUrl: {
      type: Function,
      default: null
    },
    taskId: {
      type: String,
      default: ''
    },

    fromType: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    },
    ids: {
      type: Array,
      default: () => []
    },
    path: {
      type: String,
      default: ''
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

            pattern: new RegExp(/^(?!(\s+$))/g),
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
    handleOpen() {
      this.reset()
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
          const param = {
            taskId: vm.taskId || undefined,
            fromType: this.fromType,
            reason: vm.form.reason
          }
          if (this.path === 'salesOrder') {
            param.salesOrderProductIdList = vm.ids
          } else {
            param.businessId = vm.id
          }
          const fileIds = this.$refs.uploadRef.getFileIds()
          if (fileIds === false) {
            return
          }
          param.commonFileList = fileIds
          if (vm.cancelApiUrl) {
            vm.fullscreenLoading = true
            vm.cancelApiUrl(param)
              .then(res => {
                if (res.code === 200) {
                  vm.$emit('submitSuccess')
                  this.back()
                }
                vm.fullscreenLoading = false
              })
              .catch(() => {
                vm.fullscreenLoading = false
              })
          }
        }
      })
    }
  }
}
</script>
