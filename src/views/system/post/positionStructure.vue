<template>
  <FormPageLayout>
    <template v-slot:btn>
      <el-button type="primary" @click="cancel" size="small">{{
        $t('uiBtn.back')
      }}</el-button>
    </template>
    <template v-slot:content>
      <vue3-tree-org
        v-if="chartData.id != null"
        class="position-tree"
        :data="chartData"
        :horizontal="true"
        :collapsable="true"
        :node-draggable="false"
        :scalable="true"
        :tool-bar="false"
        :define-menus="[]"
      >
        <template #default="{ node }">
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
                @click.stop="clickUserCount(node.$$data)"
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
    // 取消按钮
    cancel() {
      const obj = { path: '/organization/post' }
      this.$tab.closeOpenPage(obj)
    },
    clickUserCount(node) {
      this.$refs.viewDeptUserDlg.handleOpen(node)
    },
    queryPostFrameworkImage() {
      const vm = this
      queryPostFrameworkImage({}).then(res => {
        const result = res.data || {}
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

<style lang="scss" scoped>
.position-tree {
  width: 100%;
  height: calc(100vh - 160px);
}
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
