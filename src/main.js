import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
// import locale from 'element-plus/es/locale/lang/zh-cn'
/* 架构图 */
import vue3TreeOrg from 'vue3-tree-org'
import 'vue3-tree-org/lib/vue3-tree-org.css'

import '@/assets/styles/index.scss' // global css
import App from './App'
/* 类似vuex的状态管理工具 */
import Pinia from './Pinia'
/* vuex */
import store from './store'
import router from './router'
import directive from './directive' // directive

// 注册指令
import plugins from './plugins' // plugins
import i18n from './lang' // 国际化语言包
import { download } from '@/utils/request'
import importOrExportDownFile from '@/utils/importOrExportDownFile'

// svg图标
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { getConfigKey } from '@/api/system/config'
import { useDict } from '@/utils/dict'

import {
  parseTime,
  resetForm,
  addDateRange,
  handleTree,
  selectDictLabel,
  selectDictLabels,
  isContain,
  appointTime
} from '@/utils/ruoyi'

import trimOfObj from '@/utils/trimOfObj/index'
import { queryAllPageList } from '@/mixins/tableMinx.js'
import { initSystemConfig } from '@/initSystemConfig/initSystemConfig.js'
import { getToken } from '@/utils/auth'
import { checkPermi, checkRole } from '@/utils/permission'
// 分页组件
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from '@/components/Editor'
// 文件上传组件
import FileUpload from '@/components/FileUpload'
// 图片上传组件
import ImageUpload from '@/components/ImageUpload'
// 图片预览组件
import ImagePreview from '@/components/ImagePreview'
// 字典标签组件
import DictTag from '@/components/DictTag'
// 搜索条件组件
import SearchForm from '@/components/Common/searchFormNew/IndexFold.vue'

import MobilePhoneInput from '@/components/Common/MobilePhoneInput/MobilePhoneInput.vue'
import numberTofixed from '@/utils/numberTofixed/index' // 数字转小数
import resultOfBoolean from '@/utils/resultOfBoolean/index'

/* 表单组件 */
import FormPageLayout from '@/components/formPageLayout/index.vue'
import FormCollapseItemTitle from '@/components/formCollapseItemTitle/index.vue'
import FormPageLayoutTabs from '@/components/formPageLayoutTabs/index.vue'
import SelectInput from '@/components/Common/SelectInput/SelectInput.vue'
import CommonSelect from '@/components/Common/commonSelect'
import CommonSelectGroup from '@/components/Common/commonSelect/commonSelectGroup.vue'
import CommonMultipleSelect from '@/components/Common/commonMultipleSelect'
import ToolTipShowList from '@/components/Common/ToolTipShowList'
/* 文件上传组件 */
import myUpload from '@/components/Common/htz-image-upload/my-upload.vue'
import ExportDlg from '@/components/Common/exportDlg/ExportDlg.vue'
import ImportDlg from '@/components/Common/importDlg/importDlg.vue'
import MapPointSelect from '@/components/Common/MapPointSelect'
import MapDrawingPolygon from '@/components/Common/MapDrawingPolygon'

/* 系统通知类 */
import SysNotifyClass from '@/layout/components/notifications/sysNotify/sysNotify.js'
import { isEmail } from '@/utils/validate.js'

import ElInput from '@/components/CommonInput/index.vue'

const app = createApp(App)

if (getToken()) {
  queryAllPageList()
  initSystemConfig()
}

// 全局方法挂载

app.config.globalProperties.getConfigKey = getConfigKey
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.$importOrExportDownFile = importOrExportDownFile
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels
app.config.globalProperties.checkPermi = checkPermi
app.config.globalProperties.checkRole = checkRole
app.config.globalProperties.$sysNotifyClass = SysNotifyClass
app.config.globalProperties.appointTime = appointTime
app.config.globalProperties.isEmail = isEmail
app.config.globalProperties.$isContain = isContain

app.config.globalProperties.getMenuTitle = title => {
  return i18n.global.t(`menu.${title}`)
}

app.config.globalProperties.getFileNameDate = fileName => {
  // return i18n.t('menu.testMenu')
  return `${fileName} ${parseTime(Date.now(), 'YYYY-MM-DD')}`
}

// 全局组件挂载
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
app.component('SelectInput', SelectInput)
app.component('CommonSelect', CommonSelect)
app.component('CommonSelectGroup', CommonSelectGroup)
app.component('CommonMultipleSelect', CommonMultipleSelect)
app.component('ToolTipShowList', ToolTipShowList)
app.component('myUpload', myUpload)
app.component('ExportDlg', ExportDlg)
app.component('ImportDlg', ImportDlg)
app.component('MapPointSelect', MapPointSelect)
app.component('MapDrawingPolygon', MapDrawingPolygon)

app.use(vue3TreeOrg)
app.use(router)
app.use(i18n)
app.use(Pinia)
app.use(store)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)
app.use(trimOfObj)
app.use(numberTofixed)
app.use(resultOfBoolean)

directive(app)

import lang from './lang/el'
app.use(ElementPlus, {
  locale: Cookies.get('language') === 'en' ? lang.en : lang.zhCn,
  size: Cookies.get('size') || 'small',
  i18n: (key, value) => i18n.global.t(key, value)
})

app.component('ElInput', ElInput)

// 使用element-plus 并且设置全局的大小

app.mount('#app')
