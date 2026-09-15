<template>
  <el-input
    :disabled="disabled"
    :model-value="mobileNum"
    :maxlength="maxlength"
    @input="handleChange"
    :class="{ 'input-with-select': !disabled }"
    class="form-wd"
  >
    <template v-slot:prepend>
      <el-select
        :disabled="disabled || mobile_code_list.length === 0"
        :model-value="mobileCode"
        @change="selectChange"
        @visible-change="visibleChange"
        placeholder=""
        filterable
        :filter-method="filterOption"
        style="width: 84px; color: #606266"
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
    }
  },
  emits: [
    'update:mobileCode',
    'update:mobileNum',
    'update:mobileNo',
    'clearValidate'
  ],
  watch: {
    mobileCode: {
      handler() {
        if (!this.mobileCode && !(this.mobileNum && this.mobileNum.trim())) {
          this.init = false
        }
      },
      immediate: true
    },
    mobileNum: {
      handler() {
        if (!this.mobileCode && !(this.mobileNum && this.mobileNum.trim())) {
          this.init = false
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      init: false,
      mobile_code_list: [],
      options: []
    }
  },
  computed: {},
  created() {
    queryMobileCodeList().then(res => {
      this.mobile_code_list = res.data || []
      this.options = this.mobile_code_list
    })
  },
  methods: {
    handleChange(value) {
      value = value.replace(/[^\d]/g, '')
      if (this.mobileCode && this.mobileNum && this.mobileNum.trim()) {
        this.init = true
      }
      this.$emit('update:mobileNum', value.trim())
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
      if (this.mobileCode && this.mobileNum && this.mobileNum.trim()) {
        this.init = true
        this.$emit(
          'update:mobileNo',
          `${this.mobileCode} ${this.mobileNum.toString()}`
        )
      } else {
        if (!this.init) {
          this.$nextTick(() => {
            this.$emit('clearValidate')
          })
        }
        this.$emit(
          'update:mobileNo',
          `${this.mobileCode} ${this.mobileNum.toString()}`
        )
        // this.$emit('update:mobileNo', '')
      }
    },
    visibleChange(show) {
      if (show === false) {
        setTimeout(() => {
          this.options = this.mobile_code_list
        }, 100)
      }
    },
    filterOption(str) {
      if ((str + '').trim() !== '') {
        const res = []
        this.mobile_code_list.forEach(item => {
          if (
            item.mobileCode
              .toLocaleLowerCase()
              .indexOf(str.trim().toLocaleLowerCase()) >= 0
          ) {
            res.push(item)
          } else if (
            item.description
              .toLocaleLowerCase()
              .indexOf(str.trim().toLocaleLowerCase()) >= 0
          ) {
            res.push(item)
          }
        })
        this.options = res
      } else {
        this.options = this.mobile_code_list
      }
    }
  }
}
</script>

<style lang="scss">
.input-with-select .el-input-group__prepend {
  background-color: #fff !important;
}
</style>
