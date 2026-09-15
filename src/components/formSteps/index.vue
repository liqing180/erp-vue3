<template>
  <el-steps
    v-if="activeIndex !== lastIndex"
    class="form-steps"
    process-status="wait"
    :active="activeIndex"
    align-center
  >
    <el-step
      v-for="item in statusList"
      :key="`form_status_${item.value}`"
      :title="item.label"
    />
  </el-steps>
  <el-steps
    v-else
    class="form-steps"
    process-status="finish"
    finish-status="wait"
    :active="activeIndex - 1"
    align-center
  >
    <el-step
      v-for="item in statusList"
      :key="`form_status_${item.value}`"
      :title="item.label"
    />
  </el-steps>
</template>

<script>
export default {
  name: 'FormSteps',
  props: {
    statusList: {
      type: Array,
      default: () => []
    },
    status: {
      type: [String, Number],
      default: ''
    }
  },
  computed: {
    lastIndex() {
      return this.statusList.length
    },
    activeIndex() {
      return this.statusList.findIndex(item => item.value === this.status) + 1
    }
  }
}
</script>

<style lang="scss">
.form-steps {
  padding: 10px 0;

  .el-step__icon {
    width: 38px;
    height: 38px;
    border-width: 1px;
    font-size: 18px;
  }

  .el-step__icon-inner {
    font-weight: 400;
  }

  .el-step.is-horizontal .el-step__line {
    top: 18px;
  }

  .el-step__title {
    font-size: 14px;
    line-height: 20px;
  }
}
</style>
