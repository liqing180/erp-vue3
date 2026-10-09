<template>
  <el-select
    :size="size"
    :style="{ width: '100%' }"
    :model-value="value"
    :placeholder="placeholder || ''"
    multiple
    collapse-tags
    clearable
    :filterable="filterable"
    @change="$emit('updateForm', { value: $event })"
    class="select"
  >
    <el-option
      v-for="(child, index) in selectData"
      :key="index"
      :label="child"
      :value="child"
    >
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'SimpleArrayMultipleSelectEle',
  components: {},
  props: [
    'placeholder',
    'selectData',
    'value',
    'selectValue',
    'selectLabel',
    'width',
    'filterable',
    'size'
  ],
  emits: ['updateForm']
}
</script>

<style lang="scss" scoped>
.select :deep(.el-select__selected-item .el-tag__content) {
  max-width: 120px;
}
</style>
