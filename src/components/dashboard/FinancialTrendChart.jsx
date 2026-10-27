import React, { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, Sparkles, Activity, Calendar } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function FinancialTrendChart({ dailyTrends }) {
  const [activeView, setActiveView] = useState('bars') // 'bars' | 'area'
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const maxVal = useMemo(() => {
    if (!dailyTrends || dailyTrends.length === 0) return 100
    const salesArr = dailyTrends.map((d) => d.sales)
    return Math.max(...salesArr, 100)
  }, [dailyTrends])

  const peakDay = useMemo(() => {
    if (!dailyTrends || dailyTrends.length === 0) return null
    return [...dailyTrends].sort((a, b) => b.sales - a.sales)[0]
  }, [dailyTrends])

  const totalPeriodSales = dailyTrends.reduce((s, d) => s + d.sales, 0)
  const totalPeriodProfit = dailyTrends.reduce((s, d) => s + d.profit, 0)
  const avgDailySales = dailyTrends.length > 0 ? Math.round(totalPeriodSales / dailyTrends.length) : 0

  // SVG Area calculations
  const svgWidth = 600
  const svgHeight = 180
  const paddingX = 40
  const paddingY = 25
  const graphWidth = svgWidth - paddingX * 2
  const graphHeight = svgHeight - paddingY * 2

  const points = useMemo(() => {
    if (dailyTrends.length === 0) return []
    const step = dailyTrends.length > 1 ? graphWidth / (dailyTrends.length - 1) : graphWidth
    return dailyTrends.map((d, i) => {
      const x = paddingX + i * step
      const salesY = svgHeight - paddingY - (d.sales / maxVal) * graphHeight
      const profitY = svgHeight - paddingY - (d.profit / maxVal) * graphHeight
      return { x, salesY, profitY, ...d }
    })
  }, [dailyTrends, maxVal, graphWidth, graphHeight, paddingX, paddingY, svgHeight])

  const salesPath = useMemo(() => {
    if (points.length === 0) return ''
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.salesY}`, '')
  }, [points])

  const salesAreaPath = useMemo(() => {
    if (points.length === 0) return ''
    const baseLine = svgHeight - paddingY
    return `${salesPath} L ${points[points.length - 1].x} ${baseLine} L ${points[0].x} ${baseLine} Z`
  }, [salesPath, points, svgHeight, paddingY])

  const profitPath = useMemo(() => {
    if (points.length === 0) return ''
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.profitY}`, '')
  }, [points])

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-100">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-800">
              مخطط التدفق المالي وصافي الأرباح
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-bold mt-1">
            مقارنة الإيرادات اليومية وتكاليف التشغيل وصافي الأرباح النقدية
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200/80 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => {
              soundManager.playClick()
              setActiveView('bars')
            }}
            className={`px-3 py-1 rounded-full transition-all ${
              activeView === 'bars'
                ? 'bg-[#0a2540] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            أعمدة بيانية
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setActiveView('area')
            }}
            className={`px-3 py-1 rounded-full transition-all ${
              activeView === 'area'
                ? 'bg-[#0a2540] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            منحنى تدفق (Area)
          </button>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="py-2">
        {dailyTrends.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-bold">
            لا توجد حركات تشغيلية كافية لرسم المنحنى البياني.
          </div>
        ) : activeView === 'bars' ? (
          <div className="space-y-3.5">
            {dailyTrends.map((d, index) => {
              const salesPct = Math.min(100, Math.round((d.sales / maxVal) * 100))
              const profitPct = Math.min(100, Math.round((d.profit / maxVal) * 100))
              const isPeak = peakDay && peakDay.date === d.date

              return (
                <div
                  key={d.date}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`p-2.5 rounded-2xl transition-all ${
                    hoveredIndex === index ? 'bg-sky-50/70 border border-sky-200' : 'bg-slate-50/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800">{d.date}</span>
                      {isPeak && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.2 rounded-full font-sans">
                          أعلى مبيعات 👑
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">
                        مبيعات: <strong className="text-slate-800">€{d.sales.toLocaleString()}</strong>
                      </span>
                      <span className="text-emerald-600 font-black">
                        صافي: +€{d.profit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200/70 rounded-full h-3.5 overflow-hidden flex gap-1 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-[#0284c7] rounded-full transition-all duration-500"
                      style={{ width: `${salesPct}%` }}
                      title={`مبيعات: €${d.sales}`}
                    />
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${profitPct}%` }}
                      title={`صافي الربح: €${d.profit}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 select-none">
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <line
                  key={pct}
                  x1={paddingX}
                  y1={svgHeight - paddingY - pct * graphHeight}
                  x2={svgWidth - paddingX}
                  y2={svgHeight - paddingY - pct * graphHeight}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Area Under Sales */}
              <path d={salesAreaPath} fill="url(#salesGradient)" />

              {/* Lines */}
              <path d={salesPath} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
              <path d={profitPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

              {/* Points */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.salesY}
                    r={hoveredIndex === idx ? '6' : '4'}
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  <circle
                    cx={p.x}
                    cy={p.profitY}
                    r={hoveredIndex === idx ? '6' : '4'}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#64748b"
                    fontFamily="monospace"
                  >
                    {p.date.substring(5)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Legend & Period Summary */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-600 font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#0284c7]" />
            <span>المبيعات (€)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>صافي الأرباح (+€)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono font-bold text-slate-500">
          <span>المتوسط اليومي: <strong className="text-slate-800">€{avgDailySales}</strong></span>
          <span>•</span>
          <span>أرباح الدورة: <strong className="text-emerald-600">+€{totalPeriodProfit.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  )
}
