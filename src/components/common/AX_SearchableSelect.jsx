import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'

export function AX_SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = 'اختر...',
  label,
  disabled = false,
  className = '',
  searchable = true,
  error
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)

  // Normalize options to { value, label, icon, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) }
    }
    return opt
  })

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  )

  const filteredOptions = normalizedOptions.filter((opt) =>
    (opt.label || '').toLowerCase().includes(search.toLowerCase())
  )

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isOpen, searchable])

  const handleSelect = (val) => {
    onChange(val)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-black text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all text-start ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-[#0284c7] ring-2 ring-[#0284c7]/20 text-slate-800 shadow-sm'
            : error
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-[#0284c7]">{selectedOption.icon}</span>
          )}
          <span className={`truncate ${!selectedOption ? 'text-slate-400 font-normal' : 'font-black text-slate-800'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-[#0284c7]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[200px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn py-1">
          {/* Search Header if searchable and options > 4 */}
          {searchable && normalizedOptions.length > 4 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث في القائمة..."
                  className="w-full bg-white border border-slate-200 rounded-full py-1.5 pr-8 pl-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto scrollbar-thin py-1">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-4 text-center text-xs text-slate-400 font-bold">
                لا توجد نتائج مطابقة
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value)
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-bold transition-colors text-start ${
                      isSelected
                        ? 'bg-[#0a2540] text-white font-black'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      {opt.icon && (
                        <span className={`flex-shrink-0 ${isSelected ? 'text-sky-300' : 'text-[#0284c7]'}`}>
                          {opt.icon}
                        </span>
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
