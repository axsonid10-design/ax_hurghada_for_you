import React, { useState } from 'react'
import {
  Users,
  Receipt,
  Trophy,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Tag
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'

const RANK_BADGES = ['🥇', '🥈', '🥉']

export function SalesLeaderboard({
  sellerBreakdown = [],
  filteredExpenses = [],
  onAddExpense,
  onDeleteExpense
}) {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [expTitle, setExpTitle] = useState('')
  const [expCategory, setExpCategory] = useState('وقود وبترول')
  const [expAmount, setExpAmount] = useState('')
  const [expCurrency, setExpCurrency] = useState('EUR')
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0])
  const [expNotes, setExpNotes] = useState('')

  const handleCreateExpense = (e) => {
    e.preventDefault()
    if (!expTitle || !expAmount) return

    soundManager.playSuccess()
    onAddExpense({
      title: expTitle,
      category: expCategory,
      amount: Number(expAmount) || 0,
      currency: expCurrency,
      date: expDate,
      notes: expNotes
    })

    setExpTitle('')
    setExpAmount('')
    setExpNotes('')
    setShowAddExpenseModal(false)
  }

  const totalExpenseEur = filteredExpenses.reduce((sum, exp) => {
    const amt = Number(exp.amount) || 0
    if (exp.currency === 'EGP') return sum + amt / 53.25
    if (exp.currency === 'USD') return sum + amt / 1.08
    return sum + amt
  }, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Sales Reps Leaderboard */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                سباق مندوبي وقنوات المبيعات
              </h3>
              <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                ترتيب البائعين حسب حصيلة الإيرادات وعدد الحجوزات
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-100">
            أعلى مبيعات
          </span>
        </div>

        <div className="space-y-2.5 py-1">
          {sellerBreakdown.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-bold">
              لا توجد بيانات مبيعات في هذه الفترة.
            </div>
          ) : (
            sellerBreakdown.map((s, idx) => {
              const maxSales = sellerBreakdown[0]?.sales || 1
              const pct = Math.min(100, Math.round((s.sales / maxSales) * 100))
              const badge = RANK_BADGES[idx] || `#${idx + 1}`

              return (
                <div
                  key={s.name}
                  className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{badge}</span>
                      <div>
                        <div className="font-black text-slate-800">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          {s.count} حجز • {s.pax} فرد
                        </div>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <div className="font-black text-emerald-600 text-sm">
                        €{s.sales.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        معدل الحجز: €{s.count > 0 ? Math.round(s.sales / s.count) : 0}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span>إجمالي القنوات النشطة: {sellerBreakdown.length}</span>
          <span className="text-indigo-600 font-mono">أعلى مبيعات: {sellerBreakdown[0]?.name || '—'}</span>
        </div>
      </div>

      {/* 2. Operating Expenses Log */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                سجل المصاريف التشغيلية (OpEx)
              </h3>
              <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                المصروفات النقدية، الوقود، الإكراميات، والإعاشة
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick()
              setShowAddExpenseModal(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-full text-xs font-black border border-rose-200 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل مصروف</span>
          </button>
        </div>

        <div className="space-y-2 py-1 max-h-[260px] overflow-y-auto custom-scrollbar">
          {filteredExpenses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-bold">
              لا توجد مصاريف تشغيلية مسجلة في هذا النطاق.
            </div>
          ) : (
            filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">{exp.title}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span className="font-mono">{exp.date}</span>
                    <span>•</span>
                    <span className="bg-slate-200/70 text-slate-600 px-1.5 py-0.2 rounded-full">
                      {exp.category}
                    </span>
                    {exp.notes && <span>({exp.notes})</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-rose-600 text-sm">
                    {exp.currency === 'EGP' ? `${exp.amount} ج.م` : `€${exp.amount}`}
                  </span>
                  <button
                    onClick={() => {
                      soundManager.playTrash()
                      onDeleteExpense(exp.id)
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف المصروف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 font-mono">
          <span>إجمالي المصروفات التشغيلية:</span>
          <span className="font-black text-rose-600 text-sm">
            €{Math.round(totalExpenseEur).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span>تسجيل مصروف تشغيلي جديد</span>
              </h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">بيان المصروف</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="مثال: وقود لانش مارينا، إكراميات عمال، وجبات طاقم"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المبلغ</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">العملة</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    {['EUR', 'EGP', 'USD'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setExpCurrency(c)}
                        className={`flex-1 py-1.5 rounded-xl font-mono font-bold text-xs transition-all ${
                          expCurrency === c ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        {c === 'EUR' ? '€' : c === 'EGP' ? 'ج.م' : '$'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">التصنيف</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'وقود وبترول',
                    'إكراميات ولودينج',
                    'ضيافة وإعاشة',
                    'صيانة وتجهيزات',
                    'انتقالات ولوجستيات',
                    'أخرى'
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setExpCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        expCategory === cat
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">التاريخ</label>
                <AX_CompanyDatePicker
                  value={expDate}
                  onChange={(d) => setExpDate(d)}
                  placeholder="تاريخ المصروف"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات (اختياري)</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="رقم الفاتورة أو تفاصيل إضافية"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-500 font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-full font-bold text-slate-500 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all active:scale-95"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
