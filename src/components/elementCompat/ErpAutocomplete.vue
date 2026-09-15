<template>
  <ElAutocompleteOriginal
    ref="autocompleteRef"
    v-bind="$attrs"
    :model-value="sourceValue"
    @update:model-value="handleUpdate"
    @keydown.capture="handleKeydown"
  >
    <template
      v-for="(_, slotName) in $slots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </ElAutocompleteOriginal>
</template>

<script>
import { ElAutocomplete } from 'element-plus'

function isVisible(element) {
  if (!element) return false
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

export default {
  name: 'ErpAutocomplete',
  inheritAttrs: false,
  components: {
    ElAutocompleteOriginal: ElAutocomplete
  },
  props: {
    modelValue: {
      default: undefined
    },
    value: {
      default: undefined
    }
  },
  emits: ['update:modelValue', 'update:value', 'input'],
  computed: {
    sourceValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    }
  },
  methods: {
    handleUpdate(value) {
      this.$emit('update:modelValue', value)
      this.$emit('update:value', value)
      this.$emit('input', value)
    },
    getVisibleSuggestionPanel() {
      const panels = [
        ...document.querySelectorAll('.el-autocomplete-suggestion')
      ].filter(isVisible)
      return panels[panels.length - 1]
    },
    handleKeydown(event) {
      if (event.key !== 'Tab') return

      if (!String(this.sourceValue ?? '').trim()) {
        const panel = this.getVisibleSuggestionPanel()
        const highlighted =
          panel?.querySelector('li.highlighted') ||
          panel?.querySelector('li[aria-selected="true"]')
        highlighted?.click()
      }

      this.$nextTick(() => {
        this.$refs.autocompleteRef?.blur?.()
      })
    },
    focus() {
      this.$refs.autocompleteRef?.focus?.()
    },
    blur() {
      this.$refs.autocompleteRef?.blur?.()
    }
  }
}
</script>
