import React, { useState } from 'react'
import { Banknote, Euro, DollarSign, Coins, ArrowDownLeft, CheckCircle2 } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_PaginationBar } from '../common/AX_PaginationBar'
import { soundManager } from '../../utils/soundEffects'

export function CashDrawer() {
  const { bookings, updateBooking, openConfirmModal } = useAXStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTabFilter, setActiveTabFilter] = useState('ALL') // 'ALL' | 'PICKUP' | 'PENDING'
  const pageSize = 15

  const totalEur = bookings.reduce((sum, b) => sum + (Number(b.rest_eur) || 0), 0)
  const totalEgp = bookings.reduce((sum, b) => sum + (Number(b.rest_egp) || 0), 0)
  const totalUsd = bookings.reduce((sum, b) => sum + (Number(b.rest_usd) || 0), 0)
  const totalGbp = bookings.reduce((sum, b) => sum + (Number(b.rest_gbp) || 0), 0)

  // Filter cash entries safely with zero crashes
  const cashList = bookings.filter((b) => {
    const isPickup =
      (b.trip_type && typeof b.trip_type === 'string' && b.trip_type.toLowerCase().includes('cash pickup')) ||
      (b.group && typeof b.group === 'string' && b.group.toLowerCase().includes('cash pickup'))

    const hasRemaining =
      (Number(b.rest_eur) || 0) > 0 ||
      (Number(b.rest_egp) || 0) > 0 ||
      (Number(b.rest_usd) || 0) > 0 ||
      (Number(b.rest_gbp) || 0) > 0

    if (activeTabFilter === 'PICKUP') return isPickup
    if (activeTabFilter === 'PENDING') return hasRemaining
    return isPickup || hasRemaining
  })

  const totalPages = Math.ceil(cashList.length / pageSize) || 1
  const paginatedList = cashList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleCollect = (b) => {
    openConfirmModal({
      title: 'تأكيد التحصيل النقدي',
      message: `هل تم استلام كامل المبالغ المستحقة للنزيل ${b.guest_name || ''} (SR: ${b.sr})؟`,
      confirmText: 'تأكيد التحصيل',
      type: 'info',
      onConfirm: () => {
        soundManager.playSuccess()
        updateBooking(b.sr, {
          rest_eur: 0,
          rest_egp: 0,
          rest_usd: 0,
          rest_gbp: 0,
          status: 'paid'
        })
      }
    })
  }

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

      {/* Cash Register Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick()
                setActiveTabFilter('ALL')
                setCurrentPage(1)
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTabFilter === 'ALL'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              جميع الحركات ({cashList.length})
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setActiveTabFilter('PICKUP')
                setCurrentPage(1)
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTabFilter === 'PICKUP'
                  ? 'bg-[#0284c7] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              حركات Cash Pickup
            </button>
            <button
              onClick={() => {
                soundManager.playClick()
                setActiveTabFilter('PENDING')
                setCurrentPage(1)
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTabFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              متبقي بالعملات
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500 font-mono">
            {cashList.length} سجل
          </span>
        </div>

        {/* Mobile Bento List */}
        <div className="space-y-2 lg:hidden">
          {paginatedList.map((cp) => (
            <div key={cp.sr} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-black text-[#0a2540]">{cp.guest_name || 'غير محدد'}</div>
                <div className="text-[11px] text-slate-500">
                  {cp.hotel || '-'} • {cp.seller || 'مباشر'}
                </div>
              </div>
              <div className="text-left flex items-center gap-2">
                <div>
                  <div className="font-black font-mono text-emerald-600 text-sm">
                    {cp.rest_eur > 0 && `€${cp.rest_eur}`}
                    {cp.rest_egp > 0 && ` ${cp.rest_egp} ج.م`}
                    {cp.rest_usd > 0 && ` $${cp.rest_usd}`}
                    {cp.rest_gbp > 0 && ` £${cp.rest_gbp}`}
                    {cp.rest_eur === 0 && cp.rest_egp === 0 && cp.rest_usd === 0 && cp.rest_gbp === 0 && '€0'}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-slate-600">
                    #{cp.sr}
                  </span>
                </div>
                {(cp.rest_eur > 0 || cp.rest_egp > 0 || cp.rest_usd > 0 || cp.rest_gbp > 0) && (
                  <button
                    onClick={() => handleCollect(cp)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-bold shadow-sm transition-all active:scale-95"
                  >
                    تحصيل
                  </button>
                )}
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
                <th className="px-3">الرحلة</th>
                <th className="px-3 text-center font-mono">المتبقي (€)</th>
                <th className="px-3 text-center font-mono">المتبقي (ج.م)</th>
                <th className="px-3 text-center">حالة السداد</th>
                <th className="px-3 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {paginatedList.map((cp) => {
                const isPaid =
                  (Number(cp.rest_eur) || 0) === 0 &&
                  (Number(cp.rest_egp) || 0) === 0 &&
                  (Number(cp.rest_usd) || 0) === 0 &&
                  (Number(cp.rest_gbp) || 0) === 0

                return (
                  <tr key={cp.sr} className="h-11 hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="px-3 font-mono font-bold text-[#0284c7]">#{cp.sr}</td>
                    <td className="px-3 font-black text-[#0a2540] max-w-[160px] truncate" title={cp.guest_name}>
                      {cp.guest_name || 'غير محدد'}
                    </td>
                    <td className="px-3 text-slate-700 max-w-[180px] truncate" title={cp.hotel}>
                      {cp.hotel || '-'}
                    </td>
                    <td className="px-3 text-slate-600 font-bold">{cp.seller || 'مباشر'}</td>
                    <td className="px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {cp.trip_type || 'رحلة'}
                      </span>
                    </td>
                    <td className="px-3 text-center font-mono font-bold text-emerald-600">
                      €{cp.rest_eur || 0}
                    </td>
                    <td className="px-3 text-center font-mono font-bold text-[#0284c7]">
                      {cp.rest_egp || 0} ج.م
                    </td>
                    <td className="px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isPaid ? 'مدفوع كلي' : 'غير مدفوع'}
                      </span>
                    </td>
                    <td className="px-3 text-center">
                      {!isPaid ? (
                        <button
                          onClick={() => handleCollect(cp)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
                        >
                          تحصيل
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <AX_PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={cashList.length}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  )
}
