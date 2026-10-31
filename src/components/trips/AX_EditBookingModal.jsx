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
  FileText,
  Plus,
  Minus
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { computeBookingFinancials } from '../../data/initialSetup'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'

export function AX_EditBookingModal({ isOpen, booking, onClose }) {
  const { tripDefinitions, executors, bookings, updateBooking } = useAXStore()

  const initialName = booking?.guest_name || booking?.name || ''
  const initialTrip = booking?.trip_type || booking?.trip || ''

  const [formData, setFormData] = useState({
    name: initialName,
    hotel: booking?.hotel || '',
    room: booking?.room || '',
    date: booking?.date || '',
    trip: initialTrip,
    executor_id: booking?.executor_id || '',
    seller: booking?.seller || '',
    adult: Number(booking?.adult) || 0,
    child: Number(booking?.child) || 0,
    infant: Number(booking?.infant) || 0,
    extra_cost_eur: Number(booking?.extra_cost_eur) || 0,
    collected_eur: Number(booking?.collected_eur) || 0,
    rest_eur: Number(booking?.rest_eur) || 0,
    rest_egp: Number(booking?.rest_egp) || 0,
    rest_usd: Number(booking?.rest_usd) || 0,
    rest_gbp: Number(booking?.rest_gbp) || 0,
    notes: booking?.notes || ''
  })

  const tripOptions = useMemo(() => {
    const list = tripDefinitions.map((t) => ({
      value: t.sheet_name || t.display_name,
      label: t.display_name || t.sheet_name
    }))
    if (formData.trip && !list.some((o) => o.value === formData.trip)) {
      list.unshift({ value: formData.trip, label: formData.trip })
    }
    return list
  }, [tripDefinitions, formData.trip])

  const executorOptions = useMemo(() => {
    return [
      { value: '', label: 'بدون منفذ (غير محدد)' },
      ...executors.map((ex) => ({
        value: ex.id,
        label: `${ex.name} (${ex.category || 'عام'})`
      }))
    ]
  }, [executors])

  const hotelOptions = useMemo(() => {
    const hotelSet = new Set()
    bookings.forEach((b) => {
      const h = (b.hotel || '').trim()
      if (h) hotelSet.add(h)
    })
    if (formData.hotel && formData.hotel.trim()) {
      hotelSet.add(formData.hotel.trim())
    }
    return Array.from(hotelSet).map((h) => ({ value: h, label: h }))
  }, [bookings, formData.hotel])

  const liveBaseFin = useMemo(() => {
    if (!booking) return { cost_eur: 0, sell_eur: 0 }
    return computeBookingFinancials(
      {
        ...booking,
        ...formData,
        trip_type: formData.trip,
        trip: formData.trip
      },
      tripDefinitions,
      executors
    )
  }, [formData, booking, tripDefinitions, executors])

  const extraCost = Number(formData.extra_cost_eur) || 0
  const computedSell = Number(liveBaseFin.sell_eur || 0)
  const finalSell = computedSell > 0 ? computedSell : (Number(booking?.sell_eur) || 0)
  const computedCost = Number(liveBaseFin.cost_eur || 0)
  const baseCost = computedCost > 0 ? computedCost : (Number(booking?.cost_eur) || 0)
  const finalCost = baseCost + extraCost
  const finalProfit = finalSell - finalCost
  const totalPax = (Number(formData.adult) || 0) + (Number(formData.child) || 0) + (Number(formData.infant) || 0)

  if (!isOpen || !booking) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    soundManager.playSuccess()
    updateBooking(booking.sr, {
      ...formData,
      guest_name: formData.name,
      name: formData.name,
      trip_type: formData.trip,
      trip: formData.trip,
      cost_eur: finalCost,
      sell_eur: finalSell,
      profit_eur: finalProfit,
      extra_cost_eur: extraCost,
      is_edited: true
    })
    onClose()
  }

  const adjustPax = (field, delta) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, (Number(prev[field]) || 0) + delta)
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/65 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center font-bold">
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
                تعديل الأفراد والمنفذ والرحلة وتكلفة الإضافة مع إعادة احتساب الأرباح فورياً
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
                placeholder="اسم النزيل"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>تاريخ الرحلة</span>
              </label>
              <AX_CompanyDatePicker
                value={formData.date}
                onChange={(d) => setFormData({ ...formData, date: d })}
                placeholder="تاريخ الرحلة"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                <span>نوع الرحلة</span>
              </label>
              <AX_SearchableSelect
                value={formData.trip}
                onChange={(val) => setFormData({ ...formData, trip: val })}
                options={tripOptions}
                placeholder="اختر الرحلة..."
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                <span>الشركة المنفذة</span>
              </label>
              <AX_SearchableSelect
                value={formData.executor_id}
                onChange={(val) => setFormData({ ...formData, executor_id: val })}
                options={executorOptions}
                placeholder="اختر المنفذ..."
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5 text-sky-600" />
                <span>الفندق</span>
              </label>
              <AX_SearchableSelect
                value={formData.hotel}
                onChange={(val) => setFormData({ ...formData, hotel: val })}
                options={hotelOptions}
                placeholder="اختر الفندق..."
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
                placeholder="رقم الغرفة"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>مندوب البيع (Seller)</span>
              </label>
              <input
                type="text"
                value={formData.seller}
                onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                placeholder="اسم المندوب"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>توزيع الأفراد (PAX)</span>
              </span>
              <span className="text-[10px] font-mono font-black text-[#0284c7] bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                إجمالي الأفراد: {totalPax} فرد
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center space-y-1.5">
                <span className="text-[10px] font-black text-slate-600 block">بالغين (Adult)</span>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => adjustPax('adult', -1)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black transition-all active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-black text-sm text-[#0a2540]">{formData.adult}</span>
                  <button
                    type="button"
                    onClick={() => adjustPax('adult', 1)}
                    className="w-7 h-7 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-black transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center space-y-1.5">
                <span className="text-[10px] font-black text-slate-600 block">أطفال (Child)</span>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => adjustPax('child', -1)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black transition-all active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-black text-sm text-[#0a2540]">{formData.child}</span>
                  <button
                    type="button"
                    onClick={() => adjustPax('child', 1)}
                    className="w-7 h-7 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-black transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center space-y-1.5">
                <span className="text-[10px] font-black text-slate-600 block">رضع (Infant)</span>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => adjustPax('infant', -1)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black transition-all active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-black text-sm text-[#0a2540]">{formData.infant}</span>
                  <button
                    type="button"
                    onClick={() => adjustPax('infant', 1)}
                    className="w-7 h-7 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-black transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>التحصيل والمتبقي والتكلفة الإضافية</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">تكلفة إضافية (€)</span>
                <input
                  type="number"
                  step="any"
                  value={formData.extra_cost_eur}
                  onChange={(e) => setFormData({ ...formData, extra_cost_eur: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-amber-800"
                  placeholder="0.00"
                />
              </div>
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

          <div className="bg-[#0a2540]/5 rounded-2xl p-3 border border-slate-200/60 flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="font-bold text-slate-600">احتساب فوري:</span>
            <div className="flex items-center gap-3 font-mono text-[11px] flex-wrap">
              <span>تكلفة: <strong className="text-slate-900">{finalCost.toFixed(1)} €</strong></span>
              <span>بيع: <strong className="text-slate-900">{finalSell.toFixed(1)} €</strong></span>
              <span className={`px-2 py-0.5 rounded-full font-black ${
                finalProfit >= 0 ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
              }`}>
                ربح: {finalProfit >= 0 ? `+${finalProfit.toFixed(1)}` : finalProfit.toFixed(1)} €
              </span>
            </div>
          </div>
        </form>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
