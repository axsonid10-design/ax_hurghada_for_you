import React, { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { soundManager } from '../../utils/soundEffects'

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

const DAY_NAMES = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']

export function AX_CompanyDatePicker({
  value,
  onChange,
  placeholder = 'اختر التاريخ',
  label,
  className = 'w-full',
  triggerClassName = '',
  align = 'right'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const [viewMode, setViewMode] = useState('days')

  const containerRef = useRef(null)

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      if (spaceBelow < 320 && spaceAbove > spaceBelow) {
        setOpenUpward(true)
      } else {
        setOpenUpward(false)
      }
    }
  }, [isOpen])

  const [selectedDate, setSelectedDate] = useState(() => {
    if (!value) return new Date()
    const parts = String(value).split('-')
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
    }
    return new Date(value)
  })

  const [currentMonth, setCurrentMonth] = useState(() => selectedDate.getMonth())
  const [currentYear, setCurrentYear] = useState(() => selectedDate.getFullYear())

  useEffect(() => {
    if (value) {
      const parts = String(value).split('-')
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
        setSelectedDate(d)
        setCurrentMonth(d.getMonth())
        setCurrentYear(d.getFullYear())
      } else {
        const d = new Date(value)
        setSelectedDate(d)
        setCurrentMonth(d.getMonth())
        setCurrentYear(d.getFullYear())
      }
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()

  const handleSelectDay = (day) => {
    soundManager.playClick()
    const mm = String(currentMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    const formatted = `${currentYear}-${mm}-${dd}`
    onChange?.(formatted)
    setSelectedDate(new Date(currentYear, currentMonth, day))
    setIsOpen(false)
  }

  const formatDisplay = (val) => {
    if (!val) return ''
    const parts = String(val).split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      return `${day} ${MONTH_NAMES[month]} ${year}`
    }
    const d = new Date(val)
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => {
          soundManager.playClick()
          setIsOpen(!isOpen)
        }}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-800 shadow-sm hover:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 transition-all ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-[#0284c7] flex-shrink-0" />
          <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
        </div>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onChange?.('')
            }}
            className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          } z-50 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 animate-scaleUp overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/site-bg-watermark.png')] bg-center bg-cover"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick()
                  if (currentMonth === 0) {
                    setCurrentMonth(11)
                    setCurrentYear((y) => y - 1)
                  } else {
                    setCurrentMonth((m) => m - 1)
                  }
                }}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-full text-xs font-black text-[#0a2540]"
                >
                  {MONTH_NAMES[currentMonth]}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-full text-xs font-black text-[#0a2540]"
                >
                  {currentYear}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick()
                  if (currentMonth === 11) {
                    setCurrentMonth(0)
                    setCurrentYear((y) => y + 1)
                  } else {
                    setCurrentMonth((m) => m + 1)
                  }
                }}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {viewMode === 'months' && (
              <div className="grid grid-cols-3 gap-2 py-2">
                {MONTH_NAMES.map((m, idx) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      soundManager.playClick()
                      setCurrentMonth(idx)
                      setViewMode('days')
                    }}
                    className={`py-2 text-xs font-bold rounded-2xl transition-all ${
                      currentMonth === idx
                        ? 'bg-[#0a2540] text-white shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {viewMode === 'years' && (
              <div className="grid grid-cols-3 gap-2 py-2 max-h-48 overflow-y-auto">
                {Array.from({ length: 12 }, (_, i) => currentYear - 5 + i).map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      soundManager.playClick()
                      setCurrentYear(yr)
                      setViewMode('days')
                    }}
                    className={`py-2 text-xs font-bold rounded-2xl transition-all ${
                      currentYear === yr
                        ? 'bg-[#0a2540] text-white shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}

            {viewMode === 'days' && (
              <>
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {DAY_NAMES.map((d, i) => (
                    <div key={i} className="text-[11px] font-bold text-slate-400 py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const isSelected =
                      selectedDate &&
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === currentMonth &&
                      selectedDate.getFullYear() === currentYear

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-[#0284c7] text-white shadow-md scale-105'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
