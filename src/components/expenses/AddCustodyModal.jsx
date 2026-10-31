import React, { useState } from 'react'
import { X, Wallet, Plus, Check } from 'lucide-react'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AddCustodyModal({ isOpen, onClose, onAddCustody }) {
  const { lang, t } = useAXStore()
  const isRtl = lang === 'ar'
  const todayIso = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    date: todayIso,
    holder_name: '',
    amount: '',
    currency: 'EGP',
    notes: ''
  })

  if (!isOpen) return null

  const quickHolders = [
    isRtl ? 'صاحب الشركة / المالك' : 'Company Owner',
    isRtl ? 'مدير التشغيل العام' : 'Operations Manager',
    isRtl ? 'مشرف رحلات ومارينا' : 'Marina Supervisor',
    isRtl ? 'أمين الصندوق والخزينة' : 'Cashier'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0 || !form.holder_name.trim()) return

    soundManager.playSuccess()
    onAddCustody({
      ...form,
      amount: amt,
      holder_name: form.holder_name.trim()
    })
    setForm({
      date: todayIso,
      holder_name: '',
      amount: '',
      currency: 'EGP',
      notes: ''
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden font-tajawal">
        <div className="bg-[#0a2540] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black">
                {isRtl ? 'تسليم / إضافة رصيد عهدة نقدية' : 'New Custody Advance'}
              </h3>
              <p className="text-[11px] text-sky-300 font-bold mt-0.5">
                {isRtl ? 'تسجيل استلام نقدية من المالك أو الخزينة للصرف على التشغيل' : 'Record cash advance issued for operating disbursements'}
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'أمين / مستلم العهدة:' : 'Custody Holder / Receiver:'}
            </label>
            <input
              type="text"
              required
              value={form.holder_name}
              onChange={(e) => setForm({ ...form, holder_name: e.target.value })}
              placeholder={isRtl ? 'مثال: محمد علي / مدير التشغيل' : 'e.g. John Doe / Ops Manager'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[10px] text-slate-400 font-bold">{isRtl ? 'مقترحات سريعة:' : 'Quick:'}</span>
              {quickHolders.map((qh) => (
                <button
                  key={qh}
                  type="button"
                  onClick={() => setForm({ ...form, holder_name: qh })}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 transition-colors"
                >
                  {qh}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'المبلغ المستلم:' : 'Advance Amount:'}
              </label>
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
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRtl ? 'العملة:' : 'Currency:'}
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="EGP">{isRtl ? 'جنيه مصري (EGP)' : 'Egyptian Pound (EGP)'}</option>
                <option value="EUR">{isRtl ? 'يورو (€)' : 'Euro (€)'}</option>
                <option value="USD">{isRtl ? 'دولار ($)' : 'US Dollar ($)'}</option>
                <option value="GBP">{isRtl ? 'إسترليني (£)' : 'British Pound (£)'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'تاريخ استلام العهدة:' : 'Advance Date:'}
            </label>
            <AX_CompanyDatePicker
              value={form.date}
              onChange={(d) => setForm({ ...form, date: d })}
              placeholder={isRtl ? 'تاريخ الاستلام' : 'Date'}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'ملاحظات / الغرض من العهدة:' : 'Notes / Purpose:'}
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={isRtl ? 'مثال: عهدة أسبوعية لصرف السولار والنثريات اليومية' : 'e.g. Weekly operational petty cash'}
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
              className="px-6 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{isRtl ? 'حفظ واستلام العهدة' : 'Save Custody Advance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
