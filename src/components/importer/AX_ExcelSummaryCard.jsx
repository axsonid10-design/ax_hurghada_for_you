import React from 'react'
import { AlertTriangle } from 'lucide-react'

export function AX_ExcelSummaryCard({
  filename,
  date,
  totalRows,
  tripsCount,
  duplicateWarning
}) {
  return (
    <div className="space-y-3">
      {/* File Stats Summary Grid */}
      <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 text-xs font-bold grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <span className="text-slate-400 block text-[11px]">اسم الملف</span>
          <span className="text-slate-800 font-mono truncate block" title={filename}>
            {filename}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">تاريخ اليومية</span>
          <span className="text-[#0284c7] font-black font-mono block">
            {date}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">الحجوزات المستخرجة</span>
          <span className="text-emerald-600 font-black font-mono block">
            {totalRows} حجز
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">أنواع الرحلات بالشيت</span>
          <span className="text-slate-700 font-black block">
            {tripsCount} رحلة
          </span>
        </div>
      </div>

      {/* Duplicate Date Warning Box */}
      {duplicateWarning && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 animate-fadeIn">
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
    </div>
  )
}
