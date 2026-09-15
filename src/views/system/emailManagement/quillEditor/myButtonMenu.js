import Cookies from 'js-cookie'

class MyMenuClass {
  constructor(dataName) {
    this.title = 'My Select Menu'
    this.tag = 'select'
    this.width = 60
    this.dataName = dataName
    this.options = []
    this.defineTitle = {
      value: 'title',
      text: Cookies.get('language') === 'en' ? 'Template' : '模板',
      styleForRenderMenuList: { display: 'none' }
    }
  }

  getOptions(editor) {
    const displayOptions = editor[this.dataName].data || []
    this.options = [this.defineTitle, ...displayOptions]
    return this.options

    // const options = [
    //   {
    //     value: 'beijing',
    //     text: '北京',
    //     styleForRenderMenuList: { 'font-size': '14px', 'font-weight': 'bold' }
    //   },
    //   { value: 'shanghai', text: '上海', selected: true },
    //   { value: 'shenzhen', text: '深圳' }
    // ]
    // return options
  }

  getValue(editor) {
    return 'title' // 匹配 options 其中一个 value
  }
  isActive(editor) {
    return false // or true
  }
  isDisabled(editor) {
    return false // or true
  }
  exec(editor, value) {
    editor.insertText(value) // value 即 this.getValue(editor) 的返回值
    editor.insertText(' ')
  }
}

// const myMenuConf = {
//   key: 'myMenu',
//   factory() {
//     return new MyMenuClass()
//   }
// }

export default MyMenuClass
