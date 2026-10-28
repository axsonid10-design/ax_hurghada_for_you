import React, { useState, useEffect } from 'react'
import {
  X,
  Check,
  Percent,
  DollarSign,
  Plus,
  Ship,
  Sparkles,
  Info
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { inferTripCategory } from '../../data/initialSetup'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'
import { QuickAddExecutorModal } from '../executors/QuickAddExecutorModal'

export function ConfigureUnknownTripsModal({
  isOpen,
  unknownTripNames = [],
  onClose,
  onSave
}) {
  const { executors, batchAddTripDefinitions } = useAXStore()
  const [isAddExecutorOpen, setIsAddExecutorOpen] = useState(false)
  const [activeTripIdx, setActiveTripIdx] = useState(null)

  // Local state for each unknown trip - defaults to 0 so the user decides the price
  const [tripsState, setTripsState] = useState([])

  useEffect(() => {
    if (!isOpen || unknownTripNames.length === 0) return
    setTripsState(
      unknownTripNames.map((name, idx) => ({
        id: 'trip_' + Date.now() + '_' + idx,
        sheet_name: name,
        display_name: name,
        category: inferTripCategory(name),
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
      }))
    )
  }, [isOpen, unknownTripNames, executors])

  if (!isOpen || unknownTripNames.length === 0) return null

  const handleFieldChange = (idx, field, value) => {
    setTripsState((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
    )
  }

  const handleExecutorCreated = (newExecutor) => {
    if (activeTripIdx !== null) {
      handleFieldChange(activeTripIdx, 'executor_id', newExecutor.id)
    }
  }

  const handleSubmitAll = (e) => {
    e.preventDefault()
    soundManager.playSuccess()

    const prepared = tripsState.map((t) => {
      let finalChildCost = t.child_cost_fixed
      let finalChildSell = t.child_sell_fixed

      if (t.child_pricing_mode === 'percent') {
        finalChildCost = t.adult_cost * (t.child_cost_percent / 100)
        finalChildSell = t.adult_sell * (t.child_sell_percent / 100)
      }

      return {
        ...t,
        child_cost_fixed: finalChildCost,
        child_sell_fixed: finalChildSell
      }
    })

    batchAddTripDefinitions(prepared)
    if (onSave) onSave(prepared)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0a2540]/75 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0a2540]">
                  تهيئة وتسعير الرحلات الجديدة المكتشفة ({unknownTripNames.length})
                </h3>
                <div className="text-[11px] text-slate-500 font-bold">
                  تحديد طريقة الحساب (رحلة / أفراد) وأسعار التكلفة والبيع للأطفال والبالغين
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Trips Form List */}
          <form onSubmit={handleSubmitAll} className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            {tripsState.map((trip, idx) => {
              const isPax = trip.pricing_type === 'pax'
              const isPercent = trip.child_pricing_mode === 'percent'
              const computedChildCost = isPercent
                ? (trip.adult_cost * (trip.child_cost_percent / 100)).toFixed(1)
                : trip.child_cost_fixed
              const computedChildSell = isPercent
                ? (trip.adult_sell * (trip.child_sell_percent / 100)).toFixed(1)
                : trip.child_sell_fixed

              return (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 relative hover:border-[#0284c7]/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#0a2540] text-[#38bdf8]">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {trip.sheet_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-bold">طريقة الحساب:</span>
                      <div className="flex bg-white p-0.5 rounded-full border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playClick()
                            handleFieldChange(idx, 'pricing_type', 'pax')
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
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
                            handleFieldChange(idx, 'pricing_type', 'trip')
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                    <div>
                      <label className="block text-slate-700 mb-1">الاسم المميز للرحلة</label>
                      <input
                        type="text"
                        required
                        value={trip.display_name}
                        onChange={(e) => handleFieldChange(idx, 'display_name', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-full px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700">المنفذ / الموزع</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTripIdx(idx)
                            setIsAddExecutorOpen(true)
                          }}
                          className="text-[10px] text-[#0284c7] hover:underline flex items-center gap-1 font-black"
                        >
                          <Plus className="w-3 h-3" />
                          <span>منفذ جديد</span>
                        </button>
                      </div>
                      <AX_SearchableSelect
                        value={trip.executor_id}
                        onChange={(val) => handleFieldChange(idx, 'executor_id', val)}
                        options={executors.map((ex) => ({
                          value: ex.id,
                          label: `${ex.name} (${ex.category})`
                        }))}
                      />
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                      <div>
                        <AX_SearchableSelect
                          label="العملة"
                          value={trip.currency}
                          onChange={(val) => handleFieldChange(idx, 'currency', val)}
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
                          {isPax ? 'تكلفة البالغ' : 'تكلفة الرحلة'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={trip.adult_cost}
                          onChange={(e) => handleFieldChange(idx, 'adult_cost', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 mb-1">
                          {isPax ? 'سعر بيع البالغ' : 'سعر بيع الرحلة'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={trip.adult_sell}
                          onChange={(e) => handleFieldChange(idx, 'adult_sell', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                        />
                      </div>
                    </div>

                    {/* Child Pricing Settings (Only when per pax) */}
                    {isPax && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-600">تسعير الأطفال:</span>
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full border border-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                soundManager.playClick()
                                handleFieldChange(idx, 'child_pricing_mode', 'percent')
                              }}
                              title="نسبة مئوية من سعر البالغ"
                              className={`p-1 rounded-full text-xs transition-all ${
                                isPercent
                                  ? 'bg-[#0a2540] text-white shadow-sm'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <Percent className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                soundManager.playClick()
                                handleFieldChange(idx, 'child_pricing_mode', 'fixed')
                              }}
                              title="سعر ومبلغ ثابت للطفل"
                              className={`p-1 rounded-full text-xs transition-all ${
                                !isPercent
                                  ? 'bg-[#0a2540] text-white shadow-sm'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {isPercent ? (
                          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-slate-600">نسبة التكلفة (%)</span>
                                <span className="text-slate-400 font-mono">(= {computedChildCost} {trip.currency})</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={trip.child_cost_percent}
                                onChange={(e) => handleFieldChange(idx, 'child_cost_percent', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-slate-600">نسبة البيع (%)</span>
                                <span className="text-slate-400 font-mono">(= {computedChildSell} {trip.currency})</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={trip.child_sell_percent}
                                onChange={(e) => handleFieldChange(idx, 'child_sell_percent', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                            <div>
                              <label className="block text-slate-600 mb-1">تكلفة الطفل الثابتة</label>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={trip.child_cost_fixed}
                                onChange={(e) => handleFieldChange(idx, 'child_cost_fixed', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-600 mb-1">سعر بيع الطفل الثابت</label>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={trip.child_sell_fixed}
                                onChange={(e) => handleFieldChange(idx, 'child_sell_fixed', parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            <div className="pt-2 flex items-center justify-end gap-2 flex-shrink-0">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-[#38bdf8]" />
                <span>حفظ وتسعير الرحلات ومتابعة الاستيراد</span>
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
    </>
  )
}
