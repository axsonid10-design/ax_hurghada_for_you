import React, { useState, useMemo } from 'react'
import {
  Receipt,
  Wallet,
  Plus,
  Search,
  Printer,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Wrench,
  Coffee,
  Coins,
  ArrowRightLeft,
  Calendar,
  Filter,
  Eye,
  Check
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { AX_PaginationBar } from '../common/AX_PaginationBar'
import { AddExpenseModal } from './AddExpenseModal'
import { AddCustodyModal } from './AddCustodyModal'
import { CustodySettlementModal } from './CustodySettlementModal'
import { PrintDisbursementVoucherModal } from './PrintDisbursementVoucherModal'
import { PrintCustodySettlementModal } from './PrintCustodySettlementModal'
import { PrintPnlStatementModal } from './PrintPnlStatementModal'

export function ExpensesManagement() {
  const {
    expenses = [],
    custodies = [],
    bookings = [],
    addExpense,
    deleteExpense,
    addCustodyAdvance,
    settleCustodyAdvance,
    deleteCustodyAdvance,
    openConfirmModal,
    lang,
    t
  } = useAXStore()

  const isRtl = lang === 'ar'
  const egpRate = 53.25

  const todayIso = new Date().toISOString().split('T')[0]
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activeSubTab, setActiveSubTab] = useState('expenses')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterSource, setFilterSource] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isAddCustodyOpen, setIsAddCustodyOpen] = useState(false)
  const [settlementModalData, setSettlementModalData] = useState({ isOpen: false, custody: null })
  const [printVoucherData, setPrintVoucherData] = useState({ isOpen: false, expense: null })
  const [printLiquidationData, setPrintLiquidationData] = useState({ isOpen: false, custody: null, expenses: [] })
  const [isPrintPnlOpen, setIsPrintPnlOpen] = useState(false)

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchDateFrom = !dateFrom || e.date >= dateFrom
      const matchDateTo = !dateTo || e.date <= dateTo
      const matchCat = filterCategory === 'ALL' || e.category === filterCategory || e.expense_type === filterCategory
      const matchSource = filterSource === 'ALL' || (filterSource === 'custody' ? e.source === 'custody' : e.source !== 'custody')
      const matchSearch =
        (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.recipient || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.invoice_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.voucher_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.notes || '').toLowerCase().includes(searchQuery.toLowerCase())

      return matchDateFrom && matchDateTo && matchCat && matchSource && matchSearch
    })
  }, [expenses, dateFrom, dateTo, filterCategory, filterSource, searchQuery])

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchDateFrom = !dateFrom || b.date >= dateFrom
      const matchDateTo = !dateTo || b.date <= dateTo
      return matchDateFrom && matchDateTo
    })
  }, [bookings, dateFrom, dateTo])

  const totalSalesEur = filteredBookings.reduce((sum, b) => sum + (Number(b.sell_eur) || 0), 0)
  const totalCostEur = filteredBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
  const grossProfitEur = totalSalesEur - totalCostEur

  const toEur = (amt, curr) => {
    const val = Number(amt) || 0
    if (curr === 'EGP') return val / egpRate
    if (curr === 'USD') return val / 1.08
    if (curr === 'GBP') return val / 0.85
    return val
  }

  const fixedExpensesEur = filteredExpenses
    .filter((e) => e.expense_type === 'fixed' || (e.category && (e.category.includes('رواتب') || e.category.includes('إيجار') || e.category.includes('فواتير'))))
    .reduce((sum, e) => sum + toEur(e.amount, e.currency), 0)

  const variableExpensesEur = filteredExpenses
    .filter((e) => e.expense_type === 'operational' || (e.category && (e.category.includes('وقود') || e.category.includes('صيانة') || e.category.includes('بوفيه') || e.category.includes('رسوم'))))
    .reduce((sum, e) => sum + toEur(e.amount, e.currency), 0)

  const pettyExpensesEur = filteredExpenses
    .filter((e) => e.expense_type === 'petty' || e.source === 'custody' || (e.category && (e.category.includes('نثريات') || e.category.includes('ضيافة'))))
    .reduce((sum, e) => sum + toEur(e.amount, e.currency), 0)

  const totalExpensesEur = filteredExpenses.reduce((sum, e) => sum + toEur(e.amount, e.currency), 0)
  const netProfitEur = grossProfitEur - totalExpensesEur
  const netMargin = totalSalesEur > 0 ? Math.round((netProfitEur / totalSalesEur) * 100) : 0

  const totalCustodyAdvanceEgp = custodies.reduce((sum, c) => {
    const val = Number(c.amount) || 0
    if (c.currency === 'EUR') return sum + val * egpRate
    return sum + val
  }, 0)

  const totalCustodySpentEgp = expenses
    .filter((e) => e.source === 'custody')
    .reduce((sum, e) => {
      const val = Number(e.amount) || 0
      if (e.currency === 'EUR') return sum + val * egpRate
      return sum + val
    }, 0)

  const currentCustodyBalanceEgp = totalCustodyAdvanceEgp - totalCustodySpentEgp

  const totalPages = Math.ceil(filteredExpenses.length / pageSize) || 1
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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

  const handleDeleteCustody = (id, name) => {
    openConfirmModal({
      title: isRtl ? 'حذف قيد العهدة' : 'Delete Custody',
      message: isRtl ? `هل تريد حذف العهدة المسجلة باسم [${name}]؟` : `Delete custody record for [${name}]?`,
      confirmText: isRtl ? 'نعم، حذف' : 'Delete',
      type: 'danger',
      onConfirm: () => {
        soundManager.playAlert()
        deleteCustodyAdvance(id)
      }
    })
  }

  const handleOpenPrintLiquidation = (custody) => {
    const matched = expenses.filter(
      (e) => e.source === 'custody' && (!e.custody_holder || e.custody_holder === custody.holder_name)
    )
    setPrintLiquidationData({
      isOpen: true,
      custody,
      expenses: matched
    })
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-white p-3.5 sm:p-5 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-600" />
            <span>{t('expenses_custody_title')}</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">
            {t('expenses_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              soundManager.playClick()
              setIsAddExpenseOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_expense_btn')}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              setIsAddCustodyOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-sky-400" />
            <span>{t('add_custody_btn')}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              setIsPrintPnlOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('print_pnl')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-rose-200/90 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800">
            <span>{t('pnl_total_expenses')}</span>
            <div className="p-1 sm:p-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="py-2">
            <div className="text-base sm:text-2xl font-mono font-black text-rose-700">
              €{Math.round(totalExpensesEur).toLocaleString()}
            </div>
            <div className="text-[11px] font-mono font-bold text-slate-400 mt-0.5">
              ≈ {Math.round(totalExpensesEur * egpRate).toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-bold">
            {filteredExpenses.length} {t('items_count')}
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-sky-200/90 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-sky-800">
            <span>{t('fixed_cat')}</span>
            <div className="p-1 sm:p-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="py-2">
            <div className="text-base sm:text-2xl font-mono font-black text-sky-900">
              €{Math.round(fixedExpensesEur).toLocaleString()}
            </div>
            <div className="text-[11px] font-mono font-bold text-slate-400 mt-0.5">
              {isRtl ? 'رواتب، إيجار، فواتير' : 'Salaries, Rent, Bills'}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-bold">
            {Math.round(fixedExpensesEur * egpRate).toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-amber-200/90 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>{t('current_custody_balance')}</span>
            <div className="p-1 sm:p-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="py-2">
            <div className="text-base sm:text-2xl font-mono font-black text-amber-900">
              {Math.round(currentCustodyBalanceEgp).toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
            </div>
            <div className="text-[11px] font-mono font-bold text-slate-400 mt-0.5">
              {isRtl ? `منصرف: ${Math.round(totalCustodySpentEgp).toLocaleString()} ج.م` : `Spent: ${Math.round(totalCustodySpentEgp).toLocaleString()} EGP`}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-bold">
            {custodies.length} {isRtl ? 'عهدة مسجلة' : 'custody advances'}
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-emerald-300 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>{t('pnl_net_profit')}</span>
            <div className="p-1 sm:p-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="py-2">
            <div className={`text-base sm:text-2xl font-mono font-black ${netProfitEur >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              €{Math.round(netProfitEur).toLocaleString()}
            </div>
            <div className="text-[11px] font-mono font-bold text-slate-400 mt-0.5">
              ≈ {Math.round(netProfitEur * egpRate).toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-emerald-700 font-black">
            {t('pnl_margin')}: {netMargin}%
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200 self-start w-fit">
        <button
          onClick={() => {
            soundManager.playClick()
            setActiveSubTab('expenses')
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === 'expenses'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{t('sub_expenses_list')}</span>
          <span className="text-[10px] font-mono px-1.5 rounded-full bg-white/20">
            {filteredExpenses.length}
          </span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick()
            setActiveSubTab('custody')
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === 'custody'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>{t('sub_custody')}</span>
          <span className="text-[10px] font-mono px-1.5 rounded-full bg-white/20">
            {custodies.length}
          </span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick()
            setActiveSubTab('pnl')
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-2 ${
            activeSubTab === 'pnl'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>{t('sub_pnl')}</span>
        </button>
      </div>

      {activeSubTab !== 'custody' && (
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-soft space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('from_date')}</label>
              <AX_CompanyDatePicker
                value={dateFrom}
                onChange={(d) => {
                  setDateFrom(d)
                  setCurrentPage(1)
                }}
                placeholder={t('from_date')}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('to_date')}</label>
              <AX_CompanyDatePicker
                value={dateTo}
                onChange={(d) => {
                  setDateTo(d)
                  setCurrentPage(1)
                }}
                placeholder={t('to_date')}
              />
            </div>

            {activeSubTab === 'expenses' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{isRtl ? 'التصنيف' : 'Category'}</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="ALL">{t('all_categories_filter')}</option>
                    <option value="fixed">{t('fixed_cat')}</option>
                    <option value="operational">{t('operational_cat')}</option>
                    <option value="petty">{t('petty_cat')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">{isRtl ? 'المصدر' : 'Source'}</label>
                  <select
                    value={filterSource}
                    onChange={(e) => {
                      setFilterSource(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="ALL">{t('all_sources_filter')}</option>
                    <option value="treasury">{t('source_cash')}</option>
                    <option value="custody">{t('source_custody')}</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {activeSubTab === 'expenses' && (
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder={isRtl ? 'بحث في المصروفات بالبيان، المستلم، رقم الفاتورة أو إذن الصرف...' : 'Search by description, recipient, invoice, or voucher #...'}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pe-4 ps-10 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-2.5 pointer-events-none" />
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'expenses' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
            {paginatedExpenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-sky-300 font-mono">
                      #{exp.voucher_no || exp.id?.slice(-5)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      📅 {exp.date}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {exp.category || t('fixed_cat')}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900">{exp.title}</h4>
                  <div className="text-xs text-slate-500 mt-1">
                    {isRtl ? 'المستلم:' : 'To:'} <span className="font-bold text-slate-800">{exp.recipient || '-'}</span>
                  </div>
                  {exp.notes && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{exp.notes}</p>
                  )}
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 font-sans ml-1">{isRtl ? 'المصدر:' : 'Source:'}</span>
                    <span className="font-bold text-slate-800">
                      {exp.source === 'custody' ? `عهدة (${exp.custody_holder || 'أمين'})` : t('source_cash')}
                    </span>
                  </div>
                  <div className="text-base font-black text-rose-700">
                    {Number(exp.amount).toLocaleString()} {exp.currency || 'EGP'}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setPrintVoucherData({ isOpen: true, expense: exp })}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>{t('print_voucher')}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(exp.id, exp.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-soft overflow-x-auto w-full">
            <table className="w-full text-start border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-[#0f172a] text-white text-xs font-bold h-11">
                  <th className="px-3 text-start w-24 font-mono">{t('voucher_no')}</th>
                  <th className="px-3 text-start w-28">{t('date')}</th>
                  <th className="px-3 text-start">{t('expense_item_title')}</th>
                  <th className="px-3 text-start w-40">{isRtl ? 'التصنيف' : 'Category'}</th>
                  <th className="px-3 text-start w-40">{t('recipient_name')}</th>
                  <th className="px-3 text-start w-32">{isRtl ? 'مصدر الدفع' : 'Source'}</th>
                  <th className="px-3 text-end w-32 font-mono">{t('amount')}</th>
                  <th className="px-3 text-center w-32">{t('th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {paginatedExpenses.map((exp) => (
                  <tr key={exp.id} className="h-12 hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                    <td className="px-3 font-mono font-bold text-sky-700">
                      #{exp.voucher_no || exp.id?.slice(-5)}
                    </td>
                    <td className="px-3 font-mono text-slate-600">
                      {exp.date}
                    </td>
                    <td className="px-3 font-black text-slate-900 max-w-[250px] truncate" title={exp.title}>
                      {exp.title}
                    </td>
                    <td className="px-3 text-slate-700 font-bold">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-3 text-slate-700 font-bold max-w-[150px] truncate">
                      {exp.recipient || '-'}
                    </td>
                    <td className="px-3">
                      {exp.source === 'custody' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                          {isRtl ? 'عهدة نقدية' : 'Custody'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-900 border border-sky-300">
                          {isRtl ? 'خزينة عامة' : 'Treasury'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 text-end font-mono font-black text-rose-700">
                      {Number(exp.amount).toLocaleString()} {exp.currency || 'EGP'}
                    </td>
                    <td className="px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPrintVoucherData({ isOpen: true, expense: exp })}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-slate-600" />
                          <span>{isRtl ? 'إذن A4' : 'A4'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id, exp.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      {isRtl ? 'لا توجد مصروفات مسجلة تطابق شروط البحث' : 'No expenses recorded matching the filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredExpenses.length > pageSize && (
            <AX_PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredExpenses.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {activeSubTab === 'custody' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-amber-950 text-sm">
                  {isRtl ? 'دورة العهدة النقدية اليومية والأرباح' : 'Daily Cash Custody Operations'}
                </h4>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  {isRtl
                    ? 'تسليم مبالغ العهدة لأمين الصندوق أو المشرفين لصرف النثريات وسولار المراكب، مع إمكانية التصفية الفورية وطباعة كشوف التصفية A4 المعتمدة.'
                    : 'Manage custody funds given to supervisors for petty cash and fuel, with instant reconciliation and official A4 settlement sheets.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddCustodyOpen(true)}
              className="px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>{t('add_custody_btn')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {custodies.map((cust) => {
              const custExpenses = expenses.filter(
                (e) => e.source === 'custody' && (!e.custody_holder || e.custody_holder === cust.holder_name)
              )
              const spent = custExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
              const balance = Number(cust.amount || 0) - spent
              const isSettled = cust.status === 'settled' || cust.settled

              return (
                <div
                  key={cust.id}
                  className={`bg-white rounded-3xl p-4 border shadow-soft space-y-3 transition-all ${
                    isSettled ? 'border-slate-200 opacity-90' : 'border-amber-300 ring-1 ring-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{cust.holder_name}</h4>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        📅 {cust.date}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      isSettled
                        ? 'bg-slate-100 text-slate-700 border border-slate-300'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-300 animate-pulse'
                    }`}>
                      {isSettled ? t('settled_custody') : t('open_custody')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">{isRtl ? 'المستلم' : 'Advance'}</span>
                      <span className="font-mono font-black text-slate-900">
                        {Number(cust.amount).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">{isRtl ? 'المنصرف' : 'Spent'}</span>
                      <span className="font-mono font-black text-rose-700">
                        {spent.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">{isRtl ? 'المتبقي' : 'Balance'}</span>
                      <span className={`font-mono font-black ${balance >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {balance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {cust.notes && (
                    <p className="text-[11px] text-slate-500 font-medium">{cust.notes}</p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleOpenPrintLiquidation(cust)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>{t('print_settlement')}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {!isSettled && (
                        <button
                          onClick={() => setSettlementModalData({ isOpen: true, custody: cust })}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('settle_custody_btn')}</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCustody(cust.id, cust.holder_name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {custodies.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-dashed border-slate-200">
                {isRtl ? 'لا توجد عهد نقدية مسجلة حتى الآن. اضغط "تسليم / إضافة عهدة" لبدء حركة جديدة.' : 'No active custody advances recorded yet. Click "New Custody Advance" to start.'}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'pnl' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <span>{t('pnl_net_profit')} & {t('sub_pnl')}</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                {isRtl ? 'تحليل تفصيلي لمصادر الإيرادات والمصروفات ومعدل الربحية الصافي' : 'Detailed breakdown of revenues, costs, and net margin'}
              </p>
            </div>

            <button
              onClick={() => setIsPrintPnlOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print_pnl')}</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <div className="p-3.5 bg-sky-50 font-black text-sky-950 flex items-center justify-between border-b border-sky-100">
              <span className="text-sm">{t('pnl_revenue')}</span>
              <span className="font-mono text-base">€{Math.round(totalSalesEur).toLocaleString()}</span>
            </div>

            <div className="p-3 flex items-center justify-between text-slate-700 border-b border-slate-100 font-bold ps-6">
              <span>- {t('pnl_direct_costs')}</span>
              <span className="font-mono text-rose-700">(€{Math.round(totalCostEur).toLocaleString()})</span>
            </div>

            <div className="p-3.5 bg-slate-100 font-black text-slate-900 flex items-center justify-between border-b border-slate-200">
              <span>= {t('pnl_gross_profit')}</span>
              <span className="font-mono text-base">€{Math.round(grossProfitEur).toLocaleString()}</span>
            </div>

            <div className="p-3 flex items-center justify-between text-slate-700 border-b border-slate-100 font-bold ps-6">
              <span>- {t('pnl_fixed_expenses')} (رواتب، إيجار، فواتير)</span>
              <span className="font-mono text-rose-700">(€{Math.round(fixedExpensesEur).toLocaleString()})</span>
            </div>

            <div className="p-3 flex items-center justify-between text-slate-700 border-b border-slate-100 font-bold ps-6">
              <span>- {t('pnl_variable_expenses')} (وقود، صيانة، بوفيه)</span>
              <span className="font-mono text-rose-700">(€{Math.round(variableExpensesEur).toLocaleString()})</span>
            </div>

            <div className="p-3 flex items-center justify-between text-slate-700 border-b border-slate-100 font-bold ps-6">
              <span>- {t('petty_cat')} والعهد النقدية</span>
              <span className="font-mono text-rose-700">(€{Math.round(pettyExpensesEur).toLocaleString()})</span>
            </div>

            <div className={`p-4 font-black flex items-center justify-between text-sm sm:text-base ${
              netProfitEur >= 0 ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'
            }`}>
              <div>
                <span className="block">{t('pnl_net_profit')}</span>
                <span className="text-[11px] font-normal text-slate-500 font-mono">
                  {t('pnl_margin')}: {netMargin}% • ≈ {Math.round(netProfitEur * egpRate).toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
                </span>
              </div>
              <span className={`font-mono font-black text-xl ${netProfitEur >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                €{Math.round(netProfitEur).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={addExpense}
        custodies={custodies.filter((c) => c.status !== 'settled')}
      />

      <AddCustodyModal
        isOpen={isAddCustodyOpen}
        onClose={() => setIsAddCustodyOpen(false)}
        onAddCustody={addCustodyAdvance}
      />

      <CustodySettlementModal
        isOpen={settlementModalData.isOpen}
        onClose={() => setSettlementModalData({ isOpen: false, custody: null })}
        custody={settlementModalData.custody}
        custodyExpenses={expenses.filter(
          (e) => e.source === 'custody' && (!e.custody_holder || e.custody_holder === settlementModalData.custody?.holder_name)
        )}
        onSettle={settleCustodyAdvance}
        onPrintLiquidation={(cust, exps) => {
          setSettlementModalData({ isOpen: false, custody: null })
          setPrintLiquidationData({ isOpen: true, custody: cust, expenses: exps })
        }}
      />

      <PrintDisbursementVoucherModal
        isOpen={printVoucherData.isOpen}
        onClose={() => setPrintVoucherData({ isOpen: false, expense: null })}
        expense={printVoucherData.expense}
      />

      <PrintCustodySettlementModal
        isOpen={printLiquidationData.isOpen}
        onClose={() => setPrintLiquidationData({ isOpen: false, custody: null, expenses: [] })}
        custody={printLiquidationData.custody}
        custodyExpenses={printLiquidationData.expenses}
      />

      <PrintPnlStatementModal
        isOpen={isPrintPnlOpen}
        onClose={() => setIsPrintPnlOpen(false)}
        dateFrom={dateFrom || todayIso}
        dateTo={dateTo || todayIso}
        totalSalesEur={totalSalesEur}
        totalCostEur={totalCostEur}
        grossProfitEur={grossProfitEur}
        fixedExpensesEur={fixedExpensesEur}
        variableExpensesEur={variableExpensesEur}
        pettyExpensesEur={pettyExpensesEur}
        totalExpensesEur={totalExpensesEur}
        netProfitEur={netProfitEur}
        netMargin={netMargin}
        totalBookings={filteredBookings.length}
        totalPax={filteredBookings.reduce((s, b) => s + (Number(b.adult) || 0) + (Number(b.child) || 0), 0)}
        rates={{ EGP: egpRate }}
      />
    </div>
  )
}
