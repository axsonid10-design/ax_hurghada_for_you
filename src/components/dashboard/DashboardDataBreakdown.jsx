import React, { useState, useMemo } from 'react'
import {
  Compass,
  Users,
  Ship,
  Building2,
  Coins,
  Layers,
  Flame,
  Award
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

const RANK_BADGES = ['🥇', '🥈', '🥉']

export function DashboardDataBreakdown({
  filteredBookings = [],
  tripDefinitions = [],
  executors = [],
  displayCurrency = 'EUR',
  rates
}) {
  const [activeTab, setActiveTab] = useState('trips')
  const [tripsSortMode, setTripsSortMode] = useState('sales')

  const egpRate = rates?.EGP || 53.25
  const isEgp = displayCurrency === 'EGP'

  const formatAmount = (eurVal) => {
    if (isEgp) {
      return `${Math.round(eurVal * egpRate).toLocaleString()} ج.م`
    }
    return `€${Math.round(eurVal).toLocaleString()}`
  }

  const tripsData = useMemo(() => {
    const map = new Map()
    filteredBookings.forEach((b) => {
      const name = b.trip_type || 'رحلة عامة'
      if (!map.has(name)) {
        map.set(name, {
          name,
          bookings: 0,
          adults: 0,
          children: 0,
          pax: 0,
          sales: 0,
          cost: 0,
          profit: 0
        })
      }
      const item = map.get(name)
      const adult = Number(b.adult) || 0
      const child = Number(b.child) || 0
      item.bookings += 1
      item.adults += adult
      item.children += child
      item.pax += adult + child
      item.sales += Number(b.sell_eur) || 0
      item.cost += Number(b.cost_eur) || 0
      item.profit += Number(b.profit_eur) || 0
    })

    const list = Array.from(map.values())
    if (tripsSortMode === 'pax') {
      return list.sort((a, b) => b.pax - a.pax)
    }
    return list.sort((a, b) => b.sales - a.sales)
  }, [filteredBookings, tripsSortMode])

  const maxTripMetric = useMemo(() => {
    if (tripsData.length === 0) return 1
    return tripsSortMode === 'pax'
      ? Math.max(...tripsData.map((t) => t.pax), 1)
      : Math.max(...tripsData.map((t) => t.sales), 1)
  }, [tripsData, tripsSortMode])

  const sellersData = useMemo(() => {
    const map = new Map()
    filteredBookings.forEach((b) => {
      const seller = b.seller || 'فريق المبيعات العام'
      if (!map.has(seller)) {
        map.set(seller, {
          name: seller,
          bookings: 0,
          pax: 0,
          sales: 0,
          profit: 0,
          restEur: 0
        })
      }
      const item = map.get(seller)
      item.bookings += 1
      item.pax += (Number(b.adult) || 0) + (Number(b.child) || 0)
      item.sales += Number(b.sell_eur) || 0
      item.profit += Number(b.profit_eur) || 0
      item.restEur += Number(b.rest_eur) || 0
    })

    const totalSales = Array.from(map.values()).reduce((s, i) => s + i.sales, 0) || 1
    return Array.from(map.values())
      .map((item) => ({
        ...item,
        sharePct: Math.round((item.sales / totalSales) * 100)
      }))
      .sort((a, b) => b.sales - a.sales)
  }, [filteredBookings])

  const maxSellerSales = useMemo(() => {
    if (sellersData.length === 0) return 1
    return Math.max(...sellersData.map((s) => s.sales), 1)
  }, [sellersData])

  const executorsData = useMemo(() => {
    const costMap = new Map()
    filteredBookings.forEach((b) => {
      const tripDef = tripDefinitions.find(
        (td) => td.sheet_name === b.trip_type || td.display_name === b.trip_type
      )
      const execId = tripDef?.executor_id || 'exec_marina'
      const cost = Number(b.cost_eur) || 0

      if (!costMap.has(execId)) {
        costMap.set(execId, { count: 0, totalOwed: 0, pax: 0 })
      }
      const c = costMap.get(execId)
      c.count += 1
      c.totalOwed += cost
      c.pax += (Number(b.adult) || 0) + (Number(b.child) || 0)
    })

    return executors.map((ex) => {
      const costInfo = costMap.get(ex.id) || { count: 0, totalOwed: 0, pax: 0 }
      const paid = Number(ex.total_paid) || 0
      const balance = costInfo.totalOwed - paid
      const payPct = costInfo.totalOwed > 0 ? Math.min(100, Math.round((paid / costInfo.totalOwed) * 100)) : 100
      return {
        id: ex.id,
        name: ex.name,
        category: ex.category,
        tripsCount: costInfo.count,
        totalOwed: costInfo.totalOwed,
        totalPaid: paid,
        balance,
        pax: costInfo.pax,
        payPct
      }
    })
  }, [filteredBookings, tripDefinitions, executors])

  const hotelsData = useMemo(() => {
    const map = new Map()
    filteredBookings.forEach((b) => {
      const hotel = b.hotel?.trim() || 'فندق غير محدد'
      if (!map.has(hotel)) {
        map.set(hotel, {
          name: hotel,
          bookings: 0,
          pax: 0,
          rooms: new Set()
        })
      }
      const item = map.get(hotel)
      item.bookings += 1
      item.pax += (Number(b.adult) || 0) + (Number(b.child) || 0)
      if (b.room) item.rooms.add(b.room)
    })

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        roomsCount: item.rooms.size
      }))
      .sort((a, b) => b.pax - a.pax)
  }, [filteredBookings])

  const currencyData = useMemo(() => {
    const restEur = filteredBookings.reduce((s, b) => s + (Number(b.rest_eur) || 0), 0)
    const restEgp = filteredBookings.reduce((s, b) => s + (Number(b.rest_egp) || 0), 0)
    const restUsd = filteredBookings.reduce((s, b) => s + (Number(b.rest_usd) || 0), 0)
    const restGbp = filteredBookings.reduce((s, b) => s + (Number(b.rest_gbp) || 0), 0)

    const totalSalesEur = filteredBookings.reduce((s, b) => s + (Number(b.sell_eur) || 0), 0)
    const collectedEur = Math.max(0, totalSalesEur - restEur)

    return [
      {
        currency: 'EUR',
        symbol: '€',
        name: 'اليورو الأوروبي',
        collected: collectedEur,
        rest: restEur,
        rate: 1
      },
      {
        currency: 'EGP',
        symbol: 'ج.م',
        name: 'الجنيه المصري',
        collected: 0,
        rest: restEgp,
        rate: egpRate
      },
      {
        currency: 'USD',
        symbol: '$',
        name: 'الدولار الأمريكي',
        collected: 0,
        rest: restUsd,
        rate: rates?.USD ? egpRate / rates.USD : 49.3
      },
      {
        currency: 'GBP',
        symbol: '£',
        name: 'الجنيه الإسترليني',
        collected: 0,
        rest: restGbp,
        rate: rates?.GBP ? egpRate / rates.GBP : 63.4
      }
    ]
  }, [filteredBookings, egpRate, rates])

  const tabs = [
    { id: 'trips', label: 'الرحلات', icon: Compass, count: tripsData.length },
    { id: 'sellers', label: 'المناديب', icon: Users, count: sellersData.length },
    { id: 'executors', label: 'المنفذين', icon: Ship, count: executorsData.length },
    { id: 'hotels', label: 'الفنادق', icon: Building2, count: hotelsData.length },
    { id: 'currencies', label: 'الخزينة', icon: Coins, count: 4 }
  ]

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-900">
            بيانات التشغيل
          </h3>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick()
                  setActiveTab(tab.id)
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          لا توجد حركات مسجلة لعرض بيانات التشغيل
        </div>
      ) : (
        <>
          {activeTab === 'trips' && (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-bold">
              <button
                onClick={() => {
                  soundManager.playClick()
                  setTripsSortMode('sales')
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  tripsSortMode === 'sales' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                حسب المبيعات
              </button>
              <button
                onClick={() => {
                  soundManager.playClick()
                  setTripsSortMode('pax')
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  tripsSortMode === 'pax' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                حسب عدد الأفراد
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {tripsData.slice(0, 8).map((trip, idx) => {
              const metricVal = tripsSortMode === 'pax' ? trip.pax : trip.sales
              const pct = Math.min(100, Math.round((metricVal / maxTripMetric) * 100))
              const badge = RANK_BADGES[idx]

              return (
                <div
                  key={trip.name}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-bold text-sm">
                        {badge || `#${idx + 1}`}
                      </span>
                      <span className="font-black text-slate-900">{trip.name}</span>
                      <span className="text-[10px] font-bold text-slate-500">
                        ({trip.bookings} حجز • {trip.pax} فرد)
                      </span>
                    </div>

                    <div className="whitespace-nowrap flex items-baseline gap-1 text-xs font-mono font-black text-slate-900">
                      <span>{formatAmount(trip.sales)}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        (أرباح: {formatAmount(trip.profit)})
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 via-sky-600 to-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'sellers' && (
        <div className="space-y-3">
          <div className="space-y-2">
            {sellersData.map((seller, idx) => {
              const pct = Math.min(100, Math.round((seller.sales / maxSellerSales) * 100))
              const badge = RANK_BADGES[idx]

              return (
                <div
                  key={seller.name}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-bold text-sm">
                        {badge || `#${idx + 1}`}
                      </span>
                      <span className="font-black text-slate-900">{seller.name}</span>
                      <span className="text-[10px] font-bold text-slate-500">
                        ({seller.bookings} حجز • {seller.pax} فرد)
                      </span>
                    </div>

                    <div className="whitespace-nowrap flex items-baseline gap-1 text-xs font-mono font-black text-slate-900">
                      <span>{formatAmount(seller.sales)}</span>
                      <span className="text-[10px] text-sky-700 font-bold">
                        ({seller.sharePct}% من المبيعات)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'executors' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {executorsData.map((ex) => {
              const statusColor =
                ex.payPct >= 85
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : ex.payPct >= 50
                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'

              return (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-xs text-slate-900 block">{ex.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {ex.category} • {ex.tripsCount} رحلة ({ex.pax} فرد)
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${statusColor}`}>
                      تسوية: {ex.payPct}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
                    <span className="text-slate-500">المستحق: <strong className="font-mono text-slate-900">{formatAmount(ex.totalOwed)}</strong></span>
                    <span className="text-slate-500">المسدد: <strong className="font-mono text-emerald-700">{formatAmount(ex.totalPaid)}</strong></span>
                    <span className="text-slate-500">المتبقي: <strong className="font-mono text-amber-700">{formatAmount(ex.balance)}</strong></span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ex.payPct >= 85 ? 'bg-emerald-500' : ex.payPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(4, ex.payPct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'hotels' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {hotelsData.slice(0, 15).map((hotel) => (
              <div
                key={hotel.name}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <span className="font-black text-xs text-slate-900 block">{hotel.name}</span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {hotel.bookings} حجز • {hotel.roomsCount} غرفة
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-mono font-black">
                  {hotel.pax} فرد
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'currencies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currencyData.map((curr) => (
            <div key={curr.currency} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-900">{curr.name}</span>
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-mono font-black flex items-center justify-center text-xs">
                  {curr.symbol}
                </span>
              </div>

              <div className="space-y-1 pt-1 text-xs font-bold text-slate-600">
                <div className="flex items-center justify-between">
                  <span>المحصل:</span>
                  <span className="font-mono text-emerald-700 font-black">
                    {curr.symbol}{Math.round(curr.collected).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>المتبقي:</span>
                  <span className="font-mono text-amber-700 font-black">
                    {curr.symbol}{Math.round(curr.rest).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400 font-bold flex justify-between">
                <span>سعر الصرف:</span>
                <span>{curr.rate} ج.م</span>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  )
}
