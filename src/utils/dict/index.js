import Dict from './Dict'
import { mergeOptions } from './DictOptions'

export function installDict(app, options = {}) {
  mergeOptions(options)

  app.mixin({
    data() {
      if (this.$options.dicts === undefined || this.$options.dicts === null) {
        return {}
      }

      const dict = new Dict()
      dict.owner = this
      return { dict }
    },
    created() {
      if (!(this.dict instanceof Dict)) {
        return
      }

      options.onCreated?.(this.dict)
      this.dict.init(this.$options.dicts).then(() => {
        options.onReady?.(this.dict)
        this.$nextTick(() => {
          this.$emit('dictReady', this.dict)
          if (typeof this.onDictReady === 'function') {
            this.onDictReady(this.dict)
          }
        })
      })
    }
  })
}

export { Dict }

export default {
  install: installDict
}
