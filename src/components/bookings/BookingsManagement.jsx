import React, { useState } from 'react'
import { Search, Trash2, CheckCircle2, AlertCircle, Eye, Calendar, Hotel, User, DollarSign } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_PaginationBar } from '../common/AX_PaginationBar'
import { soundManager } from '../../utils/soundEffects'

export function BookingsManagement() {
  const { bookings, deleteBooking, openConfirmModal, t } = useAXStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      (b.guest_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.hotel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.trip_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.sr || '').includes(searchTerm) ||
      String(b.room || '').includes(searchTerm)

    const isPaid = (b.rest_eur === 0 && b.rest_egp === 0 && b.rest_usd === 0 && b.rest_gbp === 0)
    let matchesStatus = true
    if (statusFilter === 'paid') matchesStatus = isPaid
    if (statusFilter === 'unpaid') matchesStatus = !isPaid

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getPaymentBadge = (b) => {
    const hasRest = (b.rest_eur > 0 || b.rest_egp > 0 || b.rest_usd > 0 || b.rest_gbp > 0)
    if (!hasRest) {
      return {
        text: t('status_paid'),
        className: 'bg-emerald-100 text-emerald-800'
      }
    }
    if (b.rest_eur < (b.sell_eur || 0)) {
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

  const handleDelete = (sr, name) => {
    openConfirmModal({
      title: 'حذف الحجز',
      message: `هل أنت متأكد من حذف حجز النزيل ${name} (SR: ${sr}) نهائياً؟`,
      confirmText: 'نعم، حذف الحجز',
      type: 'danger',
      onConfirm: () => {
        soundManager.playAlert()
        deleteBooking(sr)
      }
    })
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('ALL')
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#0f172a] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('tab_bookings')} ({bookings.length})
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('unpaid')
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
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
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('status_paid')}
          </button>
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
            className="w-full bg-slate-50 border border-slate-200 rounded-full pr-10 pl-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
        </div>
      </div>

      {/* Bookings Bento List for Mobile */}
      <div className="space-y-3 lg:hidden">
        {paginated.map((b) => {
          const badge = getPaymentBadge(b)
          return (
            <div
              key={b.sr}
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#0284c7]">
                    #{b.sr}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{b.date}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                  {badge.text}
                </span>
              </div>

              <div>
                <div className="font-black text-slate-800">{b.guest_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {b.hotel} - غرفة {b.room} • <span className="font-bold text-slate-700">{b.trip_type}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl text-center text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">{t('th_sell')}</div>
                  <div className="font-black text-slate-800">€{b.sell_eur || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">{t('th_profit')}</div>
                  <div className="font-black text-emerald-600">+€{b.profit_eur || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">المتبقي</div>
                  <div className={`font-black ${b.rest_eur > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    €{b.rest_eur || 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-bold">
                  {b.adult + b.child} أفراد
                </span>
                <button
                  onClick={() => handleDelete(b.sr, b.guest_name)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bookings Table with Smooth Horizontal Scroll (Rule 16 + Correct Columns) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-soft overflow-x-auto overflow-y-hidden w-full max-w-full">
        <table className="w-full text-start border-collapse min-w-[1080px]">
          <thead>
            <tr className="bg-[#0f172a] text-white text-xs font-bold h-11">
              <th className="px-3 font-mono text-start">{t('th_sr')}</th>
              <th className="px-3 text-start">{t('th_date')}</th>
              <th className="px-3 text-start">{t('th_guest')}</th>
              <th className="px-3 text-start">{t('th_hotel_room')}</th>
              <th className="px-3 text-start">{t('th_trip')}</th>
              <th className="px-3 text-center">{t('th_pax')}</th>
              <th className="px-3 text-center font-mono">{t('th_sell')}</th>
              <th className="px-3 text-center font-mono">{t('th_cost')}</th>
              <th className="px-3 text-center font-mono">{t('th_profit')}</th>
              <th className="px-3 text-center font-mono">المتبقي (€)</th>
              <th className="px-3 text-center">{t('th_payment_status')}</th>
              <th className="px-3 text-center">{t('th_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {paginated.map((b) => {
              const badge = getPaymentBadge(b)
              return (
                <tr key={b.sr} className="h-11 hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                  <td className="px-3 font-mono font-bold text-[#0284c7]">
                    #{b.sr}
                  </td>
                  <td className="px-3 font-mono text-slate-500">{b.date}</td>
                  <td className="px-3 font-black text-[#0a2540] max-w-[150px] truncate" title={b.guest_name}>
                    {b.guest_name}
                  </td>
                  <td className="px-3 text-slate-700 max-w-[180px] truncate" title={`${b.hotel} (${b.room})`}>
                    <span className="font-bold">{b.hotel}</span> <span className="text-slate-400 font-mono">({b.room})</span>
                  </td>
                  <td className="px-3 font-bold text-slate-800">{b.trip_type}</td>
                  <td className="px-3 text-center font-mono font-bold">
                    {b.adult + b.child}
                  </td>
                  <td className="px-3 text-center font-mono font-bold text-slate-800">
                    €{b.sell_eur || 0}
                  </td>
                  <td className="px-3 text-center font-mono font-bold text-slate-500">
                    €{b.cost_eur || 0}
                  </td>
                  <td className="px-3 text-center font-mono font-black text-emerald-600">
                    +€{b.profit_eur || 0}
                  </td>
                  <td className={`px-3 text-center font-mono font-black ${b.rest_eur > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    €{b.rest_eur || 0}
                  </td>
                  <td className="px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-3 text-center">
                    <button
                      onClick={() => handleDelete(b.sr, b.guest_name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                      title="حذف الحجز"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
      />
    </div>
  )
}
