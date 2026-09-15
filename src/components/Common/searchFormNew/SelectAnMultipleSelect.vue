<template>
  <div class="flex">
    <el-select
      :size="size"
      :style="{ width: maxTextWidth ? maxTextWidth + 'px' : '120px' }"
      :model-value="selectVal"
      :placeholder="placeholder || ''"
      :clearable="false"
      @change="
        $emit('updateForm', {
          value: $event,
          type,
          childType: 'select',
          selectName,
          inputName
        })
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
    <el-select
      :size="size"
      class="flex-1 select"
      :model-value="inputVal"
      :filterable="filterable"
      :placeholder="placeholder || ''"
      multiple
      collapse-tags
      clearable
      @change="
        $emit('updateForm', {
          value: $event,
          type,
          childType: 'input',
          selectName,
          inputName
        })
      "
    >
      <el-option
        v-for="child in selectData2"
        :key="child[selectValue2]"
        :label="child[selectLabel2]"
        :value="child[selectValue2]"
      >
        <span :class="[rightLabel ? 'select-left-text' : '']">{{
          child[selectLabel2]
        }}</span>
        <span class="select-right-text">{{ child[rightLabel] || '' }}</span>
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'SelectAnInput',
  props: [
    'inputVal',
    'selectId',
    'placeholder',
    'selectData',
    'value',
    'selectValue',
    'selectLabel',
    'type',
    'width',
    'tooltip',
    'maxlength',
    'name',
    'selectName',
    'inputName',
    'maxTextWidth',
    'selectData2',
    'selectValue2',
    'selectLabel2',
    'rightLabel',
    'filterable',
    'size'
  ],
  data() {
    return {
      selectVal: this.selectId || undefined,
      inputValue: this.inputVal || ''
    }
  },
  watch: {
    selectId(newVal, oldVal) {
      this.selectVal = newVal || undefined
    },
    inputVal(newVal, oldVal) {
      this.inputValue = newVal || ''
    }
  },
  methods: {},
  emits: ['updateForm']
}
</script>
