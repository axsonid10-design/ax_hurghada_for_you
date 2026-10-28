import React from 'react'
import { UploadCloud, RefreshCw, AlertTriangle } from 'lucide-react'

export function AX_ExcelDropzone({
  fileInputRef,
  isParsing,
  errorMsg,
  onDrop,
  onFileSelected
}) {
  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-[#0284c7] rounded-3xl p-8 sm:p-10 text-center cursor-pointer bg-slate-50 hover:bg-sky-50/50 transition-all space-y-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files[0])}
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

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  )
}
