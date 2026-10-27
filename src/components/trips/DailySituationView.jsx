import React, { useState } from 'react'
import {
  Ship,
  Users,
  Euro,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Download,
  Hotel,
  MapPin,
  Sailboat,
  AlertCircle,
  Truck,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { soundManager } from '../../utils/soundEffects'

export function DailySituationView({ onOpenNewBooking, onOpenUploadModal }) {
  const {
    bookings,
    selectedDate,
    setSelectedDate,
    updateBooking,
    openConfirmModal,
    executors,
    tripDefinitions
  } = useAXStore()

  const [filterTripType, setFilterTripType] = useState('ALL')
  const [filterExecutor, setFilterExecutor] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const dailyBookings = bookings.filter((b) => b.date === selectedDate)

  const filteredBookings = dailyBookings.filter((b) => {
    const matchesTrip = filterTripType === 'ALL' || b.trip_type === filterTripType
    const matchesExec = filterExecutor === 'ALL' || b.executor_id === filterExecutor
    const matchesSearch =
      b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sr.includes(searchQuery) ||
      b.room.includes(searchQuery) ||
      b.seller.toLowerCase().includes(searchQuery.toLowerCase())
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

  const totalRestEur = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_eur) || 0), 0)
  const totalRestEgp = filteredBookings.reduce((sum, b) => sum + (Number(b.rest_egp) || 0), 0)

  // Unique trip types for filter
  const uniqueTrips = Array.from(new Set(dailyBookings.map((b) => b.trip_type)))

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
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-48">
            <AX_CompanyDatePicker
              value={selectedDate}
              onChange={(d) => setSelectedDate(d)}
              placeholder="تاريخ اليومية"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterTripType}
              onChange={(e) => setFilterTripType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            >
              <option value="ALL">جميع أنواع الرحلات ({uniqueTrips.length})</option>
              {uniqueTrips.map((tt) => (
                <option key={tt} value={tt}>
                  {tt}
                </option>
              ))}
            </select>

            <select
              value={filterExecutor}
              onChange={(e) => setFilterExecutor(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            >
              <option value="ALL">جميع المنفذين</option>
              {executors.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الفندق، الغرفة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pr-9 pl-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenUploadModal?.()
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex-shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>رفع شيت</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              onOpenNewBooking?.()
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>حجز جديد</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Banner - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">إجمالي الأفراد (PAX)</div>
            <div className="text-lg font-black text-[#0a2540] font-mono">
              {totalPax} <span className="text-xs font-normal text-slate-500">({totalAdults} كبار / {totalChildren} طفل)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-soft flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Euro className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">إجمالي المبيعات (€)</div>
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
            <div className="text-[11px] font-bold text-slate-400">تكاليف المنفذين</div>
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
            <div className="text-[11px] font-bold text-slate-400">صافي الأرباح اليوم</div>
            <div className="text-lg font-black text-[#0a2540] font-mono">
              €{totalProfitEur.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bento Cards View (lg:hidden) */}
      <div className="space-y-3 lg:hidden">
        {filteredBookings.map((b) => {
          const executor = executors.find((ex) => ex.id === b.executor_id)

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
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    b.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {b.status === 'paid' ? 'مسدد' : 'متبقي تحصيل'}
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

                {b.status !== 'paid' && (b.rest_eur > 0 || b.rest_egp > 0) && (
                  <button
                    onClick={() => handleMarkPaid(b.sr)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
                  >
                    تحصيل المبلغ
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Wide Table (hidden lg:block) - Full Canvas */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#0a2540] text-white text-xs font-bold">
              <th className="py-3.5 px-4 font-mono">SR</th>
              <th className="py-3.5 px-4">اسم النزيل</th>
              <th className="py-3.5 px-4">الفندق والغرفة</th>
              <th className="py-3.5 px-4">نوع الرحلة</th>
              <th className="py-3.5 px-4">المنفذ المسند</th>
              <th className="py-3.5 px-4 text-center">الأفراد (PAX)</th>
              <th className="py-3.5 px-4 text-center font-mono">البيع (€)</th>
              <th className="py-3.5 px-4 text-center font-mono">التكلفة (€)</th>
              <th className="py-3.5 px-4 text-center font-mono">الربح (€)</th>
              <th className="py-3.5 px-4 text-left font-mono">المتبقي (€)</th>
              <th className="py-3.5 px-4 text-center">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredBookings.map((b) => {
              const executor = executors.find((ex) => ex.id === b.executor_id)

              return (
                <tr key={b.sr} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0284c7]">
                    #{b.sr}
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#0a2540]">
                    {b.guest_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{b.hotel}</div>
                    <div className="text-[11px] text-slate-400">غرفة: {b.room}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {b.trip_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-bold">
                    {executor?.name || 'مارينا'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    {b.adult} <span className="text-[10px] text-slate-400 font-normal">بالغ</span>
                    {b.child > 0 && (
                      <span className="text-amber-600 mr-1">
                        + {b.child} <span className="text-[10px] text-slate-400 font-normal">طفل</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                    €{b.sell_eur}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-700">
                    €{b.cost_eur}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-600">
                    €{b.profit_eur}
                  </td>
                  <td className="py-3.5 px-4 text-left font-mono font-bold text-sm">
                    {b.rest_eur > 0 ? (
                      <span className="text-rose-600">€{b.rest_eur}</span>
                    ) : (
                      <span className="text-slate-400 font-normal text-xs">مسدد بالكامل</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {b.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        مسدد
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(b.sr)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
                      >
                        تحصيل
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
