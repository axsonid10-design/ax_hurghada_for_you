import React, { useState, useEffect } from 'react'
import { Bell, ShieldCheck, X } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { pushManager } from '../../utils/pushManager'
import { useAXStore } from '../../store/useAXStore'

export function AX_MandatoryPushModal() {
  const isStorePushModalOpen = useAXStore((state) => state.isPushModalOpen)
  const closePushModal = useAXStore((state) => state.closePushModal)
  const [autoOpen, setAutoOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && pushManager.isSupported()) {
      const dismissCount = parseInt(localStorage.getItem('ax_push_dismiss_count') || '0', 10)
      if (dismissCount < 2 && pushManager.getPermission() === 'default') {
        const timer = setTimeout(() => {
          setAutoOpen(true)
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const isOpen = isStorePushModalOpen || autoOpen

  const handleClose = () => {
    soundManager.playClick()
    const currentCount = parseInt(localStorage.getItem('ax_push_dismiss_count') || '0', 10)
    localStorage.setItem('ax_push_dismiss_count', String(currentCount + 1))
    setAutoOpen(false)
    closePushModal()
  }

  const handleEnable = async () => {
    soundManager.playClick()
    const permission = await pushManager.requestPermission()
    if (permission === 'granted') {
      await pushManager.sendTestNotification()
    }
    setAutoOpen(false)
    closePushModal()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center relative animate-scaleUp">
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-20 h-20 rounded-full border-4 border-[#0284c7]/30 p-1 mx-auto mb-4 shadow-xl bg-white overflow-hidden flex items-center justify-center">
          <img
            src="/logo-circle.png"
            alt="غردقة فور يو"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <h3 className="text-lg font-black text-[#0a2540] mb-2">
          إشعارات التشغيل
        </h3>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          تفعيل إشعارات رحلات الغردقة والتحصيلات لمتابعة التحديثات التشغيلية على مدار الساعة.
        </p>

        <div className="space-y-2">
          <button
            onClick={handleEnable}
            className="w-full py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
            <span>تفعيل الإشعارات</span>
          </button>
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs transition-colors"
          >
            تذكيري لاحقاً
          </button>
        </div>
      </div>
    </div>
  )
}
