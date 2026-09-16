// ERP-VUE2 曾通过 element-ui patch 阻止纯空白单元格显示 overflow tooltip。
// Element Plus 2.9.4 仍只检查 tooltip class / childNodes，因此在应用层集中兼容，
// 避免继续 patch node_modules。
function suppressEmptyTableTooltip(event) {
  const target = event.target
  if (!(target instanceof Element)) return

  const cell = target.closest('.el-table__cell')
  if (!cell) return

  const content = cell.querySelector('.cell.el-tooltip')
  if (!content || content.textContent?.trim()) return

  // Element Plus 的 mouseenter 处理器随后会检查 el-tooltip class。
  // 捕获阶段临时移除，事件同步处理完成后立即恢复，不影响正常样式。
  content.classList.remove('el-tooltip')
  queueMicrotask(() => {
    if (content.isConnected) {
      content.classList.add('el-tooltip')
    }
  })
}

export default function installElementPlusCompat() {
  document.addEventListener('mouseenter', suppressEmptyTableTooltip, true)
}
