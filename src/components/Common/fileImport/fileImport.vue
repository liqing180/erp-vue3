<template>
  <el-dialog
    :model-value="Boolean(importOptions.open)"
    :close-on-click-modal="false"
    :title="importOptions.title"
    width="400px"
    append-to-body
    @update:model-value="handleVisibleChange"
    @close="close"
  >
    <el-upload
      ref="upload"
      :limit="1"
      :accept="comAccept"
      :headers="headers"
      :action="`${importOptions.url}?updateSupport=${Number(updateSupport)}`"
      :disabled="importOptions.isUploading"
      :on-progress="handleFileUploadProgress"
      :before-upload="handleBeforeUpload"
      :on-success="handleFileSuccess"
      :auto-upload="false"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        {{ $t('ui.uploadTip1') }} <em>{{ $t('ui.uploadTip2') }}</em>
      </div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            {{ $t('ui.updateExisting') }}
          </div>
          <span>{{ $t('ui.uploadTip3').replace('$1', 'xls、xlsx') }}</span>
          <el-link
            type="primary"
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            @click="importTemplate"
          >
            {{ $t('ui.downloadTemplate') }}
          </el-link>
        </div>
      </template>
    </el-upload>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="updateOpen(false)">{{ $t('uiBtn.back') }}</el-button>
        <el-button type="primary" @click="submitFileForm">
          {{ $t('uiBtn.submit') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'

export default {
  name: 'FileImport',
  components: {
    UploadFilled
  },
  props: {
    importOptions: {
      type: Object,
      required: true
    },
    accept: {
      type: Array,
      default: () => ['.xlsx', '.xls']
    }
  },
  emits: ['updateImport', 'importTemplate', 'fileImportSuccess'],
  data() {
    return {
      updateSupport: false
    }
  },
  computed: {
    headers() {
      return { Authorization: 'Bearer ' + getToken() }
    },
    comAccept() {
      return this.accept.length > 0 ? this.accept.join(',') : '.xlsx,.xls'
    }
  },
  methods: {
    updateOpen(value) {
      this.$emit('updateImport', 'open', value)
    },
    handleVisibleChange(value) {
      if (!value) this.updateOpen(false)
    },
    importTemplate() {
      this.$emit('importTemplate')
    },
    handleFileUploadProgress() {
      this.$emit('updateImport', 'isUploading', true)
    },
    handleBeforeUpload(file) {
      if (!this.accept.length) return true

      const extension = file.name.includes('.')
        ? `.${file.name.split('.').pop()}`.toLowerCase()
        : ''
      const allowed = this.accept.some(item =>
        extension.includes(String(item).toLowerCase())
      )

      if (!allowed) {
        this.$modal.msgError(
          this.$t('ui.uploadTypeErrorReq').replace('$1', this.accept.join('/'))
        )
      }
      return allowed
    },
    handleFileSuccess(response) {
      this.$emit('updateImport', 'isUploading', false)
      this.$refs.upload?.clearFiles()
      ElMessageBox.alert(response.msg, '', { dangerouslyUseHTMLString: true })
      this.$emit('fileImportSuccess')
      this.updateOpen(false)
    },
    submitFileForm() {
      this.$refs.upload?.submit()
    },
    close() {
      this.$refs.upload?.clearFiles()
    }
  }
}
</script>
