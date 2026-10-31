import React from 'react'
import {
  Calendar,
  ArrowLeftRight,
  TrendingUp,
  SlidersHorizontal,
  BarChart3
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { useAXStore } from '../../store/useAXStore'

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
  onOpenPnlReport,
  rates
}) {
  const { t, lang } = useAXStore()
  const isRtl = lang === 'ar'

  const periodButtons = [
    { id: 'today', label: t('filter_today') },
    { id: 'week', label: t('filter_week') },
    { id: 'month', label: t('filter_month') },
    { id: 'all', label: t('filter_all') },
    { id: 'custom', label: t('filter_custom') }
  ]

  const egpRate = rates?.EGP || 53.25

  return (
    <div className="w-full space-y-2.5">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left/Right branding and rate */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {t('dashboard_title')}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
            <span>1€ = {egpRate} {t('curr_egp_pill')}</span>
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            ({totalBookingsCount} {t('bookings_count')})
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
              {t('curr_eur_pill')}
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
              {t('curr_egp_pill')}
            </button>
          </div>

          {onOpenPnlReport && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick()
                onOpenPnlReport()
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-200" />
              <span>{t('pnl_report_btn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range if active */}
      {filterMode === 'custom' && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-2 flex items-center gap-2 flex-wrap animate-fadeIn">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>{t('from_label')}</span>
          </span>
          <div className="w-36">
            <AX_CompanyDatePicker
              value={customFrom}
              onChange={(d) => setCustomFrom(d)}
              placeholder={t('from_date')}
            />
          </div>

          <span className="text-xs font-bold text-slate-600">{t('to_label')}</span>
          <div className="w-36">
            <AX_CompanyDatePicker
              value={customTo}
              onChange={(d) => setCustomTo(d)}
              placeholder={t('to_date')}
            />
          </div>
        </div>
      )}
    </div>
  )
}
