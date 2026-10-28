import React, { useState, useRef, useMemo } from 'react'
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Edit3,
  Plus,
  Ship,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAXStore } from '../../store/useAXStore'
import { parseExcelDailySituation } from '../../utils/excelParser'
import { soundManager } from '../../utils/soundEffects'
import { ConfigureUnknownTripsModal } from './ConfigureUnknownTripsModal'
import { ConfigureSingleTripModal } from './ConfigureSingleTripModal'

export function ExcelUploadModal({ isOpen, onClose }) {
  const { importedDates, tripDefinitions, executors, importExcelBatch } = useAXStore()

  const [file, setFile] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [duplicateWarning, setDuplicateWarning] = useState(null)

  // Modals for Trip Pricing
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [unknownTripsToConfigure, setUnknownTripsToConfigure] = useState([])
  const [selectedTripForConfig, setSelectedTripForConfig] = useState(null)
  const [isSingleTripModalOpen, setIsSingleTripModalOpen] = useState(false)
  const [showUnpricedWarningConfirm, setShowUnpricedWarningConfirm] = useState(false)

  const fileInputRef = useRef(null)

  const findTripDef = (rawName) => {
    const clean = (rawName || '').toLowerCase().trim().replace(/\s+/g, ' ')
    return tripDefinitions.find((td) => {
      const sName = (td.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
      const dName = (td.display_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
      return sName === clean || dName === clean
    })
  }

  // Analyzed trip list with configuration status
  const analyzedTrips = useMemo(() => {
    if (!parsedData || !parsedData.tripTypes) return []
    return parsedData.tripTypes.map((tName) => {
      const def = findTripDef(tName)
      const isCashPickup = tName.toLowerCase().includes('cash pickup') || tName.toLowerCase().includes('تحصيل')
      const isConfigured = Boolean(def && (def.adult_sell > 0 || isCashPickup))
      const executor = executors.find((ex) => ex.id === def?.executor_id)
      return {
        name: tName,
        def,
        isConfigured,
        isCashPickup,
        executorName: executor?.name || (isCashPickup ? 'انتقالات وتحصيل' : 'غير مسند')
      }
    })
  }, [parsedData, tripDefinitions, executors])

  const unconfiguredTrips = useMemo(() => {
    return analyzedTrips.filter((t) => !t.isConfigured).map((t) => t.name)
  }, [analyzedTrips])

  const configuredCount = analyzedTrips.filter((t) => t.isConfigured).length
  const unconfiguredCount = unconfiguredTrips.length

  if (!isOpen) return null

  const handleFileSelected = async (selectedFile) => {
    if (!selectedFile) return
    if (!selectedFile.name.endsWith('.xlsx')) {
      setErrorMsg('يرجى اختيار ملف إكسيل بصيغة .xlsx فقط.')
      soundManager.playAlert()
      return
    }

    setErrorMsg('')
    setFile(selectedFile)
    setIsParsing(true)
    setShowUnpricedWarningConfirm(false)

    try {
      const buffer = await selectedFile.arrayBuffer()
      const result = await parseExcelDailySituation(buffer)

      setParsedData(result)

      if (importedDates[result.date]) {
        setDuplicateWarning({
          date: result.date,
          prevCount: importedDates[result.date].count,
          newCount: result.totalRows
        })
      } else {
        setDuplicateWarning(null)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('حدث خطأ أثناء قراءة ملف الإكسيل. تأكد من سلامة الأعمدة والشيت.')
      soundManager.playAlert()
    } finally {
      setIsParsing(false)
    }
  }

  const handleOpenSingleTrip = (trip) => {
    soundManager.playClick()
    setSelectedTripForConfig({
      name: trip.name,
      def: trip.def
    })
    setIsSingleTripModalOpen(true)
  }

  const handleOpenBatchConfig = () => {
    soundManager.playClick()
    setUnknownTripsToConfigure(unconfiguredTrips)
    setIsConfigModalOpen(true)
  }

  const handleFinalImport = (overwrite = false) => {
    if (!parsedData) return

    soundManager.playSuccess()
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    })

    importExcelBatch({
      date: parsedData.date,
      filename: file.name,
      rawBookings: parsedData.bookings,
      overwrite
    })

    onClose()
  }

  const handleAttemptImport = (overwrite = false) => {
    if (unconfiguredCount > 0 && !showUnpricedWarningConfirm) {
      soundManager.playAlert()
      setShowUnpricedWarningConfirm(true)
      return
    }
    handleFinalImport(overwrite)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/65 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
            <h3 className="text-base font-black text-[#0a2540] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>رفع وتحليل يومية الإكسيل (Daily Situation)</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            {/* Drag & Drop Zone */}
            {!parsedData && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#0284c7] rounded-3xl p-8 sm:p-10 text-center cursor-pointer bg-slate-50 hover:bg-sky-50/50 transition-all space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e.target.files[0])}
                />

                <div className="w-16 h-16 rounded-full bg-white shadow-soft text-[#0284c7] mx-auto flex items-center justify-center">
                  {isParsing ? (
                    <RefreshCw className="w-7 h-7 animate-spin text-[#0284c7]" />
                  ) : (
                    <UploadCloud className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="text-sm font-black text-slate-800">
                    {isParsing ? 'جاري قراءة واستخراج بيانات اليومية...' : 'اسحب ملف الإكسيل هنا أو اضغط للاختيار'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-bold">
                    يدعم ملفات Daily Situation بصيغة (.xlsx)
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Parsed Summary & Trip Inspector */}
            {parsedData && (
              <div className="space-y-4">
                {/* File Header Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-bold grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">اسم الملف</span>
                    <span className="text-slate-800 font-mono truncate block" title={file?.name}>
                      {file?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">تاريخ اليومية</span>
                    <span className="text-[#0284c7] font-black font-mono block">
                      {parsedData.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">الحجوزات المستخرجة</span>
                    <span className="text-emerald-600 font-black font-mono block">
                      {parsedData.totalRows} حجز
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">أنواع الرحلات بالشيت</span>
                    <span className="text-slate-700 font-black block">
                      {analyzedTrips.length} رحلة
                    </span>
                  </div>
                </div>

                {/* Duplicate Date Warning Box */}
                {duplicateWarning && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div className="font-black text-amber-900">
                          تنبيه تكرار: تم استيراد يومية سابقة بنفس هذا التاريخ!
                        </div>
                        <div className="text-amber-800 mt-1 leading-relaxed">
                          يومية تاريخ <strong className="font-mono text-slate-800">[{duplicateWarning.date}]</strong> مسجلة بالفعل وبها <strong>{duplicateWarning.prevCount}</strong> حجز.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detected Trips Inspector (Visual Checklist) */}
                <div className="border border-slate-200 rounded-2xl p-3.5 sm:p-4 bg-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-[#0a2540] flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#0284c7]" />
                        <span>فحص وتسعير رحلات الشيت ({analyzedTrips.length})</span>
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {configuredCount} مسعرة
                        </span>
                        {unconfiguredCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 animate-pulse">
                            {unconfiguredCount} بحاجة لتسعير
                          </span>
                        )}
                      </div>
                    </div>

                    {unconfiguredCount > 0 && (
                      <button
                        type="button"
                        onClick={handleOpenBatchConfig}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-[11px] font-black shadow-sm flex items-center gap-1 transition-all active:scale-95 self-start sm:self-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>تسعير الرحلات الجديدة دفعة واحدة ({unconfiguredCount})</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 font-bold">
                    اضغط على أي رحلة لضبط أسعارها (البيع والتكلفة ونسبة الأطفال والمنفذ) قبل الاعتماد:
                  </div>

                  {/* Trip Rows List */}
                  <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
                    {analyzedTrips.map((trip, idx) => {
                      const isConfigured = trip.isConfigured
                      const def = trip.def

                      return (
                        <div
                          key={idx}
                          onClick={() => handleOpenSingleTrip(trip)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isConfigured
                              ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                              : 'bg-amber-50/50 border-amber-300 hover:border-amber-400 hover:bg-amber-50 animate-pulse'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex-shrink-0">
                              {isConfigured ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-slate-800 truncate">
                                  {trip.name}
                                </span>
                                {def?.display_name && def.display_name !== trip.name && (
                                  <span className="text-[10px] text-slate-400 font-bold truncate">
                                    ({def.display_name})
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] mt-0.5 flex items-center gap-2 text-slate-500 font-mono">
                                {isConfigured ? (
                                  trip.isCashPickup ? (
                                    <span className="text-slate-600 font-bold">
                                      تحصيل نقدي مباشر (بدون تكلفة توريد)
                                    </span>
                                  ) : (
                                    <>
                                      <span className="text-emerald-700 font-black">
                                        بيع: {def.adult_sell} {def.currency || 'EUR'}
                                      </span>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-slate-600 font-bold">
                                        تكلفة: {def.adult_cost} {def.currency || 'EUR'}
                                      </span>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-slate-500 font-bold text-[10px]">
                                        {def.pricing_type === 'trip' ? 'بالرحلة' : 'للبالغ'}
                                      </span>
                                      <span className="text-slate-300 hidden sm:inline">•</span>
                                      <span className="text-slate-600 font-bold hidden sm:inline text-[10px]">
                                        المنفذ: {trip.executorName}
                                      </span>
                                    </>
                                  )
                                ) : (
                                  <span className="text-amber-800 font-bold">
                                    ⚠️ رحلة جديدة لم تسعر بعد (سعر بيعها 0) - اضغط للتسعير
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isConfigured ? (
                              <button
                                type="button"
                                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-black shadow-sm flex items-center gap-1 transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#0284c7]" />
                                <span className="hidden sm:inline">تعديل</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-black shadow-sm flex items-center gap-1 transition-all active:scale-95"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>تسعير الآن</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Unpriced Warning Confirmation Dialog */}
                {showUnpricedWarningConfirm && (
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div className="font-black text-amber-900">
                          تنبيه: يوجد ({unconfiguredCount}) رحلات جديدة لم تقم بتسعيرها بعد!
                        </div>
                        <div className="text-amber-800 mt-1 leading-relaxed">
                          استيراد اليومية دون تسعير هذه الرحلات سيجعل تكاليفها وأرباحها المحسوبة صفر. يُفضل تسعيرها أولاً لتكون التقارير والحسابات دقيقة 100%.
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleOpenBatchConfig}
                        className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>تسعير الرحلات الجديدة الآن (موصى به)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFinalImport(Boolean(duplicateWarning))}
                        className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-xs font-bold transition-all"
                      >
                        المتابعة والاستيراد على أي حال
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {parsedData && (
            <div className="pt-3 border-t border-slate-100 flex-shrink-0">
              {duplicateWarning ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAttemptImport(true)}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95"
                  >
                    تحديث واستبدال بيانات اليومية (مسح القديم)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick()
                      onClose()
                    }}
                    className="px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-xs font-bold transition-all"
                  >
                    إلغاء الملف
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAttemptImport(false)}
                    className="flex-1 py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
                    <span>اعتماد واستيراد اليومية الآن</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick()
                      setParsedData(null)
                      setShowUnpricedWarningConfirm(false)
                    }}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs"
                  >
                    إعادة الاختيار
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Single Trip Configuration Modal */}
      {selectedTripForConfig && (
        <ConfigureSingleTripModal
          isOpen={isSingleTripModalOpen}
          tripName={selectedTripForConfig.name}
          existingDef={selectedTripForConfig.def}
          onClose={() => {
            setIsSingleTripModalOpen(false)
            setSelectedTripForConfig(null)
          }}
          onSaved={() => {
            setIsSingleTripModalOpen(false)
            setSelectedTripForConfig(null)
          }}
        />
      )}

      {/* Batch Trip Configuration Modal */}
      <ConfigureUnknownTripsModal
        isOpen={isConfigModalOpen}
        unknownTripNames={unknownTripsToConfigure}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={() => {
          setIsConfigModalOpen(false)
          setShowUnpricedWarningConfirm(false)
        }}
      />
    </>
  )
}
