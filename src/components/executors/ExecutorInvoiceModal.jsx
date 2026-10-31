import React, { useRef, useState, useMemo, useEffect } from 'react'
import html2canvas from 'html2canvas'
import {
  Printer,
  FileDown,
  Image as ImageIcon,
  Share2,
  X,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  ArrowRight
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function ExecutorInvoiceModal({ isOpen, onClose, executor, bookings = [], tripDefinitions = [] }) {
  const printRef = useRef(null)
  const overlayRef = useRef(null)
  const { lang, selectedDate } = useAXStore()
  const isRtl = lang === 'ar'

  const [periodFilter, setPeriodFilter] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [viewMode, setViewMode] = useState('summary')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isCopied, setIsCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportNotice, setExportNotice] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        soundManager.playClick()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

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

  const handleSavePdf = () => {
    soundManager.playClick()
    setExportNotice(isRtl ? 'اختر "حفظ بتنسيق PDF" من شاشة الطباعة' : 'Select "Save as PDF" in printer options')
    setTimeout(() => {
      setExportNotice(null)
      window.print()
    }, 600)
  }

  const captureCanvas = async () => {
    if (!printRef.current) return null
    setIsExporting(true)
    try {
      const prevTransform = printRef.current.style.transform
      printRef.current.style.transform = 'none'
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      printRef.current.style.transform = prevTransform
      return canvas
    } catch (err) {
      console.error('Export failed:', err)
      return null
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadImage = async () => {
    soundManager.playClick()
    const canvas = await captureCanvas()
    if (!canvas) return
    const link = document.createElement('a')
    const safeName = (executor.name || 'executor').replace(/\s+/g, '_')
    const dateStr = new Date().toISOString().split('T')[0]
    link.download = `Hurghada4U_Invoice_${safeName}_${dateStr}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    soundManager.playSuccess()
    setExportNotice(isRtl ? 'تم تحميل صورة الفاتورة بنجاح' : 'Invoice image downloaded successfully')
    setTimeout(() => setExportNotice(null), 3000)
  }

  const getSummaryText = () => {
    const periodLabel = periodFilter === 'all'
      ? (isRtl ? 'كافة الفترات' : 'All Time')
      : periodFilter === 'today'
      ? (isRtl ? `اليوم (${selectedDate || 'اليوم'})` : 'Today')
      : periodFilter === 'month'
      ? (isRtl ? 'الشهر الحالي' : 'Current Month')
      : `${customFrom || ''} → ${customTo || ''}`

    return [
      `📋 *${isRtl ? 'غردقة فور يو للسياحة والرحلات' : 'HURGHADA FOR YOU TOURISM'}*`,
      `*${isRtl ? 'كشف حساب ومطالبة توريد للمنفذ' : 'Executor Statement & Invoice'}:* ${executor.name}`,
      `-----------------------------`,
      `📅 *${isRtl ? 'الفترة' : 'Period'}:* ${periodLabel}`,
      `📊 *${isRtl ? 'الحركات المنفذة' : 'Executed Trips'}:* ${exBookings.length} ${isRtl ? 'حجز' : 'bookings'}`,
      `💰 *${isRtl ? 'إجمالي المستحق' : 'Total Due'}:* €${totalCostDue.toLocaleString()}`,
      `💳 *${isRtl ? 'المسدد' : 'Settled'}:* €${totalPaid.toLocaleString()}`,
      `⏳ *${isRtl ? 'الرصيد المتبقي' : 'Remaining Balance'}:* €${remainingBalance.toLocaleString()}`,
      `-----------------------------`,
      `*#INV-EX-${(executor.id || '').toUpperCase()}*`,
      `*${new Date().toISOString().split('T')[0]}*`
    ].join('\n')
  }

  const handleWhatsApp = async () => {
    soundManager.playClick()
    const summaryText = getSummaryText()
    const rawPhone = (executor.phone || '').replace(/[^0-9]/g, '')
    const targetPhone = rawPhone.startsWith('01') ? `2${rawPhone}` : rawPhone

    if (navigator.canShare && navigator.share) {
      try {
        const canvas = await captureCanvas()
        if (canvas) {
          const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
          if (blob) {
            const file = new File([blob], `Invoice_${executor.name}.png`, { type: 'image/png' })
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `${isRtl ? 'فاتورة' : 'Invoice'}: ${executor.name}`,
                text: summaryText,
                files: [file]
              })
              return
            }
          }
        }
      } catch (err) {
        console.warn('Native share fallback', err)
      }
    }

    const waUrl = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(summaryText)}`
      : `https://wa.me/?text=${encodeURIComponent(summaryText)}`
    window.open(waUrl, '_blank')
  }

  const handleCopySummary = async () => {
    soundManager.playClick()
    const summaryText = getSummaryText()
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(summaryText)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2500)
      } catch (err) {
        console.warn('Clipboard write error', err)
      }
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      soundManager.playClick()
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none overflow-hidden ax-invoice-modal-overlay"
    >
      <div className="print:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-xl flex-shrink-0 text-white">
        <div className="w-full px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick()
                onClose()
              }}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
              title={isRtl ? 'إغلاق (Esc)' : 'Close (Esc)'}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 truncate">
              <FileText className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-black truncate">
                {isRtl ? 'كشف حساب المنفذ' : 'Executor Statement'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-mono font-bold truncate">
                {executor.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isRtl ? 'طباعة A4' : 'Print A4'}</span>
            </button>

            <button
              type="button"
              onClick={handleSavePdf}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isRtl ? 'حفظ PDF' : 'Save PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
              <span>{isRtl ? 'حفظ صورة' : 'Save Image'}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isRtl ? 'واتساب' : 'WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ النص' : 'Copy')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick()
                onClose()
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إغلاق' : 'Close'}</span>
            </button>
          </div>
        </div>

        <div className="w-full px-3 sm:px-6 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
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

            {periodFilter === 'custom' && (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="bg-slate-800 text-white px-2 py-0.5 rounded-lg border border-slate-700 text-[11px] font-mono"
                />
                <span className="text-slate-500">→</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="bg-slate-800 text-white px-2 py-0.5 rounded-lg border border-slate-700 text-[11px] font-mono"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-full border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick()
                  setViewMode('summary')
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'detailed' ? 'bg-[#0284c7] text-white font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'تفصيلي 360°' : 'Itemized 360°'}
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-full border border-slate-700 text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                className="p-0.5 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 font-bold">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
                className="p-0.5 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-0.5 hover:text-white cursor-pointer ml-1"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {exportNotice && (
          <div className="bg-sky-600 text-white text-xs font-black py-1 px-4 text-center animate-fadeIn">
            {exportNotice}
          </div>
        )}
      </div>

      <div
        className="flex-1 overflow-auto touch-pan-x touch-pan-y p-3 sm:p-8 flex justify-center items-start ax-invoice-viewport"
        onClick={handleOverlayClick}
      >
        <div
          ref={printRef}
          id="ax-invoice-print-area"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            width: '210mm',
            minHeight: '297mm'
          }}
          className="bg-white text-slate-800 shadow-2xl rounded-2xl sm:rounded-3xl border border-slate-200 transition-transform duration-150 p-6 sm:p-10 space-y-6 relative my-2 mx-auto"
        >
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

      <div className="print:hidden sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-2 sm:p-3 flex items-center justify-between gap-2 text-white">
        <div className="flex items-center gap-2 truncate text-xs">
          <span className="text-slate-400 hidden sm:inline">{isRtl ? 'المورد:' : 'Supplier:'}</span>
          <span className="font-bold text-sky-300 truncate">{executor.name}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{isRtl ? 'المتبقي:' : 'Balance:'}</span>
          <span className={`font-mono font-black ${remainingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            €{remainingBalance.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleWhatsApp}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-black shadow-md cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{isRtl ? 'واتساب' : 'WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRtl ? 'حفظ كصورة' : 'Save Image'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full text-xs font-black shadow-md cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isRtl ? 'طباعة / PDF' : 'Print / PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              onClose()
            }}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-md cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إغلاق' : 'Close'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}