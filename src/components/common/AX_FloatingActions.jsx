import React from 'react'
import { FileSpreadsheet, Receipt } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AX_FloatingActions({ onOpenUploadModal, onOpenNewExpense }) {
  const { lang } = useAXStore()
  const isRtl = lang === 'ar'

  return (
    <div
      className={`fixed bottom-24 lg:bottom-6 z-40 flex items-center gap-2 transition-all duration-300 ${
        isRtl ? 'left-4 lg:left-8' : 'right-4 lg:right-8'
      }`}
    >
      <button
        onClick={() => {
          soundManager.playClick()
          onOpenUploadModal?.()
        }}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-float border border-emerald-400/40 transition-all active:scale-95 hover:scale-105"
      >
        <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
        <span>{isRtl ? 'رفع شيت إكسيل' : 'Upload Excel'}</span>
      </button>

      <button
        onClick={() => {
          soundManager.playClick()
          onOpenNewExpense?.()
        }}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-float border border-rose-400/40 transition-all active:scale-95 hover:scale-105"
      >
        <Receipt className="w-4 h-4 text-rose-200" />
        <span>{isRtl ? 'تسجيل مصروف' : 'Add Expense'}</span>
      </button>
    </div>
  )
}
