<template>
  <div style="padding-bottom: 20px" class="custom-transfer">
    <tree-transfer
      :key="timeId"
      ref="transferRef"
      v-model:fromData="fromData"
      v-model:toData="toData"
      :defaultProps="{
        id: 'id',
        parentId: 'pid',
        label: 'customLabel',
        children: 'children',
        disabled: 'disabled'
      }"
      placeholder=""
      :defaultExpandAll="false"
      :expandOnClickNode="true"
      :checkOnClickNode="false"
      :titleList="[$t('mapLang.all'), $t('mapLang.all')]"
      rootPid="0"
      @add="add"
      @remove="remove"
      :language="language === 'en' ? 'en' : 'zh-cn'"
    />
  </div>
</template>

<script>
import { queryResourceTreeList } from '@/api/organization/role'
import treeTransfer from 'tree-transfer-vue3'

export default {
  name: 'FunctionalPermissions',
  props: {
    comDisFrom: Boolean
  },
  components: { treeTransfer },
  data() {
    return {
      roleId: '',
      fromData: [],
      toData: [],
      timeId: '',
      functionalPermissionsLeftCheckedKeys: []
    }
  },
  computed: {
    editAuth() {
      if (this.comDisFrom) {
        return false
      }
      return this.checkPermi(['organization:role:functionalPermissions:edit'])
    },
    language() {
      return this.$store.getters.language
    }
  },
  watch: {
    editAuth() {
      this.fromData.forEach(item => this.findPid(item))
      this.toData.forEach(item => this.findPid(item))
      this.$refs.transferRef?.clearCheck()
    }
  },
  created() {
    this.roleId = this.$route.query.roleId
    this.timeId = this.$route.query.timeId
    this.queryResourceTreeList()
  },
  activated() {
    if (this.$route.query.timeId !== this.timeId) {
      this.timeId = this.$route.query.timeId
      this.roleId = this.$route.query.roleId
      this.fromData = []
      this.toData = []
      this.functionalPermissionsLeftCheckedKeys = []
      this.queryResourceTreeList()
    }
  },
  methods: {
    queryResourceTreeList() {
      queryResourceTreeList({ roleId: this.roleId }).then(res => {
        const checkedKeys = res.checkedKeys || []
        const fromData = res.menus || []
        fromData.forEach(item => {
          item.pid = 0
          this.findPid(item)
        })
        // ERP 只按已授权的叶子节点初始化，父节点随子节点保留在两侧树中。
        this.fromData = this.getTransferData(fromData, checkedKeys, false)
        this.toData = this.getTransferData(fromData, checkedKeys, true)
        this.functionalPermissionsLeftCheckedKeys = []
        this.$nextTick(() => {
          this.$refs.transferRef?.clearCheck()
        })
      })
    },
    findPid(data) {
      data.customLabel = this.$t('menu.' + data.label)
      data.disabled = !this.editAuth
      if (data.children && data.children.length > 0) {
        data.children.forEach(item => {
          item.pid = data.id
          this.findPid(item)
        })
      } else {
        data.children = []
      }
    },
    getTransferData(data, checkedKeys, toRight) {
      const list = []
      data.forEach(item => {
        if (item.children.length > 0) {
          const children = this.getTransferData(
            item.children,
            checkedKeys,
            toRight
          )
          if (children.length > 0) {
            list.push({ ...item, children })
          }
        } else if (checkedKeys.includes(item.id) === toRight) {
          list.push({ ...item, children: [] })
        }
      })
      return list
    },
    add() {
      this.functionalPermissionsLeftCheckedKeys = []
      this.$nextTick(() => this.$refs.transferRef?.clearCheck())
    },
    remove() {
      this.functionalPermissionsLeftCheckedKeys = []
      this.$nextTick(() => this.$refs.transferRef?.clearCheck())
    },
    getMenuId(data, arr) {
      data.forEach(item => {
        arr.push(item.id + '')
        if (item.children) {
          this.getMenuId(item.children, arr)
        }
      })
      return arr
    },
    submitForm() {
      // 使用 Vue3 组件公开的树方法，保留左侧勾选但未穿梭时的 ERP 提交提示。
      this.functionalPermissionsLeftCheckedKeys =
        this.$refs.transferRef.fromTreeRef.getCheckedKeys()
      return {
        menuIdList: this.getMenuId(this.toData, []),
        functionalPermissionsLeftCheckedKeys:
          this.functionalPermissionsLeftCheckedKeys
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-transfer {
  :deep(.tree-transfer-vue3) {
    height: 600px;
  }
  :deep(.el-tree) {
    height: 500px;
    overflow: auto;
  }
}
</style>
