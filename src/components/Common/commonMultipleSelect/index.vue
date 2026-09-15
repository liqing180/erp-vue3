<template>
  <el-select
    :model-value="ids"
    :title="showTitle ? (labels || []).join(', ') : ''"
    :disabled="disabled"
    placeholder=""
    style="width: 100%"
    multiple
    :collapse-tags="collapseTags"
    clearable
    class="log-msg-ellipsis"
    @change="change"
  >
    <el-option
      v-for="item in options"
      :key="item[idKey]"
      :label="item[labelKey]"
      :value="item[idKey]"
      :disabled="item.disabled"
    />
    <div
      v-if="options.length <= 0 && hideOptions.length > 0"
      style="text-align: center; color: #999; font-size: 14px; padding: 5px 0"
    >
      No Data
    </div>
    <el-option
      v-for="item in hideOptions"
      v-show="false"
      :key="item[idKey]"
      :label="item[labelKey]"
      :value="item[idKey]"
    />
  </el-select>
</template>

<script>
export default {
  props: {
    labels: {
      type: Array,
      default: () => []
    },
    ids: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    collapseTags: {
      type: Boolean,
      default: true
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    idKey: {
      type: String,
      default: 'value'
    },
    options: {
      type: Array,
      default: () => []
    },
    showTitle: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change'],
  computed: {
    hideOptions() {
      const hideList = []
      const ids = this.ids || []
      const labels = this.labels || []
      ids.forEach((id, index) => {
        if (!this.options.find(item => item[this.idKey] === id)) {
          hideList.push({
            [this.labelKey]: labels[index],
            [this.idKey]: id
          })
        }
      })
      return hideList
    }
  },
  methods: {
    change(value) {
      const oldData = {}
      const ids = this.ids || []
      const labels = this.labels || []
      ids.forEach((item, index) => {
        oldData[item] = labels[index]
      })

      const newIds = value || []
      const newLabels = []
      newIds.forEach(idItem => {
        const row = this.options.find(item => item[this.idKey] === idItem)
        if (row) {
          newLabels.push(row[this.labelKey])
        } else {
          newLabels.push(oldData[idItem])
        }
      })
      this.$emit('change', newIds, newLabels)
    }
  }
}
</script>
