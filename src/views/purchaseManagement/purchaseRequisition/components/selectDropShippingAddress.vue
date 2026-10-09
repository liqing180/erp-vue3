<template>
  <el-autocomplete
    ref="autocomplete"
    :fetch-suggestions="querySearch"
    :model-value="inputValue"
    :suffix-icon="canSelectOptions.length ? ArrowUp : undefined"
    clearable
    trigger-on-focus
    @update:model-value="inputFn"
    @blur="blurFn"
    @focus="focusFn"
    @clear="clear"
    @keyup.enter="$emit('search')"
    @select="handleSelect"
    :maxlength="100"
    value-key="receiveAddressName"
    highlight-first-item
    select-when-unmatched
    :disabled="disabled"
  />
</template>

<script>
import { ArrowUp } from '@element-plus/icons-vue'
import { markRaw } from 'vue'

export default {
  name: 'SelectDropShippingAddress',
  props: {
    disabled: { type: Boolean, default: false },
    modelValue: { type: [String, Number], default: '' },
    canSelectOptions: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue', 'change', 'search'],
  data() {
    return {
      ArrowUp: markRaw(ArrowUp),
      inputValue: '',
      mouseType: 'blur',
      isNoChange: false
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(value) {
        this.inputValue = value
      }
    }
  },
  methods: {
    inputFn(value) {
      this.isNoChange = false
      this.inputValue = value
      this.$emit('update:modelValue', value)
    },
    querySearch(queryString, callback) {
      const keyword = (queryString || '').trim().toLowerCase()
      callback(
        keyword
          ? this.canSelectOptions.filter(item =>
              item.receiveAddressName.toLowerCase().includes(keyword)
            )
          : this.canSelectOptions
      )
    },
    blurFn() {
      this.mouseType = 'blur'
      if (!this.isNoChange) this.handleSelect()
    },
    focusFn() {
      this.isNoChange = true
      this.mouseType = 'focus'
    },
    clear() {
      this.isNoChange = false
      this.$emit('change', {})
    },
    handleSelect() {
      this.inputValue = (this.inputValue || '').trim()
      const item = this.canSelectOptions.find(
        item => item.receiveAddressName === this.inputValue
      )
      this.$emit('update:modelValue', this.inputValue)
      this.$emit('change', item || { receiveAddressName: this.inputValue })
    }
  }
}
</script>
