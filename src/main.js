import { createApp } from 'vue'
import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import vue3TreeOrg from 'vue3-tree-org'
import 'vue3-tree-org/lib/vue3-tree-org.css'

import '@/assets/styles/index.scss'
import App from './App'
import Pinia from './Pinia'
import store from './store'
import router from './router'
import directive from './directive'
import plugins from './plugins'
import i18n from './lang'

import { download } from '@/utils/request'
import importOrExportDownFile from '@/utils/importOrExportDownFile'
import eventBus from '@/utils/eventBus'
import menuKey from '@/config/menuKey'

import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission'

import { getConfigKey } from '@/api/system/config'
import { getDicts } from '@/api/system/dict/data'
import { useDict } from '@/utils/dict'
import MyDictDataClass from '@/utils/dict/myDictDataClass'

import {
  parseTime,
  resetForm,
  addDateRange,
  handleTree,
  selectDictLabel,
  selectDictLabels,
  isContain,
  appointTime,
  showUomLabel
} from '@/utils/ruoyi'

import trimOfObj from '@/utils/trimOfObj/index'
import TypeJudge from '@/utils/jsType/index'
import { queryAllPageList } from '@/mixins/tableMinx.js'
import { initSystemConfig } from '@/initSystemConfig/initSystemConfig.js'
import { getToken } from '@/utils/auth'
import { checkPermi, checkRole } from '@/utils/permission'

import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import Editor from '@/components/Editor'
import FileUpload from '@/components/FileUpload'
import ImageUpload from '@/components/ImageUpload'
import ImagePreview from '@/components/ImagePreview'
import DictTag from '@/components/DictTag'
import SearchForm from '@/components/Common/searchFormNew/IndexFold.vue'
import MobilePhoneInput from '@/components/Common/MobilePhoneInput/MobilePhoneInput.vue'

import numberTofixed from '@/utils/numberTofixed/index'
import resultOfBoolean from '@/utils/resultOfBoolean/index'

import FormPageLayout from '@/components/formPageLayout/index.vue'
import FormCollapseItemTitle from '@/components/formCollapseItemTitle/index.vue'
import FormPageLayoutTabs from '@/components/formPageLayoutTabs/index.vue'
import FormSteps from '@/components/formSteps/index.vue'
import SelectInput from '@/components/Common/SelectInput/SelectInput.vue'
import CommonSelect from '@/components/Common/commonSelect'
import CommonSelectGroup from '@/components/Common/commonSelect/commonSelectGroup.vue'
import CommonSelectAndList from '@/components/Common/commonSelect/CommonSelectAndList.vue'
import CommonMultipleSelect from '@/components/Common/commonMultipleSelect'
import ToolTipShowList from '@/components/Common/ToolTipShowList'
import TablePropError from '@/components/Common/TablePropError'
import TableNonInventoryItem from '@/components/Common/TableNonInventoryItem'
import DocumentNoLink from '@/components/Common/documentNoLink'
import ComparisonInput from '@/components/Common/comparisonInput'
import myUpload from '@/components/Common/htz-image-upload/my-upload.vue'
import ExportDlg from '@/components/Common/exportDlg/ExportDlg.vue'
import ImportDlg from '@/components/Common/importDlg/importDlg.vue'
import MapPointSelect from '@/components/Common/MapPointSelect'
import MapDrawingPolygon from '@/components/Common/MapDrawingPolygon'

import SysNotifyClass from '@/layout/components/notifications/sysNotify/sysNotify.js'
import { isEmail } from '@/utils/validate.js'
import ElInput from '@/components/CommonInput/index.vue'
import lang from './lang/el'

const app = createApp(App)
const globalProperties = app.config.globalProperties

if (getToken()) {
  queryAllPageList()
  initSystemConfig()
}

// 基础全局方法。
globalProperties.getConfigKey = getConfigKey
globalProperties.getDicts = getDicts
globalProperties.MyDictDataClass = MyDictDataClass
globalProperties.useDict = useDict
globalProperties.download = download
globalProperties.$importOrExportDownFile = importOrExportDownFile
globalProperties.parseTime = parseTime
globalProperties.resetForm = resetForm
globalProperties.handleTree = handleTree
globalProperties.addDateRange = addDateRange
globalProperties.selectDictLabel = selectDictLabel
globalProperties.selectDictLabels = selectDictLabels
globalProperties.checkPermi = checkPermi
globalProperties.checkRole = checkRole
globalProperties.$sysNotifyClass = SysNotifyClass
globalProperties.appointTime = appointTime
globalProperties.isEmail = isEmail
globalProperties.$isContain = isContain
globalProperties.$TypeJudge = TypeJudge
globalProperties.showUomLabel = showUomLabel

