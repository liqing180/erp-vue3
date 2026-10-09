<template>
  <div class="mb8" ref="searchBox" v-resize="divResizeFn">
    <el-form :inline="false" ref="ruleForm" @submit.prevent>
      <div
        class="search-warp"
        :class="{ 'top-row': !isProductCustomSearch }"
        v-if="isShowTopRow"
      >
        <div class="flex"><slot name="left"></slot></div>
        <div class="search-content-warp">
          <div class="search-content">
            <div class="w100 top-row-content">
              <div class="flexStart search-tags" ref="leftBox">
                <div class="flex-1" style="word-break: break-all">
                  <ul
                    class="flexStart"
                    ref="selectTag"
                    v-show="!isAll && dividerShow"
                  >
                    <li
                      v-for="(item, index) in selectTagList"
                      :key="item.name"
                      v-show="index < tagIndex"
                    >
                      <el-tag
                        class="tag flexStart"
                        type="info"
                        effect="plain"
                        :closable="!notClosableNameList.includes(item.name)"
                        disable-transitions
                        @close="closeTag(item)"
                        @click="clickTag"
                        v-if="item.title"
                      >
                        <span
                          class="tag-title flow1"
                          :title="item.label + ': ' + item.title"
                          v-if="item.label"
                          >{{ item.label }}: {{ item.title }}</span
                        >
                        <span
                          class="tag-title flow1"
                          :title="item.title"
                          v-else
                          >{{ item.title }}</span
                        >
                      </el-tag>
                    </li>
                    <li
                      v-if="
                        selectTagList.slice(tagIndex).filter(x => x.title)
                          .length > 0
                      "
                    >
                      <el-popover
                        placement="bottom"
                        width="250"
                        trigger="click"
                      >
                        <ul>
                          <li
                            v-for="item in selectTagList.slice(tagIndex)"
                            :key="item.name"
                          >
                            <el-tag
                              class="tag flexStart"
                              type="info"
                              effect="plain"
                              :closable="
                                !notClosableNameList.includes(item.name)
                              "
                              disable-transitions
                              @close="closeTag(item)"
                              @click="clickTag"
                              v-if="item.title"
                            >
                              <span
                                class="tag-title flow1"
                                :title="item.label + ': ' + item.title"
                                v-if="item.label"
                                >{{ item.label }}: {{ item.title }}</span
                              >
                              <span
                                class="tag-title flow1"
                                :title="item.title"
                                v-else
                                >{{ item.title }}</span
                              >
                            </el-tag>
                          </li>
                        </ul>
                        <template v-slot:reference>
                          <el-tag effect="plain">
                            <el-icon><Plus /></el-icon>
                            {{
                              selectTagList.slice(tagIndex).filter(x => x.title)
                                .length
                            }}
                          </el-tag>
                        </template>
                      </el-popover>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="search-top-fields">
                <div class="search-content search-fields">
                  <el-form-item
                    v-for="(item, index) in searchData.slice(0, topShowCount)"
                    :key="index"
                    :label="item.label"
                    style="flex-shrink: 0; min-width: 240px"
                  >
                    <component
                      v-bind="item"
                      :is="item.type"
                      :value="formData[item.name]"
                      @updateForm="
                        updateForm(item.name, $event, index, item.label)
                      "
                      @search="search"
                      :ref="item.name"
                      :size="size"
                      :interval="interval"
                    >
                    </component>
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="search-btn flexCen"
          style="flex-shrink: 0"
          v-if="isBtn || dividerShow"
        >
          <el-form-item>
            <el-button
              link
              type="primary"
              :aria-expanded="isAll"
              :icon="isAll ? 'CaretBottom' : 'CaretRight'"
              @click="isAllChange"
              v-if="dividerShow && isShowAllBtn"
            />

            <el-button
              link
              type="primary"
              icon="Refresh"
              :aria-label="$t('uiBtn.reset')"
              @click="resetForm"
              v-if="dividerShow && isShowRefreshBtn"
            />
          </el-form-item>
        </div>
        <div class="flexEnd">
          <slot></slot>
        </div>
      </div>
      <div
        class="search-warp bottom-row"
        :class="{ 'hide-border-top': isShowTopRow }"
        v-show="isAll && dividerShow"
      >
        <el-row :gutter="10" type="flex" style="flex-wrap: wrap; width: 100%">
          <el-col
            :span="getColumnSpan(searchBoxWidth)"
            v-for="(item, index) in searchData.slice(topShowCount)"
            :key="index"
          >
            <el-form-item
              :label="item.label"
              :label-width="
                ['SelectAnInput', 'SelectAnMultipleSelect'].includes(item.type)
                  ? '0px'
                  : maxTextWidth + 'px'
              "
            >
              <component
                v-bind="item"
                :maxTextWidth="maxTextWidth"
                :is="item.type"
                :value="formData[item.name]"
                @updateForm="
                  updateForm(
                    item.name,
                    $event,
                    index + topShowCount,
                    item.label
                  )
                "
                @search="search"
                :ref="item.name"
                :size="size"
              >
              </component>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="search-btn">
          <el-form-item>
            <el-button
              type="primary"
              icon="Search"
              @click="showCustomSearch"
              v-if="showCustom && isBtn"
              >{{ $t('uiBtn.customQuery') }}</el-button
            >
          </el-form-item>
        </div>
      </div>
    </el-form>
    <CustomSearchDlg
      :size="size"
      :operator="operator"
      :customSelectData="customSelectData"
      @customSearch="customSearch"
      ref="customSearchDlg"
    />
  </div>
