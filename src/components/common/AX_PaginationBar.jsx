import React from 'react'
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AX_PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}) {
  const { t, lang } = useAXStore()
  const isRtl = lang === 'ar'

  if (totalPages <= 1) return null

  const handlePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return
    soundManager.playClick()
    onPageChange(newPage)
  }

  const startIdx = (currentPage - 1) * pageSize + 1
  const endIdx = Math.min(currentPage * pageSize, totalItems)

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight
  const FirstIcon = isRtl ? ChevronsRight : ChevronsLeft
  const LastIcon = isRtl ? ChevronsLeft : ChevronsRight

  return (
    <div className="w-full bg-white rounded-full border border-slate-200 px-4 py-2 shadow-soft flex items-center justify-between gap-3 text-xs">
      <div className="font-bold text-slate-500 flex items-center gap-1.5 flex-wrap">
        <span>{t('pagination_showing')}</span>
        <span className="font-mono text-[#0a2540] font-black">{startIdx} - {endIdx}</span>
        <span>{t('pagination_of')}</span>
        <span className="font-mono text-[#0284c7] font-black">{totalItems}</span>
        <span>{t('pagination_records')}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePage(1)}
          disabled={currentPage === 1}
          title={t('pagination_first')}
          className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <FirstIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => handlePage(currentPage - 1)}
          disabled={currentPage === 1}
          title={t('pagination_prev')}
          className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <PrevIcon className="w-4 h-4" />
        </button>

        <div className="flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-[#0a2540] font-mono font-black text-xs">
          <span>{currentPage}</span>
          <span className="mx-1 text-slate-400">/</span>
          <span>{totalPages}</span>
        </div>

        <button
          onClick={() => handlePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          title={t('pagination_next')}
          className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <NextIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => handlePage(totalPages)}
          disabled={currentPage === totalPages}
          title={t('pagination_last')}
          className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <LastIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
