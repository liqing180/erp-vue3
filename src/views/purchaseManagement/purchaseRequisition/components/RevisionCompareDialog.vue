<template>
  <el-dialog
    :model-value="modelValue"
    :title="$t('PURCHASE.revisionComparison')"
    width="1280px"
    append-to-body
    :close-on-click-modal="false"
    @close="close"
    @closed="reset"
  >
    <div v-loading="loading">
      <el-table
        v-if="basicUpdates.length"
        :data="basicUpdates"
        border
        max-height="320"
        class="mb20"
      >
        <el-table-column
          prop="label"
          :label="$t('uiBtn.fieldName')"
          min-width="180"
        />
        <el-table-column
          prop="beforeValue"
          :label="$t('PURCHASE.beforeRevision')"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column
          prop="afterValue"
          :label="$t('PURCHASE.afterRevision')"
          min-width="220"
          show-overflow-tooltip
        />
      </el-table>

      <el-collapse v-model="activeNames" v-if="hasDetail">
        <el-collapse-item v-if="beforeFiles.length" name="beforeFiles">
          <template #title
            >{{ $t('ui.attachment') }} ·
            {{ $t('PURCHASE.beforeRevision') }}</template
          >
          <myUpload ref="beforeUpload" :disabled="true" />
        </el-collapse-item>
        <el-collapse-item v-if="afterFiles.length" name="afterFiles">
          <template #title
            >{{ $t('ui.attachment') }} ·
            {{ $t('PURCHASE.afterRevision') }}</template
          >
          <myUpload ref="afterUpload" :disabled="true" />
        </el-collapse-item>
        <el-collapse-item v-if="beforeDetails.length" name="beforeDetails">
          <template #title
            >{{ $t('PURCHASE.productInfo') }} ·
            {{ $t('PURCHASE.beforeRevision') }}</template
          >
          <detail-table :rows="beforeDetails" />
        </el-collapse-item>
        <el-collapse-item v-if="afterDetails.length" name="afterDetails">
          <template #title
            >{{ $t('PURCHASE.productInfo') }} ·
            {{ $t('PURCHASE.afterRevision') }}</template
          >
          <detail-table :rows="afterDetails" :highlight="true" />
        </el-collapse-item>
      </el-collapse>

      <el-empty
        v-if="!loading && !basicUpdates.length && !hasDetail"
        :description="$t('ui.noData')"
      />
    </div>

    <template #footer>
      <el-button @click="close">{{ $t('uiBtn.back') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { h } from 'vue'
import { ElTable, ElTableColumn } from 'element-plus'
import { queryUpdateMsgPR } from '@/api/purchaseManagement/purchaseRequisition'

const DetailTable = {
  name: 'PrRevisionDetailTable',
  props: {
    rows: {
      type: Array,
      default: () => []
    },
    highlight: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const rowClassName = ({ row }) => {
      if (!props.highlight) return ''
      if (row.updateType === '2') return 'new-add-row'
      if (row.updateType === '3') return 'cancel-row'
      return ''
    }
    const cellClassName = ({ row, column }) => {
      if (!props.highlight || row.updateType !== '1') return ''
      return (row.updateMsgList || []).some(
        item => item.name === column.property
      )
        ? 'edit-table-cell'
        : ''
    }
    return () =>
      h(
        ElTable,
        {
          data: props.rows,
          border: true,
          maxHeight: 360,
          rowClassName,
          cellClassName
        },
        () => [
          h(ElTableColumn, {
            type: 'index',
            label: '#',
            width: 55,
            align: 'center'
          }),
          h(ElTableColumn, {
            prop: 'productName',
            label: 'Product',
            minWidth: 180,
            showOverflowTooltip: true
          }),
          h(ElTableColumn, {
            prop: 'internalPartNo',
            label: 'Internal Part No.',
            minWidth: 160,
            showOverflowTooltip: true
          }),
          h(ElTableColumn, {
            prop: 'externalPartNo',
            label: 'External Part No.',
            minWidth: 160,
            showOverflowTooltip: true
          }),
          h(ElTableColumn, { prop: 'uom', label: 'UOM', minWidth: 100 }),
          h(ElTableColumn, {
            prop: 'qty',
            label: 'Qty',
            minWidth: 100,
            align: 'right'
          }),
          h(ElTableColumn, {
            prop: 'deliveryDate',
            label: 'Delivery Date',
            minWidth: 145
          }),
          h(ElTableColumn, {
            prop: 'remarks',
            label: 'Remarks',
            minWidth: 180,
            showOverflowTooltip: true
          })
        ]
      )
  }
}

export default {
  name: 'RevisionCompareDialog',
  components: { DetailTable },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    purchaseRequisiteId: {
      type: [String, Number],
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loading: false,
      activeNames: [
        'beforeFiles',
        'afterFiles',
        'beforeDetails',
        'afterDetails'
      ],
      basicUpdates: [],
      beforeDetails: [],
      afterDetails: [],
      beforeFiles: [],
      afterFiles: []
    }
  },
  computed: {
    hasDetail() {
      return Boolean(
        this.beforeDetails.length ||
          this.afterDetails.length ||
          this.beforeFiles.length ||
          this.afterFiles.length
      )
    }
  },
  watch: {
    modelValue(value) {
      if (value && this.purchaseRequisiteId) this.load()
    }
  },
  methods: {
    labelFor(name) {
      const labels = {
        departmentName: this.$t('ui.dept'),
        requiredBy: this.$t('PURCHASE.requiredBy'),
        costProjectCode: this.$t('PURCHASE.projectCode'),
        dropShipping: this.$t('PURCHASE.dropShipping'),
        receiveAddressName: this.$t('PURCHASE.deliveryAddress'),
        contactPersonNameShowStr: this.$t('PURCHASE.consignee'),
        email: this.$t('PURCHASE.requestedEmail'),
        mobilePhone: this.$t('PURCHASE.requestedMobilePhone'),
        reason: this.$t('ui.reason'),
        remarks: this.$t('ui.remarks')
      }
      return labels[name] || name
    },
    formatValue(value, name) {
      if (name === 'dropShipping') {
        return value === '1'
          ? this.$t('uiBtn.active')
          : this.$t('uiBtn.inactive')
      }
      return value ?? ''
    },
    normalizeDetails(list) {
      return (list || []).map(row => ({
        ...row,
        qty: this.$numberStr(row.qty, row.decimalNum ?? 3),
        deliveryDate: row.deliveryDate
          ? this.parseTime(row.deliveryDate, this.$store.getters.fmtForYmd)
          : ''
      }))
    },
    async load() {
      this.loading = true
      try {
        const response = await queryUpdateMsgPR({
          purchaseRequisiteId: this.purchaseRequisiteId
        })
        const data = response.data || {}
        this.basicUpdates = (data.basicUpdateMsgList || []).map(item => ({
          ...item,
          label: this.labelFor(item.name),
          beforeValue: this.formatValue(item.beforeValue, item.name),
          afterValue: this.formatValue(item.afterValue, item.name)
        }))
        this.beforeDetails = this.normalizeDetails(data.beforeDetailList)
        this.afterDetails = this.normalizeDetails(data.afterDetailList)
        this.beforeFiles = data.beforeCommonFileList || []
        this.afterFiles = data.afterCommonFileList || []
        this.$nextTick(() => {
          this.$refs.beforeUpload?.initFileList?.(this.beforeFiles)
          this.$refs.afterUpload?.initFileList?.(this.afterFiles)
        })
      } finally {
        this.loading = false
      }
    },
    close() {
      this.$emit('update:modelValue', false)
    },
    reset() {
      this.basicUpdates = []
      this.beforeDetails = []
      this.afterDetails = []
      this.beforeFiles = []
      this.afterFiles = []
    }
  }
}
</script>