</template>

<script>
/**
 * @desc                  搜索组件
 * @InputEle              文本框
 * @SelectEle             下拉单选(对象数组)
 * @DatePickerEle         日期范围选择
 * @MultipleSelectEle     下拉多选(复杂数据类型)
 * @SimpleArraySelectEle  下拉单选(简单类型数组)
 * @SimpleArrayMultipleSelectEle 下拉多选(简单类型数据)
 * @ComplexArrayMultipleSelectEle  下拉多选(复杂数据类型)
 * @searchMixin           请求数据字典数据
 * @ElcascaderEle         级联选择器
 * @SelectAnInput         下拉输入联动
 * @AutocompleteEle       文本框--自动检索
 * @SelectAnMultipleSelect         下拉与下拉多选联动
 * @SelectInput           点击弹窗
 */
import InputEle from './InputEle.vue'
import SelectEle from './SelectEle.vue'
import DatePickerEle from './DatePickerEle.vue'
import DatePickerEleShortcuts from './DatePickerEleShortcuts.vue'

import MultipleSelectEle from './MultipleSelectEle.vue'
import SimpleArraySelectEle from './SimpleArraySelectEle.vue'
import SimpleArrayMultipleSelectEle from './SimpleArrayMultipleSelectEle.vue'
import ComplexArrayMultipleSelectEle from './complexArrayMultipleSelectEle.vue'
import SelectAnPickerEle from './SelectAnPickerEle.vue'
import ElcascaderEle from './ElcascaderEle.vue'
import CustomSearchDlg from './CustomSearchDlg.vue'
import searchMixin from './searchMixin.js'
import SelectAnInput from './SelectAnInput.vue'
import AutocompleteEle from './AutocompleteEle.vue'
import SelectAnMultipleSelect from './SelectAnMultipleSelect.vue'
import SelectInput from './SelectInput'
import lodash from 'lodash'
import resize from '@/directive/resize'
import textSize from 'text-size'

