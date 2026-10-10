<template>
  <FormPageLayout>
    <template v-slot:btn>
      {{ form.roleName }}
    </template>
    <template v-slot:content>
      <div class="form-card">
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane :label="$t('organization.accessPermissions')" name="0">
            <div class="tree-page">
              <el-input placeholder="" v-model="filterText" clearable>
              </el-input>
              <el-tree
                ref="tree"
                :data="fromData"
                show-checkbox
                :default-expand-all="false"
                :default-expanded-keys="fromData[0] && [fromData[0].id]"
                node-key="id"
                :check-strictly="true"
                empty-text="No Data"
                :render-content="powerRenderContent"
                :props="{
                  children: 'child',
                  label: 'name'
                }"
                class="tree"
                :filter-node-method="filterNode"
                style="font-size: 14px; padding-bottom: 20px"
              ></el-tree>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('organization.warehouse')" name="1">
            <div class="tree-page">
              <warehouse :formData="{ ...form, ...query }" ref="warehouse" />
            </div>
          </el-tab-pane>
          <el-tab-pane :label="$t('organization.vendor')" name="2">
            <div style="min-height: calc(100vh - 260px); padding: 0 20px">
              <vendor
                :formData="{ ...form, ...query }"
                :companyList="companyList"
                ref="vendor"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
        <div style="text-align: center; padding-bottom: 20px">
          <el-button @click="cancel">{{ $t('uiBtn.back') }}</el-button>
          <el-button
            type="primary"
            @click="submitForm"
            v-if="activeName !== '2'"
            >{{ $t('uiBtn.submit') }}
          </el-button>
        </div>
      </div>
    </template>
  </FormPageLayout>
</template>

<script>
import {
  getAccessPermissions,
  getRole,
  getRoleDataPermissionsType,
  updateRoleAccessPermissions,
  updateRoleDpForWarehouse,
  getBranchCompanyList
} from '@/api/organization/role'
import warehouse from '@/views/organization/role/warehouse'
import vendor from '@/views/organization/role/vendor'

export default {
  name: 'AccessPermissions',
  props: {},
  components: {
    warehouse,
    vendor
  },
  data() {
    return {
      activeName: '0',
      fromData: [],
      companyList: [],
      roleId: '',
      form: {},
      query: {},
      filterText: '',
      checkedKeys: [],
      timeId: ''
    }
  },
  computed: {},
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.roleId = this.$route.query.roleId
    this.timeId = this.$route.query.timeId

    this.getAccessPermissions()
    this.getRoleDataPermissionsType()
    this.getBranchCompanyList()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.roleId = this.$route.query.roleId
      this.timeId = this.$route.query.timeId
      this.getAccessPermissions()
      this.getRoleDataPermissionsType()
      this.getBranchCompanyList()
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      // return data.name.indexOf(value) !== -1
      const text = value.toUpperCase()
      return data.name.toUpperCase().indexOf(text) !== -1
    },
    handleClick() {
      if (this.activeName === '0') {
        this.getAccessPermissions()
        this.getRoleDataPermissionsType()
      } else if (this.activeName === '1') {
        this.$refs.warehouse && this.$refs.warehouse.getList()
      } else if (this.activeName === '2') {
        this.$refs.vendor && this.$refs.vendor.getList()
      }
    },
    getRoleDataPermissionsType() {
      getRoleDataPermissionsType(this.roleId).then(res => {
        this.query = res.data
      })
    },
    getBranchCompanyList() {
      getBranchCompanyList().then(res => {
        this.companyList = res.data || []
      })
    },
    getAccessPermissions() {
      getAccessPermissions({ roleId: this.roleId }).then(res => {
        const fromData = res.userData || []
        this.fromData = JSON.parse(JSON.stringify(fromData))
        this.checkedKeys = res.checkedKeys || []

        this.$nextTick(() => {
          this.$refs.tree?.setCheckedKeys(this.checkedKeys)
        })
        this.getRole()
      })
    },
    getRole() {
      getRole(this.roleId).then(res => {
        this.form = res.data
      })
    },
    powerRenderContent(h, { node, data }) {
      let style = ''
      if (data.type === 1) {
        style = 'color:#20A0FF'
      } else if (data.type === 2) {
        style = 'color:#FF4949'
      }
      return h('span', [h('i', { style }), '\u2002' + node.label])
    },
    // 所有部门节点数据
    getDeptAllCheckedKeys() {
      // 目前被选中的部门节点
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      // 半选中的部门节点
      const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
      return checkedKeys
    },
    // 取消按钮
    cancel() {
      this.$tab.closeOpenPage({ path: '/organization/role' })
    },
    submitForm() {
      if (this.activeName === '0') {
        const ids = this.getDeptAllCheckedKeys()
        this.$modal
          .confirm(
            this.$t('organization.accessPermissionsConfirm').replace(
              '$1',
              this.form.roleName
            )
          )
          .then(() => {
            return updateRoleAccessPermissions({
              selectIdList: ids,
              roleId: this.roleId
            })
          })
          .then(() => {
            this.$modal.msgSuccess(
              `${this.$t('organization.accessPermissionsSuccess')}`
            )
          })
      } else if (this.activeName === '1') {
        const param = this.$refs.warehouse.submitForm()
        this.$modal
          .confirm(
            this.$t('organization.warehouseConfirm').replace(
              '$1',
              this.form.roleName
            )
          )
          .then(() => updateRoleDpForWarehouse(param))
          .then(() =>
            this.$modal.msgSuccess(this.$t('organization.warehouseSuccess'))
          )
          .catch(() => {})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.txt-color {
  color: #f66c6c !important;
}
.transfer :deep(.transfer-title) {
  display: none;
}
.tree-page {
  height: calc(100vh - 260px);
  padding: 0 20px 20px;
  .tree {
    height: 100%;
    overflow: hidden auto;
  }
}
</style>
