import { soundManager } from './soundEffects'

export const pushManager = {
  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window
  },

  getPermission() {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission
  },

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported'
    try {
      const permission = await Notification.requestPermission()
      return permission
    } catch {
      return 'denied'
    }
  },

  async sendNotification(title, body, extraOptions = {}) {
    if (!this.isSupported() || Notification.permission !== 'granted') return false
    const options = {
      body: body || '',
      icon: '/logo-circle.png',
      badge: '/favicon-32x32.png',
      dir: 'rtl',
      lang: 'ar-EG',
      vibrate: [300, 100, 300, 100, 300],
      renotify: true,
      ...extraOptions
    }

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready
        if (reg && reg.showNotification) {
          await reg.showNotification(title, options)
          return true
        }
      } catch (err) {}
    }

    try {
      new Notification(title, options)
      return true
    } catch (err) {}

    return false
  },

  async sendTestNotification() {
    soundManager.playSuccess()
    return this.sendNotification(
      'غردقة فور يو — تم تفعيل الإشعارات بنجاح 🎉',
      'المنظومة متصلة وجاهزة لاستقبال إشعارات الحجوزات والرحلات والتحصيلات على مدار 24 ساعة.',
      { tag: 'h4u-welcome-notification' }
    )
  }
}
