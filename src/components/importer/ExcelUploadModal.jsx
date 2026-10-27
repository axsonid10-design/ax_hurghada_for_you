import React, { useState, useRef } from 'react'
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAXStore } from '../../store/useAXStore'
import { parseExcelDailySituation } from '../../utils/excelParser'
import { soundManager } from '../../utils/soundEffects'
import { ConfigureUnknownTripsModal } from './ConfigureUnknownTripsModal'

export function ExcelUploadModal({ isOpen, onClose }) {
  const { importedDates, tripDefinitions, importExcelBatch } = useAXStore()

  const [file, setFile] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [duplicateWarning, setDuplicateWarning] = useState(null)
  const [unknownTripsToConfigure, setUnknownTripsToConfigure] = useState([])
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)

  const fileInputRef = useRef(null)

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

    try {
      const buffer = await selectedFile.arrayBuffer()
      const result = await parseExcelDailySituation(buffer)

      setParsedData(result)

      // 1. Check if date already imported
      if (importedDates[result.date]) {
        setDuplicateWarning({
          date: result.date,
          prevCount: importedDates[result.date].count,
          newCount: result.totalRows
        })
      } else {
        setDuplicateWarning(null)
      }

      // 2. Check for unknown trip types
      checkTripTypes(result)
    } catch (err) {
      console.error(err)
      setErrorMsg('حدث خطأ أثناء قراءة ملف الإكسيل. تأكد من سلامة الأعمدة والشيت.')
      soundManager.playAlert()
    } finally {
      setIsParsing(false)
    }
  }

  const checkTripTypes = (data) => {
    const existing = new Set(
      tripDefinitions.map((td) => td.sheet_name.toLowerCase().trim())
    )
    const unknown = data.tripTypes.filter(
      (t) => !existing.has(t.toLowerCase().trim())
    )

    if (unknown.length > 0) {
      setUnknownTripsToConfigure(unknown)
      setIsConfigModalOpen(true)
    }
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

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-black text-[#0a2540] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>رفع وتحليل يومية الإكسيل (Daily Situation)</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drag & Drop Zone */}
          {!parsedData && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#0284c7] rounded-3xl p-8 text-center cursor-pointer bg-slate-50 hover:bg-sky-50/50 transition-all space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => handleFileSelected(e.target.files[0])}
              />

              <div className="w-14 h-14 rounded-full bg-white shadow-soft text-[#0284c7] mx-auto flex items-center justify-center">
                {isParsing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0284c7]" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              <div>
                <div className="text-xs font-black text-slate-800">
                  {isParsing ? 'جاري قراءة واستخراج بيانات اليومية...' : 'اسحب ملف الإكسيل هنا أو اضغط للاختيار'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-bold">
                  يدعم ملفات Daily Situation بصيغة (.xlsx)
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Summary & Duplicate Date Check */}
          {parsedData && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-bold space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">اسم الملف:</span>
                  <span className="text-slate-800 font-mono truncate max-w-[200px]">{file?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">تاريخ اليومية المكتشف:</span>
                  <span className="text-[#0284c7] font-black font-mono">{parsedData.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">عدد الحجوزات المستخرجة:</span>
                  <span className="text-emerald-600 font-black font-mono">{parsedData.totalRows} حجز</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">أنواع الرحلات في الشيت:</span>
                  <span className="text-slate-700 font-mono">{parsedData.tripTypes.length} نوع رحلة</span>
                </div>
              </div>

              {/* Duplicate Date Warning Box */}
              {duplicateWarning ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-black text-amber-900">
                        تنبيه: تم رفع يومية سابقة بنفس هذا التاريخ!
                      </div>
                      <div className="text-amber-700 mt-1">
                        تاريخ [{duplicateWarning.date}] مسجل بالفعل بالمنظومة ويحتوي على {duplicateWarning.prevCount} حجز.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleFinalImport(true)}
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95"
                    >
                      تحديث واستبدال البيانات
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-xs font-bold transition-all"
                    >
                      ترك القديم كما هو
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleFinalImport(false)}
                    className="flex-1 py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
                    <span>اعتماد واستيراد اليومية الآن</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParsedData(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-xs"
                  >
                    إعادة الاختيار
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfigureUnknownTripsModal
        isOpen={isConfigModalOpen}
        unknownTripNames={unknownTripsToConfigure}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={() => {
          setIsConfigModalOpen(false)
        }}
      />
    </>
  )
}
