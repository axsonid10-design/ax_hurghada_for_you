import React, { useState } from 'react'
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Euro,
  Hotel,
  User,
  ArrowUpDown
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_PaginationBar } from '../common/AX_PaginationBar'
import { soundManager } from '../../utils/soundEffects'

export function BookingsManagement({ onOpenNewBooking }) {
  const { bookings, deleteBooking, openConfirmModal } = useAXStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const filtered = bookings.filter((b) => {
    const isPaid = (b.rest_eur === 0 && b.rest_egp === 0 && b.rest_usd === 0 && b.rest_gbp === 0)
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'paid' && isPaid) ||
      (statusFilter === 'unpaid' && !isPaid)
    const matchSearch =
      (b.guest_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.hotel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.sr || '').includes(searchTerm)
    return matchStatus && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
                ? 'bg-[#0a2540] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            جميع الحجوزات ({bookings.length})
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('unpaid')
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              statusFilter === 'unpaid'
                ? 'bg-amber-600 text-white'
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
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            مدفوع كلي
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
            placeholder="بحث بالاسم أو الفندق أو الـ SR..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full pr-9 pl-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Bookings Bento List for Mobile */}
      <div className="space-y-3 lg:hidden">
        {paginated.map((b) => (
          <div
            key={b.sr}
            className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-[#0284c7]">
                #{b.sr}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{b.date}</span>
            </div>
            <div className="font-black text-[#0a2540]">{b.guest_name}</div>
            <div className="text-xs text-slate-500">
              {b.hotel} - غرفة {b.room}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-emerald-600 font-mono">
                €{b.rest_eur}
              </span>
              <button
                onClick={() => handleDelete(b.sr, b.guest_name)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings Single-Line Table for Desktop (Rule 16: h-11 Rows) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#0a2540] text-white text-xs font-bold h-11">
              <th className="px-3 font-mono">SR</th>
              <th className="px-3">التاريخ</th>
              <th className="px-3">النزيل</th>
              <th className="px-3">الفندق (الغرفة)</th>
              <th className="px-3">الرحلة</th>
              <th className="px-3 text-center">الأفراد</th>
              <th className="px-3 text-center font-mono">المتبقي (€)</th>
              <th className="px-3 text-center">حذف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {paginated.map((b) => (
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
                <td className="px-3">{b.trip_type}</td>
                <td className="px-3 text-center font-mono font-bold">
                  {b.adult + b.child}
                </td>
                <td className="px-3 text-center font-mono font-bold text-emerald-600">
                  €{b.rest_eur}
                </td>
                <td className="px-3 text-center">
                  <button
                    onClick={() => handleDelete(b.sr, b.guest_name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
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
