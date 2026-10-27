import React from 'react'
import {
  Euro,
  Ship,
  Receipt,
  TrendingUp,
  Coins,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export function FinancialKpiCards({
  totalSalesEur,
  totalCostEur,
  totalExpensesEur,
  netProfitEur,
  netProfitMargin,
  totalRestEur,
  totalRestEgp,
  totalPax,
  totalBookings,
  expensesCount,
  rates
}) {
  const costRatio = totalSalesEur > 0 ? Math.round((totalCostEur / totalSalesEur) * 100) : 0
  const collectedEur = Math.max(0, totalSalesEur - totalRestEur)
  const egpRate = rates.EGP || 53.25

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Gross Sales */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a2540] to-[#133e66] text-white p-4.5 border border-sky-400/30 shadow-lg shadow-slate-900/10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-bold text-sky-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>إجمالي المبيعات</span>
          </span>
          <div className="p-1.5 rounded-full bg-white/10 text-sky-300">
            <Euro className="w-4 h-4" />
          </div>
        </div>

        <div className="py-2 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
            €{totalSalesEur.toLocaleString()}
          </div>
          <div className="text-xs font-mono font-bold text-sky-300">
            ≈ {Math.round(totalSalesEur * egpRate).toLocaleString()} ج.م
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-slate-300">
          <span>{totalPax} فرد (نزيل)</span>
          <span className="bg-white/10 px-2 py-0.5 rounded-full font-mono text-[10px]">
            {totalBookings} حجز
          </span>
        </div>
      </div>

      {/* 2. Vessel & Executor Costs */}
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
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-900">
            €{totalCostEur.toLocaleString()}
          </div>
          <div className="text-xs font-mono font-bold text-amber-700/80">
            ≈ {Math.round(totalCostEur * egpRate).toLocaleString()} ج.م
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>نسبة التكلفة من المبيعات</span>
            <span className="font-mono text-amber-800">{costRatio}%</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, costRatio)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Operating Expenses */}
      <div className="rounded-3xl bg-white p-4.5 border border-rose-200/90 shadow-soft flex flex-col justify-between hover:border-rose-400 transition-colors">
        <div className="flex items-center justify-between text-xs font-bold text-rose-800">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>المصاريف التشغيلية</span>
          </span>
          <div className="p-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="py-2 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-900">
            €{Math.round(totalExpensesEur).toLocaleString()}
          </div>
          <div className="text-xs font-mono font-bold text-rose-700/80">
            ≈ {Math.round(totalExpensesEur * egpRate).toLocaleString()} ج.م
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span>وقود، إكراميات، إعاشة</span>
          <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded-full font-mono text-[10px]">
            {expensesCount} بند
          </span>
        </div>
      </div>

      {/* 4. True Net Profit (The Crown Jewel Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#021f18] via-[#05372b] to-[#0a2540] text-white p-4.5 border-2 border-emerald-400/60 shadow-xl shadow-emerald-950/40 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between text-xs font-bold text-emerald-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-black text-white">صافي الربح الفعلي</span>
          </span>
          <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-mono font-black text-[10px]">
            {netProfitMargin}% هامش
          </span>
        </div>

        <div className="relative z-10 py-2 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-300">
            +€{Math.round(netProfitEur).toLocaleString()}
          </div>
          <div className="text-xs font-mono font-bold text-emerald-200/80">
            ≈ +{Math.round(netProfitEur * egpRate).toLocaleString()} ج.م
          </div>
        </div>

        <div className="relative z-10 pt-2 border-t border-white/10 text-[10px] font-mono text-emerald-200/70 flex items-center justify-between">
          <span>بعد الموردين والمصاريف</span>
          <span className="text-emerald-300 font-bold">100% دقيق</span>
        </div>
      </div>

      {/* 5. Receivables & Collection */}
      <div className="rounded-3xl bg-white p-4.5 border border-slate-200 shadow-soft flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>التحصيل والمتبقي</span>
          </span>
          <div className="p-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="py-2 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-600">
            €{totalRestEur.toLocaleString()}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500">
            {totalRestEgp > 0 ? `+ ${totalRestEgp.toLocaleString()} ج.م` : 'متبقي لدى النزلاء'}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
          <span className="text-emerald-700">محصل: €{collectedEur.toLocaleString()}</span>
          <span className="text-rose-600 font-mono text-[10px]">
            {totalSalesEur > 0 ? `${Math.round((totalRestEur / totalSalesEur) * 100)}% آجل` : '0%'}
          </span>
        </div>
      </div>
    </div>
  )
}
