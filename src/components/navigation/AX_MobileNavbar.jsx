import React, { useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  Ship,
  CalendarCheck,
  Tag,
  Truck,
  Banknote,
  BarChart3,
  Users
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { hasModuleAccess } from '../../utils/permissionsConfig'

export function AX_MobileNavbar({ isVisible = true }) {
  const { activeTab, setActiveTab, profile, t } = useAXStore()
  const activeBtnRef = useRef(null)

  const allTabs = [
    { id: 'dashboard', label: t('tab_dashboard'), icon: LayoutDashboard },
    { id: 'daily', label: t('tab_daily'), icon: Ship },
    { id: 'bookings', label: t('tab_bookings'), icon: CalendarCheck },
    { id: 'trips', label: t('tab_trips'), icon: Tag },
    { id: 'executors', label: t('tab_executors'), icon: Truck },
    { id: 'cash', label: t('tab_cash'), icon: Banknote },
    { id: 'reports', label: t('tab_reports'), icon: BarChart3 },
    { id: 'staff', label: t('tab_staff'), icon: Users }
  ]

  const visibleTabs = allTabs.filter((tab) => hasModuleAccess(profile, tab.id))

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      })
    }
  }, [activeTab])

  const handleSelect = (id) => {
    soundManager.playClick()
    setActiveTab(id)
  }

  if (visibleTabs.length === 0) return null

  return (
    <nav
      className={`fixed bottom-3 left-2.5 right-2.5 z-50 lg:hidden transition-all duration-300 ease-in-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-[#0a2540]/95 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-float flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              ref={isActive ? activeBtnRef : null}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full flex-shrink-0 min-w-[58px] transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[#0284c7] text-white shadow-md shadow-[#0284c7]/40 scale-105 font-black'
                  : 'text-slate-300 hover:text-white font-bold'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5 flex-shrink-0" />
              <span className="text-[10px] tracking-tight whitespace-nowrap leading-none">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
