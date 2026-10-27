import React from 'react'
import { Banknote, Euro, DollarSign, Coins, ArrowDownLeft, ShieldCheck } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'

export function CashDrawer() {
  const { bookings } = useAXStore()

  const totalEur = bookings.reduce((sum, b) => sum + (Number(b.rest_eur) || 0), 0)
  const totalEgp = bookings.reduce((sum, b) => sum + (Number(b.rest_egp) || 0), 0)
  const totalUsd = bookings.reduce((sum, b) => sum + (Number(b.rest_usd) || 0), 0)
  const totalGbp = bookings.reduce((sum, b) => sum + (Number(b.rest_gbp) || 0), 0)

  const cashPickups = bookings.filter((b) => b.group.includes('Cash Pickup'))

  return (
    <div className="w-full space-y-4">
      {/* Currency Summary Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>اليورو الأوروبي</span>
            <Euro className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#0a2540] font-mono">
            €{totalEur.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">العملة الأساسية للرحلات</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>الجنيه المصري</span>
            <Coins className="w-4 h-4 text-[#0284c7]" />
          </div>
          <div className="text-2xl font-black text-[#0a2540] font-mono">
            {totalEgp.toLocaleString()} <span className="text-xs font-sans">ج.م</span>
          </div>
          <div className="text-[11px] text-slate-400">التحصيل المحلي</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>الدولار الأمريكي</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-[#0a2540] font-mono">
            ${totalUsd.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">حجوزات أونلاين</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>الجنيه الإسترليني</span>
            <Banknote className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-[#0a2540] font-mono">
            £{totalGbp.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">سياح بريطانيا</div>
        </div>
      </div>

      {/* Cash Pickup Register Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0a2540] flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>حركات التحصيل النقدي من الفنادق (Cash Pickup 💰)</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {cashPickups.length} حركات مسجلة
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {cashPickups.map((cp) => (
            <div key={cp.sr} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-black text-[#0a2540]">{cp.guest_name}</div>
                <div className="text-[11px] text-slate-500">
                  {cp.hotel} • المندوب: {cp.seller}
                </div>
              </div>
              <div className="text-left">
                <div className="font-black font-mono text-emerald-600 text-sm">
                  €{cp.rest_eur}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600">
                  #{cp.sr}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
