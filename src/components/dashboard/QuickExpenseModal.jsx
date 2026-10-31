import React, { useState } from 'react'
import { X, Receipt, Calendar, Tag, DollarSign, FileText } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { useAXStore } from '../../store/useAXStore'

const EXPENSE_CATEGORIES = [
  { ar: 'وقود وبترول', en: 'Fuel & Oil' },
  { ar: 'عمالة وإكراميات', en: 'Tips & Crew' },
  { ar: 'ضيافة وتشغيل', en: 'Catering & Ops' },
  { ar: 'صيانة وتجهيزات', en: 'Maintenance' },
  { ar: 'رسوم وموانئ', en: 'Port & Marine Fees' },
  { ar: 'مصروفات إدارية', en: 'Admin Expenses' },
  { ar: 'أخرى', en: 'Other' }
]

export function QuickExpenseModal({ isOpen, onClose, onAddExpense }) {
  const { lang, t } = useAXStore()
  const isRtl = lang === 'ar'
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].ar)
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
              <h3 className="text-base font-black">{isRtl ? 'تسجيل مصروف سريع' : 'Quick Expense'}</h3>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick()
              onClose()
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>{isRtl ? 'بيان المصروف' : 'Expense Title'}</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRtl ? 'مثال: وقود يخت، إكراميات بحارة...' : 'e.g. Boat fuel, Crew tips...'}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-xs font-bold outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                <span>{isRtl ? 'تصنيف المصروف' : 'Category'}</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-xs font-bold outline-none bg-white transition-all cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.ar} value={c.ar}>
                    {isRtl ? c.ar : c.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>{isRtl ? 'تاريخ الصرف' : 'Date'}</span>
              </label>
              <AX_CompanyDatePicker
                value={date}
                onChange={(d) => setDate(d)}
                placeholder={isRtl ? 'تاريخ الصرف' : 'Expense Date'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-sky-600" />
                <span>{isRtl ? 'المبلغ' : 'Amount'}</span>
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
                <span>{isRtl ? 'العملة' : 'Currency'}</span>
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
                    className={`py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      currency === curr
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {curr === 'EUR' ? '€ EUR' : curr === 'EGP' ? 'EGP' : '$ USD'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {isRtl ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isRtl ? 'أي تفاصيل خاصة بالحركة أو الفاتورة...' : 'Any details regarding this expense...'}
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
              className="px-5 py-2.5 rounded-full text-xs font-black text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-black text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>{isRtl ? 'حفظ المصروف' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
