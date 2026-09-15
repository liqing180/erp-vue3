<template>
  <div class="editor">
    <!-- 这两个都是获取值的必要条件： v-model:content  contentType="html" -->
    <quill-editor
      ref="editorRef"
      v-model:content="content"
      :options="options"
      contentType="html"
      @update:content="onChange"
    ></quill-editor>

    <div style="position: absolute; top: 10px; right: 10px" v-if="false">
      <select id="customSelect" style="width: 70px">
        <option
          v-for="item in ['1111111111', '222222222222222222']"
          :key="item"
          :label="item"
          :value="item"
        ></option>
      </select>
    </div>
  </div>
</template>

<script>
// 引入富文本编辑器与样式
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
export default {
  props: {
    initContent: {
      type: String
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  components: { QuillEditor },
  data() {
    return {
      content: '',
      options: {
        theme: 'snow', // 使用snow主题
        modules: {
          // 富文本头部栏的功能配置
          toolbar: {
            container: [
              ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
              [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
              [{ align: [] }], // 对齐方式
              [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
              // [{ font: [] }], // 字体种类
              [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
              // [{ direction: 'ltl' }], // 文本方向
              [{ direction: 'rtl' }], // 文本方向
              [{ indent: '-1' }, { indent: '+1' }], // 缩进
              [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
              [{ script: 'sub' }, { script: 'super' }] // 上标/下标
              // ['blockquote', 'code-block'], // 引用  代码块
              // ['clean'] // 清除文本格式
              // ['link', 'image', 'video'] // 链接、图片、视频
            ]
            // handlers: {
            //   image: imageHandler // 点击图片触发事件
            // }
          }
          // 图片缩放
          // blotFormatter: {
          //   toolbar: {
          //     mainClassName: 'blot-formatter__toolbar'
          //   }
          // }
        }
      },
      toolbar: undefined,
      value: ''
    }
  },
  watch: {
    initContent: {
      handler(newVal) {
        this.content = newVal
      }
    }
  },
  mounted() {
    this.initTitle()
    this.$refs.editorRef
      .getQuill()
      .root.addEventListener('customPaste', this.customPaste, false)

    this.toolbar = this.$refs.editorRef.getQuill().getModule('toolbar')
    const selectOption = document.createElement('span')
    selectOption.innerHTML = `
    <select>
      <option label="option1" value="option1"></option>
      <option label="option2" value="option2"></option>
      <option label="option3" value="option3"></option>
      </select>
    `
    selectOption.classList.add('ql-formats') // 给它加上一个类名，方便样式控制
    // this.toolbar.container.appendChild(selectOption)

    // 监听下拉菜单的选项变化
    // selectOption.addEventListener('change', event => {
    //   const selectedValue = event.target.value
    //   let textToInsert = ''

    //   // 根据选择插入不同的文本
    //   switch (selectedValue) {
    //     case 'option1':
    //       textToInsert = '这是选项1的内容'
    //       break
    //     case 'option2':
    //       textToInsert = '这是选项2的内容'
    //       break
    //     case 'option3':
    //       textToInsert = '这是选项3的内容'
    //       break
    //     default:
    //       textToInsert = ''
    //   }

    //   // 插入选中的文本到编辑器
    //   if (textToInsert) {
    //     const range = quill.getSelection()
    //     if (range) {
    //       quill.insertText(range.index, textToInsert)
    //     } else {
    //       quill.insertText(quill.getLength(), textToInsert)
    //     }
    //     selectOption.value = ''
    //   }
    // })

    // const customSelect = document.getElementById('customSelect')
    // customSelect.addEventListener('change', () => {
    //   const selectedColor = customSelect.value
    //   console.log('选中的颜色是：', selectedColor)
    // })
  },
  methods: {
    onChange() {
      const textContent = this.content.replace(/<[^>]+>/g, '')
      if (textContent) {
        this.$emit('editorChange', this.content)
      } else {
        this.$emit('editorChange', '')
      }
    },
    initTitle() {
      const titleConfig = [
        { Choice: '.ql-insertMetric', title: '跳转配置' },
        { Choice: '.ql-bold', title: this.$t('editor.bold') },
        { Choice: '.ql-italic', title: this.$t('editor.italic') },
        { Choice: '.ql-underline', title: this.$t('editor.underline') },
        { Choice: '.ql-header', title: '段落格式' },
        { Choice: '.ql-strike', title: this.$t('editor.strike') },
        { Choice: '.ql-blockquote', title: '块引用' },
        { Choice: '.ql-code', title: '插入代码' },
        { Choice: '.ql-code-block', title: '插入代码段' },
        { Choice: '.ql-font', title: this.$t('editor.font') },
        { Choice: '.ql-size', title: this.$t('editor.size') },
        { Choice: '.ql-list[value="ordered"]', title: '编号列表' },
        { Choice: '.ql-list[value="bullet"]', title: '项目列表' },
        { Choice: '.ql-direction', title: '文本方向' },
        { Choice: '.ql-header[value="1"]', title: 'h1' },
        { Choice: '.ql-header[value="2"]', title: 'h2' },
        { Choice: '.ql-align', title: this.$t('editor.align') },
        { Choice: '.ql-color', title: this.$t('editor.color') },
        { Choice: '.ql-background', title: this.$t('editor.background') },
        { Choice: '.ql-image', title: '图像' },
        { Choice: '.ql-video', title: '视频' },
        { Choice: '.ql-link', title: '添加链接' },
        { Choice: '.ql-formula', title: '插入公式' },
        { Choice: '.ql-clean', title: '清除字体格式' },
        { Choice: '.ql-script[value="sub"]', title: '下标' },
        { Choice: '.ql-script[value="super"]', title: '上标' },
        { Choice: '.ql-indent[value="-1"]', title: '向左缩进' },
        { Choice: '.ql-indent[value="+1"]', title: '向右缩进' },
        { Choice: '.ql-header .ql-picker-label', title: '标题大小' },
        {
          Choice: '.ql-header .ql-picker-item[data-value="1"]',
          title: '标题一'
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="2"]',
          title: '标题二'
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="3"]',
          title: '标题三'
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="4"]',
          title: '标题四'
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="5"]',
          title: '标题五'
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="6"]',
          title: '标题六'
        },
        { Choice: '.ql-header .ql-picker-item:last-child', title: '标准' },
        {
          Choice: '.ql-size .ql-picker-item[data-value="small"]',
          title: '小号'
        },
        {
          Choice: '.ql-size .ql-picker-item[data-value="large"]',
          title: '大号'
        },
        {
          Choice: '.ql-size .ql-picker-item[data-value="huge"]',
          title: '超大号'
        },
        { Choice: '.ql-size .ql-picker-item:nth-child(2)', title: '标准' },
        { Choice: '.ql-align .ql-picker-item:first-child', title: '居左对齐' },
        {
          Choice: '.ql-align .ql-picker-item[data-value="center"]',
          title: '居中对齐'
        },
        {
          Choice: '.ql-align .ql-picker-item[data-value="right"]',
          title: '居右对齐'
        },
        {
          Choice: '.ql-align .ql-picker-item[data-value="justify"]',
          title: '两端对齐'
        }
      ]
      for (let item of titleConfig) {
        // .editor 是富文本编辑器的类名
        let tip = document.querySelector('.editor ' + item.Choice)
        if (tip) {
          tip.setAttribute('title', item.title)
        }
      }
    },
    customPaste(e) {
      // 获取当前最新时间 改名啥的可以用
      let newTime = new Date().getTime()

      const clipboardData = e.clipboardData // 粘贴信息
      const types = clipboardData.types // 当前文件类型
      if (types.includes('Files')) {
        e.preventDefault()
        e.clipboardData.files.forEach(file => {
          // 在这里可以拿到粘贴后的图片与文件信息
          // 在这里做操作
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.editor {
  width: 100%;
  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>
