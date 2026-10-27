import React, { useState, useMemo } from 'react'
import {
  Ship,
  Compass,
  Anchor,
  Truck,
  Plus,
  Search,
  Edit3,
  Percent,
  DollarSign,
  AlertCircle,
  Tag,
  CheckCircle2,
  X,
  Sparkles,
  Waves,
  SunMedium,
  Coins
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { inferTripCategory } from '../../data/initialSetup'
import { QuickAddExecutorModal } from '../executors/QuickAddExecutorModal'

export function TripsCatalogView() {
  const {
    t,
    lang,
    tripDefinitions,
    executors,
    updateTripDefinition,
    addTripDefinition
  } = useAXStore()

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [editingTrip, setEditingTrip] = useState(null)
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false)
  const [isQuickAddExecutorOpen, setIsQuickAddExecutorOpen] = useState(false)

  // New Trip Form State
  const [newTripData, setNewTripData] = useState({
    display_name: '',
    sheet_name: '',
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

  // Normalize each trip category using inferTripCategory as fallback
  const enrichedTrips = useMemo(() => {
    return tripDefinitions.map((t) => ({
      ...t,
      category: t.category || inferTripCategory(t.display_name || t.sheet_name)
    }))
  }, [tripDefinitions])

  const categories = [
    { id: 'all', label: t('cat_all'), icon: Tag, color: 'text-slate-600' },
    { id: 'sea', label: t('cat_sea'), icon: Ship, color: 'text-sky-600' },
    { id: 'islands', label: t('cat_islands'), icon: SunMedium, color: 'text-emerald-600' },
    { id: 'safari', label: t('cat_safari'), icon: Compass, color: 'text-amber-600' },
    { id: 'aqua', label: t('cat_aqua'), icon: Waves, color: 'text-indigo-600' },
    { id: 'transfers', label: t('cat_transfers'), icon: Coins, color: 'text-purple-600' }
  ]

  const categoryCounts = useMemo(() => {
    const counts = { all: enrichedTrips.length }
    categories.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = enrichedTrips.filter((t) => t.category === cat.id).length
      }
    })
    return counts
  }, [enrichedTrips])

  const filteredTrips = useMemo(() => {
    return enrichedTrips.filter((t) => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory
      const matchSearch =
        !search ||
        t.display_name.toLowerCase().includes(search.toLowerCase()) ||
        t.sheet_name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [enrichedTrips, activeCategory, search])

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingTrip) return
    soundManager.playSuccess()
    updateTripDefinition(editingTrip.id, editingTrip)
    setEditingTrip(null)
  }

  const handleCreateNewTrip = (e) => {
    e.preventDefault()
    if (!newTripData.display_name.trim()) return
    soundManager.playSuccess()
    const id = 'trip_' + Date.now()
    addTripDefinition({
      ...newTripData,
      id,
      sheet_name: newTripData.sheet_name.trim() || newTripData.display_name.trim()
    })
    setIsNewTripModalOpen(false)
    setNewTripData({
      display_name: '',
      sheet_name: '',
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
  }

  const getCategoryBadgeStyles = (catId) => {
    switch (catId) {
      case 'islands':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'safari':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'aqua':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200'
      case 'transfers':
        return 'bg-purple-50 text-purple-800 border-purple-200'
      default:
        return 'bg-sky-50 text-sky-800 border-sky-200'
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Search & Actions Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-800">
            {t('catalog_title')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_trips')}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pr-9 pl-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
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
            <Plus className="w-4 h-4 text-sky-400" />
            <span>{t('add_trip')}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs Bar (Soothing colors & clean active states) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          const count = categoryCounts[cat.id] || 0

          return (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playClick()
                setActiveCategory(cat.id)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all flex-shrink-0 border ${
                isActive
                  ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-300' : cat.color}`} />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Trips Cards Grid (Spacious 2 columns on tablet/desktop, 1 column on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {filteredTrips.map((trip) => {
          const executor = executors.find((ex) => ex.id === trip.executor_id)
          const isPax = trip.pricing_type === 'pax'
          const isPercent = trip.child_pricing_mode === 'percent'
          const isUnpriced =
            Number(trip.adult_cost) === 0 &&
            Number(trip.adult_sell) === 0 &&
            trip.sheet_name !== 'Cash Pickup'

          const childCost = isPercent
            ? (Number(trip.adult_cost) * ((Number(trip.child_cost_percent) || 0) / 100)).toFixed(1)
            : Number(trip.child_cost_fixed || 0)

          const childSell = isPercent
            ? (Number(trip.adult_sell) * ((Number(trip.child_sell_percent) || 0) / 100)).toFixed(1)
            : Number(trip.child_sell_fixed || 0)

          const adultProfit = (Number(trip.adult_sell || 0) - Number(trip.adult_cost || 0)).toFixed(1)

          return (
            <div
              key={trip.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Top: Title, Category & Mode Badges */}
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 leading-snug">
                      {trip.display_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getCategoryBadgeStyles(
                          trip.category
                        )}`}
                      >
                        {categories.find((c) => c.id === trip.category)?.label || t('cat_sea')}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {t('assigned_executor')}:{' '}
                        <span className="text-slate-700 font-black">
                          {executor?.name || t('unassigned')}
                        </span>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black flex-shrink-0 ${
                      isPax
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {isPax ? t('pricing_per_pax') : t('pricing_per_trip')}
                  </span>
                </div>

                {/* Card Middle: Pricing Matrix or Unpriced Warning */}
                <div className="pt-3">
                  {isUnpriced ? (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>{t('price_not_set')}</span>
                      </div>
                      <button
                        onClick={() => {
                          soundManager.playClick()
                          setEditingTrip(trip)
                        }}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 flex-shrink-0"
                      >
                        {t('set_price_now')}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200 space-y-2 font-mono">
                      {/* Adult / Trip Row */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-sans font-bold text-slate-500">
                          {isPax ? (lang === 'ar' ? 'سعر البالغ:' : 'Adult Price:') : (lang === 'ar' ? 'سعر الرحلة:' : 'Trip Price:')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">
                            {t('cost_price')}: <strong className="text-slate-800">€{trip.adult_cost}</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600">
                            {t('sell_price')}: <strong className="text-slate-800">€{trip.adult_sell}</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                            +€{adultProfit}
                          </span>
                        </div>
                      </div>

                      {/* Child Row (For PAX trips) */}
                      {isPax && (
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                          <span className="font-sans font-bold text-slate-500">
                            {t('child_price')}{' '}
                            <span className="text-[10px] text-slate-400">
                              ({isPercent ? `${trip.child_cost_percent}%` : t('cat_other')})
                            </span>:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">
                              {t('cost_price')}: <strong className="text-slate-800">€{childCost}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600">
                              {t('sell_price')}: <strong className="text-slate-800">€{childSell}</strong>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Currency & Edit Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  العملة: {trip.currency || 'EUR'}
                </span>
                <button
                  onClick={() => {
                    soundManager.playClick()
                    setEditingTrip(trip)
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 hover:bg-[#0a2540] hover:text-white text-slate-700 rounded-full text-xs font-black transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('edit_price')}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Trip Modal */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-[#0a2540]">
                {t('edit_price')}: {editingTrip.display_name}
              </h3>
              <button
                onClick={() => setEditingTrip(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">الاسم المعروض للرحلة</label>
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
                  <label className="block text-slate-700 mb-1">القسم / التصنيف</label>
                  <select
                    value={editingTrip.category || 'sea'}
                    onChange={(e) =>
                      setEditingTrip({ ...editingTrip, category: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-800"
                  >
                    <option value="sea">{t('cat_sea')}</option>
                    <option value="islands">{t('cat_islands')}</option>
                    <option value="safari">{t('cat_safari')}</option>
                    <option value="aqua">{t('cat_aqua')}</option>
                    <option value="transfers">{t('cat_transfers')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">طريقة الحساب</label>
                  <select
                    value={editingTrip.pricing_type}
                    onChange={(e) =>
                      setEditingTrip({ ...editingTrip, pricing_type: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-800"
                  >
                    <option value="pax">{t('pricing_per_pax')}</option>
                    <option value="trip">{t('pricing_per_trip')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('assigned_executor')}</label>
                <select
                  value={editingTrip.executor_id}
                  onChange={(e) =>
                    setEditingTrip({ ...editingTrip, executor_id: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-800"
                >
                  {executors.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">
                    {editingTrip.pricing_type === 'pax' ? 'تكلفة البالغ (€)' : 'تكلفة الرحلة (€)'}
                  </label>
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
                  <label className="block text-slate-700 mb-1">
                    {editingTrip.pricing_type === 'pax' ? 'بيع البالغ (€)' : 'بيع الرحلة (€)'}
                  </label>
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
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Trip Modal */}
      {isNewTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-[#0a2540] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>{t('add_trip')}</span>
              </h3>
              <button
                onClick={() => setIsNewTripModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTrip} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">اسم الرحلة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جزيرة الجفتون VIP"
                  value={newTripData.display_name}
                  onChange={(e) =>
                    setNewTripData({ ...newTripData, display_name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">القسم / التصنيف</label>
                  <select
                    value={newTripData.category}
                    onChange={(e) =>
                      setNewTripData({ ...newTripData, category: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-800"
                  >
                    <option value="sea">{t('cat_sea')}</option>
                    <option value="islands">{t('cat_islands')}</option>
                    <option value="safari">{t('cat_safari')}</option>
                    <option value="aqua">{t('cat_aqua')}</option>
                    <option value="transfers">{t('cat_transfers')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">طريقة الحساب</label>
                  <select
                    value={newTripData.pricing_type}
                    onChange={(e) =>
                      setNewTripData({ ...newTripData, pricing_type: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-800"
                  >
                    <option value="pax">{t('pricing_per_pax')}</option>
                    <option value="trip">{t('pricing_per_trip')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('assigned_executor')}</label>
                <select
                  value={newTripData.executor_id}
                  onChange={(e) =>
                    setNewTripData({ ...newTripData, executor_id: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-slate-800"
                >
                  {executors.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">سعر التكلفة (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTripData.adult_cost}
                    onChange={(e) =>
                      setNewTripData({
                        ...newTripData,
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
                    value={newTripData.adult_sell}
                    onChange={(e) =>
                      setNewTripData({
                        ...newTripData,
                        adult_sell: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-full px-3 py-2 text-center font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95"
                >
                  إنشاء الرحلة
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewTripModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
