<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="760px"
    append-to-body
    :close-on-click-modal="false"
    @close="close"
    @closed="reset"
  >
    <el-form label-width="140px">
      <el-form-item :label="operatorLabel">
        <el-input :model-value="operator" disabled />
      </el-form-item>
      <el-form-item :label="$t('PURCHASE.actionReason')" :required="reasonRequired">
        <el-input
          v-model="reason"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      <el-form-item v-if="needsAttachment" :label="$t('ui.attachment')">
        <myUpload ref="uploadRef" :disabled="false" :limit="9" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close">{{ $t('uiBtn.back') }}</el-button>
      <el-button type="primary" :loading="loading" @click="confirm">
        {{ $t('uiBtn.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'PrActionDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      required: true,
      validator: value => ['approve', 'reject', 'cancel', 'close'].includes(value)
    },
    operator: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'confirm'],
  data() {
    return {
      reason: ''
    }
  },
  computed: {
    title() {
      const map = {
        approve: this.$t('PURCHASE.approvalOpinion'),
        reject: this.$t('PURCHASE.rejectionOpinion'),
        cancel: this.$t('PURCHASE.cancelReason'),
        close: this.$t('PURCHASE.closeReason')
      }
      return map[this.type]
    },
    operatorLabel() {
      const map = {
        approve: this.$t('ui.approvedBy'),
        reject: this.$t('ui.rejectedBy'),
        cancel: this.$t('ui.cancelledBy'),
        close: this.$t('ui.closedBy')
      }
      return map[this.type] || this.$t('ui.operName')
    },
    reasonRequired() {
      return ['reject', 'cancel', 'close'].includes(this.type)
    },
    needsAttachment() {
      return ['cancel', 'close'].includes(this.type)
    }
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
    },
    reset() {
      this.reason = ''
      this.$refs.uploadRef?.initFileList?.([])
    },
    confirm() {
      if (this.reasonRequired && !this.reason.trim()) {
        this.$modal.msgError(this.$t('ui.reqMsg'))
        return
      }

      let commonFileList = []
      if (this.needsAttachment) {
        commonFileList = this.$refs.uploadRef?.getFileIds?.() ?? []
        if (commonFileList === false) return
      }

      this.$emit('confirm', {
        reason: this.reason.trim(),
        commonFileList
      })
    }
  }
}
</script>
