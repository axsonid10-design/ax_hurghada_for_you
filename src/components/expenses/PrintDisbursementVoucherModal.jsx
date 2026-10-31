import React from 'react'
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react'
import { tafqeetArabic, numberToWordsEnglish } from '../../utils/numberToWords'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function PrintDisbursementVoucherModal({ isOpen, onClose, expense }) {
  const { lang, t } = useAXStore()
  const isRtl = lang === 'ar'

  if (!isOpen || !expense) return null

  const currency = expense.currency || 'EGP'
  const amountWords = isRtl
    ? tafqeetArabic(expense.amount, currency)
    : numberToWordsEnglish(expense.amount, currency)

  const handlePrint = () => {
    soundManager.playClick()
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[95vh]">
        <div className="print:hidden bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-black tracking-wide">
              {isRtl ? 'معاينة وطباعة إذن صرف نقدية A4' : 'A4 Disbursement Voucher Preview'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isRtl ? 'طباعة المستند' : 'Print Voucher'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 overflow-y-auto font-tajawal text-slate-800 bg-white" id="printable-voucher">
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
                  {isRtl ? 'رقم الإذن' : 'Voucher No'}
                </span>
                <span className="font-mono font-black text-base text-slate-900">
                  #{expense.voucher_no || expense.id?.slice(-6) || 'VCH-01'}
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-600 mt-1">
                {isRtl ? 'التاريخ:' : 'Date:'} {expense.date || new Date().toISOString().split('T')[0]}
              </div>
            </div>
          </div>

          <div className="text-center my-6">
            <h2 className="inline-block text-base sm:text-lg font-black bg-slate-900 text-white px-8 py-2 rounded-full tracking-wide shadow-sm">
              {isRtl ? 'إذن صرف نقدية / عهدة' : 'CASH DISBURSEMENT VOUCHER'}
            </h2>
          </div>

          <div className="border border-slate-300 rounded-2xl overflow-hidden mb-6 text-xs">
            <div className="grid grid-cols-4 border-b border-slate-200 divide-x divide-slate-200 rtl:divide-x-reverse">
              <div className="p-3 bg-slate-50 font-bold text-slate-600">
                {isRtl ? 'يصرف للسيد / الجهة:' : 'Pay to / Beneficiary:'}
              </div>
              <div className="p-3 col-span-3 font-black text-slate-900 text-sm">
                {expense.recipient || expense.holder_name || (isRtl ? 'المنفذ / المورد' : 'Supplier')}
              </div>
            </div>

            <div className="grid grid-cols-4 border-b border-slate-200 divide-x divide-slate-200 rtl:divide-x-reverse">
              <div className="p-3 bg-slate-50 font-bold text-slate-600">
                {isRtl ? 'المبلغ المطلوب صرفه:' : 'Disbursed Amount:'}
              </div>
              <div className="p-3 col-span-3 flex items-center gap-3">
                <span className="font-mono font-black text-base text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  {Number(expense.amount).toLocaleString()} {currency}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  ({amountWords})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 border-b border-slate-200 divide-x divide-slate-200 rtl:divide-x-reverse">
              <div className="p-3 bg-slate-50 font-bold text-slate-600">
                {isRtl ? 'البيان والغرض من الصرف:' : 'Payment Purpose:'}
              </div>
              <div className="p-3 col-span-3 font-bold text-slate-800 leading-relaxed">
                {expense.title || expense.notes || (isRtl ? 'مصروفات تشغيل' : 'Operational expense')}
                {expense.notes && expense.title && (
                  <span className="block text-[11px] text-slate-500 font-normal mt-1">
                    {expense.notes}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 border-b border-slate-200 divide-x divide-slate-200 rtl:divide-x-reverse">
              <div className="p-3 bg-slate-50 font-bold text-slate-600">
                {isRtl ? 'تصنيف المصروف:' : 'Category / Classification:'}
              </div>
              <div className="p-3 font-black text-slate-800">
                {expense.category || (isRtl ? 'مصروفات عامة' : 'General')}
              </div>
              <div className="p-3 bg-slate-50 font-bold text-slate-600">
                {isRtl ? 'مصدر الخصم:' : 'Payment Source:'}
              </div>
              <div className="p-3 font-bold text-slate-800">
                {expense.source === 'custody'
                  ? (isRtl ? `عهدة نقدية (${expense.custody_holder || 'أمين العهدة'})` : `Custody (${expense.custody_holder || 'Holder'})`)
                  : (isRtl ? 'الخزينة العامة للشركة' : 'Main Treasury')}
              </div>
            </div>

            <div className="grid grid-cols-4 divide-x divide-slate-200 rtl:divide-x-reverse">
              <div className="p-3 bg-slate-50 font-bold text-slate-600">
                {isRtl ? 'رقم الفاتورة / المرفق:' : 'Invoice / Doc Ref:'}
              </div>
              <div className="p-3 font-mono font-bold text-slate-700">
                {expense.invoice_no || (isRtl ? 'بدون فاتورة ضريبية' : 'N/A')}
              </div>
              <div className="p-3 bg-slate-50 font-bold text-slate-600">
                {isRtl ? 'طريقة السداد:' : 'Payment Method:'}
              </div>
              <div className="p-3 font-bold text-emerald-700">
                {isRtl ? 'نقداً (Cash)' : 'Cash'}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-10 text-[11px] text-slate-600 leading-relaxed">
            {isRtl
              ? 'أقر أنا الموقع أدناه باستلام المبلغ الموضح أعلاه نقداً بالكامل، وذلك لتسوية النفقات المذكورة في الغرض من الصرف أعلاه، وأتحمل المسؤولية القانونية والمحاسبية عن صحة المستندات المرفقة.'
              : 'I hereby acknowledge receiving the cash amount stated above in full for the purpose described, and accept responsibility for the validity of attached receipts.'}
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-slate-900 text-center text-xs">
            <div className="space-y-8">
              <span className="font-black text-slate-900 block">
                {isRtl ? 'المستلم / المستفيد' : 'Beneficiary Signature'}
              </span>
              <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 text-[11px] text-slate-500 font-mono">
                {expense.recipient || '................................'}
              </div>
            </div>

            <div className="space-y-8">
              <span className="font-black text-slate-900 block">
                {isRtl ? 'أمين العهدة / الحسابات' : 'Accountant / Custody Officer'}
              </span>
              <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 text-[11px] text-slate-500 font-mono">
                {expense.custody_holder || 'حسابات التشغيل'}
              </div>
            </div>

            <div className="space-y-8">
              <span className="font-black text-slate-900 block">
                {isRtl ? 'يعتمد / المدير العام' : 'General Manager Approval'}
              </span>
              <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 text-[11px] text-slate-500 font-mono">
                غردقة فور يو — الإدارة
              </div>
            </div>
          </div>

          <div className="mt-12 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Hurghada For You — ERP System Voucher</span>
            <span>Printed: {new Date().toLocaleString()}</span>
            <span>Created by AXONID</span>
          </div>
        </div>
      </div>
    </div>
  )
}
