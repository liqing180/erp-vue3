import MyDatePicker from './index.vue'

MyDatePicker.install = app => {
  app.component(MyDatePicker.name, MyDatePicker)
}

export default MyDatePicker
