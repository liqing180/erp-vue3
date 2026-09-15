<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <breadcrumb
      id="breadcrumb-container"
      class="breadcrumb-container"
      v-if="!settingsStore.topNav"
    />
    <top-nav
      id="topmenu-container"
      class="topmenu-container"
      v-if="settingsStore.topNav"
    />

    <div class="right-menu">
      <div v-show="device !== 'mobile'" style="display: inline-block">
        <header-search id="header-search" class="right-menu-item" />

        <div class="right-menu-item hover-effect">
          <LegalEntity />
        </div>

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <!-- <el-tooltip content="主题模式" effect="dark" placement="bottom">
          <div
            class="right-menu-item hover-effect theme-switch-wrapper"
            @click="toggleTheme"
          >
            <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
            <svg-icon v-if="!settingsStore.isDark" icon-class="moon" />
          </div>
        </el-tooltip> -->
        <div class="right-menu-item hover-effect">
          <QrCode />
        </div>

        <div class="right-menu-item hover-effect">
          <lang-select />
        </div>

        <div class="right-menu-item hover-effect">
          <smallBell />
        </div>

        <el-tooltip
          :content="`${$t('settings.layoutSize')}`"
          effect="dark"
          placement="bottom"
        >
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </div>
      <div class="avatar-container">
        <el-dropdown
          @command="handleCommand"
          class="right-menu-item hover-effect"
          trigger="click"
        >
          <div class="avatar-wrapper">
            <img :src="avatar" class="user-avatar" />
            <span :title="userName" class="user-name ml5">{{ userName }}</span>
            <el-icon><caret-bottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/user/profile">
                <el-dropdown-item>{{ $t('menu.userInfo') }}</el-dropdown-item>
              </router-link>
              <el-dropdown-item
                command="setLayout"
                v-if="settingsStore.showSettings"
              >
                <span>{{ $t('settings.layoutSetting') }}</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span>{{ $t('settings.logout') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'

import Screenfull from '@/components/Screenfull'
import LegalEntity from './LegalEntity'

import LangSelect from '@/components/LangSelect'
import smallBell from './notifications/smallBell'

import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import useSettingsStore from '@/Pinia/modules/settings'
import QrCode from './QrCode'

import { useI18n } from 'vue-i18n' // 引入插件中的方法
const i18n = useI18n()

import { useStore } from 'vuex'
const store = useStore()
const userName = computed(() => store.getters.name)
const avatar = computed(() => store.getters.avatar)
const sidebar = computed(() => store.getters.sidebar)
const device = computed(() => store.getters.device)

const settingsStore = useSettingsStore()

function toggleSideBar() {
  store.dispatch('app/toggleSideBar')
}

function handleCommand(command) {
  switch (command) {
    case 'setLayout':
      setLayout()
      break
    case 'logout':
      logout()
      break
    default:
      break
  }
}

function logout() {
  ElMessageBox.confirm(i18n.t('ui.logoutConfirm'), '', {
    confirmButtonText: i18n.t('uiBtn.yes'),
    cancelButtonText: i18n.t('uiBtn.no'),
    type: 'warning'
  })
    .then(() => {
      store.dispatch('LogOut').then(() => {
        location.href = '/index'
      })
    })
    .catch(() => {})
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout')
}

function toggleTheme() {
  settingsStore.toggleTheme()
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: var(--navbar-bg);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: var(--navbar-text);
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }

      &.theme-switch-wrapper {
        display: flex;
        align-items: center;

        svg {
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.15);
          }
        }
      }
    }

    .avatar-container {
      margin-right: 40px;
      .avatar-wrapper {
        line-height: 32px;
        margin-top: 8px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .user-name {
          display: inline-block;
          vertical-align: top;
          font-size: 14px;
          min-width: 30px;
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 10px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
