import { download } from '@/utils/request'
import importOrExportDownFile from '@/utils/importOrExportDownFile'
import eventBus from '@/utils/eventBus'
import menuKey from '@/config/menuKey'
import { getConfigKey } from '@/api/system/config'
import { getDicts } from '@/api/system/dict/data'
import { useDict } from '@/utils/dict'
import MyDictDataClass from '@/utils/dict/myDictDataClass'
import TypeJudge from '@/utils/jsType/index'
import { checkPermi, checkRole } from '@/utils/permission'
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
import SysNotifyClass from '@/layout/components/notifications/sysNotify/sysNotify.js'
import { isEmail } from '@/utils/validate.js'

import SvgIcon from '@/components/SvgIcon'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import Editor from '@/components/Editor'
import FileUpload from '@/components/FileUpload'
import ImageUpload from '@/components/ImageUpload'
import ImagePreview from '@/components/ImagePreview'
import DictTag from '@/components/DictTag'
import SearchForm from '@/components/Common/searchFormNew/IndexFold.vue'
import MobilePhoneInput from '@/components/Common/MobilePhoneInput/MobilePhoneInput.vue'
import FormPageLayout from '@/components/formPageLayout/index.vue'
import FormCollapseItemTitle from '@/components/formCollapseItemTitle/index.vue'
import FormPageLayoutTabs from '@/components/formPageLayoutTabs/index.vue'
import FormSteps from '@/components/formSteps/index.vue'
import SelectInput from '@/components/Common/SelectInput/SelectInput.vue'
import CommonSelect from '@/components/Common/commonSelect'
import CommonSelectGroup from '@/components/Common/commonSelect/commonSelectGroup.vue'
import CommonSelectAndList from '@/components/Common/commonSelect/CommonSelectAndList.vue'
import CommonMultipleSelect from '@/components/Common/commonMultipleSelect'
import CommonProductAndPicture from '@/components/Common/commonProductAndPicture'
import ToolTipShowList from '@/components/Common/ToolTipShowList'
import ToolTipShowCategory from '@/components/Common/ToolTipShowCategory'
import ToolTipShowObj from '@/components/Common/ToolTipShowObj'
import ToolTipPaymentTerm from '@/components/Common/ToolTipPaymentTerm'
import DescriptionToolTipShow from '@/components/Common/descriptionToolTipShow/descriptionToolTipShow.vue'
import DescriptionEditDlg from '@/components/Common/descriptionToolTipShow/descriptionEditDlg.vue'
import TablePropError from '@/components/Common/TablePropError'
import TableNonInventoryItem from '@/components/Common/TableNonInventoryItem'
import DocumentNoLink from '@/components/Common/documentNoLink'
import ComparisonInput from '@/components/Common/comparisonInput'
import FileImport from '@/components/Common/fileImport/fileImport.vue'
import CustomDateTime from '@/components/Common/customDateTime/customDateTime.vue'
import myUpload from '@/components/Common/htz-image-upload/my-upload.vue'
import ExportDlg from '@/components/Common/exportDlg/ExportDlg.vue'
import ImportDlg from '@/components/Common/importDlg/importDlg.vue'
import MapPointSelect from '@/components/Common/MapPointSelect'
import MapDrawingPolygon from '@/components/Common/MapDrawingPolygon'
import ErpInputNumber from '@/components/Common/MyInputNumber/index.vue'
import MyDatePicker from '@/components/Common/MyDatePicker/index.vue'
import MyColorPicker from '@/components/color-picker/index.vue'
import ElInput from '@/components/CommonInput/index.vue'

const globalComponents = {
  DictTag,
  Pagination,
  FileUpload,
  ImageUpload,
  ImagePreview,
  RightToolbar,
  Editor,
  SearchForm,
  MobilePhoneInput,
  FormPageLayout,
  FormCollapseItemTitle,
  FormPageLayoutTabs,
  FormSteps,
  SelectInput,
  CommonSelect,
  CommonSelectGroup,
  CommonSelectAndList,
  CommonMultipleSelect,
  ToolTipShowList,
  ToolTipShowCategory,
  ToolTipShowObj,
  ToolTipPaymentTerm,
  DescriptionToolTipShow,
  DescriptionEditDlg,
  TablePropError,
  TableNonInventoryItem,
  DocumentNoLink,
  ComparisonInput,
  FileImport,
  CustomDateTime,
  ExportDlg,
  ImportDlg,
  MapPointSelect,
  MapDrawingPolygon,
  MyDatePicker,
  MyColorPicker,
  'svg-icon': SvgIcon,
  myUpload
}

function registerGlobalMethods(app, i18n) {
  const globals = app.config.globalProperties

  Object.assign(globals, {
    getConfigKey,
    getDicts,
    MyDictDataClass,
    useDict,
    download,
    $importOrExportDownFile: importOrExportDownFile,
    parseTime,
    resetForm,
    handleTree,
    addDateRange,
    selectDictLabel,
    selectDictLabels,
    checkPermi,
    checkRole,
    $sysNotifyClass: SysNotifyClass,
    appointTime,
    isEmail,
    $isContain: isContain,
    $TypeJudge: TypeJudge,
    showUomLabel,
    $EventBus: eventBus,
    menuKey
  })

  globals.getMenuTitle = title => i18n.global.t(`menu.${title}`)
  globals.getMenuTitleDelEdit = title => {
    const text = i18n.global.t(`menu.${title}`)
    return text.replace(
      /^(Create\s|add\s|edit\s|view\s|revise\s|创建|新增|编辑|查看|修正)/i,
      ''
    )
  }
  globals.getFileNameDate = fileName => {
    return `${fileName} ${parseTime(Date.now(), 'YYYY-MM-DD')}`
  }
  globals.getTablePropListForSort = configColumn => {
    if (!configColumn) return undefined
    const fixedProps = []
    const props = []
    configColumn.forEach(item => {
      ;(item.fixed ? fixedProps : props).push(item.prop)
    })
    return [...fixedProps, ...props]
  }

  globals.$getDecNum = num => {
    return globals.$resultOfBoolean(num) ? num : 3
  }
  globals.$qtyNumberStr = (num, decimalNum) => {
    const getDecimalPlaces = value => {
      const text = (value || 0).toString()
      const decimalIndex = text.indexOf('.')
      if (decimalIndex === -1) return 0
      return Math.min(4, text.length - decimalIndex - 1)
    }

    return decimalNum === 3
      ? globals.$numberStr(num, 3)
      : globals.$numberStr(num, getDecimalPlaces(num))
  }
}

function registerGlobalComponents(app) {
  Object.entries(globalComponents).forEach(([name, component]) => {
    app.component(name, component)
  })

  // ERP-VUE2 历史名称兼容。
  app.component('searchForm', SearchForm)
  app.component('commonProductAndPicture', CommonProductAndPicture)

  // 必须在 Element Plus 安装后覆盖官方组件。
  app.component('ElInput', ElInput)
  app.component('ElInputNumber', ErpInputNumber)
}

export default function registerErpGlobals(app, i18n) {
  registerGlobalMethods(app, i18n)
  registerGlobalComponents(app)
}
