import React, { useState, useEffect, useMemo } from 'react'
import {
  Banknote,
  Euro,
  DollarSign,
  Coins,
  ArrowDownLeft,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Building2
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AX_PaginationBar } from '../common/AX_PaginationBar'
import { exchangeRates } from '../../utils/exchangeRates'
import { soundManager } from '../../utils/soundEffects'

export function CashDrawer() {
  const { bookings, tripDefinitions, updateBooking, openConfirmModal } = useAXStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTabFilter, setActiveTabFilter] = useState('ALL') // 'ALL' | 'PICKUP' | 'PENDING'
  const [rates, setRates] = useState(exchangeRates.getRates())
  const [isUpdatingRates, setIsUpdatingRates] = useState(false)
  const pageSize = 15

  // Fetch live FX rates on mount
  useEffect(() => {
    let isMounted = true
    const loadRates = async () => {
      setIsUpdatingRates(true)
      const r = await exchangeRates.fetchLiveRates()
      if (isMounted) {
        setRates({ ...r })
        setIsUpdatingRates(false)
      }
    }
    loadRates()
    return () => {
      isMounted = false
    }
  }, [])

  const handleManualRefreshRates = async () => {
    soundManager.playClick()
    setIsUpdatingRates(true)
    const r = await exchangeRates.fetchLiveRates()
    setRates({ ...r })
    setIsUpdatingRates(false)
    soundManager.playSuccess()
  }

  // Calculate currency balances
  const totalEur = bookings.reduce((sum, b) => sum + (Number(b.rest_eur) || 0), 0)
  const totalEgp = bookings.reduce((sum, b) => sum + (Number(b.rest_egp) || 0), 0)
  const totalUsd = bookings.reduce((sum, b) => sum + (Number(b.rest_usd) || 0), 0)
  const totalGbp = bookings.reduce((sum, b) => sum + (Number(b.rest_gbp) || 0), 0)

  // Real-time Consolidated Totals (EUR & EGP)
  const consolidatedEur = useMemo(() => {
    const fromEgp = totalEgp / (rates.EGP || 53.25)
    const fromUsd = (totalUsd / (rates.USD || 1.08))
    const fromGbp = (totalGbp / (rates.GBP || 0.84))
    return Math.round((totalEur + fromEgp + fromUsd + fromGbp) * 100) / 100
  }, [totalEur, totalEgp, totalUsd, totalGbp, rates])

  const consolidatedEgp = useMemo(() => {
    const fromEur = totalEur * (rates.EGP || 53.25)
    const fromUsd = (totalUsd / (rates.USD || 1.08)) * (rates.EGP || 53.25)
    const fromGbp = (totalGbp / (rates.GBP || 0.84)) * (rates.EGP || 53.25)
    return Math.round((totalEgp + fromEur + fromUsd + fromGbp))
  }, [totalEur, totalEgp, totalUsd, totalGbp, rates])

  // Filter cash entries safely
  const cashList = useMemo(() => {
    return bookings.filter((b) => {
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
  }, [bookings, activeTabFilter])

  const totalPages = Math.ceil(cashList.length / pageSize) || 1
  const paginatedList = cashList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const getTripArabicName = (rawName = '') => {
    const clean = rawName.toLowerCase().trim()
    const found = tripDefinitions.find(
      (td) =>
        (td.sheet_name || '').toLowerCase().trim() === clean ||
        (td.display_name || '').toLowerCase().trim() === clean
    )
    return found?.display_name || rawName || 'تحصيل رحلة'
  }

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
      {/* Consolidated Master Totals with Live FX Rates Bar */}
      <div className="bg-[#0f172a] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-400" />
              <span>الخزينة المجمعة ومتابعة التحصيلات</span>
            </h2>
            <div className="text-[11px] text-slate-400 mt-0.5">
              تحويل لحظي لكافة العملات الأجنبية والمحلية بأسعار الصرف المباشرة
            </div>
          </div>

          {/* Real-time FX Ticker Pill */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700 text-xs font-mono">
            <span className="text-slate-400 text-[10px] font-sans">أسعار الصرف اللحظية:</span>
            <span className="text-emerald-400 font-bold">1€ = {(rates.EGP || 53.25).toFixed(2)} ج.م</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-bold">1$ = {((rates.EGP || 53.25) / (rates.USD || 1.08)).toFixed(2)} ج.م</span>
            <button
              onClick={handleManualRefreshRates}
              title="تحديث أسعار الصرف الآن"
              className="p-1 hover:bg-slate-700 rounded-full transition-colors text-slate-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingRates ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Unified 2 Grand Totals: Total in EUR & Total in EGP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/70 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400">إجمالي الخزينة الموحد باليورو</div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                €{consolidatedEur.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-bold">
                شامل تحويل الجنيه والدولار والإسترليني لليورو
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <Euro className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/70 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400">إجمالي الخزينة الموحد بالجنيه المصري</div>
              <div className="text-2xl sm:text-3xl font-black text-[#38bdf8] font-mono mt-1">
                {consolidatedEgp.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-300">ج.م</span>
              </div>
              <div className="text-[10px] text-sky-400 mt-1 font-bold">
                المعادل الإجمالي بالجنيه المصري بسعر البنك اللحظي
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-black">
              <Coins className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Active Currency Cards Grid (Only shows active currencies with balance > 0) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {totalEur > 0 && (
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>اليورو الأوروبي (EUR)</span>
              <Euro className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-[#0a2540] font-mono">
              €{totalEur.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold">العملة الأساسية للرحلات</div>
          </div>
        )}

        {totalEgp > 0 && (
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>الجنيه المصري (EGP)</span>
              <Coins className="w-4 h-4 text-[#0284c7]" />
            </div>
            <div className="text-2xl font-black text-[#0a2540] font-mono">
              {totalEgp.toLocaleString()} <span className="text-xs font-sans">ج.م</span>
            </div>
            <div className="text-[11px] text-slate-400">التحصيل المحلي الميداني</div>
          </div>
        )}

        {totalUsd > 0 && (
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>الدولار الأمريكي (USD)</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-[#0a2540] font-mono">
              ${totalUsd.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">حجوزات أجنبية بالدولار</div>
          </div>
        )}

        {totalGbp > 0 && (
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>الجنيه الإسترليني (GBP)</span>
              <Banknote className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-[#0a2540] font-mono">
              £{totalGbp.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">نزلاء إنجلترا</div>
          </div>
        )}
      </div>

      {/* Cash Movements Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden p-4 sm:p-5 space-y-3">
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
            {cashList.length} حركة مسجلة
          </span>
        </div>

        {/* Mobile Bento List */}
        <div className="space-y-2 lg:hidden">
          {paginatedList.map((cp) => {
            const arabicTrip = getTripArabicName(cp.trip_type)
            return (
              <div
                key={cp.sr}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <div className="font-mono font-bold text-[#0284c7]">#{cp.sr}</div>
                  <div className="font-bold text-slate-800">{arabicTrip}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black text-slate-800">{cp.guest_name || 'غير محدد'}</div>
                    <div className="text-[11px] text-slate-500">
                      {cp.hotel || '-'} • غرفة {cp.room || '-'}
                    </div>
                  </div>

                  <div className="text-left font-black font-mono text-emerald-600 text-sm">
                    {cp.rest_eur > 0 && `€${cp.rest_eur}`}
                    {cp.rest_egp > 0 && ` ${cp.rest_egp} ج.م`}
                    {cp.rest_usd > 0 && ` $${cp.rest_usd}`}
                    {cp.rest_gbp > 0 && ` £${cp.rest_gbp}`}
                    {cp.rest_eur === 0 && cp.rest_egp === 0 && cp.rest_usd === 0 && cp.rest_gbp === 0 && '€0'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">
                    المندوب: {cp.seller || 'مباشر'}
                  </span>
                  {(cp.rest_eur > 0 || cp.rest_egp > 0 || cp.rest_usd > 0 || cp.rest_gbp > 0) && (
                    <button
                      onClick={() => handleCollect(cp)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                      تحصيل
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop Single-Line Table with Horizontal Scroll */}
        <div className="hidden lg:block overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-200/80 w-full">
          <table className="w-full text-start border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#0a2540] text-white text-xs font-bold h-11">
                <th className="px-3 font-mono text-start">SR</th>
                <th className="px-3 text-start">النزيل</th>
                <th className="px-3 text-start">الفندق (الغرفة)</th>
                <th className="px-3 text-start">المندوب</th>
                <th className="px-3 text-start">الرحلة (بالعربي)</th>
                <th className="px-3 text-center font-mono">المتبقي (€)</th>
                <th className="px-3 text-center font-mono">المتبقي (ج.م)</th>
                <th className="px-3 text-center font-mono">دولار ($)</th>
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

                const arabicTrip = getTripArabicName(cp.trip_type)

                return (
                  <tr key={cp.sr} className="h-11 hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="px-3 font-mono font-bold text-[#0284c7]">#{cp.sr}</td>
                    <td className="px-3 font-black text-[#0a2540] max-w-[160px] truncate" title={cp.guest_name}>
                      {cp.guest_name || 'غير محدد'}
                    </td>
                    <td className="px-3 text-slate-700 max-w-[180px] truncate" title={`${cp.hotel} (${cp.room})`}>
                      <span className="font-bold">{cp.hotel || '-'}</span>{' '}
                      <span className="text-slate-400 font-mono">({cp.room || '-'})</span>
                    </td>
                    <td className="px-3 text-slate-600 font-bold">{cp.seller || 'مباشر'}</td>
                    <td className="px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-50 text-sky-800 border border-sky-100">
                        {arabicTrip}
                      </span>
                    </td>
                    <td className="px-3 text-center font-mono font-bold text-emerald-600">
                      €{cp.rest_eur || 0}
                    </td>
                    <td className="px-3 text-center font-mono font-bold text-[#0284c7]">
                      {cp.rest_egp || 0} ج.م
                    </td>
                    <td className="px-3 text-center font-mono font-bold text-amber-600">
                      ${cp.rest_usd || 0}
                    </td>
                    <td className="px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                        <span className="text-slate-300">—</span>
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
