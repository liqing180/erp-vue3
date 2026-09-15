<template>
  <div class="table-prop-error">
    {{ $t('ui.reqMsgForTableRow') }}
  </div>
</template>

<script>
export default {
  name: 'TablePropError'
}
</script>

<style scoped>
.table-prop-error {
  padding: 3px 0;
  color: #f56c6c;
  font-size: 12px;
  line-height: 13px;
  text-align: left;
}
</style>
