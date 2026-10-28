import React, { useState, useMemo, useEffect } from 'react'
import { FileSpreadsheet, Plus, Sparkles, Ship, ArrowUpRight } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { exchangeRates } from '../../utils/exchangeRates'
import { DashboardHeroRibbon } from './DashboardHeroRibbon'
import { FinancialKpiCards } from './FinancialKpiCards'
import { FinancialTrendChart } from './FinancialTrendChart'
import { FleetOccupancyRadar } from './FleetOccupancyRadar'
import { SalesLeaderboard } from './SalesLeaderboard'

export function OperationsDashboard({ onOpenUploadModal, onOpenNewBooking }) {
  const {
    bookings = [],
    selectedDate,
    setSelectedDate,
    tripDefinitions = [],
    expenses = [],
    addExpense,
    deleteExpense
  } = useAXStore()

  const [filterMode, setFilterMode] = useState('all') // 'today' | 'week' | 'month' | 'custom' | 'all'
  const [customFrom, setCustomFrom] = useState(selectedDate)
  const [customTo, setCustomTo] = useState(selectedDate)
  const [rates, setRates] = useState(exchangeRates.getRates())

  // Fetch live Forex rates
  useEffect(() => {
    exchangeRates.fetchLiveRates().then((liveRates) => {
      if (liveRates) setRates({ ...liveRates })
    })
  }, [])

  // Filter Bookings based on active date range
  const filteredBookings = useMemo(() => {
    if (filterMode === 'all') return bookings
    if (filterMode === 'today') return bookings.filter((b) => b.date === selectedDate)
    if (filterMode === 'custom') {
      return bookings.filter((b) => b.date >= customFrom && b.date <= customTo)
    }

    const refDate = new Date(selectedDate)
    if (filterMode === 'week') {
      const past7Days = new Date(refDate)
      past7Days.setDate(past7Days.getDate() - 7)
      const pastStr = past7Days.toISOString().split('T')[0]
      return bookings.filter((b) => b.date >= pastStr && b.date <= selectedDate)
    }
    if (filterMode === 'month') {
      const monthPrefix = selectedDate.substring(0, 7)
      return bookings.filter((b) => (b.date || '').startsWith(monthPrefix))
    }

    return bookings
  }, [bookings, filterMode, selectedDate, customFrom, customTo])

  // Filter Expenses based on same date range
  const filteredExpenses = useMemo(() => {
    if (filterMode === 'all') return expenses
    if (filterMode === 'today') return expenses.filter((e) => e.date === selectedDate)
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

  // Operational Expenses converted to EUR
  const totalExpensesEur = filteredExpenses.reduce((sum, e) => {
    const amt = Number(e.amount) || 0
    if (e.currency === 'EGP') return sum + amt / (rates.EGP || 53.25)
    if (e.currency === 'USD') return sum + amt / (rates.USD || 1.08)
    return sum + amt
  }, 0)

  // Net Profit after Operational Overhead
  const netProfitEur = grossProfitEur - totalExpensesEur
  const netProfitMargin = totalSalesEur > 0 ? Math.round((netProfitEur / totalSalesEur) * 100) : 0

  const totalRestEur = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_eur) || 0), 0)
  const totalRestEgp = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_egp) || 0), 0)

  // Sellers Leaderboard Breakdown
  const sellerBreakdown = useMemo(() => {
    const map = {}
    filteredBookings.forEach((b) => {
      const s = b.seller || 'فريق المبيعات'
      if (!map[s]) map[s] = { count: 0, sales: 0, pax: 0 }
      map[s].count += 1
      map[s].sales += Number(b.sell_eur) || 0
      map[s].pax += (Number(b.adult) || 0) + (Number(b.child) || 0)
    })
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.sales - a.sales)
  }, [filteredBookings])

  // Daily Trends for Curve & Bar Charts
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
      .slice(0, 7)
      .reverse()
  }, [bookings])

  return (
    <div className="w-full space-y-4">
      {/* 1. Hero Obsidian Command Ribbon */}
      <DashboardHeroRibbon
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        selectedDate={selectedDate}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
        totalBookingsCount={totalBookings}
        onOpenUploadModal={onOpenUploadModal}
        onOpenNewBooking={onOpenNewBooking}
        onOpenNewExpense={() => {}}
        rates={rates}
        grandSalesEur={totalSalesEur}
        grandSalesEgp={Math.round(totalSalesEur * (rates.EGP || 53.25))}
      />

      {/* 2. Master Financial KPI Bento Cards */}
      <FinancialKpiCards
        totalSalesEur={totalSalesEur}
        totalCostEur={totalCostEur}
        totalExpensesEur={totalExpensesEur}
        netProfitEur={netProfitEur}
        netProfitMargin={netProfitMargin}
        totalRestEur={totalRestEur}
        totalRestEgp={totalRestEgp}
        totalPax={totalPax}
        totalBookings={totalBookings}
        expensesCount={filteredExpenses.length}
        rates={rates}
      />

      {/* Empty State Banner if no bookings exist yet */}
      {bookings.length === 0 ? (
        <div className="p-8 bg-white rounded-3xl border border-sky-200/80 shadow-soft text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <FileSpreadsheet className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800">
              قاعدة البيانات نظيفة 100% وجاهزة لاستقبال ملف الإكسيل الجديد
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              تم مسح كافة البيانات السابقة بنجاح. يمكنك الآن رفع ملف إكسيل اليومية الجديد (Daily Situation) لبدء احتساب الإيرادات والأرباح وتكاليف الموردين فوراً.
            </p>
          </div>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenUploadModal()
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full text-xs font-black shadow-lg shadow-emerald-950/20 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>رفع ملف إكسيل اليومية الآن</span>
          </button>
        </div>
      ) : (
        <>
          {/* 3. Financial Trajectory Multi-Series SVG Chart */}
          <FinancialTrendChart dailyTrends={dailyTrends} />

          {/* 4. Fleet & Vessel Capacity Radar + Category Revenue Donut */}
          <FleetOccupancyRadar
            filteredBookings={filteredBookings}
            tripDefinitions={tripDefinitions}
          />

          {/* 5. Sales Reps Leaderboard & Operating Expenses Log */}
          <SalesLeaderboard
            sellerBreakdown={sellerBreakdown}
            filteredExpenses={filteredExpenses}
            onAddExpense={addExpense}
            onDeleteExpense={deleteExpense}
          />
        </>
      )}
    </div>
  )
}
