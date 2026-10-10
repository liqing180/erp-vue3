<template>
  <FormPageLayout formClass="form-page-btn--hide">
    <template v-slot:content>
      <vue3-tree-org
        v-if="chartData.vid !== undefined"
        class="tree"
        :data="chartData"
        :props="{ id: 'vid' }"
        :horizontal="true"
        :collapsable="true"
        :node-draggable="false"
        :scalable="true"
        :tool-bar="false"
        :define-menus="[]"
        @on-expand="onExpand"
      >
        <template #default="{ node }">
          <div class="tree-card">
            <el-icon class="icon" :size="25"><User /></el-icon>
            <span class="name flow1" :title="node.label">{{ node.label }}</span>
            <span
              v-if="node.$$data.userCount > 0"
              class="primary-pointer"
              style="flex-shrink: 0"
              @click.stop="clickUserCount(node.$$data)"
              >({{ node.$$data.userCount }})</span
            >
            <span v-else style="flex-shrink: 0"
              >({{ node.$$data.userCount || 0 }})</span
            >
          </div>
        </template>
      </vue3-tree-org>
      <viewDeptUserDlg ref="viewDeptUserDlg" />
    </template>
  </FormPageLayout>
</template>

<script>
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
      chartData: {}
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
    onExpand(event, data, node) {
      if (!node.expand && node.children) {
        const collapse = children => {
          children.forEach(child => {
            child.expand = false
            if (child.children) collapse(child.children)
          })
        }
        collapse(node.children)
      }
    },
    clickUserCount(node) {
      this.$refs.viewDeptUserDlg.handleOpen(node)
    },

    queryCorporateSummary(businessGroupId) {
      const vm = this
      queryCorporateSummary(businessGroupId).then(res => {
        const result = res.data
        vm.chartData = vm.fmtResult(result)[0] || {}
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
        data.expand = val
        if (data.children && level < 2) {
          _this.toggleExpand(data.children, val, level + 1)
        }
      }
    },

    fmtResult(data, parentPath = '') {
      const vm = this

      if (Array.isArray(data)) {
        return data.map((item, index) => {
          item.vid = `${parentPath}${index}`
          item.children = vm.fmtResult(item.child, `${item.vid}-`)
          item.label = item.name
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

<style scoped lang="scss">
.tree {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.tree-card {
  display: flex;
  align-items: center;
  width: 200px;
  font-size: 12px;
  text-align: left;
}
.icon {
  flex-shrink: 0;
  margin-right: 10px;
}
.name {
  flex: 1;
  margin-right: 5px;
}
.flow1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
