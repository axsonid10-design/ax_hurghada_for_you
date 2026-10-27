self.addEventListener('push', function (event) {
  let payload = {
    title: 'غردقة فور يو — تنبيه تشغيلي',
    body: 'تنبيه جديد بخصوص الرحلات والحجوزات',
    icon: '/pwa-192x192.png',
    badge: '/favicon-32x32.png',
    data: { url: '/' }
  }

  if (event.data) {
    try {
      const json = event.data.json()
      payload = Object.assign(payload, json)
    } catch {
      payload.body = event.data.text()
    }
  }

  const notificationOptions = {
    body: payload.body || 'تنبيه تشغيلي جديد',
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/favicon-32x32.png',
    vibrate: [300, 150, 300, 150, 300],
    data: payload.data || { url: payload.link || '/' },
    dir: 'rtl',
    lang: 'ar-EG',
    requireInteraction: true,
    tag: payload.tag || ('ax-hurghada-push-' + Date.now()),
    actions: [
      { action: 'open', title: 'فتح النظام' },
      { action: 'dismiss', title: 'إغلاق' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'غردقة فور يو', notificationOptions)
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const targetUrl = (event.notification.data && (event.notification.data.url || event.notification.data.link)) || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
