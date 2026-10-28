import { create } from 'zustand'
import { translations } from '../i18n/translations'
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
  bookings: [],
  expenses: [],
  importedDates: {},
  wipeAllData: () => set({ bookings: [], expenses: [], importedDates: {} }),

  maxWarehouses: 10,
  setMaxWarehouses: (val) => set({ maxWarehouses: Number(val) || 10 }),
  warehouses: [
    { id: 'wh_1', name: 'مارينا الغردقة الرئيسي (Main Marina)', code: 'MAR-01', location: 'مارينا الغردقة السياحي', capacity: 150, manager: 'كابتن محمود البحراوي', phone: '01001122334', status: 'active' },
    { id: 'wh_2', name: 'نقطة انطلاق سفاري الصحراء (Safari Hub)', code: 'SAF-02', location: 'طريق المطار - الغردقة', capacity: 80, manager: 'حمزة البدوي', phone: '01229988776', status: 'active' },
    { id: 'wh_3', name: 'مخزن ومارينا الجونة (El Gouna Branch)', code: 'GON-03', location: 'مارينا الجونة الشمالي', capacity: 60, manager: 'كابتن طارق سليم', phone: '01114455667', status: 'active' },
    { id: 'wh_4', name: 'نقطة انطلاق مكادي وسهل حشيش', code: 'MAK-04', location: 'خليج سهل حشيش', capacity: 70, manager: 'حسام نصر', phone: '01099881122', status: 'active' }
  ],
  addWarehouse: (wh) => set((state) => ({
    warehouses: [{ ...wh, id: 'wh_' + Date.now() }, ...state.warehouses]
  })),
  updateWarehouse: (id, fields) => set((state) => ({
    warehouses: state.warehouses.map((w) => (w.id === id ? { ...w, ...fields } : w))
  })),
  deleteWarehouse: (id) => set((state) => ({
    warehouses: state.warehouses.filter((w) => w.id !== id)
  })),

  maxUsers: 15,
  setMaxUsers: (val) => set({ maxUsers: Number(val) || 15 }),
  systemUsers: [
    { id: 'usr_master_axonid', name: 'AXONID Master Admin', email: 'axsonid@gmail.com', role: 'Super Admin', branch: 'كافة الفروع', status: 'active', is_master: true },
    { id: 'usr_ops_director', name: 'مدير العمليات السياحية', email: 'director@hurghada.com', role: 'Operations Director', branch: 'مارينا الغردقة الرئيسي', status: 'active' },
    { id: 'usr_cashier_1', name: 'محاسب الخزينة المركزي', email: 'cashier@hurghada.com', role: 'Accountant', branch: 'مارينا الغردقة الرئيسي', status: 'active' },
    { id: 'usr_seller_1', name: 'Meghane (مندوب مبيعات)', email: 'meghane@hurghada.com', role: 'Seller', branch: 'نقطة انطلاق سفاري الصحراء', status: 'active' },
    { id: 'usr_seller_2', name: 'Laure (مندوب مبيعات)', email: 'laure@hurghada.com', role: 'Seller', branch: 'مخزن ومارينا الجونة', status: 'active' }
  ],
  addSystemUser: (user) => set((state) => ({
    systemUsers: [{ ...user, id: 'usr_' + Date.now() }, ...state.systemUsers]
  })),
  updateSystemUser: (id, fields) => set((state) => ({
    systemUsers: state.systemUsers.map((u) => (u.id === id ? { ...u, ...fields } : u))
  })),
  deleteSystemUser: (id) => set((state) => ({
    systemUsers: state.systemUsers.filter((u) => u.id !== id)
  })),

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

  recordExecutorPayment: (id, payment) => set((state) => {
    const isObj = typeof payment === 'object' && payment !== null
    const amt = isObj ? Number(payment.amount) || 0 : Number(payment) || 0
    const currency = isObj ? payment.currency || 'EUR' : 'EUR'
    const notes = isObj ? payment.notes || '' : ''
    const date = isObj ? payment.date || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

    return {
      executors: state.executors.map((ex) => {
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
    }
  }),

  // Operational Expenses Actions
  addExpense: (expense) => set((state) => ({
    expenses: [
      {
        ...expense,
        id: expense.id || 'exp_' + Date.now(),
        date: expense.date || new Date().toISOString().split('T')[0]
      },
      ...state.expenses
    ]
  })),

  deleteExpense: (id) => set((state) => ({
    expenses: state.expenses.filter((e) => e.id !== id)
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
