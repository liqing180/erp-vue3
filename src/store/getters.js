const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  nickName: state => state.user.nickName,
  corporateName: state => state.user.corporateName,
  tenantType: state => state.user.tenantType,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  legalEntityKey: state => state.user.legalEntityKey,
  permission_routes: state => state.permission.routes,
  topbarRouters: state => state.permission.topbarRouters,
  defaultRoutes: state => state.permission.defaultRoutes,
  sidebarRouters: state => state.permission.sidebarRouters,
  language: state => state.app.language,
  bpmTaskCountData: state => state.user.bpmTaskCountData,
  inventoryCountData: state => state.user.inventoryCountData,
  salesCountData: state => state.user.salesCountData,
  purchaseCountData: state => state.user.purchaseCountData,
  legalEntityInfo: state => state.user.legalEntityInfo,
  commonUomList: state => state.user.commonUomList,
  isAlreadySetPassword: state => state.user.isAlreadySetPassword,
  sysDockingSwitch: state => state.user.sysDockingSwitch,
  sysDockingSwitchQC: state => state.user.sysDockingSwitchQC,

  fmtForYmdhms(state) {
    const fmtForTime = state.user.fmtForTime
    return fmtForTime ? `${fmtForTime} HH:mm:ss` : 'YYYY/MM/DD HH:mm:ss'
  },

  fmtForYmdhm(state) {
    const fmtForTime = state.user.fmtForTime
    return fmtForTime ? `${fmtForTime} HH:mm` : 'YYYY/MM/DD HH:mm'
  },

  fmtForMdhm(state) {
    let fmtForTime = state.user.fmtForTime
    if (!fmtForTime) return 'MM/DD HH:mm'
    fmtForTime = fmtForTime
      .replace('YYYY/', '')
      .replace('/YYYY', '')
      .replace('yyyy/', '')
      .replace('/yyyy', '')
    return `${fmtForTime} HH:mm`
  },

  fmtForMd(state) {
    let fmtForTime = state.user.fmtForTime
    if (!fmtForTime) return 'MM/DD'
    fmtForTime = fmtForTime
      .replace('YYYY/', '')
      .replace('/YYYY', '')
      .replace('yyyy/', '')
      .replace('/yyyy', '')
    return fmtForTime
  },

  fmtForYmd(state) {
    return state.user.fmtForTime || 'YYYY/MM/DD'
  }
}

export default getters
