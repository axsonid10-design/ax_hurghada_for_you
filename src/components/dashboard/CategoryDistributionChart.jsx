import React, { useState, useMemo } from 'react'
import { PieChart, Anchor, Waves, Flame, Car } from 'lucide-react'

const CATEGORY_META = {
  islands: {
    label: 'الجزر واليخوت',
    color: '#0284c7',
    icon: Anchor
  },
  safari: {
    label: 'سفاري وصحراء',
    color: '#f59e0b',
    icon: Flame
  },
  aqua: {
    label: 'غوص ورياضات مائية',
    color: '#10b981',
    icon: Waves
  },
  transfers: {
    label: 'تحصيل وانتقالات',
    color: '#8b5cf6',
    icon: Car
  }
}

export function CategoryDistributionChart({
  filteredBookings = [],
  tripDefinitions = [],
  displayCurrency = 'EUR',
  rates
}) {
  const [hoveredKey, setHoveredKey] = useState(null)

  const egpRate = rates?.EGP || 53.25
  const isEgp = displayCurrency === 'EGP'

  const formatAmount = (eurVal) => {
    if (isEgp) {
      return `${Math.round(eurVal * egpRate).toLocaleString()} ج.م`
    }
    return `€${Math.round(eurVal).toLocaleString()}`
  }

  const categoryStats = useMemo(() => {
    const map = {
      islands: { key: 'islands', count: 0, pax: 0, sales: 0, profit: 0 },
      safari: { key: 'safari', count: 0, pax: 0, sales: 0, profit: 0 },
      aqua: { key: 'aqua', count: 0, pax: 0, sales: 0, profit: 0 },
      transfers: { key: 'transfers', count: 0, pax: 0, sales: 0, profit: 0 }
    }

    filteredBookings.forEach((b) => {
      const tripName = (b.trip_type || '').toLowerCase()
      let catKey = 'islands'

      const def = tripDefinitions.find(
        (td) =>
          td.sheet_name?.toLowerCase() === tripName ||
          td.display_name?.toLowerCase() === tripName
      )

      if (def?.category) {
        catKey = def.category === 'sea' ? 'islands' : def.category
      } else {
        if (tripName.includes('safari') || tripName.includes('باجي') || tripName.includes('سفاري')) {
          catKey = 'safari'
        } else if (tripName.includes('diving') || tripName.includes('غوص') || tripName.includes('dolphin') || tripName.includes('submarine') || tripName.includes('parasail')) {
          catKey = 'aqua'
        } else if (tripName.includes('pickup') || tripName.includes('transfer') || tripName.includes('horse') || tripName.includes('spa') || tripName.includes('تحصيل')) {
          catKey = 'transfers'
        }
      }

      if (!map[catKey]) {
        map[catKey] = { key: catKey, count: 0, pax: 0, sales: 0, profit: 0 }
      }

      const adults = Number(b.adult) || 0
      const children = Number(b.child) || 0
      map[catKey].count += 1
      map[catKey].pax += adults + children
      map[catKey].sales += Number(b.sell_eur) || 0
      map[catKey].profit += Number(b.profit_eur) || 0
    })

    const totalSales = Object.values(map).reduce((sum, c) => sum + c.sales, 0) || 1
    const totalPax = Object.values(map).reduce((sum, c) => sum + c.pax, 0) || 1

    let accumulatedPct = 0
    return Object.values(map).map((item) => {
      const pct = Math.max(0, item.sales / totalSales)
      const startPct = accumulatedPct
      accumulatedPct += pct
      return {
        ...item,
        meta: CATEGORY_META[item.key] || CATEGORY_META.islands,
        salesPct: Math.round(pct * 100),
        paxPct: Math.round((item.pax / totalPax) * 100),
        startPct,
        pct
      }
    })
  }, [filteredBookings, tripDefinitions])

  const totalFilteredSales = categoryStats.reduce((s, c) => s + c.sales, 0)
  const totalFilteredPax = categoryStats.reduce((s, c) => s + c.pax, 0)

  const radius = 64
  const circumference = 2 * Math.PI * radius

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              حلقة التوزيع والأنشطة الدائرية (Categorical Donut)
            </h3>
            <p className="text-[11px] text-slate-500 font-bold">
              توزيع المبيعات والنزلاء عبر الأقسام الرئيسية
            </p>
          </div>
        </div>

        <div className="whitespace-nowrap flex items-baseline gap-1 text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          <span>الإجمالي:</span>
          <span className="font-black text-slate-900">{formatAmount(totalFilteredSales)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="20"
            />
            {categoryStats.map((cat) => {
              const dashLength = cat.pct * circumference
              const strokeOffset = (1 - cat.startPct) * circumference
              const isHovered = hoveredKey === cat.key

              return (
                <circle
                  key={cat.key}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={cat.meta.color}
                  strokeWidth={isHovered ? 24 : 20}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredKey(cat.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                />
              )
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400">إجمالي النزلاء</span>
            <span className="text-xl font-mono font-black text-slate-900">{totalFilteredPax}</span>
            <span className="text-[10px] font-mono font-bold text-sky-700">{formatAmount(totalFilteredSales)}</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          {categoryStats.map((cat) => {
            const Icon = cat.meta.icon
            const isHovered = hoveredKey === cat.key
            return (
              <div
                key={cat.key}
                onMouseEnter={() => setHoveredKey(cat.key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isHovered ? 'bg-sky-50/50 border-sky-300 shadow-xs' : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.meta.color }} />
                    <span className="font-black text-slate-900">{cat.meta.label}</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">({cat.pax} فرد)</span>
                  </div>

                  <div className="whitespace-nowrap flex items-baseline gap-1 text-xs font-mono font-black text-slate-900">
                    <span>{formatAmount(cat.sales)}</span>
                    <span className="text-[10px] font-bold text-slate-400">({cat.salesPct}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(4, cat.salesPct)}%`, backgroundColor: cat.meta.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
