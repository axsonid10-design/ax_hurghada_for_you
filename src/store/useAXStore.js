import { create } from 'zustand'
import { translations } from '../i18n/translations'
import { clearOfflineQueue } from '../services/offlineQueue'
import {
  cloudSaveTrip,
  cloudDeleteTrip,
  cloudSaveExecutor,
  cloudDeleteExecutor,
  cloudSaveBooking,
  cloudDeleteBooking,
  cloudSaveBatch,
  cloudSaveExpense,
  cloudDeleteExpense,
  cloudSaveSettings,
  cloudWipeAll
} from '../services/realtimeSync'
import {
  INITIAL_EXECUTORS,
  INITIAL_TRIP_DEFINITIONS,
  INITIAL_EXPENSES,
  DEFAULT_TRIP_CATEGORIES,
  DEFAULT_EXECUTOR_CATEGORIES,
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
  },
  {
    id: 'usr_ops_director',
    name: 'مدير العمليات السياحية',
    email: 'director@hurghada.com',
    phone: '01123456780',
    code: 'DIR-01',
    role: 'مدير عام',
    status: 'active',
    is_master: false,
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
  },
  {
    id: 'usr_seller_laly',
    name: 'Laly (مندوب مبيعات)',
    email: 'laly@hurghada.com',
    phone: '01011223344',
    code: 'SEL-02',
    role: 'مندوب مبيعات',
    status: 'active',
    is_master: false,
    permissions: {
      dashboard: true,
      daily: true,
      bookings: true,
      trips: false,
      executors: false,
      cash: true,
      reports: false,
      staff: false,
      can_edit_prices: false,
      can_delete_bookings: false
    }
  },
  {
    id: 'usr_seller_meghane',
    name: 'Meghane (مندوب مبيعات)',
    email: 'meghane@hurghada.com',
    phone: '01055667788',
    code: 'SEL-03',
    role: 'مندوب مبيعات',
    status: 'active',
    is_master: false,
    permissions: {
      dashboard: true,
      daily: true,
      bookings: true,
      trips: false,
      executors: false,
      cash: true,
      reports: false,
      staff: false,
      can_edit_prices: false,
      can_delete_bookings: false
    }
  },
  {
    id: 'usr_seller_laure',
    name: 'Laure (مندوب مبيعات)',
    email: 'laure@hurghada.com',
    phone: '01099887766',
    code: 'SEL-04',
    role: 'مندوب مبيعات',
    status: 'active',
    is_master: false,
    permissions: {
      dashboard: true,
      daily: true,
      bookings: true,
      trips: false,
      executors: false,
      cash: true,
      reports: false,
      staff: false,
      can_edit_prices: false,
      can_delete_bookings: false
    }
  },
  {
    id: 'usr_ops_karim',
    name: 'كريم (مشرف مارينا ورحلات)',
    email: 'karim@hurghada.com',
    phone: '01234567890',
    code: 'OPS-05',
    role: 'مشرف عمليات',
    status: 'active',
    is_master: false,
    permissions: {
      dashboard: true,
      daily: true,
      bookings: true,
      trips: true,
      executors: true,
      cash: false,
      reports: false,
      staff: false,
      can_edit_prices: false,
      can_delete_bookings: false
    }
  }
]

if (typeof window !== 'undefined') {
  const CLEANUP_KEY = 'ax_h4u_clean_slate_v7'
  if (!localStorage.getItem(CLEANUP_KEY)) {
    localStorage.removeItem('ax_h4u_trip_definitions')
    localStorage.removeItem('ax_h4u_executors')
    localStorage.removeItem('ax_h4u_bookings')
    localStorage.removeItem('ax_h4u_expenses')
    localStorage.removeItem('ax_h4u_imported_dates')
    localStorage.removeItem('ax_h4u_staff_invites')
    localStorage.removeItem('ax_h4u_trip_categories')
    localStorage.removeItem('ax_h4u_executor_categories')
    localStorage.setItem(CLEANUP_KEY, 'true')
  }
}

