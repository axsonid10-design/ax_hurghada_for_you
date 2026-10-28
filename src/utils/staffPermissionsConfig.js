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
      can_edit_prices: false,
      can_delete_bookings: false
    }
  }
}
