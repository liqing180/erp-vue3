<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('menu.closeAsLost')"
    v-model="dialogTableVisible"
    width="800px"
    top="5vh"
    @close="close"
    append-to-body
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="140px">
      <el-row>
        <el-col :span="12">
          <el-form-item
            :label="`${$t('customer.lostReason')}`"
            prop="lostReasonId"
          >
            <el-select
              v-model="form.lostReasonId"
              placeholder=""
              class="w100"
              clearable
            >
              <el-option
                v-for="dict in sales_opportunity_lost_reason"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="`${$t('customer.competitor')}`"
            prop="competitorName"
          >
            <SelectInput
              clearable
              :value="form.competitorName"
              :title="form.competitorName"
              @click="competitorOpen"
              @clear="competitorClear"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('ui.description')" prop="lostDescription">
            <el-input
              type="textarea"
              v-model="form.lostDescription"
              :autosize="{ minRows: 2, maxRows: 4 }"
              resize="none"
              show-word-limit
              :maxlength="3000"
            ></el-input>
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
          $t('menu.closeAsLost')
        }}</el-button>
      </div>
    </template>

    <competitorDlg ref="competitorDlg" @onSuccess="updateCompetitor" />
  </el-dialog>
</template>

<script>
import { lostSalesOpportunity } from '@/api/salesOpportunity/salesOpportunity'
import competitorDlg from './competitorDlg.vue'

export default {
  components: {
    competitorDlg
  },
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
      form: {},
      rules: {
        lostReasonId: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        competitorName: [
          {
            required: false,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ],
        lostDescription: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ]
      },
      rowId: undefined,
      lostReasonList: [],
      competitorList: [],
      salesOpportunityNo: undefined,
      sales_opportunity_lost_reason: []
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
    // 竞争对手
    competitorOpen() {
      this.$refs.competitorDlg.handleAdd()
    },
    // 更新竞争对手
    updateCompetitor(e) {
      this.form.lostCompetitorId = e.competitorId
      this.form.competitorName = e.competitorName
      this.$refs.form && this.$refs.form.validateField('competitorName')
    },
    // 清空竞争对手
    competitorClear() {
      this.form.lostCompetitorId = undefined
      this.form.competitorName = undefined
    },
    reset() {
      this.form = {}
      this.resetForm('form')
    },
    close() {
      this.reset()
      this.dialogTableVisible = false
    },
    open(rowId, salesOpportunityNo) {
      this.rowId = rowId
      this.salesOpportunityNo = salesOpportunityNo

      const { sales_opportunity_lost_reason } = this.useDict(
        'sales_opportunity_lost_reason'
      )
      this.sales_opportunity_lost_reason = sales_opportunity_lost_reason || []
      this.reset()
      this.dialogTableVisible = true
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let params = {
            salesOpportunityId: this.rowId,
            ...this.form
          }

          this.$modal
            .confirm(
              this.$t('customer.lostConfirm').replace(
                '$1',
                this.salesOpportunityNo
              )
            )
            .then(() => {
              return lostSalesOpportunity(params)
            })
            .then(response => {
              this.$modal.msgSuccess(
                this.$t('customer.lostSuccess').replace(
                  '$1',
                  this.salesOpportunityNo
                )
              )
              this.dialogTableVisible = false
              this.$emit('onSuccess')
            })
            .catch(() => {})
        }
      })
    }
  }
}
</script>
