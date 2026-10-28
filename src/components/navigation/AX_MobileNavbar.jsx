import React, { useState, useRef, useEffect } from 'react'
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

export function AX_MobileNavbar({ activeTab: propActiveTab, onSelectTab: propOnSelectTab, isVisible = true }) {
  const { activeTab: storeActiveTab, setActiveTab: storeSetActiveTab, profile, t } = useAXStore()
  const activeTab = propActiveTab || storeActiveTab
  const onSelectTab = propOnSelectTab || storeSetActiveTab

  const activeTabRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Law 1: Modal Collision Avoidance (Automatic Dismiss on Modal Open)
  useEffect(() => {
    const checkModal = () => {
      const modal =
        document.querySelector('[data-modal="true"]') ||
        document.querySelector('.fixed.inset-0.z-50') ||
        document.querySelector('.fixed.inset-0.z-\\[60\\]') ||
        document.querySelector('.fixed.inset-0.z-\\[9999\\]')
      setIsModalOpen(Boolean(modal))
    }
    checkModal()
    const observer = new MutationObserver(checkModal)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true })
    return () => observer.disconnect()
  }, [])

  // Law 2: All Tabs Filtered by Permissions
  const allTabs = [
    { id: 'dashboard', label: t('tab_dashboard'), icon: LayoutDashboard },
    { id: 'daily', label: t('tab_daily'), icon: Ship },
    { id: 'bookings', label: t('tab_bookings'), icon: CalendarCheck },
    { id: 'trips', label: t('tab_trips'), icon: Tag },
    { id: 'executors', label: t('tab_executors'), icon: Truck },
    { id: 'cash', label: t('tab_cash'), icon: Banknote },
    { id: 'reports', label: t('tab_reports'), icon: BarChart3 },
    { id: 'staff', label: t('tab_staff'), icon: Users }
  ].filter((t) => hasModuleAccess(profile, t.id))

  // Law 3: Active Tab Auto-Center on Switch
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      })
    }
  }, [activeTab])

  const handleSelect = (id) => {
    soundManager.playClick()
    onSelectTab(id)
  }

  if (isModalOpen || allTabs.length === 0) return null

  // Law 4: Centered Floating Capsule Architecture (Rule 2 of 2610)
  return (
    <div
      className={`fixed bottom-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.5rem))] inset-x-0 z-50 flex justify-center px-2.5 sm:px-4 pointer-events-none lg:hidden transition-all duration-300 ease-in-out ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-28 opacity-0 pointer-events-none'
      }`}
    >
      <nav
        dir="rtl"
        className="pointer-events-auto w-fit max-w-full bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full py-1.5 px-2 flex items-center gap-1 overflow-x-auto shadow-2xl scrollbar-none overscroll-x-contain touch-pan-x"
      >
        {allTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              type="button"
              onClick={() => handleSelect(tab.id)}
              className={`flex-shrink-0 flex flex-col items-center justify-center gap-0.5 py-1 px-3 sm:px-3.5 rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#0a2540] text-white font-black shadow-sm scale-105'
                  : 'text-slate-600 font-bold hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] leading-tight select-none">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default AX_MobileNavbar
