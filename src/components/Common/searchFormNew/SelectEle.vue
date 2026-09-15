<template>
  <el-select
    :size="size"
    :style="{ width: '100%' }"
    :model-value="value"
    :placeholder="placeholder || ''"
    clearable
    :filterable="filterable"
    @change="$emit('updateForm', { value: $event, type })"
  >
    <el-option
      v-for="child in selectData"
      :key="child[selectValue]"
      :label="child[selectLabel]"
      :value="child[selectValue]"
    >
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'SelectEle',
  components: {},
  props: [
    'placeholder',
    'selectData',
    'value',
    'selectValue',
    'selectLabel',
    'width',
    'type',
    'filterable',
    'size'
  ],
  watch: {
    width: function (newVal, oldVal) {
      console.log(newVal, '===')
    }
  },
  emits: ['updateForm']
}
</script>
