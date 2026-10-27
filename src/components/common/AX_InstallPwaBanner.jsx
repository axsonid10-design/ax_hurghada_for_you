import React, { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function AX_InstallPwaBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setShowBanner(false)
      return
    }

    const dismissCount = parseInt(localStorage.getItem('ax_pwa_dismiss_count') || '0', 10)
    if (dismissCount >= 2) {
      setShowBanner(false)
      return
    }

    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt)
      setShowBanner(true)
    }

    const handler = () => {
      const count = parseInt(localStorage.getItem('ax_pwa_dismiss_count') || '0', 10)
      if (count < 2 && window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt)
        setShowBanner(true)
      }
    }

    window.addEventListener('ax-pwa-ready', handler)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      window.__deferredPwaPrompt = e
      setDeferredPrompt(e)
      const count = parseInt(localStorage.getItem('ax_pwa_dismiss_count') || '0', 10)
      if (count < 2) {
        setShowBanner(true)
      }
    })

    return () => {
      window.removeEventListener('ax-pwa-ready', handler)
    }
  }, [])

  const handleInstall = async () => {
    soundManager.playClick()
    const promptEvent = deferredPrompt || window.__deferredPwaPrompt
    if (!promptEvent) return

    promptEvent.prompt()
    const choiceResult = await promptEvent.userChoice
    if (choiceResult.outcome === 'accepted') {
      soundManager.playSuccess()
      setShowBanner(false)
      window.__deferredPwaPrompt = null
    }
  }

  const handleDismiss = () => {
    soundManager.playClick()
    const count = parseInt(localStorage.getItem('ax_pwa_dismiss_count') || '0', 10)
    localStorage.setItem('ax_pwa_dismiss_count', String(count + 1))
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="w-full bg-[#0a2540] text-white border-b border-[#0284c7]/40 shadow-sm animate-fadeIn">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-[#38bdf8] bg-white flex-shrink-0 shadow-sm">
            <img src="/logo-circle.png" alt="غردقة فور يو" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-100">
            تثبيت التطبيق
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت التطبيق</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
