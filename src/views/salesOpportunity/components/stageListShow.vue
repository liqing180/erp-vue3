<template>
  <div>
    <div class="process">
      <div
        class="stage"
        :class="{
          'stage-per': currentIndex !== index,
          'stage-per-0': currentIndex === 0 && index === 0
        }"
        v-for="(item, index) in stageList"
        :key="index"
        :style="{
          '--stage-color': item.bgColor
            ? item.bgColor
            : currentIndex > index
              ? '#20CC47'
              : '#d2f5da',
          '--font-color': item.color ? item.color : '#333',
          'min-width': 0
        }"
      >
        <div
          class="stage-box"
          :class="{ 'stage-box-0': currentIndex === 0 && index === 0 }"
        >
          <div class="stage-box-content flexStart flow1">
            <div class="sn fs-0">{{ index + 1 }}</div>
            <div class="flow1" style="max-width: 80%" :title="item.stageName">
              {{ item.stageName }}
            </div>
          </div>
        </div>
        <template v-if="currentIndex === index">
          <div
            style="
              position: absolute;
              width: 100%;
              height: 32px;
              top: 0;
              border-top-left-radius: 32px;
              border-bottom-left-radius: 32px;
            "
            :style="{
              overflow: currentIndex === 0 && percentage < 30 ? 'hidden' : ''
            }"
          >
            <div
              class="per"
              :class="{ 'per-radius': currentIndex === 0 }"
              :style="{ width: percentage + '%' }"
            ></div>
            <img
              src="./right.png"
              width="32px"
              alt=""
              class="right"
              v-if="currentIndex !== 0"
            />
            <div
              class="per-after"
              :style="{ left: percentage + '%' }"
              v-if="percentage > 0"
            ></div>
          </div>
        </template>
      </div>

      <el-button
        type="primary"
        size="small"
        style="margin-left: 30px"
        @click="changeStageToCompleted"
        v-if="query.isCanStageComplete === '1'"
        >{{ $t('customer.changeStageToCompleted') }}
      </el-button>
    </div>
    <activityDlg
      ref="activityDlg"
      class="mt20"
      :query="query"
      @onSuccess="$emit('onSuccess')"
    />
  </div>
</template>

<script>
import activityDlg from './activityDlg'
import { completeOpportunityStage } from '@/api/salesOpportunity/salesOpportunity'

export default {
  props: {
    leadStatus: String,
    query: Object
  },
  components: {
    activityDlg
  },
  data() {
    return {
      stageList: [],
      currentIndex: undefined,
      percentage: 0
    }
  },
  computed: {},
  methods: {
    init() {
      this.$refs.activityDlg.init()
      const {
        stageModel,
        currentSalesOpportunityStage,
        salesOpportunityStatus,
        salesOpportunityStatusShowStr,
        currentPercentage
      } = this.query
      let stages = stageModel.stages || []
      if (['3'].indexOf(salesOpportunityStatus) !== -1) {
        stages.splice(stages.length - 1, 1, {
          stageName: salesOpportunityStatusShowStr
        })
        this.currentIndex = stages.length
        this.stageList = stages
      } else if (['4'].indexOf(salesOpportunityStatus) !== -1) {
        stages.splice(stages.length - 1, 1, {
          stageName: salesOpportunityStatusShowStr,
          bgColor: '#dd5159',
          color: '#fff'
        })
        this.currentIndex = stages.length
        this.stageList = stages
      } else if (['5'].indexOf(salesOpportunityStatus) !== -1) {
        stages.splice(stages.length - 1, 1, {
          stageName: this.$t('customer.closedWon')
        })
        this.currentIndex = stages.length
        this.stageList = stages
      } else {
        this.stageList = stages
        this.currentIndex = this.stageList.findIndex(
          x => x.stageId === currentSalesOpportunityStage.stageId
        )
        // const scale = (100 / this.stageList.length).toFixed(2)
        // this.percentage = currentPercentage || 0

        // const bigBoxWidth = 100
        // const smallBoxWidth = (100 / this.stageList.length).toFixed(2)
        // const objectRatioInBigBox = currentPercentage / 100
        // const objectWidth = bigBoxWidth * objectRatioInBigBox
        // const objectRatioInSmallBox = (objectWidth / smallBoxWidth) * 100
        // this.percentage = objectRatioInSmallBox
        // console.log(objectRatioInSmallBox, '141')
        this.percentage =
          ((currentPercentage -
            (currentSalesOpportunityStage.percentage -
              currentSalesOpportunityStage.occupyPercentage)) /
            currentSalesOpportunityStage.occupyPercentage) *
          100
      }

      const defaultColor = '#d2f5da' // 淡绿色
      const acColor = '#20CC47' // 深绿色
      const verifiedFailed = '#dd5159' // 酒红色
    },

    changeStageToCompleted() {
      this.$modal
        .confirm(this.$t('customer.activityComplete1'))
        .then(() => {
          return completeOpportunityStage(this.query.salesOpportunityId)
        })
        .then(response => {
          this.$modal.msgSuccess(this.$t('customer.activityCompleteSuccess1'))
          this.$emit('onSuccess')
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.sn {
  color: #333;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  margin-right: 5px;
  border-radius: 50%;
  background-color: #fff;
}
.process {
  display: flex;
  align-items: center;
}
.stage {
  flex: 1;
  margin-right: 5px;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 32px;
  background-color: var(--stage-color);
  // overflow: hidden;
}
.stage-per {
  flex: 1;
  margin-right: 5px;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 32px;
  background-color: var(--stage-color);
}
.per {
  position: absolute;
  height: 32px;
  width: 0;
  left: 0;
  background-color: #20cc47;
  z-index: 1;
}
.per-radius {
  border-radius: 16px 0 0 16px;
}
.per-after {
  height: 32px;
  border-top: 16px solid transparent;
  border-bottom: 16px solid transparent;
  border-left: 16px solid #20cc47;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
}
.right {
  position: absolute;
  height: 42px;
  width: 42px;
  left: -16px;
  top: -5px;
  z-index: 6;
}
.stage-box {
  height: 32px;
  color: var(--font-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding-left: 30px;
  flex: 1;
  flex-shrink: 0;
}

.stage:after {
  content: '';
  display: block;
  border-top: 16px solid transparent;
  border-bottom: 16px solid transparent;
  border-left: 16px solid var(--stage-color);
  position: absolute;
  right: -16px;
  top: 0;
  z-index: 2;
}

.stage-per:before {
  content: '';
  display: block;
  border-top: 16px solid var(--stage-color);
  border-bottom: 16px solid var(--stage-color);
  border-left: 16px solid #fff;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}

.stage:first-child:before {
  display: none;
}
.stage:first-child {
  border-radius: 16px 0 0 16px;
}
.stage:last-of-type:after {
  display: none;
}
.stage-per-0:after {
  display: none;
}
.stage-box-0:after {
  content: '';
  display: block;
  border-top: 16px solid transparent;
  border-bottom: 16px solid transparent;
  border-left: 16px solid var(--stage-color);
  position: absolute;
  right: -16px;
  top: 0;
  z-index: 2;
}

.stage:last-of-type {
  border-radius: 0 16px 16px 0;
}
.set-icon {
  display: none;
}
.stage:hover .set-icon {
  display: inline-block;
}

.stage-box-content {
  cursor: grab;
  width: 100%;
  font-size: 14px;
  font-weight: 400;
  font-family: 'Arial Normal', 'Arial', sans-serif;
  position: relative;
  z-index: 9;
}
</style>
