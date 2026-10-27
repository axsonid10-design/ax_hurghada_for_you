import React from 'react'
import { AlertTriangle, CheckCircle, HelpCircle, X } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'

export function AX_ConfirmModal() {
  const { confirmModal, closeConfirmModal } = useAXStore()

  if (!confirmModal.isOpen) return null

  const handleConfirm = () => {
    soundManager.playSuccess()
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm()
    }
    closeConfirmModal()
  }

  const handleCancel = () => {
    soundManager.playClick()
    closeConfirmModal()
  }

  const isDanger = confirmModal.type === 'danger'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative animate-scaleUp">
        <button
          onClick={handleCancel}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 shadow-sm ${
            isDanger ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'
          }`}
        >
          {isDanger ? (
            <AlertTriangle className="w-7 h-7" />
          ) : (
            <HelpCircle className="w-7 h-7" />
          )}
        </div>

        <h3 className="text-base font-black text-[#0a2540] mb-2">
          {confirmModal.title}
        </h3>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          {confirmModal.message}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handleConfirm}
            className={`flex-1 py-2.5 rounded-full font-black text-xs text-white shadow-md transition-all active:scale-95 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-[#0a2540] hover:bg-[#133e66]'
            }`}
          >
            {confirmModal.confirmText || 'تأكيد'}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors"
          >
            {confirmModal.cancelText || 'إلغاء'}
          </button>
        </div>
      </div>
    </div>
  )
}
