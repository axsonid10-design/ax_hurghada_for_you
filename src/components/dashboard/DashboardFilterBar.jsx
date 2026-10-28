import React from 'react'
import {
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
  onOpenNewExpense,
  rates
}) {
  const periodButtons = [
    { id: 'today', label: 'اليوم' },
    { id: 'week', label: 'أسبوع' },
    { id: 'month', label: 'شهر' },
    { id: 'all', label: 'الكل' },
    { id: 'custom', label: 'مخصص' }
  ]

  const egpRate = rates?.EGP || 53.25

  return (
    <div className="w-full space-y-2.5">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left/Right branding and rate */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
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

        {/* Center: Period Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 self-start lg:self-auto flex-wrap">
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
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {btn.label}
              </button>
            )
          })}
        </div>

        {/* Currency & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
            <button
              onClick={() => {
                soundManager.playClick()
                setDisplayCurrency('EUR')
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
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
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                displayCurrency === 'EGP'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ج.م
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range if active */}
      {filterMode === 'custom' && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-2 flex items-center gap-2 flex-wrap animate-fadeIn">
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
  )
}
