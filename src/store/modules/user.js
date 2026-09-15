import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken, removeJSESSIONID } from '@/utils/auth'
import { queryAllPageList } from '@/mixins/tableMinx.js'
import { initSystemConfig } from '@/initSystemConfig/initSystemConfig.js'
import {
  queryTodoTaskCount,
  getInventoryAllPendingCounts,
  getSalesAllPendingCounts,
  getPurchaseAllPendingCounts
} from '@/api/bpm/bpm'
import { getConfigKey } from '@/api/system/config'
import profile from '@/assets/images/profile.jpg'
import cache from '@/plugins/cache'

const user = {
  state: {
    token: getToken(),
    name: '',
    nickName: '',
    corporateName: '',
    email: '',
    mobilePhone: '',
    mobileNum: '',
    mobileCode: '',
    userId: '',
    tenantType: '',
    avatar: '',
    roles: [],
    permissions: [],
    fmtForTime: null,
    sys_file_max_size: 300,
    sys_file_max_count: 9,
    online_preview_url: '',
    unReadNum: 0,
    searchMapAddressMiniMum: 4,
    autoCode: '2',
    legalEntityInfo: {},
    isAlreadySetPassword: '',
    toFixedType: '4',
    commonUomList: [],
    bpmTaskCountData: {},
    inventoryCountData: {},
    salesCountData: {},
    purchaseCountData: {},
    bpmTaskCountTimer: undefined,
    bpmTaskCountTimer2: undefined,
    bpmTaskCountTimer3: undefined,
    bpmTaskCountTimer4: undefined,
    legalEntityKey: 0,
    sysDockingSwitch: false,
    sysDockingSwitchQC: false
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_User_Info: (state, data) => {
      state.email = data.email
      state.mobilePhone = data.mobilePhone
      state.mobileNum = data.mobileNum
      state.mobileCode = data.mobileCode
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_NICK_NAME: (state, nickName) => {
      state.nickName = nickName
    },
    SET_Corporate_Name: (state, name) => {
      state.corporateName = name
    },
    SET_USER_ID: (state, userId) => {
      state.userId = userId
    },
    set_tenant_Type(state, tenantType) {
      state.tenantType = tenantType
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    SET_FMTFORTIME(state, fmtForYMD) {
      state.fmtForTime = fmtForYMD
    },
    SET_ONLINE_PREVIEW_URL(state, url) {
      state.online_preview_url = url
    },
    set_search_map_address_minimum(state, num) {
      state.searchMapAddressMiniMum = num
    },
    setUnReadNum(state, unReadNum) {
      state.unReadNum = unReadNum
    },
    SET_AUTO_CODE(state, value) {
      state.autoCode = value
    },
    SET_LEGAL_ENTITY(state, value) {
      state.legalEntityInfo = value
    },
    SET_UOM_LIST(state, value) {
      state.commonUomList = value || []
    },
    SET_IS_ALREADY_SET_PASSWORD(state, value) {
      state.isAlreadySetPassword = value
    },
    SET_TO_FIXED_TYPE(state, value) {
      state.toFixedType = value
    },
    SET_TASK_COUNT(state, value) {
      state.bpmTaskCountData = value
    },
    SET_TASK_COUNT_TIMER(state, value) {
      if (state.bpmTaskCountTimer) clearInterval(state.bpmTaskCountTimer)
      state.bpmTaskCountTimer = value
    },
    setInventoryTaskCount(state, value) {
      state.inventoryCountData = value
    },
    SET_TASK_COUNT_TIMER2(state, value) {
      if (state.bpmTaskCountTimer2) clearInterval(state.bpmTaskCountTimer2)
      state.bpmTaskCountTimer2 = value
    },
    setSalesTaskCount(state, value) {
      state.salesCountData = value
    },
    SET_TASK_COUNT_TIMER3(state, value) {
      if (state.bpmTaskCountTimer3) clearInterval(state.bpmTaskCountTimer3)
      state.bpmTaskCountTimer3 = value
    },
    setPurchaseTaskCount(state, value) {
      state.purchaseCountData = value
    },
    SET_TASK_COUNT_TIMER4(state, value) {
      if (state.bpmTaskCountTimer4) clearInterval(state.bpmTaskCountTimer4)
      state.bpmTaskCountTimer4 = value
    },
    SET_LEGAL_ENTITY_KEY(state) {
      state.legalEntityKey = Date.now()
    },
    SET_DOCKING_SWITCH(state, value) {
      state.sysDockingSwitch = value
    },
    SET_DOCKING_SWITCH_QC(state, value) {
      state.sysDockingSwitchQC = value
    }
  },

  actions: {
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const { password, code, uuid, tenantCode, tenantType } = userInfo

      return login(username, password, code, uuid, tenantCode, tenantType).then(
        res => {
          const data = res.data || {}
          const token = data.access_token || data.token || res.token
          setToken(token)
          queryAllPageList()
          initSystemConfig()
          commit('SET_TOKEN', token)
        }
      )
    },

    GetInfo({ commit }) {
      return getInfo().then(res => {
        const currentUser = res.user || {}
        const company = res.company || {}
        const avatar = currentUser.avatar || profile

        commit(
          'SET_ROLES',
          res.roles && res.roles.length > 0 ? res.roles : ['ROLE_DEFAULT']
        )
        commit('SET_PERMISSIONS', res.permissions || [])
        commit('SET_NAME', currentUser.userName)
        commit('SET_User_Info', currentUser)
        commit('SET_NICK_NAME', currentUser.nickName)
        commit('SET_Corporate_Name', company.companyName)
        commit('SET_USER_ID', currentUser.userId)
        commit('set_tenant_Type', currentUser.tenantType)
        commit('SET_AVATAR', avatar)
        commit('SET_IS_ALREADY_SET_PASSWORD', currentUser.isAlreadySetPassword)

        getConfigKey('sys.docking.cds.switch').then(response => {
          if (response.code === 200 && response.msg) {
            commit('SET_DOCKING_SWITCH', response.msg === 'true')
          }
        })

        getConfigKey('sys.docking.qc.switch').then(response => {
          if (response.code === 200 && response.msg) {
            commit('SET_DOCKING_SWITCH_QC', response.msg === 'true')
          }
        })

        return res
      })
    },

    LogOut({ commit, state }) {
      return logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_PERMISSIONS', [])
        commit('SET_TASK_COUNT_TIMER', undefined)
        commit('SET_TASK_COUNT_TIMER2', undefined)
        commit('SET_TASK_COUNT_TIMER3', undefined)
        commit('SET_TASK_COUNT_TIMER4', undefined)
        removeToken()
        removeJSESSIONID()
        cache.local.remove('pageSizeList')
        cache.local.remove('tableCellHideData')
      })
    },

    getBPMTaskCount({ commit, state }) {
      const load = () => {
        queryTodoTaskCount({}).then(res => {
          commit('SET_TASK_COUNT', res.data || {})
        })
      }
      load()
      if (state.bpmTaskCountTimer) clearInterval(state.bpmTaskCountTimer)
      commit('SET_TASK_COUNT_TIMER', setInterval(load, 30000))
    },

    getInventoryTaskCount({ commit, state }) {
      const load = () => {
        getInventoryAllPendingCounts({}).then(res => {
          commit('setInventoryTaskCount', res.data || {})
        })
      }
      load()
      if (state.bpmTaskCountTimer2) clearInterval(state.bpmTaskCountTimer2)
      commit('SET_TASK_COUNT_TIMER2', setInterval(load, 30000))
    },

    getSalesTaskCount({ commit, state }) {
      const load = () => {
        getSalesAllPendingCounts({}).then(res => {
          commit('setSalesTaskCount', res.data || {})
        })
      }
      load()
      if (state.bpmTaskCountTimer3) clearInterval(state.bpmTaskCountTimer3)
      commit('SET_TASK_COUNT_TIMER3', setInterval(load, 30000))
    },

    getPurchaseTaskCount({ commit, state }) {
      const load = () => {
        getPurchaseAllPendingCounts({}).then(res => {
          commit('setPurchaseTaskCount', res.data || {})
        })
      }
      load()
      if (state.bpmTaskCountTimer4) clearInterval(state.bpmTaskCountTimer4)
      commit('SET_TASK_COUNT_TIMER4', setInterval(load, 30000))
    },

    FedLogOut({ commit }) {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      commit('SET_TASK_COUNT_TIMER', undefined)
      commit('SET_TASK_COUNT_TIMER2', undefined)
      commit('SET_TASK_COUNT_TIMER3', undefined)
      commit('SET_TASK_COUNT_TIMER4', undefined)
      removeToken()
      removeJSESSIONID()
      cache.local.remove('pageSizeList')
      cache.local.remove('tableCellHideData')
      return Promise.resolve()
    }
  }
}

export default user
