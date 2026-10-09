<template>
  <el-dialog
    draggable
    :title="$t('ui.approvalReason')"
    v-model="approvedVisible"
    width="1000px"
    append-to-body
    :close-on-click-modal="false"
    @closed="closeCb"
  >
    <el-form
      ref="approveForm"
      :model="approveForm"
      :rules="approveFormRules"
      label-width="140px"
    >
      <el-col :span="24">
        <el-form-item :label="`${$t('ui.approvedBy')}`" prop="approvedName">
          <el-input
            v-model="approveForm.approvedName"
            :title="!approveForm.approvedName ? '' : approveForm.approvedName"
            type="text"
            disabled
          />
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item :label="`${$t('ui.reason')}`" prop="approvedReason">
          <MyInput
            type="textarea"
            v-model="approveForm.approvedReason"
            :autosize="{ minRows: 1, maxRows: 4 }"
            resize="none"
            show-word-limit
            :maxlength="200"
          ></MyInput>
        </el-form-item>
      </el-col>
    </el-form>

    <template #footer
      ><div class="dialog-footer">
        <el-button @click="handleBack">{{ $t('ui.back') }}</el-button>
        <el-button
          type="primary"
          :loading="btnLoading"
          @click="handleApprovedDlg"
          >{{ $t('uiBtn.submit') }}</el-button
        >
      </div></template
    >
  </el-dialog>
</template>

<script>
export default {
  emits: ['aplVisibleChange', 'submitSuccess'],
  props: {
    aplVisible: {
      type: Boolean,
      default: false
    },
    aplApiUrl: {
      type: Function,
      default: null
    },

    backCb: {
      type: Function
    },
    taskId: {
      type: String,
      default: ''
    },

    fromType: {
      type: String,
      default: '1'
    },
    id: {
      type: String,
      default: ''
    },
    formData: {
      type: Object
    },
    formDataKey: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      approveForm: {},
      approveFormRules: {},
      btnLoading: false
    }
  },

  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    approvedVisible: {
      get: function () {
        return this.aplVisible
      },
      set: function () {
        this.$emit('aplVisibleChange', false)
      }
    }
  },

  created() {
    this.approveForm.approvedName = this.$store.state.user.nickName
  },
  methods: {
    handleApprovedDlg() {
      const vm = this
      vm.approvedDlgValidate(valid => {
        if (valid) {
          vm.approvedSubmit()
        }
      })
    },
    approvedDlgValidate(callback) {
      this.$refs.approveForm.validate(valid => {
        callback && callback(valid)
      })
    },
    approvedSubmit() {
      const vm = this
      if (this.btnLoading) return
      this.btnLoading = true
      const param = {
        businessId: this.id,
        taskId: this.taskId,
        fromType: this.fromType,
        reason: vm.approveForm.approvedReason
      }
      if (this.formData && this.formDataKey) {
        param[this.formDataKey] = this.formData
      }
      if (vm.aplApiUrl) {
        vm.aplApiUrl(param)
          .then(res => {
            if (res.code === 200) {
              vm.$emit('submitSuccess')
            }
            vm.btnLoading = false
          })
          .catch(() => {
            vm.btnLoading = false
          })
      }
    },
    handleBack() {
      const vm = this
      vm.approveForm.approvedReason = ''
      if (vm.$refs.approveForm) {
        vm.$refs.approveForm.clearValidate()
      }
      if (typeof vm.backCb === 'function') {
        vm.backCb()
      }
      vm.$emit('aplVisibleChange', false)
    },
    closeCb() {
      const vm = this
      vm.approveForm.approvedReason = ''
      if (vm.$refs.approveForm) {
        vm.$refs.approveForm.clearValidate()
      }
      this.$emit('aplVisibleChange', false)
    }
  }
}
</script>
