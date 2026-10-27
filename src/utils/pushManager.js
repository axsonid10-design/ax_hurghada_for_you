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

  async sendTestNotification() {
    soundManager.playSuccess()

    const title = 'غردقة فور يو — تم تفعيل الإشعارات بنجاح 🎉'
    const options = {
      body: 'المنظومة متصلة وجاهزة لاستقبال إشعارات الحجوزات والرحلات والتحصيلات على مدار 24 ساعة.',
      icon: '/logo-circle.png',
      badge: '/favicon-32x32.png',
      dir: 'rtl',
      lang: 'ar-EG',
      vibrate: [250, 100, 250, 100, 250],
      tag: 'h4u-welcome-notification',
      renotify: true
    }

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready
        if (reg && reg.showNotification) {
          await reg.showNotification(title, options)
          return true
        }
      } catch (err) {
        console.warn('[PushManager] ServiceWorker notification fallback:', err)
      }
    }

    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(title, options)
        return true
      } catch (err) {
        console.warn('[PushManager] Standard notification error:', err)
      }
    }

    return false
  }
}
