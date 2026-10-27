import React, { useState } from 'react'
import { X, Check, Truck, Phone, Tag } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'

export function QuickAddExecutorModal({ isOpen, onClose, onCreated }) {
  const { addExecutor } = useAXStore()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'رحلات بحرية وجزر',
    notes: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    soundManager.playSuccess()
    const newId = 'exec_' + Date.now()
    const newExecutor = {
      id: newId,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      category: formData.category,
      notes: formData.notes.trim(),
      total_paid: 0
    }

    addExecutor(newExecutor)
    if (onCreated) onCreated(newExecutor)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0a2540]/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative animate-scaleUp">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h4 className="text-sm font-black text-[#0a2540] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#0284c7]" />
            <span>إضافة منفذ / موزع جديد</span>
          </h4>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">اسم المنفذ / الشركة</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: يخت السلطانة رويال"
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">رقم الهاتف / التواصل</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="مثال: 01012345678"
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">تصنيف النشاط</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            >
              <option value="رحلات بحرية وجزر">رحلات بحرية وجزر 🛥️</option>
              <option value="سفاري ومغامرات">سفاري ومغامرات 🏎️</option>
              <option value="غوص ودولفين هاوس">غوص ودولفين هاوس 🐬</option>
              <option value="نقل وخدمات خاصة">نقل وخدمات خاصة 🚐</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">ملاحظات</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ملاحظات سريعة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>حفظ المنفذ</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
