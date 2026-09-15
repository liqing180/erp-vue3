<template>
  <div>
    <div @click="addNews" style="height: 50px" v-show="!visible">
      <el-input placeholder="" readonly value="" style="height: 50px">
      </el-input>
    </div>

    <el-form
      :model="form"
      :rules="rules"
      label-width="140px"
      :disabled="comDisFrom"
      ref="form"
      v-show="visible"
      style="padding: 20px; border: 1px solid #ccc"
    >
      <el-row>
        <el-col :span="24">
          <el-form-item
            :label="`${$t('customer.followupContent')}`"
            prop="content"
          >
            <el-input
              v-model="form.content"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              resize="none"
              show-word-limit
              :maxlength="3000"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" v-if="false">
          <el-form-item
            :label="`${$t('customer.nextContactTime')}`"
            prop="nextFollowUpDay"
          >
            <div class="flex">
              <el-input-number
                v-model="form.nextFollowUpDay"
                :precision="0"
                v-thousandSplit="{ precision: 0 }"
                type="number"
                class="form-wd textleft"
                :min="1"
                :max="999"
                @change="inputNumberChange('nextFollowUpDay')"
                style="width: 150px"
                controls-position="right"
                :disabled="!!form.followUpId"
              />
              <div style="margin: 0 10px">{{ $t('customer.day') }}</div>
              <el-date-picker
                v-model="form.nextFollowUpDate"
                :editable="false"
                type="date"
                :format="fmtForYmd"
                value-format="x"
                class="form-wd"
                placeholder
                style="width: 100%"
                :disabled-date="validityDaysPickerOptions.disabledDate"
                @change="nextContactTimeDateChange"
                :disabled="!!form.followUpId"
              ></el-date-picker>
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item
            :label="$t('customer.followupMethod')"
            prop="followUpMethod"
          >
            <el-select
              v-model="form.followUpMethod"
              placeholder=""
              style="width: 100%"
              clearable
            >
              <el-option
                v-for="dict in follow_up_method"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-show="form.imageFileList && form.imageFileList.length > 0">
        <el-col :span="24">
          <el-form-item label="">
            <myUploadTableIcon
              :limit="9"
              ref="myUploadTableIcon"
              :accept="['.jpg', '.jpeg', '.png', '.bmp', '.webp']"
              @onSuccess="updateFileList"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item :label="`${$t('ui.attachment')}`" prop="attachment">
            <div class="w100">
              <myUploadNews ref="uploadRef" />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="">
            <el-icon
              style="color: #666; font-size: 20px; cursor: pointer"
              class="mr20"
              @click="$refs.myUploadTableIcon.handleUpload()"
            >
              <PictureFilled />
            </el-icon>

            <el-icon
              style="color: #666; font-size: 20px; cursor: pointer"
              @click="$refs.uploadRef.handleUpload()"
            >
              <FolderOpened />
            </el-icon>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="">
            <el-button size="small" @click="visible = false"
              >{{ $t('uiBtn.cancel') }}
            </el-button>
            <el-button type="primary" size="small" @click="submitForm"
              >{{ $t('customer.release') }}
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="mt20">{{ $t('customer.followupRecords') }}</div>

    <ul class="card mt10">
      <li
        class="item fz-12"
        style="padding: 20px 0"
        v-for="(item, index) in tableList"
        :key="index"
      >
        <div class="flexSb">
          <div class="flexStart">
            <div class="mr10">{{ item.createdBy }}</div>
            <el-tag type="info" class="mr10" v-if="item.followUpMethod">{{
              selectDictLabel(follow_up_method, item.followUpMethod)
            }}</el-tag>
          </div>
          <div style="margin-right: 50px" v-if="item.isCanUpdate === '1'">
            <el-icon size="18" style="cursor: pointer" @click="editNews(item)">
              <EditPen />
            </el-icon>
          </div>
        </div>
        <div class="mt10 fz-12 c-6">
          {{ parseTime(item.createdTime, fmtForYmdhms) }}
        </div>
        <div class="mt10 fz-12 c-6">
          {{ item.checkInAddress }}
        </div>
        <div class="mt10">{{ item.content }}</div>
        <div
          class="mt10"
          v-show="item.imageFileList && item.imageFileList.length > 0"
        >
          <myUploadTableIcon
            :limit="9"
            :ref="'myUploadTableIcon_' + index"
            :accept="['.jpg', '.jpeg', '.png', '.bmp', '.webp']"
            :disabled="true"
          />
        </div>
        <div
          class="flex mt10"
          v-show="(item.attachmentFileList || []).length > 0"
        >
          <el-icon
            class="mr10"
            style="
              color: #666;
              font-size: 20px;
              cursor: pointer;
              height: 32px;
              line-height: 32px;
            "
          >
            <FolderOpened />
          </el-icon>
          <myUploadNews
            :ref="'uploadRef_' + index"
            :disabled="true"
            :isView="true"
          />
        </div>

        <div class="flexStart mt10" v-if="item.salesOpportunityActivityName">
          <el-icon class="mr5" style="color: #666; font-size: 20px">
            <Link />
          </el-icon>
          <span class="mr10 fz-12 c-6"
            >{{ $t('customer.associatedActivity') }} ：</span
          >
          <span>{{ item.salesOpportunityActivityName }}</span>
        </div>
      </li>
    </ul>

    <pagination
      :saveKey="saveKey"
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import myUploadTableIcon from '@/components/Common/htz-image-upload/my-upload-table-icon.vue'
import myUploadNews from '@/components/Common/htz-image-upload/my-upload-news.vue'
import {
  getFollowUpList,
  saveFollowUp,
  updateFollowUp
} from '@/api/leads/leads'
export default {
  components: {
    myUploadTableIcon,
    myUploadNews
  },
  props: {
    comDisFrom: {
      type: [Boolean],
      default: false
    },
    // 数据id
    documentId: {
      type: String
    },
    // 数据编号
    documentNo: {
      type: String
    },
    // 业务单据类型(1:线索,2:商机,3：客户)
    documentType: {
      type: String,
      default: '1'
    }
  },
  data() {
    const vm = this
    return {
      saveKey: '11',
      // 总条数
      total: 0,
      /* 表格表单部分 */
      form: {
        content: '',
        imageFileList: [],
        nextFollowUpDay: 30
      },
      rules: {
        content: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur', 'change']
          }
        ],
        nextFollowUpDay: [
          {
            required: true,
            pattern: new RegExp(/^(?!(\s+$))/g),
            message: this.$t('ui.reqMsg'),
            trigger: ['blur']
          }
        ]
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25
      },
      validityDaysPickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now()
        }
      },
      visible: false,
      btnLoading: false,
      follow_up_method: [],
      tableList: []
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    fmtForYmd() {
      return this.$store.getters.fmtForYmd
    }
  },
  mounted() {},
  methods: {
    init() {
      const { follow_up_method } = this.useDict('follow_up_method')
      this.follow_up_method = follow_up_method || []
      this.getList()
    },
    getList() {
      getFollowUpList({
        documentType: this.documentType,
        documentId: this.documentId,
        ...this.queryParams
      }).then(response => {
        this.tableList = response.rows
        this.tableList.forEach((x, i) => {
          this.$nextTick(() => {
            if (this.$refs['uploadRef_' + i]) {
              this.$refs['uploadRef_' + i][0].initFileList(
                x.attachmentFileList || []
              )
            }
            if (this.$refs['myUploadTableIcon_' + i]) {
              this.$refs['myUploadTableIcon_' + i][0].initFileList(
                x.imageFileList || []
              )
            }
          })
        })
        this.total = response.total

        this.loading = false
      })
    },
    updateFileList() {
      const myFileIds = this.$refs.myUploadTableIcon.getFileIds()
      this.form.imageFileList = myFileIds
    },
    // 下次联系时间
    nextContactTimeDateChange() {
      const current = this.appointTime(Date.now(), '00:00:00')
      const { nextFollowUpDate } = this.form
      if (nextFollowUpDate) {
        const nextFollowUpDay = (nextFollowUpDate - current) / 24 / 3600 / 1000
        this.form.nextFollowUpDay = nextFollowUpDay
      } else {
        this.form.nextFollowUpDay = undefined
      }
      this.$refs.form && this.$refs.form.validateField('nextFollowUpDay')
    },
    // 下次联系时间
    inputNumberChange(code) {
      const { nextFollowUpDay } = this.form
      const current = this.appointTime(Date.now(), '00:00:00')
      if (nextFollowUpDay) {
        this.form.nextFollowUpDate =
          current + nextFollowUpDay * 24 * 3600 * 1000
      } else {
        this.form.nextFollowUpDate = undefined
      }
      this.$refs.form && this.$refs.form.validateField(code)
    },
    // 新增动态
    addNews() {
      this.reset()
      // this.inputNumberChange('nextFollowUpDay')
      this.visible = true
    },
    // 修改动态
    editNews(row) {
      this.reset()
      this.form = JSON.parse(JSON.stringify(row))
      this.visible = true
      this.$nextTick(() => {
        if (this.$refs.uploadRef) {
          this.$refs.uploadRef.initFileList(this.form.attachmentFileList || [])
        }
        if (this.$refs.myUploadTableIcon) {
          this.$refs.myUploadTableIcon.initFileList(
            this.form.imageFileList || []
          )
        }
      })
    },
    reset() {
      this.form = {
        content: '',
        imageFileList: [],
        nextFollowUpDay: 30
      }
      if (this.$refs.uploadRef) {
        this.$refs.uploadRef.initFileList([])
      }
      if (this.$refs.myUploadTableIcon) {
        this.$refs.myUploadTableIcon.initFileList([])
      }
      this.resetForm('form')
    },
    closed() {
      this.btnLoading = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const fileIds = this.$refs.uploadRef.getFileIds()
          if (fileIds === false) {
            return
          }
          const fileIds1 = this.$refs.myUploadTableIcon.getFileIds()
          if (fileIds1 === false) {
            return
          }

          let params = this.$trimOfObj(JSON.parse(JSON.stringify(this.form)))
          params.attachmentFileList = fileIds
          params.imageFileList = fileIds1
          params.documentId = this.documentId
          params.documentType = this.documentType
          params.documentNo = this.documentNo

          this.$modal
            .confirm(this.$t('ui.submitPageConfirm'))
            .then(() => {
              if (params.followUpId) {
                return updateFollowUp(params)
              }
              return saveFollowUp(params)
            })
            .then(response => {
              this.$modal.msgSuccess(this.$t('ui.submitPageSuccess'))
              this.visible = false
              this.queryParams.pageNum = 1
              this.getList()
            })
            .catch(() => {})
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  max-height: 50vh;
  overflow: hidden;
  overflow-y: auto;
}
.item {
  border-top: 1px solid #ccc;
}
.item:first-child {
  border-top: none;
}
</style>
