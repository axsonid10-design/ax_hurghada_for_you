import React, { useState } from 'react'
import { Banknote, Euro, DollarSign, Coins, ArrowDownLeft } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_PaginationBar } from '../common/AX_PaginationBar'

export function CashDrawer() {
  const { bookings } = useAXStore()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const totalEur = bookings.reduce((sum, b) => sum + (Number(b.rest_eur) || 0), 0)
  const totalEgp = bookings.reduce((sum, b) => sum + (Number(b.rest_egp) || 0), 0)
  const totalUsd = bookings.reduce((sum, b) => sum + (Number(b.rest_usd) || 0), 0)
  const totalGbp = bookings.reduce((sum, b) => sum + (Number(b.rest_gbp) || 0), 0)

  const cashPickups = bookings.filter((b) => b.group.includes('Cash Pickup'))
  const totalPages = Math.ceil(cashPickups.length / pageSize) || 1
  const paginatedPickups = cashPickups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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
          <div className="text-[11px] text-emerald-600 font-bold">العملة الأساسية</div>
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
          <div className="text-[11px] text-slate-400">حجوزات دولية</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>الجنيه الإسترليني</span>
            <Banknote className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-[#0a2540] font-mono">
            £{totalGbp.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">حجوزات إنجليزية</div>
        </div>
      </div>

      {/* Cash Pickup Register Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0a2540] flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>حركات التحصيل النقدي من الفنادق (Cash Pickup)</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {cashPickups.length} حركة مسجلة
          </span>
        </div>

        {/* Mobile Bento List */}
        <div className="space-y-2 lg:hidden">
          {paginatedPickups.map((cp) => (
            <div key={cp.sr} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-black text-[#0a2540]">{cp.guest_name}</div>
                <div className="text-[11px] text-slate-500">
                  {cp.hotel} • {cp.seller}
                </div>
              </div>
              <div className="text-left">
                <div className="font-black font-mono text-emerald-600 text-sm">
                  €{cp.rest_eur}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-slate-600">
                  #{cp.sr}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Single-Line Compact Table (Rule 16: h-11 Rows) */}
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#0a2540] text-white text-xs font-bold h-11">
                <th className="px-3 font-mono">SR</th>
                <th className="px-3">النزيل</th>
                <th className="px-3">الفندق</th>
                <th className="px-3">المندوب</th>
                <th className="px-3 text-center font-mono">المبلغ (€)</th>
                <th className="px-3 text-center">حالة السداد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {paginatedPickups.map((cp) => (
                <tr key={cp.sr} className="h-11 hover:bg-slate-50 transition-colors whitespace-nowrap">
                  <td className="px-3 font-mono font-bold text-[#0284c7]">#{cp.sr}</td>
                  <td className="px-3 font-black text-[#0a2540] max-w-[160px] truncate">{cp.guest_name}</td>
                  <td className="px-3 text-slate-700 max-w-[180px] truncate">{cp.hotel}</td>
                  <td className="px-3 text-slate-600 font-bold">{cp.seller}</td>
                  <td className="px-3 text-center font-mono font-bold text-emerald-600">€{cp.rest_eur}</td>
                  <td className="px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      مستحق التحصيل
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <AX_PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={cashPickups.length}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  )
}
