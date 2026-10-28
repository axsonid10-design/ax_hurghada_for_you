import React, { useState, useRef, useMemo } from 'react'
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  Check
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAXStore } from '../../store/useAXStore'
import { parseExcelDailySituation } from '../../utils/excelParser'
import { soundManager } from '../../utils/soundEffects'
import { ConfigureUnknownTripsModal } from './ConfigureUnknownTripsModal'
import { ConfigureSingleTripModal } from './ConfigureSingleTripModal'
import { AX_BatchExecutorAssigner } from './AX_BatchExecutorAssigner'
import { AX_TripConfigRow } from './AX_TripConfigRow'
import { AX_ExcelSummaryCard } from './AX_ExcelSummaryCard'
import { AX_ExcelDropzone } from './AX_ExcelDropzone'
import { AX_UnpricedTripsAlert } from './AX_UnpricedTripsAlert'

export function ExcelUploadModal({ isOpen, onClose }) {
  const {
    importedDates,
    tripDefinitions,
    executors,
    importExcelBatch,
    batchAddTripDefinitions
  } = useAXStore()

  const [file, setFile] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [duplicateWarning, setDuplicateWarning] = useState(null)

  // Session-based Executor Assignments
  const [sessionAssignments, setSessionAssignments] = useState({})
  const [selectedExecutorId, setSelectedExecutorId] = useState('')
  const [selectedTripNames, setSelectedTripNames] = useState(new Set())

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
      const sessionAssigned = sessionAssignments[tName]
      const executor = executors.find((ex) => ex.id === (sessionAssigned?.executorId || def?.executor_id))
      return {
        name: tName,
        def,
        isConfigured,
        isCashPickup,
        isAssigned: Boolean(sessionAssigned),
        assignedExecutorName: sessionAssigned?.executorName || executor?.name,
        executorName: executor?.name || (isCashPickup ? 'انتقالات وتحصيل' : 'غير مسند')
      }
    })
  }, [parsedData, tripDefinitions, executors, sessionAssignments])

  // Split trips into unassigned (Top) and assigned (Bottom)
  const unassignedTrips = useMemo(() => {
    return analyzedTrips.filter((t) => !sessionAssignments[t.name])
  }, [analyzedTrips, sessionAssignments])

  const assignedTrips = useMemo(() => {
    return analyzedTrips.filter((t) => Boolean(sessionAssignments[t.name]))
  }, [analyzedTrips, sessionAssignments])

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
    setSessionAssignments({})
    setSelectedExecutorId('')
    setSelectedTripNames(new Set())

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

  const handleToggleTrip = (tripName) => {
    setSelectedTripNames((prev) => {
      const next = new Set(prev)
      if (next.has(tripName)) next.delete(tripName)
      else next.add(tripName)
      return next
    })
  }

  const handleSelectAllUnassigned = () => {
    const allUnassigned = new Set(unassignedTrips.map((t) => t.name))
    setSelectedTripNames(allUnassigned)
  }

  const handleClearSelection = () => {
    setSelectedTripNames(new Set())
  }

  // Save selected trips to chosen executor -> moves them to bottom
  const handleSaveBatchAssignment = () => {
    if (!selectedExecutorId || selectedTripNames.size === 0) return
    const currentExecutor = executors.find((ex) => ex.id === selectedExecutorId)
    if (!currentExecutor) return

    soundManager.playSuccess()
    setSessionAssignments((prev) => {
      const next = { ...prev }
      selectedTripNames.forEach((name) => {
        next[name] = {
          executorId: selectedExecutorId,
          executorName: currentExecutor.name
        }
      })
      return next
    })
    setSelectedTripNames(new Set())
  }

  const handleUnassignTrip = (tripName) => {
    setSessionAssignments((prev) => {
      const next = { ...prev }
      delete next[tripName]
      return next
    })
    setSelectedTripNames((prev) => {
      const next = new Set(prev)
      next.delete(tripName)
      return next
    })
  }

  const handleOpenSingleTrip = (trip) => {
    soundManager.playClick()
    setSelectedTripForConfig({ name: trip.name, def: trip.def })
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
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })

    const finalBookings = parsedData.bookings.map((b) => {
      const cleanType = (b.trip_type || '').toLowerCase().trim().replace(/\s+/g, ' ')
      const match = Object.entries(sessionAssignments).find(([name]) => {
        const cleanName = name.toLowerCase().trim().replace(/\s+/g, ' ')
        return cleanName === cleanType
      })
      if (match) {
        return { ...b, executor_id: match[1].executorId }
      }
      return b
    })

    const defsToUpdate = Object.entries(sessionAssignments).map(([tripName, assign]) => {
      const existingDef = findTripDef(tripName)
      return {
        ...(existingDef || { id: 'td_' + Date.now() + Math.random().toString(36).substr(2, 4) }),
        sheet_name: tripName,
        display_name: existingDef?.display_name || tripName,
        executor_id: assign.executorId
      }
    })
    if (defsToUpdate.length > 0) {
      batchAddTripDefinitions(defsToUpdate)
    }

    importExcelBatch({
      date: parsedData.date,
      filename: file.name,
      rawBookings: finalBookings,
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
              <AX_ExcelDropzone
                fileInputRef={fileInputRef}
                isParsing={isParsing}
                errorMsg={errorMsg}
                onDrop={handleDrop}
                onFileSelected={handleFileSelected}
              />
            )}

            {/* Parsed Summary & Trip Inspector */}
            {parsedData && (
              <div className="space-y-4">
                <AX_ExcelSummaryCard
                  filename={file?.name}
                  date={parsedData.date}
                  totalRows={parsedData.totalRows}
                  tripsCount={analyzedTrips.length}
                  duplicateWarning={duplicateWarning}
                />

                {/* Batch Executor Assignment Bar */}
                <AX_BatchExecutorAssigner
                  executors={executors}
                  unassignedTripsCount={unassignedTrips.length}
                  assignedTripsCount={assignedTrips.length}
                  selectedExecutorId={selectedExecutorId}
                  setSelectedExecutorId={setSelectedExecutorId}
                  selectedTripNames={selectedTripNames}
                  onToggleTrip={handleToggleTrip}
                  onSelectAllUnassigned={handleSelectAllUnassigned}
                  onClearSelection={handleClearSelection}
                  onSaveBatchAssignment={handleSaveBatchAssignment}
                  canSelectAll={selectedTripNames.size < unassignedTrips.length}
                />

                {/* Detected Trips Inspector (Visual Checklist) */}
                <div className="border border-slate-200 rounded-2xl p-3.5 sm:p-4 bg-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-[#0a2540] flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#0284c7]" />
                        <span>رحلات الشيت ({analyzedTrips.length})</span>
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
                        <span>تسعير الرحلات الجديدة ({unconfiguredCount})</span>
                      </button>
                    )}
                  </div>

                  {/* Trip Rows List - Unassigned at Top, Assigned at Bottom */}
                  <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
                    {/* 1. Unassigned Trips (TOP OF LIST) */}
                    {unassignedTrips.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-black text-[#0a2540] flex items-center justify-between pb-1">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>رحلات بانتظار إسناد المنفذ ({unassignedTrips.length})</span>
                          </span>
                          {selectedExecutorId && (
                            <span className="text-[10px] text-[#0284c7] font-bold">
                              اضغط على أي رحلة لتحديدها
                            </span>
                          )}
                        </div>
                        {unassignedTrips.map((trip) => (
                          <AX_TripConfigRow
                            key={trip.name}
                            trip={trip}
                            isAssigned={false}
                            isSelected={selectedTripNames.has(trip.name)}
                            canSelect={Boolean(selectedExecutorId)}
                            onToggleSelect={handleToggleTrip}
                            onOpenSingleTrip={handleOpenSingleTrip}
                            onUnassign={handleUnassignTrip}
                          />
                        ))}
                      </div>
                    )}

                    {/* 2. Assigned Trips (BOTTOM OF LIST - Locked) */}
                    {assignedTrips.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-slate-100">
                        <div className="text-[11px] font-black text-emerald-800 flex items-center gap-1.5 pb-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>رحلات تم إسنادها للمنفذين وتثبيتها ({assignedTrips.length})</span>
                        </div>
                        {assignedTrips.map((trip) => (
                          <AX_TripConfigRow
                            key={trip.name}
                            trip={trip}
                            isAssigned={true}
                            assignedExecutorName={trip.assignedExecutorName}
                            isSelected={false}
                            canSelect={false}
                            onToggleSelect={handleToggleTrip}
                            onOpenSingleTrip={handleOpenSingleTrip}
                            onUnassign={handleUnassignTrip}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Unpriced Warning Confirmation Dialog */}
                {showUnpricedWarningConfirm && (
                  <AX_UnpricedTripsAlert
                    unconfiguredCount={unconfiguredCount}
                    onOpenBatchConfig={handleOpenBatchConfig}
                    onProceedAnyway={() => handleFinalImport(Boolean(duplicateWarning))}
                  />
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
