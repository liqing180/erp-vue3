import { queryAllPage } from '@/api/system/behaviour.js'
import cache from '@/plugins/cache'
import textSize from 'text-size'

function getTableScrollWrapper(tableRef) {
  const root = tableRef?.$el
  if (!root?.querySelector) return undefined

  return (
    root.querySelector('.el-table__body-wrapper .el-scrollbar__wrap') ||
    root.querySelector('.el-table__body-wrapper')
  )
}

function setTableScrollTop(tableRef, value) {
  if (typeof tableRef?.setScrollTop === 'function') {
    tableRef.setScrollTop(value)
    return
  }

  const wrapper = getTableScrollWrapper(tableRef)
  if (wrapper) wrapper.scrollTop = value
}

function hideLastElement(selector) {
  const list = document.querySelectorAll(selector)
  const last = list[list.length - 1]
  if (last) last.style.display = 'none'
}

export const queryAllPageList = () => {
  queryAllPage({})
    .then(res => {
      if (res.code !== 200) return

      const results = res.data || []
      const pageSizeData = {}
      const tableCellHideData = {}
      const tableCellFixedData = {}
      const tableCellSortData = {}
      const refreshTimeData = {}

      results.forEach(item => {
        const key = `${item.path}${item.activity}`
        const info = item.data ? JSON.parse(item.data) : {}
        const tableCellHide = item.tableCellHide
          ? JSON.parse(item.tableCellHide)
          : []
        const tableCellFixed = item.tableCellFixed
          ? JSON.parse(item.tableCellFixed)
          : null
        const cellSortObj = item.cellSortObj
          ? JSON.parse(item.cellSortObj)
          : null

        tableCellHideData[key] = tableCellHide
        tableCellFixedData[key] = tableCellFixed
        tableCellSortData[key] = cellSortObj
        pageSizeData[key] = info.pageSize
        refreshTimeData[key] = item.autoRefreshTime
      })

      cache.local.setJSON('pageSizeList', pageSizeData)
      cache.local.setJSON('tableCellHideData', tableCellHideData)
      cache.local.setJSON('tableCellFixedData', tableCellFixedData)
      cache.local.setJSON('tableCellSortData', tableCellSortData)
      cache.local.setJSON('autoRefreshTimeData', refreshTimeData)
    })
    .catch(error => {
      window.console.error(error)
    })
}

