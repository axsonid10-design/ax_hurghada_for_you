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
import { soundManager } from '../../utils/soundEffects'

export function BookingsManagement({ onOpenNewBooking }) {
  const { bookings, deleteBooking, openConfirmModal } = useAXStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter
    const matchSearch =
      b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.hotel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.sr.includes(searchTerm)
    return matchStatus && matchSearch
  })

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
              setStatusFilter('confirmed')
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              statusFilter === 'confirmed'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            معلقة السداد
          </button>
          <button
            onClick={() => {
              soundManager.playClick()
              setStatusFilter('paid')
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            مسددة بالكامل
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو الفندق أو الـ SR..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full pr-9 pl-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Bookings Bento List for Mobile */}
      <div className="space-y-3 lg:hidden">
        {filtered.map((b) => (
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

      {/* Bookings Full Canvas Table for Desktop */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#0a2540] text-white text-xs font-bold">
              <th className="py-3.5 px-4 font-mono">SR</th>
              <th className="py-3.5 px-4">التاريخ</th>
              <th className="py-3.5 px-4">النزيل</th>
              <th className="py-3.5 px-4">الفندق والغرفة</th>
              <th className="py-3.5 px-4">الرحلة</th>
              <th className="py-3.5 px-4 text-center">الأفراد</th>
              <th className="py-3.5 px-4 text-left font-mono">المتبقي (€)</th>
              <th className="py-3.5 px-4 text-center">حذف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map((b) => (
              <tr key={b.sr} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-[#0284c7]">
                  #{b.sr}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">{b.date}</td>
                <td className="py-3.5 px-4 font-black text-[#0a2540]">
                  {b.guest_name}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-800">{b.hotel}</div>
                  <div className="text-[11px] text-slate-400">غرفة: {b.room}</div>
                </td>
                <td className="py-3.5 px-4">{b.trip_type}</td>
                <td className="py-3.5 px-4 text-center font-mono">
                  {b.adult + b.child}
                </td>
                <td className="py-3.5 px-4 text-left font-mono font-bold text-emerald-600">
                  €{b.rest_eur}
                </td>
                <td className="py-3.5 px-4 text-center">
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
    </div>
  )
}
