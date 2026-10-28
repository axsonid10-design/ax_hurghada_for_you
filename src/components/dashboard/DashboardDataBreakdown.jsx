import React, { useState, useMemo } from 'react'
import {
  Compass,
  Users,
  Ship,
  Building2,
  Coins,
  ChevronDown,
  Layers,
  ArrowUpDown
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function DashboardDataBreakdown({
  filteredBookings = [],
  tripDefinitions = [],
  executors = [],
  displayCurrency = 'EUR',
  rates
}) {
  const [activeTab, setActiveTab] = useState('trips')

  const egpRate = rates?.EGP || 53.25
  const isEgp = displayCurrency === 'EGP'

  const formatAmount = (eurVal) => {
    if (isEgp) {
      return `${Math.round(eurVal * egpRate).toLocaleString()} ج.م`
    }
    return `€${Math.round(eurVal).toLocaleString()}`
  }

  // 1. Trips Performance Breakdown
  const tripsData = useMemo(() => {
    const map = new Map()
    filteredBookings.forEach((b) => {
      const name = b.trip_type || 'رحلة غير محددة'
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

    return Array.from(map.values()).sort((a, b) => b.sales - a.sales)
  }, [filteredBookings])

  // 2. Sellers Performance Breakdown
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

  // 3. Executors & Suppliers Breakdown
  const executorsData = useMemo(() => {
    const costMap = new Map()
    filteredBookings.forEach((b) => {
      const tripDef = tripDefinitions.find(
        (td) => td.sheet_name === b.trip_type || td.display_name === b.trip_type
      )
      const execId = tripDef?.executor_id || 'exec_marina'
      const cost = Number(b.cost_eur) || 0

      if (!costMap.has(execId)) {
        costMap.set(execId, { count: 0, totalOwed: 0 })
      }
      const c = costMap.get(execId)
      c.count += 1
      c.totalOwed += cost
    })

    return executors.map((ex) => {
      const costInfo = costMap.get(ex.id) || { count: 0, totalOwed: 0 }
      const paid = Number(ex.total_paid) || 0
      const balance = costInfo.totalOwed - paid
      return {
        id: ex.id,
        name: ex.name,
        category: ex.category,
        tripsCount: costInfo.count,
        totalOwed: costInfo.totalOwed,
        totalPaid: paid,
        balance
      }
    })
  }, [filteredBookings, tripDefinitions, executors])

  // 4. Hotels & Logistics Breakdown
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

  // 5. Multi-Currency Vault Status
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
    { id: 'trips', label: 'الرحلات الأكثر مبيعاً', icon: Compass, count: tripsData.length },
    { id: 'sellers', label: 'أداء مناديب المبيعات', icon: Users, count: sellersData.length },
    { id: 'executors', label: 'موقف الموردين والتنفيذ', icon: Ship, count: executorsData.length },
    { id: 'hotels', label: 'فنادق النزلاء ومراكز النقل', icon: Building2, count: hotelsData.length },
    { id: 'currencies', label: 'الخزينة والعملات المتعددة', icon: Coins, count: 4 }
  ]

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              التحليل التفصيلي الشامل لكافة بيانات المنظومة
            </h3>
            <p className="text-[11px] text-slate-500 font-bold">
              بيانات الرحلات، المناديب، الموردين، الفنادق، وأرصدة العملات
            </p>
          </div>
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

      {/* Tab 1: Trips Performance */}
      {activeTab === 'trips' && (
        <div className="space-y-2">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-black">اسم الرحلة</th>
                  <th className="py-2.5 px-3 font-black text-center">الحجوزات</th>
                  <th className="py-2.5 px-3 font-black text-center">الأفراد (بالغ / طفل)</th>
                  <th className="py-2.5 px-3 font-black text-left">إجمالي المبيعات</th>
                  <th className="py-2.5 px-3 font-black text-left">تكلفة الموردين</th>
                  <th className="py-2.5 px-3 font-black text-left">صافي الأرباح</th>
                  <th className="py-2.5 px-3 font-black text-center">هامش الربح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tripsData.map((trip) => {
                  const margin = trip.sales > 0 ? Math.round((trip.profit / trip.sales) * 100) : 0
                  return (
                    <tr key={trip.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-black text-slate-900">{trip.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">{trip.bookings}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                        {trip.pax} <span className="text-[10px] text-slate-400">({trip.adults}ب / {trip.children}ط)</span>
                      </td>
                      <td className="py-2.5 px-3 text-left font-mono font-black text-slate-900">{formatAmount(trip.sales)}</td>
                      <td className="py-2.5 px-3 text-left font-mono font-bold text-amber-700">{formatAmount(trip.cost)}</td>
                      <td className="py-2.5 px-3 text-left font-mono font-black text-emerald-700">{formatAmount(trip.profit)}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:hidden">
            {tripsData.map((trip) => {
              const margin = trip.sales > 0 ? Math.round((trip.profit / trip.sales) * 100) : 0
              return (
                <div key={trip.name} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">{trip.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                      {margin}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span>{trip.bookings} حجز • {trip.pax} فرد</span>
                    <span className="font-mono text-slate-900 font-black">{formatAmount(trip.sales)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-1 border-t border-slate-200/80">
                    <span className="text-amber-700">تكلفة: {formatAmount(trip.cost)}</span>
                    <span className="text-emerald-700 font-black">أرباح: {formatAmount(trip.profit)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Sales Reps */}
      {activeTab === 'sellers' && (
        <div className="space-y-2">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-black">المندوب / قناة البيع</th>
                  <th className="py-2.5 px-3 font-black text-center">عدد الحجوزات</th>
                  <th className="py-2.5 px-3 font-black text-center">إجمالي النزلاء (PAX)</th>
                  <th className="py-2.5 px-3 font-black text-left">إجمالي المبيعات</th>
                  <th className="py-2.5 px-3 font-black text-left">الأرباح المحققة</th>
                  <th className="py-2.5 px-3 font-black text-left">المتبقي للتحصيل</th>
                  <th className="py-2.5 px-3 font-black text-center">حصة المبيعات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellersData.map((seller) => (
                  <tr key={seller.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-black text-slate-900">{seller.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">{seller.bookings}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">{seller.pax}</td>
                    <td className="py-2.5 px-3 text-left font-mono font-black text-slate-900">{formatAmount(seller.sales)}</td>
                    <td className="py-2.5 px-3 text-left font-mono font-black text-emerald-700">{formatAmount(seller.profit)}</td>
                    <td className="py-2.5 px-3 text-left font-mono font-bold text-amber-700">{formatAmount(seller.restEur)}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px]">
                        {seller.sharePct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:hidden">
            {sellersData.map((seller) => (
              <div key={seller.name} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{seller.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-mono font-bold border border-sky-200">
                    {seller.sharePct}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span>{seller.bookings} حجز • {seller.pax} فرد</span>
                  <span className="font-mono text-slate-900 font-black">{formatAmount(seller.sales)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-1 border-t border-slate-200/80">
                  <span className="text-emerald-700 font-black">أرباح: {formatAmount(seller.profit)}</span>
                  <span className="text-amber-700">متبقي: {formatAmount(seller.restEur)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Executors */}
      {activeTab === 'executors' && (
        <div className="space-y-2">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-black">الجهة المنفذة / المورد</th>
                  <th className="py-2.5 px-3 font-black">القطاع والنشاط</th>
                  <th className="py-2.5 px-3 font-black text-center">الرحلات المنفذة</th>
                  <th className="py-2.5 px-3 font-black text-left">إجمالي المستحق</th>
                  <th className="py-2.5 px-3 font-black text-left">المسدد له</th>
                  <th className="py-2.5 px-3 font-black text-left">الرصيد المتبقي</th>
                  <th className="py-2.5 px-3 font-black text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {executorsData.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-black text-slate-900">{ex.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-bold">{ex.category}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">{ex.tripsCount}</td>
                    <td className="py-2.5 px-3 text-left font-mono font-black text-slate-900">{formatAmount(ex.totalOwed)}</td>
                    <td className="py-2.5 px-3 text-left font-mono font-bold text-emerald-700">{formatAmount(ex.totalPaid)}</td>
                    <td className="py-2.5 px-3 text-left font-mono font-black text-amber-700">{formatAmount(ex.balance)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        ex.balance <= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {ex.balance <= 0 ? 'مسدد كلياً' : 'مستحق له'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:hidden">
            {executorsData.map((ex) => (
              <div key={ex.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{ex.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    ex.balance <= 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {ex.balance <= 0 ? 'مسدد' : 'مستحق'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span>{ex.category} ({ex.tripsCount} رحلة)</span>
                  <span className="font-mono text-slate-900 font-black">{formatAmount(ex.totalOwed)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-1 border-t border-slate-200/80">
                  <span className="text-emerald-700">مسدد: {formatAmount(ex.totalPaid)}</span>
                  <span className="text-amber-700 font-black">متبقي: {formatAmount(ex.balance)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Hotels */}
      {activeTab === 'hotels' && (
        <div className="space-y-2">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-black">اسم الفندق / مركز التجميع</th>
                  <th className="py-2.5 px-3 font-black text-center">عدد النزلاء (PAX)</th>
                  <th className="py-2.5 px-3 font-black text-center">عدد الحجوزات</th>
                  <th className="py-2.5 px-3 font-black text-center">الغرف المسجلة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotelsData.slice(0, 15).map((hotel) => (
                  <tr key={hotel.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-black text-slate-900">{hotel.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-black text-sky-700">{hotel.pax} فرد</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600">{hotel.bookings}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{hotel.roomsCount} غرفة</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 lg:hidden">
            {hotelsData.slice(0, 15).map((hotel) => (
              <div key={hotel.name} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-slate-900 block">{hotel.name}</span>
                  <span className="text-[10px] text-slate-500 font-bold">{hotel.bookings} حجز • {hotel.roomsCount} غرفة</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-mono font-black">
                  {hotel.pax} فرد
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Multi-Currency Vault */}
      {activeTab === 'currencies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currencyData.map((curr) => (
            <div key={curr.currency} className="p-4 rounded-3xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-900">{curr.name}</span>
                <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-mono font-black flex items-center justify-center text-xs">
                  {curr.symbol}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>المحصل:</span>
                  <span className="font-mono text-emerald-700 font-black">
                    {curr.symbol}{Math.round(curr.collected).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>المتبقي في الذمة:</span>
                  <span className="font-mono text-amber-700 font-black">
                    {curr.symbol}{Math.round(curr.rest).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400 font-bold flex justify-between">
                <span>سعر التحويل:</span>
                <span>{curr.rate} ج.م</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
