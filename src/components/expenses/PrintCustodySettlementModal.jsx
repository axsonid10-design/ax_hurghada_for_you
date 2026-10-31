import React from 'react'
import { Printer, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react'
import { tafqeetArabic, numberToWordsEnglish } from '../../utils/numberToWords'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function PrintCustodySettlementModal({ isOpen, onClose, custody, custodyExpenses = [] }) {
  const { lang, t } = useAXStore()
  const isRtl = lang === 'ar'

  if (!isOpen || !custody) return null

  const currency = custody.currency || 'EGP'
  const advanceAmount = Number(custody.amount) || 0
  const totalSpent = custodyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const balance = advanceAmount - totalSpent
  const isDeficit = balance < 0
  const absBalance = Math.abs(balance)

  const balanceWords = isRtl
    ? tafqeetArabic(absBalance, currency)
    : numberToWordsEnglish(absBalance, currency)

  const handlePrint = () => {
    soundManager.playClick()
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[95vh]">
        <div className="print:hidden bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-black tracking-wide">
              {isRtl ? 'معاينة وطباعة استمارة تصفية العهدة النقدية A4' : 'A4 Custody Liquidation Sheet Preview'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isRtl ? 'طباعة كشف التصفية' : 'Print Liquidation'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 overflow-y-auto font-tajawal text-slate-800 bg-white" id="printable-settlement">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-sky-600 shadow-sm flex items-center justify-center bg-slate-900 flex-shrink-0">
                <img src="/logo-circle.png" alt="HURGHADA FOR YOU" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  غردقة فور يو للسياحة والرحلات
                </h1>
                <p className="text-xs font-bold text-sky-700 font-mono">
                  HURGHADA FOR YOU — OPERATIONS & TRIPS
                </p>
                <p className="text-[10px] text-slate-500 font-bold">
                  محافظة البحر الأحمر - الغردقة • Hurghada, Red Sea, Egypt
                </p>
              </div>
            </div>

            <div className="text-end">
              <div className="inline-block border-2 border-slate-900 rounded-2xl px-4 py-1.5 bg-slate-50">
                <span className="block text-[10px] font-bold text-slate-500">
                  {isRtl ? 'رقم التصفية' : 'Liquidation No'}
                </span>
                <span className="font-mono font-black text-base text-slate-900">
                  #SETTLE-{custody.id?.slice(-6) || '01'}
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-600 mt-1">
                {isRtl ? 'تاريخ التصفية:' : 'Date:'} {custody.settlement_date || custody.date || new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          <div className="text-center my-6">
            <h2 className="inline-block text-base sm:text-lg font-black bg-slate-900 text-white px-8 py-2 rounded-full tracking-wide shadow-sm">
              {isRtl ? 'كشف تصفية وتسوية عهدة نقدية' : 'CUSTODY LIQUIDATION & SETTLEMENT STATEMENT'}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-6 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">{isRtl ? 'أمين العهدة المسؤول' : 'Custody Holder'}</span>
              <span className="font-black text-slate-900 text-sm">{custody.holder_name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">{isRtl ? 'تاريخ استلام العهدة' : 'Advance Date'}</span>
              <span className="font-mono font-bold text-slate-800">{custody.date}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">{isRtl ? 'مبلغ العهدة المستلم' : 'Received Advance'}</span>
              <span className="font-mono font-black text-slate-900 text-sm">{advanceAmount.toLocaleString()} {currency}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">{isRtl ? 'عدد الفواتير / البنود' : 'Attached Invoices'}</span>
              <span className="font-mono font-bold text-slate-800">{custodyExpenses.length} {isRtl ? 'فواتير ومستندات' : 'items'}</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold h-10">
                  <th className="px-3 text-start w-10">#</th>
                  <th className="px-3 text-start font-mono">{isRtl ? 'التاريخ' : 'Date'}</th>
                  <th className="px-3 text-start">{isRtl ? 'البيان والمصروف' : 'Item Description'}</th>
                  <th className="px-3 text-start">{isRtl ? 'التصنيف' : 'Category'}</th>
                  <th className="px-3 text-start font-mono">{isRtl ? 'رقم الإذن / الفاتورة' : 'Doc / Ref #'}</th>
                  <th className="px-3 text-start">{isRtl ? 'المستلم / الجهة' : 'Recipient'}</th>
                  <th className="px-3 text-end font-mono">{isRtl ? 'المبلغ' : 'Amount'} ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {custodyExpenses.map((exp, idx) => (
                  <tr key={exp.id || idx} className="h-9 hover:bg-slate-50 transition-colors">
                    <td className="px-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-3 font-mono font-bold text-slate-600">{exp.date}</td>
                    <td className="px-3 font-black text-slate-900 max-w-[200px] truncate">{exp.title}</td>
                    <td className="px-3 text-slate-600 font-bold">{exp.category}</td>
                    <td className="px-3 font-mono font-bold text-slate-500">{exp.voucher_no || exp.invoice_no || '-'}</td>
                    <td className="px-3 text-slate-700">{exp.recipient || '-'}</td>
                    <td className="px-3 text-end font-mono font-black text-slate-900">
                      {Number(exp.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {custodyExpenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400 font-bold">
                      {isRtl ? 'لا توجد مصروفات مسجلة على هذه العهدة' : 'No expenses recorded for this custody'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x sm:rtl:divide-x-reverse divide-slate-200">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 block">{isRtl ? 'إجمالي العهدة المسلمة' : 'Total Advance'}</span>
                <span className="text-lg sm:text-xl font-mono font-black text-slate-900 block">
                  {advanceAmount.toLocaleString()} {currency}
                </span>
              </div>

              <div className="space-y-1 pt-3 sm:pt-0">
                <span className="text-xs font-bold text-slate-500 block">{isRtl ? 'إجمالي المنصرف بموجب فواتير' : 'Total Spent'}</span>
                <span className="text-lg sm:text-xl font-mono font-black text-rose-700 block">
                  {totalSpent.toLocaleString()} {currency}
                </span>
              </div>

              <div className="space-y-1 pt-3 sm:pt-0">
                <span className="text-xs font-bold text-slate-500 block">
                  {isDeficit
                    ? (isRtl ? '⚠️ عجز مستحق للصرف للموظف' : '⚠️ Deficit to Reimburse')
                    : (isRtl ? '✅ المتبقي للتوريد للخزينة' : '✅ Remaining to Return')}
                </span>
                <span className={`text-lg sm:text-xl font-mono font-black block ${isDeficit ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {absBalance.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-center text-xs font-bold text-slate-700">
              <span>{isRtl ? 'المبلغ بالحروف:' : 'In Words:'} </span>
              <span className="font-black text-slate-900 font-mono">({balanceWords})</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-slate-900 text-center text-xs">
            <div className="space-y-8">
              <span className="font-black text-slate-900 block">
                {isRtl ? 'أمين العهدة (المسؤول)' : 'Custody Officer'}
              </span>
              <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 text-[11px] text-slate-500 font-mono">
                {custody.holder_name}
              </div>
            </div>

            <div className="space-y-8">
              <span className="font-black text-slate-900 block">
                {isRtl ? 'مراجع الحسابات' : 'Internal Auditor'}
              </span>
              <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 text-[11px] text-slate-500 font-mono">
                حسابات غردقة فور يو
              </div>
            </div>

            <div className="space-y-8">
              <span className="font-black text-slate-900 block">
                {isRtl ? 'اعتماد الإدارة العامة / المالك' : 'Executive Approval'}
              </span>
              <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 text-[11px] text-slate-500 font-mono">
                إدارة الشركة
              </div>
            </div>
          </div>

          <div className="mt-12 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Hurghada For You — Official Custody Liquidation</span>
            <span>Printed: {new Date().toLocaleString()}</span>
            <span>Created by AXONID</span>
          </div>
        </div>
      </div>
    </div>
  )
}
