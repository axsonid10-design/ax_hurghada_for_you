import React, { useState, useMemo } from 'react'
import {
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  TrendingUp,
  Receipt,
  Ship,
  Users,
  Euro,
  Coins,
  CheckCircle2,
  Filter,
  Calendar,
  X
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'
import { soundManager } from '../../utils/soundEffects'
import { ExecutorInvoiceModal } from '../executors/ExecutorInvoiceModal'

export function PerformanceReports() {
  const {
    bookings,
    tripDefinitions,
    executors,
    expenses = [],
    addExpense,
    deleteExpense,
    openConfirmModal
  } = useAXStore()

  const [dateFrom, setDateFrom] = useState('2026-10-24')
  const [dateTo, setDateTo] = useState('2026-10-24')
  const [selectedExecutor, setSelectedExecutor] = useState('ALL')
  const [selectedSeller, setSelectedSeller] = useState('ALL')
  const [activeReportTab, setActiveReportTab] = useState('TRIPS') // 'TRIPS' | 'PARTNERS' | 'EXPENSES'

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, executor: null })

  // New Expense form
  const [newExp, setNewExp] = useState({
    title: '',
    category: 'وقود وبترول',
    amount: '',
    currency: 'EUR',
    date: '2026-10-24',
    notes: ''
  })

  // Filter Bookings by Date, Executor, Seller
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchDate = (!dateFrom || b.date >= dateFrom) && (!dateTo || b.date <= dateTo)
      const matchExec = selectedExecutor === 'ALL' || b.executor_id === selectedExecutor
      const matchSeller = selectedSeller === 'ALL' || b.seller === selectedSeller
      return matchDate && matchExec && matchSeller
    })
  }, [bookings, dateFrom, dateTo, selectedExecutor, selectedSeller])

  // Filter Expenses by Date
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      return (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo)
    })
  }, [expenses, dateFrom, dateTo])

  // Aggregate Metrics
  const totalSalesEur = filteredBookings.reduce((sum, b) => sum + (Number(b.sell_eur) || 0), 0)
  const totalCostEur = filteredBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
  const grossProfitEur = totalSalesEur - totalCostEur

  const totalExpensesEur = filteredExpenses.reduce((sum, e) => {
    const amt = Number(e.amount) || 0
    if (e.currency === 'EGP') return sum + amt / 53.25
    if (e.currency === 'USD') return sum + amt / 1.08
    return sum + amt
  }, 0)

  const netProfitEur = grossProfitEur - totalExpensesEur
  const netMargin = totalSalesEur > 0 ? Math.round((netProfitEur / totalSalesEur) * 100) : 0

  const totalPax = filteredBookings.reduce(
    (sum, b) => sum + (Number(b.adult) || 0) + (Number(b.child) || 0),
    0
  )
  const avgTicketEur = totalPax > 0 ? Math.round(totalSalesEur / totalPax) : 0

  // Trips Profitability Matrix Aggregation
  const tripsMatrix = useMemo(() => {
    const map = new Map()
    filteredBookings.forEach((b) => {
      const name = b.trip_type || 'أخرى'
      if (!map.has(name)) {
        map.set(name, {
          name,
          bookingsCount: 0,
          pax: 0,
          sales: 0,
          cost: 0,
          profit: 0
        })
      }
      const item = map.get(name)
      item.bookingsCount += 1
      item.pax += (Number(b.adult) || 0) + (Number(b.child) || 0)
      item.sales += Number(b.sell_eur) || 0
      item.cost += Number(b.cost_eur) || 0
      item.profit += Number(b.profit_eur) || 0
    })
    return Array.from(map.values()).sort((a, b) => b.sales - a.sales)
  }, [filteredBookings])

  const handlePrintReport = () => {
    soundManager.playClick()
    window.print()
  }

  const handleCreateExpense = (e) => {
    e.preventDefault()
    const amt = parseFloat(newExp.amount)
    if (!amt || amt <= 0 || !newExp.title) return

    soundManager.playSuccess()
    addExpense({
      ...newExp,
      amount: amt
    })
    setIsAddExpenseOpen(false)
    setNewExp({
      title: '',
      category: 'وقود وبترول',
      amount: '',
      currency: 'EUR',
      date: dateFrom || '2026-10-24',
      notes: ''
    })
  }

  const handleDeleteExpense = (id, title) => {
    openConfirmModal({
      title: 'حذف المصروف',
      message: `هل أنت متأكد من حذف بند المصروف [${title}] نهائياً؟`,
      confirmText: 'نعم، حذف',
      type: 'danger',
      onConfirm: () => {
        soundManager.playAlert()
        deleteExpense(id)
      }
    })
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Filter & Report Controls Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0284c7]" />
              <span>مركز التقارير المالية والتحليل التشغيلي 360°</span>
            </h2>
            <div className="text-[11px] text-slate-400 font-bold mt-0.5">
              كشوف تفصيلية للربحية، مستحقات الموردين، والمصاريف التشغيلية
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                soundManager.playClick()
                setIsAddExpenseOpen(true)
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل مصروف جديد</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>طباعة التقرير A4</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Date Range + Executor + Seller */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">من تاريخ</label>
            <AX_CompanyDatePicker
              value={dateFrom}
              onChange={(d) => setDateFrom(d)}
              placeholder="من تاريخ"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">إلى تاريخ</label>
            <AX_CompanyDatePicker
              value={dateTo}
              onChange={(d) => setDateTo(d)}
              placeholder="إلى تاريخ"
            />
          </div>

          <div>
            <AX_SearchableSelect
              label="تصفية بالمنفذ"
              value={selectedExecutor}
              options={[
                { value: 'ALL', label: 'جميع المنفذين' },
                ...executors.map((ex) => ({ value: ex.id, label: ex.name }))
              ]}
              onChange={(val) => setSelectedExecutor(val)}
            />
          </div>

          <div>
            <AX_SearchableSelect
              label="تصفية بالمندوب"
              value={selectedSeller}
              options={[
                { value: 'ALL', label: 'جميع المندوبين' },
                { value: 'Meghane', label: 'Meghane' },
                { value: 'Laure', label: 'Laure' },
                { value: 'Laly', label: 'Laly' },
                { value: '📱 Mobile App', label: 'Mobile App' }
              ]}
              onChange={(val) => setSelectedSeller(val)}
            />
          </div>
        </div>
      </div>

      {/* 4 Analytical KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="text-[11px] font-bold text-slate-400">إجمالي الإيرادات في الفترة</div>
          <div className="text-xl sm:text-2xl font-black text-[#0a2540] font-mono">
            €{totalSalesEur.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            {filteredBookings.length} حجز • {totalPax} فرد
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="text-[11px] font-bold text-slate-400">إجمالي التكاليف والمصاريف</div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
            €{Math.round(totalCostEur + totalExpensesEur).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            تكاليف: €{totalCostEur} • مصاريف: €{Math.round(totalExpensesEur)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="text-[11px] font-bold text-slate-400">صافي الربح الفعلي</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            +€{Math.round(netProfitEur).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">
            نسبة هامش الربح: {netMargin}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="text-[11px] font-bold text-slate-400">متوسط الإيراد لكل فرد</div>
          <div className="text-xl sm:text-2xl font-black text-[#0284c7] font-mono">
            €{avgTicketEur}
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            معدل الصرف للنزيل الواحد
          </div>
        </div>
      </div>

      {/* Subtabs for Report Details */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            soundManager.playClick()
            setActiveReportTab('TRIPS')
          }}
          className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
            activeReportTab === 'TRIPS'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          مصفوفة أرباح الرحلات ({tripsMatrix.length})
        </button>

        <button
          onClick={() => {
            soundManager.playClick()
            setActiveReportTab('PARTNERS')
          }}
          className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
            activeReportTab === 'PARTNERS'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          أرصدة المنفذين ومطالباتهم ({executors.length})
        </button>

        <button
          onClick={() => {
            soundManager.playClick()
            setActiveReportTab('EXPENSES')
          }}
          className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
            activeReportTab === 'EXPENSES'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          المصاريف التشغيلية ({filteredExpenses.length})
        </button>
      </div>

      {/* Tab 1: Trips Profitability Matrix */}
      {activeReportTab === 'TRIPS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 sm:p-5 space-y-3">
          <div className="text-xs font-black text-slate-800">
            تحليل مبيعات وتكاليف وهوامش ربح كل نوع رحلة
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-start border-collapse text-xs min-w-[850px]">
              <thead>
                <tr className="bg-[#0a2540] text-white h-11 font-bold">
                  <th className="px-3 text-start">نوع الرحلة</th>
                  <th className="px-3 text-center">عدد الحجوزات</th>
                  <th className="px-3 text-center">عدد الأفراد (PAX)</th>
                  <th className="px-3 text-center font-mono">إجمالي المبيعات (€)</th>
                  <th className="px-3 text-center font-mono">إجمالي التكلفة (€)</th>
                  <th className="px-3 text-center font-mono">صافي الربح (€)</th>
                  <th className="px-3 text-center">هامش الربح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {tripsMatrix.map((t) => {
                  const margin = t.sales > 0 ? Math.round((t.profit / t.sales) * 100) : 0
                  return (
                    <tr key={t.name} className="h-11 hover:bg-slate-50 transition-colors">
                      <td className="px-3 font-black text-slate-800">{t.name}</td>
                      <td className="px-3 text-center font-mono font-bold">{t.bookingsCount}</td>
                      <td className="px-3 text-center font-mono font-bold text-[#0284c7]">{t.pax}</td>
                      <td className="px-3 text-center font-mono font-bold">€{t.sales.toLocaleString()}</td>
                      <td className="px-3 text-center font-mono font-bold text-amber-700">€{t.cost.toLocaleString()}</td>
                      <td className="px-3 text-center font-mono font-black text-emerald-600">+€{t.profit.toLocaleString()}</td>
                      <td className="px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Partners Ledger & Invoice Generation */}
      {activeReportTab === 'PARTNERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 sm:p-5 space-y-3">
          <div className="text-xs font-black text-slate-800">
            موقف حسابات المنفذين والتوريدات مع إمكانية استخراج فاتورة A4 فورية
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-start border-collapse text-xs min-w-[850px]">
              <thead>
                <tr className="bg-[#0a2540] text-white h-11 font-bold">
                  <th className="px-3 text-start">المنفذ / المورد</th>
                  <th className="px-3 text-start">القسم</th>
                  <th className="px-3 text-center font-mono">الحجوزات المنفذة</th>
                  <th className="px-3 text-center font-mono">التكلفة المستحقة (€)</th>
                  <th className="px-3 text-center font-mono">المسدد للمورد (€)</th>
                  <th className="px-3 text-center font-mono">المتبقي له (€)</th>
                  <th className="px-3 text-center">الفاتورة والمطالبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {executors.map((ex) => {
                  const exBookings = filteredBookings.filter((b) => b.executor_id === ex.id)
                  const totalCostDue = exBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
                  const totalPaid = ex.total_paid || 0
                  const remainingBalance = Math.max(0, totalCostDue - totalPaid)

                  return (
                    <tr key={ex.id} className="h-11 hover:bg-slate-50 transition-colors">
                      <td className="px-3 font-black text-slate-800">{ex.name}</td>
                      <td className="px-3 text-slate-600 font-bold">{ex.category}</td>
                      <td className="px-3 text-center font-mono font-bold">{exBookings.length} حجز</td>
                      <td className="px-3 text-center font-mono font-bold text-slate-900">
                        €{totalCostDue.toLocaleString()}
                      </td>
                      <td className="px-3 text-center font-mono font-bold text-emerald-600">
                        €{totalPaid.toLocaleString()}
                      </td>
                      <td className="px-3 text-center font-mono font-black text-rose-600">
                        €{remainingBalance.toLocaleString()}
                      </td>
                      <td className="px-3 text-center">
                        <button
                          onClick={() => {
                            soundManager.playClick()
                            setInvoiceModal({ isOpen: true, executor: ex })
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-[#0a2540] hover:text-white text-slate-700 rounded-full text-xs font-bold transition-all"
                        >
                          استخراج فاتورة A4
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Operating Expenses Log */}
      {activeReportTab === 'EXPENSES' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-slate-800">
              سجل المصاريف التشغيلية (وقود، إكراميات عمالة، ضيافة، وبترول)
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة مصروف</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-start border-collapse text-xs min-w-[750px]">
              <thead>
                <tr className="bg-slate-900 text-white h-11 font-bold">
                  <th className="px-3 text-start">التاريخ</th>
                  <th className="px-3 text-start">بند المصروف</th>
                  <th className="px-3 text-start">القسم والتصنيف</th>
                  <th className="px-3 text-center font-mono">المبلغ</th>
                  <th className="px-3 text-start">ملاحظات</th>
                  <th className="px-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      لا توجد مصاريف مسجلة في هذه الفترة.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="h-11 hover:bg-slate-50 transition-colors">
                      <td className="px-3 font-mono font-bold text-slate-600">{exp.date}</td>
                      <td className="px-3 font-black text-slate-800">{exp.title}</td>
                      <td className="px-3 text-slate-600">{exp.category}</td>
                      <td className="px-3 text-center font-mono font-black text-rose-600">
                        {exp.currency === 'EGP' ? `${exp.amount} ج.م` : `€${exp.amount}`}
                      </td>
                      <td className="px-3 text-slate-500">{exp.notes || '—'}</td>
                      <td className="px-3 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.id, exp.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-[#0a2540] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span>تسجيل مصروف تشغيلي جديد</span>
              </h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">بند المصروف</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: وقود وبنزين مركب مارينا"
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <AX_SearchableSelect
                    label="التصنيف"
                    value={newExp.category}
                    options={[
                      { value: 'وقود وبترول', label: 'وقود وبترول' },
                      { value: 'عمالة وإكراميات', label: 'عمالة وإكراميات' },
                      { value: 'ضيافة وتشغيل', label: 'ضيافة وتشغيل' },
                      { value: 'نقل وانتقالات', label: 'نقل وانتقالات' },
                      { value: 'صيانة ومعدات', label: 'صيانة ومعدات' },
                      { value: 'إداري ومطبوعات', label: 'إداري ومطبوعات' }
                    ]}
                    onChange={(val) => setNewExp({ ...newExp, category: val })}
                    searchable={false}
                  />
                </div>
                <div>
                  <AX_SearchableSelect
                    label="العملة"
                    value={newExp.currency}
                    options={[
                      { value: 'EUR', label: 'يورو (€)' },
                      { value: 'EGP', label: 'جنيه مصري (L.E)' },
                      { value: 'USD', label: 'دولار ($)' }
                    ]}
                    onChange={(val) => setNewExp({ ...newExp, currency: val })}
                    searchable={false}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">المبلغ</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="0.00"
                  value={newExp.amount}
                  onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 font-mono text-center text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  placeholder="ملاحظات تفصيلية..."
                  value={newExp.notes}
                  onChange={(e) => setNewExp({ ...newExp, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95"
                >
                  قيد المصروف
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Invoice Modal */}
      <ExecutorInvoiceModal
        isOpen={invoiceModal.isOpen}
        onClose={() => setInvoiceModal({ isOpen: false, executor: null })}
        executor={invoiceModal.executor}
        bookings={filteredBookings}
        tripDefinitions={tripDefinitions}
      />
    </div>
  )
}
