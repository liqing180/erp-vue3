<template>
  <el-dialog
    :close-on-click-modal="false"
    draggable
    :title="$t('ui.postName')"
    v-model="dialogTableVisible"
    width="800px"
    top="5vh"
    @closed="closed"
  >
    <el-input placeholder="" v-model="filterText" clearable> </el-input>
    <el-row class="transfer-style mt20" v-loading="loading">
      <el-tree
        ref="tree"
        :data="postList"
        show-checkbox
        :default-expand-all="true"
        node-key="postId"
        :check-strictly="true"
        :props="{
          children: 'children',
          label: 'postName'
        }"
        class="tree"
        :filter-node-method="filterNode"
        style="font-size: 14px; padding-bottom: 20px"
        @check="treeCheck"
      ></el-tree>
    </el-row>
    <template v-slot:footer>
      <div v-dialogDragWidth class="dialog-footer">
        <el-button @click="dialogTableVisible = false">{{
          $t('uiBtn.back')
        }}</el-button>
        <el-button
          type="primary"
          :disabled="!form.postId"
          @click="handleSave"
          >{{ $t('uiBtn.submit') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { queryPostTreeList } from '@/api/system/post'
export default {
  props: {
    query: {
      type: Object,
      default: () => ({})
    },
    postId: {
      type: [String, Number],
      default: undefined
    }
  },
  data() {
    return {
      dialogTableVisible: false,
      postList: [],
      loading: false,
      filterText: '',
      form: {}
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree?.filter(val)
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return (
        (data.postName || '').toUpperCase().indexOf(value.toUpperCase()) !== -1
      )
    },
    closed() {
      this.postList = []
      this.form = {}
      this.filterText = ''
    },
    treeCheck(node, list) {
      // node 该节点所对应的对象、list 树目前的选中状态对象
      // 选中事件在选中后执行，当lis中有两个选中时，使用setCheckedKeys方法，选中一个节点
      if (list.checkedKeys.length === 2) {
        // 单选实现
        this.$refs.tree.setCheckedKeys([node.postId])
      }
      if (list.checkedKeys.length === 0) {
        this.form = {}
      } else {
        this.form = node
      }
    },
    handleOpen() {
      this.form = {}
      this.filterText = ''
      this.dialogTableVisible = true
      this.getList()
    },
    getList() {
      this.loading = true
      queryPostTreeList({ pageNum: 1, pageSize: 25 })
        .then(response => {
          this.postList = response.rows || []
          this.handlerData(this.postList)
          this.$nextTick(() => {
            const tree = this.$refs.tree
            if (!tree) return
            tree.filter(this.filterText)
            const node = tree.getNode(this.query.postParentId)
            if (node && !node.disabled) {
              tree.setCheckedKeys([node.key])
              tree.setCurrentKey(node.key)
              this.form = node.data
            }
          })
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    handlerData(data, index = 0, disabled = false) {
      data.forEach(x => {
        x.customIndex = index + 1
        x.disabled = disabled || undefined
        if (x.customIndex >= 30) {
          x.disabled = true
        }
        if (this.postId != null && String(this.postId) === String(x.postId)) {
          x.disabled = true
        }
        if (x.children && x.children.length > 0) {
          this.handlerData(x.children, x.customIndex, x.disabled)
        } else {
          x.children = undefined
        }
      })
    },
    handleSave() {
      this.$emit('onSuccess', this.form)
      this.dialogTableVisible = false
    }
  },
  emits: ['onSuccess']
}
</script>

<style lang="scss" scoped>
.transfer-style {
  height: calc(100vh - 260px);
  overflow: hidden auto;
  .tree {
    height: 100%;
    width: 100%;
    // overflow: hidden auto;
    :deep(.el-tree-node__label) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
