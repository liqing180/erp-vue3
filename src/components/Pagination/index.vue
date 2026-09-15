<template>
  <div :class="{ hidden: hidden }" class="pagination-container">
    <el-pagination
      v-bind="$attrs"
      :background="background"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :layout="layout"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scroll-to'
import pageMixin from '@/mixins/tableMinx'
import { save } from '@/api/system/behaviour.js'

export default {
  name: 'Pagination',
  mixins: [pageMixin],
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 25, 50, 100]
      }
    },
    // 移动端页码按钮的数量端默认值5
    pagerCount: {
      type: Number,
      default: document.body.clientWidth < 992 ? 5 : 7
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    saveKey: {
      type: String,
      default: ''
    },
    savePath: {
      type: String,
      default: ''
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: false
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        this.$emit('update:limit', val)
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      if (this.saveKey) {
        this.$$pageSizeSave(this.saveKey, val)
      }
      this.$emit('pagination', { page: this.currentPage, limit: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, limit: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    $$pageSizeSave(saveKey, pageSize) {
      const vm = this
      // console.log(ActivityPool[moduleName][index])

      const param = {
        activity: saveKey,
        data: JSON.stringify({
          pageSize: pageSize || 10
        }),
        path: this.savePath || this.$route.name // vm.$route.meta.srcPath
      }
      const pageSizeList = vm.$cache.local.getJSON('pageSizeList') || {}
      pageSizeList[`${param.path}${param.activity}`] = pageSize || 10
      vm.$cache.local.setJSON('pageSizeList', pageSizeList)

      // vm.table_loading = true
      return save(param)
        .then(res => {
          if (res.code === 200) {
            // let results = data.msg
          } else {
            vm.$message.error(res.msg)
          }
        })
        .catch(err => {
          window.console.error(err)
        })
    }
  },
  emits: ['update:page', 'update:limit', 'pagination']
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
}
.pagination-container.hidden {
  display: none;
}
</style>
