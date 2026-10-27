import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Bell, Download, LogOut, User } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { pushManager } from '../../utils/pushManager'
import { soundManager } from '../../utils/soundEffects'

export function AX_Header() {
  const isOnline = useAXStore((state) => state.isOnline)
  const profile = useAXStore((state) => state.profile)
  const logout = useAXStore((state) => state.logout)
  const openConfirmModal = useAXStore((state) => state.openConfirmModal)
  const openPushModal = useAXStore((state) => state.openPushModal)
  const openPwaInstallModal = useAXStore((state) => state.openPwaInstallModal)
  const [pushStatus, setPushStatus] = useState('default')
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (pushManager.isSupported()) {
        setPushStatus(pushManager.getPermission())
      }
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        setIsStandalone(true)
      }
    }
  }, [])

  const handlePushClick = async () => {
    soundManager.playClick()
    if (pushStatus === 'granted') {
      await pushManager.sendTestNotification()
    } else {
      openPushModal()
    }
  }

  const handleInstallClick = () => {
    soundManager.playClick()
    if (window.__deferredPwaPrompt) {
      window.__deferredPwaPrompt.prompt()
    } else {
      openPwaInstallModal()
    }
  }

  const handleLogout = () => {
    openConfirmModal({
      title: 'تسجيل الخروج',
      message: 'هل تريد تسجيل الخروج من منظومة غردقة فور يو والعودة لبوابة الدخول؟',
      confirmText: 'تسجيل الخروج',
      type: 'danger',
      onConfirm: () => {
        soundManager.playClick()
        logout()
      }
    })
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a2540] text-white border-b border-[#1e3a5f]/60 shadow-md">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
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

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button (Desktop Only - Rule 5) */}
          {!isStandalone && (
            <button
              onClick={handleInstallClick}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت التطبيق</span>
            </button>
          )}

          {/* Web Push Notification Bell (Desktop Only - Rule 5) */}
          <button
            onClick={handlePushClick}
            title={pushStatus === 'granted' ? 'إشعارات الويب نشطة' : 'تفعيل إشعارات الويب'}
            className="hidden sm:flex relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 items-center justify-center"
          >
            <Bell className="w-4 h-4 text-slate-100" />
            <span
              className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                pushStatus === 'granted'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            ></span>
          </button>

          {/* Online/Offline Status Indicator (Lean on mobile) */}
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden md:inline">متصل</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/80 border border-rose-500/40 rounded-full text-rose-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">أوفلاين</span>
            </div>
          )}

          {/* User Capsule & Logout */}
          {profile && (
            <div className="flex items-center gap-1.5 mr-1 border-r border-white/15 pr-2">
              <div className="hidden lg:flex flex-col text-left text-xs">
                <span className="font-bold text-white text-[11px] leading-tight truncate max-w-[110px]">
                  {profile.name}
                </span>
                <span className="text-[9px] text-[#38bdf8] font-mono leading-tight">
                  {profile.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="p-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
