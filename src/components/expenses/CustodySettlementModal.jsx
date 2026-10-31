import React, { useState } from 'react'
import { X, CheckCircle2, AlertTriangle, FileSpreadsheet, Printer } from 'lucide-react'
import { AX_CompanyDatePicker } from '../common/AX_CompanyDatePicker'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function CustodySettlementModal({ isOpen, onClose, custody, custodyExpenses = [], onSettle, onPrintLiquidation }) {
  const { lang, t } = useAXStore()
  const isRtl = lang === 'ar'
  const todayIso = new Date().toISOString().split('T')[0]

  const [settlementDate, setSettlementDate] = useState(todayIso)
  const [settlementNotes, setSettlementNotes] = useState('')

  if (!isOpen || !custody) return null

  const currency = custody.currency || 'EGP'
  const advanceAmount = Number(custody.amount) || 0
  const totalSpent = custodyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const balance = advanceAmount - totalSpent
  const isDeficit = balance < 0
  const absBalance = Math.abs(balance)

  const handleConfirmSettle = (e) => {
    e.preventDefault()
    soundManager.playSuccess()
    onSettle(custody.id, {
      settlement_date: settlementDate,
      notes: settlementNotes,
      settled_balance: balance,
      settled_spent: totalSpent
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden font-tajawal">
        <div className="bg-[#0a2540] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-400/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black">
                {isRtl ? 'تصفية وإغلاق العهدة النقدية' : 'Settle & Close Custody'}
              </h3>
              <p className="text-[11px] text-sky-300 font-bold mt-0.5">
                {isRtl ? 'تسوية الفواتير ومطابقة الرصيد المتبقي أو العجز' : 'Reconcile invoices and calculate refund or deficit'}
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

        <form onSubmit={handleConfirmSettle} className="p-4 sm:p-6 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">{isRtl ? 'أمين العهدة:' : 'Custody Holder:'}</span>
              <span className="font-black text-slate-900 text-sm">{custody.holder_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">{isRtl ? 'مبلغ العهدة المستلم:' : 'Received Advance:'}</span>
              <span className="font-mono font-black text-slate-900">{advanceAmount.toLocaleString()} {currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">{isRtl ? 'إجمالي المنصرف بموجب فواتير:' : 'Total Spent:'}</span>
              <span className="font-mono font-black text-rose-700">({totalSpent.toLocaleString()} {currency})</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
              <span className="font-black text-slate-800">
                {isDeficit
                  ? (isRtl ? 'عجز مستحق للصرف للموظف:' : 'Deficit to Reimburse:')
                  : (isRtl ? 'المتبقي للتوريد للخزينة:' : 'Remaining to Return:')}
              </span>
              <span className={`font-mono font-black ${isDeficit ? 'text-amber-700' : 'text-emerald-700'}`}>
                {absBalance.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'تاريخ التصفية المعتمد:' : 'Settlement Date:'}
            </label>
            <AX_CompanyDatePicker
              value={settlementDate}
              onChange={(d) => setSettlementDate(d)}
              placeholder={isRtl ? 'تاريخ التصفية' : 'Date'}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isRtl ? 'ملاحظات التصفية والاعتماد:' : 'Settlement Notes:'}
            </label>
            <input
              type="text"
              value={settlementNotes}
              onChange={(e) => setSettlementNotes(e.target.value)}
              placeholder={isRtl ? 'مثال: تم توريد المتبقي للخزينة نقداً واستلام كافة الفواتير' : 'e.g. Balance returned to treasury in cash'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onPrintLiquidation(custody, custodyExpenses)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>{isRtl ? 'معاينة كشف A4' : 'A4 Preview'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isRtl ? 'تأكيد التصفية والإغلاق' : 'Confirm Settlement'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
