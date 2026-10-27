import React, { useState, useMemo } from 'react'
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
  BarChart3,
  PieChart,
  Percent,
  Receipt,
  Layers,
  ArrowDownRight
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { exchangeRates } from '../../utils/exchangeRates'

export function OperationsDashboard({ onOpenUploadModal, onOpenNewBooking }) {
  const {
    bookings,
    selectedDate,
    setSelectedDate,
    tripDefinitions,
    executors,
    expenses = [],
    setActiveTab
  } = useAXStore()

  // Filter Mode: 'today' | 'week' | 'month' | 'custom' | 'all'
  const [filterMode, setFilterMode] = useState('today')
  const [customFrom, setCustomFrom] = useState(selectedDate)
  const [customTo, setCustomTo] = useState(selectedDate)

  // Filter bookings based on active date range
  const filteredBookings = useMemo(() => {
    if (filterMode === 'today') {
      return bookings.filter((b) => b.date === selectedDate)
    }
    if (filterMode === 'all') {
      return bookings
    }
    if (filterMode === 'custom') {
      return bookings.filter((b) => b.date >= customFrom && b.date <= customTo)
    }

    // Week or Month calculation relative to selectedDate
    const refDate = new Date(selectedDate)
    if (filterMode === 'week') {
      const past7Days = new Date(refDate)
      past7Days.setDate(past7Days.getDate() - 7)
      const pastStr = past7Days.toISOString().split('T')[0]
      return bookings.filter((b) => b.date >= pastStr && b.date <= selectedDate)
    }
    if (filterMode === 'month') {
      const monthPrefix = selectedDate.substring(0, 7) // 'YYYY-MM'
      return bookings.filter((b) => (b.date || '').startsWith(monthPrefix))
    }

    return bookings
  }, [bookings, filterMode, selectedDate, customFrom, customTo])

  // Filter expenses based on the same date criteria
  const filteredExpenses = useMemo(() => {
    if (filterMode === 'today') {
      return expenses.filter((e) => e.date === selectedDate)
    }
    if (filterMode === 'all') {
      return expenses
    }
    if (filterMode === 'custom') {
      return expenses.filter((e) => e.date >= customFrom && e.date <= customTo)
    }
    const refDate = new Date(selectedDate)
    if (filterMode === 'week') {
      const past7Days = new Date(refDate)
      past7Days.setDate(past7Days.getDate() - 7)
      const pastStr = past7Days.toISOString().split('T')[0]
      return expenses.filter((e) => e.date >= pastStr && e.date <= selectedDate)
    }
    if (filterMode === 'month') {
      const monthPrefix = selectedDate.substring(0, 7)
      return expenses.filter((e) => (e.date || '').startsWith(monthPrefix))
    }
    return expenses
  }, [expenses, filterMode, selectedDate, customFrom, customTo])

  // Core Financial Aggregations
  const totalBookings = filteredBookings.length
  const totalAdults = filteredBookings.reduce((sum, b) => sum + (Number(b.adult) || 0), 0)
  const totalChildren = filteredBookings.reduce((sum, b) => sum + (Number(b.child) || 0), 0)
  const totalPax = totalAdults + totalChildren

  const totalSalesEur = filteredBookings.reduce((sum, b) => sum + (Number(b.sell_eur) || 0), 0)
  const totalCostEur = filteredBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
  const grossProfitEur = totalSalesEur - totalCostEur

  // Total Expenses converted to EUR
  const totalExpensesEur = filteredExpenses.reduce((sum, e) => {
    const amt = Number(e.amount) || 0
    if (e.currency === 'EGP') return sum + amt / 53.25
    if (e.currency === 'USD') return sum + amt / 1.08
    return sum + amt
  }, 0)

  // Net Profit after Operational Expenses
  const netProfitEur = grossProfitEur - totalExpensesEur
  const netProfitMargin = totalSalesEur > 0 ? Math.round((netProfitEur / totalSalesEur) * 100) : 0

  const totalRestEur = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_eur) || 0), 0)
  const totalRestEgp = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_egp) || 0), 0)

  // Top Trips Chart Data
  const tripBreakdown = useMemo(() => {
    const stats = {}
    filteredBookings.forEach((b) => {
      const name = b.trip_type || 'أخرى'
      if (!stats[name]) stats[name] = { pax: 0, sales: 0, profit: 0 }
      stats[name].pax += (Number(b.adult) || 0) + (Number(b.child) || 0)
      stats[name].sales += Number(b.sell_eur) || 0
      stats[name].profit += Number(b.profit_eur) || 0
    })
    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.pax - a.pax)
  }, [filteredBookings])

  // Top Sellers Chart Data
  const sellerBreakdown = useMemo(() => {
    const stats = {}
    filteredBookings.forEach((b) => {
      const seller = b.seller || 'فريق المبيعات'
      if (!stats[seller]) stats[seller] = { count: 0, sales: 0, pax: 0 }
      stats[seller].count += 1
      stats[seller].sales += Number(b.sell_eur) || 0
      stats[seller].pax += (Number(b.adult) || 0) + (Number(b.child) || 0)
    })
    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.sales - a.sales)
  }, [filteredBookings])

  // Daily Trend Data (Last 5 Active Days)
  const dailyTrends = useMemo(() => {
    const map = new Map()
    bookings.forEach((b) => {
      if (!b.date) return
      if (!map.has(b.date)) {
        map.set(b.date, { date: b.date, sales: 0, cost: 0, profit: 0, count: 0 })
      }
      const entry = map.get(b.date)
      entry.sales += Number(b.sell_eur) || 0
      entry.cost += Number(b.cost_eur) || 0
      entry.profit += Number(b.profit_eur) || 0
      entry.count += 1
    })
    return Array.from(map.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .reverse()
  }, [bookings])

  const maxTrendSales = Math.max(...dailyTrends.map((d) => d.sales), 100)

  return (
    <div className="w-full space-y-4">
      {/* Top Filter & Timeframe Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-800">
            لوحة قيادة التشغيل والأرباح
          </h2>
          <div className="text-[11px] text-slate-500 font-bold mt-0.5">
            رصد حي للمبيعات، تكاليف الموردين، المصاريف التشغيلية، وصافي الأرباح
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-full text-xs font-bold border border-slate-200/80">
            <button
              onClick={() => {
                soundManager.playClick()
                setFilterMode('today')
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                filterMode === 'today'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اليوم ({selectedDate})
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setFilterMode('week')
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                filterMode === 'week'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              أسبوع
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setFilterMode('month')
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                filterMode === 'month'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شهر
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setFilterMode('custom')
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                filterMode === 'custom'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              بين تاريخين
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setFilterMode('all')
              }}
              className={`px-3 py-1 rounded-full transition-all ${
                filterMode === 'all'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenUploadModal()
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 flex-shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>رفع إكسيل</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenNewBooking()
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>حجز جديد</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Selector (Shown when 'custom' is active) */}
      {filterMode === 'custom' && (
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-3xl flex flex-wrap items-center gap-3 animate-fadeIn">
          <span className="text-xs font-black text-sky-900">تحديد الفترة من وإلى:</span>
          <div className="w-44">
            <AX_CompanyDatePicker
              value={customFrom}
              onChange={(d) => setCustomFrom(d)}
              placeholder="من تاريخ"
            />
          </div>
          <span className="text-slate-400 font-bold">—</span>
          <div className="w-44">
            <AX_CompanyDatePicker
              value={customTo}
              onChange={(d) => setCustomTo(d)}
              placeholder="إلى تاريخ"
            />
          </div>
          <span className="text-xs font-mono font-bold text-sky-800">
            ({filteredBookings.length} حجز في الفترة)
          </span>
        </div>
      )}

      {/* 5 Master Financial KPI Cards (With Operating Expenses & Real Net Profit) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>إجمالي المبيعات</span>
            <Euro className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0a2540] font-mono">
            €{totalSalesEur.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-bold">
            {totalPax} فرد • {totalBookings} حجز
          </div>
        </div>

        {/* Executors Cost */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>تكاليف الموردين</span>
            <Ship className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
            €{totalCostEur.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-bold">
            يخوت، سفاري، غوص
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>المصاريف التشغيلية</span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
            €{Math.round(totalExpensesEur).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-bold">
            وقود، إكراميات، ضيافة
          </div>
        </div>

        {/* Real Net Profit (Highlight Card) */}
        <div className="bg-gradient-to-br from-[#0a2540] to-[#133e66] text-white p-4 rounded-3xl shadow-md space-y-1 border border-[#0284c7]/40 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold text-sky-200">
            <span>صافي الربح الفعلي</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            +€{Math.round(netProfitEur).toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-200 font-bold flex items-center justify-between">
            <span>بعد خصم المصاريف</span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold text-[10px]">
              {netProfitMargin}% هامش
            </span>
          </div>
        </div>

        {/* Uncollected Balances */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>المتبقي لدى النزلاء</span>
            <Coins className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
            €{totalRestEur.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-bold">
            {totalRestEgp > 0 && `+ ${totalRestEgp.toLocaleString()} ج.م`}
          </div>
        </div>
      </div>

      {/* 2 Interactive Visual Charts: Revenue & Profit Trend vs Top Trips Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Financial Performance Bar Chart */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0284c7]" />
                <span>مخطط المبيعات وصافي الربح اليومي</span>
              </h3>
              <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                مقارنة الإيرادات والتكاليف والأرباح خلال الأيام الأخيرة
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">آخر 5 أيام تشغيل</span>
          </div>

          <div className="space-y-3 pt-1">
            {dailyTrends.map((d) => {
              const salesPercent = Math.min(100, Math.round((d.sales / maxTrendSales) * 100))
              const profitPercent = Math.min(100, Math.round((d.profit / maxTrendSales) * 100))

              return (
                <div key={d.date} className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">{d.date}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">
                        مبيعات: <strong className="text-slate-800">€{d.sales}</strong>
                      </span>
                      <span className="text-emerald-600 font-black">
                        ربح: +€{d.profit}
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar (Sales & Profit) */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex gap-1 p-0.5">
                    <div
                      className="h-full bg-[#0284c7] rounded-full transition-all duration-500"
                      style={{ width: `${salesPercent}%` }}
                      title={`مبيعات: €${d.sales}`}
                    />
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${profitPercent}%` }}
                      title={`ربح: €${d.profit}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0284c7]"></span>
              <span>المبيعات (€)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>صافي الأرباح (€)</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Top Trips Breakdown by PAX */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>الرحلات الأكثر طلباً وإيراداً</span>
              </h3>
              <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                توزيع إقبال النزلاء وحصيلة المبيعات لكل رحلة
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Top Trips</span>
          </div>

          <div className="space-y-3 pt-1">
            {tripBreakdown.slice(0, 5).map((t, idx) => {
              const maxPax = tripBreakdown[0]?.pax || 1
              const percent = Math.min(100, Math.round((t.pax / maxPax) * 100))

              return (
                <div key={t.name} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 truncate max-w-[200px]" title={t.name}>
                        {t.name}
                      </span>
                    </div>

                    <div className="font-mono flex items-center gap-3">
                      <span className="font-black text-[#0284c7]">{t.pax} فرد</span>
                      <span className="text-slate-500">€{t.sales}</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#0284c7] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2 Secondary Analytical Cards: Sales Reps Performance & Operating Expenses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Reps Leaderboard */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>أداء قنوات ومندوبي المبيعات (Sellers)</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono">Leaderboard</span>
          </div>

          <div className="space-y-2.5">
            {sellerBreakdown.map((s) => (
              <div
                key={s.name}
                className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-black text-slate-800">{s.name}</div>
                  <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                    {s.count} حجز • {s.pax} فرد
                  </div>
                </div>

                <div className="text-left font-mono">
                  <div className="font-black text-emerald-600 text-sm">€{s.sales.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">إجمالي المبيعات</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Expenses Breakdown Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-600" />
              <span>بنود المصاريف التشغيلية (Expenses Log)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-rose-600">
              €{Math.round(totalExpensesEur)}
            </span>
          </div>

          <div className="space-y-2">
            {filteredExpenses.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-bold">
                لا توجد مصاريف مسجلة في هذه الفترة.
              </div>
            ) : (
              filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{exp.title}</div>
                    <div className="text-[10px] text-slate-400">
                      {exp.date} • {exp.category} {exp.notes && `(${exp.notes})`}
                    </div>
                  </div>
                  <div className="font-mono font-black text-rose-600">
                    {exp.currency === 'EGP' ? `${exp.amount} ج.م` : `€${exp.amount}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
