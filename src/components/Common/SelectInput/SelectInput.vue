<template>
  <div @click="clickFn" class="w100">
    <el-input
      class="tree-view-item w100"
      placeholder=""
      readonly
      :disabled="disabled"
      :value="value"
      :title="title"
    >
      <template v-slot:suffix>
        <span class="el-select__suffix">
          <el-icon class="el-icon el-select__caret el-select__icon" :size="14">
            <ArrowDown></ArrowDown>
          </el-icon>
          <el-icon
            @click.stop="clear"
            v-if="value && clearable && !disabled"
            :size="14"
            class="el-icon el-select__caret el-select__icon tree-view-right"
          >
            <CircleClose></CircleClose>
          </el-icon>
        </span>
      </template>
    </el-input>
  </div>
  <!-- <div class="el-select w100" @click="addDriver">
          <div class="el-input el-input--suffix el-input--default w100" :class="{ 'is-disabled': false }">
            <input
              :value="value"
              type="text"
              readonly="readonly"
              autocomplete="off"
              placeholder
              class="el-input__inner"
            />
            <span class="el-input__suffix">
              <span class="el-input__suffix-inner">
                <i class="el-select__caret el-input__icon el-icon-arrow-up" />
              </span>
            </span>
          </div>
        </div> -->
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number]
    },
    title: {
      type: [String, Number],
      default() {
        return ''
      }
    },
    disabled: {
      type: [Boolean],
      default() {
        return false
      }
    },
    clearable: {
      type: [Boolean],
      default() {
        return false
      }
    }
  },
  methods: {
    clickFn() {
      if (this.disabled) {
        return
      }
      this.$emit('click')
    },
    clear() {
      if (this.disabled) {
        return
      }
      this.$emit('clear')
    }
  },
  emits: ['click', 'clear', 'update:value']
}
</script>

<style scoped lang="scss">
.el-select__suffix {
  position: relative;
}
.tree-view-right {
  display: none;
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  left: 0;
  background-color: inherit;
  background-color: #fff;
}
.tree-view-item:hover .tree-view-right {
  display: inline !important;
}
.tree-view-item :deep(.el-input__inner) {
  cursor: pointer;
}
.tree-view-item :deep(.el-input__suffix) {
  cursor: pointer;
}
</style>
