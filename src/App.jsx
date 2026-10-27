import React, { useState } from 'react'
import { AX_Header } from './components/navigation/AX_Header'
import { AX_Sidebar } from './components/navigation/AX_Sidebar'
import { AX_MobileNavbar } from './components/navigation/AX_MobileNavbar'
import { AX_InstallPwaBanner } from './components/common/AX_InstallPwaBanner'
import { AppUpdateNotifier } from './components/common/AppUpdateNotifier'
import { AX_MandatoryPushModal } from './components/common/AX_MandatoryPushModal'
import { AX_ConfirmModal } from './components/common/AX_ConfirmModal'
import { DailySituationView } from './components/trips/DailySituationView'
import { BookingsManagement } from './components/bookings/BookingsManagement'
import { CashDrawer } from './components/cash/CashDrawer'
import { TripDetailsModal } from './components/trips/TripDetailsModal'
import { useAXStore } from './store/useAXStore'

export function App() {
  const { activeTab } = useAXStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col font-tajawal antialiased">
      {/* 1. Quad-Lock PWA Auto Update Notifier */}
      <AppUpdateNotifier />

      {/* 2. Mandatory Push 24/7 Web Push Modal */}
      <AX_MandatoryPushModal />

      {/* 3. Global Capsule Confirmation Modal */}
      <AX_ConfirmModal />

      {/* 4. Booking Creation Modal */}
      <TripDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* 5. Lean Responsive Header (Zero Fluff) */}
      <AX_Header />

      {/* 6. PWA Install Banner */}
      <AX_InstallPwaBanner />

      {/* 7. Master Full Canvas Layout (Zero Empty Gutters) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 flex-1 flex gap-4">
        {/* Right Desktop Sticky Sidebar */}
        <AX_Sidebar />

        {/* Main Content Area - Expands 100% Full Canvas */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-4">
          {activeTab === 'daily' && (
            <DailySituationView onOpenNewBooking={() => setIsModalOpen(true)} />
          )}

          {activeTab === 'bookings' && (
            <BookingsManagement onOpenNewBooking={() => setIsModalOpen(true)} />
          )}

          {activeTab === 'sea_trips' && (
            <DailySituationView onOpenNewBooking={() => setIsModalOpen(true)} />
          )}

          {activeTab === 'safari' && (
            <DailySituationView onOpenNewBooking={() => setIsModalOpen(true)} />
          )}

          {activeTab === 'cash' && <CashDrawer />}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-4">
              <h3 className="text-base font-black text-[#0a2540]">
                تقارير التشغيل والتحصيل
              </h3>
              <p className="text-xs text-slate-500">
                تقارير شاملة عن حركة النزلاء في فنادق الغردقة وسعة المراكب وإيرادات العملات الأجنبية.
              </p>
              <CashDrawer />
            </div>
          )}
        </main>
      </div>

      {/* 8. Floating Capsule Mobile Navigation (lg:hidden) */}
      <AX_MobileNavbar />
    </div>
  )
}

export default App
