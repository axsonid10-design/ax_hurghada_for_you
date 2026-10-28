import React from 'react'
import { Plus, FileSpreadsheet } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AX_FloatingActions({ onOpenNewBooking, onOpenUploadModal }) {
  const { lang, t } = useAXStore()
  const isRtl = lang === 'ar'

  return (
    <div
      className={`fixed bottom-20 lg:bottom-6 z-30 flex items-center gap-2 transition-all duration-300 ${
        isRtl ? 'left-4 lg:left-8' : 'right-4 lg:right-8'
      }`}
    >
      <button
        onClick={() => {
          soundManager.playClick()
          onOpenUploadModal?.()
        }}
        title={t('upload_sheet')}
        className="w-11 h-11 bg-white hover:bg-slate-50 text-emerald-600 rounded-full shadow-lg border border-slate-200 flex items-center justify-center transition-all active:scale-95 hover:scale-105"
      >
        <FileSpreadsheet className="w-5 h-5" />
      </button>

      <button
        onClick={() => {
          soundManager.playClick()
          onOpenNewBooking?.()
        }}
        className="flex items-center gap-2 px-5 py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-float border border-[#0284c7]/40 transition-all active:scale-95 hover:scale-105"
      >
        <Plus className="w-4 h-4 text-[#38bdf8]" />
        <span>{t('new_booking')}</span>
      </button>
    </div>
  )
}
