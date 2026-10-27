import React, { useState, useEffect } from 'react'
import { Download, Monitor, Smartphone, CheckCircle, X, ExternalLink } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AX_PwaInstallModal() {
  const isOpen = useAXStore((state) => state.isPwaInstallModalOpen)
  const closePwaInstallModal = useAXStore((state) => state.closePwaInstallModal)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        setIsStandalone(true)
      }
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt)
      }
    }
  }, [isOpen])

  const handleInstallClick = async () => {
    soundManager.playClick()
    const promptEvent = deferredPrompt || window.__deferredPwaPrompt
    if (promptEvent) {
      promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === 'accepted') {
        soundManager.playSuccess()
        window.__deferredPwaPrompt = null
        closePwaInstallModal()
      }
    }
  }

  const handleClose = () => {
    soundManager.playClick()
    closePwaInstallModal()
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

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-black mb-2 border border-emerald-200">
          <Download className="w-3.5 h-3.5" />
          <span>تطبيق الويب المستقل (PWA Standalone)</span>
        </div>

        <h3 className="text-lg font-black text-[#0a2540] mb-2">
          تثبيت منظومة غردقة فور يو
        </h3>

        {isStandalone ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 text-emerald-800 text-xs font-bold flex items-center gap-2 justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>المنظومة مثبتة بالفعل وتعمل الآن كبرنامج مستقل!</span>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              ثبت التطبيق على جهازك للتشغيل الفوري من سطح المكتب وشاشة الموبايل، والعمل بكفاءة تامة بدون إنترنت مع حفظ وتخزين البيانات محلياً.
            </p>

            {deferredPrompt || window.__deferredPwaPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3"
              >
                <Download className="w-4 h-4" />
                <span>تثبيت البرنامج بضغطة واحدة</span>
              </button>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-right space-y-2 mb-4 text-[11px] text-slate-700 font-bold">
                <div className="flex items-center gap-2 text-[#0a2540] font-black">
                  <Monitor className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>على الكمبيوتر ولابتوب:</span>
                </div>
                <div className="text-slate-600 pr-5 leading-relaxed">
                  اضغط على أيقونة التثبيت <span className="font-mono bg-white px-1.5 py-0.5 border rounded">⊕</span> أو <span className="font-mono bg-white px-1.5 py-0.5 border rounded">🖥️</span> في شريط عنوان المتصفح بالأعلى، أو من قائمة المتصفح (⋮) ثم "تثبيت التطبيق".
                </div>

                <div className="flex items-center gap-2 text-[#0a2540] font-black pt-1 border-t border-slate-200">
                  <Smartphone className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>على الموبايل (أندرويد وآيفون):</span>
                </div>
                <div className="text-slate-600 pr-5 leading-relaxed">
                  اضغط على زر المشاركة أو القائمة (⋮) ثم اختر <span className="text-[#0284c7] font-black">"إضافة إلى الشاشة الرئيسية"</span>.
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  )
}
