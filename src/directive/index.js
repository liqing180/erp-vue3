import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'
import copyText from './common/copyText'
import dialogDragWidth from './dialog/dragWidth'
import dialogDragHeight from './dialog/dragHeight'
import thousandSplit from './thousandSplit'
import tenRowsHeight from './tenRowsHeight'
import dragTree from './dragTree'
import dragHistory from './dragHistory'
import tableTab from './table-tab'
import defaultSelect from './tagCloseNone'
import optionsTitleFmt from './optionsTitleFmt'
import setCascaderLabelTitle from './setCascaderLabelTitle'

export default function directive(app) {
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
  app.directive('copyText', copyText)
  app.directive('dialogDragWidth', dialogDragWidth)
  app.directive('dialogDragHeight', dialogDragHeight)
  app.directive('thousandSplit', thousandSplit)
  app.directive('tenRowsHeight', tenRowsHeight)
  app.directive('dragTree', dragTree)
  app.directive('dragHistory', dragHistory)
  app.directive('table-tab', tableTab)
  app.directive('defaultSelect', defaultSelect)
  app.directive('optionsTitleFmt', optionsTitleFmt)
  app.directive('setCascaderLabelTitle', setCascaderLabelTitle)
}
