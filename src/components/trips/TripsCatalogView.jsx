import React, { useState } from 'react'
import {
  Ship,
  Plus,
  Search,
  Edit2,
  Percent,
  DollarSign,
  Truck,
  Check,
  X,
  Tag
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { QuickAddExecutorModal } from '../executors/QuickAddExecutorModal'

export function TripsCatalogView() {
  const { tripDefinitions, executors, updateTripDefinition, addTripDefinition } = useAXStore()
  const [search, setSearch] = useState('')
  const [editingTrip, setEditingTrip] = useState(null)
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false)
  const [isQuickAddExecutorOpen, setIsQuickAddExecutorOpen] = useState(false)

  const filteredTrips = tripDefinitions.filter(
    (t) =>
      t.display_name.toLowerCase().includes(search.toLowerCase()) ||
      t.sheet_name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingTrip) return
    soundManager.playSuccess()
    updateTripDefinition(editingTrip.id, editingTrip)
    setEditingTrip(null)
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h2 className="text-base font-black text-[#0a2540]">
            دليل الرحلات والأسعار
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في الرحلات..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pr-9 pl-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <button
            onClick={() => {
              soundManager.playClick()
              setIsNewTripModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>إضافة رحلة</span>
          </button>
        </div>
      </div>

      {/* Trips Cards Grid (Fluid 1 to 3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTrips.map((trip) => {
          const executor = executors.find((ex) => ex.id === trip.executor_id)
          const isPax = trip.pricing_type === 'pax'
          const isPercent = trip.child_pricing_mode === 'percent'
          const childCost = isPercent
            ? (trip.adult_cost * (trip.child_cost_percent / 100)).toFixed(1)
            : trip.child_cost_fixed
          const childSell = isPercent
            ? (trip.adult_sell * (trip.child_sell_percent / 100)).toFixed(1)
            : trip.child_sell_fixed

          return (
            <div
              key={trip.id}
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft space-y-3 hover:border-[#0284c7]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-black text-[#0a2540]">
                      {trip.display_name}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Excel: {trip.sheet_name}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      isPax
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {isPax ? 'بالأفراد (PAX)' : 'بالرحلة (Booking)'}
                  </span>
                </div>

                <div className="pt-2 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 font-bold">
                    <span>المنفذ المسند:</span>
                    <span className="text-[#0a2540] font-black">
                      {executor?.name || 'غير مسند'}
                    </span>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 font-sans">
                        {isPax ? 'سعر البالغ:' : 'سعر الرحلة:'}
                      </span>
                      <span className="text-slate-800">
                        تكلفة: €{trip.adult_cost} • بيع: €{trip.adult_sell}
                      </span>
                    </div>

                    {isPax && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-sans">
                          سعر الطفل {isPercent ? `(${trip.child_cost_percent}%)` : '(ثابت)'}:
                        </span>
                        <span>
                          تكلفة: €{childCost} • بيع: €{childSell}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  العملة: {trip.currency || 'EUR'}
                </span>
                <button
                  onClick={() => {
                    soundManager.playClick()
                    setEditingTrip(trip)
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-[#0a2540] hover:text-white text-slate-700 rounded-full text-xs font-bold transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>تعديل الأسعار</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Trip Modal */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-[#0a2540]">
                تعديل أسعار رحلة: {editingTrip.display_name}
              </h3>
              <button
                onClick={() => setEditingTrip(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">الاسم المعروض</label>
                <input
                  type="text"
                  required
                  value={editingTrip.display_name}
                  onChange={(e) =>
                    setEditingTrip({ ...editingTrip, display_name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">طريقة الحساب</label>
                  <select
                    value={editingTrip.pricing_type}
                    onChange={(e) =>
                      setEditingTrip({ ...editingTrip, pricing_type: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-800"
                  >
                    <option value="pax">بالأفراد (PAX)</option>
                    <option value="trip">بالرحلة (Booking)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">المنفذ المسند</label>
                  <select
                    value={editingTrip.executor_id}
                    onChange={(e) =>
                      setEditingTrip({ ...editingTrip, executor_id: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-800"
                  >
                    {executors.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">سعر التكلفة (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingTrip.adult_cost}
                    onChange={(e) =>
                      setEditingTrip({
                        ...editingTrip,
                        adult_cost: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">سعر البيع (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingTrip.adult_sell}
                    onChange={(e) =>
                      setEditingTrip({
                        ...editingTrip,
                        adult_sell: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-center font-mono"
                  />
                </div>
              </div>

              {editingTrip.pricing_type === 'pax' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600">تسعير الأطفال:</span>
                    <div className="flex gap-1 bg-white p-0.5 rounded-full border border-slate-200">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTrip({ ...editingTrip, child_pricing_mode: 'percent' })
                        }
                        className={`p-1 rounded-full ${
                          editingTrip.child_pricing_mode === 'percent'
                            ? 'bg-[#0a2540] text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTrip({ ...editingTrip, child_pricing_mode: 'fixed' })
                        }
                        className={`p-1 rounded-full ${
                          editingTrip.child_pricing_mode === 'fixed'
                            ? 'bg-[#0a2540] text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingTrip.child_pricing_mode === 'percent' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 text-[10px]">نسبة التكلفة (%)</label>
                        <input
                          type="number"
                          value={editingTrip.child_cost_percent}
                          onChange={(e) =>
                            setEditingTrip({
                              ...editingTrip,
                              child_cost_percent: parseFloat(e.target.value) || 0
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px]">نسبة البيع (%)</label>
                        <input
                          type="number"
                          value={editingTrip.child_sell_percent}
                          onChange={(e) =>
                            setEditingTrip({
                              ...editingTrip,
                              child_sell_percent: parseFloat(e.target.value) || 0
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 text-[10px]">تكلفة الطفل (€)</label>
                        <input
                          type="number"
                          value={editingTrip.child_cost_fixed}
                          onChange={(e) =>
                            setEditingTrip({
                              ...editingTrip,
                              child_cost_fixed: parseFloat(e.target.value) || 0
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px]">سعر بيع الطفل (€)</label>
                        <input
                          type="number"
                          value={editingTrip.child_sell_fixed}
                          onChange={(e) =>
                            setEditingTrip({
                              ...editingTrip,
                              child_sell_fixed: parseFloat(e.target.value) || 0
                            })
                          }
                          className="w-full bg-white border border-slate-200 rounded-full px-3 py-1.5 text-center font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTrip(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
