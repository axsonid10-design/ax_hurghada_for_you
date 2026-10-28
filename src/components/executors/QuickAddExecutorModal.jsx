import React, { useState, useEffect } from 'react'
import { X, Check, Truck, Phone, Tag, Plus, Settings } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { ManageCategoriesModal } from '../common/ManageCategoriesModal'

export function QuickAddExecutorModal({ isOpen, existingExecutor = null, onClose, onCreated }) {
  const {
    executorCategories,
    addExecutorCategory,
    addExecutor,
    updateExecutor
  } = useAXStore()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: '',
    pricing_type: 'pax',
    cost_price: 0,
    currency: 'EUR',
    notes: ''
  })

  const [isInlineAddCategoryOpen, setIsInlineAddCategoryOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const defaultCat = executorCategories[0] || 'رحلات بحرية وجزر'
    if (existingExecutor) {
      setFormData({
        name: existingExecutor.name || '',
        phone: existingExecutor.phone || '',
        category: existingExecutor.category || defaultCat,
        pricing_type: existingExecutor.pricing_type || 'pax',
        cost_price: existingExecutor.cost_price !== undefined ? existingExecutor.cost_price : 0,
        currency: existingExecutor.currency || 'EUR',
        notes: existingExecutor.notes || ''
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        category: defaultCat,
        pricing_type: 'pax',
        cost_price: 0,
        currency: 'EUR',
        notes: ''
      })
    }
  }, [isOpen, existingExecutor, executorCategories])

  if (!isOpen) return null

  const handleQuickAddCat = (e) => {
    e.preventDefault()
    const clean = newCatName.trim()
    if (!clean) return
    soundManager.playSuccess()
    addExecutorCategory(clean)
    setFormData((prev) => ({ ...prev, category: clean }))
    setNewCatName('')
    setIsInlineAddCategoryOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    soundManager.playSuccess()

    if (existingExecutor && existingExecutor.id) {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        pricing_type: formData.pricing_type || 'pax',
        cost_price: Number(formData.cost_price) || 0,
        currency: formData.currency || 'EUR',
        notes: formData.notes.trim()
      }
      updateExecutor(existingExecutor.id, payload)
      if (onCreated) onCreated({ ...existingExecutor, ...payload })
    } else {
      const newId = 'exec_' + Date.now()
      const newExecutor = {
        id: newId,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        pricing_type: formData.pricing_type || 'pax',
        cost_price: Number(formData.cost_price) || 0,
        currency: formData.currency || 'EUR',
        notes: formData.notes.trim(),
        total_paid: 0
      }
      addExecutor(newExecutor)
      if (onCreated) onCreated(newExecutor)
    }

    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0a2540]/70 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative animate-scaleUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h4 className="text-sm font-black text-[#0a2540] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0284c7]" />
              <span>{existingExecutor ? 'تعديل بيانات المنفذ' : 'إضافة منفذ / موزع جديد'}</span>
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700">تصنيف النشاط</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsInlineAddCategoryOpen((prev) => !prev)}
                    className="text-[11px] text-[#0284c7] hover:underline flex items-center gap-0.5 font-black"
                  >
                    <Plus className="w-3 h-3" />
                    <span>تصنيف جديد</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setIsManageCategoriesOpen(true)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5 font-bold"
                  >
                    <Settings className="w-3 h-3" />
                    <span>إدارة</span>
                  </button>
                </div>
              </div>

              {isInlineAddCategoryOpen && (
                <div className="flex items-center gap-1.5 mb-2 p-1.5 bg-sky-50 rounded-2xl border border-sky-200 animate-fadeIn">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="اسم تصنيف النشاط..."
                    className="flex-1 bg-white border border-sky-300 rounded-full px-3 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddCat}
                    className="px-2.5 py-1 bg-[#0284c7] text-white rounded-full text-[11px] font-black"
                  >
                    حفظ
                  </button>
                </div>
              )}

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              >
                {executorCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">نوع المحاسبة والتكلفة للمنفذ</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pricing_type: 'pax' })}
                  className={`py-1.5 rounded-full text-xs font-black transition-all ${
                    formData.pricing_type === 'pax'
                      ? 'bg-[#0a2540] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  بالفرد (Per Pax)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pricing_type: 'trip' })}
                  className={`py-1.5 rounded-full text-xs font-black transition-all ${
                    formData.pricing_type === 'trip'
                      ? 'bg-[#0a2540] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  بالرحلة (Per Trip)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 mb-1">
                  {formData.pricing_type === 'trip' ? 'سعر تكلفة الرحلة' : 'سعر تكلفة الفرد'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">العملة</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                >
                  <option value="EUR">يورو (€)</option>
                  <option value="USD">دولار ($)</option>
                  <option value="EGP">جنيه (EGP)</option>
                  <option value="GBP">إسترليني (£)</option>
                </select>
              </div>
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
                <span>{existingExecutor ? 'حفظ التعديلات' : 'حفظ المنفذ'}</span>
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

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        mode="executor"
        onClose={() => setIsManageCategoriesOpen(false)}
      />
    </>
  )
}
