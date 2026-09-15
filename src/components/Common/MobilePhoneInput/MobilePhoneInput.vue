<template>
  <el-input
    :disabled="disabled"
    :model-value="mobileNum"
    :maxlength="maxlength"
    :class="{ 'input-with-select': !disabled }"
    :size="elementSize"
    class="form-wd"
    @input="handleChange"
  >
    <template #prepend>
      <el-select
        :disabled="disabled || mobileCodeList.length === 0"
        :model-value="mobileCode"
        :clearable="clearableCode"
        :size="elementSize"
        :filter-method="filterOption"
        placeholder=""
        filterable
        style="width: 84px; color: #606266"
        @change="selectChange"
        @visible-change="visibleChange"
      >
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.mobileCode"
          :value="item.mobileCode"
        >
          <span>{{ item.description }}</span>
        </el-option>
      </el-select>
    </template>
  </el-input>
</template>

<script>
import { queryMobileCodeList } from '@/api/system/parameterConfiguration'
import { queryMobileCodeListExternal } from '@/api/login'

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    mobileCode: {
      type: String,
      default: ''
    },
    mobileNum: {
      type: String,
      default: ''
    },
    mobileNo: {
      type: String,
      default: ''
    },
    maxlength: {
      type: Number,
      default: 20
    },
    clearableCode: {
      type: Boolean,
      default: false
    },
    isDefaultSelect: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: undefined
    },
    // 外链模式不依赖登录 token。
    isToken: {
      type: Boolean,
      default: true
    },
    legalEntityId: {
      type: [Number, String],
      default: ''
    }
  },
  emits: [
    'update:mobileCode',
    'update:mobileNum',
    'update:mobileNo',
    'clearValidate'
  ],
  data() {
    return {
      init: false,
      mobileCodeList: [],
      options: []
    }
  },
  computed: {
    elementSize() {
      return this.size === 'mini' ? 'small' : this.size
    }
  },
  watch: {
    mobileCode: {
      handler() {
        this.resetInitState()
      },
      immediate: true
    },
    mobileNum: {
      handler() {
        this.resetInitState()
      },
      immediate: true
    }
  },
  created() {
    this.loadMobileCodeList()
  },
  methods: {
    loadMobileCodeList() {
      const request = this.isToken
        ? queryMobileCodeList()
        : queryMobileCodeListExternal({ legalEntityId: this.legalEntityId })

      request.then(res => {
        this.mobileCodeList = res.data || []
        this.options = this.mobileCodeList

        if (this.isDefaultSelect && this.options.length > 0) {
          this.$emit('update:mobileCode', this.options[0].mobileCode)
          this.$nextTick(() => {
            this.$emit('clearValidate')
          })
        }
      })
    },
    resetInitState() {
      if (!this.mobileCode && !(this.mobileNum && this.mobileNum.trim())) {
        this.init = false
      }
    },
    handleChange(value) {
      const mobileNum = String(value ?? '')
        .replace(/[^\d]/g, '')
        .trim()
      if (this.mobileCode && mobileNum) {
        this.init = true
      }
      this.$emit('update:mobileNum', mobileNum)
      this.$nextTick(() => {
        this.changeMobileNo()
      })
    },
    selectChange(value) {
      this.$emit('update:mobileCode', value)
      this.$nextTick(() => {
        this.changeMobileNo()
      })
    },
    changeMobileNo() {
      const mobileNum = String(this.mobileNum ?? '').trim()
      const mobileCode = this.mobileCode || ''

      if (mobileCode && mobileNum) {
        this.init = true
      } else if (!this.init) {
        this.$nextTick(() => {
          this.$emit('clearValidate')
        })
      }

      // 保留 ERP-VUE2 行为：任一字段变化都同步组合值。
      this.$emit('update:mobileNo', `${mobileCode} ${mobileNum}`)
    },
    visibleChange(show) {
      if (!show) {
        setTimeout(() => {
          this.options = this.mobileCodeList
        }, 100)
      }
    },
    filterOption(value) {
      const keyword = String(value ?? '')
        .trim()
        .toLocaleLowerCase()
      if (!keyword) {
        this.options = this.mobileCodeList
        return
      }

      this.options = this.mobileCodeList.filter(item => {
        const mobileCode = String(item.mobileCode ?? '').toLocaleLowerCase()
        const description = String(item.description ?? '').toLocaleLowerCase()
        return mobileCode.includes(keyword) || description.includes(keyword)
      })
    }
  }
}
</script>

<style lang="scss">
.input-with-select .el-input-group__prepend {
  background-color: #fff !important;
}
</style>
