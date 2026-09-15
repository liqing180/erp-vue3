<template>
  <div class="questionnaire-details" ref="box">
    <div class="left">
      <div class="header" :style="{ top: leftTop }">
        <div>
          {{ $t('menu.leadValidationCriteria') }}
        </div>
      </div>
      <div
        class="flex"
        style="position: relative; height: 40px; z-index: -9999; opacity: 0"
      ></div>

      <ul class="">
        <li class="item" v-for="(item, index) in list" :key="item.customId">
          <el-form
            :ref="'child_' + item.customId"
            :model="item"
            label-width="80px"
            @submit.prevent
          >
            <div class="flexStart">
              <el-form-item
                :label="`${$t('SALES.criteria').replace('$1', index + 1)}`"
                prop="criteria"
                :rules="{
                  required: true,
                  message: $t('ui.reqMsg'),
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  trigger: ['change', 'blur']
                }"
                style="width: 40%"
              >
                <el-input
                  v-model="item.criteria"
                  maxlength="50"
                  :disabled="isDisabled"
                  @input="questionsNameChange(item, index)"
                ></el-input>
              </el-form-item>

              <el-form-item
                :label="$t('SALES.category')"
                prop="categoryType"
                :rules="{
                  required: true,
                  message: $t('ui.reqMsg'),
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  trigger: ['change', 'blur']
                }"
                style="width: 60%"
              >
                <div class="flexCen flex-1">
                  <el-select
                    v-model="item.categoryType"
                    placeholder=""
                    style="width: 100%"
                    @change="categoryTypeChange(item, index)"
                    :disabled="isDisabled"
                    class="flex-1"
                  >
                    <el-option
                      v-for="dict in categoryList"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    ></el-option>
                  </el-select>
                  <el-button
                    :type="
                      childItem.customId && childItem.customId === item.customId
                        ? 'primary'
                        : 'info'
                    "
                    class="mr10"
                    size="small"
                    :style="`height: ${butHeight}px; line-height: ${butHeight}px`"
                    @click="detailQuestions(item, index)"
                    >{{ $t('SALES.details') }}</el-button
                  >
                  <template v-if="!isDisabled">
                    <div class="action-btn flexCCen" v-if="list.length < 20">
                      <el-icon
                        class="mr10 pointer"
                        style="font-size: 24px; border: none"
                        @click.stop="addQuestions(item, index)"
                      >
                        <CirclePlus />
                      </el-icon>
                    </div>
                    <div class="action-btn flexCCen">
                      <el-icon
                        class="pointer"
                        style="font-size: 24px; border: none; color: #f56c6c"
                        @click.stop="delQuestions(item, index)"
                        v-if="list.length !== 1"
                      >
                        <Remove />
                      </el-icon>
                    </div>
                  </template>
                </div>
              </el-form-item>
            </div>
          </el-form>
        </li>
      </ul>
    </div>

    <div class="right">
      <div ref="content">
        <div
          class="content"
          ref=""
          :style="{ top: top }"
          v-show="index !== null"
        >
          <div class="header">
            {{ $t('SALES.validationCriteria') }}
          </div>

          <el-form
            ref="detailsForm"
            :model="childItem"
            label-width="0"
            @submit.prevent
            :disabled="isDisabled"
            :key="childItem.categoryType + '_' + index"
          >
            <div class="flexStart mt10">
              <el-form-item
                prop="validationType"
                :rules="{
                  required: true,
                  message: $t('ui.reqMsg'),
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  trigger: ['change', 'blur']
                }"
                style="width: 45%"
                :show-message="false"
              >
                <div class="flexStart flex-1">
                  <div
                    class="mr10 flow1"
                    style="width: 80px"
                    :title="childItem.criteria"
                    slot:label
                  >
                    {{ childItem.criteria }}
                  </div>

                  <el-select
                    v-model="childItem.validationType"
                    placeholder=""
                    style="width: 100%"
                    @change="validationTypeChange"
                    :disabled="isDisabled"
                    class="flex-1"
                  >
                    <el-option
                      v-for="dict in showMustList"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    ></el-option>
                  </el-select>
                </div>
              </el-form-item>

              <el-form-item
                prop="validationValue"
                :rules="{
                  required: isFieldRequired,
                  message: $t('ui.reqMsg'),
                  type: fieldType,
                  pattern: new RegExp(/^(?!(\s+$))/g),
                  trigger: ['change', 'blur']
                }"
                class="flex-1"
                :show-message="false"
                v-if="['checkBox'].indexOf(childItem.categoryType) === -1"
              >
                <!-- 文本 -->
                <el-input
                  v-model="childItem.validationValue"
                  maxlength="50"
                  :disabled="!isFieldRequired"
                  v-if="['textField'].indexOf(childItem.categoryType) !== -1"
                ></el-input>
                <!-- 数字 -->
                <el-input-number
                  v-model="childItem.validationValue"
                  :precision="0"
                  v-thousandSplit="{ precision: 0 }"
                  type="number"
                  class="form-wd textleft"
                  :min="1"
                  :max="999999999999"
                  placeholder="1 - 999999999999"
                  style="width: 100%"
                  controls-position="right"
                  :disabled="!isFieldRequired"
                  v-if="['numberBox'].indexOf(childItem.categoryType) !== -1"
                />
                <!-- 单选，多选 -->
                <el-select
                  v-model="childItem.validationValue"
                  placeholder=""
                  style="width: 100%"
                  clearable
                  @change="selectChange(childItem)"
                  :multiple="
                    childItem.validationType === 'like' &&
                    childItem.categoryType === 'singleOption'
                      ? false
                      : true
                  "
                  :collapse-tags="
                    childItem.validationType === 'like' &&
                    childItem.categoryType === 'singleOption'
                      ? false
                      : true
                  "
                  class="flex-1"
                  :key="'select_' + childItem.categoryType"
                  :disabled="!isFieldRequired"
                  v-if="
                    ['singleOption', 'multiOption'].indexOf(
                      childItem.categoryType
                    ) !== -1
                  "
                >
                  <el-option
                    v-for="dict in childItem.optionList.filter(
                      x => x.optionName && x.optionName.trim() !== ''
                    )"
                    :key="dict.customId"
                    :label="dict.optionName"
                    :value="dict.customId"
                  ></el-option>
                </el-select>
                <!-- 日期 -->
                <el-input-number
                  v-model="childItem.validationValue"
                  :precision="0"
                  v-thousandSplit="{ precision: 0 }"
                  type="number"
                  class="form-wd textleft"
                  :min="1"
                  :max="999"
                  placeholder="1 - 999"
                  style="width: 100%"
                  controls-position="right"
                  v-if="
                    ['dateSelection'].indexOf(childItem.categoryType) !== -1
                  "
                />
              </el-form-item>
              <!-- 日期 -->
              <el-form-item
                prop="validationDateType"
                class="fs-0"
                style="width: 100px"
                :show-message="false"
                v-if="['dateSelection'].indexOf(childItem.categoryType) !== -1"
              >
                <el-select
                  v-model="childItem.validationDateType"
                  placeholder=""
                  :disabled="isDisabled"
                >
                  <el-option
                    v-for="dict in dateTypeList"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>

            <el-form-item
              v-if="
                ['singleOption', 'multiOption'].indexOf(
                  childItem.categoryType
                ) !== -1
              "
            >
              <ul class="select-card drag-card" ref="dragCard">
                <li class="select-item select-item-header" :key="keyValue - 1">
                  <!-- <div class="select-item-box select-item-left">
                    {{ $t('ui.sn') }}
                  </div> -->
                  <div class="select-item-box select-item-center">
                    <span style="color: #ff4949; margin-right: 4px">*</span
                    >{{ $t('SALES.option') }}
                  </div>
                  <!-- <div class="select-item-box select-item-required">
                    {{ $t('SALES.remarksMustBeFilledIn') }}
                  </div> -->
                  <div class="select-item-box select-item-right">
                    {{ $t('ui.action') }}
                  </div>
                </li>
                <li
                  class="select-item drag-item"
                  v-for="(item, index) in childItem.optionList"
                  :key="index + keyValue"
                >
                  <div class="select-item-box select-item-center">
                    <div class="date-text-color" style="width: 100%">
                      <span v-if="getFieldExists(item)" class="err-msg">{{
                        $t('system.fieldExists')
                      }}</span>
                      <el-input
                        v-model="item.optionName"
                        maxlength="50"
                      ></el-input>
                    </div>
                  </div>
                  <div class="select-item-box select-item-right flexCen">
                    <template v-if="!isDisabled">
                      <div
                        class="action-btn flexCCen"
                        v-if="childItem.optionList.length < 10"
                      >
                        <el-icon
                          class="mr10 pointer"
                          style="
                            font-size: 24px;
                            border: none;
                            margin-right: 5px;
                          "
                          @click="addOption(item, index)"
                        >
                          <CirclePlus />
                        </el-icon>
                      </div>
                      <div class="action-btn flexCCen">
                        <el-icon
                          class="pointer"
                          style="font-size: 24px; border: none; color: #f56c6c"
                          @click="delOption(item, index)"
                          v-if="childItem.optionList.length !== 1"
                        >
                          <Remove />
                        </el-icon>
                      </div>
                    </template>
                  </div>
                </li>
              </ul>
            </el-form-item>
          </el-form>
        </div>

        <!-- 占位 -->
        <div
          style="
            position: relative;
            z-index: -9999;
            padding: 10px 20px;
            opacity: 0;
          "
        >
          <div
            class="content"
            ref=""
            :style="{ top: top }"
            v-show="index !== null"
          >
            <div class="header">
              {{ $t('SALES.validationCriteria') }}
            </div>

            <el-form
              :model="childItem"
              label-width="0"
              @submit.prevent
              :disabled="isDisabled"
              :key="childItem.categoryType + '_' + index"
            >
              <div class="flexStart mt10">
                <el-form-item
                  prop="validationType"
                  :rules="{
                    required: true,
                    message: $t('ui.reqMsg'),
                    pattern: new RegExp(/^(?!(\s+$))/g),
                    trigger: ['change', 'blur']
                  }"
                  style="width: 45%"
                  :show-message="false"
                >
                  <div class="flexStart flex-1">
                    <div
                      class="mr10 flow1"
                      style="width: 80px"
                      :title="childItem.criteria"
                      slot:label
                    >
                      {{ childItem.criteria }}
                    </div>

                    <el-select
                      v-model="childItem.validationType"
                      placeholder=""
                      style="width: 100%"
                      @change="validationTypeChange"
                      :disabled="isDisabled"
                      class="flex-1"
                    >
                      <el-option
                        v-for="dict in showMustList"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      ></el-option>
                    </el-select>
                  </div>
                </el-form-item>

                <el-form-item
                  prop="validationValue"
                  :rules="{
                    required: isFieldRequired,
                    message: $t('ui.reqMsg'),
                    type: fieldType,
                    pattern: new RegExp(/^(?!(\s+$))/g),
                    trigger: ['change', 'blur']
                  }"
                  class="flex-1"
                  :show-message="false"
                  v-if="['checkBox'].indexOf(childItem.categoryType) === -1"
                >
                  <!-- 文本 -->
                  <el-input
                    v-model="childItem.validationValue"
                    maxlength="50"
                    :disabled="!isFieldRequired"
                    v-if="['textField'].indexOf(childItem.categoryType) !== -1"
                  ></el-input>
                  <!-- 数字 -->
                  <el-input-number
                    v-model="childItem.validationValue"
                    :precision="0"
                    v-thousandSplit="{ precision: 0 }"
                    type="number"
                    class="form-wd textleft"
                    :min="1"
                    :max="999999999999"
                    placeholder="1 - 999999999999"
                    style="width: 100%"
                    controls-position="right"
                    :disabled="!isFieldRequired"
                    v-if="['numberBox'].indexOf(childItem.categoryType) !== -1"
                  />
                  <!-- 单选，多选 -->
                  <el-select
                    v-model="childItem.validationValue"
                    placeholder=""
                    style="width: 100%"
                    clearable
                    @change="selectChange(childItem)"
                    :multiple="
                      childItem.validationType === 'like' &&
                      childItem.categoryType === 'singleOption'
                        ? false
                        : true
                    "
                    :collapse-tags="
                      childItem.validationType === 'like' &&
                      childItem.categoryType === 'singleOption'
                        ? false
                        : true
                    "
                    class="flex-1"
                    :key="'select_' + childItem.categoryType"
                    :disabled="!isFieldRequired"
                    v-if="
                      ['singleOption', 'multiOption'].indexOf(
                        childItem.categoryType
                      ) !== -1
                    "
                  >
                    <el-option
                      v-for="dict in childItem.optionList.filter(
                        x => x.optionName && x.optionName.trim() !== ''
                      )"
                      :key="dict.customId"
                      :label="dict.optionName"
                      :value="dict.customId"
                    ></el-option>
                  </el-select>
                  <!-- 日期 -->
                  <el-input-number
                    v-model="childItem.validationValue"
                    :precision="0"
                    v-thousandSplit="{ precision: 0 }"
                    type="number"
                    class="form-wd textleft"
                    :min="1"
                    :max="999"
                    placeholder="1 - 999"
                    style="width: 100%"
                    controls-position="right"
                    v-if="
                      ['dateSelection'].indexOf(childItem.categoryType) !== -1
                    "
                  />
                </el-form-item>
                <!-- 日期 -->
                <el-form-item
                  prop="validationDateType"
                  class="fs-0"
                  style="width: 100px"
                  :show-message="false"
                  v-if="
                    ['dateSelection'].indexOf(childItem.categoryType) !== -1
                  "
                >
                  <el-select
                    v-model="childItem.validationDateType"
                    placeholder=""
                    :disabled="isDisabled"
                  >
                    <el-option
                      v-for="dict in dateTypeList"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>

              <el-form-item
                v-if="
                  ['singleOption', 'multiOption'].indexOf(
                    childItem.categoryType
                  ) !== -1
                "
              >
                <ul class="select-card drag-card" ref="dragCard">
                  <li
                    class="select-item select-item-header"
                    :key="keyValue - 1"
                  >
                    <!-- <div class="select-item-box select-item-left">
                    {{ $t('ui.sn') }}
                  </div> -->
                    <div class="select-item-box select-item-center">
                      <span style="color: #ff4949; margin-right: 4px">*</span
                      >{{ $t('SALES.option') }}
                    </div>
                    <!-- <div class="select-item-box select-item-required">
                    {{ $t('SALES.remarksMustBeFilledIn') }}
                  </div> -->
                    <div class="select-item-box select-item-right">
                      {{ $t('ui.action') }}
                    </div>
                  </li>
                  <li
                    class="select-item drag-item"
                    v-for="(item, index) in childItem.optionList"
                    :key="index + keyValue"
                  >
                    <div class="select-item-box select-item-center">
                      <el-input
                        v-model="item.optionName"
                        :maxlength="50"
                      ></el-input>
                    </div>
                    <div class="select-item-box select-item-right flexCen">
                      <template v-if="!isDisabled">
                        <div
                          class="action-btn flexCCen"
                          v-if="childItem.optionList.length < 10"
                        >
                          <el-icon
                            class="mr10 pointer"
                            style="
                              font-size: 24px;
                              border: none;
                              margin-right: 5px;
                            "
                            @click="addOption(item, index)"
                          >
                            <CirclePlus />
                          </el-icon>
                        </div>
                        <div class="action-btn flexCCen">
                          <el-icon
                            class="pointer"
                            style="
                              font-size: 24px;
                              border: none;
                              color: #f56c6c;
                            "
                            @click="delOption(item, index)"
                            v-if="childItem.optionList.length !== 1"
                          >
                            <Remove />
                          </el-icon>
                        </div>
                      </template>
                    </div>
                  </li>
                </ul>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  queryLeadQualificationCriteriaById,
  updateLeadQualificationCriteria
} from '@/api/system/leadValidationCriteria'
import Sortable from 'sortablejs'
const timeStamp = Date.now() + ''
const row = {
  customId: timeStamp,
  criteria: undefined,
  categoryType: 'checkBox',
  validationType: 'notNull',
  validationValue: undefined,
  dateFormat: 'dd/MM/yyyy',
  validationDateType: 'day',
  optionList: [
    { optionName: '', isRequired: '0', customId: timeStamp, isSelect: '0' }
  ]
}

