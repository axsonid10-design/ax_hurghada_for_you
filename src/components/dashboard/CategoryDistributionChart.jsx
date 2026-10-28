import React, { useMemo } from 'react'
import { PieChart, Compass, Anchor, Flame, Waves, Car } from 'lucide-react'

const CATEGORY_META = {
  islands: {
    label: 'رحلات الجزر واليخوت',
    color: '#0284c7',
    bgColor: 'bg-sky-500',
    lightBg: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
    icon: Anchor
  },
  sea: {
    label: 'رحلات البحر والسنوركل',
    color: '#0ea5e9',
    bgColor: 'bg-sky-400',
    lightBg: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
    icon: Waves
  },
  safari: {
    label: 'السفاري والصحراء',
    color: '#f59e0b',
    bgColor: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    icon: Flame
  },
  aqua: {
    label: 'الغوص والرياضات المائية',
    color: '#10b981',
    bgColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    icon: Waves
  },
  transfers: {
    label: 'انتقالات وتحصيل خاص',
    color: '#8b5cf6',
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    icon: Car
  }
}

export function CategoryDistributionChart({
  filteredBookings = [],
  tripDefinitions = [],
  displayCurrency = 'EUR',
  rates
}) {
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
      islands: { key: 'islands', count: 0, pax: 0, sales: 0, cost: 0, profit: 0 },
      safari: { key: 'safari', count: 0, pax: 0, sales: 0, cost: 0, profit: 0 },
      aqua: { key: 'aqua', count: 0, pax: 0, sales: 0, cost: 0, profit: 0 },
      transfers: { key: 'transfers', count: 0, pax: 0, sales: 0, cost: 0, profit: 0 }
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
        map[catKey] = { key: catKey, count: 0, pax: 0, sales: 0, cost: 0, profit: 0 }
      }

      const adults = Number(b.adult) || 0
      const children = Number(b.child) || 0
      map[catKey].count += 1
      map[catKey].pax += adults + children
      map[catKey].sales += Number(b.sell_eur) || 0
      map[catKey].cost += Number(b.cost_eur) || 0
      map[catKey].profit += Number(b.profit_eur) || 0
    })

    const totalSales = Object.values(map).reduce((sum, c) => sum + c.sales, 0) || 1
    const totalPax = Object.values(map).reduce((sum, c) => sum + c.pax, 0) || 1

    return Object.values(map)
      .map((item) => ({
        ...item,
        meta: CATEGORY_META[item.key] || CATEGORY_META.islands,
        salesPct: Math.round((item.sales / totalSales) * 100),
        paxPct: Math.round((item.pax / totalPax) * 100)
      }))
      .sort((a, b) => b.sales - a.sales)
  }, [filteredBookings, tripDefinitions])

  const totalFilteredSales = categoryStats.reduce((s, c) => s + c.sales, 0)

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              توزيع الإيرادات والأفراد حسب أقسام الرحلات
            </h3>
            <p className="text-[11px] text-slate-500 font-bold">
              نسبة مساهمة كل قطاع سياحي في إجمالي المبيعات وحجم النزلاء
            </p>
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          إجمالي الإيراد: <span className="font-black text-slate-900">{formatAmount(totalFilteredSales)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {categoryStats.map((cat) => {
          const Icon = cat.meta.icon
          return (
            <div
              key={cat.key}
              className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl ${cat.meta.lightBg} ${cat.meta.textColor} border ${cat.meta.borderColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      {cat.meta.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {cat.count} حجز • {cat.pax} فرد
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs font-black font-mono text-slate-900 block">
                    {formatAmount(cat.sales)}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">
                    أرباح: {formatAmount(cat.profit)} ({cat.salesPct}%)
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.meta.bgColor} transition-all duration-500`}
                  style={{ width: `${Math.max(3, cat.salesPct)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