const getStoredTripCategories = () => {
  if (typeof window === 'undefined') return DEFAULT_TRIP_CATEGORIES
  try {
    const raw = localStorage.getItem('ax_h4u_trip_categories')
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_TRIP_CATEGORIES
}

const getStoredExecutorCategories = () => {
  if (typeof window === 'undefined') return DEFAULT_EXECUTOR_CATEGORIES
  try {
    const raw = localStorage.getItem('ax_h4u_executor_categories')
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_EXECUTOR_CATEGORIES
}

const getStoredTripDefinitions = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ax_h4u_trip_definitions')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const seen = new Set()
        const unique = []
        for (const item of parsed) {
          const key = (item.sheet_name || item.display_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
          if (key && !seen.has(key)) {
            seen.add(key)
            unique.push(item)
          }
        }
        return unique
      }
    }
  } catch {}
  return []
}

const getStoredExecutors = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('ax_h4u_executors')
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
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
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((u) => u.id || u.email))
        const missing = DEFAULT_SYSTEM_USERS.filter((u) => !existingIds.has(u.id) && !existingIds.has(u.email))
        return [...parsed, ...missing]
      }
    }
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
  syncStatus: {
    isSyncing: false,
    progress: 0,
    pendingCount: 0,
    message: ''
  },
  setSyncStatus: (status) =>
    set((state) => ({
      syncStatus: { ...state.syncStatus, ...status }
    })),

  // Data Stores
  tripCategories: getStoredTripCategories(),
  executorCategories: getStoredExecutorCategories(),
  executors: getStoredExecutors(),
  tripDefinitions: getStoredTripDefinitions(),
  bookings: getStoredBookings(),
  expenses: getStoredExpenses(),
  importedDates: getStoredImportedDates(),
  wipeAllData: () => {
    const currentProfile = get().profile
    const baseUsers = [...DEFAULT_SYSTEM_USERS]
    if (currentProfile && !baseUsers.some((u) => u.id === currentProfile.id || u.email?.toLowerCase() === currentProfile.email?.toLowerCase())) {
      baseUsers.push(currentProfile)
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ax_h4u_staff_invites')
      localStorage.removeItem('ax_h4u_bookings')
      localStorage.removeItem('ax_h4u_expenses')
      localStorage.removeItem('ax_h4u_imported_dates')
      localStorage.removeItem('ax_h4u_trip_definitions')
      localStorage.removeItem('ax_h4u_executors')
      localStorage.removeItem('ax_h4u_trip_categories')
      localStorage.removeItem('ax_h4u_executor_categories')
      localStorage.setItem('ax_h4u_system_users', JSON.stringify(baseUsers))
    }
    clearOfflineQueue().catch(() => {})
    cloudWipeAll().catch(() => {})
    set(() => ({
      tripCategories: DEFAULT_TRIP_CATEGORIES,
      executorCategories: DEFAULT_EXECUTOR_CATEGORIES,
      bookings: [],
      expenses: [],
      importedDates: {},
      tripDefinitions: [],
      executors: [],
      selectedDate: getTodayIsoDate(),
      systemUsers: baseUsers,
      staffInvites: []
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
    cloudSaveSettings('staff_invites', next)
    set({ staffInvites: next })
  },

  deleteStaffInvite: (token) => {
    const prev = get().staffInvites || []
    const next = prev.filter((i) => i.token !== token)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_staff_invites', JSON.stringify(next))
    }
    cloudSaveSettings('staff_invites', next)
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
    cloudSaveSettings('system_users', next)
    set({ systemUsers: next })
  },

  updateSystemUser: (id, fields) => {
    const prev = get().systemUsers || []
    const next = prev.map((u) => (u.id === id ? { ...u, ...fields } : u))
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_system_users', JSON.stringify(next))
    }
    cloudSaveSettings('system_users', next)
    set({ systemUsers: next })
  },

  deleteSystemUser: (id) => {
    const prev = get().systemUsers || []
    const next = prev.filter((u) => u.id !== id)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_system_users', JSON.stringify(next))
    }
    cloudSaveSettings('system_users', next)
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
    cloudSaveSettings('system_users', next)
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
  isMasterModalOpen: false,
  openPushModal: () => set({ isPushModalOpen: true }),
  closePushModal: () => set({ isPushModalOpen: false }),
  openPwaInstallModal: () => set({ isPwaInstallModalOpen: true }),
  closePwaInstallModal: () => set({ isPwaInstallModalOpen: false }),
  openMasterModal: () => set({ isMasterModalOpen: true }),
  closeMasterModal: () => set({ isMasterModalOpen: false }),

  // Trip Definitions Actions
  addTripDefinition: (def) => {
    cloudSaveTrip(def)
    set((state) => {
      const cleanSheet = (def.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
      const existingIdx = state.tripDefinitions.findIndex((td) => {
        const sName = (td.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
        return (def.id && td.id === def.id) || (cleanSheet && sName === cleanSheet)
      })

      let newDefs
      if (existingIdx >= 0) {
        newDefs = state.tripDefinitions.map((td, idx) =>
          idx === existingIdx ? { ...td, ...def } : td
        )
      } else {
        newDefs = [...state.tripDefinitions, def]
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(newDefs))
      }
      return { tripDefinitions: newDefs }
    })
  },

  updateTripDefinition: (id, updatedFields) => {
    const existing = get().tripDefinitions.find((t) => t.id === id)
    const updatedDef = existing ? { ...existing, ...updatedFields } : updatedFields
    if (existing) {
      cloudSaveTrip(updatedDef)
    }
    const newDefs = get().tripDefinitions.map((td) =>
      td.id === id ? updatedDef : td
    )
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(newDefs))
    }

    const targetSheet = (updatedDef.sheet_name || updatedDef.display_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
    const { executors, bookings } = get()
    let bookingsChanged = false
    const updatedBookings = bookings.map((b) => {
      const bTrip = (b.trip || '').toLowerCase().trim().replace(/\s+/g, ' ')
      if (bTrip === targetSheet) {
        bookingsChanged = true
        const fin = computeBookingFinancials(b, newDefs, executors)
        const recalculated = { ...b, ...fin }
        cloudSaveBooking(recalculated)
        return recalculated
      }
      return b
    })

    if (bookingsChanged && typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_bookings', JSON.stringify(updatedBookings))
    }

    set({
      tripDefinitions: newDefs,
      ...(bookingsChanged ? { bookings: updatedBookings } : {})
    })
  },

  reconcileUnpricedTrips: () => {
    const { bookings, tripDefinitions } = get()
    if (!bookings || bookings.length === 0) return
    const existingKeys = new Set(
      tripDefinitions.map((t) => (t.sheet_name || t.display_name || '').toLowerCase().trim().replace(/\s+/g, ' '))
    )
    const missing = []
    bookings.forEach((b) => {
      const rawName = (b.trip || '').trim()
      const cleanKey = rawName.toLowerCase().replace(/\s+/g, ' ')
      if (cleanKey && !existingKeys.has(cleanKey)) {
        existingKeys.add(cleanKey)
        const safeId = 'trip_orphan_' + Math.abs(cleanKey.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0))
        missing.push({
          id: safeId,
          display_name: rawName,
          sheet_name: rawName,
          category: 'بحرية',
          adult_cost: 0,
          child_cost: 0,
          adult_sell: 0,
          child_sell: 0,
          currency: 'EUR',
          active: true,
          is_unpriced: true
        })
      }
    })
    if (missing.length > 0) {
      missing.forEach((d) => cloudSaveTrip(d))
      const merged = [...tripDefinitions, ...missing]
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(merged))
      }
      set({ tripDefinitions: merged })
    }
  },

  batchAddTripDefinitions: (defs) => {
    defs.forEach((d) => cloudSaveTrip(d))
    set((state) => {
      let currentDefs = [...state.tripDefinitions]
      defs.forEach((def) => {
        const cleanSheet = (def.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
        const existingIdx = currentDefs.findIndex((td) => {
          const sName = (td.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
          return (def.id && td.id === def.id) || (cleanSheet && sName === cleanSheet)
        })
        if (existingIdx >= 0) {
          currentDefs[existingIdx] = { ...currentDefs[existingIdx], ...def }
        } else {
          currentDefs.push(def)
        }
      })
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(currentDefs))
      }
      return { tripDefinitions: currentDefs }
    })
  },

  deleteTripDefinition: (id) => {
    cloudDeleteTrip(id)
    set((state) => {
      const newDefs = state.tripDefinitions.filter((td) => td.id !== id)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(newDefs))
      }
      return { tripDefinitions: newDefs }
    })
  },

  // Category Actions
  addTripCategory: (cat) => set((state) => {
    const id = cat.id || 'cat_' + Date.now()
    const label = (cat.label || cat.name || '').trim()
    if (!label) return state
    const next = [...state.tripCategories, { id, label }]
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_trip_categories', JSON.stringify(next))
    }
    cloudSaveSettings('trip_categories', next)
    return { tripCategories: next }
  }),

  updateTripCategory: (id, newLabel) => set((state) => {
    const label = (newLabel || '').trim()
    if (!label) return state
    const next = state.tripCategories.map((c) => (c.id === id ? { ...c, label } : c))
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_trip_categories', JSON.stringify(next))
    }
    cloudSaveSettings('trip_categories', next)
    return { tripCategories: next }
  }),

  deleteTripCategory: (id) => set((state) => {
    const next = state.tripCategories.filter((c) => c.id !== id)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_trip_categories', JSON.stringify(next))
    }
    cloudSaveSettings('trip_categories', next)
    return { tripCategories: next }
  }),

  addExecutorCategory: (name) => set((state) => {
    const clean = (name || '').trim()
    if (!clean || state.executorCategories.includes(clean)) return state
    const next = [...state.executorCategories, clean]
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_executor_categories', JSON.stringify(next))
    }
    cloudSaveSettings('executor_categories', next)
    return { executorCategories: next }
  }),

  updateExecutorCategory: (oldName, newName) => set((state) => {
    const clean = (newName || '').trim()
    if (!clean) return state
    const next = state.executorCategories.map((c) => (c === oldName ? clean : c))
    const updatedExecutors = state.executors.map((ex) => (ex.category === oldName ? { ...ex, category: clean } : ex))
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_executor_categories', JSON.stringify(next))
      localStorage.setItem('ax_h4u_executors', JSON.stringify(updatedExecutors))
    }
    cloudSaveSettings('executor_categories', next)
    return { executorCategories: next, executors: updatedExecutors }
  }),

  deleteExecutorCategory: (name) => set((state) => {
    const next = state.executorCategories.filter((c) => c !== name)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_executor_categories', JSON.stringify(next))
    }
    cloudSaveSettings('executor_categories', next)
    return { executorCategories: next }
  }),

  // Executors Actions
  addExecutor: (executor) => {
    cloudSaveExecutor(executor)
    set((state) => {
      const next = [...state.executors, executor]
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
      }
      return { executors: next }
    })
  },

  updateExecutor: (id, updatedFields) => {
    const existing = get().executors.find((e) => e.id === id)
    if (existing) {
      cloudSaveExecutor({ ...existing, ...updatedFields })
    }
    set((state) => {
      const next = state.executors.map((ex) => (ex.id === id ? { ...ex, ...updatedFields } : ex))
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
      }
      return { executors: next }
    })
  },

  deleteExecutor: (id) => {
    cloudDeleteExecutor(id)
    set((state) => {
      const next = state.executors.filter((ex) => ex.id !== id)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
      }
      return { executors: next }
    })
  },

  recordExecutorPayment: (id, payment) => {
    const isObj = typeof payment === 'object' && payment !== null
    const amt = isObj ? Number(payment.amount) || 0 : Number(payment) || 0
    const currency = isObj ? payment.currency || 'EUR' : 'EUR'
    const notes = isObj ? payment.notes || '' : ''
    const date = isObj ? payment.date || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

    let updatedEx = null
    set((state) => {
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
        updatedEx = {
          ...ex,
          total_paid: (ex.total_paid || 0) + amt,
          payments: [newPaymentRecord, ...prevPayments]
        }
        return updatedEx
      })

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
      }
      return { executors: next }
    })
    if (updatedEx) {
      cloudSaveExecutor(updatedEx)
    }
  },

  // Operational Expenses Actions
  addExpense: (expense) => {
    const newExpense = {
      ...expense,
      id: expense.id || 'exp_' + Date.now(),
      date: expense.date || new Date().toISOString().split('T')[0]
    }
    cloudSaveExpense(newExpense)
    set((state) => {
      const next = [newExpense, ...state.expenses]
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_expenses', JSON.stringify(next))
      }
      return { expenses: next }
    })
  },

  deleteExpense: (id) => {
    cloudDeleteExpense(id)
    set((state) => {
      const next = state.expenses.filter((e) => e.id !== id)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_expenses', JSON.stringify(next))
      }
      return { expenses: next }
    })
  },

  // Bookings Actions
  addBooking: (booking) => {
    const { tripDefinitions, executors, bookings } = get()
    const fin = computeBookingFinancials(booking, tripDefinitions, executors)
    const newBooking = { ...booking, ...fin }
    cloudSaveBooking(newBooking)
    const next = [newBooking, ...bookings]
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
    }
    set({ bookings: next })
  },

  updateBooking: (sr, updatedFields) => {
    const { tripDefinitions, executors, bookings } = get()
    let updatedBooking = null
    const nowIso = new Date().toISOString()
    const next = bookings.map((b) => {
      if (b.sr === sr) {
        const merged = {
          ...b,
          ...updatedFields,
          is_edited: true,
          time: `EDITED:${nowIso}`
        }
        const fin = computeBookingFinancials(merged, tripDefinitions, executors)
        updatedBooking = { ...merged, ...fin }
        return updatedBooking
      }
      return b
    })
    if (updatedBooking) {
      cloudSaveBooking(updatedBooking)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
    }
    set({ bookings: next })
  },

  deleteBooking: (sr) => {
    cloudDeleteBooking(sr)
    set((state) => {
      const next = state.bookings.filter((b) => b.sr !== sr)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
      }
      return { bookings: next }
    })
  },

  importExcelBatch: ({ date, filename, rawBookings, overwrite = false }) => {
    const { tripDefinitions, executors, bookings, importedDates } = get()

    let currentDefs = [...tripDefinitions]
    let defsAdded = false
    const defKeys = new Set(
      currentDefs.map((td) => (td.sheet_name || td.display_name || '').toLowerCase().trim().replace(/\s+/g, ' '))
    )

    rawBookings.forEach((b) => {
      const tName = (b.trip || '').trim()
      const tKey = tName.toLowerCase().replace(/\s+/g, ' ')
      if (tKey && !defKeys.has(tKey)) {
        defKeys.add(tKey)
        defsAdded = true
        const safeId = 'trip_auto_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
        const unpricedDef = {
          id: safeId,
          display_name: tName,
          sheet_name: tName,
          category: 'بحرية',
          adult_cost: 0,
          child_cost: 0,
          adult_sell: 0,
          child_sell: 0,
          currency: 'EUR',
          active: true,
          is_unpriced: true
        }
        currentDefs.push(unpricedDef)
        cloudSaveTrip(unpricedDef)
      }
    })

    if (defsAdded && typeof localStorage !== 'undefined') {
      localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(currentDefs))
    }

    const calculated = rawBookings.map((b) => {
      const fin = computeBookingFinancials(b, currentDefs, executors)
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

    cloudSaveBatch(date, filename, calculated, overwrite)

    set({
      bookings: nextBookings,
      selectedDate: date,
      importedDates: nextImportedDates,
      ...(defsAdded ? { tripDefinitions: currentDefs } : {})
    })
  }
}))
