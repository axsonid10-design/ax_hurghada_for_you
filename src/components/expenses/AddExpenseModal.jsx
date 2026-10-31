import React, { useState, useEffect } from 'react'
import { X, Receipt, Check, Wallet, Building2, Wrench, Coffee } from 'lucide-react'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AddExpenseModal({ isOpen, onClose, onAddExpense, custodies = [] }) {
  const { lang, t } = useAXStore()
  const isRtl = lang === 'ar'
  const todayIso = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    title: '',
    expense_type: 'operational',
    category: isRtl ? 'وقود وبترول وسولار' : 'Fuel & Diesel',
    amount: '',
    currency: 'EGP',
    date: todayIso,
    source: 'treasury',
    custody_holder: '',
    recipient: '',
    invoice_no: '',
    voucher_no: '',
    notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      const vch = 'VCH-' + Math.floor(1000 + Math.random() * 9000)
      setForm((prev) => ({
        ...prev,
        voucher_no: prev.voucher_no || vch,
        date: todayIso
      }))
    }
  }, [isOpen, todayIso])

  if (!isOpen) return null

  const categoriesByType = {
    fixed: [
      isRtl ? 'رواتب وأجور موظفين' : 'Salaries & Wages',
      isRtl ? 'إيجار مقرات ومكاتب' : 'Office Rent',
      isRtl ? 'فواتير ومرافق (كهرباء، مياه، نت)' : 'Utilities (Power, Water, Net)',
      isRtl ? 'تراخيص وتأمينات ورسوم حكومية' : 'Licenses & Government Fees'
    ],
    operational: [
      isRtl ? 'وقود وبترول وسولار' : 'Fuel & Diesel',
      isRtl ? 'صيانة يخوت ومعدات' : 'Yacht & Equipment Maintenance',
      isRtl ? 'بوفيه ومشروبات الرحلات' : 'Catering & Beverages',
      isRtl ? 'رسوم مارينا ومحميات وتصاريح' : 'Marina & Reserve Fees',
      isRtl ? 'انتقالات وسيارات وتوزيع' : 'Transportation & Vehicles'
    ],
    petty: [
      isRtl ? 'نثريات وضيافة وإكراميات' : 'Tips & Hospitality',
      isRtl ? 'مطبوعات وأدوات مكتبية' : 'Stationery & Printing',
      isRtl ? 'مصروفات يومية طارئة' : 'Emergency Petty Cash'
    ]
  }

  const handleTypeChange = (type) => {
    const defaultCat = categoriesByType[type][0]
    setForm({
      ...form,
      expense_type: type,
      category: defaultCat
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0 || !form.title.trim()) return

    soundManager.playSuccess()
    onAddExpense({
      ...form,
      amount: amt,
      title: form.title.trim(),
      recipient: form.recipient.trim(),
      voucher_no: form.voucher_no || ('VCH-' + Date.now().toString().slice(-4))
    })
    setForm({
      title: '',
      expense_type: 'operational',
      category: categoriesByType.operational[0],
      amount: '',
      currency: 'EGP',
      date: todayIso,
      source: 'treasury',
      custody_holder: '',
      recipient: '',
      invoice_no: '',
      voucher_no: '',
      notes: ''
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden font-tajawal my-auto">
        <div className="bg-[#0a2540] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black">
                {isRtl ? 'تسجيل إذن صرف / مصروف جديد' : 'Record New Expense / Voucher'}
              </h3>
              <p className="text-[11px] text-sky-300 font-bold mt-0.5">
                {isRtl ? 'مصروفات ثابتة وإدارية، تشغيلية، أو نثريات وعهد نقدية' : 'Fixed, operational, or custody petty cash expenses'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'نوع وطبيعة المصروف:' : 'Expense Type:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('operational')}
                className={`py-2 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                  form.expense_type === 'operational'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>{isRtl ? 'تشغيلي ورحلات' : 'Operational'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('fixed')}
                className={`py-2 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                  form.expense_type === 'fixed'
                    ? 'bg-sky-50 text-sky-900 border-sky-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>{isRtl ? 'ثابت وإداري' : 'Fixed & Rent'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('petty')}
                className={`py-2 px-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                  form.expense_type === 'petty'
                    ? 'bg-purple-50 text-purple-900 border-purple-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 text-purple-600" />
                <span>{isRtl ? 'نثريات وضيافة' : 'Petty Cash'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'بند المصروف / البيان بالتفصيل:' : 'Expense Item / Purpose:'}
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={isRtl ? 'مثال: شراء سولار 500 لتر للنش مارينا، أو فاتورة كهرباء المقر' : 'e.g. 500L boat diesel fuel, or office power bill'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'التصنيف المحاسبي:' : 'Category:'}
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {categoriesByType[form.expense_type].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'المبلغ:' : 'Amount:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-24 bg-slate-50 border border-slate-200 rounded-2xl px-2 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 flex-shrink-0"
                >
                  <option value="EGP">{isRtl ? 'ج.م' : 'EGP'}</option>
                  <option value="EUR">€ EUR</option>
                  <option value="USD">$ USD</option>
                  <option value="GBP">£ GBP</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="block text-xs font-black text-slate-800">
              {isRtl ? 'مصدر دفع المبلغ:' : 'Payment Source:'}
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="radio"
                  name="source"
                  checked={form.source === 'treasury'}
                  onChange={() => setForm({ ...form, source: 'treasury', custody_holder: '' })}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span>{isRtl ? 'الخزينة العامة للشركة' : 'Main Treasury'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="radio"
                  name="source"
                  checked={form.source === 'custody'}
                  onChange={() => setForm({ ...form, source: 'custody' })}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span className="text-amber-800">{isRtl ? 'خصماً من عهدة نقدية' : 'Paid from Custody'}</span>
              </label>
            </div>

            {form.source === 'custody' && (
              <div className="pt-2 border-t border-slate-200 animate-fadeIn">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isRtl ? 'اختر أمين العهدة المسدد منها:' : 'Select Custody Holder:'}
                </label>
                {custodies.length > 0 ? (
                  <select
                    value={form.custody_holder}
                    onChange={(e) => setForm({ ...form, custody_holder: e.target.value })}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">{isRtl ? '-- اختر من العهد المسجلة --' : '-- Select active custody --'}</option>
                    {custodies.map((c) => (
                      <option key={c.id} value={c.holder_name}>
                        {c.holder_name} ({c.amount} {c.currency} - {c.date})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.custody_holder}
                    onChange={(e) => setForm({ ...form, custody_holder: e.target.value })}
                    placeholder={isRtl ? 'اسم أمين العهدة' : 'Custody holder name'}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'اسم المستلم / المستفيد:' : 'Beneficiary / Recipient:'}
              </label>
              <input
                type="text"
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                placeholder={isRtl ? 'مثال: شركة الكهرباء، محطة وقود، الموظف...' : 'e.g. Electric Co, Fuel Station, Employee'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'تاريخ الصرف:' : 'Date:'}
              </label>
              <AX_CompanyDatePicker
                value={form.date}
                onChange={(d) => setForm({ ...form, date: d })}
                placeholder={isRtl ? 'تاريخ الصرف' : 'Date'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'رقم الفاتورة / المستند:' : 'Invoice / Doc Ref:'}
              </label>
              <input
                type="text"
                value={form.invoice_no}
                onChange={(e) => setForm({ ...form, invoice_no: e.target.value })}
                placeholder="INV-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'رقم إذن الصرف:' : 'Voucher No:'}
              </label>
              <input
                type="text"
                value={form.voucher_no}
                onChange={(e) => setForm({ ...form, voucher_no: e.target.value })}
                placeholder="VCH-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'ملاحظات إضافية:' : 'Additional Notes:'}
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={isRtl ? 'ملاحظات تسوية أو تفاصيل إضافية...' : 'Additional notes...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-rose-200" />
              <span>{isRtl ? 'اعتماد وحفظ المصروف' : 'Approve & Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
