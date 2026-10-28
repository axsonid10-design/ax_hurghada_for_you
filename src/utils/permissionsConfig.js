import {
  LayoutDashboard,
  Ship,
  CalendarCheck,
  Tag,
  Truck,
  Banknote,
  BarChart3
} from 'lucide-react'

export const STAFF_MODULES = [
  {
    id: 'dashboard',
    label: 'الرئيسية والمؤشرات',
    labelEn: 'Dashboard & Metrics',
    icon: LayoutDashboard,
    description: 'عرض إحصائيات التشغيل والتحصيلات والمبيعات'
  },
  {
    id: 'daily',
    label: 'الوضع اليومي واليخوت',
    labelEn: 'Daily Situation & Boats',
    icon: Ship,
    description: 'متابعة حركات اليومية وسعة المراكب وتوزيع الأفراد'
  },
  {
    id: 'bookings',
    label: 'كشف وإدارة الحجوزات',
    labelEn: 'Bookings Management',
    icon: CalendarCheck,
    description: 'تسجيل وتعديل الحجوزات وتحصيل المبالغ'
  },
  {
    id: 'trips',
    label: 'دليل الرحلات والأسعار',
    labelEn: 'Trips & Pricing',
    icon: Tag,
    description: 'تحديد أسعار البيع والتكلفة لكل رحلة'
  },
  {
    id: 'executors',
    label: 'المنفذين والتوريد',
    labelEn: 'Executors & Suppliers',
    icon: Truck,
    description: 'متابعة مستحقات الموردين ومطالبات التصفية'
  },
  {
    id: 'cash',
    label: 'الخزينة والعملات',
    labelEn: 'Cash Drawer',
    icon: Banknote,
    description: 'رصد الخزينة بـ 4 عملات ومتابعة التحصيل'
  },
  {
    id: 'reports',
    label: 'تقارير الأداء والأرباح',
    labelEn: 'Performance Reports',
    icon: BarChart3,
    description: 'كشوف الأرباح وإحصائيات الرحلات'
  }
]

export const AVAILABLE_ROLES = {
  'مدير عام': {
    title: 'مدير عام',
    titleEn: 'General Manager',
    color: 'bg-sky-50 text-sky-800 border-sky-300',
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
  'مندوب مبيعات': {
    title: 'مندوب مبيعات',
    titleEn: 'Sales Representative',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    permissions: {
      dashboard: true,
      daily: true,
      bookings: true,
      trips: false,
      executors: false,
      cash: false,
      reports: false,
      staff: false,
      can_edit_prices: false,
      can_delete_bookings: false
    }
  }
}

export function hasModuleAccess(user, moduleId) {
  if (!user) return true

  if (
    user.is_master === true ||
    user.role === 'Super Admin' ||
    user.role === 'مدير عام' ||
    user.role === 'General Manager' ||
    user.role === 'Operations Director' ||
    user.email === 'axsonid@gmail.com' ||
    user.email === 'axonid@gmail.com' ||
    !user.role
  ) {
    return true
  }

  if (user.status === 'inactive') {
    return false
  }

  if (moduleId === 'staff' || moduleId === 'admin') {
    return (
      user.role === 'مدير عام' ||
      user.role === 'General Manager' ||
      user.role === 'Super Admin' ||
      Boolean(user.permissions?.staff)
    )
  }

  if (user.permissions && typeof user.permissions[moduleId] === 'boolean') {
    return user.permissions[moduleId]
  }

  const roleConfig = AVAILABLE_ROLES[user.role]
  if (roleConfig?.permissions && typeof roleConfig.permissions[moduleId] === 'boolean') {
    return roleConfig.permissions[moduleId]
  }

  return true
}

export function getFirstAllowedModule(user) {
  const orderedModules = ['dashboard', 'daily', 'bookings', 'trips', 'executors', 'cash', 'reports']
  for (const modId of orderedModules) {
    if (hasModuleAccess(user, modId)) {
      return modId
    }
  }
  return 'dashboard'
}
