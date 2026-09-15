class BrowserNotify {
  constructor() {
    this.permission =
      typeof Notification === 'undefined'
        ? 'unsupported'
        : Notification.permission
    this.notifyComponent = {}
  }

  requestAuth() {
    if (typeof Notification === 'undefined') {
      return Promise.resolve(false)
    }
    if (this.permission === 'granted') {
      return Promise.resolve(true)
    }

    return Notification.requestPermission().then(permission => {
      this.permission = permission
      return permission === 'granted'
    })
  }

  isPageBlur() {
    return document.hidden
  }

  async showNotify(options = {}) {
    if (!this.isPageBlur() || typeof Notification === 'undefined') return false

    const hasAuth = await this.requestAuth()
    if (!hasAuth) return false

    const { title, body, icon = '', onClick, notifyID } = options
    this.closeNotify(notifyID)

    const notification = new Notification(title, {
      body,
      icon,
      tag: notifyID,
      silent: false,
      requireInteraction: true
    })

    this.notifyComponent[notifyID] = notification
    notification.onclick = () => {
      window.focus()
      if (typeof onClick === 'function') onClick()
      notification.close()
    }

    return true
  }

  closeNotify(notifyID) {
    const notification = this.notifyComponent[notifyID]
    if (!notification) return

    notification.close()
    delete this.notifyComponent[notifyID]
  }

  closeNotifyAll() {
    Object.keys(this.notifyComponent).forEach(notifyID => {
      this.closeNotify(notifyID)
    })
  }
}

export const browserNotify = new BrowserNotify()
export default BrowserNotify
