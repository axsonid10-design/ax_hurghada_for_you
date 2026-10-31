import { soundManager } from './soundEffects'
import { supabase } from '../services/supabaseClient'

const VAPID_PUBLIC_KEY = 'BN_WE73GEGmGJDVQmIzM1rSd3ac2e9v2twABBM_cBqATkowZ_9e0_sTNa3FwA5yI39ZnqPEvYI4Qe3ZwXX2SqRI'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const pushManager = {
  isSupported() {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    )
  },

  getPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    return Notification.permission
  },

  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    try {
      const permission = await Notification.requestPermission()
      return permission
    } catch {
      return 'denied'
    }
  },

  async getSubscription() {
    if (!this.isSupported()) return null
    try {
      const reg = await navigator.serviceWorker.ready
      return await reg.pushManager.getSubscription()
    } catch {
      return null
    }
  },

  async subscribeUser(userId, role) {
    if (!this.isSupported()) return null
    if (Notification.permission !== 'granted') return null

    try {
      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()

      if (!sub) {
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        })
      }

      if (!sub) return null

      const subJSON = sub.toJSON()
      if (!subJSON?.keys?.p256dh || !subJSON?.keys?.auth) return null

      const subscriptionRecord = {
        endpoint: sub.endpoint,
        p256dh: subJSON.keys.p256dh,
        auth: subJSON.keys.auth,
        user_id: userId || 'usr_master_axonid',
        user_role: role || 'staff',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        project_slug: 'hurghada-for-you',
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      }

      await supabase
        .from('ax_push_subscriptions')
        .upsert(subscriptionRecord, { onConflict: 'endpoint' })

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_push_subscribed', 'true')
        localStorage.setItem('ax_push_last_sync', Date.now().toString())
      }

      return sub
    } catch {
      return null
    }
  },

  async sendNotification(title, body, extraOptions = {}) {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return false
    }

    const options = {
      body: body || '',
      icon: '/pwa-192x192.png',
      badge: '/favicon-32x32.png',
      dir: 'rtl',
      lang: 'ar-EG',
      vibrate: [300, 150, 300, 150, 300],
      renotify: true,
      tag: 'h4u-notif-' + Date.now(),
      ...extraOptions
    }

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready
        if (reg && reg.showNotification) {
          await reg.showNotification(title, options)
          return true
        }
      } catch {}
    }

    try {
      new Notification(title, options)
      return true
    } catch {}

    return false
  },

  async broadcastPush({ title, body, link, tag, icon, badge, image, userId }) {
    try {
      const { data, error } = await supabase.functions.invoke('ax-web-push', {
        body: {
          project_slug: 'hurghada-for-you',
          title: title || 'غردقة فور يو — تنبيه تشغيلي',
          body: body || 'تنبيه تشغيلي جديد بخصوص الرحلات والحجوزات',
          link: link || '/',
          tag: tag || ('ax-hurghada-' + Date.now()),
          icon: icon || 'https://hurghada.axsonid.com/pwa-192x192.png',
          badge: badge || 'https://hurghada.axsonid.com/favicon-32x32.png',
          image,
          userId: userId || 'all'
        }
      })
      if (error) return { success: false, error: error.message }
      return data || { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  async sendTestNotification(userId, role) {
    soundManager.playSuccess()
    await this.subscribeUser(userId, role)

    this.sendNotification(
      'غردقة فور يو — تم تفعيل الإشعارات بنجاح 🎉',
      'المنظومة متصلة وجاهزة لاستقبال إشعارات الحجوزات والرحلات والتحصيلات على مدار 24 ساعة.',
      { tag: 'h4u-welcome-notification' }
    )

    this.broadcastPush({
      title: 'غردقة فور يو — فحص الإشعارات 24/7 🚀',
      body: 'تم اختبار الإشعار السحابي بنجاح، وستصلك كافة التحديثات حتى والتطبيق مغلق.',
      link: '/'
    }).catch(() => {})

    return true
  }
}
