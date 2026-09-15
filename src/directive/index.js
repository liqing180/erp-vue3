import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'
import copyText from './common/copyText'
import dialogDragWidth from './dialog/dragWidth'
import thousandSplit from './thousandSplit'
import dragTree from './dragTree'
export default function directive(app) {
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
  app.directive('copyText', copyText)
  app.directive('dialogDragWidth', dialogDragWidth)
  /* 数字千分符 */
  app.directive('thousandSplit', thousandSplit)
  /* 拖拽树 */
  app.directive('dragTree', dragTree)
}
