import React, { useState, useEffect, useMemo } from 'react'
import { useAXStore } from '../../store/useAXStore'
import { exchangeRates, DEFAULT_RATES } from '../../utils/exchangeRates'
import { DashboardHeroRibbon } from './DashboardHeroRibbon'
import { FinancialKpiCards } from './FinancialKpiCards'
import { FinancialTrendChart } from './FinancialTrendChart'
import { FleetOccupancyRadar } from './FleetOccupancyRadar'
import { SalesLeaderboard } from './SalesLeaderboard'

export function OperationsDashboard({ onOpenUploadModal, onOpenNewBooking }) {
  const {
    bookings,
    selectedDate,
    setSelectedDate,
    tripDefinitions,
    executors,
    expenses = [],
    addExpense,
    deleteExpense,
    setActiveTab
  } = useAXStore()

  const [rates, setRates] = useState(DEFAULT_RATES)
  const [filterMode, setFilterMode] = useState('today')
  const [customFrom, setCustomFrom] = useState(selectedDate)
  const [customTo, setCustomTo] = useState(selectedDate)

  useEffect(() => {
    let isMounted = true
    exchangeRates.fetchLiveRates().then((liveRates) => {
      if (isMounted && liveRates) {
        setRates(liveRates)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

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

  const totalBookings = filteredBookings.length
  const totalAdults = filteredBookings.reduce((sum, b) => sum + (Number(b.adult) || 0), 0)
  const totalChildren = filteredBookings.reduce((sum, b) => sum + (Number(b.child) || 0), 0)
  const totalPax = totalAdults + totalChildren

  const totalSalesEur = filteredBookings.reduce((sum, b) => sum + (Number(b.sell_eur) || 0), 0)
  const totalCostEur = filteredBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
  const grossProfitEur = totalSalesEur - totalCostEur

  const totalExpensesEur = filteredExpenses.reduce((sum, e) => {
    const amt = Number(e.amount) || 0
    if (e.currency === 'EGP') return sum + amt / (rates.EGP || 53.25)
    if (e.currency === 'USD') return sum + amt / (rates.USD || 1.08)
    return sum + amt
  }, 0)

  const netProfitEur = grossProfitEur - totalExpensesEur
  const netProfitMargin = totalSalesEur > 0 ? Math.round((netProfitEur / totalSalesEur) * 100) : 0

  const totalRestEur = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_eur) || 0), 0)
  const totalRestEgp = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_egp) || 0), 0)

  const grandSalesEur = Math.round(totalSalesEur)
  const grandSalesEgp = Math.round(totalSalesEur * (rates.EGP || 53.25))

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
      .slice(0, 6)
      .reverse()
  }, [bookings])

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

  return (
    <div className="w-full space-y-4">
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
        onOpenNewExpense={() => {
          const el = document.getElementById('btn-quick-expense')
          if (el) el.click()
        }}
        rates={rates}
        grandSalesEur={grandSalesEur}
        grandSalesEgp={grandSalesEgp}
      />

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

      <FinancialTrendChart dailyTrends={dailyTrends} />

      <FleetOccupancyRadar
        filteredBookings={filteredBookings}
        tripDefinitions={tripDefinitions}
      />

      <SalesLeaderboard
        sellerBreakdown={sellerBreakdown}
        filteredExpenses={filteredExpenses}
        onAddExpense={addExpense}
        onDeleteExpense={deleteExpense}
      />
    </div>
  )
}
