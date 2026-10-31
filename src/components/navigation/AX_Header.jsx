import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Bell, Download, LogOut, User, Globe, ShieldCheck } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { pushManager } from '../../utils/pushManager'
import { soundManager } from '../../utils/soundEffects'

export function AX_Header({ isVisible = true }) {
  const isOnline = useAXStore((state) => state.isOnline)
  const profile = useAXStore((state) => state.profile)
  const logout = useAXStore((state) => state.logout)
  const lang = useAXStore((state) => state.lang)
  const toggleLang = useAXStore((state) => state.toggleLang)
  const t = useAXStore((state) => state.t)
  const openConfirmModal = useAXStore((state) => state.openConfirmModal)
  const openPushModal = useAXStore((state) => state.openPushModal)
  const openPwaInstallModal = useAXStore((state) => state.openPwaInstallModal)
  const openMasterModal = useAXStore((state) => state.openMasterModal)
  const [pushStatus, setPushStatus] = useState('default')
  const [isStandalone, setIsStandalone] = useState(false)

  const isMaster =
    profile?.email?.toLowerCase() === 'axonid@gmail.com' ||
    profile?.email?.toLowerCase() === 'axsonid@gmail.com'

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
      await pushManager.sendTestNotification(profile?.id, profile?.role)
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
      title: t('logout'),
      message: t('confirm_logout_msg'),
      confirmText: t('logout'),
      type: 'danger',
      onConfirm: () => {
        soundManager.playClick()
        logout()
      }
    })
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[#0f172a] text-white border-b border-slate-800 shadow-sm transition-all duration-300 ease-in-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => window.location.reload()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#0284c7] shadow-md bg-[#0a2540] flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
          >
            <img
              src="/logo-circle.png"
              alt="HURGHADA FOR YOU"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-black text-white tracking-wide leading-none">
              {lang === 'ar' ? 'غردقة فور يو' : 'Hurghada For You'}
            </div>
            <div className="text-[10px] text-[#38bdf8] font-bold mt-1 font-mono tracking-wider">
              {lang === 'ar' ? 'HURGHADA FOR YOU' : 'OPERATIONS SYSTEM'}
            </div>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Button (AR | EN) */}
          <button
            onClick={() => {
              soundManager.playClick()
              toggleLang()
            }}
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-black transition-all active:scale-95 border border-slate-700 shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-mono tracking-wider">{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Web Push Notification Bell (Desktop Only) */}
          <button
            onClick={handlePushClick}
            title={pushStatus === 'granted' ? 'Web Push Active' : 'Enable Web Push'}
            className="hidden sm:flex relative p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all active:scale-95 items-center justify-center border border-slate-700"
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

          {/* Online/Offline Status Indicator */}
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('online')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/80 border border-rose-500/40 rounded-full text-rose-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('offline')}</span>
            </div>
          )}

          {/* Master Control Button for AXONID only */}
          {isMaster && (
            <button
              onClick={() => {
                soundManager.playClick()
                openMasterModal()
              }}
              title="غرفة تحكم AXONID ورادار الأخطاء"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black transition-all active:scale-95 border border-amber-500/40 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">AXONID</span>
            </button>
          )}

          {/* User Capsule & Logout */}
          {profile && (
            <div className="flex items-center gap-1.5 ms-1 border-s border-slate-700 ps-2">
              <div className="hidden lg:flex flex-col ltr:text-left rtl:text-right text-xs">
                <span className="font-bold text-white text-[11px] leading-tight truncate max-w-[110px]">
                  {profile.name}
                </span>
                <span className="text-[9px] text-[#38bdf8] font-mono leading-tight">
                  {profile.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title={t('logout')}
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
