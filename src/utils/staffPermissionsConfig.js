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
    description: 'تسجيل وتعديل وتصفير الحجوزات وتحصيل المتبقي'
  },
  {
    id: 'trips',
    label: 'دليل الرحلات والأسعار',
    labelEn: 'Trips & Pricing',
    icon: Tag,
    description: 'تحديد أسعار البيع والتكلفة لكل رحلة ونوع تسعير'
  },
  {
    id: 'executors',
    label: 'المنفذين والتوريد',
    labelEn: 'Executors & Suppliers',
    icon: Truck,
    description: 'متابعة مستحقات الموردين ومطالبات التصفية وسداد الدفعات'
  },
  {
    id: 'cash',
    label: 'الخزينة والعملات',
    labelEn: 'Cash Drawer & Multi-Currency',
    icon: Banknote,
    description: 'رصد الخزينة بـ 4 عملات ومتابعة حركات الـ Cash Pickup'
  },
  {
    id: 'reports',
    label: 'تقارير الأداء والأرباح',
    labelEn: 'Performance & Profit Reports',
    icon: BarChart3,
    description: 'كشوف الأرباح وهوامش المناديب وإحصائيات الرحلات'
  }
]

export const PRESET_ROLES = {
  'Operations Director': {
    title: 'مدير العمليات السياحية',
    titleEn: 'Operations Director',
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
  'Seller': {
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
  },
  'Accountant': {
    title: 'محاسب الخزينة المركزي',
    titleEn: 'Central Cashier & Accountant',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
    permissions: {
      dashboard: true,
      daily: false,
      bookings: true,
      trips: false,
      executors: true,
      cash: true,
      reports: true,
      can_edit_prices: false,
      can_delete_bookings: false
    }
  },
  'Coordinator': {
    title: 'منسق المنفذين والمراكب',
    titleEn: 'Boat & Executor Coordinator',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    permissions: {
      dashboard: true,
      daily: true,
      bookings: true,
      trips: false,
      executors: true,
      cash: false,
      reports: false,
      can_edit_prices: false,
      can_delete_bookings: false
    }
  },
  'Staff': {
    title: 'موظف تشغيل واستقبال',
    titleEn: 'Operations Staff',
    color: 'bg-slate-50 text-slate-700 border-slate-300',
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
