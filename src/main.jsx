import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'
import { AX_alertTelegram } from './utils/AX_TelegramAlert'

// Rule 2610 #8: Global Telegram Error Watchdog
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error) {
      AX_alertTelegram('WINDOW_UNCAUGHT_ERROR', event.error)
    }
  })
  window.addEventListener('unhandledrejection', (event) => {
    AX_alertTelegram('UNHANDLED_PROMISE_REJECTION', event.reason || 'Promise rejected')
  })
}

registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('ax-pwa-update-available'))
  },
  onOfflineReady() {
    console.log('[AX_PWA] المنظومة جاهزة للعمل بدون إنترنت (Offline Ready)')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
