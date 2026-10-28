import React from 'react'
import { AlertTriangle, Sparkles } from 'lucide-react'

export function AX_UnpricedTripsAlert({
  unconfiguredCount,
  onOpenBatchConfig,
  onProceedAnyway
}) {
  return (
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
          onClick={onOpenBatchConfig}
          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>تسعير الرحلات الجديدة الآن (موصى به)</span>
        </button>
        <button
          type="button"
          onClick={onProceedAnyway}
          className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-xs font-bold transition-all"
        >
          المتابعة والاستيراد على أي حال
        </button>
      </div>
    </div>
  )
}
