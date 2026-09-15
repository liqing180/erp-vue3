# AGENTS.md

## ERP-VUE3 Migration Rules

本仓库是 ERP Vue2 → Vue3 的最终目标项目。

参考源：

```text
ERP-VUE2  = 业务事实来源
CRM-VUE3  = Vue3 技术实现参考
ERP-VUE3  = 唯一允许修改的目标项目
```

---

## 1. 最高优先级规则

任何迁移决策必须遵守：

```text
业务逻辑、接口参数、权限、页面行为
→ ERP-VUE2 为准

Vue3、Element Plus、Vite、Router4、公共基础设施实现方式
→ CRM-VUE3 为准

两者冲突
→ 保留 ERP-VUE2 业务行为
→ 使用 CRM-VUE3 的 Vue3 技术方式实现
```

禁止因为 `CRM-VUE3` 缺少某功能就删除 ERP 功能。

---

## 2. 仓库修改边界

默认：

```text
ERP-VUE2   只读
CRM-VUE3   只读
ERP-VUE3   可修改
```

禁止修改参考仓库。

禁止把临时修复提交到参考仓库。

---

## 3. 不允许一次性全项目自动转换

禁止：

```text
Vue2 全量复制
→ 全局正则替换
→ 一次性修 build
```

必须按：

```text
基础设施
→ 公共组件
→ Directive / Mixin
→ 黄金业务模块
→ 业务域逐模块迁移
```

进行。

---

## 4. 不做无关重构

本次目标是 Vue3 迁移，不是全面重写。

默认保留 Options API。

禁止为了“现代化”批量改为：

```text
Composition API
<script setup>
TypeScript
全量 Pinia
新状态管理架构
新 UI 设计
```

除非任务明确要求。

原则：

```text
行为一致 > 技术炫技
迁移正确 > 代码现代化
小范围可验证 > 大规模重写
```

---

## 5. 修改前必须先分析

处理任何模块前必须查看：

```text
1. ERP-VUE2 对应目录
2. ERP-VUE3 当前目录
3. CRM-VUE3 是否有对应实现
4. 关联 API
5. 公共组件
6. Directive
7. Mixin
8. Router
9. Store / Pinia
10. 第三方依赖
```

禁止只打开一个 `.vue` 文件就直接开始改。

---

## 6. 同名文件不得直接覆盖

如果两个参考项目都有：

```text
components/X
utils/X
plugins/X
```

必须比较：

```text
props
emits
slots
methods
watch
默认值
API 调用
权限逻辑
ref 行为
外链模式
disabled / clear
校验
特殊业务行为
```

分类：

```text
Vue3 已完整覆盖
→ 复用 Vue3

Vue3 缺少 ERP 能力
→ Vue3 为底，补回 ERP 能力

行为差异较大
→ 单独迁移 ERP 版本
```

禁止只根据文件名判断可直接复用。

---

## 7. Vue2 高风险语法

每次迁移必须主动检查：

```text
.sync
slot-scope
slot=
.native
$set
$delete
$listeners
$children
$on
$off
$once
$scopedSlots
/deep/
::v-deep
beforeDestroy
destroyed
inserted
unbind
__vue__
```

发现一种问题后，应搜索同模块或相关目录的同类问题。

禁止只修编译器当前报错。

---

## 8. `.sync` 转换

Vue2：

```vue
<Component :value.sync="form.value" />
```

Vue3：

```vue
<Component v-model:value="form.value" />
```

子组件必须保留：

```js
emits: ['update:value']
```

不能只改父组件。

---

## 9. `$set`

Vue3 中通常改为：

```js
obj[key] = value
```

但禁止全局正则替换。

修改前确认：

```text
对象是否响应式
是否动态添加字段
是否影响子组件
是否涉及数组
```

---

## 10. Slot

Vue2：

```vue
<template slot="header" slot-scope="scope">
```

Vue3：

```vue
<template #header="scope">
```

Vue2：

```vue
<div slot="prepend" />
```

Vue3：

```vue
<template #prepend>
  <div />
</template>
```

---

## 11. Directive 生命周期

Vue2：

```text
bind
inserted
unbind
```

Vue3 根据实际需求改为：

```text
beforeMount
mounted
updated
unmounted
```

禁止保留 Vue2 私有实例访问方式。

---

## 12. `request.js` 是 P0

禁止直接使用 `CRM-VUE3/src/utils/request.js` 覆盖 ERP 逻辑。

必须保留 ERP-VUE2 中：

```text
menuPerms Header
GET menuPerms 提取
POST menuPerms 提取
ERP 轮询接口错误静默
401
410
500
701
权限处理
登录失效
blob 下载
timeout
Network Error
```

核心原则：

```text
Vue3 axios / Element Plus 实现
+
ERP-VUE2 业务行为
```

