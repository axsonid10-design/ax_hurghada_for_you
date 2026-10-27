import React, { useState } from 'react'
import { X, Check, Ship, Hotel, User, DollarSign } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'

export function TripDetailsModal({ isOpen, onClose }) {
  const { addBooking, tripDefinitions } = useAXStore()

  const [formData, setFormData] = useState({
    guest_name: '',
    hotel: '',
    room: '',
    trip_type: tripDefinitions[0]?.display_name || 'Hula Hula',
    group: 'GROUP A - Sea Trips 🛥️',
    seller: 'Meghane',
    channel: '📱 Mobile App',
    adult: 2,
    child: 0,
    infant: 0,
    rest_eur: 0,
    status: 'confirmed'
  })

  if (!isOpen) return null

  const tripOptions = tripDefinitions.map((td) => ({
    value: td.sheet_name,
    label: td.display_name
  }))

  const groupOptions = [
    { value: 'GROUP A - Sea Trips 🛥️', label: 'GROUP A - Sea Trips 🛥️' },
    { value: 'Safari & Desert 🏎️', label: 'Safari & Desert 🏎️' },
    { value: 'Cash Pickup 💰', label: 'Cash Pickup 💰' }
  ]

  const sellerOptions = [
    { value: 'Meghane', label: 'Meghane' },
    { value: 'Laure', label: 'Laure' },
    { value: 'Laly', label: 'Laly' },
    { value: 'Sales Team', label: 'Sales Team' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.guest_name || !formData.hotel) return

    soundManager.playSuccess()
    const newSr = String(Math.floor(100000 + Math.random() * 900000))
    addBooking({
      ...formData,
      sr: newSr,
      date: new Date().toISOString().split('T')[0],
      time: '08:30'
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-black text-[#0a2540] flex items-center gap-2">
            <Ship className="w-5 h-5 text-[#0284c7]" />
            <span>تسجيل حجز رحلة جديدة</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">اسم النزيل / العميل</label>
            <input
              type="text"
              required
              value={formData.guest_name}
              onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              placeholder="مثال: Chloe Lestic"
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">اسم الفندق</label>
              <input
                type="text"
                required
                value={formData.hotel}
                onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                placeholder="مثال: The Grand Resort"
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">رقم الغرفة</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="مثال: 3429"
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AX_SearchableSelect
              label="نوع الرحلة"
              value={formData.trip_type}
              options={tripOptions}
              onChange={(val) => setFormData({ ...formData, trip_type: val })}
            />
            <AX_SearchableSelect
              label="المجموعة"
              value={formData.group}
              options={groupOptions}
              onChange={(val) => setFormData({ ...formData, group: val })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">بالغ (Adult)</label>
              <input
                type="number"
                min="1"
                value={formData.adult}
                onChange={(e) => setFormData({ ...formData, adult: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">طفل (Child)</label>
              <input
                type="number"
                min="0"
                value={formData.child}
                onChange={(e) => setFormData({ ...formData, child: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">رضيع (Infant)</label>
              <input
                type="number"
                min="0"
                value={formData.infant}
                onChange={(e) => setFormData({ ...formData, infant: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">المتبقي يورو (€)</label>
              <input
                type="number"
                min="0"
                value={formData.rest_eur}
                onChange={(e) => setFormData({ ...formData, rest_eur: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>
            <AX_SearchableSelect
              label="المندوب"
              value={formData.seller}
              options={sellerOptions}
              onChange={(val) => setFormData({ ...formData, seller: val })}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-[#38bdf8]" />
              <span>حفظ وتأكيد الحجز</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
