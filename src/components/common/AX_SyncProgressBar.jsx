import React from 'react'
import { Cloud, CloudOff, CheckCircle2, RefreshCw } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'

export function AX_SyncProgressBar() {
  const isOnline = useAXStore((state) => state.isOnline)
  const syncStatus = useAXStore((state) => state.syncStatus)

  if (!syncStatus) return null

  const { isSyncing, progress = 0, pendingCount = 0, message = '' } = syncStatus

  if (isSyncing) {
    return (
      <div className="w-full bg-[#0a2540] text-white border-b border-[#0284c7]/40 shadow-sm animate-fadeIn">
        <div className="w-full px-3 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-2 text-sky-300">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />
              <span>{message || 'جاري مزامنة الحجوزات مع السحابة...'}</span>
            </span>
            <span className="font-mono text-white text-[11px] font-black">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!isOnline && pendingCount > 0) {
    return (
      <div className="w-full bg-amber-500 text-slate-950 border-b border-amber-600 shadow-sm animate-fadeIn">
        <div className="w-full px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs font-black">
          <span className="flex items-center gap-2">
            <CloudOff className="w-4 h-4 text-slate-950" />
            <span>
              أنت في وضع عدم الاتصال (أوفلاين) • يوجد {pendingCount} حجز مسجلة محلياً بانتظار المزامنة فور عودة النت
            </span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/40 text-[10px] font-mono font-bold">
            مؤمنة محلياً 100%
          </span>
        </div>
      </div>
    )
  }

  if (message && progress === 100) {
    return (
      <div className="w-full bg-emerald-600 text-white border-b border-emerald-700 shadow-sm animate-fadeIn">
        <div className="w-full px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs font-black">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{message}</span>
          </span>
          <span className="text-[10px] text-emerald-100 font-mono">Supabase Sync Done</span>
        </div>
      </div>
    )
  }

  return null
}