---

## 13. `menuPerms` 不得丢失

这是数据权限逻辑。

迁移后必须验证：

```text
GET 请求 menuPerms
POST 请求 menuPerms
Header 是否正确
后端数据权限是否一致
```

该问题优先级为 P0。

---

## 14. Router

优先直接使用 Vue3 参考实现：

```js
import.meta.glob(...)
router.addRoute(...)
```

禁止继续迁移 Vue2：

```js
require([`@/views/${view}`], resolve)
```

ERP 独有业务路由必须完整保留。

---

## 15. Vuex / Pinia

本阶段允许：

```text
Vuex 4 + Pinia
```

并存。

禁止为了 Vue3 升级顺便全量 Vuex → Pinia。

只有明确需要修改的模块才处理。

---

## 16. 公共组件先于业务页面

业务模块迁移前优先处理：

```text
FormPageLayout
FormCollapseItemTitle
FormPageLayoutTabs
CommonSelect
CommonSelectGroup
CommonSelectAndList
CommonMultipleSelect
SelectInput
MobilePhoneInput
SearchForm
RightToolbar
Pagination
FileUpload
ImageUpload
myUpload
ExportDlg
ImportDlg
MyInput
MyInputNumber
MyDatePicker
TablePropError
TableNonInventoryItem
DocumentNoLink
ComparisonInput
Tooltip 系列
```

公共问题必须在公共组件中解决。

禁止在业务页面重复写兼容逻辑。

---

## 17. MobilePhoneInput 是同名组件迁移范例

Vue3 参考版本不是完整 ERP 版本。

迁移时必须补回 ERP-VUE2 的：

```text
clearableCode
isDefaultSelect
size
isToken
legalEntityId
外链接口逻辑
```

后续其他同名组件按相同原则处理。

---

## 18. `v-table-tab` 属于 P0/P1

该指令涉及：

```text
Tab
Shift+Tab
Enter
Shift+Enter
固定列
横向滚动
纵向滚动
Select
DatePicker
焦点跳转
```

旧实现依赖：

```text
Vue2 directive 生命周期
Element UI DOM
tableEl.__vue__
```

不得原样复制。

必须重写 Vue3 版本，并进行真实浏览器键盘测试。

---

## 19. Element UI Patch 必须审计

ERP-VUE2 存在：

```text
patches/element-ui+2.15.6.patch
```

迁移必须确认：

```text
Select Tab
Autocomplete Tab
默认 filterable
Select loading / empty
Table scrollbar
Tooltip
Upload 扩展名
```

Element Plus 默认行为不能直接视为与旧 ERP 等价。

---

## 20. 第三方依赖

重点处理：

```text
UmyUI
el-table-virtual-scroll
Vant 2
Ant Design Vue 1.x
vue-awesome-swiper
vue-meta
vue-tree-color
@riophae/vue-treeselect
vuedraggable
vue-cropper
Quill
el-tree-transfer
```

处理顺序：

```text
已有 Vue3 官方版
→ 升级

CRM-VUE3 已有替代方案
→ 优先采用

使用范围很小
→ 替换

深度绑定业务
→ 单独迁移设计
```

禁止仅为了 build 通过安装不兼容 Vue2 包。

---

## 21. API 文件默认少改

纯 request API：

```js
export function xxx(params) {
  return request({
    url,
    method,
    params
  })
}
```

通常直接迁移。

禁止无理由修改：

```text
URL
method
params
data
headers
字段名
responseType
业务枚举
```

---

## 22. ERP 数值逻辑不可随意重构

涉及：

```text
金额
数量
库存
价格
税率
汇率
转换系数
BOM
成本
```

以及：

```text
bigUtils
numberTofixed
$getDecNum
$qtyNumberStr
BigNumber
decimal
```

时，以保持原行为为第一目标。

禁止用：

```js
Number()
parseFloat()
```

随意替换原精度逻辑。

---

## 23. i18n Key 默认不改

禁止无理由批量重命名：

```text
menu.*
ui.*
uiBtn.*
PURCHASE.*
SALES.*
```

只迁移调用方式，不改变业务语言结构。

---

## 24. EventBus

Vue2：

```js
Vue.prototype.$EventBus = new Vue()
```

Vue3 不允许照搬。

如果仍有实际调用，使用统一事件方案，例如：

```text
mitt
```

并保持：

```text
事件名
参数
触发时机
解绑行为
```

不变。

---

## 25. 大文件不得整页重写

对于 50KB+ Vue 文件：

必须分段迁移：

```text
Template
→ 依赖组件
→ Props / Emits
→ Data
→ Computed / Watch
→ Methods
→ Lifecycle
→ Style
```

每一阶段保持业务语义稳定。

---

## 26. 黄金模块

优先完成：

```text
purchaseManagement/purchaseRequisition
```

