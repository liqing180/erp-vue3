import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/styles/index.scss'
import 'virtual:svg-icons-register'
import store from '@/store'
import pinia from '@/Pinia'
import i18n from '@/lang'
import registerErpGlobals from '@/bootstrap/registerErpGlobals'
import routeMixin from '@/bootstrap/erpRouteMixin'
import plugins from '@/plugins'
import icons from '@/components/SvgIcon/svgicon'
import directive from '@/directive'
import trim from '@/utils/trimOfObj'
import numbers from '@/utils/numberTofixed'
import boolean from '@/utils/resultOfBoolean'
import system from '@/router/system'
import Index from '@/views/system/paymentTerm/index.vue'
import Selector from '@/views/system/paymentTerm/selectPaymentTermDlg.vue'
import Editor from '@/views/system/paymentTerm/editPaymentTernDlg/editPaymentTernDlg.vue'
import { fixture, requests } from './mock-request.js'
store.state.user.permissions = ['*:*:*']
store.state.user.nickName = '迁移测试'
i18n.global.locale.value = 'zh'
const router = createRouter({history: createWebHashHistory(), routes: [
  {path: '/', redirect: '/system/paymentTerm'},
  {path: '/system/paymentTerm', component: Index, name: 'PaymentTerm'},
  ...system.children.filter(route => route.name.includes('PaymentTerm')).map(route => ({...route, path: '/system/' + route.path}))
]})
const Root = {
  components: {Selector, Editor},
  data: () => ({requests, result: '', readOnly: false, numeric: 1234.5, indonesia: false}),
  methods: {
    toggleNumbers() { this.indonesia = !this.indonesia; store.state.user.legalEntityInfo = {countryId: this.indonesia ? '96' : '1'} }, openEditor() { this.$refs.editor.handleUpdate(fixture) },
    togglePermission() { this.readOnly = !this.readOnly; store.state.user.permissions = this.readOnly ? [] : ['*:*:*'] },
    success(row) { this.result = JSON.stringify(row) }
  },
  template: `<div><nav style="padding:12px;display:flex;gap:15px"><router-link to="/system/paymentTerm">列表</router-link><router-link to="/system/addPaymentTerm?timeId=1">新增</router-link><router-link to="/system/editPaymentTerm?id=101&timeId=2">编辑</router-link><button @click="$refs.selector.handleAdd()">选择弹窗</button><button @click="openEditor">业务编辑弹窗</button><button @click="togglePermission">{{readOnly ? '恢复权限' : '关闭编辑权限'}}</button></nav><section><button @click="toggleNumbers">切换数字格式</button><el-input-number aria-label="精度回归" v-model="numeric" :precision="2" v-thousandSplit="{precision: 2}" /><span id="numeric-value">{{numeric}}</span></section><router-view /><Selector ref="selector" :paymentTermPurposeList="['1']" businessPartnerId="BP-1" menuPerms="test:paymentTerm" @onSuccess="success" /><Editor ref="editor" @onSuccess="success" /><details><summary>测试记录</summary><pre id="test-result">{{result}}</pre><pre id="test-requests">{{JSON.stringify(requests, null, 2)}}</pre></details></div>`
}
const app = createApp(Root)
app.use(router).use(store).use(pinia).use(i18n).use(ElementPlus, {size: 'small'}).use(plugins).use(icons).use(trim).use(numbers).use(boolean)
registerErpGlobals(app, i18n)
app.mixin(routeMixin)
directive(app)
app.mount('#app')

