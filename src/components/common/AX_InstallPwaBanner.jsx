import React, { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function AX_InstallPwaBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false)
      return
    }

    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt)
      setShowBanner(true)
    }

    const handler = () => {
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt)
        setShowBanner(true)
      }
    }

    window.addEventListener('ax-pwa-ready', handler)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      window.__deferredPwaPrompt = e
      setDeferredPrompt(e)
      setShowBanner(true)
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

  if (!showBanner) return null

  return (
    <div className="w-full bg-gradient-to-r from-[#0a2540] via-[#0e3b66] to-[#0a2540] text-white border-b border-[#0284c7]/40 shadow-sm animate-fadeIn">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/favicon-32x32.png" alt="" className="w-6 h-6 rounded" />
          <span className="text-xs sm:text-sm font-bold text-slate-100">
            تثبيت التطبيق على جهازك
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
            onClick={() => setShowBanner(false)}
            className="p-1 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
