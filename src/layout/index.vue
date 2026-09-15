<template>
  <div
    :class="classObj"
    class="app-wrapper"
    :style="{ '--current-color': theme }"
  >
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <sidebar
      v-if="!sidebar.hide"
      v-show="!operatingFloorFullScreen"
      class="sidebar-container"
    />
    <div
      :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }"
      class="main-container"
      :style="{ marginLeft: operatingFloorFullScreen ? '0px' : '' }"
    >
      <div
        :class="{ 'fixed-header': fixedHeader && !operatingFloorFullScreen }"
      >
        <navbar v-show="!operatingFloorFullScreen" @setLayout="setLayout" />
        <tags-view v-if="needTagsView && !operatingFloorFullScreen" />
      </div>
      <app-main />
      <settings ref="settingRef" />
    </div>
    <SettingNewPasswordDlg ref="settingNewPasswordRef" />
  </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import Sidebar from './components/Sidebar/index.vue'
import { AppMain, Navbar, Settings, TagsView } from './components'
import SettingNewPasswordDlg from './components/SettingNewPasswordDlg/index.vue'
import defaultSettings from '@/settings'
import useSettingsStore from '@/Pinia/modules/settings'
import { useStore } from 'vuex'

const store = useStore()
const settingsStore = useSettingsStore()

const theme = computed(() => settingsStore.theme)
const sidebar = computed(() => store.getters.sidebar)
const device = computed(() => store.getters.device)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)
const operatingFloorFullScreen = computed(
  () => store.state.app.operatingFloorFullScreen
)
const isAlreadySetPassword = computed(
  () => store.state.user.isAlreadySetPassword
)

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

const { width } = useWindowSize()
const WIDTH = 992

watch(
  () => device.value,
  () => {
    if (device.value === 'mobile' && sidebar.value.opened) {
      store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
)

watch(
  isAlreadySetPassword,
  value => {
    if (value === '0') {
      nextTick(() => settingNewPasswordRef.value?.open())
    }
  },
  { immediate: true }
)

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    store.dispatch('app/toggleDevice', 'mobile')
    store.dispatch('app/closeSideBar', { withoutAnimation: true })
  } else {
    store.dispatch('app/toggleDevice', 'desktop')
  }
})

function handleClickOutside() {
  store.dispatch('app/closeSideBar', { withoutAnimation: false })
}

const settingRef = ref(null)
function setLayout() {
  settingRef.value?.openSetting()
}

const settingNewPasswordRef = ref(null)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/mixin.scss';
@import '@/assets/styles/variables.module.scss';

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$base-sidebar-width});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}
</style>
