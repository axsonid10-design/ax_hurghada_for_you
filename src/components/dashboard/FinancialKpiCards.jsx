import React from 'react'
import {
  TrendingUp,
  Ship,
  Receipt,
  Coins,
  Users,
  Wallet,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react'

export function FinancialKpiCards({
  totalSalesEur,
  totalCostEur,
  totalExpensesEur,
  netProfitEur,
  netProfitMargin,
  totalRestEur,
  totalRestEgp,
  totalRestUsd,
  totalRestGbp,
  totalPax,
  totalAdults,
  totalChildren,
  totalInfants,
  totalBookings,
  expensesCount,
  displayCurrency = 'EUR',
  rates
}) {
  const egpRate = rates?.EGP || 53.25
  const isEgp = displayCurrency === 'EGP'

  const formatParts = (eurVal) => {
    if (isEgp) {
      const val = Math.round(eurVal * egpRate)
      return { val: val.toLocaleString(), sym: 'ج.م' }
    }
    return { val: Math.round(eurVal).toLocaleString(), sym: '€' }
  }

  const formatSecondaryParts = (eurVal) => {
    if (isEgp) {
      return { val: Math.round(eurVal).toLocaleString(), sym: '€' }
    }
    const val = Math.round(eurVal * egpRate)
    return { val: val.toLocaleString(), sym: 'ج.م' }
  }

  const sales = formatParts(totalSalesEur)
  const salesSec = formatSecondaryParts(totalSalesEur)

  const cost = formatParts(totalCostEur)
  const costSec = formatSecondaryParts(totalCostEur)

  const exp = formatParts(totalExpensesEur)
  const expSec = formatSecondaryParts(totalExpensesEur)

  const profit = formatParts(netProfitEur)
  const profitSec = formatSecondaryParts(netProfitEur)

  const costRatio = totalSalesEur > 0 ? Math.round((totalCostEur / totalSalesEur) * 100) : 0
  const collectedEur = Math.max(0, totalSalesEur - totalRestEur)
  const collectionRate = totalSalesEur > 0 ? Math.round((collectedEur / totalSalesEur) * 100) : 100
  const remainingRate = 100 - collectionRate

  const collected = formatParts(collectedEur)
  const remaining = formatParts(totalRestEur)

  return (
    <div className="w-full space-y-2.5 sm:space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <div className="rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-4 border border-sky-200/90 shadow-soft flex flex-col justify-between hover:border-sky-400 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-sky-800">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-500" />
              <span>المبيعات</span>
            </span>
            <div className="p-1 sm:p-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="py-1.5 sm:py-2">
            <div className="whitespace-nowrap flex items-baseline gap-1 font-mono font-black text-base sm:text-2xl text-slate-900 tracking-tight">
              <span>{sales.sym}</span>
              <span>{sales.val}</span>
            </div>
            <div className="whitespace-nowrap flex items-baseline gap-1 text-[10px] sm:text-xs font-mono font-bold text-sky-700/80">
              <span>≈</span>
              <span>{salesSec.sym}</span>
              <span>{salesSec.val}</span>
            </div>
          </div>

          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 whitespace-nowrap">
            <span>{totalBookings} حجز</span>
            <span className="font-mono text-slate-700">{totalPax} فرد</span>
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-4 border border-amber-200/90 shadow-soft flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-amber-800">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />
              <span>التكلفة</span>
            </span>
            <div className="p-1 sm:p-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Ship className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="py-1.5 sm:py-2">
            <div className="whitespace-nowrap flex items-baseline gap-1 font-mono font-black text-base sm:text-2xl text-slate-900 tracking-tight">
              <span>{cost.sym}</span>
              <span>{cost.val}</span>
            </div>
            <div className="whitespace-nowrap flex items-baseline gap-1 text-[10px] sm:text-xs font-mono font-bold text-amber-700/80">
              <span>≈</span>
              <span>{costSec.sym}</span>
              <span>{costSec.val}</span>
            </div>
          </div>

          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 whitespace-nowrap">
            <span>النسبة</span>
            <span className="font-mono font-black text-amber-800">{costRatio}%</span>
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-4 border border-rose-200/90 shadow-soft flex flex-col justify-between hover:border-rose-400 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-rose-800">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500" />
              <span>المصروفات</span>
            </span>
            <div className="p-1 sm:p-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="py-1.5 sm:py-2">
            <div className="whitespace-nowrap flex items-baseline gap-1 font-mono font-black text-base sm:text-2xl text-slate-900 tracking-tight">
              <span>{exp.sym}</span>
              <span>{exp.val}</span>
            </div>
            <div className="whitespace-nowrap flex items-baseline gap-1 text-[10px] sm:text-xs font-mono font-bold text-rose-700/80">
              <span>≈</span>
              <span>{expSec.sym}</span>
              <span>{expSec.val}</span>
            </div>
          </div>

          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 whitespace-nowrap">
            <span>البنود</span>
            <span className="font-mono text-slate-700">{expensesCount} بند</span>
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-4 border border-emerald-300 shadow-soft flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-emerald-800">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
              <span>الأرباح</span>
            </span>
            <div className="p-1 sm:p-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="py-1.5 sm:py-2">
            <div className={`whitespace-nowrap flex items-baseline gap-1 font-mono font-black text-base sm:text-2xl tracking-tight ${netProfitEur >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              <span>{profit.sym}</span>
              <span>{profit.val}</span>
            </div>
            <div className="whitespace-nowrap flex items-baseline gap-1 text-[10px] sm:text-xs font-mono font-bold text-emerald-800/80">
              <span>≈</span>
              <span>{profitSec.sym}</span>
              <span>{profitSec.val}</span>
            </div>
          </div>

          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 whitespace-nowrap">
            <span>النسبة</span>
            <span className="font-mono font-black text-emerald-700">{netProfitMargin}%</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-4 border border-slate-200 shadow-soft flex flex-col justify-between hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-600" />
              <span>الأفراد</span>
            </span>
            <div className="p-1 sm:p-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="py-1.5 sm:py-2">
            <div className="whitespace-nowrap flex items-baseline gap-1 font-mono font-black text-base sm:text-2xl text-slate-900 tracking-tight">
              <span>{totalPax.toLocaleString()}</span>
              <span className="text-xs font-sans font-bold text-slate-500">فرد</span>
            </div>
            <div className="whitespace-nowrap flex items-baseline gap-1 text-[10px] sm:text-xs font-bold text-slate-500">
              <span>{totalAdults}ك</span>
              <span>•</span>
              <span>{totalChildren}ط</span>
              <span>•</span>
              <span>{totalInfants}ر</span>
            </div>
          </div>

          <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-600 whitespace-nowrap">
            <span>الحجوزات</span>
            <span className="font-mono font-bold text-slate-800">{totalBookings} حجز</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-soft p-3 sm:p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">
                موقف التحصيل والسيولة
              </div>
              <div className="text-[11px] font-mono text-slate-500 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>محصل: {collected.sym}{collected.val} ({collectionRate}%)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>متبقي: {remaining.sym}{remaining.val} ({remainingRate}%)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-700">
            {totalRestEur > 0 || totalRestEgp > 0 || totalRestUsd > 0 || totalRestGbp > 0 ? (
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900">
                <span>المتبقي:</span>
                {totalRestEur > 0 && <span className="font-mono font-black text-sky-800">€{totalRestEur.toLocaleString()}</span>}
                {totalRestEgp > 0 && <span className="font-mono font-black text-emerald-800">{totalRestEgp.toLocaleString()} ج.م</span>}
                {totalRestUsd > 0 && <span className="font-mono font-black text-blue-800">${totalRestUsd.toLocaleString()}</span>}
                {totalRestGbp > 0 && <span className="font-mono font-black text-purple-800">£{totalRestGbp.toLocaleString()}</span>}
              </div>
            ) : totalBookings > 0 ? (
              <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 font-black text-[11px]">
                مدفوع كلي
              </div>
            ) : null}
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex shadow-inner">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-700 flex items-center justify-end px-1"
            style={{ width: `${collectionRate}%` }}
          />
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-700"
            style={{ width: `${remainingRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}
