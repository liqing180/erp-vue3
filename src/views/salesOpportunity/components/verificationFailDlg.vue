<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('customer.verificationFailed')"
    v-model="dialogTableVisible"
    width="1000px"
    top="5vh"
    @close="close"
    append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="140px">
      <el-row>
        <el-col :span="12">
          <el-form-item
            :label="`${$t('customer.nextContactTime')}`"
            prop="nextContactTimeDays"
          >
            <div class="flex">
              <el-input-number
                v-model="form.nextContactTimeDays"
                :precision="0"
                v-thousandSplit="{ precision: 0 }"
                type="number"
                class="form-wd textleft"
                :min="1"
                :max="999"
                @change="inputNumberChange('nextContactTimeDays')"
                style="width: 150px"
                controls-position="right"
              />
              <div style="margin: 0 10px">{{ $t('customer.day') }}</div>
              <el-date-picker
                v-model="form.nextContactTimeDate"
                :editable="false"
                type="date"
                :format="fmtForYmd"
                value-format="x"
                class="form-wd"
                placeholder
                style="width: 100%"
                :disabled-date="validityDaysPickerOptions.disabledDate"
                @change="nextContactTimeDateChange"
              ></el-date-picker>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('ui.remarks')" prop="remarks">
            <el-input
              type="textarea"
              v-model="form.remarks"
              :autosize="{ minRows: 2, maxRows: 4 }"
              resize="none"
              show-word-limit
              :maxlength="3000"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item :label="`${$t('ui.attachment')}`" prop="attachment">
            <div class="w100">
              <myUpload ref="uploadRef" />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

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
  </el-dialog>
</template>

<script>
import { leadVerificationFailed } from '@/api/leads/leads'
export default {
  components: {},
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogTableVisible: false,
      loading: false,
      form: {
        nextContactTimeDays: 30
      },
      rules: {
        nextContactTimeDays: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        remarks: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ]
      },
      validityDaysPickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },
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
    // 下次联系时间
    nextContactTimeDateChange() {
      const current = this.appointTime(Date.now(), '00:00:00')
      const { nextContactTimeDate } = this.form
      if (nextContactTimeDate) {
        const nextContactTimeDays =
          (nextContactTimeDate - current) / 24 / 3600 / 1000
        this.form.nextContactTimeDays = nextContactTimeDays
      } else {
        this.form.nextContactTimeDays = undefined
      }
      this.$refs.form && this.$refs.form.validateField('nextContactTimeDays')
    },
    // 下次联系时间
    inputNumberChange(code) {
      const { nextContactTimeDays } = this.form
      const current = this.appointTime(Date.now(), '00:00:00')
      if (nextContactTimeDays) {
        this.form.nextContactTimeDate =
          current + nextContactTimeDays * 24 * 3600 * 1000
      } else {
        this.form.nextContactTimeDate = undefined
      }
      this.$refs.form && this.$refs.form.validateField(code)
    },

    reset() {
      this.form = {
        nextContactTimeDays: 30
      }
      this.inputNumberChange('nextContactTimeDays')
      this.resetForm('form')
    },
    close() {
      this.reset()
      this.dialogTableVisible = false
    },
    open(rowId) {
      this.rowId = rowId
      this.reset()
      this.dialogTableVisible = true
    },

    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const fileIds = this.$refs.uploadRef.getFileIds()
          if (fileIds === false) {
            return
          }
          let params = {
            leadQualificationCriteria: {
              leadQualificationCriteriaList: this.list
            },
            leadId: this.rowId,
            commonFileList: fileIds,
            ...this.form
          }

          this.$modal
            .confirm(this.$t('ui.submitPageConfirm'))
            .then(() => {
              return leadVerificationFailed(params)
            })
            .then(response => {
              this.$modal.msgSuccess(this.$t('ui.submitPageSuccess'))
              this.$emit('onSuccess')
              this.close()
            })
            .catch(() => {})
        }
      })
    }
  }
}
</script>