// ERP-VUE2 兼容能力：业务页面迁移后仍可保持原调用方式。
globalProperties.$EventBus = eventBus
globalProperties.menuKey = menuKey

globalProperties.getMenuTitle = title => {
  return i18n.global.t(`menu.${title}`)
}

globalProperties.getMenuTitleDelEdit = title => {
  const text = i18n.global.t(`menu.${title}`)
  return text.replace(
    /^(Create\s|add\s|edit\s|view\s|revise\s|创建|新增|编辑|查看|修正)/i,
    ''
  )
}

globalProperties.getFileNameDate = fileName => {
  return `${fileName} ${parseTime(Date.now(), 'YYYY-MM-DD')}`
}

globalProperties.getTablePropListForSort = configColumn => {
  if (!configColumn) return undefined
  const fixedProps = []
  const props = []
  configColumn.forEach(item => {
    if (item.fixed) {
      fixedProps.push(item.prop)
    } else {
      props.push(item.prop)
    }
  })
  return [...fixedProps, ...props]
}

// 全局组件。
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)
app.component('SearchForm', SearchForm)
app.component('MobilePhoneInput', MobilePhoneInput)
app.component('FormPageLayout', FormPageLayout)
app.component('FormCollapseItemTitle', FormCollapseItemTitle)
app.component('FormPageLayoutTabs', FormPageLayoutTabs)
app.component('FormSteps', FormSteps)
app.component('SelectInput', SelectInput)
app.component('CommonSelect', CommonSelect)
app.component('CommonSelectGroup', CommonSelectGroup)
app.component('CommonSelectAndList', CommonSelectAndList)
app.component('CommonMultipleSelect', CommonMultipleSelect)
app.component('ToolTipShowList', ToolTipShowList)
app.component('TablePropError', TablePropError)
app.component('TableNonInventoryItem', TableNonInventoryItem)
app.component('DocumentNoLink', DocumentNoLink)
app.component('ComparisonInput', ComparisonInput)
app.component('myUpload', myUpload)
app.component('ExportDlg', ExportDlg)
app.component('ImportDlg', ImportDlg)
app.component('MapPointSelect', MapPointSelect)
app.component('MapDrawingPolygon', MapDrawingPolygon)
app.component('ElInput', ElInput)
app.component('svg-icon', SvgIcon)

app.use(vue3TreeOrg)
app.use(router)
app.use(i18n)
app.use(Pinia)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.use(trimOfObj)
app.use(numberTofixed)
app.use(resultOfBoolean)

// numberTofixed / resultOfBoolean 安装后恢复 ERP 数量显示辅助方法。
globalProperties.$getDecNum = num => {
  if (globalProperties.$resultOfBoolean(num)) {
    return num
  }
  return 3
}

globalProperties.$qtyNumberStr = (num, decimalNum) => {
  const getDecimalPlaces = value => {
    const text = (value || 0).toString()
    const decimalIndex = text.indexOf('.')
    if (decimalIndex === -1) return 0
    const digits = text.length - decimalIndex - 1
    return digits >= 4 ? 4 : digits
  }

  if (decimalNum === 3) {
    return globalProperties.$numberStr(num, 3)
  }
  return globalProperties.$numberStr(num, getDecimalPlaces(num))
}

directive(app)

app.use(ElementPlus, {
  locale: Cookies.get('language') === 'en' ? lang.en : lang.zhCn,
  size: Cookies.get('size') === 'mini' ? 'small' : Cookies.get('size') || 'small',
  i18n: (key, value) => i18n.global.t(key, value)
})

// 保留 ERP-VUE2 跨页签 token 同步行为。
window.addEventListener('visibilitychange', () => {
  if (document.hidden || getToken() === store.getters.token) return

  if (!getToken()) {
    router.replace({ path: '/login?redirect=/index' }).finally(() => {
      location.reload()
    })
    return
  }

  if (location.pathname === '/index') {
    location.reload()
    return
  }

  router.replace({ path: '/index' })
})

app.mount('#app')
