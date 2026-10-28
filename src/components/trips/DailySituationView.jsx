import React, { useState } from 'react'
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
  FileSpreadsheet
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { AX_PaginationBar } from '../common/AX_PaginationBar'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'
import { soundManager } from '../../utils/soundEffects'

export function DailySituationView({ onOpenUploadModal }) {
  const {
    bookings,
    selectedDate,
    setSelectedDate,
    updateBooking,
    openConfirmModal,
    executors,
    t
  } = useAXStore()

  const [filterTripType, setFilterTripType] = useState('ALL')
  const [filterExecutor, setFilterExecutor] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const dailyBookings = bookings.filter((b) => b.date === selectedDate)

  const filteredBookings = dailyBookings.filter((b) => {
    const matchesTrip = filterTripType === 'ALL' || b.trip_type === filterTripType
    const matchesExec = filterExecutor === 'ALL' || b.executor_id === filterExecutor
    const matchesSearch =
      (b.guest_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.hotel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b.sr || '').includes(searchQuery) ||
      String(b.room || '').includes(searchQuery) ||
      (b.seller || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTrip && matchesExec && matchesSearch
  })

  // Aggregations
  const totalBookings = filteredBookings.length
  const totalAdults = filteredBookings.reduce((sum, b) => sum + (Number(b.adult) || 0), 0)
  const totalChildren = filteredBookings.reduce((sum, b) => sum + (Number(b.child) || 0), 0)
  const totalInfants = filteredBookings.reduce((sum, b) => sum + (Number(b.infant) || 0), 0)
  const totalPax = totalAdults + totalChildren + totalInfants

  const totalSalesEur = filteredBookings.reduce((sum, b) => sum + (Number(b.sell_eur) || 0), 0)
  const totalCostEur = filteredBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
  const totalProfitEur = totalSalesEur - totalCostEur

  // Pagination calculation
  const totalPages = Math.ceil(totalBookings / pageSize) || 1
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Unique trip types for filter
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
      title: 'تأكيد تحصيل المبلغ',
      message: `هل تم استلام كامل المبلغ المتبقي للحجز رقم ${sr}؟`,
      confirmText: 'تأكيد التحصيل',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-center">
          {/* Date Picker */}
          <div>
            <AX_CompanyDatePicker
              value={selectedDate}
              onChange={(d) => {
                setSelectedDate(d)
                setCurrentPage(1)
              }}
              placeholder={t('daily_date')}
            />
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
                ...executors.map((ex) => ({ value: ex.id, label: ex.name }))
              ]}
            />
          </div>

          {/* Upload Button */}
          <div>
            <button
              onClick={() => {
                soundManager.playClick()
                onOpenUploadModal?.()
              }}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>{t('upload_sheet')}</span>
            </button>
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

      {/* Bento Stats Banner - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">{t('total_pax')}</div>
            <div className="text-lg font-black text-[#0a2540] font-mono">
              {totalPax} <span className="text-xs font-normal text-slate-500">({totalAdults} ك / {totalChildren} ص)</span>
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

      {/* Empty State Banner if no bookings exist for this date */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            لا توجد حجوزات مسجلة لهذا التاريخ ({selectedDate})
          </h3>
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => {
                soundManager.playClick()
                onOpenUploadModal()
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>رفع ملف إكسيل</span>
            </button>
          </div>
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
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#0a2540] text-[#38bdf8] font-mono">
                    #{b.sr}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{b.trip_type}</span>
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
                    <span className="font-bold">غرفة: {b.room}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    المنفذ: <span className="font-bold text-slate-700">{executor?.name || 'مارينا'}</span>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <div className="text-xs text-slate-400 font-sans">الأفراد</div>
                  <div className="text-sm font-bold text-slate-800">
                    {b.adult} بالغ {b.child > 0 ? `+ ${b.child} طفل` : ''}
                  </div>
                </div>
              </div>

              {/* Financial bar */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans ml-1">البيع:</span>
                  <span className="font-bold text-slate-800">€{b.sell_eur}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">التكلفة:</span>
                  <span className="font-bold text-amber-700">€{b.cost_eur}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans ml-1">الربح:</span>
                  <span className="font-black text-emerald-600">€{b.profit_eur}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="text-xs">
                  <span className="text-slate-400 ml-1">المتبقي:</span>
                  <span className="font-black font-mono text-rose-600 text-sm">
                    €{b.rest_eur}
                  </span>
                  {b.rest_egp > 0 && (
                    <span className="text-[10px] text-slate-500 mr-1">
                      + {b.rest_egp} ج.م
                    </span>
                  )}
                </div>

                {badge.text !== t('status_paid') && (
                  <button
                    onClick={() => handleMarkPaid(b.sr)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
                  >
                    {t('collect')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Single-Line Table with SMOOTH HORIZONTAL SCROLL (Rule 16 + Scroll fix) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-soft overflow-x-auto overflow-y-hidden w-full max-w-full">
        <table className="w-full text-start border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-[#0f172a] text-white text-xs font-bold h-11">
              <th className="px-3 font-mono text-start">{t('th_sr')}</th>
              <th className="px-3 text-start">{t('th_guest')}</th>
              <th className="px-3 text-start">{t('th_hotel_room')}</th>
              <th className="px-3 text-start">{t('th_trip')}</th>
              <th className="px-3 text-start">{t('th_executor')}</th>
              <th className="px-3 text-center">{t('th_pax')}</th>
              <th className="px-3 text-center font-mono">{t('th_sell')}</th>
              <th className="px-3 text-center font-mono">{t('th_cost')}</th>
              <th className="px-3 text-center font-mono">{t('th_profit')}</th>
              <th className="px-3 text-center">{t('th_payment_status')}</th>
              <th className="px-3 text-center">{t('th_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {paginatedBookings.map((b) => {
              const executor = executors.find((ex) => ex.id === b.executor_id)
              const badge = getPaymentBadge(b)

              return (
                <tr key={b.sr} className="h-11 hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                  <td className="px-3 font-mono font-bold text-[#0284c7]">
                    #{b.sr}
                  </td>
                  <td className="px-3 font-black text-[#0a2540] max-w-[150px] truncate" title={b.guest_name}>
                    {b.guest_name}
                  </td>
                  <td className="px-3 text-slate-700 max-w-[180px] truncate" title={`${b.hotel} (${b.room})`}>
                    <span className="font-bold">{b.hotel}</span> <span className="text-slate-400 font-mono">({b.room})</span>
                  </td>
                  <td className="px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {b.trip_type}
                    </span>
                  </td>
                  <td className="px-3 text-slate-600 font-bold">
                    {executor?.name || 'مارينا'}
                  </td>
                  <td className="px-3 text-center font-mono font-bold">
                    {b.adult} ك {b.child > 0 ? `+ ${b.child} ص` : ''}
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
                  <td className="px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                      {badge.text === t('status_paid') && <CheckCircle2 className="w-3 h-3" />}
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-3 text-center">
                    {badge.text !== t('status_paid') ? (
                      <button
                        onClick={() => handleMarkPaid(b.sr)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
                      >
                        {t('collect')}
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
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
    </div>
  )
}
