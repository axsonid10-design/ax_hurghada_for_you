import React, { useState, useMemo, useEffect } from 'react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { exchangeRates } from '../../utils/exchangeRates'
import { DashboardFilterBar } from './DashboardFilterBar'
import { FinancialKpiCards } from './FinancialKpiCards'
import { FinancialTrendChart } from './FinancialTrendChart'
import { CategoryDistributionChart } from './CategoryDistributionChart'
import { DashboardDataBreakdown } from './DashboardDataBreakdown'
import { QuickExpenseModal } from './QuickExpenseModal'

export function OperationsDashboard({ onOpenUploadModal, onOpenNewExpense }) {
  const {
    bookings = [],
    selectedDate,
    setSelectedDate,
    tripDefinitions = [],
    executors = [],
    expenses = [],
    addExpense,
    deleteExpense
  } = useAXStore()

  const [filterMode, setFilterMode] = useState('all')
  const [customFrom, setCustomFrom] = useState(selectedDate)
  const [customTo, setCustomTo] = useState(selectedDate)
  const [displayCurrency, setDisplayCurrency] = useState('EUR')
  const [rates, setRates] = useState(exchangeRates.getRates())
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

  useEffect(() => {
    exchangeRates.fetchLiveRates().then((liveRates) => {
      if (liveRates) setRates({ ...liveRates })
    })
  }, [])

  const filteredBookings = useMemo(() => {
    if (filterMode === 'all') return bookings
    if (filterMode === 'today') return bookings.filter((b) => b.date === selectedDate)
    if (filterMode === 'custom') {
      return bookings.filter((b) => b.date >= customFrom && b.date <= customTo)
    }

    const refTime = selectedDate ? new Date(selectedDate).getTime() : NaN
    const refDate = !isNaN(refTime) ? new Date(refTime) : new Date()
    const safeSelectedDate = !isNaN(refTime) ? selectedDate : refDate.toISOString().split('T')[0]

    if (filterMode === 'week') {
      const past7Days = new Date(refDate)
      past7Days.setDate(past7Days.getDate() - 7)
      const pastStr = past7Days.toISOString().split('T')[0]
      return bookings.filter((b) => b.date >= pastStr && b.date <= safeSelectedDate)
    }
    if (filterMode === 'month') {
      const monthPrefix = safeSelectedDate.substring(0, 7)
      return bookings.filter((b) => (b.date || '').startsWith(monthPrefix))
    }

    return bookings
  }, [bookings, filterMode, selectedDate, customFrom, customTo])

  const filteredExpenses = useMemo(() => {
    if (filterMode === 'all') return expenses
    if (filterMode === 'today') return expenses.filter((e) => e.date === selectedDate)
    if (filterMode === 'custom') {
      return expenses.filter((e) => e.date >= customFrom && e.date <= customTo)
    }

    const refTime = selectedDate ? new Date(selectedDate).getTime() : NaN
    const refDate = !isNaN(refTime) ? new Date(refTime) : new Date()
    const safeSelectedDate = !isNaN(refTime) ? selectedDate : refDate.toISOString().split('T')[0]

    if (filterMode === 'week') {
      const past7Days = new Date(refDate)
      past7Days.setDate(past7Days.getDate() - 7)
      const pastStr = past7Days.toISOString().split('T')[0]
      return expenses.filter((e) => e.date >= pastStr && e.date <= safeSelectedDate)
    }
    if (filterMode === 'month') {
      const monthPrefix = safeSelectedDate.substring(0, 7)
      return expenses.filter((e) => (e.date || '').startsWith(monthPrefix))
    }

    return expenses
  }, [expenses, filterMode, selectedDate, customFrom, customTo])

  const totalBookings = filteredBookings.length
  const totalAdults = filteredBookings.reduce((sum, b) => sum + (Number(b.adult) || 0), 0)
  const totalChildren = filteredBookings.reduce((sum, b) => sum + (Number(b.child) || 0), 0)
  const totalInfants = filteredBookings.reduce((sum, b) => sum + (Number(b.infant) || 0), 0)
  const totalPax = totalAdults + totalChildren + totalInfants

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
  const totalRestUsd = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_usd) || 0), 0)
  const totalRestGbp = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_gbp) || 0), 0)

  const dailyTrends = useMemo(() => {
    const map = new Map()
    filteredBookings.forEach((b) => {
      if (!b.date) return
      if (!map.has(b.date)) {
        map.set(b.date, {
          date: b.date,
          sales: 0,
          cost: 0,
          profit: 0,
          count: 0,
          adults: 0,
          children: 0
        })
      }
      const entry = map.get(b.date)
      entry.sales += Number(b.sell_eur) || 0
      entry.cost += Number(b.cost_eur) || 0
      entry.profit += Number(b.profit_eur) || 0
      entry.count += 1
      entry.adults += Number(b.adult) || 0
      entry.children += Number(b.child) || 0
    })

    return Array.from(map.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .reverse()
  }, [filteredBookings])

  return (
    <div className="w-full space-y-4">
      <DashboardFilterBar
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        selectedDate={selectedDate}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
        totalBookingsCount={totalBookings}
        onOpenUploadModal={onOpenUploadModal}
        onOpenNewExpense={onOpenNewExpense || (() => setIsExpenseModalOpen(true))}
        rates={rates}
      />

      <FinancialKpiCards
        totalSalesEur={totalSalesEur}
        totalCostEur={totalCostEur}
        totalExpensesEur={totalExpensesEur}
        netProfitEur={netProfitEur}
        netProfitMargin={netProfitMargin}
        totalRestEur={totalRestEur}
        totalRestEgp={totalRestEgp}
        totalRestUsd={totalRestUsd}
        totalRestGbp={totalRestGbp}
        totalPax={totalPax}
        totalAdults={totalAdults}
        totalChildren={totalChildren}
        totalInfants={totalInfants}
        totalBookings={totalBookings}
        expensesCount={filteredExpenses.length}
        displayCurrency={displayCurrency}
        rates={rates}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FinancialTrendChart
          dailyTrends={dailyTrends}
          displayCurrency={displayCurrency}
          rates={rates}
        />
        <CategoryDistributionChart
          filteredBookings={filteredBookings}
          tripDefinitions={tripDefinitions}
          displayCurrency={displayCurrency}
          rates={rates}
        />
      </div>

      <DashboardDataBreakdown
        filteredBookings={filteredBookings}
        tripDefinitions={tripDefinitions}
        executors={executors}
        displayCurrency={displayCurrency}
        rates={rates}
      />

      <QuickExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={addExpense}
      />
    </div>
  )
}