export default {
  data() {
    return {
      tipVisible: false,
      columns: [],
      colTextMaxWidth: 300,
      tableMaxHeight: 390,
      tableScrollTop: undefined,
      tableKey: Date.now(),
      resizeFn: undefined
    }
  },
  computed: {
    configColumn() {
      return [...this.columns].sort(
        (value1, value2) => value1.colSortIndex - value2.colSortIndex
      )
    },
    visibleColumn() {
      return this.columns
        .filter(column => column.visible === true)
        .sort((value1, value2) => value1.colSortIndex - value2.colSortIndex)
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
  activated() {
    if (this.$refs.tables && this.tableScrollTop !== undefined) {
      setTableScrollTop(this.$refs.tables, this.tableScrollTop)
    }
  },
  deactivated() {
    setTimeout(() => {
      hideLastElement('.el-tooltip__popper')
      hideLastElement('.el-popover')
    }, 1000)

    const wrapper = getTableScrollWrapper(this.$refs.tables)
    if (wrapper) {
      this.tableScrollTop = wrapper.scrollTop
    }
  },
  beforeUnmount() {
    if (this.resizeFn) {
      window.removeEventListener('resize', this.resizeFn)
    }
  },
  methods: {
    $$getSelectedIdList(selectedRows, rowIdKey) {
      const ids = (selectedRows || [])
        .map(item => {
          if (item && typeof item === 'object') {
            return item[rowIdKey]
          }
          return item
        })
        .filter(id => id !== undefined && id !== null && id !== '')

      return [...new Set(ids)]
    },
    $$getFilteredSelectedList(response) {
      const list = Array.isArray(response?.filteredSelectedList)
        ? response.filteredSelectedList
        : []
      return list.filter(
        item => item !== undefined && item !== null && item !== ''
      )
    },
    $$getFilteredSelectedNum(
      filteredSelectedList,
      tableList,
      selectedRows,
      rowIdKey
    ) {
      const filterableIds = new Set([
        ...this.$$getSelectedIdList(filteredSelectedList, rowIdKey),
        ...this.$$getSelectedIdList(tableList, rowIdKey)
      ])

      return this.$$getSelectedIdList(selectedRows, rowIdKey).filter(id =>
        filterableIds.has(id)
      ).length
    },
    $$resetTableKey() {
      this.$nextTick(() => {
        this.tableKey += 1
      })
    },
    closedTooltip() {
      setTimeout(() => {
        hideLastElement('.el-tooltip__popper')
        hideLastElement('.el-popover')
      }, 500)
    },
    getCharWidth(text) {
      function getCharWidth(charCode) {
        return charCode > 13300 ? 1.73 : 1
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

      for (let index = 0; index < text.length; index += 1) {
        const char = text[index]
        width += special[char] || getCharWidth(text.charCodeAt(index))
      }
      return width
    },
    getMinWidth(column) {
      if (column.fixedWidth) return column.fixedWidth

      return Math.max(
        column.headerWidth || 0,
        column.colMinWidth || 0,
        column.colWidth || 0
      )
    },
    $$initColumnHeaderWidth(columnData) {
      const isInitialized = columnData.some(item =>
        Object.prototype.hasOwnProperty.call(item, 'initVisible')
      )

      columnData.forEach(item => {
        if (!isInitialized) {
          item.initFixed = item.fixed
          item.initVisible = item.visible
        }

        let width = textSize.getTextWidth({
          text: item.label || '',
          fontSize: this.thFontSize + 2,
          fontName:
            'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif'
        })

        width += 24
        if (item.sortable === 'custom') width += 24
        if (item.required) width += 10
        item.headerWidth = width
      })
    },
    $$getColumnContentMaxWidth(columnData, list) {
      columnData.forEach(item => {
        if (item.fixedWidth || item.colMinWidth || item.width) return

        if (!list.length) {
          item.colWidth = undefined
          return
        }

        let maxWidth = 0
        let maxText = ''

        list.some(row => {
          const text = String(row[item.propBy || item.prop] || '')
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
          if (!text) return false

          const width = textSize.getTextWidth({
            text,
            fontSize: this.cellFontSize + 2,
            fontName:
              'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif'
          })

          if (width > maxWidth) {
            maxWidth = width
            maxText = text
          }
          return text.length > 80
        })

        const measuredWidth = textSize.getTextWidth({
          text: maxText,
          fontSize: this.cellFontSize + 2,
          fontName:
            'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif'
        })

        item.colWidth = Math.min(
          measuredWidth + (item.padding || 32),
          item.maxWidth || this.colTextMaxWidth
        )
      })
    },
    handleSortChange({ prop, order }) {
      if (!order) {
        this.queryParams.orderByColumn = undefined
        this.queryParams.isAsc = undefined
      } else {
        this.queryParams.orderByColumn = prop
        this.queryParams.isAsc = order
      }
      this.getList?.()
    },
    $$initPageSize(saveKey, savePath) {
      const path = savePath || this.savePath || this.$route.name
      const pageSizeList = this.$cache.local.getJSON('pageSizeList') || {}
      return pageSizeList[`${path}${saveKey}`] || 25
    },
    $$initColumnVisible(saveKey, columnData, savePath) {
      const path = savePath || this.savePath || this.$route.name
      this.$$initColumnHeaderWidth(columnData)

      const hideCell = this.$cache.local.getJSON('tableCellHideData') || {}
      const fixedCell = this.$cache.local.getJSON('tableCellFixedData') || {}
      const sortCell = this.$cache.local.getJSON('tableCellSortData') || {}
      const cacheKey = `${path}${saveKey}`

      const savedSort = sortCell[cacheKey] || {}
      if (Object.keys(savedSort).length > 0) {
        columnData.forEach(item => {
          item.visible = true
        })
      }

      const hideCellList = hideCell[cacheKey]
      if (hideCellList) {
        columnData.forEach(item => {
          if (hideCellList.includes(item.prop)) {
            item.visible = false
          }
        })
      }

      const fixedCellList = fixedCell[cacheKey]
      if (fixedCellList) {
        columnData.forEach(item => {
          item.fixed = fixedCellList.includes(item.prop)
        })
      }

      const sortCellObj = sortCell[cacheKey]
      if (sortCellObj) {
        columnData.forEach(item => {
          item.colSortIndex = sortCellObj[item.prop]
        })
      }
    },
    queryTable() {
      this.queryParams.isAsc = undefined
      this.queryParams.orderByColumn = undefined
      this.$refs.tables?.clearSort?.()
      this.getList?.()
    },
    paginationChange() {
      if (this.$refs.tables) {
        setTableScrollTop(this.$refs.tables, 0)
      }
      this.getList?.()
    },
    JieLiu(fn, time) {
      let isRun = false
      return function throttled(...args) {
        if (isRun) return
        isRun = true
        setTimeout(() => {
          isRun = false
          fn.apply(this, args)
        }, time)
      }
    },
    windowResizeSetTableMaxHeight() {
      if (this.resizeFn) {
        window.removeEventListener('resize', this.resizeFn)
      }
      this.resizeFn = this.JieLiu(this.setTableMaxHeight, 100)
      window.addEventListener('resize', this.resizeFn)
    },
    setTableMaxHeight() {
      this.$nextTick(() => {
        this.tableMaxHeight = Math.max(window.innerHeight * 0.88 - 260, 390)
      })
    },
    scrollToErrorColumn() {
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          const tableEl = this.$refs.tables?.$el
          const scrollWrapper = getTableScrollWrapper(this.$refs.tables)
          if (!tableEl || !scrollWrapper) return

          const wrapperRect = scrollWrapper.getBoundingClientRect()
          const errorCells = [
            ...tableEl.querySelectorAll('.is-required-table-cell')
          ]
          const errorCell = errorCells.find(cell => {
            const rect = cell.getBoundingClientRect()
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              rect.bottom > wrapperRect.top &&
              rect.top < wrapperRect.bottom
            )
          })
          if (!errorCell) return

          const cellRect = errorCell.getBoundingClientRect()
          const inVert =
            cellRect.top >= wrapperRect.top &&
            cellRect.bottom <= wrapperRect.bottom
          const inHoriz =
            cellRect.left >= wrapperRect.left &&
            cellRect.right <= wrapperRect.right
          if (inVert && inHoriz) return

          const targetTop =
            scrollWrapper.scrollTop +
            cellRect.top -
            wrapperRect.top -
            (scrollWrapper.clientHeight - cellRect.height) / 2
          const targetLeft =
            scrollWrapper.scrollLeft +
            cellRect.left -
            wrapperRect.left -
            (scrollWrapper.clientWidth - cellRect.width) / 2

          const scrollOptions = {
            top: Math.max(0, targetTop),
            left: Math.max(0, targetLeft),
            behavior: 'smooth'
          }

          if (typeof scrollWrapper.scrollTo === 'function') {
            scrollWrapper.scrollTo(scrollOptions)
          } else {
            scrollWrapper.scrollTop = scrollOptions.top
            scrollWrapper.scrollLeft = scrollOptions.left
          }
        })
      })
    },
    scrollToErrorColumn1() {
      this.scrollToErrorColumn()
    }
  }
}
