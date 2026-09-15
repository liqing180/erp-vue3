<template>
  <div class="app-container">
    <search-form
      ref="searchForm"
      :value="queryParams"
      :searchData="searchData"
      :handleQuery="handleSearchForm"
      :resetQuery="resetSearchForm"
      :showCustom="false"
      @updateSearchData="updateSearchData"
    />

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['system:post:add']"
          >{{ $t('uiBtn.add') }}</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          size="small"
          @click="handlePositionStructure"
          >{{ $t('menu.positionStructure') }}</el-button
        >
      </el-col>
      <right-toolbar
        :saveKey="saveKey"
        v-model:showSearch="showSearch"
        @queryTable="queryTable"
        :columns="configColumn"
      ></right-toolbar>
    </el-row>

    <el-table
      ref="tables"
      border
      row-key="postId"
      v-loading="loading"
      :data="tableList"
      :default-expand-all="false"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-dblclick="handleUpdate"
      :max-height="tableMaxHeight"
    >
      <!-- <el-table-column
              type="selection"
              width="55"
              align="center"
              v-if="checkPermi(['system:post:remove'])"
            /> -->
      <el-table-column
        type="index"
        :label="$t('ui.sn')"
        width="60"
        fixed="left"
        align="center"
      >
        <template v-slot="scope">
          <!-- <span>{{
            scope.$index + (queryParams.pageNum - 1) * queryParams.pageSize + 1
          }}</span> -->
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="item in visibleColumn"
        :key="item.prop + item.colSortIndex"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :min-width="item.minWidth"
        :show-overflow-tooltip="item.tooltip"
        :fixed="item.fixed"
        :sortable="item.sortable"
        :align="item.align || 'left'"
        header-align="center"
      >
        <template v-slot="scope">
          <ToolTipShowList
            v-if="item.prop === 'departmentNameListShowStr'"
            showLabel="departmentName"
            :list="scope.row.departmentList || []"
          />
          <template v-else-if="item.prop === 'status'">
            <el-tag v-if="scope.row.status === '0'">{{
              $t('uiBtn.active')
            }}</el-tag>
            <el-tag v-if="scope.row.status === '1'" type="danger">
              {{ $t('uiBtn.inactive') }}
            </el-tag>
          </template>
          <template v-else-if="item.prop === 'createdTime'">{{
            parseTime(scope.row.createdTime, fmtForYmdhms)
          }}</template>
          <template v-else-if="item.prop === 'modifiedTime'">{{
            parseTime(scope.row.modifiedTime, fmtForYmdhms)
          }}</template>

          <template v-else>{{ scope.row[item.prop] }}</template>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('ui.action')"
        align="center"
        class-name="small-padding fixed-width"
        width="100"
        fixed="right"
      >
        <template v-slot="scope">
          <div class="flexCen">
            <div style="width: 26px; height: 20px">
              <el-icon
                class="primary-pointer mr5"
                :size="20"
                :title="$t('uiBtn.edit')"
                v-if="editAuth"
                @click="handleUpdate(scope.row)"
              >
                <Edit />
              </el-icon>
            </div>
            <div style="width: 26px; height: 20px">
              <el-icon
                class="primary-pointer"
                :size="20"
                :title="$t('uiBtn.add')"
                v-if="addAuth && scope.row.customIndex < 30"
                @click="addTblRow(scope.row)"
              >
                <Plus />
              </el-icon>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination
      :saveKey="saveKey"
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    /> -->
  </div>
</template>

<script>
import {
  queryPostTreeList,
  delPost,
  addPost,
  updatePost,
  exportPost,
  queryPostCanSelectDepartment
} from '@/api/system/post'
import pageMixin from '@/mixins/tableMinx'

