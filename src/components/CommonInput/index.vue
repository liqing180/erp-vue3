<template>
  <div class="common-input" :title="title">
    <el-input-original
      v-bind="$attrs"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template
        v-for="(_, slotName) in $slots"
        :key="slotName"
        #[slotName]="props"
      >
        <slot :name="slotName" v-bind="props" />
      </template>
    </el-input-original>
  </div>
</template>

<script>
import { ElInput } from 'element-plus'

export default {
  name: 'CommonInput',
  inheritAttrs: false,
  components: {
    'el-input-original': ElInput
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    title: {
      type: [String, Number],
      default: ''
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.common-input {
  width: 100%;
}
</style>
