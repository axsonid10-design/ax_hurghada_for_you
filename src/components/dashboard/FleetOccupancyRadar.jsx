import React, { useMemo } from 'react'
import { Ship, Compass, PieChart, Users, Anchor, Waves } from 'lucide-react'

const FLEET_VESSELS = [
  {
    id: 'hula_hula',
    name: 'يخت هولا هولا الملكي (Hula Hula Catamaran)',
    category: 'رحلات بحرية وجزر',
    maxCapacity: 50,
    matchKeywords: ['هولا', 'hula', 'catamaran', 'كاتاماران']
  },
  {
    id: 'orange_bay',
    name: 'أسطول وسرعات جزيرة أورانج باي (Orange Bay)',
    category: 'رحلات بحرية وجزر',
    maxCapacity: 70,
    matchKeywords: ['أورانج', 'orange', 'جزيرة', 'island']
  },
  {
    id: 'safari_fleet',
    name: 'أسطول سفاري الصحراء والبيتش باجي (Quad Safari)',
    category: 'سفاري ومغامرات',
    maxCapacity: 40,
    matchKeywords: ['سفاري', 'safari', 'باجي', 'buggy', 'موتوسيكل']
  },
  {
    id: 'seascope_diving',
    name: 'الغواصة الملكية وأنشطة الغوص (Royal Seascope)',
    category: 'غوص ودولفين هاوس',
    maxCapacity: 45,
    matchKeywords: ['غواصة', 'seascope', 'غوص', 'diving', 'دولفين', 'dolphin']
  }
]

const CATEGORY_COLORS = {
  'رحلات بحرية وجزر': '#0284c7',
  'سفاري ومغامرات': '#f59e0b',
  'غوص ودولفين هاوس': '#10b981',
  'نقل وخدمات خاصة': '#8b5cf6',
  'أخرى': '#64748b'
}

export function FleetOccupancyRadar({ filteredBookings, tripDefinitions = [] }) {
  // Compute Vessel Occupancy from Bookings
  const vesselOccupancy = useMemo(() => {
    return FLEET_VESSELS.map((vessel) => {
      let bookedPax = 0
      filteredBookings.forEach((b) => {
        const trip = (b.trip_type || '').toLowerCase()
        const isMatch = vessel.matchKeywords.some((k) => trip.includes(k.toLowerCase()))
        if (isMatch) {
          bookedPax += (Number(b.adult) || 0) + (Number(b.child) || 0)
        }
      })
      const percent = Math.min(100, Math.round((bookedPax / vessel.maxCapacity) * 100))
      return { ...vessel, bookedPax, percent }
    })
  }, [filteredBookings])

  // Category Revenue & Pax Breakdown for SVG Donut
  const categoryStats = useMemo(() => {
    const map = {}
    filteredBookings.forEach((b) => {
      const def = tripDefinitions.find((t) => t.name === b.trip_type || t.name_ar === b.trip_type)
      const cat = def ? (def.category_ar || def.category || 'رحلات بحرية وجزر') : 'رحلات بحرية وجزر'
      if (!map[cat]) {
        map[cat] = { pax: 0, sales: 0 }
      }
      map[cat].pax += (Number(b.adult) || 0) + (Number(b.child) || 0)
      map[cat].sales += Number(b.sell_eur) || 0
    })

    const totalSales = Object.values(map).reduce((sum, c) => sum + c.sales, 0) || 1
    const totalPax = Object.values(map).reduce((sum, c) => sum + c.pax, 0)

    let currentAngle = 0
    const list = Object.entries(map).map(([name, data]) => {
      const share = data.sales / totalSales
      const angle = share * 360
      const startAngle = currentAngle
      currentAngle += angle
      return {
        name,
        pax: data.pax,
        sales: data.sales,
        sharePct: Math.round(share * 100),
        startAngle,
        angle,
        color: CATEGORY_COLORS[name] || '#0284c7'
      }
    })

    return { list, totalSales, totalPax }
  }, [filteredBookings, tripDefinitions])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Fleet & Vessel Capacity Radar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-100">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                رادار سعة وإشغال المراكب والرحلات
              </h3>
              <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                متابعة الطاقة الاستيعابية لمراكب المارينا وسيارات السفاري
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full border border-sky-100">
            سعة الأسطول
          </span>
        </div>

        <div className="space-y-3.5 py-1">
          {vesselOccupancy.map((v) => {
            const isHigh = v.percent >= 75
            const isMedium = v.percent >= 50 && v.percent < 75

            return (
              <div key={v.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-black text-slate-800 truncate max-w-[240px]">
                    {v.name}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-black text-[#0a2540]">
                      {v.bookedPax}/{v.maxCapacity} فرد
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isMedium
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {v.percent}% إشغال
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh
                        ? 'bg-emerald-500'
                        : isMedium
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-sky-500 to-[#0284c7]'
                    }`}
                    style={{ width: `${v.percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>إشغال ممتاز (+75%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>إشغال متوسط (50-74%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>سعة متاحة (&lt;50%)</span>
          </span>
        </div>
      </div>

      {/* 2. Interactive SVG Category Revenue Donut */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                توزيع الإيرادات حسب قطاع الرحلة
              </h3>
              <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                حصة رحلات البحر، السفاري، الغوص، والخدمات الخاصة
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            حسب الفئة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
          {/* SVG Donut */}
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-36 h-36 transform -rotate-90">
              {categoryStats.list.map((c, i) => {
                const radius = 60
                const circumference = 2 * Math.PI * radius
                const strokeDasharray = `${(c.angle / 360) * circumference} ${circumference}`
                const strokeDashoffset = -((c.startAngle / 360) * circumference)

                return (
                  <circle
                    key={i}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={c.color}
                    strokeWidth="18"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 hover:opacity-80"
                  />
                )
              })}
            </svg>

            {/* Inner Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black font-mono text-[#0a2540]">
                {categoryStats.totalPax}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                إجمالي النزلاء
              </span>
            </div>
          </div>

          {/* Category List & Metrics */}
          <div className="space-y-2">
            {categoryStats.list.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="font-bold text-slate-700 truncate max-w-[110px]" title={c.name}>
                    {c.name}
                  </span>
                </div>

                <div className="font-mono flex items-center gap-2">
                  <span className="text-slate-400 text-[10px] font-bold">{c.sharePct}%</span>
                  <span className="font-black text-slate-900">€{c.sales.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 font-mono">
          <span>إجمالي حصيلة القطاعات:</span>
          <span className="font-black text-[#0284c7]">€{categoryStats.totalSales.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
