import React, { useState, useMemo } from 'react'
import {
  Users,
  Euro,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Hotel,
  Truck,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Edit3,
  Calendar,
  ChevronDown,
  Check,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { computeBookingFinancials, getExecutorTripCost } from '../../data/initialSetup'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { AX_PaginationBar } from '../common/AX_PaginationBar'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'
import { AX_EditBookingModal } from './AX_EditBookingModal'
import { soundManager } from '../../utils/soundEffects'

export function DailySituationView({ onOpenUploadModal }) {
  const {
    bookings,
    selectedDate,
    setSelectedDate,
    updateBooking,
    batchAssignBookingsExecutor,
    openConfirmModal,
    executors,
    tripDefinitions = [],
    setActiveTab,
    t,
    lang
  } = useAXStore()

  const isRtl = lang === 'ar'
  const [filterTripType, setFilterTripType] = useState('ALL')
  const [filterExecutor, setFilterExecutor] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingBooking, setEditingBooking] = useState(null)
  const [isBatchAssignOpen, setIsBatchAssignOpen] = useState(false)
  const [batchExecutorId, setBatchExecutorId] = useState('')
  const [selectedBatchSrs, setSelectedBatchSrs] = useState(new Set())
  const pageSize = 20

  const getMatchedTripDef = (tripType) => {
    const clean = (tripType || '').toLowerCase().trim().replace(/\s+/g, ' ')
    return tripDefinitions.find((td) => {
      const s = (td.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
      const d = (td.display_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
      return s === clean || d === clean
    })
  }

  const handleInlineAssignExecutor = (booking, newExecutorId) => {
    if (!newExecutorId || newExecutorId === booking.executor_id) return
    soundManager.playClick()
    const fin = computeBookingFinancials(
      { ...booking, executor_id: newExecutorId },
      tripDefinitions,
      executors
    )
    const effectiveSell = booking.sell_eur || fin.sell_eur || 0
    updateBooking(booking.sr, {
      executor_id: newExecutorId,
      cost_eur: fin.cost_eur,
      sell_eur: effectiveSell,
      profit_eur: effectiveSell - fin.cost_eur
    })
  }

  const handleToggleBatchSr = (sr) => {
    soundManager.playClick()
    setSelectedBatchSrs((prev) => {
      const next = new Set(prev)
      if (next.has(sr)) next.delete(sr)
      else next.add(sr)
      return next
    })
  }

  const handleSelectAllBatch = () => {
    soundManager.playClick()
    const unassignedSrs = unassignedDailyBookings.map((b) => b.sr)
    if (selectedBatchSrs.size === unassignedSrs.length) {
      setSelectedBatchSrs(new Set())
    } else {
      setSelectedBatchSrs(new Set(unassignedSrs))
    }
  }

  const handleApplyBatchAssignment = () => {
    if (!batchExecutorId || selectedBatchSrs.size === 0) return
    soundManager.playSuccess()
    if (typeof batchAssignBookingsExecutor === 'function') {
      batchAssignBookingsExecutor(Array.from(selectedBatchSrs), batchExecutorId)
    }
    setSelectedBatchSrs(new Set())
    setIsBatchAssignOpen(false)
  }

  const dailyBookings = bookings.filter((b) => b.date === selectedDate)

  const unpricedDailyTrips = useMemo(() => {
    return dailyBookings.filter((b) => {
      const cleanType = (b.trip_type || '').toLowerCase().trim()
      if (cleanType.includes('cash pickup') || cleanType.includes('تحصيل')) return false
      const matched = tripDefinitions.find((td) => {
        const sName = (td.sheet_name || '').toLowerCase().trim()
        const dName = (td.display_name || '').toLowerCase().trim()
        return sName === cleanType || dName === cleanType
      })
      return !matched || (Number(matched.adult_cost) === 0 && Number(matched.adult_sell) === 0)
    })
  }, [dailyBookings, tripDefinitions])

  const unassignedDailyBookings = useMemo(() => {
    return dailyBookings.filter((b) => {
      const cleanType = (b.trip_type || '').toLowerCase().trim()
      if (cleanType.includes('cash pickup') || cleanType.includes('تحصيل')) return false
      return !b.executor_id || !executors.some((ex) => ex.id === b.executor_id)
    })
  }, [dailyBookings, executors])

  const filteredBookings = dailyBookings.filter((b) => {
    const matchesTrip = filterTripType === 'ALL' || b.trip_type === filterTripType
    const isUnassigned = !b.executor_id || !executors.some((ex) => ex.id === b.executor_id)
    const matchesExec =
      filterExecutor === 'ALL'
        ? true
        : filterExecutor === 'UNASSIGNED'
        ? isUnassigned
        : b.executor_id === filterExecutor
    const matchesSearch =
      (b.guest_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.hotel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.sr || '').includes(searchQuery) ||
      String(b.room || '').includes(searchQuery) ||
      (b.seller || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTrip && matchesExec && matchesSearch
  })

  const totalBookings = filteredBookings.length
  const totalAdults = filteredBookings.reduce((sum, b) => sum + (Number(b.adult) || 0), 0)
  const totalChildren = filteredBookings.reduce((sum, b) => sum + (Number(b.child) || 0), 0)
  const totalInfants = filteredBookings.reduce((sum, b) => sum + (Number(b.infant) || 0), 0)
  const totalPax = totalAdults + totalChildren + totalInfants

  const totalSalesEur = filteredBookings.reduce((sum, b) => sum + (Number(b.sell_eur) || 0), 0)
  const totalCostEur = filteredBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
  const totalProfitEur = totalSalesEur - totalCostEur

  const totalPages = Math.ceil(totalBookings / pageSize) || 1
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const uniqueTrips = Array.from(new Set(dailyBookings.map((b) => b.trip_type)))

  const getPaymentBadge = (b) => {
    const hasRest = (b.rest_eur > 0 || b.rest_egp > 0 || b.rest_usd > 0 || b.rest_gbp > 0)
    if (!hasRest) {
      return {
        text: t('status_paid'),
        className: 'bg-emerald-100 text-emerald-800'
      }
    }
    if (b.rest_eur < b.sell_eur) {
      return {
        text: t('status_partial'),
        className: 'bg-amber-100 text-amber-800'
      }
    }
    return {
      text: t('status_unpaid'),
      className: 'bg-rose-100 text-rose-800'
    }
  }

  const handleMarkPaid = (sr) => {
    openConfirmModal({
      title: t('confirm_collect_title'),
      message: t('confirm_collect_msg', { sr }),
      confirmText: t('action_collect'),
      type: 'info',
      onConfirm: () => {
        updateBooking(sr, {
          rest_eur: 0,
          rest_egp: 0,
          rest_usd: 0,
          rest_gbp: 0,
          status: 'paid'
        })
      }
    })
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-soft space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
          {/* Date Picker + Quick Today */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1">
              <AX_CompanyDatePicker
                value={selectedDate}
                onChange={(d) => {
                  setSelectedDate(d)
                  setCurrentPage(1)
                }}
                placeholder={t('daily_date')}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick()
                const today = new Date().toISOString().split('T')[0]
                setSelectedDate(today)
                setCurrentPage(1)
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#0a2540] rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0 cursor-pointer"
              title={isRtl ? 'الانتقال لليوم' : 'Jump to today'}
            >
              {isRtl ? 'اليوم' : 'Today'}
            </button>
          </div>

          {/* Trip Type Select */}
          <div>
            <AX_SearchableSelect
              value={filterTripType}
              onChange={(val) => {
                setFilterTripType(val)
                setCurrentPage(1)
              }}
              options={[
                { value: 'ALL', label: `${t('all_trips')} (${uniqueTrips.length})` },
                ...uniqueTrips.map((tt) => ({ value: tt, label: tt }))
              ]}
            />
          </div>

          {/* Executor Select */}
          <div>
            <AX_SearchableSelect
              value={filterExecutor}
              onChange={(val) => {
                setFilterExecutor(val)
                setCurrentPage(1)
              }}
              options={[
                { value: 'ALL', label: t('all_executors') },
                ...(unassignedDailyBookings.length > 0
                  ? [{ value: 'UNASSIGNED', label: `⚠️ ${t('filter_unassigned_only')} (${unassignedDailyBookings.length})` }]
                  : []),
                ...executors.map((ex) => ({ value: ex.id, label: ex.name }))
              ]}
            />
          </div>
        </div>

        {/* Full-Width Search Input */}
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder={t('search_placeholder')}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pe-4 ps-10 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* ⚠️ Unpriced Bookings Alert Banner */}
      {unpricedDailyTrips.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-amber-950 font-bold">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm block">
                {isRtl
                  ? `تنبيه تشغيلي: يوجد (${unpricedDailyTrips.length}) حجوزات لرحلات لم يتم تسعيرها بعد في دليل الرحلات!`
                  : `Operational Notice: (${unpricedDailyTrips.length}) bookings have unpriced trips in the catalog!`}
              </span>
              <span className="text-[11px] text-amber-800 block mt-0.5">
                {isRtl
                  ? 'تكاليف وأرباح هذه الرحلات غير محتسبة بدقة حتى يتم تحديد سعر التكلفة والبيع.'
                  : 'Costs and profits for these trips are not calculated until prices are set.'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            className="px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>{isRtl ? 'تسعير الرحلات في الدليل' : 'Set Prices in Catalog'}</span>
            <span className="text-sky-300">←</span>
          </button>
        </div>
      )}

      {/* ⚠️ Unassigned Executor Alert Banner */}
      {unassignedDailyBookings.length > 0 && (
        <div className="space-y-3">
          <div className="bg-rose-50 border border-rose-300 rounded-3xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5 text-rose-950 font-bold">
              <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
              </div>
              <div>
                <span className="font-black text-xs sm:text-sm block">
                  {t('unassigned_exec_alert').replace('{count}', unassignedDailyBookings.length)}
                </span>
                <span className="text-[11px] text-rose-800 block mt-0.5">
                  {t('unassigned_exec_desc')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick()
                  setFilterExecutor('UNASSIGNED')
                  setCurrentPage(1)
                }}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>{t('filter_unassigned_only')} ({unassignedDailyBookings.length})</span>
                <span className="text-rose-200">←</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick()
                  setIsBatchAssignOpen(!isBatchAssignOpen)
                }}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  isBatchAssignOpen
                    ? 'bg-rose-800 text-white'
                    : 'bg-[#0a2540] hover:bg-[#133e66] text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                <span>{t('batch_assign_executors')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isBatchAssignOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {isBatchAssignOpen && (
            <div className="bg-white border-2 border-[#0284c7]/40 rounded-3xl p-4 sm:p-5 shadow-soft space-y-3.5 animate-scaleUp">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-[#0a2540]">
                      {t('batch_assign_title')}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold">
                      {t('batch_assign_desc')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllBatch}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {selectedBatchSrs.size === unassignedDailyBookings.length ? (
                      <CheckSquare className="w-3.5 h-3.5 text-[#0284c7]" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>
                      {selectedBatchSrs.size === unassignedDailyBookings.length
                        ? t('clear_selection')
                        : `${t('select_all_unassigned')} (${unassignedDailyBookings.length})`}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="relative">
                  <select
                    value={batchExecutorId}
                    onChange={(e) => setBatchExecutorId(e.target.value)}
                    className="w-full appearance-none ps-9 pe-8 py-2.5 bg-slate-50 border-2 border-slate-300 hover:border-[#0284c7] focus:border-[#0284c7] rounded-full text-xs font-black text-slate-800 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="">-- {t('select_executor_prompt')} --</option>
                    {executors.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.category || 'عام'})
                      </option>
                    ))}
                  </select>
                  <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#0284c7]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!batchExecutorId || selectedBatchSrs.size === 0}
                  onClick={handleApplyBatchAssignment}
                  className={`py-2.5 px-5 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
                    !batchExecutorId || selectedBatchSrs.size === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-[#0a2540] hover:bg-[#133e66] text-white active:scale-95 cursor-pointer'
                  }`}
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t('batch_assign_btn').replace('{count}', selectedBatchSrs.size)}</span>
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pe-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                {unassignedDailyBookings.map((b) => {
                  const isChecked = selectedBatchSrs.has(b.sr)
                  const matchedDef = getMatchedTripDef(b.trip_type)
                  const rate = batchExecutorId ? getExecutorTripCost(matchedDef, batchExecutorId, executors) : null
                  return (
                    <div
                      key={b.sr}
                      onClick={() => handleToggleBatchSr(b.sr)}
                      className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all border ${
                        isChecked
                          ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#0284c7] flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="font-mono text-[#0284c7] font-bold">#{b.sr}</span>
                        <span className="font-black truncate">{b.guest_name}</span>
                        <span className="text-slate-400 font-normal truncate">({b.hotel})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-800 font-bold">
                          {b.trip_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono flex-shrink-0">
                        {rate && rate.adult_cost > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            تكلفة: €{rate.adult_cost}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-sans">
                          {b.adult} {isRtl ? 'ك' : 'A'} {b.child > 0 ? `+ ${b.child} ${isRtl ? 'ط' : 'C'}` : ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bento Stats Banner - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">{t('total_pax')}</div>
            <div className="text-lg font-black text-[#0a2540] font-mono">
              {totalPax} <span className="text-xs font-normal text-slate-500">({totalAdults}{t('adults_short')} / {totalChildren}{t('children_short')})</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Euro className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">{t('total_sales')}</div>
            <div className="text-lg font-black text-emerald-600 font-mono">
              €{totalSalesEur.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">{t('executors_cost')}</div>
            <div className="text-lg font-black text-amber-700 font-mono">
              €{totalCostEur.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">{t('net_profit')}</div>
            <div className="text-lg font-black text-[#0a2540] font-mono">
              €{totalProfitEur.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Banner if no bookings exist for this date (Rule 2610: سيب بس العائم في الصفحة) */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-[#0284c7] flex items-center justify-center mx-auto border border-slate-200">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            {isRtl ? `لا توجد حجوزات مسجلة لهذا التاريخ (${selectedDate})` : `No bookings registered for this date (${selectedDate})`}
          </h3>
          <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto">
            {isRtl ? 'استخدم الزر العائم بأسفل الشاشة لرفع شيت الإكسيل وإدراج الرحلات اليومية.' : 'Use the floating action button below to upload Excel sheet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Bento Cards View (lg:hidden) */}
      <div className="space-y-3 lg:hidden">
        {paginatedBookings.map((b) => {
          const executor = executors.find((ex) => ex.id === b.executor_id)
          const badge = getPaymentBadge(b)

          return (
            <div
              key={b.sr}
              onClick={() => {
                soundManager.playClick()
                setEditingBooking(b)
              }}
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft space-y-3 cursor-pointer hover:border-sky-300 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#0a2540] text-[#38bdf8] font-mono">
                    #{b.sr}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{b.trip_type}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    📅 {b.date}
                  </span>
                  {b.is_edited && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                      {isRtl ? '✏️ معدّل' : '✏️ Edited'}
                    </span>
                  )}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                  {badge.text}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-black text-[#0a2540]">{b.guest_name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Hotel className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>{b.hotel}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold">{isRtl ? 'غرفة:' : 'Room:'} {b.room}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <span>{isRtl ? 'المنفذ:' : 'Partner:'}</span>
                    <div className="relative inline-block">
                      <select
                        value={b.executor_id || ''}
                        onChange={(e) => handleInlineAssignExecutor(b, e.target.value)}
                        className={`appearance-none ps-6 pe-6 py-1 rounded-full text-[11px] font-black cursor-pointer transition-all border outline-none ${
                          b.executor_id
                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300 animate-pulse'
                        }`}
                      >
                        <option value="" disabled={Boolean(b.executor_id)}>
                          ⚠️ {t('unassigned_exec_badge')}
                        </option>
                        {executors.map((ex) => {
                          const rate = getExecutorTripCost(getMatchedTripDef(b.trip_type), ex.id, executors)
                          const costStr = rate.adult_cost > 0 ? ` (€${rate.adult_cost})` : ''
                          return (
                            <option key={ex.id} value={ex.id}>
                              {ex.name}{costStr}
                            </option>
                          )
                        })}
                      </select>
                      <div className="absolute start-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        {b.executor_id ? (
                          <Truck className="w-3 h-3 text-[#0284c7]" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                        )}
                      </div>
                      <div className="absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <div className="text-xs text-slate-400 font-sans">{isRtl ? 'الأفراد' : 'PAX'}</div>
                  <div className="text-sm font-bold text-slate-800">
                    {b.adult} {isRtl ? 'بالغ' : 'adult'} {b.child > 0 ? `+ ${b.child} ${isRtl ? 'طفل' : 'child'}` : ''}
                  </div>
                </div>
              </div>

              {/* Financial bar */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans ml-1">{isRtl ? 'البيع:' : 'Sell:'}</span>
                  <span className="font-bold text-slate-800">€{b.sell_eur}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">{isRtl ? 'التكلفة:' : 'Cost:'}</span>
                  <span className="font-bold text-amber-700">€{b.cost_eur}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">{isRtl ? 'الربح:' : 'Profit:'}</span>
                  <span className="font-black text-emerald-600">€{b.profit_eur}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                <div className="text-xs">
                  <span className="text-slate-400 ml-1">{isRtl ? 'المتبقي:' : 'Rest:'}</span>
                  <span className="font-black font-mono text-rose-600 text-sm">
                    €{b.rest_eur}
                  </span>
                  {b.rest_egp > 0 && (
                    <span className="text-[10px] text-slate-500 mr-1">
                      + {b.rest_egp} {isRtl ? 'ج.م' : 'EGP'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      soundManager.playClick()
                      setEditingBooking(b)
                    }}
                    className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 border border-sky-200 shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-sky-600" />
                    <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                  </button>
                  {badge.text !== t('status_paid') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkPaid(b.sr)
                      }}
                      className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-xs transition-all active:scale-95 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('collect')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Single-Line Table with SMOOTH HORIZONTAL SCROLL (Rule 16 + Scroll fix) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-soft overflow-x-auto overflow-y-hidden w-full max-w-full">
        <table className="w-full text-start border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-[#0f172a] text-white text-xs font-bold h-11">
              <th className="px-3 font-mono text-start">{t('th_sr')}</th>
              <th className="px-3 text-start">{t('th_date')}</th>
              <th className="px-3 text-start">{t('th_guest')}</th>
              <th className="px-3 text-start">{t('th_hotel_room')}</th>
              <th className="px-3 text-start">{t('th_trip')}</th>
              <th className="px-3 text-start">{t('th_executor')}</th>
              <th className="px-3 text-center">{t('th_pax')}</th>
              <th className="px-3 text-center font-mono">{t('th_sell')}</th>
              <th className="px-3 text-center font-mono">{t('th_cost')}</th>
              <th className="px-3 text-center font-mono">{t('th_profit')}</th>
              <th className="px-3 text-center font-mono">{isRtl ? 'المتبقي' : 'Rest (€)'}</th>
              <th className="px-3 text-center">{t('th_payment_status')}</th>
              <th className="px-3 text-center">{t('th_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {paginatedBookings.map((b) => {
              const executor = executors.find((ex) => ex.id === b.executor_id)
              const badge = getPaymentBadge(b)

              return (
                <tr
                  key={b.sr}
                  onClick={() => {
                    soundManager.playClick()
                    setEditingBooking(b)
                  }}
                  className="h-12 hover:bg-sky-50/70 transition-colors whitespace-nowrap cursor-pointer"
                  title={isRtl ? 'اضغط لتعديل بيانات الحجز' : 'Click to edit booking'}
                >
                  <td className="px-3 font-mono font-bold text-[#0284c7]">
                    #{b.sr}
                  </td>
                  <td className="px-3">
                    <span className="font-mono text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px] whitespace-nowrap">
                      📅 {b.date}
                    </span>
                  </td>
                  <td className="px-3 font-black text-[#0a2540] max-w-[150px] truncate" title={b.guest_name}>
                    {b.guest_name}
                  </td>
                  <td className="px-3 text-slate-700 max-w-[180px] truncate" title={`${b.hotel} (${b.room})`}>
                    <span className="font-bold">{b.hotel}</span> <span className="text-slate-400 font-mono">({b.room})</span>
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                        {b.trip_type}
                      </span>
                      {b.is_edited && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          {isRtl ? '✏️ معدّل' : '✏️ Edited'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block w-full min-w-[140px] max-w-[200px]">
                      <select
                        value={b.executor_id || ''}
                        onChange={(e) => handleInlineAssignExecutor(b, e.target.value)}
                        className={`w-full appearance-none ps-7 pe-6 py-1 rounded-full text-xs font-black cursor-pointer transition-all border outline-none ${
                          b.executor_id
                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300 focus:border-[#0284c7]'
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300 animate-pulse focus:border-rose-500'
                        }`}
                      >
                        <option value="" disabled={Boolean(b.executor_id)}>
                          ⚠️ {t('unassigned_exec_badge')}
                        </option>
                        {executors.map((ex) => {
                          const rate = getExecutorTripCost(getMatchedTripDef(b.trip_type), ex.id, executors)
                          const costStr = rate.adult_cost > 0 ? ` (€${rate.adult_cost})` : ''
                          return (
                            <option key={ex.id} value={ex.id}>
                              {ex.name}{costStr}
                            </option>
                          )
                        })}
                      </select>
                      <div className="absolute start-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        {b.executor_id ? (
                          <Truck className="w-3.5 h-3.5 text-[#0284c7]" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                      </div>
                      <div className="absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 text-center font-mono font-bold">
                    {b.adult} {isRtl ? 'ك' : 'A'} {b.child > 0 ? `+ ${b.child} ${isRtl ? 'ص' : 'C'}` : ''}
                  </td>
                  <td className="px-3 text-center font-mono font-bold text-slate-800">
                    €{b.sell_eur}
                  </td>
                  <td className="px-3 text-center font-mono font-bold text-amber-700">
                    €{b.cost_eur}
                  </td>
                  <td className="px-3 text-center font-mono font-black text-emerald-600">
                    €{b.profit_eur}
                  </td>
                  <td className="px-3 text-center font-mono font-black">
                    {b.rest_eur > 0 ? (
                      <span className="text-rose-600 font-bold">€{b.rest_eur}</span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">0.00 €</span>
                    )}
                  </td>
                  <td className="px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                      {badge.text === t('status_paid') && <CheckCircle2 className="w-3 h-3" />}
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          soundManager.playClick()
                          setEditingBooking(b)
                        }}
                        className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-xs cursor-pointer"
                        title={isRtl ? 'تعديل بيانات الحجز والأفراد' : 'Edit booking & pax'}
                      >
                        <Edit3 className="w-3 h-3 text-sky-600" />
                        <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                      </button>
                      {badge.text !== t('status_paid') ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkPaid(b.sr)
                          }}
                          className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-xs transition-all active:scale-95 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t('collect')}</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs px-2">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (Rule 17) */}
      <AX_PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalBookings}
        pageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
      />
        </>
      )}

      {editingBooking && (
        <AX_EditBookingModal
          isOpen={Boolean(editingBooking)}
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}
    </div>
  )
}
