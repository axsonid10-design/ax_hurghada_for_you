import React from 'react'
import {
  FileSpreadsheet,
  Plus,
  Receipt,
  Calendar,
  ArrowLeftRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'

export function DashboardFilterBar({
  filterMode,
  setFilterMode,
  selectedDate,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  displayCurrency,
  setDisplayCurrency,
  totalBookingsCount,
  onOpenUploadModal,
  onOpenNewBooking,
  onOpenNewExpense,
  rates
}) {
  const periodButtons = [
    { id: 'today', label: `اليوم (${selectedDate})` },
    { id: 'week', label: 'آخر 7 أيام' },
    { id: 'month', label: 'هذا الشهر' },
    { id: 'all', label: 'كامل الأرشيف' },
    { id: 'custom', label: 'بين تاريخين' }
  ]

  const egpRate = rates?.EGP || 53.25

  return (
    <div className="w-full space-y-3">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            لوحة المتابعة
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
            <span>1€ = {egpRate} ج.م</span>
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            ({totalBookingsCount} حجز)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
            <button
              onClick={() => {
                soundManager.playClick()
                setDisplayCurrency('EUR')
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                displayCurrency === 'EUR'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              € يورو
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setDisplayCurrency('EGP')
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                displayCurrency === 'EGP'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ج.م مصري
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenUploadModal()
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full text-xs font-black shadow-md shadow-emerald-950/10 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>رفع شيت إكسيل</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenNewBooking()
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white rounded-full text-xs font-black shadow-md shadow-sky-950/10 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-sky-200" />
            <span>حجز جديد</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenNewExpense()
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-rose-50 text-rose-700 rounded-full text-xs font-black border border-rose-300 shadow-sm transition-all active:scale-95"
          >
            <Receipt className="w-4 h-4 text-rose-600" />
            <span>تسجيل مصروف</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>النطاق الزمني:</span>
          </span>
          {periodButtons.map((btn) => {
            const active = filterMode === btn.id
            return (
              <button
                key={btn.id}
                onClick={() => {
                  soundManager.playClick()
                  setFilterMode(btn.id)
                }}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {btn.label}
              </button>
            )
          })}
        </div>

        {filterMode === 'custom' && (
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 animate-fadeIn">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>من:</span>
            </span>
            <div className="w-36">
              <AX_CompanyDatePicker
                value={customFrom}
                onChange={(d) => setCustomFrom(d)}
                placeholder="من تاريخ"
              />
            </div>

            <span className="text-xs font-bold text-slate-600">إلى:</span>
            <div className="w-36">
              <AX_CompanyDatePicker
                value={customTo}
                onChange={(d) => setCustomTo(d)}
                placeholder="إلى تاريخ"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
