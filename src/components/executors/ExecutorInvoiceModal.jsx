import React, { useRef, useState, useMemo } from 'react'
import {
  Printer,
  Share2,
  X,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  ListFilter,
  Eye,
  SlidersHorizontal,
  Copy,
  Check
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function ExecutorInvoiceModal({ isOpen, onClose, executor, bookings = [], tripDefinitions = [] }) {
  const printRef = useRef(null)
  const { lang, t, selectedDate } = useAXStore()
  const isRtl = lang === 'ar'

  const [periodFilter, setPeriodFilter] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [viewMode, setViewMode] = useState('summary')
  const [isCopied, setIsCopied] = useState(false)

  // Safe executor bookings matching
  const exBookingsAll = useMemo(() => {
    if (!executor) return []
    return bookings.filter((b) => {
      if (b.executor_id === executor.id) return true
      if (b.executor_id && b.executor_id === executor.name) return true
      if (!b.executor_id) {
        const cleanType = (b.trip_type || b.trip || '').toLowerCase().trim().replace(/\s+/g, ' ')
        const matched = tripDefinitions.find((td) => {
          const s = (td.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
          const d = (td.display_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
          return s === cleanType || d === cleanType
        })
        return matched?.executor_id === executor.id
      }
      return false
    })
  }, [bookings, executor, tripDefinitions])

  // Filtered by selected period
  const exBookings = useMemo(() => {
    if (periodFilter === 'all') return exBookingsAll
    if (periodFilter === 'today') {
      const today = selectedDate || new Date().toISOString().split('T')[0]
      return exBookingsAll.filter((b) => b.date === today)
    }
    if (periodFilter === 'month') {
      const ref = selectedDate || new Date().toISOString().split('T')[0]
      const prefix = ref.substring(0, 7)
      return exBookingsAll.filter((b) => (b.date || '').startsWith(prefix))
    }
    if (periodFilter === 'custom') {
      return exBookingsAll.filter((b) => {
        if (!b.date) return false
        if (customFrom && b.date < customFrom) return false
        if (customTo && b.date > customTo) return false
        return true
      })
    }
    return exBookingsAll
  }, [exBookingsAll, periodFilter, selectedDate, customFrom, customTo])

  // Aggregated Summary by Date and Trip
  const aggregatedRows = useMemo(() => {
    const map = new Map()
    exBookings.forEach((b) => {
      const tripDef = tripDefinitions.find((td) => {
        const s = (td.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
        const d = (td.display_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
        const target = (b.trip_type || b.trip || '').toLowerCase().trim().replace(/\s+/g, ' ')
        return s === target || d === target
      })

      const tripName = tripDef?.display_name || b.trip_type || b.trip || (isRtl ? 'رحلة' : 'Trip')
      const rowDate = b.date || (isRtl ? 'غير محدد' : 'N/A')
      const key = `${rowDate}__${b.trip_type || b.trip}`
      const isPax = (tripDef?.pricing_type || b.pricing_type) !== 'trip'
      const paxCount = (Number(b.adult) || 0) + (Number(b.child) || 0)
      const costEur = Number(b.cost_eur) || 0

      if (!map.has(key)) {
        map.set(key, {
          date: rowDate,
          trip_type: b.trip_type || b.trip,
          trip_name: tripName,
          is_pax: isPax,
          quantity: isPax ? paxCount : 1,
          total_cost: costEur,
          unit_cost: isPax && paxCount > 0 ? (costEur / paxCount).toFixed(1) : costEur
        })
      } else {
        const prev = map.get(key)
        const nextQty = prev.quantity + (isPax ? paxCount : 1)
        const nextCost = prev.total_cost + costEur
        map.set(key, {
          ...prev,
          quantity: nextQty,
          total_cost: nextCost,
          unit_cost: isPax && nextQty > 0 ? (nextCost / nextQty).toFixed(1) : prev.unit_cost
        })
      }
    })

    return Array.from(map.values()).sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  }, [exBookings, tripDefinitions, isRtl])

  // Financial sums
  const totalCostDue = useMemo(() => {
    return exBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
  }, [exBookings])

  const totalPaid = Number(executor?.total_paid) || 0
  const remainingBalance = Math.max(0, totalCostDue - totalPaid)
  const paymentsList = executor?.payments || []

  if (!isOpen || !executor) return null

  const handlePrint = () => {
    soundManager.playClick()
    window.print()
  }

  const handleShare = async () => {
    soundManager.playClick()
    const summaryText = isRtl
      ? `كشف حساب وفاتورة منفذ: ${executor.name}\nالفترة: ${periodFilter === 'all' ? 'كافة الفترات' : periodFilter}\nإجمالي المستحق: €${totalCostDue.toLocaleString()}\nالمسدد: €${totalPaid.toLocaleString()}\nالمتبقي: €${remainingBalance.toLocaleString()}`
      : `Executor Statement & Invoice: ${executor.name}\nPeriod: ${periodFilter}\nTotal Due: €${totalCostDue.toLocaleString()}\nTotal Paid: €${totalPaid.toLocaleString()}\nRemaining: €${remainingBalance.toLocaleString()}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${isRtl ? 'فاتورة حساب منفذ' : 'Executor Statement'}: ${executor.name}`,
          text: summaryText,
          url: window.location.href
        })
      } catch {
        // user cancelled
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(summaryText)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2500)
      } catch {
        // fallback
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0a2540]/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 relative my-6 animate-scaleUp overflow-hidden flex flex-col">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="print:hidden p-3.5 sm:p-4 bg-slate-900 text-white border-b border-slate-800 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              <span className="text-sm font-black">
                {isRtl ? 'كشف حساب ومطالبة توريد المنفذ' : 'Executor Account Statement & Invoice'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-mono font-bold">
                {executor.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isRtl ? 'طباعة A4' : 'Print A4'}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{isCopied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'مشاركة' : 'Share')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick()
                  onClose()
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
            {/* Period Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 text-[11px] font-bold">
                {isRtl ? 'الفترة:' : 'Period:'}
              </span>
              {[
                { id: 'all', labelAr: 'كافة الفترات', labelEn: 'All Time' },
                { id: 'today', labelAr: 'اليوم', labelEn: 'Today' },
                { id: 'month', labelAr: 'هذا الشهر', labelEn: 'This Month' },
                { id: 'custom', labelAr: 'مخصص', labelEn: 'Custom' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick()
                    setPeriodFilter(p.id)
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    periodFilter === p.id
                      ? 'bg-sky-500 text-white font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isRtl ? p.labelAr : p.labelEn}
                </button>
              ))}
            </div>

            {/* Custom Range Inputs if custom */}
            {periodFilter === 'custom' && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="bg-slate-800 text-white px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono"
                  placeholder="From"
                />
                <span className="text-slate-500">→</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="bg-slate-800 text-white px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono"
                  placeholder="To"
                />
              </div>
            )}

            {/* View Mode Toggle (Summary vs Detailed) */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-full border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick()
                  setViewMode('summary')
                }}
                className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'summary' ? 'bg-[#0284c7] text-white font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'بيان مجمع' : 'Summary'}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick()
                  setViewMode('detailed')
                }}
                className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'detailed' ? 'bg-[#0284c7] text-white font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'تفصيلي (360°)' : 'Itemized (360°)'}
              </button>
            </div>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div
          ref={printRef}
          id="ax-invoice-print-area"
          className="p-6 sm:p-10 space-y-6 text-slate-800 bg-white"
        >
          {/* Invoice Header: Company Brand + Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#0284c7] p-1 shadow-md bg-[#0a2540] flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo-circle.png"
                  alt="HURGHADA FOR YOU"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#0a2540] leading-none">
                  {isRtl ? 'غردقة فور يو للسياحة والرحلات' : 'HURGHADA FOR YOU TOURISM'}
                </h1>
                <div className="text-xs font-mono font-bold text-sky-700 mt-1 tracking-wider">
                  HURGHADA FOR YOU TOURISM & OPERATIONS
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {isRtl
                    ? 'الغردقة، البحر الأحمر، مصر • هاتف: 01001234567 • سجل تجاري وبطاقة ضريبية معتمدة'
                    : 'Hurghada, Red Sea, Egypt • Tel: 01001234567 • Certified Tourism Operations'}
                </div>
              </div>
            </div>

            <div className="text-left font-mono space-y-1">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-800">
                #INV-EX-{(executor.id || '').toUpperCase()}
              </div>
              <div className="text-xs text-slate-500 font-sans">
                {isRtl ? 'تاريخ الاستخراج:' : 'Issue Date:'}{' '}
                <strong>{new Date().toISOString().split('T')[0]}</strong>
              </div>
              <div className="text-xs text-slate-500 font-sans">
                {isRtl ? 'العملة المعتمدة:' : 'Currency:'} <strong>EUR (€)</strong>
              </div>
            </div>
          </div>

          {/* Partner & Statement Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <div className="text-xs text-slate-400 font-bold mb-1">
                {isRtl ? 'بيانات المورد / المنفذ:' : 'Supplier / Partner Details:'}
              </div>
              <div className="text-base font-black text-[#0a2540]">{executor.name}</div>
              <div className="text-xs text-slate-600 font-bold mt-0.5">{executor.category}</div>
              {executor.phone && (
                <div className="text-xs font-mono text-slate-500 mt-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>{executor.phone}</span>
                </div>
              )}
            </div>

            <div className="text-left sm:border-r sm:border-slate-200 sm:pr-4 flex flex-col justify-center">
              <div className="text-xs text-slate-400 font-bold mb-1">
                {isRtl ? 'ملخص الحركات المنفذة:' : 'Operations Summary:'}
              </div>
              <div className="text-xs font-bold text-slate-700">
                {isRtl ? 'إجمالي الحجوزات المنفذة:' : 'Total Bookings Executed:'}{' '}
                <strong className="font-mono">{exBookings.length} {isRtl ? 'حجز' : 'bookings'}</strong>
              </div>
              <div className="text-xs font-bold text-slate-700 mt-1">
                {isRtl ? 'حالة المطالبة:' : 'Claim Status:'}{' '}
                <span className={`font-black ${remainingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {remainingBalance > 0 ? (isRtl ? 'مستحق السداد' : 'Due for Payment') : (isRtl ? 'مسدد بالكامل' : 'Fully Settled')}
                </span>
              </div>
            </div>
          </div>

          {/* Statement Table: Summary or Detailed */}
          {viewMode === 'summary' ? (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-800">
                {isRtl ? 'بيان التوريدات والرحلات المنفذة (مجمع باليوم والرحلة):' : 'Executed Trips Statement (Aggregated by Day & Trip):'}
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0a2540] text-white h-10 font-bold">
                      <th className="px-3 text-start">{isRtl ? 'التاريخ' : 'Date'}</th>
                      <th className="px-3 text-start">{isRtl ? 'نوع الرحلة المنفذة' : 'Trip Type'}</th>
                      <th className="px-3 text-center">{isRtl ? 'طريقة الحساب' : 'Pricing Mode'}</th>
                      <th className="px-3 text-center">{isRtl ? 'الكمية (أفراد / رحلات)' : 'Quantity (PAX / Bookings)'}</th>
                      <th className="px-3 text-center">{isRtl ? 'سعر التكلفة المتفق عليه' : 'Agreed Cost Unit'}</th>
                      <th className="px-3 text-center font-mono">{isRtl ? 'الإجمالي المستحق (€)' : 'Total Due (€)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {aggregatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          {isRtl ? 'لا توجد رحلات مسجلة لهذا المنفذ في الفترة المحددة.' : 'No trips registered for this partner in the selected period.'}
                        </td>
                      </tr>
                    ) : (
                      aggregatedRows.map((row, idx) => (
                        <tr key={idx} className="h-10 hover:bg-slate-50/80">
                          <td className="px-3 font-mono font-bold text-slate-600">{row.date}</td>
                          <td className="px-3 font-black text-slate-800">{row.trip_name}</td>
                          <td className="px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {row.is_pax ? (isRtl ? 'بالأفراد (PAX)' : 'Per PAX') : (isRtl ? 'بالرحلة (Trip)' : 'Per Trip')}
                            </span>
                          </td>
                          <td className="px-3 text-center font-mono font-bold text-slate-800">
                            {row.quantity} {row.is_pax ? (isRtl ? 'فرد' : 'pax') : (isRtl ? 'رحلة' : 'trips')}
                          </td>
                          <td className="px-3 text-center font-mono font-bold text-slate-600">
                            €{row.unit_cost}
                          </td>
                          <td className="px-3 text-center font-mono font-black text-slate-900">
                            €{row.total_cost.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Detailed 360° Itemized Ledger Table */
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-800">
                {isRtl ? 'كشف الحساب التفصيلي 360° (بيان كل حجز ونزيل منفذ):' : 'Itemized 360° Booking Ledger:'}
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0a2540] text-white h-10 font-bold">
                      <th className="px-3 text-start font-mono">#SR</th>
                      <th className="px-3 text-start">{isRtl ? 'التاريخ' : 'Date'}</th>
                      <th className="px-3 text-start">{isRtl ? 'النزيل' : 'Guest'}</th>
                      <th className="px-3 text-start">{isRtl ? 'الفندق (الغرفة)' : 'Hotel (Room)'}</th>
                      <th className="px-3 text-start">{isRtl ? 'نوع الرحلة' : 'Trip'}</th>
                      <th className="px-3 text-center">{isRtl ? 'الأفراد' : 'PAX'}</th>
                      <th className="px-3 text-center font-mono">{isRtl ? 'تكلفة التوريد (€)' : 'Cost (€)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {exBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          {isRtl ? 'لا توجد حجوزات مسجلة لهذا المنفذ في الفترة المحددة.' : 'No bookings registered in the selected period.'}
                        </td>
                      </tr>
                    ) : (
                      exBookings.map((b) => (
                        <tr key={b.sr} className="h-10 hover:bg-slate-50/80">
                          <td className="px-3 font-mono font-bold text-[#0284c7]">#{b.sr}</td>
                          <td className="px-3 font-mono text-slate-600">{b.date}</td>
                          <td className="px-3 font-bold text-slate-800">{b.guest_name}</td>
                          <td className="px-3 text-slate-600">{b.hotel} ({b.room})</td>
                          <td className="px-3 font-bold text-slate-800">{b.trip_type}</td>
                          <td className="px-3 text-center font-mono">
                            {b.adult} {isRtl ? 'ك' : 'ad'} {b.child > 0 ? `+ ${b.child} ${isRtl ? 'ص' : 'ch'}` : ''}
                          </td>
                          <td className="px-3 text-center font-mono font-black text-amber-700">
                            €{b.cost_eur}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments History Table */}
          {paymentsList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-800">
                {isRtl ? 'سجل الدفعات والتسديدات السابقة للمنفذ:' : 'Payment & Settlement History:'}
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 h-9 font-bold">
                      <th className="px-3 text-start">{isRtl ? 'تاريخ السداد' : 'Payment Date'}</th>
                      <th className="px-3 text-start">{isRtl ? 'مبلغ الدفعة' : 'Amount'}</th>
                      <th className="px-3 text-start">{isRtl ? 'العملة' : 'Currency'}</th>
                      <th className="px-3 text-start">{isRtl ? 'ملاحظات وقيد السداد' : 'Notes'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentsList.map((p, idx) => (
                      <tr key={p.id || idx} className="h-9">
                        <td className="px-3 font-mono text-slate-600">{p.date}</td>
                        <td className="px-3 font-mono font-black text-emerald-600">€{p.amount}</td>
                        <td className="px-3 font-bold text-slate-500">{p.currency || 'EUR'}</td>
                        <td className="px-3 text-slate-600">{p.notes || (isRtl ? 'سداد معتمد' : 'Approved payment')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Final Statement Balances Box */}
          <div className="bg-slate-50 p-5 rounded-3xl border-2 border-slate-200 space-y-3 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans font-bold text-slate-600">
                {isRtl ? 'إجمالي تكلفة الرحلات المستحقة:' : 'Total Accrued Trips Cost:'}
              </span>
              <span className="font-black text-slate-900 text-sm">€{totalCostDue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans font-bold text-slate-600">
                {isRtl ? 'إجمالي المدفوعات المسددة للمنفذ:' : 'Total Payments Settled:'}
              </span>
              <span className="font-black text-emerald-600 text-sm">€{totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t-2 border-slate-300">
              <span className="font-sans font-black text-[#0a2540]">
                {isRtl ? 'صافي الرصيد المتبقي للمنفذ (Net Balance):' : 'Net Remaining Balance Due:'}
              </span>
              <span className="font-black text-rose-600 text-lg">€{remainingBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Official Signature Stamp Bar */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs font-bold text-slate-600">
            <div>
              <div>{isRtl ? 'توقيع واعتماد الحسابات:' : 'Accounts Approval & Signature:'}</div>
              <div className="mt-8 border-b border-dashed border-slate-400 w-48"></div>
            </div>
            <div className="text-left">
              <div>{isRtl ? 'ختم وتوقيع المورد المستلم:' : 'Supplier Stamp & Acceptance:'}</div>
              <div className="mt-8 border-b border-dashed border-slate-400 w-48 mr-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
