import React, { useState, useEffect } from 'react'
import { ShieldCheck, ShieldAlert, X, RefreshCw } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { pushManager } from '../../utils/pushManager'
import { useAXStore } from '../../store/useAXStore'

export function AX_MandatoryPushModal() {
  const isStorePushModalOpen = useAXStore((state) => state.isPushModalOpen)
  const closePushModal = useAXStore((state) => state.closePushModal)
  const profile = useAXStore((state) => state.profile)
  const [isDenied, setIsDenied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        closePushModal()
      } else if (Notification.permission === 'denied') {
        setIsDenied(true)
      }
    }
  }, [isStorePushModalOpen, closePushModal])

  const handleClose = () => {
    soundManager.playClick()
    const current = parseInt(localStorage.getItem('ax_push_dismiss_count') || '0', 10)
    localStorage.setItem('ax_push_dismiss_count', String(current + 1))
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('ax_push_session_dismissed', 'true')
    }
    closePushModal()
  }

  const handleEnable = async () => {
    soundManager.playClick()
    const res = await pushManager.requestPermission()
    if (res === 'granted') {
      soundManager.playSuccess()
      closePushModal()
      await pushManager.subscribeUser(profile?.id, profile?.role)
      pushManager.sendTestNotification(profile?.id, profile?.role)
    } else if (res === 'denied') {
      soundManager.playClick()
      setIsDenied(true)
    }
  }

  const handleRecheck = async () => {
    soundManager.playClick()
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        soundManager.playSuccess()
        closePushModal()
        await pushManager.subscribeUser(profile?.id, profile?.role)
        pushManager.sendTestNotification(profile?.id, profile?.role)
      } else if (Notification.permission === 'default') {
        setIsDenied(false)
        handleEnable()
      }
    }
  }

  if (!isStorePushModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center relative animate-scaleUp">
        <button
          onClick={handleClose}
          aria-label="إغلاق"
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

        {isDenied ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl mb-5 text-right text-xs leading-relaxed text-amber-900 font-bold space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-black">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>الإشعارات محظورة في إعدادات المتصفح</span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium">
              اضغط على أيقونة القفل <span className="font-mono bg-white px-1 py-0.5 border border-amber-300 rounded text-amber-900 font-bold">🔒</span> في شريط العنوان بالأعلى واسمح بالإشعارات، ثم اضغط فحص الصلاحية.
            </p>
            <button
              onClick={handleRecheck}
              className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-black text-xs shadow transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>فحص الصلاحية مجدداً</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            تفعيل إشعارات رحلات الغردقة والتحصيلات لمتابعة التحديثات التشغيلية على مدار الساعة.
          </p>
        )}

        <div className="space-y-2">
          {!isDenied && (
            <button
              onClick={handleEnable}
              className="w-full py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
              <span>تفعيل الإشعارات</span>
            </button>
          )}
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
