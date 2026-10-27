import React, { useState } from 'react'
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
import { TripDetailsModal } from './components/trips/TripDetailsModal'
import { ExcelUploadModal } from './components/importer/ExcelUploadModal'
import { useAXStore } from './store/useAXStore'

export function App() {
  const { activeTab } = useAXStore()
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col font-tajawal antialiased">
      {/* 1. Quad-Lock PWA Auto Update Notifier */}
      <AppUpdateNotifier />

      {/* 2. Mandatory 24/7 Web Push Modal */}
      <AX_MandatoryPushModal />

      {/* 3. Global Capsule Confirmation Modal */}
      <AX_ConfirmModal />

      {/* 3.1 PWA Native Install Guide Modal */}
      <AX_PwaInstallModal />

      {/* 4. Booking Creation Modal */}
      <TripDetailsModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* 5. Excel Daily Situation Upload Pipeline Modal */}
      <ExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* 6. Lean Responsive Header (Zero Fluff) */}
      <AX_Header />

      {/* 7. PWA Install Banner */}
      <AX_InstallPwaBanner />

      {/* 8. Master Full Canvas Layout (Zero Empty Gutters) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 flex-1 flex gap-4">
        {/* Right Desktop Sticky Sidebar */}
        <AX_Sidebar onOpenUploadModal={() => setIsUploadModalOpen(true)} />

        {/* Main Content Area - Expands 100% Full Canvas */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-4">
          {activeTab === 'dashboard' && (
            <OperationsDashboard
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onOpenNewBooking={() => setIsBookingModalOpen(true)}
            />
          )}

          {activeTab === 'daily' && (
            <DailySituationView
              onOpenNewBooking={() => setIsBookingModalOpen(true)}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsManagement onOpenNewBooking={() => setIsBookingModalOpen(true)} />
          )}

          {activeTab === 'trips' && <TripsCatalogView />}

          {activeTab === 'executors' && <ExecutorsView />}

          {activeTab === 'cash' && <CashDrawer />}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-2">
                <h3 className="text-base font-black text-[#0a2540]">
                  التقارير المالية والتشغيلية المجمعة
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  إجمالي إيرادات رحلات الغردقة، نسب التحصيل، وأرصدة الموردين بالعملات الأجنبية والمحلية.
                </p>
              </div>
              <CashDrawer />
            </div>
          )}
        </main>
      </div>

      {/* 9. Floating Capsule Mobile Navigation (lg:hidden) */}
      <AX_MobileNavbar />
    </div>
  )
}

export default App
