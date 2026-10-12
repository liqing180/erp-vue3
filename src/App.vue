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

.fd-custom-class.el-message-box {
  vertical-align: top !important;
  margin-top: 140px !important; /* 距离顶部10%视口高度 */
}

.el-message-box .el-button--primary {
  // MessageBox 默认聚焦确认按钮，保持聚焦前后的背景色一致。
  &:not(:hover):not(:active):not(.is-disabled) {
    background-color: #409eff;
    border-color: #409eff;
  }

  &:focus-visible {
    outline: 2px solid #409eff;
    outline-offset: 2px;
  }
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
    min-height: 30px;
    line-height: 30px;
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
.collapse-item-content-pt0 {
  .el-collapse-item__content {
    padding-top: 10px;
  }
}
.form-card--p20 {
  padding: 20px;
  padding-bottom: 0;
}
.input-switch-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  .el-table__cell {
    background-color: #c8ebfb !important;
  }
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

.el-badge__content {
  border: none !important;
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
.form-item__label-wrap .el-form-item__label {
  white-space: normal;
  word-break: normal;
}

/* el-image 大图预览背景色 */
.el-image-viewer__wrapper .el-image-viewer__canvas img {
  background-color: #fff;
}

// Element Plus 多选标签与搜索输入位于 selection 内，保留 ERP 的文本省略及预留空间。
.log-msg-ellipsis,
.log-msg-ellipsis-filterable {
  .el-select__selected-item:has(.el-tag) {
    max-width: calc(100% - 60px);
  }
  .el-tag {
    max-width: 100%;
  }
  .el-tag__content,
  .el-select__tags-text {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .el-tag__close {
    flex-shrink: 0;
  }
}
.log-msg-ellipsis-filterable {
  .el-select__selected-item:has(.el-tag) {
    max-width: calc(100% - 100px);
  }
}

// 表单编辑过的表单项高亮
.edit-outline .el-form-item__content {
  // Element Plus 的背景和边框位于 wrapper，避免只高亮内部文字区域。
  .el-input__wrapper,
  .el-select__wrapper,
  .el-range-editor,
  .el-textarea__inner {
    background: #f0f7ff;
    border-left: 3px solid #c2d7fb;
    padding-left: 12px;
  }
}
.edit-outline .el-form-item__content:has(.el-switch),
.edit-outline .el-form-item__content:has(.el-checkbox-group),
.edit-outline .el-form-item__content:has(.el-radio-group),
.edit-outline .el-form-item__content:has(.radio-group-form-warp) {
  border: 1px solid #dcdfe6;
  background: #f0f7ff;
  border-left: 3px solid #c2d7fb;
  border-radius: 4px;
  /* 建议搭配内边距，防止文字紧贴边框 */
  padding-left: 12px;
}
.edit-outline .my-upload-file-warp {
  box-shadow: 0px 0px 5px #c2d7fb;
}
.edit-outline .my-upload .el-upload-list__item {
  box-shadow: 0px 0px 5px #c2d7fb;
}
// 用户头像 商标组件
.edit-outline .user-info-head {
  box-shadow: 0px 0px 5px #c2d7fb;
}

.edit-outline.el-table {
  box-shadow: 0px 0px 5px #c2d7fb;
}
.edit-outline .img-logicis-editor {
  box-shadow: 0px 0px 5px #c2d7fb;
}
.new-add-row td {
  background-color: #d2e3fc !important;
}
.cancel-row td {
  background-color: #f5f5f4 !important;
  text-decoration: line-through;
  color: #78716c;
  .payment-tree * {
    text-decoration: line-through;
  }
}
.required-row {
  border: 2px solid #f99999 !important;
}

td.edit-table-cell {
  background-color: #f0f7ff !important;
}
td.is-overflow-row {
  border: 2px solid #f99999 !important;
}
td.is-err-table-cell {
  background-color: rgb(248, 196, 196) !important;
}
.el-table__header,
.el-table__body,
.el-table__footer {
  border-collapse: collapse !important;
}
.custom-table-cell {
  .cell {
    display: flex;
  }
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
.bpm-page-menu-title {
  position: absolute;
  right: 60px;
  font-weight: 600;
  color: #333;
}
// 主列表revise中图标样式
.inReviseIcon {
  font-size: 18px;
  margin-left: 5px;
  position: absolute;
  right: 0px;
  top: 0px;
}

.flow1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 产品名悬浮 description 样式
.desc-tooltip {
  max-width: 800px;
  max-height: 400px;
  overflow-y: auto;
  font-size: 12px;
  .desc-title {
    color: chartreuse;
  }
  & > pre {
    white-space: pre-wrap;
    max-width: 800px;
    line-height: 24px;
  }
}
.tooltip-row {
  white-space: nowrap;
  min-width: 50px;
  height: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desc-tooltip::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: initial;
}

.desc-tooltip::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: #c1c1c1;
}

.desc-tooltip::-webkit-scrollbar-track {
  width: 10px;
  box-shadow: none;
  border-radius: 0;
  background-color: initial;
}

.my-sq-ul {
  background-color: #f3f4f6;
  border-radius: 6px;
  padding: 10px;
  li {
    position: relative;
    padding-left: 20px;
    line-height: 30px;
  }
  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(0%, -50%);
    width: 6px; /* 圆点宽度 */
    height: 6px; /* 圆点高度 */
    border-radius: 50%; /* 圆形 */
    background-color: #666; /* 圆点颜色 */
  }
}

/* 销售需求，销售报价 条件字段使用 */
.conditions-warp {
  position: relative;
  .conditions-btn {
    position: absolute;
    z-index: 400;
    right: 8px;
    top: 8px;
  }
}
.conditions-item-box {
  max-height: 600px;
  overflow-y: auto;
}
.conditions-item {
  line-height: 19px;
  td {
    padding: 6px;
  }
  .el-checkbox__input,
  .el-checkbox__label {
    vertical-align: top;
  }
  .el-checkbox__input {
    margin-top: 2px;
  }
  .conditions-label {
    white-space: nowrap;
    vertical-align: top;
    padding-right: 10px;
    font-size: 12px;
    line-height: 19px;
  }
  .conditions-content {
    white-space: pre-wrap;
    word-break: break-word;
    min-width: 316px;
    max-width: 600px;
    font-size: 12px;
  }
}
.conditions-item:hover {
  background-color: #eee;
}

.el-textarea__inner {
  word-wrap: break-word !important;
  word-break: break-word !important;
}

/* 开始 */
/* 将PDF付款条款变量写入销售订单，作用于付款条款的样式 */
.remarks2 pre {
  font-size: 12px;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.2em;
  padding: 0;
  margin: 0;
}
.payment-tree {
  box-sizing: border-box;
  display: inline-block;
  width: 85%;
  vertical-align: top;
}
.payment-tree div {
  box-sizing: border-box;
  padding-bottom: 8px;
}
.payment-tree div:last-child {
  padding-bottom: 0px;
}
.p-level-1 {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}
.p-level-2 {
  padding-left: 20px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}
.p-level-3 {
  padding-left: 40px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}
.p-level-4 {
  padding-left: 60px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
}
.p-level-5 {
  padding-left: 80px;
}
.p-level-6 {
  padding-left: 100px;
}

.tree-box-input {
  .el-input__wrapper {
    width: 0;
    min-width: 0;
    padding: 0;
    box-shadow: none;
  }
  .el-input__inner {
    width: 0;
    padding: 0;
    border-width: 0;
  }
}
.el-message__content {
  overflow-wrap: normal;
  word-break: normal;
}

.el-form--label-top .el-form-item__label {
  padding: 0 !important;
  margin-bottom: 2px !important;
  color: #909399;
}
.el-form--label-top .el-form-item {
  margin-bottom: 14px !important;
}
.el-radio__input.is-disabled .el-radio__inner {
  background-color: #ced2d9;
}

.el-autocomplete .el-icon-arrow-up {
  transform: rotateZ(180deg);
}
.el-autocomplete[aria-expanded='true'] .el-icon-arrow-up {
  transform: rotateZ(0);
}
.el-autocomplete {
  .el-input__suffix-inner:has(.el-input__clear) {
    .el-icon-arrow-up {
      display: none;
    }
  }
}
/* 结尾 */

.legend-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;

  .legend-text {
    color: #606266;
  }
  .legend-divider {
    width: 1px;
    height: 14px;
    background: #e0e0e0;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .color-block {
    width: 16px;
    height: 16px;
    border: 1px solid #c0c4cc;
    border-radius: 3px;

    &.add {
      background-color: #d2e3fc;
      border-color: #1a73e8;
    }
    &.edit {
      background-color: #f0f7ff;
      border-color: #c2d7fb;
    }
    &.del {
      background-color: #f5f5f4;
      border-color: #78716c;
    }
  }
}
.reject-remarks {
  color: #444;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
.reject-by {
  margin-top: 4px;
  color: #999;
  font-size: 11px;
}
.reject-card {
  border-left: 3px solid #f56c6c !important;
}
.reject-card .el-collapse-item__header,
.reject-card .el-collapse-item__wrap {
  background-color: #fff7f7 !important;
}
.reject-card .el-collapse-item__header {
  border-bottom: 1px solid #e2e8f0;
}
</style>
