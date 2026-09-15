<template>
  <!-- <div :style="{ marginRight: language === 'en' ? '190px' : '140px' }"> -->
  <div>
    <div class="flexSb">
      <el-button type="primary" size="small" @click="handleAdd"
        >{{ $t('customer.addActivity') }}
      </el-button>

      <el-form
        :model="form"
        label-width="auto"
        ref="form"
        class="flexStart form"
      >
        <el-form-item label="" prop="activityType" class="mr20">
          <el-select
            v-model="form.activityTypeList"
            :placeholder="$t('customer.activityType')"
            style="width: 200px"
            clearable
            multiple
            collapse-tags
            @change="searchForm"
          >
            <el-option
              v-for="dict in activity_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="" prop="condition" class="mr10">
          <el-input
            v-model="form.condition"
            style="width: 240px"
            :placeholder="`${$t('customer.activityName')} / ${$t(
              'customer.subject'
            )}`"
            @keyup.enter="searchForm"
          >
            <template #prefix>
              <el-icon class="el-input__icon"><search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-icon
          size="14"
          color="#409efc"
          style="cursor: pointer"
          @click="resetSearchForm"
        >
          <Refresh />
        </el-icon>
      </el-form>
    </div>
    <div style="width: 100%">
      <el-collapse v-model="activeNames" class="mt20">
        <div class="form-card">
          <el-collapse-item name="1">
            <template v-slot:title>
              <FormCollapseItemTitle
                :title="$t('customer.upcomingOverdue')"
                :warning="collapseWarningForBasicInfo"
              >
              </FormCollapseItemTitle>
            </template>
            <div>
              <ul v-if="awaitList.length > 0">
                <li v-for="(item, index) in awaitList" :key="index">
                  <div class="flex">
                    <div class="mr20 fs-0">
                      <span style="color: #ff4949; margin-right: 4px">*</span>
                      <span class="primary-link" @click="handlerUpdate(item)">{{
                        selectDictLabel(activity_type, item.activityType)
                      }}</span>
                    </div>
                    <div class="mr20 flow1">
                      <span class="mr5">{{ $t('customer.subject1') }}:</span>
                      <span class="flow1">
                        {{ item.subject }}
                      </span>
                    </div>
                    <div class="mr20 flow1">
                      <span class="mr5"
                        >{{ $t('customer.contactPerson') }}:</span
                      >
                      <span>{{ item.contactPersonName }}</span>
                    </div>
                    <div class="flow1">
                      <el-icon
                        size="14"
                        color="#409efc"
                        style="cursor: pointer"
                        class="mr5"
                      >
                        <Calendar />
                      </el-icon>
                      <span class="flow1">
                        {{ item.activityTimeStr }}
                      </span>
                    </div>
                  </div>
                  <div class="mt5 text-content" v-if="item.content">
                    <div class="flexStart">
                      <div :class="{ 'expanded-content': item.isOverTwoLines }">
                        <span class="mr10">{{ $t('ui.content') }}</span>
                        <span>{{ item.content }}</span>
                      </div>
                      <div
                        class="fs-0 ml20 expanded"
                        style="color: #1890ff"
                        @click="item.isOverTwoLines = false"
                        v-if="item.isOverTwoLines"
                      >
                        {{ $t('ui.expand') }}
                      </div>
                    </div>
                  </div>

                  <div
                    style="
                      height: 0;
                      position: relative;
                      z-index: -999;
                      opacity: 0;
                      height: 0;
                    "
                  >
                    <div class="mt5 text-content" :ref="'content_' + index">
                      <span class="mr10">{{ $t('ui.content') }}</span>
                      <span>{{ item.content }}</span>
                    </div>
                  </div>
                </li>
              </ul>
              <div class="flexCen" v-else>
                {{ $t('customer.noActivitiesToShow') }}
              </div>
            </div>
            <el-divider />
            <div>
              <ul v-if="overList.length > 0">
                <li v-for="(item, index) in overList" :key="index">
                  <div class="flex">
                    <div class="mr20 fs-0">
                      <span style="color: #ff4949; margin-right: 4px">*</span>
                      <span class="primary-link" @click="handlerUpdate(item)">{{
                        selectDictLabel(activity_type, item.activityType)
                      }}</span>
                    </div>
                    <div class="mr20 flow1">
                      <span class="mr5">{{ $t('customer.subject1') }}:</span>
                      <span class="flow1">
                        {{ item.subject }}
                      </span>
                    </div>
                    <div class="mr20 flow1">
                      <span class="mr5"
                        >{{ $t('customer.contactPerson') }}:</span
                      >
                      <span>{{ item.contactPersonName }}</span>
                    </div>
                    <div class="mr20 flow1">
                      <el-icon
                        size="14"
                        color="#409efc"
                        style="cursor: pointer"
                        class="mr5"
                      >
                        <Calendar />
                      </el-icon>
                      <span class="flow1">{{ item.activityTimeStr }}</span>
                    </div>
                    <div>
                      <span>{{ item.completeInfo }}</span>
                    </div>
                  </div>
                </li>
              </ul>
              <div class="flexCen" v-else>
                {{ $t('customer.noPastActivity') }}
              </div>
            </div>
          </el-collapse-item>
        </div>
      </el-collapse>
    </div>

    <addActivityDlg
      ref="addActivityDlg"
      :query="query"
      @onSuccess="$emit('onSuccess')"
    />
  </div>
</template>

<script>
import addActivityDlg from './addActivityDlg'

import { queryActivityListByOpportunityId } from '@/api/salesOpportunity/salesOpportunity'
export default {
  mixins: [],
  props: {
    query: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    addActivityDlg
  },
  data() {
    const vm = this
    return {
      saveKey: '1',
      savePath: 'FomPage',
      rowId: '',
      form: {},
      activeNames: ['1'],
      collapseWarningForBasicInfo: false,
      activity_type: [],
      isOverTwoLines: false,
      awaitList: [],
      overList: []
    }
  },

  created() {
    const { activity_type } = this.useDict('activity_type')
    this.activity_type = activity_type || []
  },
  activated() {},
  computed: {
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    },
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    language() {
      return this.$store.getters.language
    }
  },
  mounted() {
    window.addEventListener('resize', this.checkTextOverflow)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkTextOverflow)
  },
  methods: {
    init() {
      this.getList()
    },
    getList() {
      queryActivityListByOpportunityId({
        salesOpportunityId: this.query.salesOpportunityId,
        ...this.form
      }).then(res => {
        const list = res.data || []
        this.awaitList = list.filter(x => x.activityStatus === '0')
        this.checkTextOverflow()
        this.overList = list.filter(x => x.activityStatus !== '0')
      })
    },
    checkTextOverflow() {
      this.awaitList.forEach((x, i) => {
        this.$nextTick(() => {
          if (
            this.$refs['content_' + i] &&
            typeof x.isOverTwoLines !== 'boolean'
          ) {
            const element = this.$refs['content_' + i][0]
            x.isOverTwoLines = element.clientHeight > 48
          }
        })
      })
    },
    searchForm() {
      this.getList()
    },
    resetSearchForm() {
      this.form = {
        condition: undefined,
        activityType: undefined
      }
      this.getList()
    },
    handleAdd() {
      this.$refs.addActivityDlg.handleAdd()
    },
    handlerUpdate(row) {
      this.$refs.addActivityDlg.handlerUpdate(row.salesOpportunityActivityId)
    },
    // 表单重置
    reset() {
      this.form = {
        condition: undefined,
        activityTypeList: []
      }
      this.activeNames = ['1']
      this.resetForm('form')
    }
  }
}
</script>

<style scoped lang="scss">
.form-card :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}
.form :deep(.el-form-item) {
  margin-bottom: 0;
}
.text-content {
  font-size: 12px;
  line-height: 24px;
}
.flow2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal; /* 确保文本正常换行 */
}

.card {
  position: relative;
  z-index: -999;
  opacity: 0;
  height: 0;
}
.expanded-content {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal; /* 确保文本正常换行 */
  height: 48px;
  overflow: hidden;
}
.expanded {
  cursor: pointer;
  // position: absolute;
  // right: -50px;
  // top: 40px;
}
</style>
