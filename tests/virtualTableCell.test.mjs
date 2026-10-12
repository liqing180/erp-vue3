import assert from 'node:assert/strict'
import test from 'node:test'
import { computed, h, reactive } from 'vue'
import VirtualTableCell from '../src/components/VirtualTableCell/index.js'

function createCellVm(props, renderSlot) {
  const vm = { $slots: { default: renderSlot }, $attrs: {}, $refs: {} }
  for (const key of ['rowData', 'column', 'rowIndex']) {
    Object.defineProperty(vm, key, { get: () => props[key] })
  }
  VirtualTableCell.created.call(vm)
  const content = computed(() => VirtualTableCell.computed.cellContent.call(vm))
  Object.defineProperty(vm, 'cellContent', { get: () => content.value })
  return vm
}

test('scrolling keeps unchanged inputs and editing invalidates the cache', () => {
  const props = reactive({
    rowData: { qty: 1 },
    column: { key: 'qty' },
    rowIndex: 0
  })
  const vm = createCellVm(props, () => [
    h('input', { value: props.rowData.qty })
  ])
  const first = VirtualTableCell.render.call(vm)[0]
  vm.$slots.default = () => [h('input', { value: props.rowData.qty })]
  VirtualTableCell.beforeUpdate.call(vm)
  assert.equal(VirtualTableCell.render.call(vm)[0], first)
  props.rowData.qty = 9
  const afterEdit = VirtualTableCell.render.call(vm)[0]
  assert.notEqual(afterEdit, first)
  assert.equal(afterEdit.children[0].props.value, 9)
})

test('replacement, reordering, validation and view mode update cell contents', () => {
  const props = reactive({
    rowData: { productName: 'old', productNameError: false },
    column: { key: 'productName' },
    rowIndex: 0
  })
  const form = reactive({ viewOnly: false })
  const renderSlot = context => [
    h(form.viewOnly ? 'span' : 'input', {
      value: context.rowData.productName,
      error: context.rowData.productNameError,
      index: context.rowIndex
    })
  ]
  const vm = createCellVm(props, renderSlot)
  const original = vm.cellContent
  props.rowData = { productName: 'replacement', productNameError: false }
  vm.$slots.default = renderSlot
  VirtualTableCell.beforeUpdate.call(vm)
  assert.notEqual(vm.cellContent, original)
  assert.equal(vm.cellContent[0].props.value, 'replacement')
  props.rowIndex = 4
  VirtualTableCell.beforeUpdate.call(vm)
  assert.equal(vm.cellContent[0].props.index, 4)
  props.rowData.productNameError = true
  assert.equal(vm.cellContent[0].props.error, true)
  form.viewOnly = true
  assert.equal(vm.cellContent[0].type, 'span')
})

test('native cell attributes update without stale memoized values', () => {
  const props = reactive({ rowData: {}, column: {}, rowIndex: 0 })
  const vm = createCellVm(props, () => [h('span', 'text')])
  vm.$attrs = { class: 'first' }
  const first = VirtualTableCell.render.call(vm)[0]
  vm.$attrs = { class: 'second' }
  const second = VirtualTableCell.render.call(vm)[0]
  assert.notEqual(second, first)
  assert.equal(second.props.class, 'virtual-cell-content second')
})
