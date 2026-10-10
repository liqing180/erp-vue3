# BPM Vue2 → Vue3 迁移

## 范围和依据

- ERP 业务源码：用户指定的 `D:\erp-cloud-web\src\views\bpm`，关联 API 为 `src/api/bpm/bpm.js`。
- 本地源项目当前分支为 `develop-3.0.0`，没有可读取的本地 `main` 引用。本次按用户指定路径的工作区文件迁移；没有修改参考项目。
- CRM Vue3 参考项目位于 `D:\Code\crm-vue3`，分支为 `main`，没有对应 BPM 页面。复用其 Vue3 技术方式和 ERP Vue3 已迁移的公共能力。
- 目标项目保持 `develop` 分支、Options API、原页面目录、data/computed/watch/methods 组织、业务字段和 i18n key。
- 补齐 19 个 ERP BPM Vue 文件、7 个语言文件；增加一个缺失关联单据的提示组件。已有审批、驳回、表单取消和关闭弹窗继续复用。

## 页面和入口

| 功能 | 组件路径 | 路由方式 |
| --- | --- | --- |
| 我的待办 | `bpm/myTask/toDoTask/index.vue` | 后端菜单动态路由 |
| 我的已办 | `bpm/myTask/completedTask/index.vue` | 后端菜单动态路由 |
| 我发起的流程 | `bpm/processManagement/myInitiatedProcess/index.vue` | 后端菜单动态路由 |
| 我参与的流程 | `bpm/processManagement/myParticipatedProcess/index.vue` | 后端菜单动态路由 |
| 管理员待办 | `bpm/administratorOperation/processPendingAction/index.vue` | 后端菜单动态路由 |
| 超时任务 | `bpm/administratorOperation/expiredTask/index.vue` | 后端菜单动态路由 |
| 流程历史 | `bpm/history/history.vue` | 补回原 ERP 隐藏路由 `/bpm/history`，名称 `History` |

动态菜单仍通过现有 `import.meta.glob` 和 `router.addRoute` 加载，没有新增静态菜单或更改菜单权限。

## 保留的 ERP 行为

- 六个列表的接口、查询字段、默认日期范围、排序、分页、列配置持久化、自动刷新、任务统计和进入历史页的 query 参数。
- 原权限标识、`dataType` 和管理员 `fromType: '3'`，以及不允许取消的业务模块判断。
- 回退仍提交 `skipOverNodeId / skipOverNodeName / skipOverReason`；未因字段名称看起来不一致而改变后端协议。
- 转审提交 `userIdList`；跳审提交节点 ID 和节点名称；取消按是否存在 `taskId` 选择任务或流程接口，附件保留 `commonFileList`。
- 催办通道枚举与逗号分隔提交值，催办历史，批量审批、撤回、驳回、取消、跳审的确认、`taskIdList`、5 分钟 API 超时和结果反馈。
- 单据悬浮信息按业务模块显示的列、金额及数量格式、30 秒缓存、进入悬浮层时维持展示的行为。
- 流程图、任务详情、进度图、业务单据映射和历史版本查询接口。
- BPM API 和 `request.js` 无改动；已核对 BPM API 与源文件忽略空白后完全一致。

## Vue3 适配和公共复用

- `.sync` 改为具名 `v-model`，Dialog 使用 `v-model`；具名/作用域 slot 改为 Vue3 slot，并声明实际 emits。
- 对已经审查过的响应式 queryParams、searchData、popoverData 和 form，用属性赋值替代 `$set`。
- 使用现有 mitt EventBus 的 `on/off`，以同一个回调精确解绑，避免重复订阅和误删其他订阅者。
- Element UI 私有 Popover 扩展改为 Element Plus `virtual-ref`、受控 visible 和公开 hide 能力。
- 使用现有 SearchForm、RightToolbar、Pagination、SelectInput、MyInput、MyDatePicker、myUpload、FormPageLayout、权限指令、字典插件和 Vuex。
- 补回公共 `tableMinx` 的 `indexTableMaxHeight` 和 ERP 的 300px 最小列表高度；表单/弹窗的 `tableMaxHeight` 仍为至少 390px。
- 字典全局 mixin 声明 `dictReady`，与已有全局字典事件一致。
- Dialog 复用 Element Plus draggable；人员选择弹窗的宽度拖动指令挂在 Dialog 内的 DOM 上，避免 Teleport 根节点导致指令失效。
- 流程图 Blob 在卸载时释放，并防止卸载后返回的请求创建未释放 URL。
- 删除转审中已被人员选择替代的节点查询、无用导入和状态；删除人员选择弹窗中无 prop/调用方的旧 value watcher、Vue2 dispatch 和 inject。

## 可复现的模拟运行验证

执行 `npm run dev` 后，打开 `http://localhost:8088/tests/bpm/runtime-smoke.html`（端口以实际 Vite 输出为准），点击“运行 BPM 模拟验证”。测试入口独立于应用生产入口；Axios adapter 接管全部请求，使用人工构造数据，审批、附件和批量操作均不会写入真实后端。

浏览器验证共 15 项：

1. 六个列表分别验证加载、查询、重置、分页、排序；待办和管理员待办额外验证 EventBus 重复初始化后只刷新一次。
2. 单据悬浮提示打开和关闭。
3. 回退空表单拦截和提交字段。
4. 转审人员加载、选择、清空和 `userIdList`。
5. 跳审节点与提交字段。
6. 取消附件结构及管理员 `fromType`。
7. 催办通道与历史加载。
8. GET/POST `menuPerms` Header。
9. 五种管理员批量操作的 `taskIdList`。
10. 缺失单据提示、任务详情、流程图和切换视图时的 Blob 释放。

浏览器另做手动检查：从“更多”进入回退弹窗；展开 Select 后按 Tab 选中有效选项并把焦点移到原因字段；Shift+Tab 返回 Select；日期范围弹层和“今天”快捷选项同步更新两端日期；固定列及横向滚动容器可见。

## 验证结果和未完成项

- 生产构建：`npm run build:prod`；存在项目原有的大 chunk 提示。
- 全项目 lint：`npm run lint`；BPM 和测试脚本也独立运行 ESLint。
- 模块检查：24 个 Vue 模板编译、import 路径、实际业务方法清单，以及 Vue2 私有 API、Element UI import、旧 slot、`.sync`、debug console 和旧 deep selector 扫描。
- 模拟 runtime：15 项通过，没有 Vue 错误或警告。模拟验证只证明前端加载和提交结构，不能代替真实后端验收。

31 个原 ERP 业务单据映射中，当前目标项目仅存在采购申请单页面，另外 30 个关联页面仍未迁移。全部映射均保留，缺失页面明确提示，并允许查看任务详情和流程图；后续对应页面迁入后由 glob 自动加载。代码已用 `TODO ERP-VUE3-MIGRATION` 标记删除条件。采购申请单加载器已接入，但完整业务单据审批仍需后端联调。

尚需在真实账号和后端上验证：后端菜单路由及授权、数据权限隔离、审批状态变化、真实上传/下载、所有关联单据的查看及审批、历史版本操作、批量操作结果、大数据固定列和纵向滚动。未绕过登录或修改真实审批数据。

源代码人员选择列表的 `statusStr` 拼接 `AA` 属于历史实现，显示仍使用 dict-tag；本次没有改变该历史业务表达。
