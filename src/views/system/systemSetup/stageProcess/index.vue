<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button
        type="primary"
        size="small"
        :disabled="fullscreenLoading"
        @click="submitForm"
        v-if="editAuth && isEdit === true"
        >{{ $t('uiBtn.submit') }}
      </el-button>

      <el-button
        type="primary"
        size="small"
        @click="handleEdit"
        v-if="editAuth && isEdit === false"
        >{{ $t('uiBtn.edit') }}
      </el-button>
    </template>
    <template v-slot:content>
      <div
        class="form-card w100"
        style="height: 100%"
        :style="`--stage-color: ${color1}`"
        :class="{ 'edit-page': isEdit }"
      >
        <div class="flexCol" style="height: 100%">
          <!-- 顶部按钮 新增 与 颜色切换 -->
          <div
            v-if="isEdit && isCanEditStage"
            class="flexStart"
            style="padding: 10px 20px 0 20px"
          >
            <el-button
              type="primary"
              size="small"
              icon="Plus"
              @click="handleAddStage"
              >{{ $t('SALES.addStage') }}</el-button
            >
            <el-color-picker
              class="ml20"
              :predefine="predefineColors"
              size="default"
              v-model="color1"
            />
          </div>
          <div v-else style="padding: 10px 20px 0 20px">
            {{ $t('SALES.stageProcess') }}
          </div>
          <!-- 中间阶段流程 -->
          <div class="flex-1 flex mt10" style="width: 100%; min-width: 0">
            <div
              class="flex flex-1"
              style="width: 100%; height: 100%; padding: 0 10px; min-width: 0"
              ref="stageRef"
            >
              <!-- 阶段 -->
              <div
                v-for="(item, index) in stageList"
                :key="item.rowTimeId"
                class="flexCol flex-1 stageItem"
                style="height: 100%; min-width: 0"
              >
                <div style="height: 36px; background-color: #eee">
                  <div class="stage">
                    <div class="stage-box" :class="item.className">
                      <div class="stage-circle flexCen">
                        {{ index + 1 }}
                      </div>
                      <div
                        class="stage-box-content ellipsis-text"
                        :title="item.stageName"
                      >
                        {{ item.stageName }}
                      </div>
                      <div class="flexEnd" v-if="isEdit">
                        <el-dropdown
                          placement="top"
                          @command="handleCommand($event, item, index)"
                        >
                          <el-icon
                            class="set-icon pointer"
                            color="#555"
                            size="18"
                          >
                            <Setting />
                          </el-icon>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item command="edit">
                                <span style="color: #02a7f0; cursor: pointer">{{
                                  $t('uiBtn.edit')
                                }}</span>
                              </el-dropdown-item>
                              <el-dropdown-item
                                command="delete"
                                v-if="
                                  item.stageType !== '2' &&
                                  item.stageType !== '4' &&
                                  isCanEditStage
                                "
                              >
                                <span style="color: #ec808d; cursor: pointer">{{
                                  $t('uiBtn.delete')
                                }}</span>
                              </el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>

                        <el-icon
                          class="pointer ml5"
                          color="#555"
                          size="18"
                          @click="handleAddActivity(item, index)"
                          v-if="(item.activities || []).length < 20"
                        >
                          <Plus />
                        </el-icon>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 阶段下面的活动列表 -->
                <div class="activity-list">
                  <!-- el-scrollbar -->
                  <div class="activity-list-box" :ref="`activityRef${index}`">
                    <div
                      class="activity-item"
                      v-for="(ac, acIndex) in item.activities || []"
                      :key="ac.activityId"
                    >
                      <div class="activity-item-content flex flex-1">
                        <div
                          class="activity-circle"
                          :class="{ isActive: ac.isActive === '1' }"
                        ></div>
                        <div class="activity-name" :title="ac.activityName">
                          {{ ac.activityName }}
                        </div>
                        <span
                          v-if="ac.required === '1'"
                          style="color: #ff4949; margin: 0 4px"
                          >*</span
                        >
                      </div>
                      <div style="margin: 0 6% 0 10px">
                        {{ ac.percentage }}%
                      </div>
                      <div class="flexEnd activity-action" v-if="isEdit">
                        <div class="activity-action-box">
                          <el-icon
                            class="pointer mr5"
                            color="#555"
                            size="18"
                            @click="editActivity(item, ac, acIndex)"
                          >
                            <Edit />
                          </el-icon>
                          <el-icon
                            class="pointer"
                            color="#555"
                            size="18"
                            @click="delActivity(item, ac, acIndex)"
                          >
                            <Delete />
                          </el-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 底部进度条拖动 -->
          <div class="percentage">
            <VueSlider
              v-model="sliderValue"
              :min="1"
              :max="99"
              :minRange="1"
              :dotOptions="{ tooltip: 'always' }"
              @dragEnd="sliderValueChange"
              :tooltipFormatter="'{value}%'"
              :disabled="!isEdit"
              :enableCross="false"
              :duration="0.2"
              :processStyle="{ backgroundColor: 'gray' }"
            >
              <!-- pos, index, value, focus, disabled -->
              <template #tooltip="{ index, value }">
                <div class="my-tooltip flexCen">
                  <div class="tooltip-circle flexCen">{{ index + 1 }}</div>
                  <div>{{ value }}%</div>
                </div>
              </template>
            </VueSlider>
          </div>
        </div>
      </div>
    </template>
    <!-- 阶段新增编辑弹窗 -->
    <stageDlg
      :isCanEditStage="isCanEditStage"
      ref="stageDlg"
      @onSuccess="stageSave"
    />
    <!-- 新增活动 -->
    <addActivityDlg ref="addActivityDlg" @onSuccess="addActivitySave" />
    <!-- 编辑活动 -->
    <editActivityDlg ref="editActivityDlg" @onSuccess="editActivitySave" />
  </FormPageLayout>
