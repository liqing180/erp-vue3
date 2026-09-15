<template>
  <el-select
    :size="size"
    style="width: 100%"
    :model-value="value"
    :filterable="filterable"
    :placeholder="placeholder || ''"
    multiple
    collapse-tags
    clearable
    @change="$emit('updateForm', { value: $event, type })"
    class="select"
  >
    <el-option
      v-for="child in selectData"
      :key="child[selectValue]"
      :label="child[selectLabel]"
      :value="child[selectValue]"
    >
      <span :class="[rightLabel ? 'select-left-text' : '']">{{
        child[selectLabel]
      }}</span>
      <span class="select-right-text">{{ child[rightLabel] || '' }}</span>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'MultipleSelectEle',
  components: {},
  props: {
    placeholder: {
      type: String
    },
    selectValue: {
      type: String
    },
    selectLabel: {
      type: String
    },
    width: {
      type: String
    },
    selectData: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    },
    filterable: {
      type: Boolean,
      default() {
        return false
      }
    },
    type: {
      type: String,
      default: ''
    },
    rightLabel: {
      type: [String, Number],
      default: ''
    },
    size: {
      default: 'small'
    }
  },
  emits: ['updateForm', 'update:value', 'update:value']
}
</script>

<style lang="scss" scoped>
.select :deep(.el-select__tags > span) {
  display: flex;
  max-width: 120px;
}
</style>
