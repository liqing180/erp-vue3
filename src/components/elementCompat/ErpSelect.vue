<template>
  <ElSelectOriginal
    ref="selectRef"
    v-bind="$attrs"
    :model-value="sourceValue"
    :filterable="filterable"
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
  </ElSelectOriginal>
</template>

<script>
import { ElSelect } from 'element-plus'

function isVisible(element) {
  if (!element) return false
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

export default {
  name: 'ErpSelect',
  inheritAttrs: false,
  components: {
    ElSelectOriginal: ElSelect
  },
  props: {
    modelValue: {
      default: undefined
    },
    value: {
      default: undefined
    },
    filterable: {
      type: Boolean,
      default: true
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
    isValueEmpty() {
      return (
        !this.sourceValue ||
        (Array.isArray(this.sourceValue) && this.sourceValue.length === 0)
      )
    },
    getVisibleDropdown() {
      const root = this.$refs.selectRef?.$el
      const control = root?.querySelector?.('[aria-controls]')
      const ids = (control?.getAttribute('aria-controls') || '')
        .split(/\s+/)
        .filter(Boolean)

      for (const id of ids) {
        const dropdown = document.getElementById(id)
        if (isVisible(dropdown)) return dropdown
      }

      const dropdowns = [
        ...document.querySelectorAll('.el-select-dropdown')
      ].filter(isVisible)
      return dropdowns[dropdowns.length - 1]
    },
    selectTabTarget() {
      if (!this.isValueEmpty()) return

      const dropdown = this.getVisibleDropdown()
      if (!dropdown) return

      const options = [
        ...dropdown.querySelectorAll('.el-select-dropdown__item')
      ].filter(
        option => isVisible(option) && !option.classList.contains('is-disabled')
      )
      if (!options.length) return

      const target =
        options.find(option => option.classList.contains('is-hovering')) ||
        options[0]
      target.click()
    },
    handleKeydown(event) {
      if (event.key !== 'Tab') return

      this.selectTabTarget()
      this.$nextTick(() => {
        this.$refs.selectRef?.blur?.()
      })
    },
    focus() {
      this.$refs.selectRef?.focus?.()
    },
    blur() {
      this.$refs.selectRef?.blur?.()
    }
  }
}
</script>
