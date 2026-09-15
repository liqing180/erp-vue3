<template>
  <div class="tree-transfer">
    <div class="left-tree">
      <el-input v-model="leftSearch" placeholder="" />
      <div class="list">
        <!-- v-if="reLoad" -->
        <el-tree
          ref="treeRefL"
          :data="leftData"
          show-checkbox
          default-expand-all
          :node-key="nodeKey"
          highlight-current
          :props="defaultProps"
          :filter-node-method="filterNodeL"
          :empty-text="$t('ui.noData')"
        />
      </div>
    </div>
    <div class="btn-div">
      <el-button
        :icon="Back"
        type="primary"
        :disabled="disabled"
        @click="toLeft()"
      />
      <el-button
        :icon="Right"
        type="primary"
        :disabled="disabled"
        @click="toRight()"
      />
    </div>
    <div class="right-tree">
      <el-input v-model="rightSearch" placeholder="" />
      <div class="list">
        <!-- v-if="reLoad" -->
        <el-tree
          ref="treeRefR"
          :data="rightData"
          show-checkbox
          default-expand-all
          :node-key="nodeKey"
          highlight-current
          :props="defaultProps"
          :filter-node-method="filterNodeR"
          :empty-text="$t('ui.noData')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { Right, Back } from '@element-plus/icons-vue'

const props = defineProps({
  nodeKey: String,
  fromData: Array,
  toData: Array,
  defaultProps: {},
  leftTit: String,
  rightTit: String,
  disabled: {
    type: Boolean,
    default: false
  }
})

//定义emit
const emit = defineEmits(['checkVal'])
const treeRefL = ref()
const treeRefR = ref()
const leftData = ref()
const rightData = ref()
const reLoad = ref(true)
// 列表查询条件
const leftSearch = ref('')
const rightSearch = ref('')

//右侧数据
const toData1 = ref()
// 右侧需要移除的数据
const removeData = ref()

defineExpose({
  /**
   * 清空数据
   */
  clearData() {
    toData1.value = []
  },
  /**
   * 初始化数据
   */
  initData(data = []) {
    const originalLeft = JSON.parse(JSON.stringify(props.fromData))
    const originalRight = JSON.parse(JSON.stringify(props.fromData))
    const rightList = JSON.parse(JSON.stringify(data))
    console.log(rightList, '===101')
    toData1.value = rightList
    removeData.value = []
    if (props.toData.length > 0) {
      leftData.value = sortData(originalLeft, props.toData, 'left')
      rightData.value = sortData(originalRight, props.toData, 'right')
    } else {
      leftData.value = originalLeft
      rightData.value = []
    }
  }
})

watch(leftSearch, val => {
  treeRefL.value.filter(val)
})
watch(rightSearch, val => {
  treeRefR.value.filter(val)
})

//方法
//去右边
const toRight = () => {
  // 将勾选中的数据保存到toData中
  const checkNodes = treeRefL.value.getCheckedNodes(false, false)
  if (checkNodes.length <= 0) return
  const newArr = toData1.value.concat(checkNodes)
  const obj = {}
  const peon = newArr.reduce((cur, next) => {
    // obj[next[props.nodeKey]]
    //   ? ''
    //   : (obj[next[props.nodeKey]] = true && cur.push(next))
    if (!obj[next[props.nodeKey]]) {
      obj[next[props.nodeKey]] = true
      cur.push(next)
    }
    return cur
  }, []) //设置cur默认类型为数组，并且初始值为空的数组
  console.log(peon, '===139')
  toData1.value = peon
  // reLoad.value = false
  const originalLeft = JSON.parse(JSON.stringify(props.fromData))
  const originalRight = JSON.parse(JSON.stringify(props.fromData))
  // 抽离出选中数据中的id
  const ids = extractId(toData1.value)
  // 重新整理两侧树中数据
  leftData.value = sortData(originalLeft, ids, 'left')
  rightData.value = sortData(originalRight, ids, 'right')
  // nextTick(() => {
  //   reLoad.value = true
  // })
  checkVal()
}
//去左边
const toLeft = () => {
  // 将勾选中的数据保存到toData中
  const checkNodes = treeRefR.value.getCheckedNodes(false, false)
  if (checkNodes.length <= 0) return
  const newArr = removeData.value.concat(checkNodes)
  const obj = {}
  const peon = newArr.reduce((cur, next) => {
    // obj[next[props.nodeKey]]
    //   ? ''
    //   : (obj[next[props.nodeKey]] = true && cur.push(next))
    if (!obj[next[props.nodeKey]]) {
      obj[next[props.nodeKey]] = true
      cur.push(next)
    }
    return cur
  }, []) //设置cur默认类型为数组，并且初始值为空的数组
  console.log(peon, '===171')
  const dataNeedRemove = peon
  reLoad.value = false
  const originalLeft = JSON.parse(JSON.stringify(props.fromData))
  const originalRight = JSON.parse(JSON.stringify(props.fromData))
  // 抽离出选中数据中的id
  const idsNeedRemove = extractId(dataNeedRemove)
  // 删除相同id
  const oldData = removeId(toData1.value, idsNeedRemove)
  toData1.value = oldData
  // 右侧列表需要保留的数据的id
  const ids = extractId(oldData)
  // 重新整理两侧树中数据
  leftData.value = sortData(originalLeft, ids, 'left')
  rightData.value = sortData(originalRight, ids, 'right')
  console.log(ids, rightData.value, '===186')
  nextTick(() => {
    reLoad.value = true
  })
  checkVal()
}
/**
 * 将tree中的整理进行整理，判断数据是否再tree中显示
 * @param data tree数据
 * @param condition 被选中的数据
 * @param leftRight 整理左侧tree中的数据还是整理右侧tree中的数据
 */
