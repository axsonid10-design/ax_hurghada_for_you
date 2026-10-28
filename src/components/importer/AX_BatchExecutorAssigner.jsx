import React, { useState } from 'react'
import {
  Truck,
  CheckCircle2,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  RotateCcw,
  UserCheck,
  ChevronDown
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function AX_BatchExecutorAssigner({
  executors = [],
  unassignedTripsCount = 0,
  assignedTripsCount = 0,
  selectedExecutorId,
  setSelectedExecutorId,
  selectedTripNames,
  onToggleTrip,
  onSelectAllUnassigned,
  onClearSelection,
  onSaveBatchAssignment,
  canSelectAll = false
}) {
  const selectedCount = selectedTripNames.size
  const currentExecutor = executors.find((ex) => ex.id === selectedExecutorId)

  const handleExecutorChange = (e) => {
    soundManager.playClick()
    setSelectedExecutorId(e.target.value)
  }

  const handleSaveClick = () => {
    if (!selectedExecutorId || selectedCount === 0) return
    onSaveBatchAssignment()
  }

  return (
    <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-emerald-50/40 border-2 border-[#0284c7]/30 rounded-3xl p-3.5 sm:p-4 shadow-sm space-y-3">
      {/* Top Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[#0a2540] flex items-center gap-1.5">
              <span>الإسناد السريع للمنفذين</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-[#0284c7] font-mono font-bold">
                دفعة واحدة
              </span>
            </h4>
            <div className="text-[11px] text-slate-500 font-bold">
              اختر المنفذ وحدد رحلاته ثم احفظ الإسناد لتترحل لأسفل
            </div>
          </div>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white border border-slate-200 text-slate-700 shadow-xs">
            بانتظار الإسناد: <strong className="text-amber-600 font-mono">{unassignedTripsCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white border border-slate-200 text-slate-700 shadow-xs">
            تم إسنادها: <strong className="text-emerald-600 font-mono">{assignedTripsCount}</strong>
          </span>
        </div>
      </div>

      {/* Control Bar: Selector + Select All + Save Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        {/* Executor Selector Dropdown */}
        <div className="relative flex-1 min-w-[200px]">
          <select
            value={selectedExecutorId}
            onChange={handleExecutorChange}
            className="w-full appearance-none pl-8 pr-10 py-2.5 bg-white border-2 border-slate-300 hover:border-[#0284c7] focus:border-[#0284c7] rounded-full text-xs font-black text-slate-800 shadow-sm focus:outline-none transition-all cursor-pointer"
          >
            <option value="">-- اضغط لاختيار المنفذ للرحلات --</option>
            {executors.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.category || 'عام'})
              </option>
            ))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#0284c7]">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Select / Deselect All Button */}
          {selectedExecutorId && unassignedTripsCount > 0 && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick()
                if (canSelectAll) {
                  onSelectAllUnassigned()
                } else {
                  onClearSelection()
                }
              }}
              className="px-3.5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-black transition-all active:scale-95 shadow-xs flex items-center gap-1.5"
            >
              {canSelectAll ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>تحديد كل المتبقي ({unassignedTripsCount})</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>إلغاء التحديد</span>
                </>
              )}
            </button>
          )}

          {/* Primary Save Assignment Button */}
          <button
            type="button"
            disabled={!selectedExecutorId || selectedCount === 0}
            onClick={handleSaveClick}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-initial ${
              selectedExecutorId && selectedCount > 0
                ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white active:scale-95 shadow-[#0284c7]/30 cursor-pointer animate-pulse'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {selectedCount > 0
                ? `حفظ إسناد (${selectedCount}) رحلة إلى ${currentExecutor?.name || 'المنفذ'}`
                : 'حدد الرحلات ثم اضغط حفظ'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
