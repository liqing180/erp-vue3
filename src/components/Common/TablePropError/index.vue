<template>
  <div class="table-prop-error" :class="{ 'is-floating': floating }">
    {{ $t('ui.reqMsgForTableRow') }}
  </div>
</template>

<script>
export default {
  name: 'TablePropError',
  props: {
    floating: {
      type: Boolean,
      default: false
    }
  }
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

.table-prop-error.is-floating {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 10;
  max-width: 100%;
  padding: 2px 6px;
  border-radius: 6px;
  background-color: #f56c6c;
  color: #fff;
  font-size: 10px;
  line-height: 12px;
  white-space: nowrap;
  pointer-events: none;
}
</style>
