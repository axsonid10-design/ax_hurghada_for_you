import React, { useState, useMemo } from 'react'
import {
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Users,
  CreditCard,
  Euro,
  DollarSign,
  Wallet,
  RefreshCw,
  Edit3
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_PaginationBar } from '../common/AX_PaginationBar'
import { AX_EditBookingModal } from '../trips/AX_EditBookingModal'
import { soundManager } from '../../utils/soundEffects'
import { resumeOfflineSync } from '../../services/realtimeSync'

export function BookingsManagement({ onOpenUploadModal }) {
  const {
    bookings = [],
    deleteBooking,
    updateBooking,
    openConfirmModal,
    wipeAllData,
    tripDefinitions = [],
    executors = [],
    setActiveTab,
    syncStatus,
    t,
    lang
  } = useAXStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingBooking, setEditingBooking] = useState(null)
  const pageSize = 20

  const unpricedBookings = useMemo(() => {
    return (bookings || []).filter((b) => {
      const cleanType = (b.trip_type || '').toLowerCase().trim()
      if (cleanType.includes('cash pickup') || cleanType.includes('تحصيل')) return false
      const matched = tripDefinitions.find((td) => {
        const sName = (td.sheet_name || '').toLowerCase().trim()
        const dName = (td.display_name || '').toLowerCase().trim()
        return sName === cleanType || dName === cleanType
      })
      return !matched || (Number(matched.adult_cost) === 0 && Number(matched.adult_sell) === 0)
    })
  }, [bookings, tripDefinitions])

  const unassignedBookings = useMemo(() => {
    return (bookings || []).filter((b) => {
      const cleanType = (b.trip_type || '').toLowerCase().trim()
      if (cleanType.includes('cash pickup') || cleanType.includes('تحصيل')) return false
      return !b.executor_id
    })
  }, [bookings])

  const filtered = (bookings || []).filter((b) => {
    if (!b) return false
    const guestName = b.guest_name || b.name || ''
    const matchesSearch =
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.hotel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.trip_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.seller || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.sr || '').includes(searchTerm) ||
      String(b.room || '').includes(searchTerm)

    const restEur = Number(b.rest_eur) || 0
    const restEgp = Number(b.rest_egp) || 0
    const restUsd = Number(b.rest_usd) || 0
    const restGbp = Number(b.rest_gbp) || 0
    const hasRest = (restEur > 0 || restEgp > 0 || restUsd > 0 || restGbp > 0)
    let matchesStatus = true
    if (statusFilter === 'paid') matchesStatus = !hasRest
    if (statusFilter === 'unpaid') matchesStatus = hasRest
    if (statusFilter === 'unassigned') {
      const cleanType = (b.trip_type || '').toLowerCase().trim()
      const isCashPickup = cleanType.includes('cash pickup') || cleanType.includes('تحصيل')
      matchesStatus = !b.executor_id && !isCashPickup
    }

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalSalesEur = filtered.reduce((s, b) => s + (Number(b.sell_eur) || 0), 0)
  const totalRestEur = filtered.reduce((s, b) => s + (Number(b.rest_eur) || 0), 0)
  const totalCollectedEur = Math.max(0, totalSalesEur - totalRestEur)

  const getPaymentBadge = (b) => {
    if (!b) return { text: t('status_unpaid'), className: 'bg-rose-50 text-rose-700 border border-rose-200' }
    const restEur = Number(b.rest_eur) || 0
    const restEgp = Number(b.rest_egp) || 0
    const restUsd = Number(b.rest_usd) || 0
    const restGbp = Number(b.rest_gbp) || 0
    const hasRest = (restEur > 0 || restEgp > 0 || restUsd > 0 || restGbp > 0)
    if (!hasRest) {
      return {
        text: t('status_paid'),
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }
    }
    const sellEur = Number(b.sell_eur) || 0
    if (restEur < sellEur && restEur > 0) {
      return {
        text: t('status_partial'),
        className: 'bg-amber-50 text-amber-800 border border-amber-200'
      }
    }
    return {
      text: t('status_unpaid'),
      className: 'bg-rose-50 text-rose-700 border border-rose-200'
    }
  }

  const handleMarkPaid = (sr, name) => {
    soundManager.playSuccess()
    updateBooking(sr, {
      rest_eur: 0,
      rest_egp: 0,
      rest_usd: 0,
      rest_gbp: 0,
      status: 'paid'
    })
  }

  const handleDelete = (sr, name) => {
    openConfirmModal({
      title: t('booking_delete_title'),
      message: t('delete_booking_confirm_msg', { name: name || t('guest_unnamed'), sr }),
      confirmText: t('booking_delete_confirm'),
      type: 'danger',
      onConfirm: () => {
        soundManager.playAlert()
        deleteBooking(sr)
      }
    })
  }

  const handleWipeAll = () => {
    openConfirmModal({
      title: t('wipe_confirm_title'),
      message: t('wipe_confirm_msg'),
      confirmText: t('wipe_confirm_btn'),
      type: 'danger',
      onConfirm: () => {
        soundManager.playTrash()
        wipeAllData()
      }
    })
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft">
          <span className="text-[10px] text-slate-500 font-bold block">{t('booking_total')}</span>
          <span className="text-base sm:text-lg font-black font-mono text-slate-900">
            {filtered.length} {t('bookings_count')}
          </span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft">
          <span className="text-[10px] text-slate-500 font-bold block">{t('booking_sales')}</span>
          <span className="text-base sm:text-lg font-black font-mono text-slate-900">€{Math.round(totalSalesEur).toLocaleString()}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft">
          <span className="text-[10px] text-slate-500 font-bold block">{t('booking_collected')}</span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-700">€{Math.round(totalCollectedEur).toLocaleString()}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft">
          <span className="text-[10px] text-slate-500 font-bold block">{t('booking_remaining')}</span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-700">€{Math.round(totalRestEur).toLocaleString()}</span>
        </div>
      </div>

      {syncStatus?.pendingCount > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-3xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-sky-950 font-bold">
            <RefreshCw className={`w-4 h-4 text-sky-600 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {syncStatus.isSyncing
                ? t('sync_bookings_cloud', { count: syncStatus.pendingCount, progress: syncStatus.progress })
                : t('sync_pending_cloud', { count: syncStatus.pendingCount })}
            </span>
          </div>
          <button
            onClick={() => resumeOfflineSync()}
            disabled={syncStatus.isSyncing}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-black transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {t('sync_now')}
          </button>
        </div>
      )}
      {unassignedBookings.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-3xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-rose-950 font-bold">
            <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm block">
                {t('unassigned_bookings_alert', { count: unassignedBookings.length })}
              </span>
              <span className="text-[11px] text-rose-800 block mt-0.5">
                {t('unassigned_bookings_desc')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('unassigned')
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>{t('view_unassigned')} ({unassignedBookings.length})</span>
            <span className="text-rose-200">←</span>
          </button>
        </div>
      )}

      {unpricedTrips.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-amber-950 font-bold">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm block">
                {t('unpriced_bookings_alert', { count: unpricedTrips.length })}
              </span>
              <span className="text-[11px] text-amber-800 block mt-0.5">
                {t('unpriced_bookings_desc')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              setActiveTab('trips')
            }}
            className="px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>{t('price_trips_now')}</span>
            <span className="text-sky-300">←</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-soft">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('ALL')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('all_bookings_filter')} ({bookings.length})
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('unpaid')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'unpaid'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('status_unpaid')}
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('paid')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('status_paid')}
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('unassigned')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'unassigned'
                ? 'bg-rose-600 text-white shadow-sm'
                : unassignedBookings.length > 0
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{t('unassigned_exec_badge')}</span>
            {unassignedBookings.length > 0 && (
              <span className="ms-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
                {unassignedBookings.length}
              </span>
            )}
          </button>

          {bookings.length > 0 && (
            <button
              onClick={handleWipeAll}
              title={t('wipe_all_bookings')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-black transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('wipe_all_bookings')}</span>
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder={t('search_placeholder')}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pe-4 ps-10 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {unassignedBookings.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-3xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-rose-950 font-bold">
            <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm block">
                {t('unassigned_bookings_alert', { count: unassignedBookings.length })}
              </span>
              <span className="text-[11px] text-rose-800 block mt-0.5">
                {t('unassigned_bookings_desc')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('unassigned')
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>{t('view_unassigned')}</span>
            <span className="text-rose-200">←</span>
          </button>
        </div>
      )}

      {unpricedBookings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-amber-950 font-bold">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm block">
                {t('unpriced_bookings_alert', { count: unpricedBookings.length })}
              </span>
              <span className="text-[11px] text-amber-800 block mt-0.5">
                {t('unpriced_bookings_desc')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            className="px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>{t('price_trips_now')}</span>
            <span className="text-sky-300">←</span>
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-200">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            {t('no_bookings_recorded')}
          </h3>
        </div>
      ) : (
        <>
          <div className="space-y-2.5 lg:hidden">
            {paginated.map((b) => {
              const badge = getPaymentBadge(b)
              const name = b.guest_name || b.name || t('guest_unnamed')
              const hasRest = (b.rest_eur > 0 || b.rest_egp > 0 || b.rest_usd > 0 || b.rest_gbp > 0)
              const cleanType = (b.trip_type || '').toLowerCase().trim()
              const isCashPickup = cleanType.includes('cash pickup') || cleanType.includes('تحصيل')
              const executor = executors.find((e) => e.id === b.executor_id)

              return (
                <div
                  key={b.sr}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-soft space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-sky-700">
                        #{b.sr}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">📅 {b.date}</span>
                      {b.is_edited && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          ✏️ {t('status_edited')}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div>
                    <div className="font-black text-xs text-slate-900">{name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-bold">
                      {b.hotel} {b.room ? `(${t('room_label')} ${b.room})` : ''} • <span className="text-slate-800">{b.trip_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-bold text-[11px]">
                      {t('th_executor')}:
                    </span>
                    {executor ? (
                      <span className="font-bold text-slate-800 text-[11px]">{executor.name}</span>
                    ) : !isCashPickup ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>{t('unassigned_exec_badge')}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl text-center text-xs font-mono">
                    <div>
                      <div className="text-[9px] text-slate-400 font-sans font-bold">{t('th_sell')}</div>
                      <div className="font-black text-slate-900">€{b.sell_eur || 0}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-sans font-bold">{t('th_profit')}</div>
                      <div className="font-black text-emerald-700">+€{b.profit_eur || 0}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-sans font-bold">{t('th_rest')}</div>
                      <div className={`font-black ${hasRest ? 'text-amber-700' : 'text-slate-400'}`}>
                        {b.rest_eur > 0 ? `€${b.rest_eur}` : b.rest_egp > 0 ? `${b.rest_egp} EGP` : '€0'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-500 font-bold">
                      {(Number(b.adult) || 0) + (Number(b.child) || 0)} {t('pax_count_label')} {b.seller ? `• ${b.seller}` : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundManager.playClick()
                          setEditingBooking(b)
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 border border-slate-200 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-sky-600" />
                        <span>{t('action_edit')}</span>
                      </button>
                      {hasRest && (
                        <button
                          onClick={() => handleMarkPaid(b.sr, name)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          {t('action_collect')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(b.sr, name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                        title={t('action_delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-x-auto w-full">
            <table className="w-full text-start border-collapse min-w-[1150px]">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-bold h-11">
                  <th className="px-3 font-mono text-start">{t('th_sr')}</th>
                  <th className="px-3 text-start">{t('th_date')}</th>
                  <th className="px-3 text-start">{t('th_guest')}</th>
                  <th className="px-3 text-start">{t('th_hotel_room')}</th>
                  <th className="px-3 text-start">{t('th_trip')}</th>
                  <th className="px-3 text-start">{t('th_executor')}</th>
                  <th className="px-3 text-start">{t('th_seller')}</th>
                  <th className="px-3 text-center">{t('th_pax')}</th>
                  <th className="px-3 text-center font-mono">{t('th_sell')}</th>
                  <th className="px-3 text-center font-mono">{t('th_cost')}</th>
                  <th className="px-3 text-center font-mono">{t('th_profit')}</th>
                  <th className="px-3 text-center font-mono">{t('th_rest')}</th>
                  <th className="px-3 text-center">{t('th_payment_status')}</th>
                  <th className="px-3 text-center">{t('th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {paginated.map((b) => {
                  const badge = getPaymentBadge(b)
                  const name = b.guest_name || b.name || t('guest_unnamed')
                  const hasRest = (b.rest_eur > 0 || b.rest_egp > 0 || b.rest_usd > 0 || b.rest_gbp > 0)
                  const cleanType = (b.trip_type || '').toLowerCase().trim()
                  const isCashPickup = cleanType.includes('cash pickup') || cleanType.includes('تحصيل')
                  const executor = executors.find((e) => e.id === b.executor_id)

                  return (
                    <tr key={b.sr} className="h-11 hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                      <td className="px-3 font-mono font-bold text-sky-700">#{b.sr}</td>
                      <td className="px-3 font-mono text-slate-500">{b.date}</td>
                      <td className="px-3 font-black text-slate-900 max-w-[150px] truncate" title={name}>
                        {name}
                      </td>
                      <td className="px-3 text-slate-700 max-w-[180px] truncate" title={`${b.hotel} (${b.room})`}>
                        <span className="font-bold">{b.hotel}</span> {b.room && <span className="text-slate-400 font-mono">({b.room})</span>}
                      </td>
                      <td className="px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800">{b.trip_type}</span>
                          {b.is_edited && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              ✏️ {t('status_edited')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3">
                        {executor ? (
                          <span className="font-bold text-slate-800">{executor.name}</span>
                        ) : !isCashPickup ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>{t('unassigned_exec_badge')}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 text-slate-600 font-bold">{b.seller || '—'}</td>
                      <td className="px-3 text-center font-mono font-bold text-slate-700">
                        {(Number(b.adult) || 0) + (Number(b.child) || 0)}
                      </td>
                      <td className="px-3 text-center font-mono font-bold text-slate-900">
                        €{b.sell_eur || 0}
                      </td>
                      <td className="px-3 text-center font-mono font-bold text-slate-500">
                        €{b.cost_eur || 0}
                      </td>
                      <td className="px-3 text-center font-mono font-black text-emerald-700">
                        +€{b.profit_eur || 0}
                      </td>
                      <td className="px-3 text-center font-mono font-black">
                        {b.rest_eur > 0 ? (
                          <span className="text-amber-700">€{b.rest_eur}</span>
                        ) : b.rest_egp > 0 ? (
                          <span className="text-amber-700">{b.rest_egp} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                        ) : (
                          <span className="text-slate-400">€0</span>
                        )}
                      </td>
                      <td className="px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${badge.className}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              soundManager.playClick()
                              setEditingBooking(b)
                            }}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-full text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1 border border-slate-200 cursor-pointer"
                            title={t('action_edit')}
                          >
                            <Edit3 className="w-3 h-3 text-sky-600" />
                            <span>{t('action_edit')}</span>
                          </button>
                          {hasRest && (
                            <button
                              onClick={() => handleMarkPaid(b.sr, name)}
                              className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              {t('action_collect')}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(b.sr, name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                            title={t('action_delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <AX_PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
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
