import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as icons from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import '../src/assets/styles/index.scss'
import '../src/App.vue?vue&type=style&index=0&lang.scss'
import '../src/store'
import Fixture from './Fixture.vue'
import cache from '../src/plugins/cache'
import numberTofixed from '../src/utils/numberTofixed'
import resultOfBoolean from '../src/utils/resultOfBoolean'
import i18n from '../src/lang'
import productLocale from '../src/views/productManagement/lang'
import salesLocale from '../src/views/salesManagement/lang'
import DescriptionEditDlg from '../src/components/Common/descriptionToolTipShow/descriptionEditDlg.vue'
import DescriptionToolTipShow from '../src/components/Common/descriptionToolTipShow/descriptionToolTipShow.vue'
import TablePropError from '../src/components/Common/TablePropError'
import { parseTime, showUomLabel } from '../src/utils/ruoyi'
import tableTab from '../src/directive/table-tab'
import { counts } from './counts.js'

for (const locale of [productLocale, salesLocale]) {
  for (const [language, messages] of Object.entries(locale))
    i18n.global.mergeLocaleMessage(language, messages)
}
i18n.global.locale.value = 'zh'
const app = createApp(Fixture)
app.use(ElementPlus, { size: 'small' })
app.use(i18n)
app.use(numberTofixed)
app.use(resultOfBoolean)
for (const [name, icon] of Object.entries(icons)) app.component(name, icon)
app.component('DescriptionEditDlg', DescriptionEditDlg)
app.component('DescriptionToolTipShow', DescriptionToolTipShow)
app.component('TablePropError', TablePropError)
const empty = { render: () => null }
for (const name of ['RightToolbar', 'ImportDlg', 'DocumentNoLink', 'SvgIcon'])
  app.component(name, empty)
app.directive('table-tab', tableTab)
app.directive('thousandSplit', {})
Object.assign(app.config.globalProperties, {
  $cache: cache,
  $store: {
    getters: {
      size: 'small',
      fmtForYmd: '{y}-{m}-{d}',
      fmtForYmdhms: '{y}-{m}-{d} {h}:{i}:{s}'
    }
  },
  checkPermi: () => true,
  parseTime,
  showUomLabel
})
app.mixin({
  data: () => ({ dict: { type: { sales_inquiry_product_type: [] } } }),
  mounted() {
    const name = this.$options.name || 'Anonymous'
    counts.mounted[name] = (counts.mounted[name] || 0) + 1
  },
  updated() {
    const name = this.$options.name || 'Anonymous'
    counts.updated[name] = (counts.updated[name] || 0) + 1
  }
})
app.mount('#fixture')
