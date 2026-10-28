import { create } from 'zustand'
import { translations } from '../i18n/translations'
import { clearOfflineQueue } from '../services/offlineQueue'
import {
  INITIAL_EXECUTORS,
  INITIAL_TRIP_DEFINITIONS,
  INITIAL_EXPENSES,
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

const getStoredLang = () => {
  if (typeof window === 'undefined') return 'ar'
  const l = localStorage.getItem('ax_h4u_lang') || 'ar'
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', l)
  }
  return l
}

const getStoredTab = () => {
  if (typeof window === 'undefined') return 'dashboard'
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('tab')
    if (fromUrl) return fromUrl
    return localStorage.getItem('ax_h4u_active_tab') || 'dashboard'
  } catch {
    return 'dashboard'
  }
}

const DEFAULT_SYSTEM_USERS = [
  {
    id: 'usr_master_axonid',
    name: 'AXONID Master Admin',
    email: 'axsonid@gmail.com',
    phone: '01000000000',
    code: 'ADM-00',
    role: 'مدير عام',
    status: 'active',
    is_master: true,
    permissions: {
      dashboard: true,
      daily: true,
      bookings: true,
      trips: true,
      executors: true,
      cash: true,
      reports: true,
      staff: true,
      can_edit_prices: true,
      can_delete_bookings: true
    }
  }
]

const getStoredTripDefinitions = () => {
  if (typeof window === 'undefined') return INITIAL_TRIP_DEFINITIONS
  try {
    const raw = localStorage.getItem('ax_h4u_trip_definitions')
    if (raw) return JSON.parse(raw)
  } catch {}
  return INITIAL_TRIP_DEFINITIONS
}

const getStoredExecutors = () => {
  if (typeof window === 'undefined') return INITIAL_EXECUTORS
  try {
    const raw = localStorage.getItem('ax_h4u_executors')
    if (raw) return JSON.parse(raw)
  } catch {}
  return INITIAL_EXECUTORS
}

const getStoredBookings = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ax_h4u_bookings')
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

const getStoredExpenses = () => {
  if (typeof window === 'undefined') return INITIAL_EXPENSES
  try {
    const raw = localStorage.getItem('ax_h4u_expenses')
    if (raw) return JSON.parse(raw)
  } catch {}
  return INITIAL_EXPENSES
}

const getStoredImportedDates = () => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('ax_h4u_imported_dates')
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

