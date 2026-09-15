<template>
  <div style="padding-bottom: 20px">
    <tree-transfer
      ref="treeTransfer"
      :nodeKey="'id'"
      :fromData="fromData"
      :toData="checkedKeys"
      @checkVal="checkVal"
    />
  </div>
</template>

<script>
import { queryResourceTreeList } from '@/api/organization/role'
import treeTransfer from './treeTransfer/index.vue'

export default {
  name: 'FunctionalPermissions',
  props: {
    comDisFrom: Boolean
  },
  components: {
    treeTransfer
  },
  data() {
    return {
      roleId: '',
      fromData: [],
      toData: [],
      checkedKeys: [],
      timeId: '',
      // 左侧勾选数据
      functionalPermissionsLeftCheckedKeys: [],
      rightData: []
    }
  },
  watch: {},
  computed: {
    editAuth() {
      if (this.comDisFrom) {
        return false
      }
      return this.checkPermi(['organization:role:functionalPermissions:edit'])
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
      this.queryResourceTreeList()
    }
  },
  beforeCreate() {},
  methods: {
    checkVal(e) {
      this.toData = e
    },
    queryResourceTreeList() {
      queryResourceTreeList({ roleId: this.roleId }).then(res => {
        this.checkedKeys = res.checkedKeys || []
        const checkedKeys = res.checkedKeys || []
        this.rightData = []
        const fromData = res.menus || []
        fromData.forEach(x => {
          x.pid = 0
          x.label = this.$t(`menu.${x.label}`)
          x.name = x.label
          x.disabled = !this.editAuth
          if (checkedKeys.length > 0) {
            if (checkedKeys.indexOf(x.id) !== -1) {
              const { children, ...params } = x
              this.rightData.push(params)
            }
          }
          if (x.children && x.children.length > 0) {
            x.children = this.findPid(x, checkedKeys)
          } else {
            delete x.children
          }
        })
        this.fromData = JSON.parse(JSON.stringify(fromData))
        this.$nextTick(() => {
          this.$refs.treeTransfer.initData(this.rightData)
        })
      })
    },
    findPid(data, checkedKeys) {
      // debugger
      if (data.children && data.children.length > 0) {
        data.children.forEach(k => {
          k.pid = data.id
          k.label = this.$t(`menu.${k.label}`)
          k.name = k.label
          k.disabled = !this.editAuth
          if (checkedKeys.indexOf(k.id) !== -1) {
            const { children, ...params } = k
            this.rightData.push(params)
          }
          if (k.children && k.children.length > 0) {
            k.children = this.findPid(k, checkedKeys)
          } else {
            delete k.children
          }
        })
        return data.children
      } else {
        return undefined
      }
    },
    getMenuId(data, arr) {
      data.map(x => {
        arr.push(x.id + '')
        if (x && x.children) {
          this.getMenuId(x.children, arr)
        }
        return x
      })
      return arr
    },
    submitForm() {
      let menuIdList = []
      menuIdList = this.getMenuId(this.toData, menuIdList)
      menuIdList = Array.from(new Set(menuIdList))
      return {
        menuIdList,
        functionalPermissionsLeftCheckedKeys:
          this.functionalPermissionsLeftCheckedKeys || []
      }
    }
  }
}
</script>

<style lang="scss"></style>
