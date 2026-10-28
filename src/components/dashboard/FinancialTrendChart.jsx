import React, { useState, useMemo } from 'react'
import { Activity, BarChart3, Users, Calendar, TrendingUp } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function FinancialTrendChart({ dailyTrends = [], displayCurrency = 'EUR', rates }) {
  const [activeMetric, setActiveMetric] = useState('finance')
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const egpRate = rates?.EGP || 53.25
  const isEgp = displayCurrency === 'EGP'

  const formatAmount = (eurVal) => {
    if (isEgp) {
      return `${Math.round(eurVal * egpRate).toLocaleString()} ج.م`
    }
    return `€${Math.round(eurVal).toLocaleString()}`
  }

  const maxFinance = useMemo(() => {
    if (!dailyTrends || dailyTrends.length === 0) return 100
    const sales = dailyTrends.map((d) => d.sales || 0)
    return Math.max(...sales, 100)
  }, [dailyTrends])

  const maxPax = useMemo(() => {
    if (!dailyTrends || dailyTrends.length === 0) return 20
    const pax = dailyTrends.map((d) => (d.adults || 0) + (d.children || 0))
    return Math.max(...pax, 20)
  }, [dailyTrends])

  const peakDay = useMemo(() => {
    if (!dailyTrends || dailyTrends.length === 0) return null
    return [...dailyTrends].sort((a, b) => b.sales - a.sales)[0]
  }, [dailyTrends])

  const totalPeriodSales = dailyTrends.reduce((s, d) => s + (d.sales || 0), 0)
  const totalPeriodProfit = dailyTrends.reduce((s, d) => s + (d.profit || 0), 0)
  const totalPeriodPax = dailyTrends.reduce((s, d) => s + (d.adults || 0) + (d.children || 0), 0)
  const avgDailySales = dailyTrends.length > 0 ? Math.round(totalPeriodSales / dailyTrends.length) : 0

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              مخطط الأداء اليومي والتدفقات المالية
            </h3>
            <p className="text-[11px] text-slate-500 font-bold">
              مقارنة الإيرادات وتكاليف الموردين وصافي الربح وحجم النزلاء
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200/80 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => {
              soundManager.playClick()
              setActiveMetric('finance')
            }}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              activeMetric === 'finance'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>الماليات والأرباح</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setActiveMetric('pax')
            }}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              activeMetric === 'pax'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>أعداد النزلاء (PAX)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">إجمالي مبيعات الفترة</span>
          <span className="text-sm font-black font-mono text-slate-900">
            {formatAmount(totalPeriodSales)}
          </span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">صافي أرباح الفترة</span>
          <span className="text-sm font-black font-mono text-emerald-700">
            {formatAmount(totalPeriodProfit)}
          </span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">متوسط المبيعات اليومية</span>
          <span className="text-sm font-black font-mono text-sky-700">
            {formatAmount(avgDailySales)}
          </span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">إجمالي النزلاء (PAX)</span>
          <span className="text-sm font-black font-mono text-slate-900">
            {totalPeriodPax} نزيل
          </span>
        </div>
      </div>

      {dailyTrends.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          لا توجد حركات مسجلة لعرض المخطط البياني في هذا النطاق
        </div>
      ) : (
        <div className="pt-4 space-y-4">
          <div className="flex items-end justify-between gap-2 h-48 px-2 border-b border-slate-200">
            {dailyTrends.map((d, idx) => {
              const salesPct = Math.min(100, Math.round((d.sales / maxFinance) * 100))
              const costPct = Math.min(100, Math.round((d.cost / maxFinance) * 100))
              const profitPct = Math.max(0, Math.min(100, Math.round((d.profit / maxFinance) * 100)))

              const paxTotal = (d.adults || 0) + (d.children || 0)
              const paxPct = Math.min(100, Math.round((paxTotal / maxPax) * 100))
              const isHovered = hoveredIndex === idx

              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {isHovered && (
                    <div className="absolute -top-24 z-20 bg-slate-900 text-white text-[11px] font-bold p-2.5 rounded-2xl shadow-xl border border-slate-700 min-w-[140px] text-right pointer-events-none animate-fadeIn">
                      <div className="text-sky-400 font-mono font-black border-b border-slate-800 pb-1 mb-1">
                        {d.date} ({d.count} حجز)
                      </div>
                      {activeMetric === 'finance' ? (
                        <div className="space-y-0.5">
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-400">مبيعات:</span>
                            <span className="font-mono text-white">{formatAmount(d.sales)}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-400">تكلفة:</span>
                            <span className="font-mono text-amber-400">{formatAmount(d.cost)}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-400">صافي ربح:</span>
                            <span className="font-mono text-emerald-400">{formatAmount(d.profit)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-400">إجمالي الأفراد:</span>
                            <span className="font-mono text-white">{paxTotal}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-400">بالغين:</span>
                            <span className="font-mono text-sky-400">{d.adults || 0}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-400">أطفال:</span>
                            <span className="font-mono text-amber-400">{d.children || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full pb-1">
                    {activeMetric === 'finance' ? (
                      <>
                        <div
                          className="w-1/3 bg-sky-500 rounded-t-lg transition-all duration-300 hover:bg-sky-400"
                          style={{ height: `${salesPct}%` }}
                        />
                        <div
                          className="w-1/3 bg-amber-400 rounded-t-lg transition-all duration-300 hover:bg-amber-300"
                          style={{ height: `${costPct}%` }}
                        />
                        <div
                          className="w-1/3 bg-emerald-500 rounded-t-lg transition-all duration-300 hover:bg-emerald-400"
                          style={{ height: `${profitPct}%` }}
                        />
                      </>
                    ) : (
                      <div
                        className="w-full bg-slate-800 rounded-t-lg transition-all duration-300 hover:bg-sky-600 flex flex-col justify-end"
                        style={{ height: `${paxPct}%` }}
                      >
                        <div
                          className="w-full bg-amber-400 rounded-t-lg"
                          style={{ height: paxTotal > 0 ? `${((d.children || 0) / paxTotal) * 100}%` : '0%' }}
                        />
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-mono font-bold text-slate-500 mt-2 block whitespace-nowrap">
                    {d.date.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 pt-2 flex-wrap">
            {activeMetric === 'finance' ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>المبيعات</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>تكلفة الموردين</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>صافي الربح</span>
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                  <span>بالغين</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>أطفال</span>
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
