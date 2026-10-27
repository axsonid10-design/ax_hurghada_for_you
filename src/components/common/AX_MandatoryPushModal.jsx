import React, { useState, useEffect } from 'react'
import { Bell, ShieldCheck, X } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function AX_MandatoryPushModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const timer = setTimeout(() => {
          setIsOpen(true)
        }, 1200)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const handleEnable = async () => {
    soundManager.playClick()
    if (!('Notification' in window)) return

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        soundManager.playSuccess()
        setIsOpen(false)
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready
          // Ready to subscribe
        }
      } else {
        setIsOpen(false)
      }
    } catch {
      setIsOpen(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center relative animate-scaleUp">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-[#e0f2fe] text-[#0284c7] mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Bell className="w-8 h-8 animate-bounce" />
        </div>

        <h3 className="text-lg font-black text-[#0a2540] mb-2">
          تفعيل إشعارات رحلات الغردقة
        </h3>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          لتلقي تحديثات الحجوزات، مواعيد تحركات المراكب وسعة البواخر، وإشعارات التحصيل الفوري على مدار الساعة
        </p>

        <div className="space-y-2">
          <button
            onClick={handleEnable}
            className="w-full py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
            <span>تفعيل الإشعارات الآن</span>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs transition-colors"
          >
            تذكيري لاحقاً
          </button>
        </div>
      </div>
    </div>
  )
}
