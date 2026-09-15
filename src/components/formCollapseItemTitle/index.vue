<template>
  <div class="collapse-title">
    <div class="title-left flexStart">
      <el-icon
        size="20"
        style="cursor: pointer"
        color="#555"
        class="el-icon-caret-right ml5"
      >
        <CaretRight />
      </el-icon>
      <strong>{{ title }}</strong>
      <el-icon
        size="16"
        color="#f00"
        style="cursor: pointer"
        class="ml5"
        v-if="warning"
      >
        <WarningFilled />
      </el-icon>
    </div>
    <span
      class="collapse-item-info ml20"
      style="font-size: 14px; color: #909399"
    >
      <slot></slot>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    warning: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  }
}
</script>
