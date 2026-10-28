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
    <div className="w-full bg-[#0a2540] text-white border-b border-[#0284c7]/40 shadow-sm animate-fadeIn">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-[#38bdf8] flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4 h-4 text-[#38bdf8] animate-spin" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-100">
            تحديث جديد متوفر للمنظومة {newVersion ? `(${newVersion})` : ''}
          </span>
        </div>
        <button
          onClick={handleUpdate}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تحديث الآن</span>
        </button>
      </div>
    </div>
  )
}