作为标准迁移样板。

它完成后，需要复用其中已验证的：

```text
Element Plus 写法
slot 转换
v-model 转换
表格
表单
上传
CommonSelect
权限
i18n
键盘导航
```

到其他模块。

---

## 27. 业务模块禁止凭空重新设计

复杂业务逻辑必须尽可能保持原结构。

例如：

```js
if (status === '2' && auditStatus === '1') {
  ...
}
```

不能仅因为代码复杂就自行改变判断逻辑。

如果发现旧逻辑明显有 bug：

```text
记录问题
区分“迁移问题”和“历史业务 bug”
```

默认不要偷偷修复历史业务规则。

---

## 28. Copy / Backup 文件

发现：

```text
xxx copy.vue
xxxCopy.vue
old
backup
```

必须先确认：

```text
是否有引用
是否包含未合并功能
是否只是备份
```

最终 ERP-VUE3 不保留无意义历史副本。

---

## 29. 临时兼容代码必须标记

格式：

```js
// TODO ERP-VUE3-MIGRATION:
// 原因：
// 原 Vue2 行为：
// 当前 Vue3 临时方案：
// 删除条件：
```

禁止留下无法追踪原因的 workaround。

---

## 30. 优先级

### P0

可能造成：

```text
数据错误
权限错误
金额错误
单据错误
核心流程不可用
```

包括：

```text
request.js
menuPerms
登录
权限
核心 API
提交结构
金额数量
```

### P1

严重影响高频操作：

```text
v-table-tab
Select
Autocomplete
公共选择组件
表格
上传
审批
```

### P2

一般兼容问题：

```text
Tooltip
普通 Dialog
普通样式
低频页面交互
```

### P3

代码清理和非关键优化。

执行顺序：

```text
P0 → P1 → P2 → P3
```

---

## 31. 每次修改后必须检查

至少执行：

```text
build
lint
Vue2 API 残留
Element UI import 残留
无用 import
无用变量
错误 slot
错误 v-model
缺失 emits
错误 ref
错误 import path
console 调试代码
无效 deep selector
重复实现
```

能运行页面时必须做 runtime 验证。

---

## 32. 模块完成标准

模块不能以“build 成功”作为完成标准。

至少验证：

```text
[ ] 路由可进入
[ ] 列表正常
[ ] 查询正常
[ ] 新增正常
[ ] 编辑正常
[ ] 查看正常
[ ] 删除正常（如支持）
[ ] 表单校验正常
[ ] 权限正常
[ ] menuPerms 正常
[ ] Dialog 正常
[ ] Select 正常
[ ] DatePicker 正常
[ ] 上传正常
[ ] 下载正常
[ ] i18n 正常
[ ] 表格固定列正常
[ ] 表格滚动正常
[ ] Tab / Enter 正常
[ ] 无明显 console error
[ ] build 成功
```

---

## 33. Git 修改粒度

一个提交只处理一个明确范围。

推荐：

```text
chore: initialize vue3 erp baseline

refactor: migrate common select components

refactor: migrate table keyboard navigation

feat: migrate purchase requisition

feat: migrate inventory audit

fix: restore ERP menu permission header
```

禁止一个提交同时修改多个无关业务域。

---

## 34. 发现公共问题时

例如：

```text
采购页面发现 CommonSelectAndList 有问题
```

不要：

```text
在采购页面写兼容代码
```

应该：

```text
修 CommonSelectAndList
→ 验证公共组件
→ 所有业务页面共享修复
```

原则：

```text
公共问题在公共层解决
业务问题在业务层解决
```

---

## 35. Agent 完成任务后的输出

每次必须汇报：

```text
修改范围：
- ...

复用的 Vue3 实现：
- ...

保留的 ERP 行为：
- ...

主要 Vue2 → Vue3 改动：
- ...

风险：
- ...

未完成：
- ...

验证：
- build:
- lint:
- runtime:
```

禁止只回复：

```text
已完成
```

---

## 36. 最终判断规则

不确定时：

```text
是否属于 ERP 业务行为？
    ↓ 是
ERP-VUE2 为准

    ↓ 否

是否属于 Vue3 / Vite / Router / Element 技术实现？
    ↓ 是
CRM-VUE3 为准

    ↓ 仍不确定

检查：
调用链
API
组件
路由
权限
相邻页面

不要猜。
```

---

## 37. 最终目标

不要把任务理解成：

```text
Vue2语法 → Vue3语法
```

而应理解成：

```text
ERP-VUE3
=
ERP-VUE2 的完整业务行为
+
CRM-VUE3 已验证的 Vue3 技术实现
```

核心原则：

```text
ERP-VUE2 决定做什么。

CRM-VUE3 决定 Vue3 里怎么做。

ERP-VUE3 只接受经过验证的融合结果。
```
