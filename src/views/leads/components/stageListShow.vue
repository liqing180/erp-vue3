<template>
  <div class="process">
    <div
      class="stage"
      v-for="(item, index) in stageList"
      :key="index"
      :style="`--stage-color: ${item.stageColor}; --font-color: ${item.fontColor}`"
    >
      <div class="stage-box">
        <div class="stage-box-content">{{ item.stageName }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    leadStatus: String
  },
  computed: {
    stageList() {
      // dictSort: "1", dictLabel: "待处理"
      // dictSort: "2", dictLabel: "验证中"
      // dictSort: "3", dictLabel: "验证通过"
      // dictSort: "4", dictLabel: "验证不通过"
      // dictSort: "5", dictLabel: "已转化"
      // dictSort: "6", dictLabel: "已成交"

      const leadStatus = this.leadStatus ? Number(this.leadStatus) : 0
      const defaultColor = '#d2f5da' // 淡绿色
      const acColor = '#20CC47' // 深绿色
      const verifiedFailed = '#dd5159' // 酒红色
      const list = []
      list.push({
        stageName: this.$t('customer.open'),
        stageColor: leadStatus >= 1 ? acColor : defaultColor,
        fontColor: '#333'
      })

      list.push({
        stageName: this.$t('customer.verifying'),
        stageColor: leadStatus >= 2 ? acColor : defaultColor,
        fontColor: '#333'
      })

      let verifiedStageName = this.$t('customer.verified')
      let verified = defaultColor
      let verifiedFontColor = '#333'
      if (leadStatus >= 3) {
        verifiedStageName = this.$t('customer.verificationPassed')
        verified = acColor
      }
      if (leadStatus === 4) {
        verified = verifiedFailed
        verifiedStageName = this.$t('customer.verificationFailed')
        verifiedFontColor = 'white'
      }
      list.push({
        stageName: verifiedStageName,
        stageColor: verified,
        fontColor: verifiedFontColor
      })

      list.push({
        stageName: this.$t('customer.converted'),
        stageColor: leadStatus >= 5 ? acColor : defaultColor,
        fontColor: '#333'
      })

      return list
    }
  }
}
</script>

<style lang="scss" scoped>
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

.stage:before {
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

.stage:last-child:after {
  display: none;
}
.stage:last-child {
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
}
</style>
