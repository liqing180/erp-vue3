<template>
  <div class="pb20">
    <div :key="salesQuotationType">
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <template v-for="item in comTabs" :key="item.key">
          <el-tab-pane :name="item.key">
            <template v-slot:label>
              <span>
                <span>{{ item.label }}</span>

                <span v-if="item.key === 'projectTask'" class="ml5">
                  <span v-if="formData.salesQuotationServiceList.length"
                    >({{ formData.salesQuotationServiceList.length }})</span
                  >
                </span>
                <span v-if="item.key === 'project'" class="ml5">
                  <span v-if="formData.salesQuotationProjectList.length"
                    >({{ formData.salesQuotationProjectList.length }})</span
                  >
                </span>
                <span v-if="item.key === 'projectCost'" class="ml5">
                  <span v-if="formData.projectCostDetailList.length"
                    >({{ formData.projectCostDetailList.length }})</span
                  >
                </span>
              </span>
            </template>
          </el-tab-pane>
        </template>

        <el-tab-pane name="attachment">
          <template v-slot:label>
            <span>
              <span>{{ $t('SALES.attachmentInfo') }}</span>
              <span v-show="curFileList.length" class="ml5"
                >({{ curFileList.length }})</span
              >
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane
          name="projectTaskMixDesign"
          v-if="
            salesQuotationType === 'MixDesign' &&
            formData.specialRequirement === '3'
          "
        >
          <template v-slot:label>
            <span>
              <span>{{ $t('SALES.projectTask') }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 配合比 -->
    <div v-show="activeName === 'mixDesign'">
      <mixDesign
        ref="mixDesign"
        :formData="formData"
        :modifyHighlight="modifyHighlight"
        :comDisFrom="comDisFrom"
        @materialListMixDesignChange="materialListMixDesignChange"
        @handleCalculate="handleCalculate"
      />
    </div>
    <div v-show="activeName === 'materialListMixDesign'">
      <materialListMixDesign
        ref="materialListMixDesign"
        :formData="formData"
        :modifyHighlight="modifyHighlight"
        :comDisFrom="comDisFrom"
      />
    </div>
    <div v-show="activeName === 'projectTaskMixDesign'">
      <projectTaskMixDesign
        ref="projectTaskMixDesign"
        :formData="formData"
        :modifyHighlight="modifyHighlight"
        :comDisFrom="comDisFrom"
      />
    </div>
    <div
      v-show="
        activeName !== 'attachment' && activeName !== 'customerQuestionnaire'
      "
    >
      <el-form
        ref="totalForm"
        class="mt20"
        :model="totalForm"
        :rules="{}"
        label-width="140px"
      >
        <div class="flex">
          <div class="flex-1">
            <el-form-item
              :label="`${$t('ui.remarks')}`"
              prop="totalRemarks"
              :class="[isModified('totalRemarks')]"
            >
              <el-input
                v-model="totalForm.totalRemarks"
                :maxlength="3000"
                type="textarea"
                :autosize="{ minRows: 10, maxRows: 10 }"
                :disabled="comDisFrom"
                show-word-limit
                resize="none"
              >
              </el-input>
            </el-form-item>
          </div>
          <div style="width: 40%; max-width: 600px; margin-right: 0px">
            <el-form-item
              :label="`${$t('SALES.otherCosts')}`"
              prop="otherCosts"
              :class="[isModified('otherCosts')]"
              v-if="['Project'].indexOf(salesQuotationType) !== -1"
            >
              <el-input-number
                v-thousandSplit="{ precision: 2 }"
                v-if="!comDisFrom"
                style="width: 100%"
                v-model="totalForm.otherCosts"
                controls-position="right"
                :precision="2"
                :min="-totalForm.subTotal || 0"
                :max="999999999.99"
              />
              <el-input
                v-else
                :value="$numberStr(totalForm.otherCosts, 2)"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item
              :label="`${$t('SALES.subTotal')}`"
              prop="subTotal"
              :class="[isModified('subTotal')]"
            >
              <el-input
                :value="$numberStr(totalForm.subTotal, 2)"
                disabled
              ></el-input>
            </el-form-item>

            <el-form-item
              :label="`${$t('SALES.totalFreight')}`"
              prop="totalFreight"
              :class="[isModified('totalFreight')]"
            >
              <el-input-number
                v-thousandSplit="{ precision: 2 }"
                v-if="!comDisFrom"
                style="width: 100%"
                v-model="totalForm.totalFreight"
                controls-position="right"
                :precision="2"
                :min="0"
                :max="999999999999.99"
                @input="totalDiscountChange"
              />
              <el-input
                v-else
                :value="$numberStr(totalForm.totalFreight, 2)"
                disabled
              ></el-input>
            </el-form-item>

            <el-form-item
              :label="`${$t('SALES.totalDiscount')}`"
              prop="totalDiscount"
              :class="[isModified('totalDiscount')]"
            >
              <el-input-number
                v-thousandSplit="{ precision: 2 }"
                v-if="!comDisFrom"
                style="width: 100%"
                v-model="totalForm.totalDiscount"
                controls-position="right"
                :precision="2"
                :min="0"
                :max="999999999999.99"
                @input="totalDiscountChange"
                :disabled="salesQuotationType === 'Consignment'"
              />
              <el-input
                v-else
                :value="$numberStr(totalForm.totalDiscount, 2)"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item
              :label="`${$t('SALES.taxAmount')}`"
              prop="totalTaxAmount"
              :class="[isModified('totalTaxAmount')]"
            >
              <el-input
                :value="$numberStr(totalForm.totalTaxAmount, 2)"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item
              :label="`${$t('SALES.totalAmount')}`"
              prop="totalAmount"
              :class="[isModified('totalAmount')]"
            >
              <div class="input-switch-box">
                <div class="con-left">
                  <el-input
                    :value="$numberStr(totalForm.totalAmount, 2)"
                    disabled
                  ></el-input>
                </div>
                <div class="con-right" v-if="!comDisFrom">
                  <svg-icon
                    @click="handleCalculate"
                    icon-class="jisuanqi"
                    style="height: 36px; width: 36px; cursor: pointer"
                  />
                </div>
              </div>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>
    <div
      v-show="activeName === 'attachment'"
      :class="[isModified('attachment')]"
    >
      <myUpload
        ref="uploadRef"
        :disabled="comDisFrom"
        :updateFileList="updateFileList"
        :fomType="'Sales Quotation'"
      />
    </div>
  </div>
</template>

<script>
import pageMixin from '@/mixins/tableMinx'

// 配合比
import projectTaskMixDesign from './projectTaskMixDesign'
import mixDesign from './mixDesign'
import materialListMixDesign from './materialListMixDesign'

import { calculate } from '@/api/salesManagement/salesQuotation'

export default {
  mixins: [pageMixin],
  components: {
    mixDesign,
    materialListMixDesign,
    projectTaskMixDesign
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },

    comDisFrom: {
      type: Boolean,
      default: false
    },

    projectList: {
      type: Array,
      default() {
        return []
      }
    },
    initCommonFileList: {
      type: Array,
      default() {
        return []
      }
    },
    salesQuotationType: {
      type: String,
      default: ''
    },
    countryId: {
      type: String,
      default: ''
    },
    businessPartnerId: {
      type: String,
      default: ''
    },
    currencyId: {
      type: String,
      default: ''
    },
    modifyHighlight: {
      type: Boolean,
      default: false
    },
    basicUpdateProps: {
      type: Array,
      default() {
        return []
      }
    },
    formData: {
      type: Object,
      required: true,
      default() {
        return {}
      }
    }
  },
  watch: {
    formData: {
      deep: false,
      immediate: true,
      handler(newValue) {
        this.totalForm = newValue || {}
      }
    },
    initCommonFileList: {
      immediate: true,
      handler: function () {
        this.initFileList(this.initCommonFileList)
      }
    },
    salesQuotationType: {
      immediate: true,
      handler(newValue) {
        if (newValue === 'Project') {
          this.activeName = 'project1'
        } else if (newValue === 'Consignment') {
          this.activeName = 'Consignment'
        } else if (newValue === 'MixDesign') {
          this.activeName = 'mixDesign'
        } else {
          this.activeName = 'productDetail'
        }
      }
    }
  },
  data() {
    return {
      activeName: '1',
      totalForm: {},
      queryTotalTime: Date.now(),
      /* 附件组件实时更新传到外部, 只是为了显示附件数量, 无其他用处 */
      curFileList: [],
      initContent: '',
      config: {
        width: '100%', // px
        height: 640, // px
        contentReadOnly: true,
        isShowToolBar: false,
        disabled: true,
        buttonsOption: [
          {
            componentName: 'BtnServTpl',
            isShow: true
          }
        ]
      }
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    comTabs() {
      let list = [
        {
          label: this.$t('SALES.mixDesign'),
          key: 'mixDesign'
        },
        {
          label: this.$t('SALES.materialList'),
          key: 'materialListMixDesign'
        }
      ]
      return list.filter(item => item)
    }
  },
  methods: {
    initFileList(FileList) {
      const maxAttempts = 10 // 最大尝试次数
      const interval = 200 // 每次尝试的间隔时间（毫秒）
      let attempts = 0
      const retry = () => {
        if (attempts < maxAttempts) {
          attempts++
          setTimeout(() => {
            if (this.$refs.uploadRef) {
              this.$refs.uploadRef.initFileList(FileList)
            } else {
              retry()
            }
          }, interval)
        } else {
          console.log('无法获取组件')
        }
      }
      retry()
    },
    materialListMixDesignChange(data = []) {
      this.totalForm.salesQuotationProductList = data
    },
    getFileIds() {
      const myFileIds = this.$refs.uploadRef.getFileIds()
      if (myFileIds === false) {
        return false
      }
      return myFileIds
    },
    updateFileList(list) {
      this.curFileList = list
    },
    handleTabClick() {},

    totalDiscountChange() {},
    handleCalculate() {
      console.log(this.totalForm, '====648')
      const params = {
        ...this.totalForm,
        salesQuotationProductList: this.totalForm.salesQuotationProductList,
        salesQuotationServiceList: this.totalForm.salesQuotationServiceList
      }
      // if (params.salesQuotationProjectList && params.salesQuotationProjectList.length > 0) {
      //   const { projectTemplateContentList } = params.salesQuotationProjectList[0]
      //   params.salesQuotationProjectContentList = projectTemplateContentList || []
      // }
      const timer = Date.now()
      this.queryTotalTime = timer
      calculate(params).then(res => {
        if (this.queryTotalTime === timer) {
          const {
            otherCosts,
            subTotal,
            expenseAmount,
            totalFreight,
            totalDiscount,
            totalTaxAmount,
            totalAmount,
            salesQuotationProductList,
            salesQuotationProjectList
          } = res.data
          this.totalForm.subTotal = subTotal
          this.totalForm.totalFreight = totalFreight
          this.totalForm.totalTaxAmount = totalTaxAmount
          this.totalForm.totalAmount = totalAmount
          this.totalForm.totalDiscount = totalDiscount
          this.totalForm.expenseAmount = expenseAmount
          if (
            this.salesQuotationType === 'Project' &&
            salesQuotationProjectList &&
            salesQuotationProjectList.length > 0
          ) {
            this.totalForm.otherCosts = salesQuotationProjectList[0].otherCosts
          } else {
            this.totalForm.otherCosts = otherCosts
          }
          this.totalForm.salesQuotationProductList = salesQuotationProductList
        }
      })
    },
    isModified(prop) {
      if (!this.modifyHighlight) {
        return ''
      }
      if (this.basicUpdateProps.includes(prop)) {
        return 'edit-outline'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pop-box {
  max-width: 600px;
  max-height: 60vh;
  overflow-y: auto;
  // padding: 12px;
  box-sizing: border-box;
  background-color: #333;
  div {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
