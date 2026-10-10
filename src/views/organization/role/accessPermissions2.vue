<template>
  <div class="tree-page">
    <el-input placeholder="" v-model="filterText" clearable> </el-input>
    <el-tree
      ref="tree"
      :data="fromData"
      show-checkbox
      :default-expand-all="false"
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
      :default-expanded-keys="checkedKeys || []"
    ></el-tree>
  </div>
</template>

<script>
import { getAccessPermissions } from '@/api/organization/role'

export default {
  name: 'AccessPermissions',
  props: {
    comDisFrom: Boolean
  },
  data() {
    return {
      fromData: [],
      roleId: '',
      filterText: '',
      checkedKeys: [],
      timeId: ''
    }
  },
  computed: {
    editAuth() {
      if (this.comDisFrom) {
        return false
      }
      return this.checkPermi(['organization:role:accessPermissions:edit'])
    }
  },
  watch: {
    editAuth() {
      this.fromData.forEach(item => this.findPid(item))
    },
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.roleId = this.$route.query.roleId
    this.timeId = this.$route.query.timeId
    this.getAccessPermissions()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.roleId = this.$route.query.roleId
      this.getAccessPermissions()
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      // return data.name.indexOf(value) !== -1
      const text = value.toUpperCase()
      return data.name.toUpperCase().indexOf(text) !== -1
    },
    getAccessPermissions() {
      getAccessPermissions({ roleId: this.roleId }).then(res => {
        const fromData = res.userData || []
        fromData.forEach(item => {
          this.findPid(item)
        })
        this.fromData = JSON.parse(JSON.stringify(fromData))
        this.checkedKeys = res.checkedKeys || []

        this.$nextTick(() => {
          this.$refs.tree?.setCheckedKeys(this.checkedKeys)
        })
      })
    },

    findPid(data) {
      data.disabled = !this.editAuth
      if (data.child && data.child.length > 0) {
        data.child.forEach(k => {
          this.findPid(k)
        })
      }
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
      const ids = this.getDeptAllCheckedKeys()
      return ids
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
