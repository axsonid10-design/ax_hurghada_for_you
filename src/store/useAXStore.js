import { create } from 'zustand'
import {
  INITIAL_EXECUTORS,
  INITIAL_TRIP_DEFINITIONS,
  computeBookingFinancials,
  buildInitialBookings
} from '../data/initialSetup'

const getStoredProfile = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('ax_h4u_auth_user') || sessionStorage.getItem('ax_h4u_auth_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAXStore = create((set, get) => ({
  profile: getStoredProfile(),
  isAuthLoading: false,
  setProfile: (profile) => set({ profile }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ax_h4u_auth_user')
      sessionStorage.removeItem('ax_h4u_auth_user')
    }
    set({ profile: null, activeTab: 'dashboard' })
  },
  realtimeTrigger: 0,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  activeTab: 'dashboard',
  sidebarPinned: true,
  sidebarCollapsed: false,
  selectedDate: '2026-10-24',
  searchQuery: '',
  pendingSyncCount: 0,

  // Data Stores
  executors: INITIAL_EXECUTORS,
  tripDefinitions: INITIAL_TRIP_DEFINITIONS,
  bookings: buildInitialBookings(),
  importedDates: {
    '2026-10-24': {
      filename: 'Hurghada For You - Daily Situation - 10-24-2026.xlsx',
      importedAt: '2026-10-28T00:00:00.000Z',
      count: 57
    }
  },

  // Confirmation Modal
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'danger',
    onConfirm: () => {}
  },

  // Navigation & UI Setters
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebarPin: () => set((state) => ({ sidebarPinned: !state.sidebarPinned })),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsOnline: (online) => set({ isOnline: online }),

  openConfirmModal: ({ title, message, confirmText, cancelText, type, onConfirm }) => set({
    confirmModal: {
      isOpen: true,
      title,
      message,
      confirmText: confirmText || 'تأكيد',
      cancelText: cancelText || 'إلغاء',
      type: type || 'danger',
      onConfirm
    }
  }),

  closeConfirmModal: () => set({
    confirmModal: {
      isOpen: false,
      title: '',
      message: '',
      confirmText: 'تأكيد',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => {}
    }
  }),

  isPushModalOpen: false,
  isPwaInstallModalOpen: false,
  openPushModal: () => set({ isPushModalOpen: true }),
  closePushModal: () => set({ isPushModalOpen: false }),
  openPwaInstallModal: () => set({ isPwaInstallModalOpen: true }),
  closePwaInstallModal: () => set({ isPwaInstallModalOpen: false }),

  // Trip Definitions Actions
  addTripDefinition: (def) => {
    set((state) => {
      const newDefs = [...state.tripDefinitions, def]
      return {
        tripDefinitions: newDefs,
        bookings: state.bookings.map((b) => ({
          ...b,
          ...computeBookingFinancials(b, newDefs)
        }))
      }
    })
  },

  updateTripDefinition: (id, updatedFields) => {
    set((state) => {
      const newDefs = state.tripDefinitions.map((td) =>
        td.id === id ? { ...td, ...updatedFields } : td
      )
      return {
        tripDefinitions: newDefs,
        bookings: state.bookings.map((b) => ({
          ...b,
          ...computeBookingFinancials(b, newDefs)
        }))
      }
    })
  },

  batchAddTripDefinitions: (defs) => {
    set((state) => {
      const existingNames = new Set(
        state.tripDefinitions.map((td) => td.sheet_name.toLowerCase().trim())
      )
      const toAdd = defs.filter(
        (d) => !existingNames.has(d.sheet_name.toLowerCase().trim())
      )
      const newDefs = [...state.tripDefinitions, ...toAdd]
      return {
        tripDefinitions: newDefs,
        bookings: state.bookings.map((b) => ({
          ...b,
          ...computeBookingFinancials(b, newDefs)
        }))
      }
    })
  },

  // Executors Actions
  addExecutor: (executor) => set((state) => ({
    executors: [...state.executors, executor]
  })),

  updateExecutor: (id, updatedFields) => set((state) => ({
    executors: state.executors.map((ex) => (ex.id === id ? { ...ex, ...updatedFields } : ex))
  })),

  deleteExecutor: (id) => set((state) => ({
    executors: state.executors.filter((ex) => ex.id !== id)
  })),

  recordExecutorPayment: (id, amount) => set((state) => ({
    executors: state.executors.map((ex) =>
      ex.id === id ? { ...ex, total_paid: (ex.total_paid || 0) + amount } : ex
    )
  })),

  // Bookings Actions
  addBooking: (booking) => {
    const { tripDefinitions } = get()
    const fin = computeBookingFinancials(booking, tripDefinitions)
    set((state) => ({
      bookings: [{ ...booking, ...fin }, ...state.bookings]
    }))
  },

  updateBooking: (sr, updatedFields) => {
    const { tripDefinitions } = get()
    set((state) => ({
      bookings: state.bookings.map((b) => {
        if (b.sr === sr) {
          const merged = { ...b, ...updatedFields }
          const fin = computeBookingFinancials(merged, tripDefinitions)
          return { ...merged, ...fin }
        }
        return b
      })
    }))
  },

  deleteBooking: (sr) => set((state) => ({
    bookings: state.bookings.filter((b) => b.sr !== sr)
  })),

  // Excel Batch Import Engine
  importExcelBatch: ({ date, filename, rawBookings, overwrite = false }) => {
    const { tripDefinitions, bookings, importedDates } = get()

    const calculated = rawBookings.map((b) => {
      const fin = computeBookingFinancials(b, tripDefinitions)
      return {
        ...b,
        date,
        ...fin,
        status: (b.rest_eur === 0 && b.rest_egp === 0 && b.rest_usd === 0 && b.rest_gbp === 0) ? 'paid' : 'pending'
      }
    })

    let nextBookings = []
    if (overwrite) {
      // Remove previous bookings for this date and append new
      nextBookings = [...bookings.filter((b) => b.date !== date), ...calculated]
    } else {
      // Append only non-existing SRs
      const existingSrs = new Set(bookings.map((b) => b.sr))
      const toAppend = calculated.filter((b) => !existingSrs.has(b.sr))
      nextBookings = [...bookings, ...toAppend]
    }

    set({
      bookings: nextBookings,
      selectedDate: date,
      importedDates: {
        ...importedDates,
        [date]: {
          filename,
          importedAt: new Date().toISOString(),
          count: calculated.length
        }
      }
    })
  }
}))
