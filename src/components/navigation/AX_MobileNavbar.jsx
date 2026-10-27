import React from 'react'
import { LayoutDashboard, Ship, Tag, Truck, Banknote } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'

export function AX_MobileNavbar() {
  const { activeTab, setActiveTab } = useAXStore()

  const tabs = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'daily', label: 'اليومية', icon: Ship },
    { id: 'trips', label: 'الرحلات', icon: Tag },
    { id: 'executors', label: 'المنفذين', icon: Truck },
    { id: 'cash', label: 'الخزينة', icon: Banknote }
  ]

  const handleSelect = (id) => {
    soundManager.playClick()
    setActiveTab(id)
  }

  return (
    <nav className="fixed bottom-4 left-3 right-3 z-50 lg:hidden">
      <div className="bg-[#0a2540]/95 backdrop-blur-xl border border-white/20 rounded-full px-2 py-2 shadow-float flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-[#0284c7] text-white shadow-md shadow-[#0284c7]/40 scale-105'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-bold tracking-tight">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
