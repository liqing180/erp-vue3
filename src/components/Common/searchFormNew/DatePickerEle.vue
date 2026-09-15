<template>
  <el-date-picker
    v-model="dateRange"
    @change="input"
    :size="size"
    style="width: 100%"
    type="daterange"
    value-format="x"
    range-separator="-"
    :start-placeholder="`${$t('ui.startDate')}`"
    :end-placeholder="`${$t('ui.endDate')}`"
    clearable
    :format="fmtForYmd.toUpperCase()"
  ></el-date-picker>
</template>

<script>
export default {
  name: 'DatePickerEle',
  props: {
    value: {
      default: () => []
    },
    name: {
      default: () => []
    },
    id: {
      default: () => []
    },
    format: undefined,
    width: undefined,
    startDate: undefined,
    endDate: undefined,
    size: undefined,
    type: undefined
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    }
  },
  data() {
    return {
      dateRange: []
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler: function (newVal) {
        this.dateRange = newVal || []
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
  emits: ['updateForm', 'update:value', 'update:value']
}
</script>
