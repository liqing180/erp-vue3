<template>
  <div class="tooltip-row">
    <el-popover
      trigger="hover"
      placement="top"
      :disabled="!sourceText.trim() || editPopShow"
      :show-after="400"
    >
      <div class="desc-tooltip">
        <div v-if="sourceText" class="desc-content">{{ sourceText }}</div>
      </div>

      <template #reference>
        <el-popover
          :visible="editPopShow"
          placement="top"
          :width="600"
          trigger="click"
        >
          <div class="editor-body">
            <el-input
              ref="textareaRef"
              v-model="editValue"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 8 }"
              resize="none"
              show-word-limit
              :maxlength="normalizedMaxlength"
              @input="handleInput"
            />
          </div>
          <div class="editor-footer">
            <el-button size="small" @click="hidePop('cancel')">
              {{ $t('menu.cancel') }}
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="hidePop('confirm')"
            >
              {{ $t('uiBtn.confirm1') }}
            </el-button>
          </div>

          <template #reference>
            <slot>
              <div v-if="!disabled" class="editable-row" @click="showPop">
                <div class="primary-pointer tooltip-row flex-value">
                  <span v-if="sourceText.trim()">{{ sourceText }}</span>
                  <span v-else class="transparent-placeholder">
                    -------------
                  </span>
                </div>
                <el-icon class="edit-icon"><Edit /></el-icon>
              </div>
              <div v-else class="tooltip-row">{{ sourceText }}</div>
            </slot>
          </template>
        </el-popover>
      </template>
    </el-popover>
  </div>
</template>

<script>
import { Edit } from '@element-plus/icons-vue'

// 表格内只允许一个描述编辑框处于打开状态。
let activeDescriptionEditor = null

export default {
  name: 'DescriptionEditDlg',
  components: {
    Edit
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined
    },
    value: {
      type: [String, Number],
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: [String, Number],
      default: undefined
    }
  },
  emits: ['update:modelValue', 'update:value', 'input'],
  data() {
    return {
      editValue: '',
      editPopShow: false
    }
  },
  computed: {
    sourceValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    sourceText() {
      return String(this.sourceValue ?? '')
    },
    normalizedMaxlength() {
      if (this.maxlength === undefined || this.maxlength === '') {
        return undefined
      }
      return Number(this.maxlength)
    }
  },
  unmounted() {
    if (activeDescriptionEditor === this) {
      activeDescriptionEditor = null
    }
  },
  methods: {
    handleInput() {
      requestAnimationFrame(() => {
        this.$refs.textareaRef?.resizeTextarea?.()
      })
    },
    showPop() {
      if (this.disabled) return

      if (activeDescriptionEditor && activeDescriptionEditor !== this) {
        activeDescriptionEditor.hidePop('confirm')
      }
      activeDescriptionEditor = this

      this.editValue = this.sourceText
      this.editPopShow = true
      this.$nextTick(() => {
        this.$refs.textareaRef?.resizeTextarea?.()
        this.$refs.textareaRef?.focus?.()
        const textarea = this.$refs.textareaRef?.$el?.querySelector('textarea')
        if (textarea) textarea.scrollTop = 0
      })
    },
    hidePop(type) {
      if (type === 'confirm') {
        this.$emit('update:modelValue', this.editValue)
        this.$emit('update:value', this.editValue)
        this.$emit('input', this.editValue)
      }

      this.editPopShow = false
      if (activeDescriptionEditor === this) {
        activeDescriptionEditor = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.desc-tooltip {
  max-width: 800px;
  max-height: 400px;
  padding-right: 8px;
  overflow-y: auto;
  font-size: 12px;
}

.desc-content {
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
}

.tooltip-row {
  min-width: 50px;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.editable-row {
  display: flex;
  align-items: center;
  min-width: 0;
}

.flex-value {
  flex: 1;
}

.edit-icon {
  flex: 0 0 auto;
  padding-left: 5px;
  font-size: 20px;
  cursor: pointer;
}

.transparent-placeholder {
  color: transparent;
}

.editor-body {
  margin-bottom: 10px;
}

.editor-footer {
  text-align: right;
}
</style>
