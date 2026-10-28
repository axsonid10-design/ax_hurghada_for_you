import React, { useState, useEffect } from 'react'
import {
  X,
  Check,
  Percent,
  DollarSign,
  Plus,
  Ship,
  Sparkles,
  Compass,
  Waves,
  SunMedium,
  Coins,
  AlertCircle,
  Tag,
  Settings
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { inferTripCategory } from '../../data/initialSetup'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'
import { QuickAddExecutorModal } from '../executors/QuickAddExecutorModal'
import { ManageCategoriesModal } from '../common/ManageCategoriesModal'

export function ConfigureSingleTripModal({
  isOpen,
  tripName,
  existingDef = null,
  onClose,
  onSaved
}) {
  const {
    executors,
    tripCategories,
    addTripCategory,
    addTripDefinition,
    updateTripDefinition,
    tripDefinitions
  } = useAXStore()

  const [isAddExecutorOpen, setIsAddExecutorOpen] = useState(false)
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)
  const [isInlineAddCategoryOpen, setIsInlineAddCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const [formData, setFormData] = useState({
    display_name: '',
    category: 'sea',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 0,
    adult_sell: 0,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 0,
    child_sell_fixed: 0,
    executor_id: executors[0]?.id || 'exec_marina'
  })

  useEffect(() => {
    if (!isOpen) return
    const defaultCat = tripCategories[0]?.id || 'sea'
    if (existingDef) {
      setFormData({
        display_name: existingDef.display_name || tripName || '',
        category: existingDef.category || inferTripCategory(tripName),
        pricing_type: existingDef.pricing_type || 'pax',
        currency: existingDef.currency || 'EUR',
        adult_cost: existingDef.adult_cost || 0,
        adult_sell: existingDef.adult_sell || 0,
        child_pricing_mode: existingDef.child_pricing_mode || 'percent',
        child_cost_percent: existingDef.child_cost_percent !== undefined ? existingDef.child_cost_percent : 50,
        child_sell_percent: existingDef.child_sell_percent !== undefined ? existingDef.child_sell_percent : 50,
        child_cost_fixed: existingDef.child_cost_fixed || 0,
        child_sell_fixed: existingDef.child_sell_fixed || 0,
        executor_id: existingDef.executor_id || executors[0]?.id || 'exec_marina'
      })
    } else {
      setFormData({
        display_name: tripName || '',
        category: inferTripCategory(tripName) || defaultCat,
        pricing_type: 'pax',
        currency: 'EUR',
        adult_cost: 0,
        adult_sell: 0,
        child_pricing_mode: 'percent',
        child_cost_percent: 50,
        child_sell_percent: 50,
        child_cost_fixed: 0,
        child_sell_fixed: 0,
        executor_id: executors[0]?.id || 'exec_marina'
      })
    }
  }, [isOpen, tripName, existingDef, executors, tripCategories])

  if (!isOpen) return null

  const isPax = formData.pricing_type === 'pax'
  const isPercent = formData.child_pricing_mode === 'percent'

  const computedChildCost = isPercent
    ? (formData.adult_cost * (formData.child_cost_percent / 100)).toFixed(1)
    : formData.child_cost_fixed
  const computedChildSell = isPercent
    ? (formData.adult_sell * (formData.child_sell_percent / 100)).toFixed(1)
    : formData.child_sell_fixed

  const profitAdult = Math.max(0, formData.adult_sell - formData.adult_cost)
  const profitMargin = formData.adult_sell > 0
    ? Math.round((profitAdult / formData.adult_sell) * 100)
    : 0

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleExecutorCreated = (newExecutor) => {
    handleFieldChange('executor_id', newExecutor.id)
  }

  const handleQuickAddCategory = (e) => {
    e.preventDefault()
    const clean = newCategoryName.trim()
    if (!clean) return
    soundManager.playSuccess()
    const newId = 'cat_' + Date.now()
    addTripCategory({ id: newId, label: clean })
    handleFieldChange('category', newId)
    setNewCategoryName('')
    setIsInlineAddCategoryOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    soundManager.playSuccess()

    let finalChildCost = formData.child_cost_fixed
    let finalChildSell = formData.child_sell_fixed

    if (formData.child_pricing_mode === 'percent') {
      finalChildCost = formData.adult_cost * (formData.child_cost_percent / 100)
      finalChildSell = formData.adult_sell * (formData.child_sell_percent / 100)
    }

    const payload = {
      sheet_name: tripName,
      display_name: formData.display_name.trim() || tripName,
      category: formData.category,
      pricing_type: formData.pricing_type,
      currency: formData.currency,
      adult_cost: Number(formData.adult_cost) || 0,
      adult_sell: Number(formData.adult_sell) || 0,
      child_pricing_mode: formData.child_pricing_mode,
      child_cost_percent: Number(formData.child_cost_percent) || 0,
      child_sell_percent: Number(formData.child_sell_percent) || 0,
      child_cost_fixed: finalChildCost,
      child_sell_fixed: finalChildSell,
      executor_id: formData.executor_id
    }

    const cleanSheet = (tripName || '').toLowerCase().trim().replace(/\s+/g, ' ')
    const existingInStore = tripDefinitions.find((td) => {
      const sName = (td.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
      return (existingDef && td.id === existingDef.id) || (cleanSheet && sName === cleanSheet)
    })

    if (existingInStore) {
      updateTripDefinition(existingInStore.id, payload)
      if (onSaved) onSaved({ ...existingInStore, ...payload })
    } else {
      const newId = 'trip_' + Date.now()
      const newDef = { ...payload, id: newId }
      addTripDefinition(newDef)
      if (onSaved) onSaved(newDef)
    }

    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-[#0a2540]/75 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0a2540]">
                  {existingDef ? 'تعديل تسعير وبيانات الرحلة' : 'تسعير وتهيئة رحلة جديدة'}
                </h3>
                <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                  <span>اسم الشيت:</span>
                  <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                    {tripName}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                المسمى الرسمي للرحلة بالمنظومة
              </label>
              <input
                type="text"
                required
                value={formData.display_name}
                onChange={(e) => handleFieldChange('display_name', e.target.value)}
                placeholder="مثال: جزيرة هولا هولا VIP"
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            {/* Category and Pricing Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700">تصنيف وقسم الرحلة</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsInlineAddCategoryOpen((prev) => !prev)}
                      className="text-[11px] text-[#0284c7] hover:underline flex items-center gap-0.5 font-black"
                    >
                      <Plus className="w-3 h-3" />
                      <span>قسم جديد</span>
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
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="اسم القسم الجديد..."
                      className="flex-1 bg-white border border-sky-300 rounded-full px-3 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddCategory}
                      className="px-2.5 py-1 bg-[#0284c7] text-white rounded-full text-[11px] font-black"
                    >
                      حفظ
                    </button>
                  </div>
                )}

                <AX_SearchableSelect
                  value={formData.category}
                  onChange={(val) => handleFieldChange('category', val)}
                  options={tripCategories.map((c) => ({
                    value: c.id,
                    label: c.label
                  }))}
                  searchable={false}
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">طريقة احتساب السعر</label>
                <div className="flex bg-slate-100 p-0.5 rounded-full border border-slate-200 h-[38px] items-center">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick()
                      handleFieldChange('pricing_type', 'pax')
                    }}
                    className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isPax
                        ? 'bg-[#0284c7] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    بالأفراد (PAX)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick()
                      handleFieldChange('pricing_type', 'trip')
                    }}
                    className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
                      !isPax
                        ? 'bg-[#0284c7] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    بالرحلة (Booking)
                  </button>
                </div>
              </div>
            </div>

            {/* Executor Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-700">المنفذ المسند للتوريد</label>
                <button
                  type="button"
                  onClick={() => setIsAddExecutorOpen(true)}
                  className="text-[11px] text-[#0284c7] hover:underline flex items-center gap-1 font-black"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة منفذ جديد</span>
                </button>
              </div>
              <AX_SearchableSelect
                value={formData.executor_id}
                onChange={(val) => handleFieldChange('executor_id', val)}
                options={executors.map((ex) => ({
                  value: ex.id,
                  label: `${ex.name} (${ex.category || 'عام'})`
                }))}
              />
            </div>

            {/* Pricing Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-[#0a2540]">
                <span>جدول تسعير {isPax ? 'البالغين' : 'الرحلة'}</span>
                {profitAdult > 0 && (
                  <span className="text-emerald-600 font-mono text-[11px]">
                    هامش الربح: +{profitAdult} {formData.currency} ({profitMargin}%)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                <div>
                  <AX_SearchableSelect
                    label="العملة"
                    value={formData.currency}
                    onChange={(val) => handleFieldChange('currency', val)}
                    options={[
                      { value: 'EUR', label: 'يورو (€)' },
                      { value: 'EGP', label: 'جنيه مصري (L.E)' },
                      { value: 'USD', label: 'دولار ($)' },
                      { value: 'GBP', label: 'إسترليني (£)' }
                    ]}
                    searchable={false}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isPax ? 'تكلفة البالغ (للمنفذ المورد)' : 'تكلفة الرحلة كاملة (للمنفذ المورد)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.adult_cost}
                    onChange={(e) => handleFieldChange('adult_cost', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-full px-3 py-2 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {isPax ? 'سعر بيع البالغ (للعميل)' : 'سعر بيع الرحلة (للعميل)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.adult_sell}
                    onChange={(e) => handleFieldChange('adult_sell', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-full px-3 py-2 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              {/* Child Pricing (Pax only) */}
              {isPax && (
                <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">تسعير الأطفال:</span>
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClick()
                          handleFieldChange('child_pricing_mode', 'percent')
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                          isPercent
                            ? 'bg-[#0a2540] text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Percent className="w-3 h-3" />
                        <span>نسبة مئوية</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClick()
                          handleFieldChange('child_pricing_mode', 'fixed')
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                          !isPercent
                            ? 'bg-[#0a2540] text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>مبلغ ثابت</span>
                      </button>
                    </div>
                  </div>

                  {isPercent ? (
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600">نسبة تكلفة الطفل (للمنفذ المورد)</span>
                          <span className="text-slate-500 font-mono">(= {computedChildCost} {formData.currency})</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={formData.child_cost_percent}
                          onChange={(e) => handleFieldChange('child_cost_percent', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600">نسبة بيع الطفل (للعميل)</span>
                          <span className="text-slate-500 font-mono">(= {computedChildSell} {formData.currency})</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={formData.child_sell_percent}
                          onChange={(e) => handleFieldChange('child_sell_percent', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                      <div>
                        <label className="block text-slate-600 mb-1">تكلفة الطفل الثابتة (للمنفذ المورد)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.child_cost_fixed}
                          onChange={(e) => handleFieldChange('child_cost_fixed', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">سعر بيع الطفل الثابت (للعميل)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.child_sell_fixed}
                          onChange={(e) => handleFieldChange('child_sell_fixed', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 flex-shrink-0">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-[#38bdf8]" />
                <span>حفظ واعتماد تسعير الرحلة</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>

      <QuickAddExecutorModal
        isOpen={isAddExecutorOpen}
        onClose={() => setIsAddExecutorOpen(false)}
        onCreated={handleExecutorCreated}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        mode="trip"
        onClose={() => setIsManageCategoriesOpen(false)}
      />
    </>
  )
}
