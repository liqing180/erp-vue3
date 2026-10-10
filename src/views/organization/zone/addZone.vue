<template>
  <formPage :propTimeId="$route.query.timeId || ''" />
</template>

<script>
import formPage from './formPage.vue'
export default {
  name: 'AddZone',
  components: { formPage }
}
</script>
