<template>
  <el-dialog
    :close-on-click-modal="false"
    v-model="open"
    :title="$t('uiBtn.import')"
    width="600px"
    top="5vh"
    append-to-body
    @closed="closed"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="150px"
      class="mr20"
    >
      <el-form-item :label="$t('ui.uploadTemplate')">
        <el-button
          type="primary"
          icon="Download"
          :loading="downLoading"
          style="width: 100%"
          @click="downLoad"
          >{{ $t('ui.clickToDownload') }}</el-button
        >
      </el-form-item>
      <el-form-item :label="$t('ui.uploadData')" prop="file">
        <el-upload
          ref="upload"
          :limit="2"
          accept=".xlsx, .xls"
          :headers="headers"
          :action="importOptions.uploadUrl + '?updateSupport=' + updateSupport"
          :disabled="isUploading"
          :on-progress="handleFileUploadProgress"
          :before-upload="handleBeforeUpload"
          :before-remove="beforeRemove"
          :on-success="handleFileSuccess"
          :auto-upload="true"
          :file-list="fileList"
          :on-change="handleChange"
          drag
        >
          <i class="el-icon-upload"></i>
          <div
            class="el-upload__text"
            style="padding: 0 20px; word-break: break-word"
          >
            {{ $t('ui.uploadToast') }}
          </div>
        </el-upload>
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="cancel">{{ $t('uiBtn.back') }}</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          :disabled="isUploading"
          :loading="btnLoading"
          >{{ $t('uiBtn.submit') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { importData, downTemplate } from '@/api/basic/basic'
import { getToken } from '@/utils/auth'
export default {
  props: {
    importOptions: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      btnLoading: false,
      downLoading: false,
      open: false,
      form: {},
      // 表单校验
      rules: {
        file: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('ui.uploadData')
            ),
            trigger: ['change', 'blur']
          }
        ]
      },
      fileList: [],
      isUploading: false,
      updateSupport: 0,
      headers: { Authorization: 'Bearer ' + getToken() },
      accept: ['.xlsx', '.xls']
    }
  },
  computed: {
    comAccept() {
      if (this.accept && this.accept.length > 0) {
        return this.accept.join(',')
      }
      return '.xlsx, .xls'
    }
  },
  methods: {
    reset() {
      this.form = {
        fail: undefined
      }
      this.$refs.upload.clearFiles()
      this.isUploading = false
      this.resetForm('form')
    },
    /** 修改按钮操作 */
    show() {
      this.open = true
    },
    // 取消按钮
    cancel() {
      this.open = false
    },
    closed() {
      this.reset()
    },
    // 下载
    downLoad() {
      this.downLoading = true
      downTemplate(this.importOptions.downFileUrl)
        .then(response => {
          this.$download.name(response.msg)
          this.downLoading = false
        })
        .catch(() => {
          this.downLoading = false
        })

      // this.$importOrExportDownFile(
      //   this.importOptions.downFileUrl,
      //   {},
      //   `${this.getFileNameDate(
      //     this.importOptions.fileName || 'template'
      //   )}.xlsx`
      // )
      //   .then(() => {
      //     this.downLoading = false
      //   })
      //   .catch(() => {
      //     this.downLoading = false
      //   })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.isUploading = true
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1)
    },
    handleBeforeUpload(file) {
      const vm = this
      vm.fullscreenLoading = true
      if (this.accept && this.accept.length > 0) {
        const findItem = this.accept.find(item => {
          return file.name.toLowerCase().indexOf(item) !== -1
        })
        if (!findItem) {
          const vm = this
          const str = vm.accept.join('/')
          vm.$message.error(vm.$t('ui.uploadTypeErrorReq').replace('$1', str))
          return false
        }
      }
      return true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      if (!this.open) return
      this.isUploading = false
      if (response.code !== 200) {
        this.form['file'] = undefined
        this.$refs.upload.clearFiles()
        this.$alert(response.msg, '', { dangerouslyUseHTMLString: true })
      } else {
        this.form['file'] = file.raw
        console.log(file)
        this.$refs.form.clearValidate('file')
      }
    },
    beforeRemove() {
      this.form['file'] = undefined
      this.$refs.form.validateField('file')
    },
    /** 提交按钮 */
    submitForm: function () {
      const vm = this
      this.$refs.form.validate(valid => {
        if (valid) {
          vm.form.file
            .arrayBuffer()
            .then(res => {
              vm.$modal
                .confirm(vm.$t('ui.submitPageConfirm'))
                .then(() => {
                  vm.btnLoading = true
                  const formData = new FormData()

                  formData.append('file', vm.form.file)

                  return importData(vm.importOptions.importUrl, formData)
                })
                .then(response => {
                  vm.btnLoading = false
                  vm.$modal.msgSuccess(vm.$t('ui.submitPageSuccess'))
                  vm.cancel()
                  $emit(vm, 'onSuccess', response)
                })
                .catch(err => {
                  vm.btnLoading = false
                  if (vm.$TypeJudge.isObject(err) && err.code === 701) {
                    vm.cancel()
                  }
                })
            })
            .catch(() => {
              this.form['file'] = undefined
              this.$refs.upload.clearFiles()
              vm.$message.error(vm.$t('ui.fileModifiedTip'))
            })
        }
      })
    }
  },
  emits: ['onSuccess']
}
</script>
