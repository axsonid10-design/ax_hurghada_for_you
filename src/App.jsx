import React, { useState, useEffect } from 'react'
import { AX_Header } from './components/navigation/AX_Header'
import { AX_Sidebar } from './components/navigation/AX_Sidebar'
import { AX_MobileNavbar } from './components/navigation/AX_MobileNavbar'
import { AX_InstallPwaBanner } from './components/common/AX_InstallPwaBanner'
import { AppUpdateNotifier } from './components/common/AppUpdateNotifier'
import { AX_MandatoryPushModal } from './components/common/AX_MandatoryPushModal'
import { AX_ConfirmModal } from './components/common/AX_ConfirmModal'
import { AX_PwaInstallModal } from './components/common/AX_PwaInstallModal'
import { OperationsDashboard } from './components/dashboard/OperationsDashboard'
import { DailySituationView } from './components/trips/DailySituationView'
import { BookingsManagement } from './components/bookings/BookingsManagement'
import { TripsCatalogView } from './components/trips/TripsCatalogView'
import { ExecutorsView } from './components/executors/ExecutorsView'
import { CashDrawer } from './components/cash/CashDrawer'
import { PerformanceReports } from './components/reports/PerformanceReports'
import { AX_StaffManager } from './components/staff/AX_StaffManager'
import { AX_StaffOnboardingScreen } from './components/staff/AX_StaffOnboardingScreen'
import { ExcelUploadModal } from './components/importer/ExcelUploadModal'
import { QuickExpenseModal } from './components/dashboard/QuickExpenseModal'
import { AX_FloatingActions } from './components/common/AX_FloatingActions'
import { AX_WelcomeOverlay } from './components/common/AX_WelcomeOverlay'
import { AX_LoginScreen } from './components/auth/AX_LoginScreen'
import { useAXStore } from './store/useAXStore'
import { hasModuleAccess, getFirstAllowedModule } from './utils/permissionsConfig'
import { soundManager } from './utils/soundEffects'
import { useScrollDirection } from './hooks/useScrollDirection'

