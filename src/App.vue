<template>
  <router-view />
</template>

<script setup>
import useSettingsStore from '@/Pinia/modules/settings'
import { handleThemeStyle } from '@/utils/theme'

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>

<style lang="scss">
#app {
  min-width: 800px;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.formPage {
  background-color: #e8edf0;
  padding: 0;
  overflow: hidden;
}
.form-card {
  background-color: #fff;
  .el-collapse-item__header {
    .el-collapse-item__arrow {
      display: none;
    }
    display: flex;
    align-items: center;
    height: 30px;
    line-height: 30px;
    // background: #409effaf;
    padding-left: 10px;
    cursor: pointer;
    border-bottom: 1px solid #ebeef5;
    font-size: 15px;
    font-weight: 500;
    outline: 0;
  }
  .el-collapse-item__header.is-active {
    .el-icon-caret-right {
      transform: rotate(90deg);
    }
    .collapse-item-info {
      display: none;
    }
  }
  .collapse-title {
    display: flex;
    overflow: hidden;
    flex: 1;
    .title-left {
      flex-shrink: 0;
    }
    .collapse-item-info {
      overflow: hidden;
      display: flex;
      flex: 1;
      .info-item {
        max-width: 400px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .el-collapse-item__content {
    padding: 20px;
    padding-bottom: 0;
  }
}
.form-card--p20 {
  padding: 20px;
  padding-bottom: 0;
}
.input-switch-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  .con-left {
    flex: 1;
  }
  .con-right {
    margin-left: 10px;
    line-height: 0;
  }
}
.blue-background-class {
  background-color: #c8ebfb !important;
}
.el-loading-mask {
  background-color: rgba(0, 0, 0, 0.1) !important;
}
/* 去除谷歌地图底部logo */
.ol-map .gmnoprint {
  display: none !important;
}
.ol-map .gm-style-cc {
  display: none !important;
}
.ol-map a[rel='noopener'] {
  display: none !important;
}

/* 数字输入框内容固定左对齐 */
.el-input-number .el-input__inner {
  text-align: left !important;
}

/* 输入框 下拉框 禁用状态字体颜色自定义 */
.el-input.is-disabled .el-input__inner {
  -webkit-text-fill-color: #606266 !important;
  color: #606266 !important;
}
.el-select__wrapper.is-disabled .el-select__selected-item {
  -webkit-text-fill-color: #606266 !important;
  color: #606266 !important;
}
.el-textarea.is-disabled .el-textarea__inner {
  color: #606266 !important;
}
.el-range-editor.is-disabled input {
  color: #606266 !important;
}

/* 表单项的label 强制不换行 */
.el-form-item__label {
  white-space: nowrap;
}

/* el-image 大图预览背景色 */
.el-image-viewer__wrapper .el-image-viewer__canvas img {
  background-color: #fff;
}

// 下拉框多选显示的文本内容过长导致显示溢出框外
.log-msg-ellipsis {
  .el-select__tags {
    .el-tag {
      max-width: calc(100% - 60px);
    }
  }
  .el-select__tags-text {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* 单独tag上的关闭按钮有显示问题 */
  .el-icon.el-tag__close {
    // display: none;
    z-index: 3;
  }
}

// 表单编辑过的表单项高亮
.edit-outline .el-form-item__content {
  .el-input__inner,
  .el-textarea__inner {
    box-shadow: 0px 0px 5px #f7e566e1;
    // box-shadow: 0px 0px 5px #f00c0ce1;
  }
  .el-switch .el-switch__core {
    box-shadow: 0px 0px 5px #f7e566;
  }
  .el-checkbox-group {
    box-shadow: 0px 0px 5px #f7e566e1;
  }
  .radio-group-form-warp {
    box-shadow: 0px 0px 5px #f7e566e1;
  }
}
.edit-outline .my-upload-file-warp {
  box-shadow: 0px 0px 5px #f7e566e1;
}
.edit-outline .my-upload .el-upload-list__item {
  box-shadow: 0px 0px 5px #f7e566e1;
}

.edit-outline.el-table {
  box-shadow: 0px 0px 5px #f7e566e1;
}
.new-add-row td {
  background-color: #89db9b !important;
}
.cancel-row td {
  background-color: #f9f3c0e1 !important;
  // background-color: #f99999 !important;
}
td.edit-table-cell {
  background-color: #f9f3c0e1 !important;
}
td.is-err-table-cell {
  // border: 1px solid #f00 !important;
  background-color: rgb(248, 196, 196) !important;
}
// 产品弹窗 宽度拖动条样式
.menu-resize {
  width: 3px;
  height: 100%;
  position: absolute;
  top: 0;
  right: -12px;
  cursor: col-resize;
  background: #ccc;
  z-index: 9;
}
/* 去除表格单元格border */
/* .el-table--border .el-table__body-wrapper td {
  border-right-color: rgba(255, 255, 255, 0.1) !important;
} */
/* .el-table--border .el-table__fixed td {
  border-right-color: rgba(255, 255, 255, 0.1) !important;
} */

.bpm-page-menu-title {
  position: absolute;
  right: 60px;
  font-weight: 600;
  color: #333;
}
.flow1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
