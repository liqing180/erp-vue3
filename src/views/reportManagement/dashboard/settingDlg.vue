<template>
  <el-dialog
    v-model="open"
    v-dialogDrag
    v-dialogDragWidth
    :close-on-click-modal="false"
    :title="title"
    width="700px"
    top="5vh"
    @closed="closed"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="220px"
      class="mr20"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('ui.reportsName')" prop="reportId">
            <el-cascader
              v-model="form.reportId"
              class="tag-width"
              style="width: 360px"
              placeholder=""
              :options="reportList"
              :props="{ multiple: false, children: 'dashboards' }"
              clearable
              collapse-tags
              filterable
              :show-all-levels="false"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">{{ $t('uiBtn.back') }}</el-button>
        <el-button type="primary" :loading="btnLoading" @click="submitForm">
          {{ $t('uiBtn.submit') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import {
  queryReportGroupForDashboard,
  saveUserDefaultReport
} from '@/api/operation/setup'

export default {
  name: 'DashboardSettingDialog',
  props: {
    zoneIdList: {
      type: Array,
      default: () => []
    }
  },
  emits: ['onSuccess'],
  data() {
    return {
      btnLoading: false,
      open: false,
      title: '',
      form: {
        reportId: undefined
      },
      rules: {
        reportId: [
          {
            type: 'array',
            required: true,
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('ui.reportsName')
            ),
            trigger: ['change', 'blur']
          }
        ]
      },
      reportList: [],
      childrenList: []
    }
  },
  methods: {
    reset() {
      this.form = {
        reportId: undefined
      }
      this.resetForm('form')
    },
    handleOpen() {
      this.reset()
      this.open = true
      this.title = this.$t('ui.homeReports')
      this.queryReportGroupForDashboard()
    },
    queryReportGroupForDashboard() {
      queryReportGroupForDashboard({
        reportType: '1',
        zoneIds: this.zoneIdList
      }).then(res => {
        const list = res.data || []
        const childrenList = []

        list.forEach(item => {
          item.label = item.groupName
          item.value = item.reportGroupId
          ;(item.dashboards || []).forEach(child => {
            child.label = child.name
            child.value = child.id
            childrenList.push(child)
          })
        })

        this.reportList = list
        this.childrenList = childrenList
      })
    },
    cancel() {
      this.open = false
    },
    closed() {
      this.reset()
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return

        const reportId = this.form.reportId?.[1]
        const reportRow = this.childrenList.find(item => item.id === reportId)
        if (!reportRow) return

        this.$modal
          .confirm(this.$t('SALES.submitPageConfirm'))
          .then(() => {
            this.btnLoading = true
            return saveUserDefaultReport(reportRow)
          })
          .then(() => {
            this.$modal.msgSuccess(this.$t('SALES.submitPageSuccess'))
            this.open = false
            this.$emit('onSuccess', reportRow)
          })
          .finally(() => {
            this.btnLoading = false
          })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tag-width {
  width: 100%;
}
</style>
