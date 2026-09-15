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
      :isBtn="false"
    />

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          size="small"
          @click="handleAdd"
          v-hasPermi="['system:menu:add']"
          >{{ $t('uiBtn.add') }}</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          icon="Sort"
          size="small"
          @click="toggleExpandAll"
          >{{ $t('ui.expand') }}</el-button
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
      v-if="refreshTable"
      v-loading="loading"
      :data="tableList"
      row-key="menuId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      @row-dblclick="handleUpdate"
    >
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
          <template v-if="item.prop === 'status'">
            <el-tag v-if="scope.row.status === '0'">{{
              $t('uiBtn.active')
            }}</el-tag>
            <el-tag v-if="scope.row.status === '1'" type="danger">
              {{ $t('uiBtn.inactive') }}
            </el-tag>
          </template>
          <svg-icon
            v-else-if="item.prop === 'icon'"
            :icon-class="scope.row[item.prop]"
          />
          <span v-else-if="item.prop === 'menuName'">{{
            $t(`menu.${scope.row.menuName}`)
          }}</span>

          <dict-tag
            v-else-if="item.prop === 'sex'"
            :options="sys_user_sex"
            :value="scope.row[item.prop]"
          />
          <template v-else-if="item.prop === 'createTime'">{{
            parseTime(scope.row[item.prop])
          }}</template>
          <template v-else-if="item.prop === 'updateTime'">{{
            parseTime(scope.row[item.prop])
          }}</template>

          <template v-else>{{ scope.row[item.prop] }}</template>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('ui.action')"
        align="center"
        class-name="small-padding fixed-width"
        min-width="180"
        fixed="right"
        v-if="
          checkPermi([
            'system:menu:edit',
            'system:menu:add',
            'system:menu:remove'
          ])
        "
      >
        <template v-slot="scope">
          <el-button
            size="small"
            link
            v-hasPermi="['system:menu:edit']"
            icon="Edit"
            type="primary"
            @click="handleUpdate(scope.row)"
            >{{ $t('uiBtn.edit') }}</el-button
          >
          <el-button
            size="small"
            link
            type="primary"
            icon="Plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:menu:add']"
            >{{ $t('uiBtn.add') }}</el-button
          >
          <el-button
            size="small"
            link
            icon="Delete"
            style="color: #f56c6c"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:menu:remove']"
            >{{ $t('uiBtn.delete') }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      draggable
      :title="title"
      v-model="open"
      width="1000px"
      append-to-body
    >
      <el-form
        :disabled="comDisFrom"
        ref="form"
        :model="form"
        :rules="rules"
        label-width="200px"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('ui.parentMenu')">
              <el-tree-select
                v-model="form.parentId"
                :data="menuOptions"
                :props="{
                  value: 'menuId',
                  label: 'menuName',
                  children: 'children'
                }"
                value-key="menuId"
                placeholder=" "
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('ui.menuType')" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio value="M">{{ $t('ui.contents') }}</el-radio>
                <el-radio value="C">{{ $t('ui.menu') }}</el-radio>
                <el-radio value="F">{{ $t('ui.button') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              v-if="form.menuType != 'F'"
              :label="$t('ui.menuIcon')"
            >
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" @selected="selected" />
                <template v-slot:reference>
                  <el-input
                    v-model="form.icon"
                    :placeholder="$t('ui.clickSelectIcon')"
                    readonly
                  >
                    <template v-slot:prefix>
                      <svg-icon
                        v-if="form.icon"
                        :icon-class="form.icon"
                        class="el-input__icon"
                        style="height: 20px; width: 16px"
                      />
                      <Search
                        v-else
                        class="Search el-input__icon"
                        style="height: 20px; width: 16px"
                      />
                    </template>
                  </el-input>
                </template>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('menu.languagePackKey')" prop="menuName">
              <el-input v-model="form.menuName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('ui.sort')" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                :precision="0"
                v-thousandSplit="{ precision: 0 }"
                controls-position="right"
                :min="0"
                :max="9999"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('ui.menuName')" prop="menuName">
              <el-input
                :value="form.menuName ? $t(`menu.${form.menuName}`) : ''"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'">
              <template v-slot:label>
                <span class="flexStart">
                  <el-tooltip :content="$t('ui.isFrameTip')" placement="top">
                    <InfoFilled
                      style="width: 16px; height: 16px; margin-right: 5px"
                    />
                  </el-tooltip>
                  {{ $t('ui.isFrame') }}
                </span>
              </template>
              <el-radio-group v-model="form.isFrame">
                <el-radio value="0">{{ $t('uiBtn.yes') }}</el-radio>
                <el-radio value="1">{{ $t('uiBtn.no') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" prop="path">
              <template v-slot:label>
                <span class="flexStart">
                  <el-tooltip :content="$t('ui.routePathTip')" placement="top">
                    <InfoFilled
                      style="width: 16px; height: 16px; margin-right: 5px"
                    />
                  </el-tooltip>
                  {{ $t('ui.routePath') }}
                </span>
              </template>
              <el-input v-model="form.path" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="component">
              <template v-slot:label>
                <span class="flexStart">
                  <el-tooltip
                    :content="$t('ui.componentUrlTip')"
                    placement="top"
                  >
                    <el-icon :size="20">
                      <InfoFilled
                        style="width: 16px; height: 16px; margin-right: 5px"
                      />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('ui.componentUrl') }}
                </span>
              </template>
              <el-input v-model="form.component" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-input v-model="form.perms" maxlength="100" />
              <template v-slot:label>
                <span class="flexStart">
                  <el-tooltip :content="$t('ui.permsTip')" placement="top">
                    <el-icon :size="20">
                      <InfoFilled
                        style="width: 16px; height: 16px; margin-right: 5px"
                      />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('ui.perms') }}
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType == 'C'">
              <el-input v-model="form.query" maxlength="255" />
              <template v-slot:label>
                <span class="flexStart">
                  <el-tooltip :content="$t('ui.routeQueryTip')" placement="top">
                    <el-icon :size="20">
                      <InfoFilled
                        style="width: 16px; height: 16px; margin-right: 5px"
                      />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('ui.routeQuery') }}
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType == 'C'">
              <template v-slot:label>
                <span class="flexStart">
                  <el-tooltip :content="$t('ui.isCacheTip')" placement="top">
                    <el-icon :size="20">
                      <InfoFilled
                        style="width: 16px; height: 16px; margin-right: 5px"
                      />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('ui.isCache') }}
                </span>
              </template>
              <el-radio-group v-model="form.isCache">
                <el-radio value="0">{{ $t('ui.cache') }}</el-radio>
                <el-radio value="1">{{ $t('ui.noCache') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'">
              <template v-slot:label>
                <span class="flexStart">
                  <el-tooltip
                    :content="$t('ui.visibleStatusTip')"
                    placement="top"
                  >
                    <el-icon :size="20">
                      <InfoFilled
                        style="width: 16px; height: 16px; margin-right: 5px"
                      />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('ui.visibleStatus') }}
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in sys_show_hide"
                  :key="dict.value"
                  :value="dict.value"
                  >{{ dict.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="`${$t('ui.createdBy')}`" prop="createBy">
              <el-input
                v-model="form.createBy"
                :title="form.createBy"
                disabled
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('ui.createdTime')}`">
              <el-date-picker
                :model-value="form.createTime"
                :format="fmtForYmdhms"
                :style="{ width: '100%' }"
                disabled
                placeholder=""
                clearable
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('ui.modifiedBy')">
              <el-input disabled v-model="form.updateBy" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="`${$t('ui.modifiedTime')}`">
              <el-date-picker
                :model-value="form.modifiedTime"
                :format="fmtForYmdhms"
                :style="{ width: '100%' }"
                disabled
                placeholder=""
                clearable
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'">
              <template v-slot:label>
                <span class="flexStart">
                  <el-tooltip :content="$t('ui.menuStatusTip')" placement="top">
                    <el-icon :size="20">
                      <InfoFilled
                        style="width: 16px; height: 16px; margin-right: 5px"
                      />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('ui.isActive') }}
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio key="0" value="0">{{ $t('uiBtn.active') }}</el-radio>
                <el-radio key="1" value="1">{{
                  $t('uiBtn.inactive')
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="cancel">{{ $t('uiBtn.back') }}</el-button>
          <el-button
            v-if="!comDisFrom"
            type="primary"
            @click="submitForm"
            :loading="btnLoading"
            >{{ $t('uiBtn.submit') }}</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  listMenu,
  getMenu,
  delMenu,
  addMenu,
  updateMenu
} from '@/api/system/menu'
import IconSelect from '@/components/IconSelect'
import pageMixin from '@/mixins/tableMinx'
export default {
  mixins: [pageMixin],
  components: { IconSelect },
  data() {
    const vm = this
    return {
      sys_user_sex: [],
      sys_show_hide: [],
      saveKey: '1',
      btnLoading: false,
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 菜单表格树数据
      tableList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部折叠
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        menuName: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.menuName')),
            trigger: 'blur'
          }
        ],
        orderNum: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace('$1', this.$t('ui.sort')),
            trigger: 'blur'
          }
        ],
        path: [
          {
            required: true,
            message: this.$t('ui.reqMsg').replace(
              '$1',
              this.$t('ui.routePath')
            ),
            trigger: 'blur'
          }
        ]
      },
      searchData: [
        {
          name: 'status',
          label: vm.$t('ui.isActive'),
          type: 'SelectEle',
          selectValue: 'value',
          selectLabel: 'label',
          selectData: [
            { label: vm.$t('uiBtn.active'), value: '0' },
            { label: vm.$t('uiBtn.inactive'), value: '1' }
          ]
        }
      ],
      columns: [
        {
          prop: 'menuName',
          label: vm.$t('ui.menuName'),
          visible: true,
          minWidth: 240,
          tooltip: true,
          align: 'left',
          fixed: true
        },
        {
          prop: 'icon',
          label: vm.$t('ui.icon'),
          visible: true,
          minWidth: 100,
          tooltip: true
        },
        {
          prop: 'orderNum',
          label: vm.$t('ui.sort'),
          visible: true,
          minWidth: 100,
          tooltip: true
        },
        {
          prop: 'perms',
          label: vm.$t('ui.perms'),
          visible: true,
          minWidth: 300,
          tooltip: true
        },
        {
          prop: 'component',
          label: vm.$t('ui.componentUrl'),
          visible: true,
          minWidth: 160,
          tooltip: true
        },
        {
          prop: 'status',
          label: vm.$t('ui.isActive'),
          visible: true,
          minWidth: 140,
          tooltip: true
        },
        {
          prop: 'createBy',
          label: vm.$t('ui.createdBy'),
          minWidth: 160,
          visible: true,
          tooltip: true
        },
        {
          prop: 'createTime',
          label: vm.$t('ui.createdTime'),
          minWidth: 160,
          visible: true,
          tooltip: true
        },
        {
          prop: 'updateBy',
          label: vm.$t('ui.modifiedBy'),
          minWidth: 160,
          visible: true,
          tooltip: true
        },
        {
          prop: 'updateTime',
          label: vm.$t('ui.modifiedTime'),
          minWidth: 160,
          visible: true,
          tooltip: true
        }
      ]
    }
  },
  computed: {
    fmtForYmdhms() {
      return this.$store.getters.fmtForYmdhms
    },
    editAuth() {
      return this.checkPermi(['system:menu:edit'])
    },
    comDisFrom() {
      if (this.form.menuId) {
        return !this.editAuth
      }
      return false
    }
  },
  created() {
    const { sys_user_sex, sys_show_hide } = this.useDict(
      'sys_user_sex',
      'sys_show_hide'
    )
    this.sys_user_sex = sys_user_sex || []
    this.sys_show_hide = sys_show_hide || []
    this.$$initColumnVisible(this.saveKey, this.columns)
    this.getList()
  },

  methods: {
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      let params = { ...this.queryParams }
      params = this.$trimOfObj(params)
      listMenu(params).then(response => {
        this.tableList = this.handleTree(response.data, 'menuId')
        this.loading = false
      })
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      if (node.menuId === 0) {
        return {
          id: node.menuId,
          label: node.menuName,
          children: node.children
        }
      }
      return {
        id: node.menuId,
        label: this.$t(`menu.${node.menuName}`),
        children: node.children
      }
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      listMenu().then(response => {
        this.menuOptions = []
        const menu = {
          menuId: 0,
          menuName: this.$t('ui.mainCategory'),
          children: []
        }
        menu.children = this.handleTree(response.data, 'menuId')
        this.menuOptions.push(menu)
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
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: 'M',
        orderNum: undefined,
        isFrame: '1',
        isCache: '0',
        visible: '0',
        status: '0',
        createBy: this.$store.state.user.nickName
      }
      this.resetForm('form')
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
    handleAdd(row) {
      this.reset()
      this.getTreeselect()
      if (row != null && row.menuId) {
        this.form.parentId = row.menuId
      } else {
        this.form.parentId = 0
      }
      this.open = true
      this.title = this.$t('ui.menu')
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row, column, even) {
      try {
        if (
          even &&
          even.target._prevClass.indexOf('el-icon-arrow-right') !== -1
        ) {
          return
        }
      } catch (err) {}
      this.reset()
      this.getTreeselect()
      getMenu(row.menuId).then(response => {
        this.form = response.data
        this.open = true
        this.title = this.$t('ui.menu')
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.menuId != undefined) {
            this.btnLoading = true
            updateMenu(this.form)
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
            addMenu(this.form)
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
      this.$modal
        .confirm(this.$t('ui.delMenuConfirm').replace('$1', row.menuName))
        .then(function () {
          return delMenu(row.menuId)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess(this.$t('ui.deleteSuccess'))
        })
        .catch(() => {})
    }
  }
}
</script>
