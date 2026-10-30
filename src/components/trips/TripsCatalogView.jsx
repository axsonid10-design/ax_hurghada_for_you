import React, { useState, useMemo, useEffect } from 'react'
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
  AlertTriangle,
  Tag,
  CheckCircle2,
  X,
  Sparkles,
  Waves,
  SunMedium,
  Coins,
  Settings
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { inferTripCategory } from '../../data/initialSetup'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'
import { QuickAddExecutorModal } from '../executors/QuickAddExecutorModal'
import { ManageCategoriesModal } from '../common/ManageCategoriesModal'

export function TripsCatalogView() {
  const {
    t,
    lang,
    tripDefinitions,
    tripCategories,
    executors,
    updateTripDefinition,
    addTripDefinition,
    reconcileUnpricedTrips
  } = useAXStore()

  useEffect(() => {
    if (typeof reconcileUnpricedTrips === 'function') {
      reconcileUnpricedTrips()
    }
  }, [reconcileUnpricedTrips])

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [editingTrip, setEditingTrip] = useState(null)
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false)
  const [isQuickAddExecutorOpen, setIsQuickAddExecutorOpen] = useState(false)
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)

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

  const categories = useMemo(() => [
    { id: 'all', label: t('cat_all') || 'الكل', icon: Tag, color: 'text-slate-600' },
    ...tripCategories.map((c) => ({
      id: c.id,
      label: c.label,
      icon: Ship,
      color: 'text-[#0284c7]'
    }))
  ], [tripCategories, t])

  const categoryCounts = useMemo(() => {
    const counts = { all: enrichedTrips.length }
    categories.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = enrichedTrips.filter((t) => t.category === cat.id).length
      }
    })
    return counts
  }, [enrichedTrips, categories])

  const categoryOptions = useMemo(() => {
    return tripCategories.map((c) => ({
      value: c.id,
      label: c.label
    }))
  }, [tripCategories])

  const pricingTypeOptions = [
    { value: 'pax', label: t('pricing_per_pax') },
    { value: 'trip', label: t('pricing_per_trip') }
  ]

  const executorOptions = executors.map((ex) => ({
    value: ex.id,
    label: `${ex.name} (${ex.category})`
  }))

  const unpricedTrips = useMemo(() => {
    return enrichedTrips.filter(
      (t) => Number(t.adult_cost) === 0 && Number(t.adult_sell) === 0 && t.sheet_name !== 'Cash Pickup'
    )
  }, [enrichedTrips])

  const filteredTrips = useMemo(() => {
    return enrichedTrips.filter((t) => {
      let matchCat = false
      if (activeCategory === 'all') {
        matchCat = true
      } else if (activeCategory === 'unpriced') {
        matchCat = Number(t.adult_cost) === 0 && Number(t.adult_sell) === 0 && t.sheet_name !== 'Cash Pickup'
      } else {
        matchCat = t.category === activeCategory
      }
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
              setIsManageCategoriesOpen(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>إدارة الأقسام</span>
          </button>

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

      {/* ⚠️ Unpriced Trips Alarm Ribbon */}
      {unpricedTrips.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider">
                  تنبيه تسعير
                </span>
                <h3 className="text-xs sm:text-sm font-black text-rose-950">
                  يوجد ({unpricedTrips.length}) رحلات مسجلة بدون تسعير!
                </h3>
              </div>
              <p className="text-[11px] text-rose-800 font-bold mt-0.5">
                تكلفة وأرباح هذه الرحلات غير محتسبة في الحجوزات والتقارير.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick()
                setActiveCategory('unpriced')
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 ${
                activeCategory === 'unpriced'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              فلترة غير المسعر ({unpricedTrips.length})
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick()
                setEditingTrip(unpricedTrips[0])
              }}
              className="px-4 py-1.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>تسعير أول رحلة الآن</span>
              <span className="font-mono text-sky-300">←</span>
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs Bar (Soothing colors & clean active states) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
        {unpricedTrips.length > 0 && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              setActiveCategory('unpriced')
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all flex-shrink-0 border ${
              activeCategory === 'unpriced'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>غير مسعرة</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeCategory === 'unpriced' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-800'
              }`}
            >
              {unpricedTrips.length}
            </span>
          </button>
        )}

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

      {/* Trips Cards Grid or Clean Empty State */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-200">
            <Tag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            {lang === 'ar' ? 'لا توجد رحلات مسجلة' : 'No trips registered'}
          </h3>
          <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto">
            {lang === 'ar'
              ? 'يمكنك إضافة رحلة جديدة يدوياً أو رفع شيت إكسيل لتسجيل وتسعير الرحلات تلقائياً.'
              : 'You can add a new trip manually or upload an Excel sheet to price and register trips.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                soundManager.playClick()
                setIsNewTripModalOpen(true)
              }}
              className="px-5 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>{t('add_trip')}</span>
            </button>
          </div>
        </div>
      ) : (
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
              className={`rounded-3xl p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4 ${
                isUnpriced
                  ? 'bg-amber-50/70 border-2 border-amber-300 shadow-md ring-1 ring-amber-200'
                  : 'bg-white border border-slate-200 shadow-soft hover:shadow-md'
              }`}
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
                    <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-amber-950 font-black text-xs">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-pulse" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span>⚠️ رحلة غير مسعرة</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-mono font-bold">
                              0.00 €
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-800 font-bold mt-0.5">
                            سعر التكلفة: 0.00 € • سعر البيع: 0.00 €
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          soundManager.playClick()
                          setEditingTrip(trip)
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 flex-shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>تسعير الآن</span>
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
      )}

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
                <AX_SearchableSelect
                  label="القسم / التصنيف"
                  value={editingTrip.category || 'sea'}
                  options={categoryOptions}
                  onChange={(val) =>
                    setEditingTrip({ ...editingTrip, category: val })
                  }
                />

                <AX_SearchableSelect
                  label="طريقة الحساب"
                  value={editingTrip.pricing_type}
                  options={pricingTypeOptions}
                  onChange={(val) =>
                    setEditingTrip({ ...editingTrip, pricing_type: val })
                  }
                />
              </div>

              <div>
                <AX_SearchableSelect
                  label={t('assigned_executor')}
                  value={editingTrip.executor_id}
                  options={executorOptions}
                  onChange={(val) =>
                    setEditingTrip({ ...editingTrip, executor_id: val })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">
                    {editingTrip.pricing_type === 'pax' ? 'تكلفة البالغ (€) (للمنفذ المورد)' : 'تكلفة الرحلة (€) (للمنفذ المورد)'}
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
                    {editingTrip.pricing_type === 'pax' ? 'بيع البالغ (€) (للعميل)' : 'بيع الرحلة (€) (للعميل)'}
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
                        <label className="block text-slate-500 text-[10px]">نسبة تكلفة الطفل (للمنفذ)</label>
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
                        <label className="block text-slate-500 text-[10px]">نسبة بيع الطفل (للعميل)</label>
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
                        <label className="block text-slate-500 text-[10px]">تكلفة الطفل الثابتة (للمنفذ)</label>
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
                        <label className="block text-slate-500 text-[10px]">سعر بيع الطفل الثابت (للعميل)</label>
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
                <AX_SearchableSelect
                  label="القسم / التصنيف"
                  value={newTripData.category}
                  options={categoryOptions}
                  onChange={(val) =>
                    setNewTripData({ ...newTripData, category: val })
                  }
                />

                <AX_SearchableSelect
                  label="طريقة الحساب"
                  value={newTripData.pricing_type}
                  options={pricingTypeOptions}
                  onChange={(val) =>
                    setNewTripData({ ...newTripData, pricing_type: val })
                  }
                />
              </div>

              <div>
                <AX_SearchableSelect
                  label={t('assigned_executor')}
                  value={newTripData.executor_id}
                  options={executorOptions}
                  onChange={(val) =>
                    setNewTripData({ ...newTripData, executor_id: val })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">
                    {newTripData.pricing_type === 'pax' ? 'تكلفة البالغ (€) (للمنفذ المورد)' : 'تكلفة الرحلة (€) (للمنفذ المورد)'}
                  </label>
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
                  <label className="block text-slate-700 mb-1">
                    {newTripData.pricing_type === 'pax' ? 'بيع البالغ (€) (للعميل)' : 'بيع الرحلة (€) (للعميل)'}
                  </label>
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

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        mode="trip"
        onClose={() => setIsManageCategoriesOpen(false)}
      />
    </div>
  )
}
