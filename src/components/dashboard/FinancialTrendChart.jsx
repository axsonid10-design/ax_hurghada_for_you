import React, { useState, useMemo } from 'react'
import { Activity } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function FinancialTrendChart({ dailyTrends = [], displayCurrency = 'EUR', rates }) {
  const { t, lang } = useAXStore()
  const isRtl = lang === 'ar'
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const egpRate = rates?.EGP || 53.25
  const isEgp = displayCurrency === 'EGP'
  const egpSymbol = isRtl ? 'ج.م' : 'EGP'

  const formatAmount = (eurVal) => {
    if (isEgp) {
      return `${Math.round(eurVal * egpRate).toLocaleString()} ${egpSymbol}`
    }
    return `€${Math.round(eurVal).toLocaleString()}`
  }

  const maxFinance = useMemo(() => {
    if (!dailyTrends || dailyTrends.length === 0) return 100
    const sales = dailyTrends.map((d) => d.sales || 0)
    return Math.max(...sales, 100)
  }, [dailyTrends])

  const totalPeriodSales = dailyTrends.reduce((s, d) => s + (d.sales || 0), 0)
  const totalPeriodProfit = dailyTrends.reduce((s, d) => s + (d.profit || 0), 0)
  const totalPeriodPax = dailyTrends.reduce((s, d) => s + (d.adults || 0) + (d.children || 0), 0)
  const avgDailySales = dailyTrends.length > 0 ? Math.round(totalPeriodSales / dailyTrends.length) : 0

  const width = 640
  const height = 180
  const padX = 35
  const padY = 25
  const innerW = width - padX * 2
  const innerH = height - padY * 2

  const points = useMemo(() => {
    if (dailyTrends.length === 0) return []
    const step = dailyTrends.length > 1 ? innerW / (dailyTrends.length - 1) : innerW

    return dailyTrends.map((d, i) => {
      const x = padX + i * step
      const mainVal = d.sales
      const secVal = d.profit

      const y1 = height - padY - (mainVal / maxFinance) * innerH
      const y2 = height - padY - (Math.max(0, secVal) / maxFinance) * innerH

      return { x, y1, y2, ...d, mainVal, secVal }
    })
  }, [dailyTrends, maxFinance, innerW, innerH, height, padX, padY])

  const getSmoothPath = (pts, key = 'y1') => {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0][key]}`

    let path = `M ${pts[0].x} ${pts[0][key]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i]
      const next = pts[i + 1]
      const mx = (curr.x + next.x) / 2
      path += ` C ${mx} ${curr[key]}, ${mx} ${next[key]}, ${next.x} ${next[key]}`
    }
    return path
  }

  const salesLine = useMemo(() => getSmoothPath(points, 'y1'), [points])
  const profitLine = useMemo(() => getSmoothPath(points, 'y2'), [points])

  const salesArea = useMemo(() => {
    if (points.length === 0) return ''
    const line = getSmoothPath(points, 'y1')
    return `${line} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`
  }, [points, height, padY])

  const profitArea = useMemo(() => {
    if (points.length === 0) return ''
    const line = getSmoothPath(points, 'y2')
    return `${line} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`
  }, [points, height, padY])

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-900">
            {t('financial_trend_title')}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>{t('sales_title')}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{t('net_profit_title')}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">{isRtl ? 'مبيعات الفترة' : 'Period Sales'}</span>
          <span className="text-xs sm:text-sm font-black font-mono text-slate-900">
            {formatAmount(totalPeriodSales)}
          </span>
        </div>
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">{isRtl ? 'صافي أرباح الفترة' : 'Period Profit'}</span>
          <span className="text-xs sm:text-sm font-black font-mono text-emerald-700">
            {formatAmount(totalPeriodProfit)}
          </span>
        </div>
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">{isRtl ? 'متوسط المبيعات' : 'Avg Daily'}</span>
          <span className="text-xs sm:text-sm font-black font-mono text-sky-700">
            {formatAmount(avgDailySales)}
          </span>
        </div>
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">{isRtl ? 'إجمالي النزلاء' : 'Total Guests'}</span>
          <span className="text-xs sm:text-sm font-black font-mono text-slate-900">
            {totalPeriodPax} {t('pax_count')}
          </span>
        </div>
      </div>

      {dailyTrends.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          {t('no_trend_data')}
        </div>
      ) : (
        <div className="relative pt-2">
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              className="absolute z-20 bg-slate-900 text-white text-[11px] font-bold p-2 rounded-2xl shadow-xl border border-slate-700 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all"
              style={{
                left: `${(points[hoveredIndex].x / width) * 100}%`,
                top: `${(points[hoveredIndex].y1 / height) * 100 - 8}%`
              }}
            >
              <div className="text-sky-400 font-mono font-black border-b border-slate-800 pb-0.5 mb-1 text-center">
                {points[hoveredIndex].date}
              </div>
              <div className="space-y-0.5 min-w-[110px]">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">{t('sales_title')}:</span>
                  <span className="font-mono text-white">{formatAmount(points[hoveredIndex].sales)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">{t('cost_title')}:</span>
                  <span className="font-mono text-amber-400">{formatAmount(points[hoveredIndex].cost)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">{t('net_profit_title')}:</span>
                  <span className="font-mono text-emerald-400">{formatAmount(points[hoveredIndex].profit)}</span>
                </div>
              </div>
            </div>
          )}

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="flowSalesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="flowProfitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1={padX} y1={height / 2} x2={width - padX} y2={height / 2} stroke="#f1f5f9" strokeDasharray="4 4" />
            <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#e2e8f0" />

            <path d={salesArea} fill="url(#flowSalesGrad)" />
            <path d={salesLine} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />

            <path d={profitArea} fill="url(#flowProfitGrad)" />
            <path d={profitLine} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />

            {points.map((p, idx) => (
              <g key={p.date} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
                <circle cx={p.x} cy={p.y1} r={hoveredIndex === idx ? 5 : 3.5} fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <circle cx={p.x} cy={p.y2} r={hoveredIndex === idx ? 4.5 : 3} fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}
