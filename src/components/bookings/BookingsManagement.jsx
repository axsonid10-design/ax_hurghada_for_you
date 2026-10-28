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
  Wallet
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_PaginationBar } from '../common/AX_PaginationBar'
import { soundManager } from '../../utils/soundEffects'

export function BookingsManagement({ onOpenUploadModal }) {
  const {
    bookings = [],
    deleteBooking,
    updateBooking,
    openConfirmModal,
    wipeAllData,
    tripDefinitions = [],
    setActiveTab,
    t
  } = useAXStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
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

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalSalesEur = filtered.reduce((s, b) => s + (Number(b.sell_eur) || 0), 0)
  const totalRestEur = filtered.reduce((s, b) => s + (Number(b.rest_eur) || 0), 0)
  const totalCollectedEur = Math.max(0, totalSalesEur - totalRestEur)

  const getPaymentBadge = (b) => {
    if (!b) return { text: 'غير مدفوع', className: 'bg-rose-50 text-rose-700 border border-rose-200' }
    const restEur = Number(b.rest_eur) || 0
    const restEgp = Number(b.rest_egp) || 0
    const restUsd = Number(b.rest_usd) || 0
    const restGbp = Number(b.rest_gbp) || 0
    const hasRest = (restEur > 0 || restEgp > 0 || restUsd > 0 || restGbp > 0)
    if (!hasRest) {
      return {
        text: 'مدفوع كلي',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }
    }
    const sellEur = Number(b.sell_eur) || 0
    if (restEur < sellEur && restEur > 0) {
      return {
        text: 'مدفوع جزئي',
        className: 'bg-amber-50 text-amber-800 border border-amber-200'
      }
    }
    return {
      text: 'غير مدفوع',
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
      message: `هل أنت متأكد من حذف حجز النزيل ${name} (SR: ${sr}) نهائياً؟`,
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
          <span className="text-[10px] text-slate-500 font-bold block">إجمالي الحجوزات</span>
          <span className="text-base sm:text-lg font-black font-mono text-slate-900">{filtered.length} حجز</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft">
          <span className="text-[10px] text-slate-500 font-bold block">إجمالي المبيعات</span>
          <span className="text-base sm:text-lg font-black font-mono text-slate-900">€{Math.round(totalSalesEur).toLocaleString()}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft">
          <span className="text-[10px] text-slate-500 font-bold block">المحصل</span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-700">€{Math.round(totalCollectedEur).toLocaleString()}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-soft">
          <span className="text-[10px] text-slate-500 font-bold block">المتبقي في الذمة</span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-700">€{Math.round(totalRestEur).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-soft">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('ALL')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            كافة الحجوزات ({bookings.length})
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('unpaid')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
              statusFilter === 'unpaid'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            غير مدفوع
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('paid')
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            مدفوع كلي
          </button>



          {bookings.length > 0 && (
            <button
              onClick={handleWipeAll}
              title={t('wipe_all_bookings')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-black transition-all active:scale-95 flex items-center gap-1"
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

      {/* ⚠️ Operational Warning for Unpriced Bookings */}
      {unpricedBookings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-amber-950 font-bold">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm block">
                تنبيه: يوجد ({unpricedBookings.length}) حجوزات لرحلات لم يتم تسعيرها في دليل الرحلات!
              </span>
              <span className="text-[11px] text-amber-800 block mt-0.5">
                تكاليف الموردين وأرباح هذه الحجوزات مسجلة كأصفار حتى يتم تسعيرها.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            className="px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span>تسعير الرحلات الآن</span>
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
            لا توجد حجوزات مسجلة
          </h3>
        </div>
      ) : (
        <>
          <div className="space-y-2.5 lg:hidden">
            {paginated.map((b) => {
              const badge = getPaymentBadge(b)
              const name = b.guest_name || b.name || 'نزيل بدون اسم'
              const hasRest = (b.rest_eur > 0 || b.rest_egp > 0 || b.rest_usd > 0 || b.rest_gbp > 0)

              return (
                <div
                  key={b.sr}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-soft space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-sky-700">
                        #{b.sr}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{b.date}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div>
                    <div className="font-black text-xs text-slate-900">{name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-bold">
                      {b.hotel} {b.room ? `(غرفة ${b.room})` : ''} • <span className="text-slate-800">{b.trip_type}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl text-center text-xs font-mono">
                    <div>
                      <div className="text-[9px] text-slate-400 font-sans font-bold">البيع</div>
                      <div className="font-black text-slate-900">€{b.sell_eur || 0}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-sans font-bold">الربح</div>
                      <div className="font-black text-emerald-700">+€{b.profit_eur || 0}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-sans font-bold">المتبقي</div>
                      <div className={`font-black ${hasRest ? 'text-amber-700' : 'text-slate-400'}`}>
                        {b.rest_eur > 0 ? `€${b.rest_eur}` : b.rest_egp > 0 ? `${b.rest_egp} ج.م` : '€0'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-500 font-bold">
                      {(Number(b.adult) || 0) + (Number(b.child) || 0)} أفراد {b.seller ? `• ${b.seller}` : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      {hasRest && (
                        <button
                          onClick={() => handleMarkPaid(b.sr, name)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-xs transition-all active:scale-95"
                        >
                          تحصيل
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(b.sr, name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
                        title="حذف الحجز"
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
            <table className="w-full text-start border-collapse min-w-[1080px]">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-bold h-11">
                  <th className="px-3 font-mono text-start">SR</th>
                  <th className="px-3 text-start">التاريخ</th>
                  <th className="px-3 text-start">النزيل</th>
                  <th className="px-3 text-start">الفندق (الغرفة)</th>
                  <th className="px-3 text-start">الرحلة</th>
                  <th className="px-3 text-start">المندوب</th>
                  <th className="px-3 text-center">الأفراد</th>
                  <th className="px-3 text-center font-mono">البيع (€)</th>
                  <th className="px-3 text-center font-mono">التكلفة (€)</th>
                  <th className="px-3 text-center font-mono">الربح (€)</th>
                  <th className="px-3 text-center font-mono">المتبقي</th>
                  <th className="px-3 text-center">الحالة</th>
                  <th className="px-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {paginated.map((b) => {
                  const badge = getPaymentBadge(b)
                  const name = b.guest_name || b.name || 'نزيل بدون اسم'
                  const hasRest = (b.rest_eur > 0 || b.rest_egp > 0 || b.rest_usd > 0 || b.rest_gbp > 0)

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
                      <td className="px-3 font-bold text-slate-800">{b.trip_type}</td>
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
                          <span className="text-amber-700">{b.rest_egp} ج.م</span>
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
                          {hasRest && (
                            <button
                              onClick={() => handleMarkPaid(b.sr, name)}
                              className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-black shadow-xs transition-all active:scale-95"
                            >
                              تحصيل
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(b.sr, name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                            title="حذف الحجز"
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
    </div>
  )
}
