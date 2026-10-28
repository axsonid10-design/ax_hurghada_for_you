import React from 'react'
import {
  TrendingUp,
  Ship,
  Receipt,
  Coins,
  Users,
  CheckCircle2,
  AlertCircle,
  Percent,
  Wallet
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

  const formatAmount = (eurVal) => {
    if (isEgp) {
      const egpVal = Math.round(eurVal * egpRate)
      return `${egpVal.toLocaleString()} ج.م`
    }
    return `€${Math.round(eurVal).toLocaleString()}`
  }

  const formatSecondary = (eurVal) => {
    if (isEgp) {
      return `≈ €${Math.round(eurVal).toLocaleString()}`
    }
    return `≈ ${Math.round(eurVal * egpRate).toLocaleString()} ج.م`
  }

  const costRatio = totalSalesEur > 0 ? Math.round((totalCostEur / totalSalesEur) * 100) : 0
  const collectedEur = Math.max(0, totalSalesEur - totalRestEur)
  const collectionRate = totalSalesEur > 0 ? Math.round((collectedEur / totalSalesEur) * 100) : 100
  const avgTicketEur = totalBookings > 0 ? Math.round(totalSalesEur / totalBookings) : 0

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-3xl bg-white p-4.5 border border-sky-200/90 shadow-soft flex flex-col justify-between hover:border-sky-400 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-sky-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>إجمالي المبيعات</span>
            </span>
            <div className="p-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="py-2 space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
              {formatAmount(totalSalesEur)}
            </div>
            <div className="text-xs font-mono font-bold text-sky-700/80">
              {formatSecondary(totalSalesEur)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>{totalBookings} حجز مسجل</span>
            <span className="font-mono text-slate-700">متوسط: {formatAmount(avgTicketEur)}</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4.5 border border-amber-200/90 shadow-soft flex flex-col justify-between hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>تكاليف الموردين واليخوت</span>
            </span>
            <div className="p-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Ship className="w-4 h-4" />
            </div>
          </div>

          <div className="py-2 space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
              {formatAmount(totalCostEur)}
            </div>
            <div className="text-xs font-mono font-bold text-amber-700/80">
              {formatSecondary(totalCostEur)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>نسبة التكلفة من المبيعات</span>
            <span className="font-mono font-black text-amber-800">{costRatio}%</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4.5 border border-rose-200/90 shadow-soft flex flex-col justify-between hover:border-rose-400 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>المصروفات التشغيلية</span>
            </span>
            <div className="p-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          <div className="py-2 space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
              {formatAmount(totalExpensesEur)}
            </div>
            <div className="text-xs font-mono font-bold text-rose-700/80">
              {formatSecondary(totalExpensesEur)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>وقود، عمالة وإكراميات</span>
            <span className="font-mono text-slate-700">{expensesCount} بند</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4.5 border border-emerald-300 shadow-soft flex flex-col justify-between hover:border-emerald-500 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>صافي الربح الفعلي</span>
            </span>
            <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          <div className="py-2 space-y-0.5">
            <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${netProfitEur >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatAmount(netProfitEur)}
            </div>
            <div className="text-xs font-mono font-bold text-emerald-800/80">
              {formatSecondary(netProfitEur)}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>هامش الربحية الصافي</span>
            <span className="font-mono font-black text-emerald-700">{netProfitMargin}%</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4.5 border border-slate-200 shadow-soft flex flex-col justify-between hover:border-slate-400 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>إجمالي النزلاء (PAX)</span>
            </span>
            <div className="p-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="py-2 space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
              {totalPax.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-slate-500">
              نزيل في هذا النطاق
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>{totalAdults} بالغ</span>
            <span>•</span>
            <span>{totalChildren} طفل</span>
            <span>•</span>
            <span>{totalInfants} رضيع</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-soft p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span>موقف التحصيل والخزينة</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                نسبة التحصيل: {collectionRate}%
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-bold flex items-center gap-2 mt-0.5">
              <span>المحصل: <span className="font-mono text-emerald-700 font-black">{formatAmount(collectedEur)}</span></span>
              <span>•</span>
              <span>المتبقي: <span className="font-mono text-amber-700 font-black">{formatAmount(totalRestEur)}</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-slate-500">المتبقي بالعملات:</span>
          {totalRestEur > 0 && <span className="font-mono font-black text-sky-700">€{totalRestEur.toLocaleString()}</span>}
          {totalRestEgp > 0 && <span className="font-mono font-black text-emerald-700">{totalRestEgp.toLocaleString()} ج.م</span>}
          {totalRestUsd > 0 && <span className="font-mono font-black text-blue-700">${totalRestUsd.toLocaleString()}</span>}
          {totalRestGbp > 0 && <span className="font-mono font-black text-purple-700">£{totalRestGbp.toLocaleString()}</span>}
          {totalRestEur === 0 && totalRestEgp === 0 && totalRestUsd === 0 && totalRestGbp === 0 && (
            <span className="text-emerald-700 font-black text-[11px]">كافة الحجوزات مسددة بالكامل</span>
          )}
        </div>
      </div>
    </div>
  )
}