const getStoredSystemUsers = () => {
  if (typeof window === 'undefined') return DEFAULT_SYSTEM_USERS
  try {
    const raw = localStorage.getItem('ax_h4u_system_users')
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_SYSTEM_USERS
}

const getStoredInvites = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ax_h4u_staff_invites')
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

const getTodayIsoDate = () => {
  try {
    return new Date().toISOString().split('T')[0]
  } catch {
    return '2026-10-28'
  }
}

export const useAXStore = create((set, get) => ({
  lang: getStoredLang(),
  setLang: (lang) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', lang)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_lang', lang)
    }
    set({ lang })
  },
  toggleLang: () => {
    const next = get().lang === 'ar' ? 'en' : 'ar'
    get().setLang(next)
  },
  t: (key) => {
    const l = get().lang || 'ar'
    return translations[l]?.[key] || key
  },
  profile: getStoredProfile(),
  isAuthLoading: false,
  setProfile: (profile) => {
    if (typeof localStorage !== 'undefined') {
      if (profile) {
        localStorage.setItem('ax_h4u_auth_user', JSON.stringify(profile))
      } else {
        localStorage.removeItem('ax_h4u_auth_user')
      }
    }
    set({ profile })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ax_h4u_auth_user')
      sessionStorage.removeItem('ax_h4u_auth_user')
    }
    set({ profile: null, activeTab: 'dashboard' })
  },
  realtimeTrigger: 0,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  activeTab: getStoredTab(),
  setActiveTab: (tab) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_active_tab', tab)
    }
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href)
        url.searchParams.set('tab', tab)
        window.history.replaceState({}, '', url.toString())
      } catch {}
    }
    set({ activeTab: tab })
  },
  sidebarPinned: true,
  sidebarCollapsed: false,
  selectedDate: getTodayIsoDate(),
  searchQuery: '',
  pendingSyncCount: 0,

  // Data Stores
  executors: getStoredExecutors(),
  tripDefinitions: getStoredTripDefinitions(),
  bookings: getStoredBookings(),
  expenses: getStoredExpenses(),
  importedDates: getStoredImportedDates(),
  wipeAllData: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ax_h4u_staff_invites')
      localStorage.removeItem('ax_h4u_system_users')
      localStorage.removeItem('ax_h4u_bookings')
      localStorage.removeItem('ax_h4u_expenses')
      localStorage.removeItem('ax_h4u_imported_dates')
    }
    clearOfflineQueue().catch(() => {})
    const masterOnly = DEFAULT_SYSTEM_USERS
    set((state) => ({
      bookings: [],
      expenses: [],
      importedDates: {},
      selectedDate: getTodayIsoDate(),
      systemUsers: masterOnly,
      staffInvites: [],
      executors: state.executors.map((ex) => ({ ...ex, total_paid: 0, payments: [] }))
    }))
  },

  maxUsers: 15,
  setMaxUsers: (val) => set({ maxUsers: Number(val) || 15 }),
  systemUsers: getStoredSystemUsers(),
  staffInvites: getStoredInvites(),

  addStaffInvite: (invite) => {
    const prev = get().staffInvites || []
    const next = [invite, ...prev]
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_staff_invites', JSON.stringify(next))
    }
    set({ staffInvites: next })
  },

  deleteStaffInvite: (token) => {
    const prev = get().staffInvites || []
    const next = prev.filter((i) => i.token !== token)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_staff_invites', JSON.stringify(next))
    }
    set({ staffInvites: next })
  },

  addSystemUser: (user) => {
    const prev = get().systemUsers || []
    const next = [
      {
        ...user,
        id: user.id || 'usr_' + Date.now(),
        code: user.code || 'EMP-' + Math.floor(10 + Math.random() * 90),
        status: user.status || 'active',
        is_master: false
      },
      ...prev
    ]
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_system_users', JSON.stringify(next))
    }
    set({ systemUsers: next })
  },

  updateSystemUser: (id, fields) => {
    const prev = get().systemUsers || []
    const next = prev.map((u) => (u.id === id ? { ...u, ...fields } : u))
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_system_users', JSON.stringify(next))
    }
    set({ systemUsers: next })
  },

  deleteSystemUser: (id) => {
    const prev = get().systemUsers || []
    const next = prev.filter((u) => u.id !== id)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_system_users', JSON.stringify(next))
    }
    set({ systemUsers: next })
  },

  toggleSystemUserStatus: (id) => {
    const prev = get().systemUsers || []
    const next = prev.map((u) =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    )
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_system_users', JSON.stringify(next))
    }
    set({ systemUsers: next })
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(newDefs))
      }
      return { tripDefinitions: newDefs }
    })
  },

  updateTripDefinition: (id, updatedFields) => {
    set((state) => {
      const newDefs = state.tripDefinitions.map((td) =>
        td.id === id ? { ...td, ...updatedFields } : td
      )
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(newDefs))
      }
      return { tripDefinitions: newDefs }
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(newDefs))
      }
      return { tripDefinitions: newDefs }
    })
  },

  // Executors Actions
  addExecutor: (executor) => set((state) => {
    const next = [...state.executors, executor]
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
    }
    return { executors: next }
  }),

  updateExecutor: (id, updatedFields) => set((state) => {
    const next = state.executors.map((ex) => (ex.id === id ? { ...ex, ...updatedFields } : ex))
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
    }
    return { executors: next }
  }),

  deleteExecutor: (id) => set((state) => {
    const next = state.executors.filter((ex) => ex.id !== id)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
    }
    return { executors: next }
  }),

  recordExecutorPayment: (id, payment) => set((state) => {
    const isObj = typeof payment === 'object' && payment !== null
    const amt = isObj ? Number(payment.amount) || 0 : Number(payment) || 0
    const currency = isObj ? payment.currency || 'EUR' : 'EUR'
    const notes = isObj ? payment.notes || '' : ''
    const date = isObj ? payment.date || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

    const next = state.executors.map((ex) => {
      if (ex.id !== id) return ex
      const prevPayments = ex.payments || []
      const newPaymentRecord = {
        id: 'pay_' + Date.now(),
        date,
        amount: amt,
        currency,
        notes
      }
      return {
        ...ex,
        total_paid: (ex.total_paid || 0) + amt,
        payments: [newPaymentRecord, ...prevPayments]
      }
    })

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
    }
    return { executors: next }
  }),

  // Operational Expenses Actions
  addExpense: (expense) => set((state) => {
    const next = [
      {
        ...expense,
        id: expense.id || 'exp_' + Date.now(),
        date: expense.date || new Date().toISOString().split('T')[0]
      },
      ...state.expenses
    ]
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_expenses', JSON.stringify(next))
    }
    return { expenses: next }
  }),

  deleteExpense: (id) => set((state) => {
    const next = state.expenses.filter((e) => e.id !== id)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_expenses', JSON.stringify(next))
    }
    return { expenses: next }
  }),

  // Bookings Actions
  addBooking: (booking) => {
    const { tripDefinitions, bookings } = get()
    const fin = computeBookingFinancials(booking, tripDefinitions)
    const next = [{ ...booking, ...fin }, ...bookings]
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
    }
    set({ bookings: next })
  },

  updateBooking: (sr, updatedFields) => {
    const { tripDefinitions, bookings } = get()
    const next = bookings.map((b) => {
      if (b.sr === sr) {
        const merged = { ...b, ...updatedFields }
        const fin = computeBookingFinancials(merged, tripDefinitions)
        return { ...merged, ...fin }
      }
      return b
    })
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
    }
    set({ bookings: next })
  },

  deleteBooking: (sr) => set((state) => {
    const next = state.bookings.filter((b) => b.sr !== sr)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
    }
    return { bookings: next }
  }),

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
      nextBookings = [...bookings.filter((b) => b.date !== date), ...calculated]
    } else {
      const existingSrs = new Set(bookings.map((b) => b.sr))
      const toAppend = calculated.filter((b) => !existingSrs.has(b.sr))
      nextBookings = [...bookings, ...toAppend]
    }

    const nextImportedDates = {
      ...importedDates,
      [date]: {
        filename,
        importedAt: new Date().toISOString(),
        count: calculated.length
      }
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_bookings', JSON.stringify(nextBookings))
      localStorage.setItem('ax_h4u_imported_dates', JSON.stringify(nextImportedDates))
    }

    set({
      bookings: nextBookings,
      selectedDate: date,
      importedDates: nextImportedDates
    })
  }
}))
