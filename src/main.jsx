import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'
import { AX_alertTelegram } from './utils/AX_TelegramAlert'

if (typeof window !== 'undefined' && window.location.search) {
  const params = new URLSearchParams(window.location.search)
  let changed = false
  if (params.has('_v')) {
    params.delete('_v')
    changed = true
  }
  if (params.has('_t')) {
    params.delete('_t')
    changed = true
  }
  if (changed) {
    const cleanSearch = params.toString() ? `?${params.toString()}` : ''
    window.history.replaceState({}, '', `${window.location.pathname}${cleanSearch}${window.location.hash}`)
  }
}

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
