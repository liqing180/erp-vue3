<template>
  <div style="border: 1px solid #ccc; width: 100%; min-width: 365px">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 400px; overflow-y: hidden"
      v-model="content"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleEditorInput"
    />
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  shallowRef,
  onBeforeUnmount,
  onMounted,
  watch
} from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

import { Boot, i18nChangeLanguage } from '@wangeditor/editor'
import Cookies from 'js-cookie'
import MyMenuClass from './myButtonMenu'
import { querySysEmailTemplateVariableByTemplateFor } from '@/api/system/emailManagement'
const language = Cookies.get('language') === 'en' ? 'en' : 'zh-CN'
i18nChangeLanguage(language)
const emit = defineEmits(['editorChange']) // 定义事件
const props = defineProps({
  // initContent: String,
  templateFor: String,
  readOnly: {
    type: Boolean,
    default: false
  }
})

const content = ref('')
const mode = ref('default')
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
// 工具栏配置
const toolbarConfig = {
  toolbarKeys: [
    'headerSelect', // 标题选择
    'bold', // 加粗
    'italic', // 斜体
    'through', // 删除线
    'underline', // 下划线
    'justifyCenter', // 居中对齐
    'justifyJustify', // 两端对齐
    'justifyLeft', // 左对齐
    'justifyRight', // 右对齐
    'bulletedList', // 无序列表
    'numberedList', // 有序列表
    'color', // 文字颜色
    'insertLink', // 插入链接
    'fontSize', // 字体大小
    'lineHeight', // 行高
    'delIndent', // 缩进
    'indent', // 增进
    'divider', // 分割线
    // 'insertTable', // 插入表格
    'undo', // 撤销
    'redo', // 重做
    'clearStyle', // 清除格式
    // 'fullScreen', // 全屏
    'blockquote', // 引用
    'codeBlock', // 代码块
    // 'insertImage', // 插入图片
    // 'uploadImage', // 上传图片
    // 'insertVideo' // 插入视频
    'MyButtonMenu'
  ]
}

// 编辑器配置
const editorConfig = {
  placeholder: '',
  MENU_CONF: {
    uploadImage: {
      server: 'https://.....', // 上传接口 URL
      fieldName: 'file' // 图片字段名称
      // meta: {
      //   token: '您的认证token' // 如果需要的话
      // },
    }
  },
  readOnly: props.readOnly
}

const selectOption = ref({
  key: 'MyButtonMenu',
  dataName: 'selectData',
  data: []
  // data: [
  //   { value: 1, text: 'User' },
  //   { value: 2, text: 'Customer' }
  // ]
})

watch([() => props.templateFor], ([newTemplateFor], [oldTemplateFor]) => {
  querySysEmailTemplateVariableByTemplateFor1()
})

const initContent = data => {
  content.value = data
}
defineExpose({
  initContent
})
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = editor => {
  editorRef.value = editor // 记录 editor 实例，重要！
  if (!editor.getAllMenuKeys().includes(selectOption.value.key)) {
    const menu1Conf = {
      key: selectOption.value.key, // 定义 menu key ：要保证唯一、不重复（重要）
      factory() {
        return new MyMenuClass(selectOption.value.dataName) // 替换为你菜单的 class
      }
    }
    // 注册菜单
    Boot.registerMenu(menu1Conf)
  }
  initMenu()
}

const handleEditorInput = () => {
  const textContent = content.value.replace(/<[^>]+>/g, '')
  if (textContent) {
    emit('editorChange', content.value)
  } else {
    emit('editorChange', '')
  }
}

const initMenu = data => {
  editorRef.value[selectOption.value.dataName] = {
    data: selectOption.value.data
  }
}
const updateSelectOptionData = data => {
  selectOption.value.data = data
  if (editorRef.value == null) return
  // 更新 实例 中存的值
  editorRef.value[selectOption.value.dataName] = {
    data: selectOption.value.data
  }
}
const querySysEmailTemplateVariableByTemplateFor1 = () => {
  querySysEmailTemplateVariableByTemplateFor(props.templateFor).then(res => {
    const list = (res.data || []).map(x => {
      return {
        value: x.variableName,
        text: x.variableName,
        styleForRenderMenuList: { padding: '5px' }
      }
    })
    updateSelectOptionData(list)
  })
}
</script>

<style lang="scss" scoped>
button {
  margin-top: 20px;
  padding: 2px 5px;
  background-color: #57a3ef;
  border: none;
  color: #fff;
  border-radius: 2px;
}
</style>
