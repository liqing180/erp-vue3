<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('uiBtn.search')"
    v-model="open"
    width="1000px"
    append-to-body
  >
    <el-form ref="form" class="form">
      <el-form-item v-for="(item, index) in rowData" :key="item.id">
        <el-row :gutter="20" style="width: 100%">
          <el-col :span="8">
            <el-select
              style="width: 100%"
              :size="size"
              v-model="item.value"
              clearable
              @change="updateSearchValue($event, index)"
            >
              <el-option
                v-for="child in item.pullDownData"
                :key="child.value"
                :label="child.label"
                :value="child.value"
                :disabled="child.disabled"
              >
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
              style="width: 100%"
              :size="size"
              v-model="item.operator"
              :disabled="!item.value || item.type === 'DatePickerEle'"
              @change="updateSearchRequirement($event, index)"
            >
              <el-option
                v-for="child in showMustList(item)"
                :key="child.value"
                :label="child.label"
                :value="child.value"
                :disabled="child.disabled"
              >
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input
              :size="size"
              style="width: 100%"
              disabled
              v-if="!item.value"
            ></el-input>
            <component
              v-bind="item"
              :is="item.type"
              :value="formData[item.name]"
              @updateForm="updateForm(item.name, $event, index)"
              :ref="item.type"
              :size="size"
              :isLine="false"
              v-else
            >
            </component>
          </el-col>
          <el-col :span="4">
            <el-icon
              class="mr10"
              style="font-size: 35px; cursor: pointer"
              @click="addSearchRow"
              v-if="rowData.length !== customSelectData.length"
            >
              <CirclePlus />
            </el-icon>

            <el-icon
              style="font-size: 35px; cursor: pointer"
              @click="removeSearchRow(index, item.name)"
              v-if="rowData.length > 1"
            >
              <Remove />
            </el-icon>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <div class="dialog-footer">
        <el-button :size="size" @click="close">{{
          $t('uiBtn.back')
        }}</el-button>
        <el-button :size="size" type="primary" @click="customSearch">{{
          $t('uiBtn.search')
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import InputEle from './InputEle.vue'
import SelectEle from './SelectEle.vue'
import DatePickerEle from './DatePickerEle.vue'
import MultipleSelectEle from './MultipleSelectEle.vue'
import SimpleArraySelectEle from './SimpleArraySelectEle.vue'
import SimpleArrayMultipleSelectEle from './SimpleArrayMultipleSelectEle.vue'
import ComplexArrayMultipleSelectEle from './complexArrayMultipleSelectEle.vue'
import SelectAnPickerEle from './SelectAnPickerEle.vue'
import { getDicts } from '@/api/system/dict/data'

//  深拷贝
function deepCopy(obj) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      const arr = []
      for (const item of obj) {
        arr.push(Object.assign(deepCopy(item)))
      }
      return arr
    } else if (obj == null) {
      return null
    } else {
      const obj1 = {}
      for (const index in obj) {
        obj1[index] = deepCopy(obj[index])
      }
      return obj1
    }
  } else if (typeof obj === 'function') {
    return Object.assign(obj)
  } else if (typeof obj === 'undefined') {
    return undefined
  } else {
    return obj
  }
}

