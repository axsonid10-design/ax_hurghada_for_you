import React, { useState } from 'react'
import {
  Compass,
  Ship,
  Users,
  Banknote,
  BarChart3,
  Search,
  Pin,
  CalendarCheck,
  Palmtree,
  Settings,
  Truck,
  Tag,
  LayoutDashboard,
  FileSpreadsheet
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'

export function AX_Sidebar({ onOpenUploadModal }) {
  const { activeTab, setActiveTab, profile } = useAXStore()
  const [isPinned, setIsPinned] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isExpanded = isPinned || isHovered

  const menuSections = [
    {
      title: 'العمليات والتشغيل',
      items: [
        { id: 'dashboard', label: 'الداشبورد (الرئيسية)', icon: LayoutDashboard },
        { id: 'daily', label: 'الوضع اليومي (Daily)', icon: Ship, badge: '57' },
        { id: 'bookings', label: 'كشف الحجوزات والنزلاء', icon: CalendarCheck }
      ]
    },
    {
      title: 'الرحلات والمنفذين',
      items: [
        { id: 'trips', label: 'دليل الرحلات والأسعار', icon: Tag, badge: '19' },
        { id: 'executors', label: 'المنفذين والتوريد', icon: Truck, badge: '4' }
      ]
    },
    {
      title: 'الماليات والتقارير',
      items: [
        { id: 'cash', label: 'الخزينة والعملات (Cash)', icon: Banknote },
        { id: 'reports', label: 'تقارير الأداء والتحصيل', icon: BarChart3 }
      ]
    }
  ]

  const filteredSections = menuSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter((sec) => sec.items.length > 0)

  const handleTabClick = (id) => {
    soundManager.playClick()
    setActiveTab(id)
  }

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden lg:flex flex-col flex-shrink-0 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-3 shadow-card space-y-3 sticky top-20 self-start h-[calc(100vh-100px)] transition-all duration-300 ease-in-out z-30 ${
        isExpanded ? 'w-64' : 'w-[72px]'
      }`}
    >
      <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100">
        {isExpanded ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black text-[#0a2540] tracking-wider uppercase">
              منظومة التشغيل
            </span>
            <button
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'إلغاء التثبيت' : 'تثبيت السايدبار'}
              className={`p-1.5 rounded-full transition-colors ${
                isPinned
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <button
              onClick={() => setIsPinned(true)}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="relative px-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في القوائم..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full px-8 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-2.5" />
        </div>
      )}

      {/* Quick Action Button to upload Excel */}
      {isExpanded ? (
        <button
          onClick={() => {
            soundManager.playClick()
            onOpenUploadModal?.()
          }}
          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>رفع يومية إكسيل</span>
        </button>
      ) : (
        <button
          onClick={() => {
            soundManager.playClick()
            onOpenUploadModal?.()
          }}
          title="رفع يومية إكسيل"
          className="w-10 h-10 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {filteredSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {isExpanded && (
              <div className="text-[11px] font-bold text-slate-400 px-3 py-1">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={!isExpanded ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0a2540] text-white shadow-md shadow-[#0a2540]/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${!isExpanded ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-[#38bdf8]' : 'text-slate-500'
                    }`}
                  />
                  {isExpanded && (
                    <span className="flex-1 text-right truncate">{item.label}</span>
                  )}
                  {isExpanded && item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#0284c7] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100">
        <div
          className={`flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-100 ${
            !isExpanded ? 'justify-center p-1' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#38bdf8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src="/logo-circle.png" alt="غردقة فور يو" className="w-full h-full object-cover rounded-full" />
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0 text-right">
              <div className="text-xs font-black text-[#0a2540] truncate">
                {profile?.name || 'مدير التشغيل'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {profile?.role || 'Operations'}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
