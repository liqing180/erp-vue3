import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'
import copyText from './common/copyText'
import dialogDragWidth from './dialog/dragWidth'
import dialogDragHeight from './dialog/dragHeight'
import thousandSplit from './thousandSplit'
import dragTree from './dragTree'
import tableTab from './table-tab'

export default function directive(app) {
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
  app.directive('copyText', copyText)
  app.directive('dialogDragWidth', dialogDragWidth)
  app.directive('dialogDragHeight', dialogDragHeight)
  app.directive('thousandSplit', thousandSplit)
  app.directive('dragTree', dragTree)
  app.directive('table-tab', tableTab)
}