</template>

<script>
import { getModel, saveModel } from '@/api/system/systemSetup/stageProcess'
import Sortable from 'sortablejs'
import VueSlider from 'vue-3-slider-component'
import stageDlg from './stageDlg.vue'
import addActivityDlg from './addActivityDlg.vue'
import editActivityDlg from './editActivityDlg.vue'

export default {
  name: 'StageProcess',
  components: { VueSlider, stageDlg, addActivityDlg, editActivityDlg },
  data() {
    const vm = this
    return {
      isEdit: false,
      fullscreenLoading: false,
      formData: {},
      stageList: [],
      /* 阶段的拖拽对象 */
      stageSortable: undefined,
      /* 活动的拖拽对象 */
      acSortableDom: {},
      color1: '',
      predefineColors: [
        '#F4581E',
        '#ff8c00',
        '#D7B706',
        '#90ee90',
        '#00ced1',
        '#20CC47',
        '#409EFF'
      ],
      sliderValue: []
    }
  },
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['systemSetup:stageProcess:edit'])
    },
    isCanEditStage() {
      return this.formData.isCanOperationStage === '1'
    },

    comDisFrom() {
      return !this.editAuth
    }
  },
  created() {
    this.timer = Date.now()
    this.queryDataById()
  },
  activated() {
    if (Date.now() - this.timer < 2000) return
    if (!this.isEdit) {
      this.queryDataById()
    }
  },
  methods: {
    handleEdit() {
      this.isEdit = true
      setTimeout(() => {
        this.setDragTable()
        this.resetSliderValue()
      }, 400)
    },
    queryDataById() {
      getModel().then(res => {
        const data = res.data || {}
        this.color1 = data.rgb || '#20CC47'
        this.formData = data
        const stages = data.stages || []
        stages.forEach((item, index) => {
          if (index < stages.length - 1) {
            item.className = 'allowDrag'
          }
          item.rowTimeId = item.stageId
          item.activities = item.activities || []
        })
        this.stageList = stages
        setTimeout(() => {
          this.setDragTable()
          this.resetSliderValue()
        }, 400)
      })
    },

    handleCommand(command, item, index) {
      if (command === 'delete') {
        this.handleDelStage(item, index)
      }
      if (command === 'edit') {
        this.handleEditStage(item, index)
      }
    },
    handleAddStage() {
      this.$refs.stageDlg.handleAdd(this.stageList)
    },
    handleEditStage(item, index) {
      const params = { ...item }
      this.$refs.stageDlg.handleUpdate(this.stageList, item, index)
    },
    stageSave(data) {
      if (!data.rowTimeId) {
        const item = {
          ...data,
          rowTimeId: Date.now(),
          className: 'allowDrag',
          activities: [],
          isActive: '1'
        }
        this.stageList.splice(this.stageList.length - 1, 0, item)
      }
      if (data.rowTimeId) {
        const index = this.stageList.findIndex(
          item => item.rowTimeId === data.rowTimeId
        )
        this.stageList.splice(index, 1, data)
      }
      this.resetSliderValue()
      this.setActiveDrag()
    },
    handleDelStage(item, index) {
      this.$modal
        .confirm(this.$t('SALES.delStageConfirm').replace('$1', item.stageName))
        .then(() => {
          this.stageList.splice(index, 1)
          this.resetSliderValue()
        })
    },

    handleAddActivity(item, index) {
      const activities = item.activities || []
      const alreadySelectIdList = activities.map(item => item.activityId)
      this.$refs.addActivityDlg.handleAdd(index, alreadySelectIdList)
    },
    addActivitySave(stageIndex, selected) {
      if (selected.length <= 0) return
      const stageItem = this.stageList[stageIndex]
      const activities = stageItem.activities
      activities.push(...selected)

      this.setActiveDrag()
    },
    editActivity(stageItem, acItem, acIndex) {
      this.editActivityStageItem = stageItem
      this.editActivityIndex = acIndex
      acItem.stageItemName = stageItem.stageName
      /* 计算可以选择的后置活动 */
      const activities = stageItem.activities
      const nextActivityIdList = []
      activities.forEach(ac => {
        if (ac.nextActivityId && ac.activityId !== acItem.activityId) {
          nextActivityIdList.push(ac.nextActivityId)
        }
      })
      /* 当前编辑活动的前置活动最上级, 需要过滤掉 */
      const curAcItemTopAc = this.getCurAcItemTopAc(activities, acItem)
      const canSelectNextActivityList = activities.filter(item => {
        return (
          !nextActivityIdList.includes(item.activityId) &&
          item.activityId !== curAcItemTopAc.activityId
        )
      })
      this.$refs.editActivityDlg.handleUpdate(acItem, canSelectNextActivityList)
    },
    /* 获取当前编辑活动的前置活动最上级 */
    getCurAcItemTopAc(activities, acItem) {
      function getTop(ac) {
        const item = activities.find(
          acI => acI.nextActivityId === ac.activityId
        )
        if (item) {
          return getTop(item)
        } else {
          return ac
        }
      }
      const top = getTop(acItem)
      return top
    },
    editActivitySave(acItem) {
      const activities = this.editActivityStageItem.activities
      activities.splice(this.editActivityIndex, 1, acItem)
    },
    delActivity(stageItem, acItem, acIndex) {
      this.$modal
        .confirm(
          this.$t('SALES.delActivityConfirm').replace('$1', acItem.activityName)
        )
        .then(() => {
          stageItem.activities.splice(acIndex, 1)
        })
    },

    setDragTable() {
      this.setActiveDrag()
      if (this.stageSortable) {
        this.stageSortable.destroy()
        this.stageSortable = ''
      }
      if (this.isEdit === false || !this.isCanEditStage) return
      const el = this.$refs.stageRef
      this.stageSortable = Sortable.create(el, {
        handle: '.allowDrag',
        animation: 100,
        ghostClass: 'blue-background-class',
        onEnd: evt => {
          if (evt.oldIndex === evt.newIndex) return
          const targetRow = this.stageList.splice(evt.oldIndex, 1)[0]
          this.stageList.splice(evt.newIndex, 0, targetRow)
          /* 如果拖动到最后面去了，重新把结束设置为最后一项 */
          this.$nextTick(() => {
            if (evt.newIndex === this.stageList.length - 1) {
              const targetRow = this.stageList.splice(
                this.stageList.length - 2,
                1
              )[0]
              this.stageList.splice(evt.newIndex, 0, targetRow)
            }
            this.resetSliderValue()
          })
        }
      })
    },
    setActiveDrag() {
      setTimeout(() => {
        this.stageList.forEach((item, index) => {
          if (this.acSortableDom[item.rowTimeId]) {
            this.acSortableDom[item.rowTimeId].destroy()
            this.acSortableDom[item.rowTimeId] = ''
          }
          if (this.isEdit === false) return

          if (item.activities && item.activities.length > 0) {
            const ref = this.$refs[`activityRef${index}`] || []
            const dom = ref[0]
            const SortableDom = Sortable.create(dom, {
              handle: '.activity-item-content',
              animation: 100,
              ghostClass: 'blue-background-class',
              onEnd: evt => {
                if (evt.oldIndex === evt.newIndex) return
                const targetRow = item.activities.splice(evt.oldIndex, 1)[0]
                item.activities.splice(evt.newIndex, 0, targetRow)
              }
            })
            this.acSortableDom[item.rowTimeId] = SortableDom
          }
        })
      }, 100)
    },

    reset() {},

    // 取消按钮
    resetSliderValue() {
      let percentage = 0
      this.sliderValue = []
      const list = []
      this.stageList.forEach((item, index) => {
        if (index === this.stageList.length - 1) return
        percentage += item.occupyPercentage
        list.push(percentage)
      })
      this.sliderValue = list
    },
    sliderValueChange() {
      this.sliderValue.forEach((p, index) => {
        const stageItem = this.stageList[index]
        if (index === 0) {
          stageItem.occupyPercentage = p
        } else {
          const pre = this.sliderValue[index - 1]
          stageItem.occupyPercentage = p - pre
        }
      })
    },

    submitForm() {
      const vm = this
      vm.$trimOfObj(this.stageList)
      let list = JSON.parse(JSON.stringify(this.stageList))
      let percentage = 0

      list.forEach((item, index) => {
        item.stageOrder = index + 1
        /* 处理 stageType */
        if (index === 0) {
          if (item.stageType !== '2') {
            // item.stageType === '1'
            item.stageType = '1'
          }
        } else {
          if (item.stageType !== '2' && item.stageType !== '4') {
            // item.stageType === '3'
            item.stageType = '3'
          }
        }
        /* 处理 percentage 跟 occupyPercentage */
        if (index < list.length - 1) {
          percentage += item.occupyPercentage
          item.percentage = percentage
        } else {
          item.occupyPercentage = 100 - percentage
        }
      })
      console.log(list, '===517')
      this.formData.stages = list
      this.formData.rgb = this.color1
      this.$modal
        .confirm(this.$t('ui.submitPageConfirm'))
        .then(() => {
          this.fullscreenLoading = true
          return saveModel(this.formData)
        })
        .then(() => {
          this.isEdit = false
          this.queryDataById()
          this.$modal.msgSuccess(this.$t('ui.submitPageSuccess'))
          this.fullscreenLoading = false
        })
        .catch(() => {
          setTimeout(() => {
            this.fullscreenLoading = false
          }, 1000)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.stage {
  flex: 1;
  margin-right: 5px;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 36px;
  font-size: 14px;
}

.stageItem:last-child .stage {
  margin-right: 0px;
}

.stage-box {
  height: 36px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding-left: 30px;
  flex: 1;
  background-color: var(--stage-color);
}
.stage-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #fefefe;
  margin-right: 10px;
  flex-shrink: 0;
  font-size: 12px;
  color: #333;
}
.stageItem:last-child .stage-box {
  padding-right: 10px;
}

.stage:after {
  content: '';
  display: block;
  border-top: 18px solid transparent;
  border-bottom: 18px solid transparent;
  border-left: 18px solid var(--stage-color);
  position: absolute;
  right: -18px;
  top: 0;
  z-index: 2;
}

.stage:before {
  content: '';
  display: block;
  border-top: 18px solid var(--stage-color);
  border-bottom: 18px solid var(--stage-color);
  border-left: 18px solid #fff;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}

.stageItem:first-child .stage:before {
  display: none;
}

.stageItem:last-child .stage:after {
  display: none;
}
.set-icon {
  opacity: 0;
  outline: none;
  // display: none;
}
.stage:hover .set-icon {
  opacity: 1;
  // display: inline-block;
}

.stage-box-content {
  flex: 1;
}

.activity-list {
  padding: 10px;
  width: 100%;
  height: calc(100vh - 320px);
  display: flex;
  flex-direction: column;
  font-size: 14px;
}
.activity-list-box {
  flex: 1;
  overflow-y: auto; /* 使内容超出时显示滚动条 */
}
.activity-item {
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #efefef;
  border-top: 0px;
  overflow: hidden;
  min-width: 0;
}
.activity-item:first-of-type {
  border-top: 1px solid #efefef;
}

.activity-item-content {
  padding: 10px 0;
  display: flex;
  align-items: center;
  min-width: 0;
  .activity-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-basis: auto;
  }
}
.activity-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #999;
  margin-right: 10px;
  flex-shrink: 0;
}
.isActive.activity-circle {
  background-color: var(--stage-color);
}

.activity-action {
  width: 42px;
}
.activity-action-box {
  display: none;
  height: 20px;
}
.activity-item:hover .activity-action-box {
  display: block;
}

.percentage {
  padding: 30px 30px 10px;
  height: 60px;
  :deep(.vue-slider-disabled) {
    opacity: 1;
  }
  // background-color: #999;
}

.my-tooltip {
  background-color: gray;
  padding: 2px 4px;
  font-size: 14px;
  margin-top: -10px;
  color: #fefefe;
  .tooltip-circle {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #fefefe;
    margin-right: 4px;
    flex-shrink: 0;
    font-size: 12px;
    color: #333;
  }
}

.edit-page {
  .activity-item-content {
    cursor: grab;
    user-select: none;
  }
  .stage-box-content {
    cursor: grab;
    user-select: none;
  }
}
</style>
