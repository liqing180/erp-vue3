<template>
  <el-dialog
    :close-on-click-modal="false"
    v-dialogDrag
    v-dialogDragWidth
    v-model="open"
    width="900px"
    append-to-body
    top="5vh"
    @close="close"
    @closed="closed"
    class="dialog"
    :show-close="false"
  >
    <div class="pdf" id="pdf">
      <div class="header">
        <img src="@/assets/logo/logo_01.png" class="logo" alt="" />
        <div style="margin: 0 300px">
          <div class="title">
            {{ previewForm.questionnaireTemplateName }}
          </div>
        </div>
      </div>
      <div class="desc mt10" v-if="previewForm.description">
        {{ previewForm.description }}
      </div>
      <paper ref="paper" class="mt20" :isDisabled="!showSubmit" />
    </div>

    <template #footer
      ><div class="dialog-footer">
        <el-form>
          <el-button type="primary" @click="cancel" v-if="showCancel">{{
            $t('uiBtn.cancel')
          }}</el-button>
          <el-button @click="close">{{ $t('uiBtn.back') }}</el-button>
          <el-button
            type="primary"
            :loading="btnLoading"
            @click="getPdf('export')"
            v-if="previewForm.customerQuestionnaireStatus !== '1'"
            >{{ $t('SALES.exportQuestionnaire') }}</el-button
          >
          <el-button type="primary" @click="submit" v-if="showSubmit">{{
            $t('uiBtn.submit')
          }}</el-button>
        </el-form>
      </div></template
    >

    <exportPDF ref="exportPDF" @exportSuccess="exportLoading = false" />
  </el-dialog>
</template>

<script>
// import html2Canvas from 'html2canvas'
// import JsPDF from 'jspdf'
import paper from '@/views/salesManagement/questionnaireTemplate/components/paper.vue'
import {
  cancelledCustomerQuestionnaire,
  updateCustomerQuestionnaire
} from '@/api/salesManagement/customerQuestionnaire'
import exportPDF from '@/views/salesManagement/questionnaireTemplate/components/exportPDF.vue'

export default {
  emits: ['onSuccess', 'closed'],
  components: { paper, exportPDF },
  props: {
    isCancel: {
      type: Boolean,
      default: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      open: false,
      previewForm: {},
      btnLoading: false
    }
  },

  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    showCancel() {
      if (this.isCancel) {
        const { buttonAuthMsg } = this.previewForm
        if (buttonAuthMsg && buttonAuthMsg.isCanCancelled === '1') {
          return true
        }
        return false
      }
      return false
    },
    showSubmit() {
      if (!this.isDisabled) {
        const { buttonAuthMsg } = this.previewForm
        // if (customerQuestionnaireStatus === '1') return true
        if (buttonAuthMsg && buttonAuthMsg.isCanUpdate === '1') {
          return true
        }
        return false
      }

      return false
    }
  },
  methods: {
    handleOpen(form = {}) {
      this.open = true
      this.previewForm = form
      const { categoryList } = form
      categoryList.forEach(x => {
        x.questionsList &&
          x.questionsList.forEach(k => {
            k.customResult = k.explanationAnswer || undefined
            if (k.answersCategory === '1') {
              k.customResult = k.explanationAnswer || undefined
            } else if (k.answersCategory === '2') {
              const arr = k.optionList.filter(x => x.isSelect === '1')
              if (arr && arr.length > 0) {
                k.customResult = arr[0].optionName
              } else {
                k.customResult = undefined
              }
            } else if (k.answersCategory === '3') {
              const arr = k.optionList.filter(x => x.isSelect === '1')
              if (arr && arr.length > 0) {
                k.customResult = arr.map(k => k.optionName)
              } else {
                k.customResult = []
              }
            } else if (k.answersCategory === '4') {
              k.customResult = k.fixedTime || undefined
            } else if (k.answersCategory === '5') {
              if (k.startTime && k.endTime) {
                k.customResult = [k.startTime, k.endTime - 86399000]
              } else {
                k.customResult = undefined
              }
            }
          })
      })
      this.$nextTick(() => {
        this.$refs.paper.init(categoryList)
      })
    },
    cancel() {
      this.$modal
        .confirm(this.$t('SALES.cancelConfirm'))
        .then(() => {
          return cancelledCustomerQuestionnaire({
            customerQuestionnaireId: this.previewForm.customerQuestionnaireId
          })
        })
        .then(response => {
          this.$modal.msgSuccess(this.$t('SALES.cancelSuccess'))
          this.close()
          this.$emit('onSuccess')
        })
        .catch(() => {})
    },
    close() {
      this.previewForm = {}
      this.$refs.paper && this.$refs.paper.init()
      this.open = false
    },
    closed() {
      this.$emit('closed')
    },
    getPdf() {
      this.$refs.exportPDF.handleOpen(this.previewForm)
    },
    async submit() {
      const params = JSON.parse(JSON.stringify(this.previewForm))
      const categoryList = await this.$refs.paper.submitForm()
      if (!categoryList) {
        return
      }

      params.categoryList = categoryList
      this.$modal
        .confirm(this.$t('SALES.writeConfirm'))
        .then(() => {
          return updateCustomerQuestionnaire(params)
        })
        .then(response => {
          this.$modal.msgSuccess(this.$t('SALES.writeSuccess'))
          this.close()
        })
        .catch(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog {
  :deep(.el-dialog__header) {
    padding: 0 20px;
  }
  :deep(.el-dialog__body) {
    padding: 0;
  }
  .pdf {
    padding: 20px 30px;
  }
}
.header {
  position: relative;
  text-align: center;
  word-break: break-word;
  min-height: 60px;
  .logo {
    position: absolute;
    top: -10px;
    left: -20px;
    width: 300px;
    height: 75px;
  }
  .title {
    font-size: 15px;
    font-weight: 700;
  }
}
</style>
