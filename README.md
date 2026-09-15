## 前端运行

```bash
# 若依项目
git clone https://github.com/yangzongzhuan/RuoYi-Vue3.git
# CRM 项目
git clone ssh://git@192.168.101.141:2222/IMG/Frontend/crm-web.git
# node 版本使用nvm 管理
# 1. node 版本使用 21.7.3
nvm use 21.7.3
# 2. 安装依赖
yarn --registry=https://registry.npmmirror.com
# 3. 启动服务
yarn dev

# 构建测试环境 yarn build:stage
# 构建生产环境 yarn build:prod
# 前端访问地址 http://localhost:8088

# 一. 组合式<script setup> 页面， VUEX 与 Pinia 参考以下页面,
# src\layout\components\Sidebar\index.vue

# 二. 组合式<script setup> 使用 i18n
import { useI18n } from "vue-i18n"; // 引入插件中的方法
const i18n = useI18n();
i18n.t('ui.xxx')
# 二. js引入直接使用i18n
import i18n from '@/lang'
i18n.global.t(ui.xxx)

### 四. 子组件输入不更新 :value 替换成 :model-value

### 五. 字典值 dicts: ['sys_user_sex'] 不能使用
# 组合式<script setup> 页面使用
const { proxy } = getCurrentInstance()
proxy.useDict()
# vue2 写法直接使用
this.useDict()
# 多个字典值
const { sys_user_sex, user_status } = this.useDict(
  'sys_user_sex',
  'user_status',
)
this.sys_user_sex = sys_user_sex || []
this.user_status = user_status || []
# 单个字典值
const { user_status } = this.useDict('user_status')
this.user_status = user_status || []

### 六. 表单内路由回退跳转
// this.$store.dispatch('tagsView/delView', this.$route)
// this.$router.push({ path: '/organization/user' })
# 新的方式1 关闭当前页面，返回上一个页面
this.$tab.closePage()
# 新的方式2 关闭当前页面，返回指定页面
const obj = { path: '/organization/user' }
this.$tab.closeOpenPage(obj)
```
