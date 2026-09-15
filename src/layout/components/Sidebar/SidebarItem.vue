<template>
  <div v-if="!item.hidden">
    <template
      v-if="
        hasOneShowingChild(item.children, item) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow
      "
    >
      <app-link
        v-if="onlyOneChild.meta"
        :to="resolvePath(onlyOneChild.path, onlyOneChild.query)"
      >
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
          class="erp-menu-item"
          @click="menuItemClick(onlyOneChild)"
        >
          <svg-icon
            :icon-class="
              onlyOneChild.meta.icon || (item.meta && item.meta.icon)
            "
          />
          <template #title>
            <span
              class="menu-title"
              :title="hasTitle(onlyOneChild.meta.title)"
            >
              {{ getMenuTitle(onlyOneChild.meta.title) }}
            </span>
            <el-badge
              v-if="getMenuBadge(onlyOneChild.name) > 0"
              :max="99"
              :value="getMenuBadge(onlyOneChild.name)"
              class="erp-menu-badge"
            />
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu
      v-else
      ref="subMenu"
      :index="resolvePath(item.path)"
      teleported
    >
      <template v-if="item.meta" #title>
        <svg-icon :icon-class="item.meta && item.meta.icon" />
        <span class="menu-title" :title="hasTitle(item.meta.title)">
          {{ getMenuTitle(item.meta.title) }}
        </span>
        <el-badge
          v-if="getGroupBadge(item.name) > 0"
          is-dot
          class="erp-menu-badge erp-menu-dot"
        />
      </template>

      <sidebar-item
        v-for="(child, index) in item.children"
        :key="child.path + index"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { isExternal } from '@/utils/validate'
import AppLink from './Link'
import { getNormalPath } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance()

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
})

const onlyOneChild = ref({})

const bpmTaskCountData = computed(
  () => proxy.$store?.getters?.bpmTaskCountData || {}
)
const inventoryCountData = computed(
  () => proxy.$store?.getters?.inventoryCountData || {}
)
const salesCountData = computed(
  () => proxy.$store?.getters?.salesCountData || {}
)
const purchaseCountData = computed(
  () => proxy.$store?.getters?.purchaseCountData || {}
)

const salesManagementCount = computed(() => {
  const data = salesCountData.value
  return (
    (data.siPendingCount || 0) +
    (data.sqPendingCount || 0) +
    (data.soPendingCount || 0) +
    (data.pdnPendingCount || 0) +
    (data.sgrPendingCount || 0) +
    (data.piPendingCount || 0)
  )
})

const purchaseManagementCount = computed(() => {
  const data = purchaseCountData.value
  return (
    (data.prPendingCount || 0) +
    (data.rfqPendingCount || 0) +
    (data.pqPendingCount || 0) +
    (data.poPendingCount || 0) +
    (data.purchaseReturnPendingCount || 0) +
    (data.consignmentOrderPendingCount || 0)
  )
})

const inventoryManagementCount = computed(() => {
  const data = inventoryCountData.value
  return (data.auditPendingCount || 0) + (data.egrPendingCount || 0)
})

function getMenuBadge(name) {
  const badgeMap = {
    ToDoTask: bpmTaskCountData.value.myTodoTaskCount,
    ProcessPendingAction: bpmTaskCountData.value.systemTodoTaskCount,
    InventoryAudit: inventoryCountData.value.auditPendingCount,
    StoreIssueChit: inventoryCountData.value.storeIssueChitPendingCount,
    EmergencyGoodsReceipt: inventoryCountData.value.egrPendingCount,
    SalesInquiry: salesCountData.value.siPendingCount,
    SalesQuotation: salesCountData.value.sqPendingCount,
    SalesOrder: salesCountData.value.soPendingCount,
    PreDeliveryNotice: salesCountData.value.pdnPendingCount,
    SalesGoodsReturn: salesCountData.value.sgrPendingCount,
    ProformaInvoice: salesCountData.value.piPendingCount,
    PurchaseRequisition: purchaseCountData.value.prPendingCount,
    RequestForQuotation: purchaseCountData.value.rfqPendingCount,
    PurchaseQuotation: purchaseCountData.value.pqPendingCount,
    PurchaseOrder: purchaseCountData.value.poPendingCount,
    PurchaseReturnOrder: purchaseCountData.value.purchaseReturnPendingCount,
    ConsignmentOrder: purchaseCountData.value.consignmentOrderPendingCount
  }
  return Number(badgeMap[name]) || 0
}

function getGroupBadge(name) {
  const badgeMap = {
    Bpm: bpmTaskCountData.value.allTodoTaskCount,
    MyTask: bpmTaskCountData.value.myTodoTaskCount,
    AdministratorOperation: bpmTaskCountData.value.systemTodoTaskCount,
    InventoryManagement: inventoryManagementCount.value,
    ProjectManagement: inventoryCountData.value.storeIssueChitPendingCount,
    SalesManagement: salesManagementCount.value,
    PurchaseManagement: purchaseManagementCount.value
  }
  return Number(badgeMap[name]) || 0
}

function hasOneShowingChild(children = [], parent) {
  if (!children) {
    children = []
  }
  const showingChildren = children.filter(child => {
    if (child.hidden) {
      return false
    }
    onlyOneChild.value = child
    return true
  })

  if (showingChildren.length === 1) {
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

function resolvePath(routePath, routeQuery) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  if (routeQuery) {
    const query = JSON.parse(routeQuery)
    return {
      path: getNormalPath(props.basePath + '/' + routePath),
      query
    }
  }
  return getNormalPath(props.basePath + '/' + routePath)
}

function hasTitle(title) {
  const titleStr = proxy.getMenuTitle(title)
  return titleStr.length > 5 ? titleStr : ''
}

function menuItemClick(menuItem) {
  if (proxy.$route.name !== menuItem.name) return

  if (menuItem.name === 'ToDoTask') {
    proxy.$EventBus?.emit('toDoTaskQueryList')
  } else if (menuItem.name === 'ProcessPendingAction') {
    proxy.$EventBus?.emit('processPendingActionQueryList')
  }
}
</script>

<style scoped>
.erp-menu-item {
  position: relative;
}

.menu-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.erp-menu-badge {
  position: absolute;
  right: 6px;
  top: 0;
  z-index: 3;
  flex-shrink: 0;
}

.erp-menu-dot {
  top: 50%;
  transform: translateY(-50%);
}
</style>
