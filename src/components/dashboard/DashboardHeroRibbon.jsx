import React from 'react'
import {
  FileSpreadsheet,
  Plus,
  Receipt,
  Calendar,
  Sparkles,
  ArrowLeftRight,
  ShieldCheck,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'

export function DashboardHeroRibbon({
  filterMode,
  setFilterMode,
  selectedDate,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  totalBookingsCount,
  onOpenUploadModal,
  onOpenNewBooking,
  onOpenNewExpense,
  rates,
  grandSalesEur,
  grandSalesEgp
}) {
  return (
    <div className="w-full space-y-3">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#061626] via-[#09223a] to-[#0a2540] text-white p-5 border border-sky-500/20 shadow-xl shadow-slate-900/10">
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>مركز العمليات الميدانية والتشغيل الحي</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                <ArrowLeftRight className="w-3 h-3 text-sky-400" />
                <span>1€ = {rates.EGP} ج.م • 1$ = {Math.round(rates.EGP / rates.USD * 10) / 10} ج.م</span>
              </span>
            </div>

            <div className="flex items-baseline gap-3 pt-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                منظومة قيادة الرحلات والربحية
              </h1>
              <span className="text-xs font-mono font-bold text-sky-300/80 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                HURGHADA OPS V6.0
              </span>
            </div>

            <div className="text-xs text-slate-300 font-bold flex items-center gap-3">
              <span>إجمالي التشغيل اللحظي:</span>
              <span className="font-mono font-black text-sky-400 text-sm">€{grandSalesEur.toLocaleString()}</span>
              <span className="text-slate-400">≈</span>
              <span className="font-mono font-black text-emerald-400 text-sm">{grandSalesEgp.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                soundManager.playClick()
                onOpenUploadModal()
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full text-xs font-black shadow-lg shadow-emerald-950/20 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>رفع إكسيل الحجوزات</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick()
                onOpenNewBooking()
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#38bdf8] hover:to-[#0284c7] text-white rounded-full text-xs font-black shadow-lg shadow-sky-950/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-sky-200" />
              <span>حجز فردي جديد</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick()
                onOpenNewExpense()
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-rose-200 hover:text-white rounded-full text-xs font-black border border-rose-400/30 transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>تسجيل مصروف</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 ml-1">نطاق العرض:</span>
            {[
              { id: 'today', label: `اليوم (${selectedDate})` },
              { id: 'week', label: 'آخر 7 أيام' },
              { id: 'month', label: 'هذا الشهر' },
              { id: 'custom', label: 'بين تاريخين' },
              { id: 'all', label: 'كامل الأرشيف' }
            ].map((tab) => {
              const active = filterMode === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundManager.playClick()
                    setFilterMode(tab.id)
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
                    active
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="text-xs font-mono font-bold text-slate-300">
            السجلات المعروضة: <span className="text-sky-400 font-black">{totalBookingsCount}</span> حجز
          </div>
        </div>
      </div>

      {filterMode === 'custom' && (
        <div className="bg-white border border-sky-200 p-4 rounded-3xl shadow-soft flex flex-wrap items-center gap-3 animate-fadeIn">
          <span className="text-xs font-black text-sky-950 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>تحديد النطاق الزمني للتقارير:</span>
          </span>

          <div className="w-44">
            <AX_CompanyDatePicker
              value={customFrom}
              onChange={(d) => setCustomFrom(d)}
              placeholder="من تاريخ"
            />
          </div>

          <span className="text-slate-400 font-bold">—</span>

          <div className="w-44">
            <AX_CompanyDatePicker
              value={customTo}
              onChange={(d) => setCustomTo(d)}
              placeholder="إلى تاريخ"
            />
          </div>

          <span className="text-xs font-mono font-bold text-sky-800 bg-sky-100 px-3 py-1.5 rounded-full">
            {totalBookingsCount} حجز في هذا النطاق
          </span>
        </div>
      )}
    </div>
  )
}
