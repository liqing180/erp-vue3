<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('menu.assignTo1')"
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
            :label="`${$t('customer.salesGroup')}`"
            prop="salesGroupName"
          >
            <SelectInput
              clearable
              :value="form.salesGroupName"
              :title="form.salesGroupName"
              @click="openSalesGroupTable"
              @clear="salesGroupClear"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="`${$t('customer.salesPerson')}`"
            prop="salesGroupUserId"
          >
            <CommonSelect
              :id="form.salesGroupUserId"
              :label="form.salesGroupUserName"
              idKey="salesGroupUserId"
              labelKey="salesGroupUserName"
              filterable
              :disabled="!form.salesGroupName || !!form.customerId"
              :options="salesGroupUserList"
              @changeItem="salesPersonChange"
            />
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

    <salesGroupDlg
      ref="salesGroupDlg"
      :query="form"
      @onSuccess="updateSalesGroup"
    />
  </el-dialog>
</template>

<script>
import salesGroupDlg from './salesGroupDlg.vue'
import { assignToLead } from '@/api/leads/leads'
import { queryCanSelectSalesGroupList } from '@/api/leads/leads'

export default {
  components: { salesGroupDlg },
  props: {
    query: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogTableVisible: false,
      loading: false,
      leadIdList: [],
      form: {
        salesGroupName: undefined
      },
      rules: {
        salesGroupName: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['change']
          }
        ],
        salesGroupUserId: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.userId')),
            trigger: ['blur', 'change']
          }
        ]
      },
      salesGroupUserList: []
    }
  },

  methods: {
    openSalesGroupTable() {
      this.$refs.salesGroupDlg.handleAdd()
    },
    updateSalesGroup(e) {
      const { salesGroupName, salesGroupId, salesGroupUserList } = e
      this.form.salesGroupId = salesGroupId
      this.form.salesGroupName = salesGroupName
      this.salesGroupUserList = salesGroupUserList
      this.form.salesGroupUserId = undefined
      this.form.salesGroupUserName = undefined
      this.$refs.form.validateField('salesGroupName')
    },
    salesGroupClear() {
      this.form.salesGroupId = undefined
      this.form.salesGroupName = undefined
      this.salesGroupUserList = []
      this.form.salesGroupUserId = undefined
      this.form.salesGroupUserName = undefined
    },
    salesPersonChange(row) {
      this.form.salesGroupUserId = row.salesGroupUserId
      this.form.salesGroupUserName = row.salesGroupUserName
    },
    reset() {
      this.form = {
        salesGroupId: undefined,
        salesGroupName: undefined,
        salesGroupUserId: undefined,
        salesGroupUserName: undefined
      }
      this.salesGroupUserList = []
      this.resetForm('form')
    },
    close() {
      this.reset()
      this.dialogTableVisible = false
    },
    open(ids) {
      this.reset()
      const vm = this
      this.leadIdList = ids
      if (this.query && this.query.salesGroupId) {
        this.form.salesGroupId = this.query.salesGroupId
        this.form.salesGroupName = this.query.salesGroupName
        this.form.salesGroupUserId = this.query.salesGroupUserId
        this.form.salesGroupUserName = this.query.salesGroupUserName
        this.queryCanSelectSalesGroupList()
      }
      vm.dialogTableVisible = true
    },
    queryCanSelectSalesGroupList() {
      queryCanSelectSalesGroupList({}).then(res => {
        const list = res.data || []
        const row =
          list.find(x => x.salesGroupId === this.form.salesGroupId) || {}
        this.salesGroupUserList = row.salesGroupUserList || []
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))
          params.leadIdList = this.leadIdList
          const salesGroupUserName = this.salesGroupUserList.filter(
            x => x.salesGroupUserId === params.salesGroupUserId
          )[0].salesGroupUserName
          params.salesGroupUserName = salesGroupUserName
          this.$modal
            .confirm(this.$t('ui.submitPageConfirm'))
            .then(() => {
              return assignToLead(params)
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
