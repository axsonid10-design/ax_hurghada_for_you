import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'

export function AX_Header() {
  const isOnline = useAXStore((state) => state.isOnline)

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a2540] text-white border-b border-[#1e3a5f]/60 shadow-md">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => window.location.reload()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#38bdf8] shadow-md bg-[#0a2540] flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
          >
            <img
              src="/logo-circle.png"
              alt="غردقة فور يو"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-black text-white tracking-wide leading-none">
              غردقة فور يو
            </div>
            <div className="text-[10px] text-[#38bdf8] font-bold mt-1 font-mono">
              HURGHADA FOR YOU
            </div>
          </div>
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
