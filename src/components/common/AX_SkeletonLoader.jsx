import React from 'react'

export function AX_SkeletonLoader({ type = 'cards', count = 4 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white/80 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-soft"
          >
            <div className="h-4 bg-slate-200 rounded-full w-2/3"></div>
            <div className="h-8 bg-slate-300 rounded-xl w-1/2"></div>
            <div className="h-3 bg-slate-100 rounded-full w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-3xl p-4 shadow-soft space-y-3 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-slate-200 rounded-full w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded-full w-1/2"></div>
            </div>
            <div className="w-20 h-7 bg-slate-200 rounded-full"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-12 bg-slate-200 rounded-2xl w-full"></div>
      <div className="h-48 bg-slate-100 rounded-3xl w-full"></div>
    </div>
  )
}