const sortData = (data, condition, leftRight) => {
  if (leftRight === 'left') {
    const result = []
    for (const item of data) {
      // 判断item的id是否在condition中，如果不在，说明不需要删除
      if (!condition.includes(item.id)) {
        // 如果item有children属性，递归调用本函数，传入item的children和condition
        if (item.children && item.children.length > 0) {
          item.children = sortData(item.children, condition, leftRight)
        }
        // 如果item的children为空数组，删除item的children属性
        // if (item.children && item.children.length === 0) {
        //   delete item.children
        // }
        result.push(item)
      }
    }
    return result
  } else {
    const result = []
    for (const item of data) {
      // 如果item的id在condition中，说明该数据需要保留
      if (condition.includes(item.id)) {
        result.push(item)
      } else {
        // 否则，判断item是否有children属性
        if (item.children && item.children.length > 0) {
          const subResult = sortData(item.children, condition, leftRight)
          // 如果返回的结果数组不为空，说明有符合条件的子数据
          if (subResult.length > 0) {
            // 将item的children属性更新为返回的结果数组
            item.children = subResult
            result.push(item)
          }
        }
      }
    }
    return result
  }
}
/**
 * 筛选左菜单
 * @param value 筛选值
 * @param data 树
 */
const filterNodeL = (value, data) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
/**
 * 筛选右菜单
 * @param value 筛选值
 * @param data 树
 */
const filterNodeR = (value, data) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
/**
 * 如果新数组中的id再旧数组中存在则删除原始数组中的id
 * @param oldIds 原始id
 * @param newIds 新id
 */
const removeId = (data, newIds) => {
  const ids = []
  for (const item of data) {
    if (!newIds.includes(item.id)) {
      ids.push(item)
    }
  }
  return ids
}
/**
 * 将id从备选中的数据取出
 * @param arr tree中被选中的数据
 */
const extractId = arr => {
  const newArr = []
  for (const i in arr) {
    newArr.push(arr[i].id)
  }
  return newArr
}
//返回父组件
const checkVal = () => {
  emit('checkVal', toData1.value)
}
</script>

<style scoped lang="scss">
.tree-transfer {
  height: 600px !important;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .left-tree,
  .right-tree {
    flex-grow: 1;
    width: calc((100% - 60px) / 2);
    .tree-tit {
      margin-bottom: 10px;
    }
    .list {
      overflow: auto;
      height: 550px;
      border: 1px solid #ddd;
      border-radius: 4px;
      .item {
        padding: 0 10px;
        font-size: 14px;
        line-height: 26px;
        cursor: pointer;
        &.active {
          background: #b9d7fa;
        }
      }
      .item-checkbox {
        height: 26px;
        padding: 0 10px;
        font-size: 14px;
        line-height: 26px;
        & > .el-checkbox {
          height: 26px;
        }
      }
    }
  }
  .btn-div {
    width: 120px;
    flex-shrink: 0;
    display: flex;
    // flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .el-checkbox__input.is-disabled .el-checkbox__inner {
    display: none;
  }
}
</style>
