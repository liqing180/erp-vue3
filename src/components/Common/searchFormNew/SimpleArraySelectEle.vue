<template>
  <el-select
    :size="size"
    :style="{ width: '100%' }"
    :model-value="value"
    :placeholder="placeholder || ''"
    clearable
    @change="$emit('updateForm', { value: $event })"
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
  name: 'SimpleArraySelectEle',
  components: {},
  props: [
    'placeholder',
    'selectData',
    'value',
    'selectValue',
    'selectLabel',
    'width',
    'size'
  ],
  emits: ['updateForm']
}
</script>