export default {
  name: 'searchEle',
  directives: {
    resize
  },
  components: {
    InputEle,
    SelectEle,
    DatePickerEle,
    DatePickerEleShortcuts,
    MultipleSelectEle,
    SimpleArraySelectEle,
    SimpleArrayMultipleSelectEle,
    ComplexArrayMultipleSelectEle,
    SelectAnPickerEle,
    ElcascaderEle,
    CustomSearchDlg,
    SelectAnInput,
    AutocompleteEle,
    SelectAnMultipleSelect,
    SelectInput
  },
  mixins: [searchMixin],
  /**
   * @value           搜索条件字段
   * @searchData      搜索组件配置项
   * @handleQuery     搜索(函数)
   * @resetQuery      重置(函数)
   */
  props: {
    modelValue: {
      type: Object,
      default: undefined
    },
    value: {
      type: Object,
      default: () => ({})
    },
    searchData: {
      type: Array,
      default: () => []
    },
    handleQuery: {
      type: Function
    },
    resetQuery: {
      type: Function
    },
    handleCustomSearch: {
      type: Function
    },
    showCustom: {
      type: Boolean,
      default: false
    },
    customSelectData: {
      type: Array,
      default: () => []
    },
    isShowTopRow: {
      type: Boolean,
      default: true
    },
    // 是否显示按钮
    isBtn: {
      type: Boolean,
      default: true
    },
    // 是否菜单名
    showMenu: {
      type: Boolean,
      default: true
    },
    topShowCount: {
      type: Number,
      default: 3
    },
    width: {
      type: [Number, String]
    },
    isProductCustomSearch: { type: Boolean, default: false },
    isShowAllBtn: { type: Boolean, default: true },
    isShowRefreshBtn: { type: Boolean, default: true },
    interval: { type: Number, default: 2000 },
    notClosableNameList: { type: Array, default: () => [] },
    // 搜索字段之间的关联 AND:且 OR:或
    operator: {
      type: String,
      default: 'AND'
    }
  },
  data() {
    return {
      isAll: true,
      // 所有折叠选项中已选中的值
      selectTagList: [],
      // 定时函数
      drawTiming: null,
      // 最多显示宽度
      tagIndex: 0,
      searchBoxWidth: undefined,
      runTime: undefined,
      maxTextWidth: undefined
    }
  },
  computed: {
    formData() {
      return this.modelValue ?? this.value
    },
    size() {
      const size = this.$store.getters.size
      return size === 'mini'
        ? 'small'
        : size === 'medium'
          ? 'default'
          : size || 'small'
    },
    dividerShow() {
      return this.searchData.length > this.topShowCount
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    }
  },
  watch: {
    formData: {
      immediate: true,
      deep: true,
      handler(next, previous) {
        if (next !== previous) {
          this.searchData.forEach(field => {
            const ref = this.$refs[field.name]
            const component = Array.isArray(ref) ? ref[0] : ref
            component?.clearSearchTimer?.()
          })
        }
        this.$nextTick(() => this.initAllSelectTagMethod())
      }
    },
    searchData: {
      deep: true,
      immediate: true,

      handler: function () {
        this.initFormLabelWidth()
        this.selectTagList = []
        this.$nextTick(() => this.initAllSelectTagMethod())
      }
    }
  },
  created() {
    this.initAllSelectTagMethod = lodash.debounce(this.initAllSelectTag, 1000)
  },
  activated() {
    this.divResizeFn()
  },
  beforeUnmount() {
    this.initAllSelectTagMethod.cancel()
    clearTimeout(this.drawTiming)
  },
  mounted() {
    // 处理搜索条件有默认值时的折叠数据
    this.initAllSelectTagMethod()
    this.divResizeFn()
  },
  methods: {
    initAllSelectTag() {
      this.searchData.forEach((x, i) => {
        if (i >= this.topShowCount) {
          this.allSelectTag(x.name, x, i, x.label)
        }
      })
      this.$nextTick(this.calcRate)
    },
    getColumnSpan(screenWidth) {
      if (screenWidth >= 1920) {
        return 6 // 在超大屏幕设备上设置span为6
      } else if (screenWidth >= 1500) {
        return 6 // 在大屏幕设备上设置span为4
      } else if (screenWidth >= 1100) {
        return 8 // 在中等屏幕设备上设置span为3
      } else {
        return 12 // 在小屏幕设备及以下设置span为2
      }
    },
    initFormLabelWidth() {
      let maxTextWidth = 0
      let minSelectWidth = 0
      this.searchData.forEach(item => {
        if (item.minSelectWidth) {
          minSelectWidth = Math.max(minSelectWidth, item.minSelectWidth)
        }
        let width1 = textSize.getTextWidth({
          text: item.label || '',
          fontSize: 16,
          fontName:
            'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif'
        })
        if (width1 > maxTextWidth) {
          maxTextWidth = width1
        }
      })
      maxTextWidth = maxTextWidth + 12

      this.maxTextWidth = Math.max(maxTextWidth, minSelectWidth)
    },
    isAllChange() {
      this.isAll = !this.isAll
      if (!this.isAll) this.$nextTick(this.divResizeFn)
    },
    calcRate() {
      const selectTag = this.$refs.selectTag
      const leftBox = this.$refs.leftBox
      if (this.isAll || !selectTag || !leftBox) return
      this.tagIndex = this.selectTagList.length
      this.$nextTick(() => {
        const availableWidth = leftBox.clientWidth
        if (!availableWidth) return
        let tagWidth = 0
        const elements = selectTag.children
        for (let i = 0; i < this.selectTagList.length; i++) {
          tagWidth += elements[i]?.offsetWidth || 0
          if (tagWidth + 50 > availableWidth) {
            this.tagIndex = i
            break
          }
        }
      })
    },
    emitForm() {
      this.$emit('update:modelValue', this.formData)
      this.$emit('update:value', this.formData)
    },
    getElcascaderEleCheckedNodes() {
      const ref = this.$refs.productCategoryIds
      const cascader = Array.isArray(ref) ? ref[0] : ref
      return cascader?.getCheckedNodes() || []
    },
    search() {
      this.emitForm()
      this.$refs.customSearchDlg?.resetForm()

      const { optional, ...params } = this.formData
      this.handleQuery(params)
    },
    // 重置
    resetForm() {
      this.resetQuery()
      this.selectTagList = []
      this.tagIndex = 0
    },
    // 组件值变化时触发
    updateForm(name, e, index, label) {
      let shouldSearch = false
      const { type, format, value, startDate, endDate, selectName, inputName } =
        e
      // 判断日期类型
      if (
        type &&
        (type === 'DatePickerEle' || type === 'DatePickerEleShortcuts') &&
        format === 'timestamp'
      ) {
        this.formData[name] = value || undefined
        if (value && value.length > 0) {
          // 开始结束字段，有传入开始结束日期字段就使用传入的，没有就默认 startDate, endDate
          this.formData[startDate || 'startDate'] = Number(value[0])
          this.formData[endDate || 'endDate'] = Number(value[1]) + 86399000
        } else {
          this.formData[startDate || 'startDate'] = undefined
          this.formData[endDate || 'endDate'] = undefined
        }
        shouldSearch = true
      } else if (type && type === 'SelectAnInput') {
        if (e.childType === 'select') {
          this.formData[selectName] = value
          this.formData[inputName] = ''
          this.formData[name] = ''
        } else {
          this.formData[inputName] = value || ''
          if (!value) {
            this.formData[name] = ''
          } else {
            this.formData[name] = value
          }
        }
        this.$emit('updateSearchData', {
          index,
          childType: e.childType,
          value: value || ''
        })
      } else if (type && type === 'SelectAnMultipleSelect') {
        if (e.childType === 'select') {
          this.formData[selectName] = value
          this.formData[inputName] = []
          this.formData[name] = ''
        } else {
          this.formData[inputName] = value || []
          this.formData[name] = value || []
        }
        this.$emit('updateSearchData', {
          index,
          childType: e.childType,
          value: value || []
        })
        shouldSearch = e.childType === 'input'
      } else if (type && type === 'SelectAnPickerEle') {
        if (e.childType === 'select') {
          this.formData[name] = value
          this.formData[startDate || 'startDate'] = undefined
          this.formData[endDate || 'endDate'] = undefined
        } else {
          if (value && value.length > 0) {
            // 开始结束字段，有传入开始结束日期字段就使用传入的，没有就默认 startDate, endDate
            this.formData[startDate || 'startDate'] = Number(value[0])
            this.formData[endDate || 'endDate'] = Number(value[1]) + 86399000
          } else {
            this.formData[startDate || 'startDate'] = undefined
            this.formData[endDate || 'endDate'] = undefined
          }
        }
        this.$emit('updateSearchData', {
          index,
          childType: e.childType,
          value: value
        })
      } else {
        this.formData[name] = value || undefined
        if (
          type === 'MultipleSelectEle' ||
          type === 'SelectEle' ||
          type === 'ElcascaderEle'
        ) {
          shouldSearch = true
        }
      }
      if (shouldSearch) this.search()
      else this.emitForm()
    },
    // 所有折叠选项中已选中的值
    allSelectTag(name, e, index, label) {
      if (this.selectTagList.length <= 0) {
        this.searchData.forEach(x => {
          this.selectTagList.push({
            name: x.name,
            type: x.type,
            label: x.label,
            title: undefined,
            value: undefined
          })
        })
        this.tagIndex = this.searchData.length
      }
      const { type, selectName, inputName } = e
      let value = this.formData[name]
      if (type === 'SelectAnInput' || type === 'SelectAnMultipleSelect') {
        value = this.formData[inputName]
      }
      if (!value || value.length <= 0) {
        this.selectTagList.forEach((x, i) => {
          if (x.name === name) {
            x.title = undefined
            x.value = undefined
          }
        })
        return
      }
      const {
        selectData,
        selectLabel,
        selectValue,
        mapValue,
        mapLabel,
        multiple,
        checkStrictly,
        selectList
      } = this.searchData[index]
      let title
      let obj = {}
      if (type === 'SelectEle') {
        selectData.forEach(x => {
          if (value === x[selectValue]) {
            title = x[selectLabel]
          }
        })
        obj = { name, title, value, type, label }
        this.selectTagList.forEach((x, i) => {
          if (x.name === name) {
            this.selectTagList.splice(i, 1, obj)
          }
        })
      }
      if (type === 'MultipleSelectEle') {
        const children = selectData.filter(
          x => value.indexOf(x[selectValue]) !== -1
        )
        title = children.map(x => x[selectLabel]).join('、')
        obj = { name, title, label, value, type }
        this.selectTagList.forEach((x, i) => {
          if (x.name === name) {
            this.selectTagList.splice(i, 1, obj)
          }
        })
      }
      if (type === 'DatePickerEleShortcuts') {
        title =
          this.parseTime(value[0], this.fmtForYmd) +
          '-' +
          this.parseTime(value[1], this.fmtForYmd)
        obj = { name, title, value, type, label }
        this.selectTagList.forEach((x, i) => {
          if (x.name === name) {
            this.selectTagList.splice(i, 1, obj)
          }
        })
      }
      if (type === 'ElcascaderEle') {
        let ids = []
        if (checkStrictly && multiple === false) {
          ids = [value[value.length - 1]]
        } else {
          ids = value.map(item => {
            return item[item.length - 1]
          })
        }

        const titleArr = []
        const findLabel = data =>
          data.forEach(x => {
            if (ids.indexOf(x[mapValue]) !== -1) {
              titleArr.push(x[mapLabel])
            }
            if (x.children && x.children.length > 0) {
              findLabel(x.children)
            }
          })
        findLabel(selectData)
        title = titleArr.join('、')
        obj = { name, title, label, value, type }
        this.selectTagList.forEach((x, i) => {
          if (x.name === name) {
            this.selectTagList.splice(i, 1, obj)
          }
        })
      }
      if (type === 'SelectAnInput') {
        if (this.formData[selectName] && this.formData[inputName]) {
          selectData.forEach(x => {
            if (this.formData[selectName] === x[selectValue]) {
              title = x[selectLabel] + ':' + this.formData[inputName]
            }
          })
        }

        obj = {
          name,
          title,
          value: title,
          type,
          label: '',
          selectName,
          inputName
        }
        this.selectTagList.forEach((x, i) => {
          if (x.name === name) {
            this.selectTagList.splice(i, 1, obj)
          }
        })
      }
      if (type === 'SelectAnMultipleSelect') {
        const row = this.searchData[index]
        if (
          this.formData[selectName] &&
          this.formData[inputName] &&
          this.formData[inputName].length > 0
        ) {
          let leftTitle
          selectData.forEach(x => {
            if (row.selectId === x[selectValue]) {
              leftTitle = x[selectLabel]
            }
          })
          const children = row.selectData2.filter(
            x => value.indexOf(x[row.selectValue2]) !== -1
          )
          title =
            leftTitle + ':' + children.map(x => x[row.selectLabel2]).join('、')
        }
        obj = {
          name,
          title,
          value: title,
          type,
          label: '',
          selectName,
          inputName
        }
        this.selectTagList.forEach((x, i) => {
          if (x.name === name) {
            this.selectTagList.splice(i, 1, obj)
          }
        })
      }

      if (type === 'InputEle' || type === 'AutocompleteEle') {
        title = value
        obj = { name, title, value, type, label }
        this.selectTagList.forEach((x, i) => {
          if (x.name === name) {
            this.selectTagList.splice(i, 1, obj)
          }
        })
      }

      if (type === 'SelectInput') {
        title = selectList.map(x => x[selectLabel]).join(',')
        obj = { name, title, value, type, label }
        this.selectTagList.forEach((x, i) => {
          if (x.name === name) {
            this.selectTagList.splice(i, 1, obj)
          }
        })
      }
    },
    closeTag(e) {
      const { name, type, inputName } = e
      this.selectTagList.forEach(x => {
        if (x.name === name) {
          x.title = undefined
          x.value = undefined
        }
      })
      this.formData[name] = undefined
      if (type === 'DatePickerEle' || type === 'DatePickerEleShortcuts') {
        const field = this.searchData.find(item => item.name === name)
        this.formData[field.startDate || 'startDate'] = undefined
        this.formData[field.endDate || 'endDate'] = undefined
      }
      if (type === 'SelectAnInput') {
        this.formData[inputName] = ''
        const index = this.searchData.findIndex(x => x.name === name)
        this.$emit('updateSearchData', {
          index,
          childType: 'input',
          value: ''
        })
      }
      if (type === 'SelectAnMultipleSelect') {
        this.formData[inputName] = ''
        const index = this.searchData.findIndex(x => x.name === name)
        this.$emit('updateSearchData', {
          index,
          childType: 'input',
          value: ''
        })
      }
      if (type === 'SelectInput') {
        const index = this.searchData.findIndex(x => x.name === name)
        this.searchData[index].callback('clear')
      }
      this.search()
    },
    clickTag() {},
    showCustomSearch() {
      this.$refs.customSearchDlg.show()
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
      const { pageNum, pageSize } = this.formData
      const model = { pageNum, pageSize }
      this.$emit('update:modelValue', model)
      this.$emit('update:value', model)
      const params = this.clearEmptyPro(this.$refs.customSearchDlg.optional)
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
        const { condition, ...params } = x
        return {
          condition
        }
      })
      params.conditions = params.conditions.filter(
        k => k.condition && k.condition.length > 0
      )
      this.handleQuery(
        Object.assign({ optional: params }, { pageNum, pageSize })
      )
      this.$refs.customSearchDlg.close()
      // for (const key in params) {
      //   this.customSelectData.forEach(x => {
      //     if (
      //       key === x.value &&
      //       x.type === 'DatePickerEle' &&
      //       params[key].length > 0
      //     ) {
      //       params[x.startDate] = params[key][0]
      //       params[x.endDate] = params[key][1] + 86399000
      //     }
      //   })
      // }
      // this.handleQuery(Object.assign(params, { pageNum, pageSize }))
      // this.$refs.customSearchDlg.close()
    },
    divResizeFn() {
      if (!this.dividerShow) return
      const searchBox = this.$refs.searchBox || {}
      const searchBoxWidth = searchBox.clientWidth
      this.searchBoxWidth = searchBoxWidth
      clearTimeout(this.drawTiming)
      if (this.runTime) {
        const nowTime = +new Date()
        if (nowTime - this.runTime > 500) {
          this.runTime = +new Date()
          this.calcRate()
        }
      }
      this.drawTiming = setTimeout(() => {
        this.runTime = +new Date()
        this.calcRate()
      }, 500)
    }
  },
  emits: ['updateSearchData', 'update:modelValue', 'update:value']
}
</script>

