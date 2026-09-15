<template>
  <FormPageLayout formClass="form-page-btn--hide">
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
  <!--
    data:就是数据格式，时一个对象，具体格式下面有示例
    horizontal:默认是false，即纵向展示
    collapsable:是否折叠，有这个属性，则表示默认折叠，有其他方法可以在存在此属性时，也保证是展开状态
    on-expand:点击折叠点，点击可以展开，再次点击可以折叠，是个方法
    on-node-click:顾名思义，就是点击节点，触发的事件
    on-node-mouseover:鼠标移入节点触发的事件，可以触发一个弹层用于展示详情
    on-node-mouseout:鼠标移出节点触发的事件，可以控制详情弹层的隐藏
		scalable	架构图是否可缩放
    文档链接：https://sangtian152.github.io/vue3-tree-org/demo/
  -->
</template>

<script>
import { Edit } from '@element-plus/icons-vue'
import {
  queryBusinessGroupList,
  queryCorporateSummary
} from '@/api/organization/corporate'
import viewDeptUserDlg from './viewDeptUserDlg.vue'
export default {
  name: 'CorporateDetail',
  components: {
    viewDeptUserDlg
  },
  data() {
    return {
      bussinessGroupOptions: [],
      businessGroupId: '',
      chartData: {},
      tools: [
        {
          title: '111', // 动态渲染工具栏的标题
          action: () => {
            /* 添加节点的动作 */
          }
        },
        {
          title: '222',
          action: () => {
            /* 删除节点的动作 */
          }
        },
        {
          title: '333',
          action: () => {
            /* 编辑节点的动作 */
          }
        }
      ]
    }
  },
  mounted() {
    const vm = this

    const fn = async function () {
      await vm.queryBusinessGroupList()
    }
    vm.$nextTick(() => {
      fn().then(() => {
        vm.queryCorporateSummary(vm.businessGroupId)
      })
    })
  },
  methods: {
    onNodeClick() {},

    clickUserCount(row) {
      // console.log(row)
      this.$refs.viewDeptUserDlg.handleOpen(row)
    },
    // 通过 render-content 渲染节点内容
    renderContent(h, node) {
      return h('div', [
        h(Edit, {
          style: {
            width: '20px',
            height: '20px',
            marginRight: '8px'
          }
        }),
        h('div', node.label)
      ])
      // return {
      /* <div class="renderTree">
          <div class="tree-card">
            <i class="el-icon-user icon"></i>
            <div class="content">
              <span class="flow1 name" title={node.name}>
                {node.name}
              </span>
              {node.userCount > 0 && (
                <span
                  style="flex-shrink: 0;"
                  class="primary-pointer"
                  onClick={() => this.clickUserCount(node)}
                >
                  ({node.userCount})
                </span>
              )}

              {node.userCount <= 0 && (
                <span style="flex-shrink: 0;">({node.userCount})</span>
              )}
            </div>
          </div>
        </div> */
      // }
    },
    queryCorporateSummary(businessGroupId) {
      const vm = this
      queryCorporateSummary(businessGroupId).then(res => {
        const result = res.data
        vm.chartData = vm.fmtResult(result)[0]
        // 展开到分公司下的部门
        vm.toggleExpand(this.chartData, true, 0)
      })
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
    },

    fmtResult(data) {
      const vm = this

      if (Array.isArray(data)) {
        return data.map(item => {
          item.children = item.child || []
          item.label = item.name
          vm.fmtResult(item.child)
          return item
        })
      } else {
        return []
      }
    },
    queryBusinessGroupList() {
      const vm = this
      return new Promise(resolve => {
        queryBusinessGroupList().then(res => {
          const result = res.data
          if (result) {
            vm.bussinessGroupOptions = result
          } else {
            vm.bussinessGroupOptions = []
          }
          if (Array.isArray(result)) {
            const len = vm.bussinessGroupOptions.length
            if (len > 0) {
              vm.businessGroupId = vm.bussinessGroupOptions[0].id
            }
          }
          resolve()
        })
      })
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
