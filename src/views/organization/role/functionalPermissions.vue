<template>
  <div style="padding-bottom: 20px" class="custom-transfer">
    <tree-transfer
      ref="transferRef"
      v-model:fromData="fromData"
      v-model:toData="toData"
      :defaultProps="{
        id: 'id', // 节点id
        parentId: 'pid', // 父节点id
        label: 'customLabel',
        children: 'children',
        disabled: 'disabled'
      }"
      placeholder=""
      :defaultExpandAll="false"
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
  components: {
    treeTransfer
  },
  data() {
    return {
      roleId: '',
      activeNames: ['1'],
      fromData: [],
      toData: [],
      checkedKeys: [],
      timeId: '',
      // 左侧勾选数据
      functionalPermissionsLeftCheckedKeys: []
    }
  },
  watch: {},
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
    queryResourceTreeList() {
      queryResourceTreeList({ roleId: this.roleId }).then(res => {
        const checkedKeys = res.checkedKeys || []
        let fromData = res.menus || []
        fromData.forEach(x => {
          x.pid = 0
          x.customLabel = this.$t(`menu.${x.label}`)
          x.disabled = !this.editAuth
          x.children = this.findPid(x)
        })
        const toData = []
        if (checkedKeys && checkedKeys.length > 0) {
          fromData.forEach(x => {
            if (checkedKeys.indexOf(x.id) !== -1) {
              const list = JSON.parse(JSON.stringify(x))
              const getChild = data => {
                if (data.children && data.children.length > 0) {
                  data.children = data.children.filter(
                    k => checkedKeys.indexOf(k.id) !== -1
                  )
                  data.children &&
                    data.children.forEach(m => {
                      getChild(m)
                    })
                }
              }
              getChild(list)
              toData.push(list)
            }
          })
          const traverseFromBottomUp = (arr, callback) => {
            const helper = data => {
              if (data.length > 0) {
                for (let i = data.length - 1; i >= 0; i--) {
                  if (
                    data[i] &&
                    data[i].children &&
                    data[i].children.length > 0
                  ) {
                    helper(data[i].children)
                  } else {
                    if (data[i] && checkedKeys.indexOf(data[i].id) !== -1) {
                      callback(data, data[i].id, i, 110)
                      return
                    }
                  }
                }
              }
            }

            // 从外层数组开始递归
            for (let i = arr.length - 1; i >= 0; i--) {
              helper(arr[i].children)
            }
          }
          // 定义一个回调函数，用于在遍历每个元素时执行某些操作
          const myCallback = (data, id, i, index) => {
            if (checkedKeys.indexOf(id) !== -1) {
              checkedKeys.splice(checkedKeys.indexOf(id), 1)
              data.splice(i, 1)
              if (checkedKeys.length > 0) {
                traverseFromBottomUp(fromData, myCallback)
              }
            }
          }
          // 调用遍历函数
          traverseFromBottomUp(fromData, myCallback)
          fromData = fromData.filter(
            x =>
              !(
                checkedKeys.indexOf(x.id) !== -1 &&
                (!x.children || x.children.length <= 0)
              )
          )
        }

        this.fromData = JSON.parse(JSON.stringify(fromData))
        this.toData = JSON.parse(JSON.stringify(toData))
        this.$nextTick(() => {
          this.$refs.transferRef.addToAims(false)
        })
      })
    },
    findPid(data) {
      if (data.children && data.children.length > 0) {
        data.children.forEach(k => {
          k.pid = data.id
          k.customLabel = this.$t(`menu.${k.label}`)
          k.disabled = !this.editAuth
          k.children = this.findPid(k)
        })
        return data.children
      } else {
        return []
      }
    },
    getToLeftData(data) {
      data.forEach(x => {
        if (
          this.checkedKeys.indexOf(x.id) !== -1 &&
          (!x.children || x.children.length <= 0)
        ) {
          this.checkedKeys.push(x.id)
        }
        this.getToLeftData(x.children)
      })
    },
    // 监听穿梭框组件添加
    add(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      console.log('fromData:', fromData)
      console.log('toData:', toData)
      console.log('obj:', obj)
      this.functionalPermissionsLeftCheckedKeys = []
    },
    // 监听穿梭框组件移除
    remove(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      console.log('fromData:', fromData)
      console.log('toData:', toData)
      console.log('obj:', obj)
    },
    getMenuId(data, arr) {
      data.map(x => {
        // if (x && x.children && x.children.length > 0) {
        //   this.getMenuId(x.children, arr)
        // } else {
        //   arr.push(x.id + '')
        // }
        // return x
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
      return {
        menuIdList,
        functionalPermissionsLeftCheckedKeys:
          this.functionalPermissionsLeftCheckedKeys || []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-transfer {
  height: 600px !important;
  .tree-transfer-vue3 {
    height: 600px !important;
  }
  :deep(.transfer-main) {
    height: 600px !important;
  }
  :deep(.transfer-title) {
    display: none !important;
  }
  :deep(.el-tree) {
    height: 545px;
    overflow: auto;
  }
}
</style>