<style lang="scss" scoped>
.search-warp {
  // background-color: #61616110;
  // background-color: #99999910;
  padding-left: 8px;
  padding-right: 8px;
  display: flex;
  :deep(.el-form-item) {
    margin-bottom: 8px;
  }
  .search-content-warp {
    flex: 1;
    min-width: 0;
  }
  .search-content-warp.hide-search {
    overflow: hidden;
  }
  .search-content {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
  }
  :deep(.el-form-item__label) {
    align-items: center;
    white-space: nowrap;
  }
}
.top-row {
  padding-top: 5px;
  padding-bottom: 5px;
  border: 1px solid #99999940;
  // background-color: #fff;
  // border: 1px solid #99999940;

  .top-row-content {
    display: flex;
    justify-content: space-between;
    min-height: 30px;
    align-items: center;
    gap: 40px;
  }
  .search-fields {
    flex-direction: row-reverse;
    row-gap: 10px;
  }
  .search-tags {
    flex: 1;
    min-width: 0;
  }
  .search-top-fields {
    flex-shrink: 0;
  }
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.bottom-row {
  padding-top: 10px;
  border: 1px solid #99999940;
  padding-right: 0px;
}

.hide-border-top {
  border-top: 0;
}

.flow1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tag {
  flex-shrink: 0;
}
.tag .tag-title {
  max-width: 200px;
  word-break: break-all;
}
</style>
