function getTableRoot(tableRef) {
  return tableRef?.$el || tableRef
}

function getBodyWrapper(tableRef) {
  const root = getTableRoot(tableRef)
  if (!root?.querySelector) return undefined

  return (
    root.querySelector('.el-table__body-wrapper .el-scrollbar__wrap') ||
    root.querySelector('.el-table__body-wrapper')
  )
}

function getHeaderWrapper(tableRef) {
  return getTableRoot(tableRef)?.querySelector?.('.el-table__header-wrapper')
}

export default class TableSyncScrollClass {
  constructor() {
    this.beforeTableRef = undefined
    this.afterTableRef = undefined
    this.beforeWrapper = undefined
    this.beforeHeaderWrapper = undefined
    this.afterWrapper = undefined
    this.afterHeaderWrapper = undefined
    this.scrollType = undefined
    this.timer = undefined

    this._handleBeforeScroll = this._handleBeforeScroll.bind(this)
    this._handleAfterScroll = this._handleAfterScroll.bind(this)
  }

  initAsyncScroll({
    beforeTableRef,
    afterTableRef,
    columns,
    afterDetailList,
    getMinWidth
  }) {
    this.destroy()

    this.beforeTableRef = beforeTableRef
    this.afterTableRef = afterTableRef

    beforeTableRef?.doLayout?.()
    afterTableRef?.doLayout?.()

    this.beforeWrapper = getBodyWrapper(beforeTableRef)
    this.beforeHeaderWrapper = getHeaderWrapper(beforeTableRef)
    this.afterWrapper = getBodyWrapper(afterTableRef)
    this.afterHeaderWrapper = getHeaderWrapper(afterTableRef)

    if (this.beforeWrapper && this.afterWrapper) {
      this.beforeWrapper.addEventListener('scroll', this._handleBeforeScroll)
      this.afterWrapper.addEventListener('scroll', this._handleAfterScroll)
    }

    if (afterDetailList?.length && this.afterWrapper) {
      this.scrollFirstChangeCell(
        columns || [],
        afterDetailList,
        this.afterWrapper,
        getMinWidth
      )
    }
  }

  _scheduleUnlock() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.scrollType = undefined
    }, 200)
  }

  _setScrollLeft(tableRef, wrapper, headerWrapper, value) {
    if (typeof tableRef?.setScrollLeft === 'function') {
      tableRef.setScrollLeft(value)
    } else if (wrapper) {
      wrapper.scrollLeft = value
    }

    if (headerWrapper) {
      headerWrapper.scrollLeft = value
    }
  }

  _handleBeforeScroll() {
    if (this.scrollType === 'after' || !this.beforeWrapper) return

    this.scrollType = 'before'
    this._scheduleUnlock()
    const scrollLeft = this.beforeWrapper.scrollLeft

    requestAnimationFrame(() => {
      this._setScrollLeft(
        this.afterTableRef,
        this.afterWrapper,
        this.afterHeaderWrapper,
        scrollLeft
      )
    })
  }

  _handleAfterScroll() {
    if (this.scrollType === 'before' || !this.afterWrapper) return

    this.scrollType = 'after'
    this._scheduleUnlock()
    const scrollLeft = this.afterWrapper.scrollLeft

    requestAnimationFrame(() => {
      this._setScrollLeft(
        this.beforeTableRef,
        this.beforeWrapper,
        this.beforeHeaderWrapper,
        scrollLeft
      )
    })
  }

  scrollFirstChangeCell(columns, afterDetailList, afterWrapper, getMinWidth) {
    if (typeof getMinWidth !== 'function') return

    let changeCellLeft = 0
    const changeCell = columns.find(column => {
      const changed = afterDetailList.some(detail =>
        detail.updateMsgList?.some(message => message.name === column.prop)
      )

      if (changed) return true

      if (!column.fixed && column.visible) {
        changeCellLeft += Number(getMinWidth(column)) || 0
      }
      return false
    })

    if (!changeCell || changeCell.fixed) return

    this._setScrollLeft(
      this.afterTableRef,
      afterWrapper,
      this.afterHeaderWrapper,
      changeCellLeft
    )
  }

  destroy() {
    if (this.beforeWrapper) {
      this.beforeWrapper.removeEventListener('scroll', this._handleBeforeScroll)
    }
    if (this.afterWrapper) {
      this.afterWrapper.removeEventListener('scroll', this._handleAfterScroll)
    }

    clearTimeout(this.timer)
    this.beforeTableRef = undefined
    this.afterTableRef = undefined
    this.beforeWrapper = undefined
    this.beforeHeaderWrapper = undefined
    this.afterWrapper = undefined
    this.afterHeaderWrapper = undefined
    this.scrollType = undefined
    this.timer = undefined
  }
}
