// import MyDictDataClass from '@/utils/dict/myDictDataClass.js'
export default {
  created() {
    const { proxy } = getCurrentInstance()
    if (
      this.searchData &&
      Object.prototype.toString.call(this.searchData) === '[object Array]'
    ) {
      this.searchData.forEach(async x => {
        if (x.dict) {
          const res = proxy.useDict(x.dict)

          const data = res[x.dict]
          x.selectData = data
        }
      })
    }
  }
}
