import { queryAllPage } from '@/api/system/behaviour.js'
import cache from '@/plugins/cache'
// import getTextWidth from 'text-width'
import textSize from 'text-size'
export const queryAllPageList = () => {
  queryAllPage({})
    .then(res => {
      if (res.code === 200) {
        const results = res.data || []
        const pageSizeData = {}
        const tableCellHideData = {}
        const tableCellFixedData = {}
        const tableCellSortData = {}
        const RefreshTimeData = {}
        results.forEach(item => {
          const key = `${item.path}${item.activity}`
          const info = item.data ? JSON.parse(item.data) : {}
          const tableCellHide = item.tableCellHide
            ? JSON.parse(item.tableCellHide)
            : []
          const tableCellFixed = item.tableCellFixed
            ? JSON.parse(item.tableCellFixed)
            : null
          const CellSortObj = item.cellSortObj
            ? JSON.parse(item.cellSortObj)
            : null

          const pageSize = info.pageSize
          tableCellHideData[key] = tableCellHide
          tableCellFixedData[key] = tableCellFixed
          tableCellSortData[key] = CellSortObj
          pageSizeData[key] = pageSize
          RefreshTimeData[key] = item.autoRefreshTime
        })
        cache.local.setJSON('pageSizeList', pageSizeData)
        cache.local.setJSON('tableCellHideData', tableCellHideData)
        cache.local.setJSON('tableCellFixedData', tableCellFixedData)
        cache.local.setJSON('tableCellSortData', tableCellSortData)
        cache.local.setJSON('autoRefreshTimeData', RefreshTimeData)
      } else {
        // vm.$message.error(data.message)
      }
    })
    .catch(err => {
      window.console.error(err)
    })
}
export default {
  data() {
    return {
      tipVisible: false,
      columns: [],
      colTextMaxWidth: 300,
      tableMaxHeight: 390
    }
  },
  computed: {
    configColumn() {
      const arr = [...this.columns]
      function compare(value1, value2) {
        if (value1.colSortIndex < value2.colSortIndex) {
          return -1
        } else if (value1.colSortIndex > value2.colSortIndex) {
          return 1
        } else {
          return 0
        }
      }
      arr.sort(compare)
      return arr
    },
    visibleColumn() {
      const arr = [...this.columns.filter(column => column.visible === true)]
      function compare(value1, value2) {
        if (value1.colSortIndex < value2.colSortIndex) {
          return -1
        } else if (value1.colSortIndex > value2.colSortIndex) {
          return 1
        } else {
          return 0
        }
      }
      arr.sort(compare)
      return arr
    },
    size() {
      return this.$store.getters.size
    },
    thFontSize() {
      const sizeData = {
        default: 14,
        medium: 14,
        small: 13,
        mini: 12
      }
      return sizeData[this.size] || sizeData.default
    },
    cellFontSize() {
      const sizeData = {
        default: 14,
        medium: 14,
        small: 13,
        mini: 12
      }
      return sizeData[this.size] || sizeData.default
    }
  },
  created() {
    this.columns.forEach((element, index) => {
      element.key = index
    })
  },
  mounted() {
    this.windowResizeSetTableMaxHeight()
    this.setTableMaxHeight()
  },
  deactivated() {
    /* 引发操作：触发show-overflow-tooltip，然后切换页面，
    原先触发的show-overflow-tooltip并未被销毁，
    且未被display：none导致，未获取到位置，就定位到左上角 */
    setTimeout(() => {
      const list = document.getElementsByClassName('el-tooltip__popper')
      const list1 = document.getElementsByClassName('el-popover')
      // console.log('🚀 ~ file: index.vue ~ line 309 ~ deactivated ~ list', list)
      if (list.length > 0) {
        list[list.length - 1].style.display = 'none'
      }
      if (list1.length > 0) {
        list1[list1.length - 1].style.display = 'none'
      }
    }, 1000)
  },
  methods: {
    // @closed="closedTooltip"
    closedTooltip() {
      setTimeout(() => {
        const list = document.getElementsByClassName('el-tooltip__popper')
        const list1 = document.getElementsByClassName('el-popover')
        // console.log('🚀 ~ file: index.vue ~ line 309 ~ deactivated ~ list', list)
        if (list.length > 0) {
          list[list.length - 1].style.display = 'none'
        }
        if (list1.length > 0) {
          list1[list1.length - 1].style.display = 'none'
        }
      }, 500)
    },
    getCharWidth(text) {
      function getCharWidth(charCode) {
        if (charCode > 13300) {
          // 中文字符宽度设为 1.5
          return 1.73
        } else {
          // 数字字母宽度设为 1
          return 1
        }
      }
      let width = 0
      const special = {
        1: 0.87,
        i: 0.39,
        l: 0.39,
        I: 0.5,
        '.': 0.5,
        W: 1.7
      }
      for (let i = 0; i < text.length; i++) {
        if (special[text[i]]) {
          width += special[text[i]]
        } else {
          const charCode = text.charCodeAt(text[i])
          width += getCharWidth(charCode)
        }
      }
      return width
    },
    getMinWidth(column) {
      if (column.fixedWidth) {
        return column.fixedWidth
      }
      return Math.max(
        column.headerWidth || 0,
        column.colMinWidth || 0,
        column.colWidth || 0
      )
    },
    $$initColumnHeaderWidth(columnData) {
      columnData.forEach(item => {
        /* if (item.fixedWidth || item.width) {
          return
        } */

        let width1 = textSize.getTextWidth({
          text: item.label,
          fontSize: this.thFontSize + 2,
          fontName:
            'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif'
        })
        /* let width1 = getTextWidth(item.label, {
          family:
            'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif',
          size: this.thFontSize,
          weight: 'normal'
        }) */

        width1 += 24 // 表头左右padding
        if (item.sortable === 'custom') {
          width1 += 24 // 排序按钮
        }
        item.headerWidth = width1
      })
    },
    $$getColumnContentMaxWidth(columnData, list) {
      columnData.forEach(item => {
        if (item.fixedWidth || item.colMinWidth || item.width) {
          return
        }
        let maxColWidth = 0
        let maxStr = ''
        let maxStrWidth = 0
        if (list.length > 0) {
          list.findIndex(row => {
            const str = String(row[item.propBy || item.prop] || '')
            if (str) {
              const result = str.replace(/\s+/g, ' ').replace(/\n+/g, ' ')
              if (result.length > 80) {
                maxStr = result
                return true
              }
              const resultStrWidth = this.getCharWidth(result)
              if (resultStrWidth > maxStrWidth) {
                maxStr = result
                maxStrWidth = resultStrWidth
                return false
              }
            }
            return false
          })
          /* maxColWidth = getTextWidth(maxStr, {
            family:
                'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif',
            size: this.cellFontSize
          }) */
          maxColWidth = textSize.getTextWidth({
            text: maxStr,
            fontSize: this.cellFontSize + 2,
            fontName:
              'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif'
          })

          // if (item.prop === 'remarks') {
          //   console.log(maxColWidth, maxStr, maxStrWidth)
          // }
          maxColWidth += item.padding || 32 // 表头左右padding
          /* if (item.prop === 'siteAddressShowStr') {
            console.log(maxColWidth, item.maxWidth, this.colTextMaxWidth, maxStr, maxStrWidth)
          } */
          item.colWidth = Math.min(
            maxColWidth,
            item.maxWidth || this.colTextMaxWidth
          )
        } else {
          item.colWidth = undefined
        }
      })
    },
    /** 排序触发事件 */
    handleSortChange({ prop, order }) {
      // if (!!prop && !!order && this.queryParams) {
      //   order = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : ''
      //   this.queryParams.orderBy = `${prop.replace(/[A-Z]/g, (match) => {
      //     return `_${match.toLowerCase()}`
      //   })} ${order}`
      // } else {
      //   delete this.queryParams.orderBy
      // }
      if (!order) {
        this.queryParams.orderByColumn = this.queryParams.isAsc = undefined
      } else {
        this.queryParams.orderByColumn = prop
        this.queryParams.isAsc = order
      }
      if (this.getList) {
        this.getList()
      }
    },
    $$initPageSize(saveKey, savePath) {
      const path = savePath || this.savePath || this.$route.name
      const vm = this
      const pageSizeList = vm.$cache.local.getJSON('pageSizeList') || {}

      if (pageSizeList && pageSizeList[`${path}${saveKey}`]) {
        return pageSizeList[`${path}${saveKey}`]
        // vm.queryParams.pageSize =
      } else {
        return 25
        // vm.queryParams.pageSize = 10
        // vm.$$pageSizeSave(path, saveKey)
      }
    },
    $$initColumnVisible(saveKey, columnData, savePath) {
      const path = savePath || this.savePath || this.$route.name
      this.$$initColumnHeaderWidth(columnData)
      const hideCell = this.$cache.local.getJSON('tableCellHideData') || {}
      const fixedCell = this.$cache.local.getJSON('tableCellFixedData') || {}
      const sortCell = this.$cache.local.getJSON('tableCellSortData') || {}

      const param = {
        activity: saveKey, // ActivityPool['purchaseRequisite'][0]['activity'],
        path: path // vm.$route.meta.srcPath
      }
      if (hideCell && hideCell[`${param.path}${param.activity}`]) {
        const hideCellList = hideCell[`${param.path}${param.activity}`]
        // console.log('hideCell', hideCellList)
        columnData.forEach(item => {
          if (hideCellList.includes(item.prop)) {
            item.visible = false
          }
        })
      }
      if (fixedCell && fixedCell[`${param.path}${param.activity}`]) {
        const fixedCellList = fixedCell[`${param.path}${param.activity}`]
        columnData.forEach(item => {
          if (fixedCellList.includes(item.prop)) {
            item.fixed = true
          } else {
            item.fixed = false
          }
        })
      }
      if (sortCell && sortCell[`${param.path}${param.activity}`]) {
        const sortCellObj = sortCell[`${param.path}${param.activity}`]
        columnData.forEach(item => {
          item.colSortIndex = sortCellObj[item.prop]
        })
      }
    },
    /** 清空排序 */
    queryTable() {
      this.queryParams.isAsc = this.queryParams.orderByColumn = undefined
      this.$refs.tables && this.$refs.tables.clearSort()
      if (this.getList) {
        this.getList()
      }
    },

    /* 弹窗表格最大高度设置 */
    JieLiu(fn, time) {
      let isRun = false
      return function () {
        if (isRun) return
        isRun = true
        setTimeout(() => {
          isRun = false
          fn()
        }, time)
      }
    },
    windowResizeSetTableMaxHeight() {
      const vm = this
      vm.resizeFn = vm.JieLiu(vm.setTableMaxHeight, 100)
      window.addEventListener('resize', vm.resizeFn)
    },
    setTableMaxHeight() {
      this.$nextTick(() => {
        const height = window.innerHeight * 0.88 - 260
        if (height >= 390) {
          this.tableMaxHeight = height
        } else {
          this.tableMaxHeight = 390
        }
      })
    }
  }
}
