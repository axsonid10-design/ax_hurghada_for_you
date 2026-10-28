import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function AppUpdateNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [newVersion, setNewVersion] = useState('')

  useEffect(() => {
    let currentVersion = localStorage.getItem('ax_hurghada_version') || '1.0.0'

    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?_t=${Date.now()}`, {
          cache: 'no-store'
        })
        if (!res.ok) return
        const data = await res.json()
        if (data?.version) {
          if (!localStorage.getItem('ax_hurghada_version')) {
            localStorage.setItem('ax_hurghada_version', data.version)
          } else if (data.version !== currentVersion) {
            setNewVersion(data.version)
            setUpdateAvailable(true)
          }
        }
      } catch {
      }
    }

    checkVersion()
    const interval = setInterval(checkVersion, 60000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion()
      }
    }

    window.addEventListener('pageshow', checkVersion)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', checkVersion)

    return () => {
      clearInterval(interval)
      window.removeEventListener('pageshow', checkVersion)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', checkVersion)
    }
  }, [])

  const handleUpdate = async () => {
    soundManager.playSuccess()
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((r) => r.unregister()))
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      }
      if (newVersion) {
        localStorage.setItem('ax_hurghada_version', newVersion)
      }
    } finally {
      window.location.replace(window.location.origin + window.location.pathname + '?_v=' + Date.now())
    }
  }

  if (!updateAvailable) return null

  return (
    <div
      className="fixed top-0 left-1/2 -translate-x-1/2 z-50 animate-bounce max-w-[95vw] px-2"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
    >
      <div className="bg-[#0a2540] text-white px-5 py-2.5 rounded-full shadow-float border border-[#0284c7] flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-[#38bdf8] animate-spin" />
        <span className="text-xs sm:text-sm font-bold">
          تحديث جديد متوفر ({newVersion})
        </span>
        <button
          onClick={handleUpdate}
          className="px-4 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95"
        >
          تحديث المنظومة الآن
        </button>
      </div>
    </div>
  )
}
