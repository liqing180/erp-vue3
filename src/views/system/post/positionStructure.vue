<template>
  <!--
          data:就是数据格式，时一个对象，具体格式下面有示例
          horizontal:默认是false，即纵向展示
          collapsable:是否折叠，有这个属性，则表示默认折叠，有其他方法可以在存在此属性时，也保证是展开状态
          on-expand:点击折叠点，点击可以展开，再次点击可以折叠，是个方法
          on-node-click:顾名思义，就是点击节点，触发的事件
          on-node-mouseover:鼠标移入节点触发的事件，可以触发一个弹层用于展示详情
          on-node-mouseout:鼠标移出节点触发的事件，可以控制详情弹层的隐藏
          原文链接：https://blog.csdn.net/yehaocheng520/article/details/119675805
        -->
  <FormPageLayout>
    <template v-slot:btn>
      <el-button type="primary" @click="cancel" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>
    <template v-slot:content>
      <vue3-tree-org
        :data="chartData"
        :horizontal="true"
        :collapsable="true"
        :node-draggable="false"
        :scalable="true"
        @on-node-click="onNodeClick"
        :tool-bar="false"
        :define-menus="[]"
      >
        <template v-slot="{ node }">
          <div>
            <div class="tree-card">
              <el-icon class="fs-0" :size="20">
                <User />
              </el-icon>
              <div class="flex-1 flow1" :title="node.label">
                {{ node.label }}
              </div>
              <span
                class="fs-0 primary-pointer"
                v-if="node.$$data.userCount > 0"
                @click="clickUserCount(node.$$data)"
              >
                ({{ node.$$data.userCount }})
              </span>
              <span class="fs-0" v-else>({{ 0 }})</span>
            </div>
          </div>
        </template>
      </vue3-tree-org>
      <viewDeptUserDlg ref="viewDeptUserDlg" />
    </template>
  </FormPageLayout>
</template>

<script>
import { queryPostFrameworkImage } from '@/api/system/post'
import viewDeptUserDlg from './viewDeptUserDlg.vue'
export default {
  name: 'PositionStructure',
  components: {
    viewDeptUserDlg
  },
  data() {
    return {
      chartData: {}
    }
  },
  mounted() {
    this.queryPostFrameworkImage()
  },
  methods: {
    onNodeClick() {},
    // 取消按钮
    cancel() {
      const obj = { path: '/organization/post' }
      this.$tab.closeOpenPage(obj)
    },
    clickUserCount(node) {
      this.$refs.viewDeptUserDlg.handleOpen(node)
    },
    collapse(list) {
      const _this = this
      list.forEach(function (child) {
        if (child.expand) {
          child.expand = false
        }
        child.children && _this.collapse(child.children)
      })
    },
    onExpand(e, data) {
      if ('expand' in data) {
        data.expand = !data.expand
        if (!data.expand && data.children) {
          this.collapse(data.children)
        }
      } else {
        data['expand'] = true
      }
    },
    queryPostFrameworkImage() {
      const vm = this
      queryPostFrameworkImage({}).then(res => {
        const result = res.data
        result.children = result.child
        result.label = result.name
        vm.fmtResult(result.children || [])
        vm.chartData = result
        vm.toggleExpand(this.chartData, true, 0)
      })
    },
    fmtResult(data) {
      const vm = this
      if (Array.isArray(data)) {
        return data.map(item => {
          item.label = item.name
          vm.fmtResult(item.children)
          return item
        })
      } else {
        return []
      }
    },
    toggleExpand(data, val, level = 0) {
      const _this = this
      if (Array.isArray(data)) {
        data.forEach(function (item) {
          item.expand = val
          if (item.children && level < 2) {
            _this.toggleExpand(item.children, val, level + 1)
          }
        })
      } else {
        data['expand'] = val
        if (data.children && level < 2) {
          _this.toggleExpand(data.children, val, level + 1)
        }
      }
    }
  }
}
</script>

<style lang="scss">
.tree-card {
  padding: 10px;
  display: flex;
  align-items: center;
  width: 200px;
  font-size: 12px;
  text-align: left;
  .flow1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
