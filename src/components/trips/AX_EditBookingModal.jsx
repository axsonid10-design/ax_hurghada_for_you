import React, { useState, useMemo } from 'react'
import {
  X,
  Edit3,
  Save,
  CheckCircle2,
  Calendar,
  User,
  Building,
  Key,
  Users,
  Compass,
  Briefcase,
  DollarSign,
  AlertCircle,
  FileText
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { computeBookingFinancials } from '../../data/initialSetup'

export function AX_EditBookingModal({ isOpen, booking, onClose }) {
  const { tripDefinitions, executors, updateBooking } = useAXStore()

  if (!isOpen || !booking) return null

  const [formData, setFormData] = useState({
    name: booking.name || '',
    hotel: booking.hotel || '',
    room: booking.room || '',
    date: booking.date || '',
    trip: booking.trip || '',
    executor_id: booking.executor_id || '',
    seller: booking.seller || '',
    adult: Number(booking.adult) || 0,
    child: Number(booking.child) || 0,
    infant: Number(booking.infant) || 0,
    collected_eur: Number(booking.collected_eur) || 0,
    rest_eur: Number(booking.rest_eur) || 0,
    rest_egp: Number(booking.rest_egp) || 0,
    rest_usd: Number(booking.rest_usd) || 0,
    rest_gbp: Number(booking.rest_gbp) || 0,
    notes: booking.notes || ''
  })

  const liveFinancials = useMemo(() => {
    return computeBookingFinancials(
      {
        ...booking,
        ...formData,
        trip_type: formData.trip
      },
      tripDefinitions,
      executors
    )
  }, [formData, booking, tripDefinitions, executors])

  const totalPax = (Number(formData.adult) || 0) + (Number(formData.child) || 0) + (Number(formData.infant) || 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    soundManager.playSuccess()
    updateBooking(booking.sr, {
      ...formData,
      ...liveFinancials,
      is_edited: true
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/65 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0a2540] flex items-center gap-2">
                <span>تعديل حجز SR #{booking.sr}</span>
                {booking.is_edited && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                    معدّل مسبقاً
                  </span>
                )}
              </h3>
              <p className="text-[11px] font-bold text-slate-400">
                تعديل الأفراد والمنفذ والرحلة مع إعادة احتساب التكاليف والأرباح فورياً
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick()
              onClose()
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>اسم النزيل</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>تاريخ الرحلة</span>
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5 text-sky-600" />
                <span>الفندق</span>
              </label>
              <input
                type="text"
                value={formData.hotel}
                onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <Key className="w-3.5 h-3.5 text-sky-600" />
                <span>رقم الغرفة</span>
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                <span>نوع الرحلة</span>
              </label>
              <input
                type="text"
                value={formData.trip}
                onChange={(e) => setFormData({ ...formData, trip: e.target.value })}
                list="trip-definitions-list"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                required
              />
              <datalist id="trip-definitions-list">
                {tripDefinitions.map((t) => (
                  <option key={t.id} value={t.sheet_name || t.display_name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                <span>الشركة المنفذة</span>
              </label>
              <select
                value={formData.executor_id}
                onChange={(e) => setFormData({ ...formData, executor_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              >
                <option value="">غير محدد</option>
                {executors.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>مندوب البيع (Seller)</span>
              </label>
              <input
                type="text"
                value={formData.seller}
                onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] font-black text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>توزيع الأفراد (PAX)</span>
              </span>
              <span className="text-[10px] font-mono font-black text-[#0284c7] bg-sky-100 px-2 py-0.5 rounded-full">
                إجمالي: {totalPax} فرد
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">بالغين (Adult)</span>
                <input
                  type="number"
                  min="0"
                  value={formData.adult}
                  onChange={(e) => setFormData({ ...formData, adult: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">أطفال (Child)</span>
                <input
                  type="number"
                  min="0"
                  value={formData.child}
                  onChange={(e) => setFormData({ ...formData, child: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">رضع (Infant)</span>
                <input
                  type="number"
                  min="0"
                  value={formData.infant}
                  onChange={(e) => setFormData({ ...formData, infant: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>التحصيل والمتبقي بالعملات</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">محصل (€ EUR)</span>
                <input
                  type="number"
                  step="any"
                  value={formData.collected_eur}
                  onChange={(e) => setFormData({ ...formData, collected_eur: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">متبقي (€ EUR)</span>
                <input
                  type="number"
                  step="any"
                  value={formData.rest_eur}
                  onChange={(e) => setFormData({ ...formData, rest_eur: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">متبقي (EGP ج.م)</span>
                <input
                  type="number"
                  step="any"
                  value={formData.rest_egp}
                  onChange={(e) => setFormData({ ...formData, rest_egp: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">متبقي ($ USD)</span>
                <input
                  type="number"
                  step="any"
                  value={formData.rest_usd}
                  onChange={(e) => setFormData({ ...formData, rest_usd: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0a2540]/5 rounded-2xl p-3 border border-slate-200/60 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">احتساب فوري:</span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>تكلفة: <strong className="text-slate-900">{liveFinancials.cost_eur.toFixed(1)} €</strong></span>
              <span>بيع: <strong className="text-slate-900">{liveFinancials.sell_eur.toFixed(1)} €</strong></span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-black">
                ربح: +{liveFinancials.profit_eur.toFixed(1)} €
              </span>
            </div>
          </div>
        </form>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-sky-400" />
            <span>حفظ التعديلات وتحديث اليومية</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              onClose()
            }}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs transition-all active:scale-95"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
