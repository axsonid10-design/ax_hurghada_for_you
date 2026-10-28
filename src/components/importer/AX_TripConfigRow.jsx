import React from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Sparkles,
  CheckSquare,
  Square,
  Truck,
  RotateCcw,
  Check
} from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

export function AX_TripConfigRow({
  trip,
  isAssigned,
  assignedExecutorName,
  isSelected,
  canSelect,
  onToggleSelect,
  onOpenSingleTrip,
  onUnassign
}) {
  const isConfigured = trip.isConfigured
  const def = trip.def

  const handleRowClick = () => {
    if (canSelect) {
      soundManager.playClick()
      onToggleSelect(trip.name)
    } else {
      onOpenSingleTrip(trip)
    }
  }

  return (
    <div
      onClick={handleRowClick}
      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
        isAssigned
          ? 'bg-slate-50/80 border-slate-200 opacity-90 hover:opacity-100 hover:border-slate-300'
          : isSelected
          ? 'bg-sky-50 border-2 border-[#0284c7] shadow-sm'
          : isConfigured
          ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/60'
          : 'bg-amber-50/40 border-amber-300 hover:border-amber-400 hover:bg-amber-50/70'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Selection Checkbox for Batch Mode */}
        {canSelect && !isAssigned && (
          <div className="flex-shrink-0 text-[#0284c7]">
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-[#0284c7]" />
            ) : (
              <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
            )}
          </div>
        )}

        {/* Status Indicator Icon */}
        <div className="flex-shrink-0">
          {isAssigned ? (
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : isConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
        </div>

        {/* Trip Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-800 truncate">
              {trip.name}
            </span>
            {def?.display_name && def.display_name !== trip.name && (
              <span className="text-[10px] text-slate-400 font-bold truncate">
                ({def.display_name})
              </span>
            )}

            {/* Assigned Executor Pill Badge */}
            {isAssigned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                <Truck className="w-3 h-3" />
                <span>المنفذ: {assignedExecutorName}</span>
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
                  {!isAssigned && (
                    <>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="text-slate-600 font-bold hidden sm:inline text-[10px]">
                        المنفذ الافتراضي: {trip.executorName}
                      </span>
                    </>
                  )}
                </>
              )
            ) : (
              <span className="text-amber-800 font-bold text-[10px]">
                ⚠️ لم تسعر بعد (سعر بيعها 0) - اضغط للتسعير
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {isAssigned ? (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              onUnassign(trip.name)
            }}
            title="إلغاء الإسناد وإعادة الرحلة للأعلى"
            className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-full text-[11px] font-black shadow-xs flex items-center gap-1 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">إلغاء الإسناد</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpenSingleTrip(trip)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-black shadow-sm flex items-center gap-1 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#0284c7]" />
            <span className="hidden sm:inline">تعديل</span>
          </button>
        )}
      </div>
    </div>
  )
}