export default {
  name: 'Post',
  mixins: [pageMixin],
  data() {
    const vm = this
    return {
      saveKey: '1',
      btnLoading: false,
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 岗位表格数据
      tableList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        // pageNum: 1,
        // pageSize: 10,
        condition: undefined,
        postCode: undefined,
        postName: undefined,
        status: undefined
      },
      // 表单参数
      form: {
        departmentIdList: []
      },
      // 表单校验
      rules: {
        departmentIdList: [
          {
            type: 'array',
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.postName')),
            trigger: 'blur'
          }
        ],
        postName: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.postName')),
            trigger: 'blur'
          }
        ],
        postCode: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.postCode')),
            trigger: 'blur'
          }
        ],
        postSort: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.sort')),
            trigger: 'blur'
          }
        ]
      },
      searchData: [
        {
          name: 'condition',
          type: 'InputEle',
          placeholder: `${vm.$t('ui.postName')}`
        }
      ],
      columns: [
        {
          prop: 'postName',
          label: vm.$t('ui.postName'),
          visible: true,
          minWidth: 480,
          tooltip: true
        },
        {
          prop: 'departmentNameListShowStr',
          label: vm.$t('ui.deptName'),
          visible: true,
          minWidth: 220,
          tooltip: false
        },
        {
          prop: 'createdBy',
          label: vm.$t('ui.createdBy'),
          minWidth: 160,
          visible: true,
          tooltip: true
        },
        {
          prop: 'createdTime',
          label: vm.$t('ui.createdTime'),
          minWidth: 160,
          visible: true,
          tooltip: true
        },
        {
          prop: 'modifiedBy',
          label: vm.$t('ui.modifiedBy'),
          minWidth: 160,
          visible: true,
          tooltip: true
        },
        {
          prop: 'modifiedTime',
          label: vm.$t('ui.modifiedTime'),
          minWidth: 160,
          visible: true,
          tooltip: true
        }
      ],
      props: {
        multiple: true,
        value: 'id',
        label: 'name',
        children: 'child',
        emitPath: false,
        checkStrictly: true
      },
      departmentList: [],
      buttonRef: undefined
    }
  },
  created() {
    this.createdInitTimer = Date.now()
    // this.queryParams.pageSize = this.$$initPageSize(this.saveKey)
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.getList()
  },
  activated() {
    if (Date.now() - this.createdInitTimer < 1000) return
    this.getList()
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['system:post:edit'])
    },
    addAuth() {
      return this.checkPermi(['system:post:add'])
    },
    comDisFrom() {
      if (this.form.postId) {
        return !this.editAuth
      }
      return false
    }
  },
  methods: {
    handlePositionStructure() {
      this.$router.push({
        path: '/organization/positionStructure',
        query: {
          timeId: +new Date()
        }
      })
    },
    showPop(e, row, type) {
      console.log(e, this.$refs.popoverRef)
      this.buttonRef = e
      this.$refs.popoverRef.delayHide()

      const departmentNameList = row.departmentNameList || []
      const list = departmentNameList.map(x => {
        return {
          label: x
        }
      })
      const params = {
        labelKey: 'label',
        list
      }
      if (list.length > 0 && this.$refs.ToolTipShowList) {
        this.$refs.ToolTipShowList.showPop(e, params)
      }
    },
    hidePop(e) {
      this.$refs.ToolTipShowList && this.$refs.ToolTipShowList.hidePop(e)
    },

    inputNumberChange(code) {
      this.$refs.form.validateField(code)
    },
    /** 查询岗位列表 */
    getList() {
      this.loading = true
      let params = { ...this.queryParams }
      params = this.$trimOfObj(params)
      queryPostTreeList(params).then(response => {
        this.tableList = response.data || []
        this.handlerData(this.tableList)
        this.total = response.total
        this.loading = false
      })
    },
    handlerData(data, index = 0) {
      data.forEach(x => {
        x.customIndex = index + 1
        if (x.children && x.children.length > 0) {
          this.handlerData(x.children, x.customIndex)
        }
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        postId: undefined,
        postCode: undefined,
        postName: undefined,
        postSort: 0,
        status: '0',
        remark: undefined,
        createdBy: this.$store.state.user.nickName
      }
      this.resetForm('form')
    },
    /** 搜索 */
    handleSearchForm() {
      // this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置 */
    resetSearchForm() {
      // const { pageSize } = this.queryParams
      // this.queryParams = { pageNum: 1, pageSize }
      this.queryParams = {}
      this.$refs.tables.clearSort()
      this.getList()
    },
    updateSearchData(e) {
      if (e.childType === 'select') {
        this.searchData[e.index].selectId = e.value
        this.searchData[e.index].date = []
      } else {
        this.searchData[e.index].date = e.value
      }
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.postId)

      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      // this.reset()
      // this.open = true
      // this.title = this.$t('ui.position')
      // this.queryPostCanSelectDepartment()
      this.$router.push({
        path: '/organization/addPost',
        query: {
          timeId: +new Date()
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row, column) {
      if (column && column.type === 'selection') {
        return
      }
      const list = this.treeFindPath(
        this.tableList,
        data => data.postId === row.postId
      )
      console.log(list, '===')
      if (list.length >= 2) {
        this.$router.push({
          path: '/organization/editPost',
          query: {
            postParentId: list[list.length - 2].postId,
            postParentName: list[list.length - 2].postName,
            postId: row.postId,
            timeId: +new Date()
          }
        })
      } else {
        this.$router.push({
          path: '/organization/editPost',
          query: {
            postId: row.postId,
            timeId: +new Date()
          }
        })
      }
    },
    treeFindPath(tree, func, path = []) {
      if (!tree) return []
      for (const data of tree) {
        // 这里按照你的需求来存放最后返回的内容吧
        path.push(data)
        if (func(data)) return path
        if (data.children) {
          const findChildren = this.treeFindPath(data.children, func, path)
          if (findChildren.length) return findChildren
        }
        path.pop()
      }
      return []
    },
    addTblRow(row) {
      this.$router.push({
        path: '/organization/addPost',
        query: {
          timeId: +new Date(),
          postParentId: row.postId,
          postParentName: row.postName,
          deptIds: (row.departmentIdList || []).join(',')
        }
      })
    },
    // 查部门
    queryPostCanSelectDepartment() {
      queryPostCanSelectDepartment({}).then(res => {
        const fromData = res.data || []
        fromData.forEach(x => {
          if (x.type !== 5 && x.type !== 6) {
            x.disabled = true
          }
          if (
            this.form.postId &&
            this.form.departmentIdList.indexOf(x.id) !== -1
          ) {
            x.disabled = true
          }
          x.children = this.disabledId(x)
        })
        console.log(fromData, '===')
        this.departmentList = JSON.parse(JSON.stringify(fromData))
      })
    },
    disabledId(data) {
      if (data.children && data.children.length > 0) {
        data.children.forEach(k => {
          if (k.type !== 5 && k.type !== 6) {
            k.disabled = true
          }
          if (
            this.form.postId &&
            this.form.departmentIdList.indexOf(k.id) !== -1
          ) {
            k.disabled = true
            console.log(k, '=====')
          }
          k.children = this.disabledId(k)
        })
        return data.children
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs.form.validate(valid => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))
          // params.departmentIdList = params.departmentIdList.map((item) => {
          //   return item[item.length - 1]
          // })

          if (params.postId != undefined) {
            this.btnLoading = true
            updatePost(params)
              .then(response => {
                this.btnLoading = false
                this.$modal.msgSuccess(this.$t('ui.modifiedSuccess'))
                this.open = false
                this.getList()
              })
              .catch(() => {
                this.btnLoading = false
              })
          } else {
            this.btnLoading = true
            addPost(params)
              .then(response => {
                this.btnLoading = false
                this.$modal.msgSuccess(this.$t('ui.addSuccess'))
                this.open = false
                this.getList()
              })
              .catch(() => {
                this.btnLoading = false
              })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const postIds = row.postId || this.ids
      this.$modal
        .confirm(this.$t('ui.delConfirm').replace('$1', postIds))
        .then(function () {
          return delPost(postIds)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess(this.$t('ui.deleteSuccess'))
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$modal
        .confirm(this.$t('ui.exportPostConfirm'))
        .then(() => {
          this.exportLoading = true
          return exportPost(queryParams)
        })
        .then(response => {
          this.$download.name(response.msg)
          this.exportLoading = false
        })
        .catch(() => {})
    }
  },
  emits: ['update:value']
}
</script>
