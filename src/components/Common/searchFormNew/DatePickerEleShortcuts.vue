<template>
  <!-- :default-value="defaultValue" -->
  <el-date-picker
    @change="input"
    :default-time="
      ['00:00:00', '00:00:00'].map(d => dayjs(d, 'hh:mm:ss').toDate())
    "
    :shortcuts="pickerOptions && pickerOptions.shortcuts"
    :disabled-date="pickerOptions && pickerOptions.disabledDate"
    :cell-class-name="pickerOptions && pickerOptions.cellClassName"
    :size="size"
    v-model="dateRange"
    style="width: 100%"
    type="daterange"
    value-format="x"
    unlink-panels
    range-separator="-"
    :start-placeholder="`${$t('ui.startDate')}`"
    :end-placeholder="`${$t('ui.endDate')}`"
    :clearable="clearable"
    :format="fmtForYmd.toUpperCase()"
  >
  </el-date-picker>
</template>

<script>
// import * as dayjs from "dayjs";
import dayjs from 'dayjs'
export default {
  name: 'DatePickerEleShortcuts',
  data() {
    const vm = this
    return {
      defaultValue: Date.now() - 30 * 24 * 3600 * 1000,
      pickerOptions: {
        shortcuts: [
          {
            text: vm.$t('ui.today'),
            value() {
              const end = new Date(vm.appointTime(Date.now(), '00:00:00'))
              return [end, end]
            }
          },
          {
            text: vm.$t('ui.weekly'),
            value() {
              const end = new Date(vm.appointTime(Date.now(), '00:00:00'))
              const startTimer = vm.appointTime(Date.now(), '00:00:00')
              if (vm.moreCurTime) {
                const start = new Date(startTimer + 3600 * 1000 * 24 * 6)
                return [end, start]
              } else {
                const start = new Date(startTimer - 3600 * 1000 * 24 * 6)
                return [start, end]
              }
            }
          },
          {
            text: vm.$t('ui.fortnightly'),
            value() {
              const end = new Date(vm.appointTime(Date.now(), '00:00:00'))
              const startTimer = vm.appointTime(Date.now(), '00:00:00')
              if (vm.moreCurTime) {
                const start = new Date(startTimer + 3600 * 1000 * 24 * 13)
                return [end, start]
              } else {
                const start = new Date(startTimer - 3600 * 1000 * 24 * 13)
                return [start, end]
              }
            }
          },
          {
            text: vm.$t('ui.monthly'),
            value() {
              const end = new Date(vm.appointTime(Date.now(), '00:00:00'))
              const startTimer = vm.appointTime(Date.now(), '00:00:00')
              if (vm.moreCurTime) {
                const start = new Date(startTimer + 3600 * 1000 * 24 * 29)
                return [end, start]
              } else {
                const start = new Date(startTimer - 3600 * 1000 * 24 * 29)
                return [start, end]
              }
            }
          },
          {
            text: vm.$t('ui.quarterly'),
            value() {
              const end = new Date(vm.appointTime(Date.now(), '00:00:00'))
              const startTimer = vm.appointTime(Date.now(), '00:00:00')
              if (vm.moreCurTime) {
                const start = new Date(startTimer + 3600 * 1000 * 24 * 89)
                return [end, start]
              } else {
                const start = new Date(startTimer - 3600 * 1000 * 24 * 89)
                return [start, end]
              }
            }
          },
          {
            text: vm.$t('ui.sixMonthly'),
            value() {
              const end = new Date(vm.appointTime(Date.now(), '00:00:00'))
              const startTimer = vm.appointTime(Date.now(), '00:00:00')
              if (vm.moreCurTime) {
                const start = new Date(startTimer + 3600 * 1000 * 24 * 179)
                return [end, start]
              } else {
                const start = new Date(startTimer - 3600 * 1000 * 24 * 179)
                return [start, end]
              }
            }
          },
          {
            text: vm.$t('ui.annually'),
            value() {
              const end = new Date(vm.appointTime(Date.now(), '00:00:00'))
              const startTimer = vm.appointTime(Date.now(), '00:00:00')
              if (vm.moreCurTime) {
                const start = new Date(startTimer + 3600 * 1000 * 24 * 364)
                return [end, start]
              } else {
                const start = new Date(startTimer - 3600 * 1000 * 24 * 364)
                return [start, end]
              }
            }
          }
        ],
        disabledDate(time) {
          return false
          // if (!vm.moreCurTime) return false
          // return time.getTime() < +new Date() - 8.64e7
        }
      },
      disabled: false,
      dateRange: [],
      dayjs
    }
  },
  props: {
    // value: {
    //   type: Array,
    //   default: () => []
    // },
    value: {
      type: [String, Array, Object]
    },
    format: {
      default: null
    },
    width: {
      default: null
    },
    startDate: {
      default: null
    },
    endDate: {
      default: null
    },
    type: {
      default: null
    },
    moreCurTime: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    name: {},
    size: {
      default: 'small'
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler: function (newVal) {
        this.dateRange = newVal
      }
    }
  },
  methods: {
    input() {
      if (this.disabled) return
      this.disabled = true
      setTimeout(() => {
        this.disabled = false
      }, 200)
      this.$emit('updateForm', {
        value: this.dateRange,
        format: this.format,
        type: this.type,
        startDate: this.startDate,
        endDate: this.endDate
      })
    }
  },
  emits: ['pick', 'updateForm', 'update:value']
}
</script>