export default {
  name: 'QuestionnaireDetails',
  dicts: ['sys_date_format'],
  components: {},
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: [],
      index: null,
      childItem: {},
      // 答案类型
      categoryList: [
        {
          value: 'checkBox',
          label: this.$t('SALES.checkBox')
        },
        {
          value: 'textField',
          label: this.$t('SALES.textField')
        },
        {
          value: 'numberBox',
          label: this.$t('SALES.numberBox')
        },
        {
          value: 'singleOption',
          label: this.$t('SALES.singleOption')
        },
        {
          value: 'multiOption',
          label: this.$t('SALES.multiOption')
        },
        {
          value: 'dateSelection',
          label: this.$t('SALES.dateSelection')
        }
      ],
      dateTypeList: [
        { value: 'hour', label: this.$t('SALES.hour') },
        { value: 'day', label: this.$t('SALES.day') },
        { value: 'week', label: this.$t('SALES.week') },
        { value: 'month', label: this.$t('SALES.month') },
        { value: 'year', label: this.$t('SALES.year') }
      ],
      btnDisabled: false,
      oldScrollTop: 0,
      top: '16px',
      leftTop: 0,
      sortableDom: undefined,
      keyValue: +new Date()
    }
  },
  computed: {
    // 验证标准类型可选择的下拉选项
    showMustList() {
      let mustList = [
        { value: 'equalTo', label: this.$t('SALES.equalTo') },
        { value: 'notEqualTo', label: this.$t('SALES.notEqualTo') },
        { value: 'like', label: this.$t('SALES.like') },
        { value: 'notLike', label: this.$t('SALES.notLike') },
        { value: 'null', label: this.$t('SALES.null') },
        { value: 'notNull', label: this.$t('SALES.notNull') },
        { value: 'greaterThan', label: this.$t('SALES.greaterThan') },
        { value: 'lessThan', label: this.$t('SALES.lessThan') }
      ]
      const { categoryType } = this.childItem
      if (['checkBox'].indexOf(categoryType) !== -1) {
        mustList = mustList.filter(
          x => ['null', 'notNull'].indexOf(x.value) !== -1
        )
      } else if (['numberBox', 'dateSelection'].indexOf(categoryType) !== -1) {
        mustList = mustList.filter(
          x =>
            ['equalTo', 'notEqualTo', 'greaterThan', 'lessThan'].indexOf(
              x.value
            ) !== -1
        )
      } else if (
        ['textField', 'singleOption', 'multiOption'].indexOf(categoryType) !==
        -1
      ) {
        mustList = mustList.filter(
          x => ['greaterThan', 'lessThan'].indexOf(x.value) === -1
        )
      }
      return mustList
    },
    // 验证标准输入值是否必填/是否禁用
    isFieldRequired() {
      const { categoryType, validationType } = this.childItem
      if (
        ['textField', 'singleOption', 'multiOption'].indexOf(categoryType) !==
        -1
      ) {
        if (['null', 'notNull'].indexOf(validationType) !== -1) {
          return false
        }
        return true
      }
      return true
    },
    fieldType() {
      const { categoryType, validationType } = this.childItem
      if (['numberBox', 'dateSelection'].indexOf(categoryType) !== -1) {
        return 'number'
      } else if (validationType === 'like' && categoryType === 'singleOption') {
        return 'string'
      } else if (['singleOption', 'multiOption'].indexOf(categoryType) !== -1) {
        return 'array'
      }
      return 'string'
    },
    size() {
      return this.$store.getters.size || 'default'
    },
    butHeight() {
      const params = {
        small: 24,
        default: 32,
        large: 40
      }
      return params[this.size]
    }
  },
  created() {
    this.init()
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, true)
  },
  methods: {
    // 选项字段相同
    getFieldExists(row) {
      const { optionList } = this.childItem
      const optionName = (row.optionName || '').trim()
      if (!optionName) return false
      const filterList = optionList.filter(item =>
        (item.optionName || '').trim()
      )
      const exists = filterList.find(
        item =>
          item.customId !== row.customId &&
          (item.optionName || '').trim() === optionName
      )
      return !!exists
    },
    initDraggable() {
      const that = this
      this.destroyDraggable()
      setTimeout(() => {
        const el = this.$refs.dragCard
        this.sortableDom = Sortable.create(el, {
          handle: '.allowDrag',
          animation: 100,
          ghostClass: 'blue-background-class',
          onEnd: evt => {
            if (evt.newIndex === 0 || evt.oldIndex === evt.newIndex)
              return that.keyValue++
            const { optionList } = that.childItem
            const targetRow = optionList.splice(evt.oldIndex - 1, 1)[0]
            optionList.splice(evt.newIndex - 1, 0, targetRow)
            that.childItem['optionList'] = optionList
            that.list[that.index] = that.childItem
            that.keyValue++
          }
        })
      }, 300)
    },
    destroyDraggable() {
      if (this.sortableDom) {
        this.sortableDom.destroy()
        this.sortableDom = undefined
      }
    },
    handleScroll() {
      if (this.$refs.content) {
        const box = this.$refs.box
        const content = this.$refs.content

        const boxHeight = box.offsetHeight
        const contentBox = content.getBoundingClientRect()
        const contentHeight = content.offsetHeight
        this.contentTop = contentBox.top
        if (150 - this.contentTop + contentHeight >= boxHeight) {
          return (this.top = boxHeight - contentHeight + 'px')
        }
        if (this.contentTop <= 150) {
          this.top = 150 - this.contentTop + 'px'
          this.leftTop = 150 - 16 - this.contentTop + 'px'
        } else {
          this.top = 0
          this.leftTop = 0
        }
      }
    },
    init() {
      queryLeadQualificationCriteriaById({}).then(res => {
        const { leadQualificationCriteriaList } = res.data
        if (
          leadQualificationCriteriaList &&
          leadQualificationCriteriaList.length > 0
        ) {
          this.list = leadQualificationCriteriaList || []
          // 验证标准数据转换
          this.list.forEach(x => {
            x.customId = x.leadQualificationCriteriaId
            if (
              ['singleOption', 'multiOption'].indexOf(x.categoryType) !== -1
            ) {
              if (
                x.categoryType === 'singleOption' &&
                x.validationType === 'like'
              ) {
                x.validationValue = x.validationStrValue
              } else {
                x.validationValue = x.validationStrValue.split(',') || ''
              }
            } else if (
              ['numberBox', 'dateSelection'].indexOf(x.categoryType) !== -1
            ) {
              x.validationValue = x.validationIntValue
            } else {
              x.validationValue = x.validationStrValue
            }
          })
        } else {
          const obj = JSON.parse(JSON.stringify(row))
          obj.customId = Date.now()
          this.list = [obj]
        }
      })
    },
    // 明细
    detailQuestions(child, index) {
      this.index = index
      this.childItem = child
      // if (['singleOption', 'multiOption'].indexOf(child.categoryType) !== -1) {
      //   this.initDraggable()
      // }
    },
    // 新增
    addQuestions(child, index) {
      if (this.btnDisabled) return
      this.btnDisabled = true
      setTimeout(() => {
        this.btnDisabled = false
      }, 200)
      const obj = JSON.parse(JSON.stringify(row))
      obj.customId = Date.now()
      this.list.push(obj)
    },
    // 删除
    delQuestions(child, index) {
      if (child.customId === this.childItem.customId) {
        this.index = null
        this.childItem = {}
      }
      this.list.splice(index, 1)
    },
    // 类型
    categoryTypeChange(item, index) {
      const { categoryType } = item
      if (['checkBox', 'textField'].indexOf(categoryType) !== -1) {
        item.validationType = 'notNull'
      } else if (['singleOption', 'multiOption'].indexOf(categoryType) !== -1) {
        item.validationType = 'null'
      } else if (['numberBox'].indexOf(categoryType) !== -1) {
        item.validationType = 'greaterThan'
      } else if (['dateSelection'].indexOf(categoryType) !== -1) {
        item.validationType = 'lessThan'
      }
      item.validationDateType = 'day'
      item.validationValue = undefined
      if (['dateSelection'].indexOf(categoryType) !== -1) {
        item.validationValue = 7
      }
    },
    // 验证类型
    validationTypeChange() {
      const { categoryType, validationType } = this.childItem
      if ('singleOption'.indexOf(categoryType) !== -1) {
        this.childItem.validationValue = undefined
      } else if (
        ['textField', 'singleOption', 'multiOption'].indexOf(categoryType) !==
          -1 &&
        ['notNull', 'null'].indexOf(validationType) !== -1
      ) {
        this.childItem.validationValue = undefined
      }
      this.$refs.detailsForm.clearValidate('validationValue')
    },
    // 下拉选项被选中
    selectChange(child) {
      const { categoryType, optionList, validationValue } = child
      // 选项是否被选中
      optionList.forEach(x => {
        x.isSelect = '0'
        if (!!validationValue && validationValue.indexOf(x.customId) !== -1) {
          x.isSelect = '1'
        }
      })
    },
    // 时间格式
    dateFormatChange() {},
    // 新增选项
    addOption(item, index) {
      if (this.btnDisabled) return
      this.btnDisabled = true
      setTimeout(() => {
        this.btnDisabled = false
      }, 200)
      const timeStamp = JSON.stringify(Date.now())
      this.childItem.optionList.push({
        optionName: '',
        isRequired: '0',
        isSelect: '0',
        customId: timeStamp
      })
    },
    // 删除选项
    delOption(item, index) {
      const { categoryType, validationValue } = this.childItem
      if (validationValue.indexOf(item.customId) !== -1) {
        this.childItem.validationValue.splice(
          validationValue.indexOf(item.customId),
          1
        )
      }
      this.childItem.optionList.splice(index, 1)
    },
    // 问题名称
    questionsNameChange(child, index) {
      const { categoryType } = child
    },
    // 表单校验
    checkForm() {
      for (let i = 0; i < this.list.length; i++) {
        if (
          this.list[i].categoryType === 'singleOption' ||
          this.list[i].categoryType === 'multiOption'
        ) {
          if (this.list[i].optionList.some(m => m.optionName === '')) {
            this.$modal.msgError(this.$t('ui.reqMsg'))
            this.detailQuestions(this.list[i], i)
            return false
          }
          const optionNameList = this.list[i].optionList.map(x => x.optionName)
          const filterList = Array.from(new Set(optionNameList))
          if (filterList.length < optionNameList.length) {
            this.$modal.msgError(this.$t('system.fieldExists'))
            this.detailQuestions(this.list[i], i)
            return false
          }
        }
        if (i === this.list.length - 1) {
          return true
        }
      }
    },
    async submitForm() {
      let flag = true
      for (let i = 0; i < this.list.length; i++) {
        try {
          await this.$refs['child_' + this.list[i].customId][0].validate()
          const { categoryType, validationType, validationValue } = this.list[i]
          // 检验标准类型为空
          if (!validationType) {
            this.detailQuestions(this.list[i], i)
            this.$modal.msgError(this.$t('ui.reqMsg'))
            this.$nextTick(async () => {
              await this.$refs['detailsForm'].validate()
            })
            flag = false
            return false
          }
          if (['singleOption', 'multiOption'].indexOf(categoryType) !== -1) {
            if (['null', 'notNull'].indexOf(validationType) === -1) {
              if (
                validationType === 'like' &&
                categoryType === 'singleOption'
              ) {
                if (!validationValue) {
                  flag = false
                }
              } else if (!validationValue || validationValue.length <= 0) {
                flag = false
              }
            }
          } else if (['textField'].indexOf(categoryType) !== -1) {
            if (
              ['null', 'notNull'].indexOf(validationType) === -1 &&
              !validationValue
            ) {
              flag = false
            }
          } else if (categoryType !== 'checkBox' && !validationValue) {
            // 类型不等于复选框且校验标准值为空
            flag = false
          }
          if (!flag) {
            this.detailQuestions(this.list[i], i)
            this.$nextTick(async () => {
              await this.$refs['detailsForm'].validate()
            })
            return false
          }
        } catch (err) {
          flag = false
          return false
        }
        if (i === this.list.length - 1 && flag) {
          const status = this.checkForm()
          if (status) {
            this.list.forEach(x => {
              if (
                ['singleOption', 'multiOption'].indexOf(x.categoryType) !== -1
              ) {
                if (typeof x.validationValue === 'string') {
                  x.validationStrValue = x.validationValue
                } else {
                  x.validationStrValue = (x.validationValue || []).join(',')
                }
              } else if (
                ['numberBox', 'dateSelection'].indexOf(x.categoryType) !== -1
              ) {
                x.validationIntValue = x.validationValue
              } else {
                x.validationStrValue = x.validationValue
              }
            })
            return JSON.parse(JSON.stringify(this.list))
          } else {
            return false
          }
        }
      }
    },
    async submit() {
      const leadQualificationCriteriaList = await this.submitForm()
      if (leadQualificationCriteriaList) {
        const LeadQualificationCriteriaVO = {
          leadQualificationCriteriaList
        }
        this.$modal
          .confirm(this.$t('ui.submitPageConfirm'))
          .then(() => {
            return updateLeadQualificationCriteria(LeadQualificationCriteriaVO)
          })
          .then(response => {
            this.$modal.msgSuccess(this.$t('SALES.savedSuccessfully'))
            this.init()
          })
          .catch(() => {})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.date-text-color {
  position: relative;
  .err-msg {
    white-space: nowrap;
    background-color: #f56c6c;
    border-radius: 6px;
    z-index: 10;
    color: #fff;
    font-size: 10px;
    line-height: 12px;
    padding: 2px 6px;
    position: absolute;
    bottom: 0px;
    right: 0px;
  }
}
.questionnaire-details {
  display: flex;
  height: 100%;
  min-height: 500px;
  overflow: hidden;
}
.left {
  position: relative;
  width: 65%;
  padding: 0 10px;
  margin-right: 10px;
  background-color: #fff;
  border-right: 1px solid #ccc;
  overflow: hidden;
  .header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    z-index: 1;
    // box-shadow: 0 0 5px 0 rgba($color: #000000, $alpha: 0.3);
  }
}
.right {
  position: relative;
  width: 35%;
  min-width: 510px;
  .content {
    position: absolute;
    top: 0;
    left: 0;
    padding: 10px 20px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
  }
  .header {
    font-size: 15px;
    font-weight: 700;
  }
}
.action-btn {
  width: 30px;
}
.select-card {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  flex: 1;
  .select-item {
    display: flex;
    height: 35px;
    line-height: 35px;

    .select-item-box {
      padding: 0 10px;
      text-align: center;
      border-right: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
    }
    .select-item-left {
      width: 60px;
      flex-shrink: 0;
    }
    .select-item-center {
      flex: 1;
      // min-width: 100px;
    }
    .select-item-required {
      width: 200px;
      flex-shrink: 0;
    }
    .select-item-right {
      width: 100px;
      flex-shrink: 0;
    }
  }
  .select-item-header {
    font-weight: 700;
  }
}
</style>
