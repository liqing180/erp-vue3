<template>
  <div class="flex">
    <el-select
      :size="size"
      :style="{ width: maxTextWidth ? maxTextWidth + 'px' : '120px' }"
      :model-value="selectVal"
      :placeholder="placeholder || ''"
      @change="
        $emit('updateForm', { value: $event, type, childType: 'select' })
      "
    >
      <el-option
        v-for="child in selectData"
        :key="child[selectValue]"
        :label="child[selectLabel]"
        :value="child[selectValue]"
      >
      </el-option>
    </el-select>
    <el-date-picker
      class="flex-1"
      :model-value="dataValue"
      @input="$emit('updateForm', { value: $event, type, childType: 'date' })"
      :size="size"
      :value-format="format || 'YYYY-MM-DD'"
      type="daterange"
      range-separator="-"
      :start-placeholder="`${$t('ui.startDate')}`"
      :end-placeholder="`${$t('ui.endDate')}`"
      clearable
      :format="fmtForYmd"
    ></el-date-picker>
  </div>
</template>

<script>
export default {
  name: 'SelectAnPickerEle',
  props: [
    'date',
    'selectId',
    'placeholder',
    'selectData',
    'value',
    'selectValue',
    'selectLabel',
    'format',
    'type',
    'width',
    'startDate',
    'endDate',
    'size'
  ],
  data() {
    return {
      selectVal: this.selectId || undefined,
      dataValue: this.date || []
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    }
  },
  watch: {
    selectId(newVal, oldVal) {
      this.selectVal = newVal || undefined
    },
    date(newVal, oldVal) {
      this.dataValue = newVal || []
    }
  },
  emits: ['updateForm']
}
</script>
