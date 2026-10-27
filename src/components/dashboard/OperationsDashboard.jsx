import React, { useState } from 'react'
import {
  Ship,
  Users,
  Euro,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  Coins,
  Compass,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  BarChart3
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'

export function OperationsDashboard({ onOpenUploadModal, onOpenNewBooking }) {
  const { bookings, selectedDate, setSelectedDate, tripDefinitions, executors, setActiveTab } = useAXStore()
  const [timeframe, setTimeframe] = useState('daily') // 'daily' | 'all'

  const activeBookings = timeframe === 'daily'
    ? bookings.filter((b) => b.date === selectedDate)
    : bookings

  // Metrics
  const totalBookings = activeBookings.length
  const totalAdults = activeBookings.reduce((sum, b) => sum + (Number(b.adult) || 0), 0)
  const totalChildren = activeBookings.reduce((sum, b) => sum + (Number(b.child) || 0), 0)
  const totalInfants = activeBookings.reduce((sum, b) => sum + (Number(b.infant) || 0), 0)
  const totalPax = totalAdults + totalChildren + totalInfants

  const totalSalesEur = activeBookings.reduce((sum, b) => sum + (Number(b.sell_eur) || 0), 0)
  const totalCostEur = activeBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
  const totalProfitEur = totalSalesEur - totalCostEur

  const totalRestEur = activeBookings.reduce((sum, b) => sum + (Number(b.rest_eur) || 0), 0)
  const totalRestEgp = activeBookings.reduce((sum, b) => sum + (Number(b.rest_egp) || 0), 0)
  const totalRestUsd = activeBookings.reduce((sum, b) => sum + (Number(b.rest_usd) || 0), 0)
  const totalRestGbp = activeBookings.reduce((sum, b) => sum + (Number(b.rest_gbp) || 0), 0)

  // Top Sellers
  const sellerStats = {}
  activeBookings.forEach((b) => {
    const s = b.seller || 'غير محدد'
    if (!sellerStats[s]) sellerStats[s] = { count: 0, sales: 0 }
    sellerStats[s].count += 1
    sellerStats[s].sales += (b.sell_eur || 0)
  })
  const topSellers = Object.entries(sellerStats).sort((a, b) => b[1].sales - a[1].sales)

  // Top Trips
  const tripStats = {}
  activeBookings.forEach((b) => {
    const t = b.trip_type || 'أخرى'
    if (!tripStats[t]) tripStats[t] = { count: 0, pax: 0, sales: 0 }
    tripStats[t].count += 1
    tripStats[t].pax += (b.adult + b.child)
    tripStats[t].sales += (b.sell_eur || 0)
  })
  const topTrips = Object.entries(tripStats).sort((a, b) => b[1].pax - a[1].pax).slice(0, 5)

  return (
    <div className="w-full space-y-4">
      {/* Top Banner & Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#38bdf8] shadow-md flex-shrink-0 bg-[#0a2540] flex items-center justify-center">
            <img src="/logo-circle.png" alt="غردقة فور يو" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#0a2540]">
              لوحة التشغيل السياحي اليومي (Operations)
            </h2>
            <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <span>تاريخ اليومية:</span>
              <span className="text-[#0284c7] font-mono">{selectedDate}</span>
              <span className="text-slate-300">•</span>
              <span>{totalBookings} حجز مسجل</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-full text-xs font-bold">
            <button
              onClick={() => {
                soundManager.playClick()
                setTimeframe('daily')
              }}
              className={`px-3 py-1.5 rounded-full transition-all ${
                timeframe === 'daily'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اليومي
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setTimeframe('all')
              }}
              className={`px-3 py-1.5 rounded-full transition-all ${
                timeframe === 'all'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الإجمالي
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenUploadModal()
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>رفع إكسيل</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenNewBooking()
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>حجز جديد</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards (Fluid Grid 4 Columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {/* Total Pax */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>إجمالي الأفراد (PAX)</span>
            <Users className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div className="text-2xl font-black text-[#0a2540] font-mono">
            {totalPax}
          </div>
          <div className="text-[11px] text-slate-500 font-bold">
            {totalAdults} كبار • {totalChildren} أطفال • {totalInfants} رضع
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>إجمالي المبيعات (€)</span>
            <Euro className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            €{totalSalesEur.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            قيمة الحجوزات المباعة
          </div>
        </div>

        {/* Total Costs */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>إجمالي التكاليف للمنفذين</span>
            <Ship className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            €{totalCostEur.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-bold">
            مستحقات المراكب والسفاري
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>صافي الأرباح المتوقعة</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-[#0a2540] font-mono">
            €{totalProfitEur.toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-700 font-bold">
            هامش الربح التشغيلي
          </div>
        </div>
      </div>

      {/* Outstanding Rest Amounts by 4 Currencies */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#0a2540] flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>المبالغ المتبقية المطلوب تحصيلها من النزلاء (Rest Balances)</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">حسب العملة</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-bold">متبقي باليورو (€)</div>
            <div className="text-lg font-black font-mono text-emerald-600">
              €{totalRestEur.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-bold">متبقي بالمصري (L.E)</div>
            <div className="text-lg font-black font-mono text-[#0a2540]">
              {totalRestEgp.toLocaleString()} ج.م
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-bold">متبقي بالدولار ($)</div>
            <div className="text-lg font-black font-mono text-amber-600">
              ${totalRestUsd.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-bold">متبقي بالإسترليني (£)</div>
            <div className="text-lg font-black font-mono text-indigo-600">
              £{totalRestGbp.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Trips & Seller Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Trips */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#0a2540]">
              أعلى الرحلات طلباً اليوم
            </h3>
            <button
              onClick={() => setActiveTab('trips')}
              className="text-xs text-[#0284c7] font-bold hover:underline"
            >
              دليل الأسعار والرحلات
            </button>
          </div>

          <div className="space-y-2">
            {topTrips.map(([tripName, stat], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0a2540] text-white flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-black text-slate-800">{tripName}</div>
                    <div className="text-[10px] text-slate-400">{stat.count} حجز</div>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <div className="font-black text-[#0284c7]">{stat.pax} PAX</div>
                  <div className="text-[10px] text-emerald-600">€{stat.sales.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#0a2540]">
              أداء المناديب وقنوات البيع
            </h3>
            <button
              onClick={() => setActiveTab('daily')}
              className="text-xs text-[#0284c7] font-bold hover:underline"
            >
              عرض اليومية
            </button>
          </div>

          <div className="space-y-2">
            {topSellers.map(([sellerName, stat], idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-50 text-[#0284c7] flex items-center justify-center font-black text-[11px]">
                    {sellerName.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-black text-slate-800">{sellerName}</div>
                    <div className="text-[10px] text-slate-400">{stat.count} حجز</div>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <div className="font-black text-emerald-600">€{stat.sales.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">إجمالي المبيعات</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
