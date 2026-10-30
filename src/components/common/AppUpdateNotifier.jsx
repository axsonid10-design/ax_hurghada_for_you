import React, { useState, useEffect } from 'react'
import { RefreshCw, Sparkles, X } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

const CURRENT_VERSION = import.meta.env.VITE_APP_VERSION

export function AppUpdateNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [remoteVersion, setRemoteVersion] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const checkVersion = async () => {
    try {
      const res = await fetch(`/version.json?_t=${Date.now()}&_r=${Math.random().toString(36).substring(2)}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        }
      })
      if (!res.ok) return
      const data = await res.json()
      if (!data?.version) return

      if (CURRENT_VERSION && data.version !== CURRENT_VERSION) {
        if (sessionStorage.getItem('ax_dismissed_update_version') === data.version) {
          return
        }
        setRemoteVersion(data.version)
        setUpdateAvailable(true)
      } else {
        setUpdateAvailable(false)
      }
    } catch {}
  }

  useEffect(() => {
    checkVersion()
    const interval = setInterval(checkVersion, 20000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkVersion()
    }
    const handleTrigger = () => checkVersion()

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleTrigger)
    window.addEventListener('pageshow', handleTrigger)
    window.addEventListener('ax-pwa-ready', handleTrigger)
    window.addEventListener('ax-check-update', handleTrigger)
    window.addEventListener('ax-pwa-update-available', handleTrigger)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleTrigger)
      window.removeEventListener('pageshow', handleTrigger)
      window.removeEventListener('ax-pwa-ready', handleTrigger)
      window.removeEventListener('ax-check-update', handleTrigger)
      window.removeEventListener('ax-pwa-update-available', handleTrigger)
    }
  }, [])

  const applyUpdate = async () => {
    if (isUpdating) return
    setIsUpdating(true)
    sessionStorage.removeItem('ax_dismissed_update_version')
    soundManager.playSuccess()

    const bustUrl = `${window.location.origin}${window.location.pathname}?_v=${Date.now()}`

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(async (reg) => {
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
            await reg.unregister().catch(() => {})
          })
        )
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name))).catch(() => {})
      }
    } catch {}

    setTimeout(() => {
      window.location.replace(bustUrl)
    }, 150)
  }

  const dismissUpdate = () => {
    if (remoteVersion) {
      sessionStorage.setItem('ax_dismissed_update_version', remoteVersion)
    }
    setUpdateAvailable(false)
  }

  if (!updateAvailable || !remoteVersion) return null

  return (
    <div
      dir="rtl"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
      className="fixed top-0 inset-x-0 z-[99999] pointer-events-auto bg-[#0a2540] text-white border-b-2 border-sky-400 shadow-2xl pb-2.5 px-3 sm:px-6 transition-all duration-300 animate-fadeIn"
    >
      <div className="w-full flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-black">
              يوجد تحديث جديد للمنظومة!
            </span>
            <span className="text-[11px] font-mono font-extrabold bg-sky-900/80 text-sky-200 px-2.5 py-0.5 rounded-full border border-sky-500/50">
              v{remoteVersion}
            </span>
            <span className="text-[11px] text-slate-300 font-bold hidden md:inline-block">
              يرجى التحديث الآن لتطبيق أحدث الميزات ومزامنة التغييرات.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={applyUpdate}
            disabled={isUpdating}
            className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-75 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'جاري التحديث...' : 'تحديث الآن'}</span>
          </button>
          <button
            type="button"
            onClick={dismissUpdate}
            aria-label="إغلاق التنبيه"
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
export default AppUpdateNotifier
