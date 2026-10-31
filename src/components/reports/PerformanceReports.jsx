import React, { useState, useMemo } from 'react'
import {
  FileText,
  Printer,
  FileSpreadsheet,
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
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  CreditCard
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { AX_SearchableSelect } from '../common/AX_SearchableSelect'
import { soundManager } from '../../utils/soundEffects'
import { ExecutorInvoiceModal } from '../executors/ExecutorInvoiceModal'
import { exportPerformanceReportToExcel } from '../../utils/excelExporter'

export function PerformanceReports() {
  const {
    bookings,
    tripDefinitions,
    executors,
    expenses = [],
    addExpense,
    deleteExpense,
    openConfirmModal,
    lang,
    t
  } = useAXStore()

  const isRtl = lang === 'ar'
  const todayIso = new Date().toISOString().split('T')[0]
  const [dateFrom, setDateFrom] = useState(todayIso)
  const [dateTo, setDateTo] = useState(todayIso)
  const [selectedExecutor, setSelectedExecutor] = useState('ALL')
  const [selectedSeller, setSelectedSeller] = useState('ALL')
  const [activeReportTab, setActiveReportTab] = useState('TRIPS')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, executor: null })

  const [newExp, setNewExp] = useState({
    title: '',
    category: 'وقود وبترول',
    amount: '',
    currency: 'EUR',
    date: todayIso,
    notes: ''
  })

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchDate = (!dateFrom || b.date >= dateFrom) && (!dateTo || b.date <= dateTo)
      const matchExec = selectedExecutor === 'ALL' || b.executor_id === selectedExecutor
      const matchSeller = selectedSeller === 'ALL' || b.seller === selectedSeller
      return matchDate && matchExec && matchSeller
    })
  }, [bookings, dateFrom, dateTo, selectedExecutor, selectedSeller])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      return (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo)
    })
  }, [expenses, dateFrom, dateTo])

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

  const tripsMatrix = useMemo(() => {
    const map = new Map()
    filteredBookings.forEach((b) => {
      const name = b.trip_type || (isRtl ? 'أخرى' : 'Other')
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
  }, [filteredBookings, isRtl])

  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredBookings.slice(start, start + pageSize)
  }, [filteredBookings, currentPage, pageSize])

  const handlePrintReport = () => {
    soundManager.playClick()
    window.print()
  }

  const handleExportExcel = async () => {
    soundManager.playClick()
    await exportPerformanceReportToExcel({
      filteredBookings,
      tripsMatrix,
      executors,
      filteredExpenses,
      dateFrom,
      dateTo,
      lang
    })
    soundManager.playSuccess()
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
      date: dateFrom || todayIso,
      notes: ''
    })
  }

  const handleDeleteExpense = (id, title) => {
    openConfirmModal({
      title: isRtl ? 'حذف المصروف' : 'Delete Expense',
      message: isRtl ? `هل أنت متأكد من حذف بند المصروف [${title}] نهائياً؟` : `Delete expense item [${title}] permanently?`,
      confirmText: isRtl ? 'نعم، حذف' : 'Delete',
      type: 'danger',
      onConfirm: () => {
        soundManager.playAlert()
        deleteExpense(id)
      }
    })
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0284c7]" />
              <span>{isRtl ? 'مركز التقارير المالية والتحليل التشغيلي 360°' : 'Financial Reports & 360° Operations Center'}</span>
            </h2>
            <div className="text-[11px] text-slate-400 font-bold mt-0.5">
              {isRtl ? 'كشوف تفصيلية للربحية، مستحقات الموردين، والمصاريف التشغيلية' : 'Detailed ledgers for profitability, supplier balances, and expenses'}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تصدير Excel شامل' : 'Export Full Excel'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick()
                setIsAddExpenseOpen(true)
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تسجيل مصروف' : 'Add Expense'}</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>{isRtl ? 'طباعة A4' : 'Print A4'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">{isRtl ? 'من تاريخ' : 'From Date'}</label>
            <AX_CompanyDatePicker
              value={dateFrom}
              onChange={(d) => setDateFrom(d)}
              placeholder={isRtl ? 'من تاريخ' : 'From Date'}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">{isRtl ? 'إلى تاريخ' : 'To Date'}</label>
            <AX_CompanyDatePicker
              value={dateTo}
              onChange={(d) => setDateTo(d)}
              placeholder={isRtl ? 'إلى تاريخ' : 'To Date'}
            />
          </div>

          <div>
            <AX_SearchableSelect
              label={isRtl ? 'تصفية بالمنفذ' : 'Filter by Executor'}
              value={selectedExecutor}
              options={[
                { value: 'ALL', label: isRtl ? 'جميع المنفذين' : 'All Executors' },
                ...executors.map((ex) => ({ value: ex.id, label: ex.name }))
              ]}
              onChange={(val) => setSelectedExecutor(val)}
            />
          </div>

          <div>
            <AX_SearchableSelect
              label={isRtl ? 'تصفية بالمندوب' : 'Filter by Seller'}
              value={selectedSeller}
              options={[
                { value: 'ALL', label: isRtl ? 'جميع المندوبين' : 'All Sellers' },
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="text-[11px] font-bold text-slate-400">{isRtl ? 'إجمالي الإيرادات' : 'Total Revenue'}</div>
          <div className="text-lg sm:text-2xl font-black text-[#0a2540] font-mono">
            €{totalSalesEur.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            {filteredBookings.length} {isRtl ? 'حجز' : 'bookings'} • {totalPax} {isRtl ? 'فرد' : 'PAX'}
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="text-[11px] font-bold text-slate-400">{isRtl ? 'التكاليف والمصاريف' : 'Costs & Expenses'}</div>
          <div className="text-lg sm:text-2xl font-black text-amber-700 font-mono">
            €{Math.round(totalCostEur + totalExpensesEur).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            {isRtl ? 'توريد:' : 'Cost:'} €{totalCostEur.toLocaleString()} • {isRtl ? 'مصاريف:' : 'Exp:'} €{Math.round(totalExpensesEur).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="text-[11px] font-bold text-slate-400">{isRtl ? 'صافي الربح الفعلي' : 'Net Profit'}</div>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 font-mono">
            +€{Math.round(netProfitEur).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">
            {isRtl ? 'هامش الربح:' : 'Margin:'} {netMargin}%
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="text-[11px] font-bold text-slate-400">{isRtl ? 'متوسط الفرد' : 'Avg Ticket'}</div>
          <div className="text-lg sm:text-2xl font-black text-[#0284c7] font-mono">
            €{avgTicketEur}
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            {isRtl ? 'معدل الصرف للفرد' : 'Average spend per PAX'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            soundManager.playClick()
            setActiveReportTab('TRIPS')
          }}
          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeReportTab === 'TRIPS'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isRtl ? `مصفوفة أرباح الرحلات (${tripsMatrix.length})` : `Trips Matrix (${tripsMatrix.length})`}
        </button>

        <button
          onClick={() => {
            soundManager.playClick()
            setActiveReportTab('PARTNERS')
          }}
          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeReportTab === 'PARTNERS'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isRtl ? `أرصدة المنفذين ومطالباتهم (${executors.length})` : `Suppliers Ledger (${executors.length})`}
        </button>

        <button
          onClick={() => {
            soundManager.playClick()
            setActiveReportTab('LEDGER_360')
          }}
          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeReportTab === 'LEDGER_360'
              ? 'bg-[#0284c7] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isRtl ? `كشف الحساب التفصيلي 360° (${filteredBookings.length})` : `360° Detailed Ledger (${filteredBookings.length})`}
        </button>

        <button
          onClick={() => {
            soundManager.playClick()
            setActiveReportTab('EXPENSES')
          }}
          className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeReportTab === 'EXPENSES'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {isRtl ? `المصاريف التشغيلية (${filteredExpenses.length})` : `Expenses Log (${filteredExpenses.length})`}
        </button>
      </div>

      {activeReportTab === 'TRIPS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 sm:p-5 space-y-3">
          <div className="text-xs font-black text-slate-800">
            {isRtl ? 'تحليل مبيعات وتكاليف وهوامش ربح كل نوع رحلة' : 'Sales, costs, and profit margin analysis per trip type'}
          </div>

          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-[#0a2540] text-white h-11 font-bold">
                  <th className="px-3 text-start">{isRtl ? 'نوع الرحلة' : 'Trip Type'}</th>
                  <th className="px-3 text-center">{isRtl ? 'عدد الحجوزات' : 'Bookings'}</th>
                  <th className="px-3 text-center">{isRtl ? 'الأفراد (PAX)' : 'PAX'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'المبيعات (€)' : 'Sales (€)'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'التكلفة (€)' : 'Cost (€)'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'صافي الربح (€)' : 'Net Profit (€)'}</th>
                  <th className="px-3 text-center">{isRtl ? 'الهامش' : 'Margin'}</th>
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

          <div className="lg:hidden space-y-2">
            {tripsMatrix.map((t) => {
              const margin = t.sales > 0 ? Math.round((t.profit / t.sales) * 100) : 0
              return (
                <div key={t.name} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">{t.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {margin}% {isRtl ? 'هامش' : 'Margin'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">{isRtl ? 'الحجوزات والأفراد:' : 'Bookings & PAX:'}</span>
                      <span className="font-mono font-bold">{t.bookingsCount} {isRtl ? 'حجز' : 'bk'} ({t.pax} PAX)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">{isRtl ? 'المبيعات:' : 'Sales:'}</span>
                      <span className="font-mono font-bold text-slate-900">€{t.sales.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">{isRtl ? 'التكلفة:' : 'Cost:'}</span>
                      <span className="font-mono font-bold text-amber-700">€{t.cost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">{isRtl ? 'صافي الربح:' : 'Profit:'}</span>
                      <span className="font-mono font-black text-emerald-600">+€{t.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeReportTab === 'PARTNERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 sm:p-5 space-y-3">
          <div className="text-xs font-black text-slate-800">
            {isRtl ? 'موقف حسابات المنفذين والتوريدات مع إمكانية استخراج فاتورة A4 وتصدير Excel' : 'Supplier balances and settlement claims with A4 printing & Excel export'}
          </div>

          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-[#0a2540] text-white h-11 font-bold">
                  <th className="px-3 text-start">{isRtl ? 'المنفذ / المورد' : 'Supplier'}</th>
                  <th className="px-3 text-start">{isRtl ? 'القسم' : 'Category'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'الحجوزات المنفذة' : 'Bookings'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'التكلفة المستحقة (€)' : 'Cost Due (€)'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'المسدد للمورد (€)' : 'Settled (€)'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'المتبقي له (€)' : 'Balance Due (€)'}</th>
                  <th className="px-3 text-center">{isRtl ? 'الفاتورة والمطالبة' : 'Statement & Invoice'}</th>
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
                      <td className="px-3 text-center font-mono font-bold">{exBookings.length} {isRtl ? 'حجز' : 'bk'}</td>
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
                          className="px-3 py-1 bg-slate-100 hover:bg-[#0a2540] hover:text-white text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
                        >
                          {isRtl ? 'فاتورة 360° A4' : '360° Invoice'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-2">
            {executors.map((ex) => {
              const exBookings = filteredBookings.filter((b) => b.executor_id === ex.id)
              const totalCostDue = exBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
              const totalPaid = ex.total_paid || 0
              const remainingBalance = Math.max(0, totalCostDue - totalPaid)

              return (
                <div key={ex.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-900 text-sm">{ex.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{ex.category}</div>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playClick()
                        setInvoiceModal({ isOpen: true, executor: ex })
                      }}
                      className="px-3 py-1 bg-[#0284c7] text-white rounded-full text-xs font-black shadow-xs cursor-pointer"
                    >
                      {isRtl ? 'كشف الحساب' : 'Statement'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs bg-white p-2 rounded-xl border border-slate-100 font-mono text-center">
                    <div>
                      <span className="text-slate-400 block text-[9px] font-sans">{isRtl ? 'المستحق' : 'Due'}</span>
                      <span className="font-bold text-slate-800">€{totalCostDue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-sans">{isRtl ? 'المسدد' : 'Settled'}</span>
                      <span className="font-bold text-emerald-600">€{totalPaid.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-sans">{isRtl ? 'المتبقي' : 'Balance'}</span>
                      <span className="font-black text-rose-600">€{remainingBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeReportTab === 'LEDGER_360' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-black text-slate-800">
              {isRtl ? 'كشف الحساب التفصيلي 360° لكافة حركات الفترة (حجز بحجز):' : '360° Itemized Ledger for all bookings in period:'}
            </div>
            <div className="text-xs font-mono text-slate-500 font-bold">
              {filteredBookings.length} {isRtl ? 'حركة مسجلة' : 'movements'}
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-[#0a2540] text-white h-11 font-bold">
                  <th className="px-3 text-start font-mono">#SR</th>
                  <th className="px-3 text-start">{isRtl ? 'التاريخ' : 'Date'}</th>
                  <th className="px-3 text-start">{isRtl ? 'النزيل' : 'Guest'}</th>
                  <th className="px-3 text-start">{isRtl ? 'الفندق (الغرفة)' : 'Hotel (Room)'}</th>
                  <th className="px-3 text-start">{isRtl ? 'الرحلة' : 'Trip'}</th>
                  <th className="px-3 text-center">{isRtl ? 'الأفراد' : 'PAX'}</th>
                  <th className="px-3 text-start">{isRtl ? 'المندوب' : 'Seller'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'البيع (€)' : 'Sell (€)'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'التكلفة (€)' : 'Cost (€)'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'الربح (€)' : 'Profit (€)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      {isRtl ? 'لا توجد حركات مسجلة في هذه الفترة.' : 'No bookings in the selected period.'}
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((b) => (
                    <tr key={b.sr} className="h-11 hover:bg-slate-50 transition-colors">
                      <td className="px-3 font-mono font-bold text-[#0284c7]">#{b.sr}</td>
                      <td className="px-3 font-mono text-slate-600">{b.date}</td>
                      <td className="px-3 font-bold text-slate-800">{b.guest_name}</td>
                      <td className="px-3 text-slate-600">{b.hotel} ({b.room})</td>
                      <td className="px-3 font-bold text-slate-800">{b.trip_type}</td>
                      <td className="px-3 text-center font-mono">
                        {b.adult} {isRtl ? 'ك' : 'ad'} {b.child > 0 ? `+ ${b.child} ${isRtl ? 'ص' : 'ch'}` : ''}
                      </td>
                      <td className="px-3 text-slate-600 font-bold">{b.seller || '—'}</td>
                      <td className="px-3 text-center font-mono font-bold text-slate-900">€{b.sell_eur}</td>
                      <td className="px-3 text-center font-mono font-bold text-amber-700">€{b.cost_eur}</td>
                      <td className="px-3 text-center font-mono font-black text-emerald-600">
                        +€{b.profit_eur}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-2">
            {paginatedBookings.map((b) => (
              <div key={b.sr} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#0284c7] text-xs">#{b.sr}</span>
                    <span className="font-black text-slate-900 text-xs">{b.guest_name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">{b.date}</span>
                </div>
                <div className="text-xs text-slate-600 flex justify-between">
                  <span>{b.trip_type}</span>
                  <span>{b.hotel} ({b.room})</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs bg-white p-2 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-sans">{isRtl ? 'البيع' : 'Sell'}</span>
                    <span className="font-bold">€{b.sell_eur}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-sans">{isRtl ? 'التكلفة' : 'Cost'}</span>
                    <span className="font-bold text-amber-700">€{b.cost_eur}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-sans">{isRtl ? 'الربح' : 'Profit'}</span>
                    <span className="font-black text-emerald-600">+€{b.profit_eur}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-bold">
                {isRtl ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeReportTab === 'EXPENSES' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-slate-800">
              {isRtl ? 'سجل المصاريف التشغيلية (وقود، إكراميات عمالة، ضيافة، وبترول)' : 'Operating expenses log (Fuel, tips, hospitality, maintenance)'}
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إضافة مصروف' : 'Add Expense'}</span>
            </button>
          </div>

          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white h-11 font-bold">
                  <th className="px-3 text-start">{isRtl ? 'التاريخ' : 'Date'}</th>
                  <th className="px-3 text-start">{isRtl ? 'بند المصروف' : 'Expense Title'}</th>
                  <th className="px-3 text-start">{isRtl ? 'القسم والتصنيف' : 'Category'}</th>
                  <th className="px-3 text-center font-mono">{isRtl ? 'المبلغ' : 'Amount'}</th>
                  <th className="px-3 text-start">{isRtl ? 'ملاحظات' : 'Notes'}</th>
                  <th className="px-3 text-center">{isRtl ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      {isRtl ? 'لا توجد مصاريف مسجلة في هذه الفترة.' : 'No expenses recorded in this period.'}
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
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
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

          <div className="lg:hidden space-y-2">
            {filteredExpenses.map((exp) => (
              <div key={exp.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <div className="font-black text-slate-900 text-xs">{exp.title}</div>
                  <div className="text-[10px] text-slate-500 font-bold">{exp.date} • {exp.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-rose-600 text-xs">
                    {exp.currency === 'EGP' ? `${exp.amount} ج.م` : `€${exp.amount}`}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id, exp.title)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span>{isRtl ? 'تسجيل مصروف تشغيلي جديد' : 'Record Operating Expense'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{isRtl ? 'بند المصروف' : 'Title'}</label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? 'مثال: وقود لانش الفيروز' : 'e.g. Boat Fuel'}
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{isRtl ? 'المبلغ' : 'Amount'}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{isRtl ? 'العملة' : 'Currency'}</label>
                  <select
                    value={newExp.currency}
                    onChange={(e) => setNewExp({ ...newExp, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="EUR">يورو (€)</option>
                    <option value="EGP">جنيه مصري (L.E)</option>
                    <option value="USD">دولار ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{isRtl ? 'التصنيف' : 'Category'}</label>
                <select
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="وقود وبترول">وقود وبترول</option>
                  <option value="إكراميات عمالة ومارينا">إكراميات عمالة ومارينا</option>
                  <option value="ضيافة ومشروبات">ضيافة ومشروبات</option>
                  <option value="صيانة دورية">صيانة دورية</option>
                  <option value="رسوم مارينا وتصاريح">رسوم مارينا وتصاريح</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{isRtl ? 'ملاحظات' : 'Notes'}</label>
                <input
                  type="text"
                  placeholder={isRtl ? 'تفاصيل إضافية (اختياري)' : 'Additional details (optional)'}
                  value={newExp.notes}
                  onChange={(e) => setNewExp({ ...newExp, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  {isRtl ? 'قيد المصروف' : 'Save Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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