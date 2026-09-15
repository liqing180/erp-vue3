import MyInput from './index.vue'

MyInput.install = app => {
  app.component(MyInput.name, MyInput)
}

export default MyInput
