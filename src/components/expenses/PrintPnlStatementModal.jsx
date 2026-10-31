import React from 'react'
import { X, Printer, BarChart3 } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function PrintPnlStatementModal({
  isOpen,
  onClose,
  totalSalesEur = 0,
  totalCostEur = 0,
  grossProfitEur = 0,
  fixedExpensesEur = 0,
  variableExpensesEur = 0,
  pettyExpensesEur = 0,
  totalExpensesEur = 0,
  netProfitEur = 0,
  totalBookings = 0,
  totalPax = 0,
  dateFrom = '',
  dateTo = '',
  egpRate = 53.25
}) {
  const { lang } = useAXStore()
  const isRtl = lang === 'ar'

  if (!isOpen) return null

  const netMargin = totalSalesEur > 0 ? ((netProfitEur / totalSalesEur) * 100).toFixed(1) : 0

  const handlePrint = () => {
    soundManager.playClick()
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[95vh]">
        <div className="print:hidden bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-black tracking-wide">
              {isRtl ? 'معاينة وطباعة قائمة الأرباح والخسائر P&L القياسية A4' : 'A4 Profit & Loss Statement Preview'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isRtl ? 'طباعة القائمة A4' : 'Print Statement'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 overflow-y-auto font-tajawal text-slate-800 bg-white" id="printable-pnl">
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
                  {isRtl ? 'فترة التقرير' : 'Statement Period'}
                </span>
                <span className="font-mono font-black text-xs text-slate-900">
                  {dateFrom} {isRtl ? 'إلى' : 'to'} {dateTo}
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-600 mt-1">
                {isRtl ? 'سعر الصرف المعتمد:' : 'Rate:'} 1€ = {egpRate} {isRtl ? 'ج.م' : 'EGP'}
              </div>
            </div>
          </div>

          <div className="text-center my-6">
            <h2 className="inline-block text-base sm:text-lg font-black bg-slate-900 text-white px-8 py-2 rounded-full tracking-wide shadow-sm">
              {isRtl ? 'قائمة الأرباح والخسائر التشغيلية (P&L)' : 'PROFIT & LOSS FINANCIAL STATEMENT'}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-6 text-xs text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">{isRtl ? 'إجمالي الحجوزات' : 'Total Bookings'}</span>
              <span className="font-mono font-black text-slate-900 text-sm">{totalBookings} {isRtl ? 'حجز' : 'bookings'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">{isRtl ? 'إجمالي النزلاء (PAX)' : 'Total Guests'}</span>
              <span className="font-mono font-black text-slate-900 text-sm">{totalPax} {isRtl ? 'فرد' : 'PAX'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">{isRtl ? 'هامش صافي الربح' : 'Net Margin'}</span>
              <span className="font-mono font-black text-emerald-700 text-sm">{netMargin}%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">{isRtl ? 'صافي الربح (€)' : 'Net Profit (€)'}</span>
              <span className={`font-mono font-black text-sm ${netProfitEur >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                €{Math.round(netProfitEur).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-2 border-slate-900 rounded-2xl overflow-hidden mb-8 text-xs">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold h-10">
                  <th className="px-4 text-start">{isRtl ? 'البند المالي / البيان' : 'Financial Statement Line'}</th>
                  <th className="px-4 text-end font-mono w-40">{isRtl ? 'القيمة باليورو (€)' : 'EUR (€)'}</th>
                  <th className="px-4 text-end font-mono w-40">{isRtl ? 'المعادل بالجنيه (ج.م)' : 'EGP (≈)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-bold">
                <tr className="bg-sky-50/70 h-11 text-sky-950 font-black">
                  <td className="px-4">{isRtl ? '١. إجمالي إيرادات المبيعات المحققة (Gross Revenue)' : '1. Gross Sales Revenue'}</td>
                  <td className="px-4 text-end font-mono text-sm">€{Math.round(totalSalesEur).toLocaleString()}</td>
                  <td className="px-4 text-end font-mono text-sm text-sky-800">{Math.round(totalSalesEur * egpRate).toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}</td>
                </tr>

                <tr className="h-10 text-amber-900">
                  <td className="px-4 ps-8">{isRtl ? 'يخصم: تكاليف الرحلات والمنفذين والموردين المباشرة (Direct Costs)' : 'Less: Direct Trips & Supplier Costs'}</td>
                  <td className="px-4 text-end font-mono">(€{Math.round(totalCostEur).toLocaleString()})</td>
                  <td className="px-4 text-end font-mono">({Math.round(totalCostEur * egpRate).toLocaleString()})</td>
                </tr>

                <tr className="bg-slate-100/80 h-11 text-slate-950 font-black border-t-2 border-slate-300">
                  <td className="px-4">{isRtl ? '٢. مجمل الربح التشغيلي المباشر (Gross Operational Profit)' : '2. Gross Operational Profit'}</td>
                  <td className="px-4 text-end font-mono text-sm">€{Math.round(grossProfitEur).toLocaleString()}</td>
                  <td className="px-4 text-end font-mono text-sm">{Math.round(grossProfitEur * egpRate).toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}</td>
                </tr>

                <tr className="bg-rose-50/40 h-9 text-rose-950 font-black">
                  <td colSpan={3} className="px-4">{isRtl ? 'يخصم: المصروفات العمومية والتشغيلية والإدارية (Operating Expenses):' : 'Less: Operating & Overhead Expenses:'}</td>
                </tr>

                <tr className="h-10 text-slate-700">
                  <td className="px-4 ps-8">{isRtl ? '• المصروفات الإدارية والثابتة (رواتب، إيجار مقرات، فواتير كهرباء ومياه ونت)' : '• Fixed & Overhead (Salaries, Rent, Utilities, Bills)'}</td>
                  <td className="px-4 text-end font-mono">(€{Math.round(fixedExpensesEur).toLocaleString()})</td>
                  <td className="px-4 text-end font-mono">({Math.round(fixedExpensesEur * egpRate).toLocaleString()})</td>
                </tr>

                <tr className="h-10 text-slate-700">
                  <td className="px-4 ps-8">{isRtl ? '• مصروفات التشغيل الميداني (وقود، صيانة يخوت، بوفيه ووجبات، رسوم محميات)' : '• Field Operations (Fuel, Maintenance, Catering, Fees)'}</td>
                  <td className="px-4 text-end font-mono">(€{Math.round(variableExpensesEur).toLocaleString()})</td>
                  <td className="px-4 text-end font-mono">({Math.round(variableExpensesEur * egpRate).toLocaleString()})</td>
                </tr>

                <tr className="h-10 text-slate-700">
                  <td className="px-4 ps-8">{isRtl ? '• نثريات العهدة والمصروفات اليومية والإكراميات والضيافة (Petty Cash)' : '• Petty Cash & Miscellaneous (Tips, Hospitality, Custody)'}</td>
                  <td className="px-4 text-end font-mono">(€{Math.round(pettyExpensesEur).toLocaleString()})</td>
                  <td className="px-4 text-end font-mono">({Math.round(pettyExpensesEur * egpRate).toLocaleString()})</td>
                </tr>

                <tr className="bg-rose-50/70 h-10 text-rose-900 font-bold border-t border-rose-200">
                  <td className="px-4 ps-8">{isRtl ? 'إجمالي المصروفات التشغيلية والعمومية (Total Expenses)' : 'Total Operating Expenses'}</td>
                  <td className="px-4 text-end font-mono text-rose-800">(€{Math.round(totalExpensesEur).toLocaleString()})</td>
                  <td className="px-4 text-end font-mono text-rose-800">({Math.round(totalExpensesEur * egpRate).toLocaleString()})</td>
                </tr>

                <tr className={`h-14 font-black border-t-2 border-slate-900 text-sm sm:text-base ${
                  netProfitEur >= 0 ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'
                }`}>
                  <td className="px-4">
                    <span className="block font-black">
                      {isRtl ? '٣. صافي الربح / الخسارة النهائي (Net Profit / Loss)' : '3. Final Net Profit / Loss'}
                    </span>
                    <span className="text-[10px] font-normal text-slate-500 block">
                      {isRtl ? `هامش الربح الصافي: ${netMargin}%` : `Net Margin: ${netMargin}%`}
                    </span>
                  </td>
                  <td className={`px-4 text-end font-mono text-base sm:text-lg font-black ${
                    netProfitEur >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    €{Math.round(netProfitEur).toLocaleString()}
                  </td>
                  <td className={`px-4 text-end font-mono text-base sm:text-lg font-black ${
                    netProfitEur >= 0 ? 'text-emerald-800' : 'text-rose-700'
                  }`}>
                    {Math.round(netProfitEur * egpRate).toLocaleString()} {isRtl ? 'ج.م' : 'EGP'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-6 border-t-2 border-slate-900 text-center text-xs">
            <div className="space-y-8">
              <span className="font-black text-slate-900 block">
                {isRtl ? 'رئيس قسم الحسابات والمالية' : 'Head of Finance & Accounting'}
              </span>
              <div className="border-b border-dashed border-slate-400 w-2/3 mx-auto pb-1 text-[11px] text-slate-500 font-mono">
                إدارة الحسابات
              </div>
            </div>

            <div className="space-y-8">
              <span className="font-black text-slate-900 block">
                {isRtl ? 'اعتماد المدير العام / المالك' : 'General Manager Approval'}
              </span>
              <div className="border-b border-dashed border-slate-400 w-2/3 mx-auto pb-1 text-[11px] text-slate-500 font-mono">
                غردقة فور يو — الإدارة العليا
              </div>
            </div>
          </div>

          <div className="mt-12 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Hurghada For You — Official Financial P&L Statement</span>
            <span>Printed: {new Date().toLocaleString()}</span>
            <span>Created by AXONID</span>
          </div>
        </div>
      </div>
    </div>
  )
}
