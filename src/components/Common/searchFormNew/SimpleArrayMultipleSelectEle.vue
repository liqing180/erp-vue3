<template>
  <el-select
    :size="size"
    :style="{ width: '100%' }"
    v-model:value="val"
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
  data() {
    return {
      val: this.value
    }
  },
  watch: {
    value: function (newVal, oldVal) {
      this.val = newVal
    }
  },
  emits: ['updateForm']
}
</script>

<style lang="scss" scoped>
.select :deep(.el-select__tags > span) {
  display: flex;
  max-width: 120px;
}
</style>
