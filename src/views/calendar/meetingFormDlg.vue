<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="
      formData.meetingId
        ? $t('calendar.editMeeting')
        : $t('calendar.createMeeting')
    "
    v-model="visible"
    width="600px"
    append-to-body
    @closed="closed"
  >
    <el-form
      :model="formData"
      :rules="rules"
      ref="meetingForm"
      label-width="140px"
    >
      <el-form-item
        :label="$t('calendar.meetingSubject')"
        prop="meetingSubject"
      >
        <div class="flex w100">
          <el-input
            v-model="formData.meetingSubject"
            :maxlength="100"
            class="w100"
          ></el-input>
          <el-checkbox
            v-model="formData.allDay"
            true-value="1"
            false-value="0"
            @change="allDayChange"
            style="margin-left: 10px"
            >{{ $t('calendar.allDay') }}</el-checkbox
          >
        </div>
      </el-form-item>

      <template v-if="formData.allDay === '1'">
        <el-form-item :label="$t('calendar.startDate')" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            :format="fmtForYmd"
            value-format="x"
            @change="handleStartDateChange"
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('calendar.endDate')" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            :format="fmtForYmd"
            value-format="x"
            :disabled-date="disabledEndDate"
            :disabled="!formData.startTime"
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item :label="$t('calendar.startTime')" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            :format="fmtForYmdhm"
            type="datetime"
            value-format="x"
            @change="handleStartDateChange"
            :default-time="new Date(2000, 1, 1, 10, 0)"
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('calendar.endTime')" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            :format="fmtForYmdhm"
            type="datetime"
            value-format="x"
            :disabled-date="disabledEndDate"
            :disabled="!formData.startTime"
            :default-time="new Date(2000, 1, 1, 14, 0)"
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
      </template>

      <el-form-item
        :label="$t('calendar.meetingContent')"
        prop="meetingContent"
      >
        <el-input
          type="textarea"
          v-model="formData.meetingContent"
          :autosize="{ minRows: 2, maxRows: 4 }"
          resize="none"
          show-word-limit
          :maxlength="3000"
        ></el-input>
      </el-form-item>

      <el-form-item
        :label="$t('calendar.attendees')"
        prop="meetingAttendeesList"
      >
        <SelectInput
          clearable
          :value="userNames"
          :title="userNames"
          @click="selectPicTableOpen"
          @clear="selectPicTableClear"
        />
      </el-form-item>
    </el-form>

    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">{{ $t('uiBtn.back') }}</el-button>
        <el-button type="primary" :loading="btnLoading" @click="handleSubmit">{{
          $t('uiBtn.submit')
        }}</el-button>
      </div>
    </template>

    <selectPicTable ref="selectPicTable" @select="updateTable" />
  </el-dialog>
</template>

<script>
import selectPicTable from './selectPicTable.vue'
import { saveMeeting, updateMeeting, queryMeetingById } from '@/api/calendar'
export default {
  name: 'MeetingFormDialog',
  components: {
    selectPicTable
  },
  data() {
    const vm = this
    const validEndDate = (rule, value, callback) => {
      let endTime = value
      let startTime = vm.formData.startTime
      if (!startTime) {
        callback()
      }
      if (typeof startTime === 'number') {
        startTime = new Date(startTime)
      }
      if (typeof endTime === 'number') {
        endTime = new Date(endTime)
      }

      if (endTime - startTime < 0) {
        callback(new Error(this.$t('customer.endGreaterStart')))
      } else {
        callback()
      }
    }

    return {
      btnLoading: false,
      visible: false,
      formData: {
        meetingSubject: '',
        allDay: '0',
        startTime: '',
        endTime: '',
        content: '',
        participants: []
      },
      rules: {
        meetingSubject: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        startTime: [
          { required: true, message: this.$t('ui.reqMsg'), trigger: 'change' }
        ],
        endTime: [
          {
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          },
          {
            validator: validEndDate,
            trigger: ['blur', 'change']
          }
        ],

        meetingContent: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ],
        meetingAttendeesList: [
          {
            type: 'array',
            required: true,
            message: this.$t('ui.reqMsg'),
            trigger: ['change']
          }
        ]
      },
      userOptions: [] // 用户列表选项
    }
  },

  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhm() {
      return this.$store.getters.fmtForYmdhm
    },
    userNames() {
      const list = this.formData.meetingAttendeesList || []
      return list.map(item => item.nickName).join(', ')
    }
  },
  methods: {
    allDayChange() {
      this.formData.startTime = ''
      this.formData.endTime = ''
    },
    selectPicTableOpen() {
      this.$refs.selectPicTable.handleAdd(
        this.formData.meetingAttendeesList || []
      )
    },
    selectPicTableClear() {
      this.formData.meetingAttendeesList = []
      this.$refs.meetingForm &&
        this.$refs.meetingForm.validateField('meetingAttendeesList')
    },
    updateTable(list) {
      this.formData.meetingAttendeesList = list || []
      this.$refs.meetingForm &&
        this.$refs.meetingForm.validateField('meetingAttendeesList')
    },
    open(meeting = null) {
      this.visible = true
      if (meeting) {
        this.formData = { ...meeting }
      }
      if (this.formData.meetingId) {
        queryMeetingById({ meetingId: this.formData.meetingId }).then(res => {
          console.log(res)
          const data = res.data || {}
          this.formData = { ...data }
        })
      }
    },
    closed() {
      this.resetForm()
    },

    resetForm() {
      this.formData = {
        title: '',
        allDay: '0',
        startTime: '',
        endTime: '',
        content: '',
        participants: []
      }
      this.$refs.meetingForm && this.$refs.meetingForm.clearValidate()
    },

    handleSubmit() {
      this.$refs.meetingForm.validate(valid => {
        if (valid) {
          let param = JSON.parse(JSON.stringify(this.formData))
          param = this.$trimOfObj(param)
          if (param.allDay === '1') {
            param.startTime = this.appointTime(param.startTime, '00:00:00')
            param.endTime = this.appointTime(param.endTime, '23:59:59')
          }

          const apiFn = this.formData.meetingId ? updateMeeting : saveMeeting
          this.btnLoading = true
          apiFn(param)
            .then(res => {
              // this.$message.success(this.$t('ui.saveSuccess'))
              this.$emit('submit', this.formData)
              this.visible = false
              setTimeout(() => {
                this.btnLoading = false
              }, 1000)
            })
            .catch(() => {
              this.btnLoading = false
            })
        }
      })
    },

    handleStartDateChange(val) {
      // 如果开始日期大于结束日期，清空结束日期
      if (this.formData.endTime && val > this.formData.endTime) {
        this.formData.endTime = undefined
      }
    },

    disabledEndDate(date) {
      // 如果有开始日期，则禁用小于开始日期的日期
      if (this.formData.startTime) {
        const startTime = new Date(this.formData.startTime)
        startTime.setHours(0, 0, 0, 0)
        return date.getTime() < startTime.getTime()
      }
      return false
    }
  }
}
</script>
