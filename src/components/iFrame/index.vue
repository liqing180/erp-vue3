<template>
  <div v-loading="loading" :style="{ height }">
    <iframe
      :src="url"
      frameborder="no"
      style="width: 100%; height: 100%"
      scrolling="auto"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  otherHeight: {
    type: Number,
    default: 94.5
  }
})

const height = ref('0px')
const loading = ref(true)
const url = computed(() => props.src)
let loadingTimer

function updateHeight() {
  const availableHeight =
    document.documentElement.clientHeight - (props.otherHeight || 94.5)
  height.value = `${Math.max(0, availableHeight)}px`
}

watch(() => props.otherHeight, updateHeight)

onMounted(() => {
  updateHeight()
  window.addEventListener('resize', updateHeight)
  loadingTimer = window.setTimeout(() => {
    loading.value = false
  }, 300)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeight)
  if (loadingTimer) {
    window.clearTimeout(loadingTimer)
  }
})
</script>
