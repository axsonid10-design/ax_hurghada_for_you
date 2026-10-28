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
  FileSpreadsheet,
  LogOut,
  ShieldCheck
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { hasModuleAccess } from '../../utils/permissionsConfig'

export function AX_Sidebar({ onOpenUploadModal, isHeaderVisible = true }) {
  const { activeTab, setActiveTab, profile, logout, openConfirmModal, tripDefinitions = [], t } = useAXStore()
  const [isPinned, setIsPinned] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isExpanded = isPinned || isHovered

  const isMaster = profile?.is_master || profile?.role === 'Super Admin' || profile?.email === 'axsonid@gmail.com'

  const unpricedTripsCount = useMemo(() => {
    return tripDefinitions.filter(
      (td) => Number(td.adult_cost) === 0 && Number(td.adult_sell) === 0 && td.sheet_name !== 'Cash Pickup'
    ).length
  }, [tripDefinitions])

  const menuSections = [
    {
      title: t('nav_operations'),
      items: [
        { id: 'dashboard', label: t('tab_dashboard'), icon: LayoutDashboard },
        { id: 'daily', label: t('tab_daily'), icon: Ship },
        { id: 'bookings', label: t('tab_bookings'), icon: CalendarCheck }
      ]
    },
    {
      title: t('nav_trips'),
      items: [
        {
          id: 'trips',
          label: t('tab_trips'),
          icon: Tag,
          badge: unpricedTripsCount > 0 ? `${unpricedTripsCount} غير مسعر` : null,
          isAlert: unpricedTripsCount > 0
        },
        { id: 'executors', label: t('tab_executors'), icon: Truck }
      ]
    },
    {
      title: t('nav_finances'),
      items: [
        { id: 'cash', label: t('tab_cash'), icon: Banknote },
        { id: 'reports', label: t('tab_reports'), icon: BarChart3 }
      ]
    },
    {
      title: t('tab_staff'),
      items: [
        { id: 'staff', label: t('tab_staff'), icon: Users }
      ]
    }
  ]

  const filteredSections = menuSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) =>
        hasModuleAccess(profile, item.id) &&
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
      className={`hidden lg:flex flex-col flex-shrink-0 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-3 shadow-card space-y-3 sticky self-start transition-all duration-300 ease-in-out z-30 ${
        isHeaderVisible ? 'top-20 h-[calc(100vh-100px)]' : 'top-4 h-[calc(100vh-32px)]'
      } ${
        isExpanded ? 'w-64' : 'w-[72px]'
      }`}
    >
      <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100">
        {isExpanded ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-black text-[#0a2540] tracking-wider uppercase">
              {t('operations_system')}
            </span>
            <button
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? t('unpin_sidebar') : t('pin_sidebar')}
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
              title={t('pin_sidebar')}
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
            placeholder={t('search_menus')}
            className="w-full bg-slate-50 border border-slate-200 rounded-full px-8 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3.5 top-2.5" />
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
          <span>{t('upload_sheet')}</span>
        </button>
      ) : (
        <button
          onClick={() => {
            soundManager.playClick()
            onOpenUploadModal?.()
          }}
          title={t('upload_sheet')}
          className="w-10 h-10 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pe-1">
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
                        item.isAlert
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isActive
                          ? 'bg-[#0284c7] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {!isExpanded && item.isAlert && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 animate-ping" />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        <div
          className={`flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-100 ${
            !isExpanded ? 'justify-center p-1' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#38bdf8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src="/logo-circle.png" alt="غردقة فور يو" className="w-full h-full object-cover rounded-full" />
          </div>
          {isExpanded && (
            <>
              <div className="flex-1 min-w-0 text-right">
                <div className="text-xs font-black text-[#0a2540] truncate">
                  {profile?.name || 'مدير التشغيل'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {profile?.role || 'Operations'}
                </div>
              </div>
              <button
                onClick={() => {
                  openConfirmModal({
                    title: 'تسجيل الخروج',
                    message: 'هل تريد تسجيل الخروج من المنظومة؟',
                    confirmText: 'تسجيل الخروج',
                    type: 'danger',
                    onConfirm: () => {
                      soundManager.playClick()
                      logout()
                    }
                  })
                }}
                title="تسجيل الخروج"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {isExpanded ? (
          <a
            href="https://axsonid.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-full bg-slate-50 hover:bg-white border border-slate-200 hover:border-sky-400 transition-all group"
            title="Created by AXONID"
          >
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
              Created by
            </span>
            <span className="text-[11px] font-black font-mono text-[#0a2540] group-hover:text-sky-600 transition-colors">
              AXONID
            </span>
          </a>
        ) : (
          <div className="flex justify-center">
            <a
              href="https://axsonid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-slate-100 transition-transform hover:scale-110 block"
              title="Created by AXONID"
            >
              <span className="w-5 h-5 rounded-full bg-[#0a2540] text-white flex items-center justify-center text-[9px] font-black">
                AX
              </span>
            </a>
          </div>
        )}
      </div>
    </aside>
  )
}
