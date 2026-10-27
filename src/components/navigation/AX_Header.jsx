import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'

export function AX_Header() {
  const isOnline = useAXStore((state) => state.isOnline)

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a2540] text-white border-b border-[#1e3a5f]/60 shadow-md">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo-header.png"
            alt="غردقة فور يو"
            className="h-10 sm:h-11 w-auto object-contain cursor-pointer"
            onClick={() => window.location.reload()}
          />
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">متصل</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 border border-rose-500/40 rounded-full text-rose-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">أوفلاين</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
