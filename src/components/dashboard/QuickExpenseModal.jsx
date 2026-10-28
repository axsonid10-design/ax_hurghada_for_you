import React, { useState } from 'react'
import { X, Receipt, Calendar, Tag, DollarSign, FileText } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'

const EXPENSE_CATEGORIES = [
  'وقود وبترول',
  'عمالة وإكراميات',
  'ضيافة وتشغيل',
  'صيانة وتجهيزات',
  'رسوم وموانئ',
  'مصروفات إدارية',
  'أخرى'
]

export function QuickExpenseModal({ isOpen, onClose, onAddExpense }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !amount) return

    soundManager.playSuccess()
    onAddExpense({
      title: title.trim(),
      category,
      amount: Number(amount) || 0,
      currency,
      date,
      notes: notes.trim()
    })

    setTitle('')
    setAmount('')
    setNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">تسجيل مصروف</h3>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick()
              onClose()
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>بيان المصروف</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: وقود يخت هولا هولا، إكراميات بحارة..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-xs font-bold outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                <span>تصنيف المصروف</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-xs font-bold outline-none bg-white transition-all"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>تاريخ الصرف</span>
              </label>
              <AX_CompanyDatePicker
                value={date}
                onChange={(d) => setDate(d)}
                placeholder="تاريخ الصرف"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-sky-600" />
                <span>المبلغ</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-xs font-mono font-black outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>العملة</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['EUR', 'EGP', 'USD'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => {
                      soundManager.playClick()
                      setCurrency(curr)
                    }}
                    className={`py-2 rounded-2xl text-xs font-black transition-all ${
                      currency === curr
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {curr === 'EUR' ? '€ يورو' : curr === 'EGP' ? 'ج.م' : '$ دولار'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ملاحظات إضافية (اختياري)</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل خاصة بالحركة أو الفاتورة..."
              className="w-full px-4 py-2 rounded-2xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-xs font-bold outline-none resize-none transition-all"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick()
                onClose()
              }}
              className="px-5 py-2.5 rounded-full text-xs font-black text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-black text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>حفظ المصروف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
