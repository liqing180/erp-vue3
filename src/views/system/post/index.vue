<template>
  <div class="app-container">
    <search-form
      ref="searchForm"
      v-model="queryParams"
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
      @sort-change="handleSortChange"
      @row-dblclick="handleDblclick"
      :max-height="indexTableMaxHeight"
      style="cursor: pointer"
    >
      <el-table-column
        type="index"
        :label="$t('ui.sn')"
        width="60"
        fixed="left"
        align="center"
      >
        <template v-slot="scope">
          <span>{{
            scope.$index + (queryParams.pageNum - 1) * queryParams.pageSize + 1
          }}</span>
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
            :list="scope.row.departmentNameList || []"
          >
            <div class="ellipsis-text">{{ scope.row[item.prop] }}</div>
          </ToolTipShowList>
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
  </div>
</template>

<script>
import { queryPostTreeList } from '@/api/system/post'
import pageMixin from '@/mixins/tableMinx'

export default {
  name: 'Post',
  mixins: [pageMixin],
  data() {
    const vm = this
    return {
      saveKey: '1',
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 岗位表格数据
      tableList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 25,
        condition: undefined,
        postCode: undefined,
        postName: undefined,
        status: undefined
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
      ]
    }
  },
  created() {
    this.createdInitTimer = Date.now()
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
    /** 查询岗位列表 */
    getList() {
      this.loading = true
      let params = { ...this.queryParams }
      params = this.$trimOfObj(params)
      queryPostTreeList(params)
        .then(response => {
          this.tableList = response.rows || []
          this.handlerData(this.tableList)
          this.loading = false
        })
        .catch(() => {
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
    /** 搜索 */
    handleSearchForm() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置 */
    resetSearchForm() {
      const { pageSize } = this.queryParams
      this.queryParams = { pageNum: 1, pageSize }
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
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({
        path: '/organization/addPost',
        query: {
          timeId: +new Date()
        }
      })
    },
    handleDblclick(row, column, event) {
      if (column && column.type === 'selection') {
        return
      }
      if (event?.target?.closest?.('.el-table__expand-icon')) {
        return
      }
      this.handleUpdate(row)
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      const list = this.treeFindPath(
        this.tableList,
        data => data.postId === row.postId
      )
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
    }
  }
}
</script>
