<template>
  <el-cascader
    :show-all-levels="false"
    placeholder=""
    :size="size"
    :model-value="value"
    :options="selectData"
    :props="{
      multiple: multiple === false ? multiple : true,
      checkStrictly: checkStrictly,
      value: mapValue || 'id',
      label: mapLabel || 'label'
    }"
    clearable
    :collapse-tags="true"
    @change="$emit('updateForm', { value: $event, type })"
    class="cascader"
    popper-class="hide-cascader-scrollbar"
    :style="{ width: '100%' }"
  ></el-cascader>
</template>

<script>
export default {
  name: 'ElcascaderEle',
  components: {},
  props: [
    'placeholder',
    'selectData',
    'value',
    'selectValue',
    'selectLabel',
    'width',
    'type',
    'mapValue',
    'mapLabel',
    'checkStrictly',
    'multiple',
    'size'
  ],
  emits: ['updateForm']
}
</script>

<style lang="scss" scoped>
.cascader :deep(.el-cascader__tags > span) {
  display: flex;
  max-width: 120px;
}
</style>
