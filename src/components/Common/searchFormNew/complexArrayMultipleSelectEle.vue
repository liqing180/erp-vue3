<template>
  <el-select
    :size="size"
    style="width: 100%"
    v-model="val"
    :placeholder="placeholder || ''"
    multiple
    collapse-tags
    clearable
    @change="$emit('updateForm', { value: $event })"
    class="select"
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
  name: 'ComplexArrayMultipleSelectEle',
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
