import React, { useRef } from 'react'
import { Printer, Download, Share2, X, CheckCircle2, Building2, Phone, Calendar, Ship, FileText } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function ExecutorInvoiceModal({ isOpen, onClose, executor, bookings, tripDefinitions }) {
  const printRef = useRef(null)

  if (!isOpen || !executor) return null

  // Filter bookings strictly executed by this partner
  const exBookings = bookings.filter((b) => b.executor_id === executor.id)

  // Aggregate by Date and Trip Type (Rule: Do NOT list guest names, aggregate by date & trip)
  const aggregatedMap = new Map()

  exBookings.forEach((b) => {
    const tripDef = tripDefinitions.find(
      (td) =>
        (td.sheet_name || '').toLowerCase().trim() === (b.trip_type || '').toLowerCase().trim() ||
        (td.display_name || '').toLowerCase().trim() === (b.trip_type || '').toLowerCase().trim()
    )

    const tripName = tripDef?.display_name || b.trip_type || 'رحلة'
    const key = `${b.date}__${b.trip_type}`
    const isPax = (tripDef?.pricing_type || b.pricing_type) === 'pax'
    const paxCount = (Number(b.adult) || 0) + (Number(b.child) || 0)
    const costEur = Number(b.cost_eur) || 0

    if (!aggregatedMap.has(key)) {
      aggregatedMap.set(key, {
        date: b.date,
        trip_type: b.trip_type,
        trip_name: tripName,
        is_pax: isPax,
        quantity: isPax ? paxCount : 1,
        total_cost: costEur,
        unit_cost: isPax && paxCount > 0 ? (costEur / paxCount).toFixed(1) : costEur,
        currency: b.currency || 'EUR'
      })
    } else {
      const prev = aggregatedMap.get(key)
      const nextQty = prev.quantity + (isPax ? paxCount : 1)
      const nextCost = prev.total_cost + costEur
      aggregatedMap.set(key, {
        ...prev,
        quantity: nextQty,
        total_cost: nextCost,
        unit_cost: isPax && nextQty > 0 ? (nextCost / nextQty).toFixed(1) : prev.unit_cost
      })
    }
  })

  const aggregatedRows = Array.from(aggregatedMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  const totalCostDue = exBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
  const totalPaid = executor.total_paid || 0
  const remainingBalance = Math.max(0, totalCostDue - totalPaid)
  const paymentsList = executor.payments || []

  const handlePrint = () => {
    soundManager.playClick()
    window.print()
  }

  const handleShare = async () => {
    soundManager.playClick()
    if (navigator.share) {
      try {
        await navigator.share({
          title: `فاتورة حساب منفذ: ${executor.name}`,
          text: `فاتورة ومطالبة توريد رحلات لـ ${executor.name} - الإجمالي: €${totalCostDue} - المسدد: €${totalPaid} - المتبقي: €${remainingBalance}`,
          url: window.location.href
        })
      } catch (e) {
        console.warn('Share dismissed', e)
      }
    } else {
      navigator.clipboard?.writeText(
        `فاتورة حساب منفذ: ${executor.name}\nإجمالي المستحق: €${totalCostDue}\nالمسدد: €${totalPaid}\nالمتبقي: €${remainingBalance}`
      )
      soundManager.playSuccess()
      alert('تم نسخ ملخص الفاتورة إلى الحافظة بنجاح!')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 relative my-6 animate-scaleUp overflow-hidden flex flex-col">
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span className="text-sm font-black">فاتورة تصفية ومطالبة حساب للمنفذ</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة A4</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full text-xs font-bold transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet (A4 Proportion) */}
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
                  alt="غردقة فور يو"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#0a2540] leading-none">
                  غردقة فور يو للسياحة والرحلات
                </h1>
                <div className="text-xs font-mono font-bold text-sky-700 mt-1 tracking-wider">
                  HURGHADA FOR YOU TOURISM & OPERATIONS
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  الغردقة، البحر الأحمر، مصر • هاتف: 01001234567 • سجل تجاري وبطاقة ضريبية معتمدة
                </div>
              </div>
            </div>

            <div className="text-left font-mono space-y-1">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-800">
                #INV-EX-{executor.id.toUpperCase()}
              </div>
              <div className="text-xs text-slate-500 font-sans">
                تاريخ الاستخراج: <strong>{new Date().toISOString().split('T')[0]}</strong>
              </div>
              <div className="text-xs text-slate-500 font-sans">
                العملة المعتمدة: <strong>EUR (€)</strong>
              </div>
            </div>
          </div>

          {/* Partner & Statement Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <div className="text-xs text-slate-400 font-bold mb-1">بيانات المورد / المنفذ:</div>
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
              <div className="text-xs text-slate-400 font-bold mb-1">ملخص الحركات المنفذة:</div>
              <div className="text-xs font-bold text-slate-700">
                إجمالي الحجوزات: <strong className="font-mono">{exBookings.length} حجز</strong>
              </div>
              <div className="text-xs font-bold text-slate-700 mt-1">
                حالة المطالبة: <span className="font-black text-amber-600">{remainingBalance > 0 ? 'مستحق السداد' : 'مسدد بالكامل'}</span>
              </div>
            </div>
          </div>

          {/* Aggregated Daily Operations Table (NO GUEST NAMES) */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-800">
              بيان التوريدات والرحلات المنفذة (مجمع باليوم والرحلة):
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0a2540] text-white h-10 font-bold">
                    <th className="px-3 text-start">التاريخ</th>
                    <th className="px-3 text-start">نوع الرحلة المنفذة</th>
                    <th className="px-3 text-center">طريقة الحساب</th>
                    <th className="px-3 text-center">الكمية (أفراد / رحلات)</th>
                    <th className="px-3 text-center">سعر التكلفة المتفق عليه</th>
                    <th className="px-3 text-center font-mono">الإجمالي المستحق (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {aggregatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        لا توجد رحلات مسجلة لهذا المنفذ في الفترة الحالية.
                      </td>
                    </tr>
                  ) : (
                    aggregatedRows.map((row, idx) => (
                      <tr key={idx} className="h-10 hover:bg-slate-50/80">
                        <td className="px-3 font-mono font-bold text-slate-600">{row.date}</td>
                        <td className="px-3 font-black text-slate-800">{row.trip_name}</td>
                        <td className="px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {row.is_pax ? 'بالأفراد (PAX)' : 'بالرحلة (Booking)'}
                          </span>
                        </td>
                        <td className="px-3 text-center font-mono font-bold text-slate-800">
                          {row.quantity} {row.is_pax ? 'فرد' : 'رحلة'}
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

          {/* Payments History Table */}
          {paymentsList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-800">
                سجل الدفعات والتسديدات السابقة للمنفذ:
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 h-9 font-bold">
                      <th className="px-3 text-start">تاريخ السداد</th>
                      <th className="px-3 text-start">مبلغ الدفعة</th>
                      <th className="px-3 text-start">العملة</th>
                      <th className="px-3 text-start">ملاحظات وقيد السداد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentsList.map((p, idx) => (
                      <tr key={p.id || idx} className="h-9">
                        <td className="px-3 font-mono text-slate-600">{p.date}</td>
                        <td className="px-3 font-mono font-black text-emerald-600">€{p.amount}</td>
                        <td className="px-3 font-bold text-slate-500">{p.currency || 'EUR'}</td>
                        <td className="px-3 text-slate-600">{p.notes || 'سداد معتمد'}</td>
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
              <span className="font-sans font-bold text-slate-600">إجمالي تكلفة الرحلات المستحقة:</span>
              <span className="font-black text-slate-900 text-sm">€{totalCostDue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans font-bold text-slate-600">إجمالي المدفوعات المسددة للمنفذ:</span>
              <span className="font-black text-emerald-600 text-sm">€{totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t-2 border-slate-300">
              <span className="font-sans font-black text-[#0a2540]">صافي الرصيد المتبقي للمنفذ (Net Balance):</span>
              <span className="font-black text-rose-600 text-lg">€{remainingBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Official Signature Stamp Bar */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs font-bold text-slate-600">
            <div>
              <div>توقيع واعتماد الحسابات:</div>
              <div className="mt-8 border-b border-dashed border-slate-400 w-48"></div>
            </div>
            <div className="text-left">
              <div>ختم وتوقيع المورد المستلم:</div>
              <div className="mt-8 border-b border-dashed border-slate-400 w-48 mr-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
