<template>
  <el-dialog
    draggable
    :title="$t('approvalSkipOver.approvalSkipOverTitle')"
    v-model="visible"
    width="1140px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="195px">
      <el-row>
        <el-col :span="12">
          <el-form-item
            :label="`${$t('approvalSkipOver.skipOver')}`"
            prop="skipOver"
          >
            <el-select
              v-model="form.skipOver"
              class="form-wd"
              placeholder=""
              @change="returnChg"
              style="width: 100%"
            >
              <el-option
                v-for="item in returnOptions"
                :key="item.nodeId"
                :label="item.nodeName"
                :value="item.nodeId"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="`${$t('approvalSkipOver.taskName')}`"
            prop="taskName"
          >
            <el-input
              v-model="form.taskName"
              :title="!form.taskName ? '' : form.taskName"
              type="text"
              disabled
              class="form-wd"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="false">
          <el-form-item
            :label="`${$t('approvalSkipOver.participant')}`"
            prop="participant"
          >
            <el-select
              v-model="form.participant"
              :disabled="!form.return"
              class="form-wd log-msg-ellipsis"
              multiple
              placeholder=""
              style="width: 100%"
            >
              <el-option
                v-for="item in participantOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="`${$t('approvalSkipOver.initiator')}`"
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
          <el-form-item
            :label="`${$t('approvalSkipOver.reason')}`"
            prop="reason"
          >
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
          :loading="fullscreenLoading"
          @click="submitForm"
          >{{ $t('uiBtn.submit') }}</el-button
        >
      </div></template
    >
  </el-dialog>
</template>

<script>
import i18n from '@/lang'

import locale from './locale'
import { getSkipOverNodeMsgList, skipOverProcessToNode } from '@/api/bpm/bpm'

export default {
  emits: ['onSuccess'],
  props: {},
  data() {
    const vm = this
    return {
      visible: false,

      fullscreenLoading: false,

      returnNodeName: '',
      returnOptions: [],
      participantOptions: [],

      form: {
        participant: []
      },
      rules: {
        skipOver: [
          {
            required: true,

            pattern: new RegExp(/^(?!(\s+$))/g), // 不能全部是空格
            message: vm.$t('ui.reqMsg'),
            trigger: ['change', 'blur']
          }
        ],
        participant: [
          {
            required: true,
            type: 'array',

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
      }
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    }
  },
  beforeCreate() {
    i18n.global.mergeLocaleMessage('zh', locale.zh)
    i18n.global.mergeLocaleMessage('en', locale.en)
  },
  methods: {
    handleOpen(row) {
      const vm = this
      this.reset()
      vm.participantOptions = []
      if (row) {
        this.form = Object.assign(this.form, row)
        vm.getReturnNodeMsgs(row.processInstance, row.taskId)
      }
      this.visible = true
    },
    reset() {
      this.form = {
        skipOver: '',
        reason: '',
        participant: []
      }
      this.returnNodeName = ''

      this.resetForm('form')
    },
    returnChg(val) {
      const vm = this
      if (!val) {
        return []
      }
      const t = vm.returnOptions.find(item => {
        return item.nodeId === val
      })
      if (!t) {
        return []
      }
      // const tObj = t.todoUserMap
      // const keys = Object.keys(tObj)
      vm.returnNodeName = t.nodeName
      // vm.form.participant.length = 0
      // if (vm.$refs.createForm) {
      //   this.$nextTick(() => {
      //     vm.$refs.createForm.clearValidate('participant')
      //   })
      // }
      // vm.participantOptions.length = 0
      // // eslint-disable-next-line array-callback-return
      // keys.map((item) => {
      //   vm.participantOptions.push({ value: item, label: tObj[item] })
      // })
    },
    getReturnNodeMsgs(processInstance, taskId) {
      const vm = this
      vm.table_loading = true

      getSkipOverNodeMsgList(processInstance, taskId)
        .then(res => {
          vm.table_loading = false
          const results = res.data || []
          vm.returnOptions = results
        })
        .catch(err => {
          vm.table_loading = false
          window.console.error(err)
        })
    },
    back() {
      this.visible = false
    },
    submitForm() {
      const vm = this

      if (vm.fullscreenLoading) {
        return
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          const param = {
            // participant: vm.form.participant.toString(),
            processInstance: vm.form.processInstance,
            skipOverReason: vm.form.reason,
            // returnNodeId: vm.form.return,
            // returnNodeName: vm.returnNodeName,
            skipOverNodeId: vm.form.skipOver,
            skipOverNodeName: vm.returnNodeName,
            taskId: vm.form.taskId,
            moduleKey: vm.form.moduleKey,
            businessId: vm.form.businessId
          }
          vm.fullscreenLoading = true
          skipOverProcessToNode(param)
            .then(() => {
              vm.$message.success(
                `${vm
                  .$t('approvalSkipOver.skipOverSubmitSuccess')
                  .replace('$1', `[${vm.form.taskName}]`)}`
              )
              vm.back()
              vm.$emit('onSuccess')
              setTimeout(() => {
                vm.fullscreenLoading = false
              }, 1000)
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