export function App() {
  const { activeTab, setActiveTab, profile, setProfile, logout, lang, addExpense } = useAXStore()
  const isChromeVisible = useScrollDirection()
  const [activeInviteToken, setActiveInviteToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('invite')
    }
    return null
  })
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('ax_welcome_seen')
    }
    return false
  })

  // Rule 16: Functional Permissions & Hard Route Guard
  useEffect(() => {
    if (!profile?.id) return
    if (!hasModuleAccess(profile, activeTab)) {
      const allowed = getFirstAllowedModule(profile)
      setActiveTab(allowed)
    }
  }, [activeTab, profile, setActiveTab])

  // Rule 16: Real-time Session Heartbeat & Instant Eviction / Permissions Revocation
  useEffect(() => {
    if (!profile?.id) return
    const isMaster =
      profile.is_master ||
      profile.role === 'Super Admin' ||
      profile.email === 'axsonid@gmail.com' ||
      profile.email === 'axonid@gmail.com'

    if (isMaster) return

    const verifySession = () => {
      try {
        const raw = localStorage.getItem('ax_h4u_system_users')
        if (!raw) return
        const users = JSON.parse(raw)
        const currentUser = users.find(
          (u) => u.id === profile.id || u.email?.toLowerCase() === profile.email?.toLowerCase()
        )

        // Instant Eviction: User deleted or deactivated by admin
        if (!currentUser || currentUser.status === 'inactive') {
          soundManager.playAlert()
          logout()
          return
        }

        // Instant Permissions Revocation: Role or permissions changed in real-time
        const permsChanged = JSON.stringify(currentUser.permissions) !== JSON.stringify(profile.permissions)
        const roleChanged = currentUser.role !== profile.role
        if (permsChanged || roleChanged) {
          setProfile(currentUser)
          if (!hasModuleAccess(currentUser, activeTab)) {
            const fallback = getFirstAllowedModule(currentUser)
            setActiveTab(fallback)
          }
        }
      } catch {}
    }

    const intervalId = setInterval(verifySession, 3000)
    window.addEventListener('focus', verifySession)
    window.addEventListener('storage', verifySession)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', verifySession)
      window.removeEventListener('storage', verifySession)
    }
  }, [profile, activeTab, logout, setProfile, setActiveTab])

  // Staff Invite Onboarding Guard
  if (activeInviteToken) {
    return (
      <div className="min-h-screen font-tajawal antialiased">
        <AX_StaffOnboardingScreen
          inviteToken={activeInviteToken}
          onComplete={() => {
            setActiveInviteToken(null)
          }}
        />
      </div>
    )
  }

  // Fortress Auth Guard
  if (!profile?.id) {
    return (
      <div className="min-h-screen font-tajawal antialiased">
        <AX_ConfirmModal />
        <AX_LoginScreen />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-tajawal antialiased">
      {showWelcome && (
        <AX_WelcomeOverlay
          appName="غردقة فور يو - منظومة الرحلات والتشغيل السياحي"
          userName={profile?.name}
          onComplete={() => {
            sessionStorage.setItem('ax_welcome_seen', 'true')
            setShowWelcome(false)
          }}
        />
      )}

      {/* 2. Mandatory 24/7 Web Push Modal */}
      <AX_MandatoryPushModal />

      {/* 3. Global Capsule Confirmation Modal */}
      <AX_ConfirmModal />

      {/* 3.1 PWA Native Install Guide Modal */}
      <AX_PwaInstallModal />

      {/* 4. Quick Expense Modal */}
      <QuickExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={addExpense}
      />

      {/* 5. Excel Daily Situation Upload Pipeline Modal */}
      <ExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* 6. Lean Responsive Header (Zero Fluff) */}
      <AX_Header isVisible={isChromeVisible} />

      {/* App Update Ribbon Strip */}
      <AppUpdateNotifier />

      {/* 7. PWA Install Banner */}
      <AX_InstallPwaBanner />

      {/* 8. Master Full Canvas Layout (Zero Empty Gutters) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 flex-1 flex gap-4">
        {/* Right Desktop Sticky Sidebar */}
        <AX_Sidebar
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          isHeaderVisible={isChromeVisible}
        />

        {/* Main Content Area - Expands 100% Full Canvas */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-4">
          {activeTab === 'dashboard' && (
            <OperationsDashboard
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenNewExpense={() => setIsExpenseModalOpen(true)}
            />
          )}

          {activeTab === 'daily' && (
            <DailySituationView
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsManagement
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          )}

          {activeTab === 'trips' && <TripsCatalogView />}

          {activeTab === 'executors' && <ExecutorsView />}

          {activeTab === 'cash' && <CashDrawer />}

          {activeTab === 'reports' && <PerformanceReports />}

          {activeTab === 'staff' && <AX_StaffManager />}

          {activeTab === 'admin' && <AX_StaffManager defaultTab="control" />}

          {/* AXONID Brand Signature Footer */}
          <footer className="w-full border border-slate-200/80 bg-white/95 backdrop-blur-md py-3 px-4 sm:px-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-black text-slate-700 shadow-sm mt-8 mb-28 lg:mb-4 transition-all text-center sm:text-start select-none">
            <span>{lang === 'ar' ? 'غردقة فور يو © 2026' : 'HURGHADA FOR YOU © 2026'}</span>
            <a
              href="https://axsonid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-50 hover:bg-white text-slate-600 hover:text-sky-600 border border-slate-200 hover:border-sky-400 transition-all font-mono font-black text-[11px] group cursor-pointer shadow-xs"
              title="Created by AXONID"
            >
              <span className="font-sans font-bold text-slate-400 group-hover:text-slate-600">Created by</span>
              <span className="text-[#0a2540] font-black tracking-wide group-hover:text-sky-600">AXONID</span>
            </a>
          </footer>
        </main>
      </div>

      {/* 9. Floating Action Buttons (FAB - Rule 6) */}
      <AX_FloatingActions
        isVisible={isChromeVisible}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenNewExpense={() => setIsExpenseModalOpen(true)}
      />

      {/* 10. Floating Capsule Mobile Navigation (lg:hidden) */}
      <AX_MobileNavbar isVisible={isChromeVisible} />
    </div>
  )
}

export default App
