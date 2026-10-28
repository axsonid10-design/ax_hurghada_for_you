import React, { useState, useMemo } from 'react'
import { Activity, BarChart3, Users, TrendingUp, Sparkles } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function FinancialTrendChart({ dailyTrends = [], displayCurrency = 'EUR', rates }) {
  const [activeMetric, setActiveMetric] = useState('finance')
  const [chartType, setChartType] = useState('area')
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
    const maxVal = activeMetric === 'finance' ? maxFinance : maxPax

    return dailyTrends.map((d, i) => {
      const x = padX + i * step
      const mainVal = activeMetric === 'finance' ? d.sales : (d.adults || 0) + (d.children || 0)
      const secVal = activeMetric === 'finance' ? d.profit : (d.adults || 0)

      const y1 = height - padY - (mainVal / maxVal) * innerH
      const y2 = height - padY - (Math.max(0, secVal) / maxVal) * innerH

      return { x, y1, y2, ...d, mainVal, secVal }
    })
  }, [dailyTrends, activeMetric, maxFinance, maxPax, innerW, innerH, height, padX, padY])

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
    const base = height - padY
    return `${salesLine} L ${points[points.length - 1].x} ${base} L ${points[0].x} ${base} Z`
  }, [salesLine, points, height, padY])

  const profitArea = useMemo(() => {
    if (points.length === 0) return ''
    const base = height - padY
    return `${profitLine} L ${points[points.length - 1].x} ${base} L ${points[0].x} ${base} Z`
  }, [profitLine, points, height, padY])

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              منحنى التدفق والسيولة اليومية (Trend & Flow)
            </h3>
            <p className="text-[11px] text-slate-500 font-bold">
              رسم بياني انسيابي تفاعلي بحسابات المحفظة والتشغيل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                soundManager.playClick()
                setChartType('area')
              }}
              className={`px-2.5 py-1 rounded-full transition-all ${
                chartType === 'area' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              منحنى انسيابي
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setChartType('bars')
              }}
              className={`px-2.5 py-1 rounded-full transition-all ${
                chartType === 'bars' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              أعمدة
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                soundManager.playClick()
                setActiveMetric('finance')
              }}
              className={`px-2.5 py-1 rounded-full transition-all ${
                activeMetric === 'finance' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              الماليات
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setActiveMetric('pax')
              }}
              className={`px-2.5 py-1 rounded-full transition-all ${
                activeMetric === 'pax' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              النزلاء
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">مبيعات الفترة</span>
          <span className="text-xs sm:text-sm font-black font-mono text-slate-900">
            {formatAmount(totalPeriodSales)}
          </span>
        </div>
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">صافي أرباح الفترة</span>
          <span className="text-xs sm:text-sm font-black font-mono text-emerald-700">
            {formatAmount(totalPeriodProfit)}
          </span>
        </div>
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">متوسط المبيعات</span>
          <span className="text-xs sm:text-sm font-black font-mono text-sky-700">
            {formatAmount(avgDailySales)}
          </span>
        </div>
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold block">إجمالي النزلاء</span>
          <span className="text-xs sm:text-sm font-black font-mono text-slate-900">
            {totalPeriodPax} فرد
          </span>
        </div>
      </div>

      {dailyTrends.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          لا توجد حركات مسجلة لعرض المنحنى البياني
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
              {activeMetric === 'finance' ? (
                <div className="space-y-0.5 min-w-[110px]">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">مبيعات:</span>
                    <span className="font-mono text-white">{formatAmount(points[hoveredIndex].sales)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">تكلفة:</span>
                    <span className="font-mono text-amber-400">{formatAmount(points[hoveredIndex].cost)}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">صافي:</span>
                    <span className="font-mono text-emerald-400">{formatAmount(points[hoveredIndex].profit)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5 min-w-[100px]">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">نزلاء:</span>
                    <span className="font-mono text-white">{points[hoveredIndex].mainVal}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">بالغين:</span>
                    <span className="font-mono text-sky-400">{points[hoveredIndex].adults || 0}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">أطفال:</span>
                    <span className="font-mono text-amber-400">{points[hoveredIndex].children || 0}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {chartType === 'area' ? (
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

              {activeMetric === 'finance' && (
                <>
                  <path d={profitArea} fill="url(#flowProfitGrad)" />
                  <path d={profitLine} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
                </>
              )}

              {points.map((p, idx) => (
                <g key={p.date} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
                  <circle cx={p.x} cy={p.y1} r={hoveredIndex === idx ? 5 : 3.5} fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                  <text x={p.x} y={height - 6} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#64748b" fontWeight="bold">
                    {p.date.slice(5)}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            <div className="flex items-end justify-between gap-2 h-44 px-2 border-b border-slate-200">
              {dailyTrends.map((d, idx) => {
                const maxVal = activeMetric === 'finance' ? maxFinance : maxPax
                const sPct = Math.min(100, Math.round(((d.sales || 0) / maxVal) * 100))
                const cPct = Math.min(100, Math.round(((d.cost || 0) / maxVal) * 100))
                const pPct = Math.max(0, Math.min(100, Math.round(((d.profit || 0) / maxVal) * 100)))

                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="w-full max-w-[36px] flex items-end justify-center gap-0.5 h-full pb-1">
                      <div className="w-1/3 bg-sky-500 rounded-t-md transition-all" style={{ height: `${sPct}%` }} />
                      <div className="w-1/3 bg-amber-400 rounded-t-md transition-all" style={{ height: `${cPct}%` }} />
                      <div className="w-1/3 bg-emerald-500 rounded-t-md transition-all" style={{ height: `${pPct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 mt-1 whitespace-nowrap">
                      {d.date.slice(5)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 pt-2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span>{activeMetric === 'finance' ? 'المبيعات' : 'إجمالي النزلاء'}</span>
            </span>
            {activeMetric === 'finance' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>صافي الأرباح</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
