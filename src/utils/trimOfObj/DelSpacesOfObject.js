/**
 * delete spaces at the start and end of value of the Object.
 */
class DelSpacesOfObject {
  constructor(obj) {
    this.obj = obj
    this.init()
  }

  /**
   * get type of the Object
   * @param obj
   * @returns {string}
   *
   * obj={};Object.prototype.toString.call(obj)
   * "[object Object]"
   *
   * obj2=[];Object.prototype.toString.call(obj2)
   * "[object Array]"
   *
   * obj3='';Object.prototype.toString.call(obj3)
   * "[object String]"
   *
   * obj4=0;Object.prototype.toString.call(obj4)
   * "[object Number]"
   */
  getTypeStr(obj) {
    return Object.prototype.toString.call(obj)
  }

  /**
   * delete spaces at the start and end of value of the Object
   * @param obj
   */
  delSpaces(obj) {
    const that = this

    if (obj) {
      if (that.getTypeStr(obj) === '[object Object]') {
        for (const item in obj) {
          if (
            that.getTypeStr(obj[item]) === '[object Object]' ||
            that.getTypeStr(obj[item]) === '[object Array]'
          ) {
            that.delSpaces(obj[item])
          } else {
            if (typeof obj[item] === 'string') {
              obj[item] = obj[item].trim()
            }
          }
        }
      } else if (that.getTypeStr(obj) === '[object Array]') {
        const len = obj.length

        if (len <= 0) {
          obj = []
        }

        for (let i = 0; i < len; i++) {
          if (
            that.getTypeStr(obj[i]) === '[object Object]' ||
            that.getTypeStr(obj[i]) === '[object Array]'
          ) {
            that.delSpaces(obj[i])
          } else {
            if (typeof obj[i] === 'string') {
              obj[i] = obj[i].trim()
            }
          }
        }
      } else {
        obj = obj.trim()
      }
    }
  }

  /**
   * init
   */
  init() {
    this.delSpaces(this.obj)
    return this.obj
  }
}

export default DelSpacesOfObject
