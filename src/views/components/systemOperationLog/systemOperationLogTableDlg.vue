<template>
  <el-dialog
    draggable
    :title="$t('ui.systemOperationLog')"
    v-model="visible"
    width="1000px"
    :modal="true"
    :close-on-click-modal="false"
    @closed="closed"
    append-to-body
  >
    <SystemOperationLogTable :tableList="tableList" :loading="loading" />
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button @click="handleBack">{{ $t('ui.back') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import SystemOperationLogTable from '@/views/components/systemOperationLog/systemOperationLogTable.vue'
export default {
  components: { SystemOperationLogTable },
  props: {},
  data() {
    return {
      tableList: [],
      total: 0,
      loading: true,
      queryFn: undefined,
      params: {},
      visible: false
    }
  },
  methods: {
    handleOpen(queryFn, params) {
      this.visible = true
      const vm = this
      this.loading = true
      queryFn(params)
        .then(response => {
          this.loading = false
          this.total = response.total
          this.tableList = response.data || []
        })
        .catch(err => {
          vm.loading = false
          window.console.error(err)
        })
    },
    handleBack() {
      this.visible = false
    },
    closed() {
      this.tableList = []
    }
  }
}
</script>