export default {
  name: 'CustomSearchDlg',
  props: {
    customSelectData: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'default'
    },
    // 搜索字段之间的关联 AND:且 OR:或
    operator: {
      type: String,
      default: 'AND'
    },
    handleQuery: {
      type: Function
    }
  },
  components: {
    InputEle,
    SelectEle,
    DatePickerEle,
    MultipleSelectEle,
    SimpleArraySelectEle,
    SimpleArrayMultipleSelectEle,
    ComplexArrayMultipleSelectEle,
    SelectAnPickerEle
  },
  computed: {},
  data() {
    return {
      open: false,
      rowData: [
        {
          id: Date.now() + '',
          width: '100%',
          name: '',
          type: '',
          // type: SelectEle 时的下拉数据
          selectData: [],
          // 可筛选字段
          pullDownData: deepCopy(this.customSelectData),
          operator: ''
        }
      ],
      formData: {},
      optional: {
        operator: this.operator,
        conditions: []
      },
      optionalCreated: {
        operator: this.operator,
        conditions: []
      }
    }
  },
  mounted() {},
  methods: {
    showMustList(item = {}) {
      let mustList = [
        { value: 'in', label: this.$t('SALES.equalTo') },
        { value: 'notIn', label: this.$t('SALES.notEqualTo') },
        { value: 'contains', label: this.$t('SALES.like') },
        { value: 'notContains', label: this.$t('SALES.notLike') },
        { value: 'isNull', label: this.$t('SALES.null') },
        { value: 'notNull', label: this.$t('SALES.notNull') },
        { value: 'between', label: this.$t('SALES.dateSelection') }
      ]
      const { type } = item
      if (type === 'DatePickerEle') {
        mustList = mustList.filter(x => x.value === 'between')
      } else if (type === 'ComplexArrayMultipleSelectEle') {
        mustList = mustList.filter(x => ['in', 'notIn'].indexOf(x.value) !== -1)
      } else {
        mustList = [
          { value: 'equals', label: this.$t('SALES.equalTo') },
          { value: 'notEquals', label: this.$t('SALES.notEqualTo') },
          { value: 'contains', label: this.$t('SALES.like') },
          { value: 'notContains', label: this.$t('SALES.notLike') },
          { value: 'isNull', label: this.$t('SALES.null') },
          { value: 'notNull', label: this.$t('SALES.notNull') }
          // { value: 'between', label: this.$t('SALES.dateSelection') }
        ]
      }
      return mustList
    },
    show() {
      this.open = true
    },
    close() {
      this.open = false
    },
    // 重置
    resetForm() {
      this.formData = {}
      this.rowData = [
        {
          id: Date.now() + '',
          width: '100%',
          name: '',
          type: '',
          // type: SelectEle 时的下拉数据
          selectData: [],
          // 可筛选字段
          pullDownData: deepCopy(this.customSelectData),
          operator: ''
        }
      ]
      this.optional = {
        operator: this.operator,
        conditions: []
      }
      this.optionalCreated = {
        operator: this.operator,
        conditions: []
      }
    },
    clearEmptyPro(obj) {
      const curVal = {}
      const toString = Object.prototype.toString
      for (const key in obj) {
        const value = obj[key]
        const type = toString.call(value)
        if (
          value ||
          type === '[object Number]' ||
          type === '[object Boolean]'
        ) {
          switch (type) {
            case '[object Object]':
              if (Object.keys(value).length > 0) {
                curVal[key] = value
              }
              break
            case '[object Array]':
              if (value.length > 0) {
                curVal[key] = value
              }
              break
            default:
              curVal[key] = value
              break
          }
        }
      }
      return curVal
    },
    customSearch() {
      this.optional = JSON.parse(JSON.stringify(this.optionalCreated))
      let params = this.clearEmptyPro(this.optional)
      if (params && params.conditions) {
        params.conditions = params.conditions.map((x, i) => {
          const obj = JSON.parse(JSON.stringify(x))
          if (obj.operator === 'between') {
            if (obj.valueMin && obj.valueMax) {
              x.condition = [obj]
            }
          } else if (Array.isArray(obj.value)) {
            if (obj.value.length > 0) {
              x.condition = [obj]
            } else {
              x.condition = []
            }
          } else if (obj.value !== null && obj.value !== undefined) {
            x.condition = [obj]
          } else {
            x.condition = []
          }
          const { condition } = x
          return {
            condition
          }
        })

        params.conditions = params.conditions.filter(
          k => k.condition && k.condition.length > 0
        )
      } else {
        params = {}
      }
      console.log(params, '====324')
      this.handleQuery({ optional: params })
      this.close()

      // this.$emit('customSearch')
    },
    addSearchRow() {
      this.rowData.push({
        id: Date.now() + '',
        width: '100%',
        name: '',
        type: '',
        selectData: [],
        pullDownData: this.handle(),
        operator: ''
      })
    },
    handle() {
      const pullDownData = deepCopy(this.customSelectData)
      this.rowData.forEach(x => {
        pullDownData.forEach(k => {
          if (x.name === k.value) {
            k.disabled = true
          }
        })
      })
      return pullDownData
    },
    updateRowData() {
      const names = this.rowData.filter(x => x.name).map(k => k.name)
      this.rowData.forEach((x, i) => {
        x.pullDownData.forEach(k => {
          if (names.indexOf(k.value) !== -1) {
            if (x.name === k.value) {
              k.disabled = false
            } else {
              k.disabled = true
            }
          } else {
            k.disabled = false
          }
        })
      })
      for (const k in this.formData) {
        const flag = this.rowData.some(x => k === x.name)
        if (!flag) {
          this.formData[k] = ''
        }
      }
      const list = this.rowData.map(x => x.value)
      let arr = this.optionalCreated.conditions || []
      arr = arr.filter(x => list.indexOf(x.field) !== -1)
      console.log(list, '====376')
      console.log(arr, '===377')
      this.optionalCreated.conditions = arr
      this.optional = JSON.parse(JSON.stringify(this.optionalCreated))
    },
    // 删除当前行
    removeSearchRow(index, name) {
      this.rowData.splice(index, 1)
      let list = this.optionalCreated.conditions || []
      list = list.filter(x => x.field !== name)
      this.optionalCreated.conditions = list
      this.optional = JSON.parse(JSON.stringify(this.optionalCreated))

      if (name) {
        this.formData[name] = ''
      }

      this.updateRowData()
    },
    updateSearchValue(e, index) {
      if (e) {
        const pullDownData = deepCopy(this.customSelectData)
        const arr = pullDownData.filter(x => x.value === e)
        if (arr[0].dict) {
          getDicts(arr[0].dict).then(res => {
            this.rowData[index].selectData = res.data
          })
        } else if (
          (arr[0].type === 'SelectEle' ||
            arr[0].type === 'ComplexArrayMultipleSelectEle') &&
          arr[0].selectData.length > 0
        ) {
          this.rowData[index].selectData = arr[0].selectData
          console.log(this.rowData[index].selectData, '====396')
        }
        if (
          arr[0].type === 'SelectEle' ||
          arr[0].type === 'ComplexArrayMultipleSelectEle'
        ) {
          this.rowData[index].selectLabel = arr[0].selectLabel
          this.rowData[index].selectValue = arr[0].selectValue
        }
        if (arr[0].type === 'InputEle' && arr[0].maxlength) {
          if (arr[0].maxlength) {
            this.rowData[index].maxlength = arr[0].maxlength
          } else {
            this.rowData[index].maxlength = 50
          }
        }
        if (arr[0].type === 'DatePickerEle') {
          this.rowData[index].operator = 'between'
        } else if (arr[0].type === 'ComplexArrayMultipleSelectEle') {
          this.rowData[index].operator = 'in'
        } else {
          this.rowData[index].operator = 'contains'
        }
        this.rowData[index].type = arr[0].type
        this.rowData[index].name = e
        // this.rowData[index].operator = arr[0].operator
      } else {
        this.rowData[index].type = ''
        this.rowData[index].name = ''
        this.rowData[index].operator = ''
      }
      this.updateRowData()
    },
    updateSearchRequirement(e, index) {
      const { name, operator } = this.rowData[index]
      const { conditions } = this.optionalCreated
      if (conditions && conditions.length > 0) {
        conditions.forEach(x => {
          if (x.field === name) {
            x.operator = operator
          }
        })
      }
      console.log(this.optionalCreated.conditions, '===452')
      // this.optionalCreated.conditions = list
      // this.handlerConditions(name, e, index)
    },
    // 组件值变化时触发
    updateForm(name, e, index) {
      const { type, value } = e
      // 判断日期类型
      if (type && type === 'DatePickerEle') {
        const { endDate, startDate } = this.rowData[index].pullDownData.filter(
          x => x.value === name
        )[0]
        this.formData[name] = value || undefined
        if (value && value.length > 0) {
          // 开始结束字段，有传入开始结束日期字段就使用传入的，没有就默认 startDate, endDate
          this.formData[startDate || 'startDate'] = value[0]
          this.formData[endDate || 'endDate'] = value[1] + 86399000
        } else {
          this.formData[startDate || 'startDate'] = undefined
          this.formData[endDate || 'endDate'] = undefined
        }
      } else {
        this.formData[name] = value || undefined
      }
      this.handlerConditions(name, e, index)
    },
    handlerConditions(name, e, index) {
      const { type, value } = e
      let list = this.optionalCreated.conditions || []
      const { operator } = this.rowData[index]
      const { endDate, startDate } = this.rowData[index].pullDownData.filter(
        x => x.value === name
      )[0]
      const obj = {
        field: name,
        operator
      }
      if (type && type === 'DatePickerEle') {
        if (value && value.length > 0) {
          obj.valueMin = value[0]
          obj.valueMax = value[1] + 86399000
        } else {
          obj.valueMin = undefined
          obj.valueMax = undefined
        }
      } else {
        obj.value = value
      }
      const current = list.findIndex(x => x.field === name)
      if (current === -1) {
        list.push(obj)
      } else {
        list[current] = obj
      }
      this.optionalCreated.conditions = list
    }
  },
  emits: ['customSearch']
}
</script>

<style scoped lang="scss">
.form {
  min-height: 30vh;
  max-height: 70vh;
  overflow: hidden;
  overflow-y: auto;
  .el-form-item {
    margin-bottom: 5px;
  }
}
</style>
