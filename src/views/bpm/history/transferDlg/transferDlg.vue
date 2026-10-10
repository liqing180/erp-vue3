<template>
  <el-dialog
    draggable
    :title="$t('transfer.dlgTitle')"
    v-model="visible"
    width="1140px"
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="195px">
      <el-row>
        <el-col :span="12">
          <el-form-item
            :label="`${$t('transfer.dlgTitle')}`"
            prop="picUserName"
          >
            <SelectInput
              :value="form.picUserName"
              :title="form.picUserName"
              @clear="picUserNameClear"
              clearable
              @click="openPicTable"
              class="form-wd"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="`${$t('transfer.taskName')}`" prop="taskName">
            <el-input
              v-model="form.taskName"
              :title="!form.taskName ? '' : form.taskName"
              type="text"
              disabled
              class="form-wd"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item
            :label="`${$t('transfer.initiator')}`"
            prop="applyUserName"
          >
            <el-input
              v-model="form.applyUserName"
              disabled
              type="text"
              class="form-wd"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item :label="`${$t('transfer.reason')}`" prop="reason">
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
      </el-row>
    </el-form>

    <template #footer
      ><div class="dialog-footer">
        <el-button @click="back">{{ $t('ui.back') }}</el-button>
        <el-button
          type="primary"
          :disabled="fullscreenLoading"
          @click="submitForm"
          >{{ $t('uiBtn.submit') }}</el-button
        >
      </div></template
    >

    <selectPicTable ref="selectPicTable" @updatePic="updatePic" />
  </el-dialog>
</template>

<script>
import i18n from '@/lang'

import locale from './locale'
import { approvalTransfer } from '@/api/bpm/bpm'
import selectPicTable from '@/views/bpm/history/transferDlg/selectPicTable.vue'

export default {
  emits: ['onSuccess'],
  components: { selectPicTable },
  props: {},
  data() {
    const vm = this

    return {
      visible: false,

      fullscreenLoading: false,

      form: {},
      rules: {
        picUserName: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g), // 不能全部是空格
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],

        reason: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g), // 不能全部是空格
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ]
      },
      selectList: []
    }
  },

  beforeCreate() {
    i18n.global.mergeLocaleMessage('zh', locale.zh)
    i18n.global.mergeLocaleMessage('en', locale.en)
  },
  methods: {
    picUserNameClear() {
      this.form.picUserName = undefined
      this.form.picUserId = undefined
      this.selectList = []
    },
    openPicTable() {
      const selectList = JSON.parse(JSON.stringify(this.selectList))
      this.$refs.selectPicTable.handleOpen(selectList, this.form.todoUserIdList)
    },
    updatePic(data) {
      this.selectList = JSON.parse(JSON.stringify(data))
      const nickNames = data.map(x => x.nickName).join(',')
      const userIds = data.map(x => x.userId)
      this.form.picUserName = nickNames
      this.form.picUserId = userIds
    },
    handleOpen(row) {
      this.reset()
      if (row) {
        this.form = Object.assign(this.form, row)
      }
      this.visible = true
    },
    reset() {
      this.form = {
        reason: '',
        picUserName: '',
        picUserId: ''
      }
      this.selectList = []

      this.resetForm('form')
    },

    back() {
      this.visible = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const vm = this
          const param = {
            processInstance: vm.form.processInstance,
            reason: vm.form.reason,
            taskId: vm.form.taskId,
            moduleKey: vm.form.moduleKey,
            businessId: vm.form.businessId,
            userIdList: vm.form.picUserId
          }
          vm.fullscreenLoading = true
          approvalTransfer(param)
            .then(() => {
              vm.$message.success(
                `${vm.$t('transfer.returnSubmitSuccess').replace('$1', `[${vm.form.taskName}]`)}`
              )
              vm.back()
              vm.$emit('onSuccess')
              vm.fullscreenLoading = false
            })
            .catch(err => {
              vm.fullscreenLoading = false
              window.console.error(err)
            })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  margin-bottom: 20px;
}
</style>
