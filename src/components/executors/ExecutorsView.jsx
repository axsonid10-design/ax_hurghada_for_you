import React, { useState, useMemo } from 'react'
import {
  Truck,
  Plus,
  Search,
  Phone,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  X,
  Anchor,
  Compass,
  Waves,
  Sparkles,
  TrendingUp,
  Receipt,
  FileText,
  Tag,
  Coins,
  Edit3,
  Settings
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { QuickAddExecutorModal } from './QuickAddExecutorModal'
import { ExecutorInvoiceModal } from './ExecutorInvoiceModal'
import { ManageCategoriesModal } from '../common/ManageCategoriesModal'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'

export function ExecutorsView() {
  const { t, executors, bookings, tripDefinitions, executorCategories, recordExecutorPayment } = useAXStore()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingExecutor, setEditingExecutor] = useState(null)
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)
  const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, executor: null })
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    executor: null,
    amount: '',
    currency: 'EUR',
    notes: ''
  })

  const categories = [
    { id: 'all', label: 'جميع الأقسام' },
    ...executorCategories.map((c) => ({ id: c, label: c }))
  ]

  const filtered = useMemo(() => {
    return executors.filter((ex) => {
      const matchSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (ex.category || '').toLowerCase().includes(search.toLowerCase())

      if (!matchSearch) return false
      if (activeCategory === 'all') return true
      return ex.category === activeCategory
    })
  }, [executors, search, activeCategory])

  const handlePay = (e) => {
    e.preventDefault()
    const amt = parseFloat(paymentModal.amount)
    if (!amt || amt <= 0 || !paymentModal.executor) return

    soundManager.playSuccess()
    recordExecutorPayment(paymentModal.executor.id, {
      amount: amt,
      currency: paymentModal.currency || 'EUR',
      notes: paymentModal.notes || 'سداد دفعة'
    })
    setPaymentModal({ isOpen: false, executor: null, amount: '', currency: 'EUR', notes: '' })
  }

  const getPartnerIcon = (category = '') => {
    const cat = category.toLowerCase()
    if (cat.includes('بحر') || cat.includes('يخوت') || cat.includes('جزر')) {
      return { icon: Anchor, bg: 'bg-sky-50 text-sky-600 border-sky-200' }
    }
    if (cat.includes('سفاري') || cat.includes('صحراء')) {
      return { icon: Compass, bg: 'bg-amber-50 text-amber-600 border-amber-200' }
    }
    if (cat.includes('غوص') || cat.includes('دولفين')) {
      return { icon: Waves, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' }
    }
    return { icon: Truck, bg: 'bg-purple-50 text-purple-600 border-purple-200' }
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-800">
            {t('executors_title')}
          </h2>
          <div className="text-[11px] text-slate-400 font-bold mt-0.5">
            متابعة حسابات المراكب وموردي السفاري والغوص واستخراج فواتير التصفية
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_executors')}
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
            <span>إدارة الأنشطة</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              setEditingExecutor(null)
              setIsAddOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>{t('new_executor')}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs for Executors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playClick()
                setActiveCategory(cat.id)
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex-shrink-0 border ${
                isActive
                  ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Executors Bento Grid or Clean Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-soft text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-200">
            <Truck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800">
            لا يوجد منفذين مسجلين
          </h3>
          <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto">
            يمكنك تسجيل وإضافة المنفذين وموردي الرحلات البحرية والسفاري لمتابعة الحسابات والتوريدات.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                soundManager.playClick()
                setIsAddOpen(true)
              }}
              className="px-5 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>إضافة منفذ جديد</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {filtered.map((ex) => {
          const exBookings = bookings.filter((b) => b.executor_id === ex.id)
          const totalCostDue = exBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
          const totalPaid = ex.total_paid || 0
          const remainingBalance = Math.max(0, totalCostDue - totalPaid)
          const totalPax = exBookings.reduce(
            (sum, b) => sum + (Number(b.adult) || 0) + (Number(b.child) || 0),
            0
          )
          const isSettled = remainingBalance === 0
          const settlementPercent = totalCostDue > 0 ? Math.min(100, Math.round((totalPaid / totalCostDue) * 100)) : 100

          const { icon: CategoryIcon, bg: iconStyle } = getPartnerIcon(ex.category)

          return (
            <div
              key={ex.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Partner Avatar, Name & Contacts */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border flex-shrink-0 ${iconStyle}`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-800">
                        {ex.name}
                      </h3>
                      <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                        {ex.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        soundManager.playClick()
                        setEditingExecutor(ex)
                        setIsAddOpen(true)
                      }}
                      className="p-2 rounded-full bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors border border-slate-200/60"
                      title="تعديل بيانات المنفذ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {ex.phone && (
                      <a
                        href={`tel:${ex.phone}`}
                        className="p-2 rounded-full bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors border border-slate-200/60"
                        title={ex.phone}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Executor Agreed Cost Rate Badge */}
                <div className="flex items-center justify-between bg-sky-50/70 border border-sky-100 rounded-2xl px-3 py-1.5 text-xs mt-3">
                  <span className="font-bold text-sky-800">تكلفة التوريد للمنفذ:</span>
                  <span className="font-black font-mono text-sky-950">
                    {Number(ex.cost_price) > 0 ? (
                      <>
                        {ex.currency === 'EGP' ? 'EGP ' : ex.currency === 'USD' ? '$' : '€'}
                        {ex.cost_price}{' '}
                        <span className="text-[10px] text-sky-600 font-sans">
                          ({ex.pricing_type === 'trip' ? 'بالرحلة' : 'بالفرد'})
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-sans text-[11px]">حسب تسعيرة الرحلة</span>
                    )}
                  </span>
                </div>

                {/* 3 Bento Financial Blocks */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-2.5 text-center">
                    <div className="text-[10px] font-bold text-slate-400 leading-tight">
                      {t('total_due')}
                    </div>
                    <div className="text-xs sm:text-sm font-black font-mono text-slate-800 mt-1">
                      €{totalCostDue.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-2.5 text-center">
                    <div className="text-[10px] font-bold text-emerald-700 leading-tight">
                      {t('total_paid')}
                    </div>
                    <div className="text-xs sm:text-sm font-black font-mono text-emerald-800 mt-1">
                      €{totalPaid.toLocaleString()}
                    </div>
                  </div>

                  <div
                    className={`border rounded-2xl p-2.5 text-center ${
                      isSettled
                        ? 'bg-slate-50/80 border-slate-200/60 text-slate-500'
                        : 'bg-rose-50/80 border-rose-200/60 text-rose-800'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-rose-600 leading-tight">
                      {t('balance_remaining')}
                    </div>
                    <div className="text-xs sm:text-sm font-black font-mono mt-1">
                      €{remainingBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Settlement Progress Bar */}
                <div className="pt-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>نسبة السداد للمنفذ</span>
                    <span className="font-mono font-black">{settlementPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isSettled ? 'bg-emerald-500' : 'bg-[#0284c7]'
                      }`}
                      style={{ width: `${settlementPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Activity Count & Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-400">
                  <span className="font-black text-slate-700">{exBookings.length}</span> {t('bookings_done')} •{' '}
                  <span className="font-black text-slate-700">{totalPax}</span> {t('pax_served')}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundManager.playClick()
                      setInvoiceModal({ isOpen: true, executor: ex })
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-black transition-all active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>كشف حساب وفاتورة</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClick()
                      setPaymentModal({
                        isOpen: true,
                        executor: ex,
                        amount: remainingBalance > 0 ? String(remainingBalance) : '',
                        currency: 'EUR',
                        notes: ''
                      })
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 flex-shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t('record_payment')}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}

      {/* Record Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-[#0a2540] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>{t('record_payment')}</span>
              </h3>
              <button
                onClick={() => setPaymentModal({ isOpen: false, executor: null, amount: '', currency: 'EUR', notes: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-3.5 text-xs font-bold">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-bold">المنفذ المستفيد:</div>
                <div className="text-sm font-black text-slate-800">{paymentModal.executor?.name}</div>
                <div className="text-[11px] text-slate-400">{paymentModal.executor?.category}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">المبلغ</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="0.00"
                    value={paymentModal.amount}
                    onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-3 text-center font-mono text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                </div>
                <div>
                  <AX_SearchableSelect
                    label="العملة"
                    value={paymentModal.currency}
                    onChange={(val) => setPaymentModal({ ...paymentModal, currency: val })}
                    options={[
                      { value: 'EUR', label: 'يورو (€)' },
                      { value: 'EGP', label: 'جنيه مصري (L.E)' },
                      { value: 'USD', label: 'دولار ($)' }
                    ]}
                    searchable={false}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">ملاحظات / طريقة السداد</label>
                <input
                  type="text"
                  placeholder="مثال: تحويل بنكي، كاش بالمارينا..."
                  value={paymentModal.notes}
                  onChange={(e) => setPaymentModal({ ...paymentModal, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95"
                >
                  تأكيد وقيد السداد
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModal({ isOpen: false, executor: null, amount: '', currency: 'EUR', notes: '' })}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add / Edit Executor Modal */}
      <QuickAddExecutorModal
        isOpen={isAddOpen}
        existingExecutor={editingExecutor}
        onClose={() => {
          setIsAddOpen(false)
          setEditingExecutor(null)
        }}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        mode="executor"
        onClose={() => setIsManageCategoriesOpen(false)}
      />

      {/* 360° Printable Supplier Invoice Modal */}
      <ExecutorInvoiceModal
        isOpen={invoiceModal.isOpen}
        onClose={() => setInvoiceModal({ isOpen: false, executor: null })}
        executor={invoiceModal.executor}
        bookings={bookings}
        tripDefinitions={tripDefinitions}
      />
    </div>
  )
}
