import React, { useState, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Building,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  Power,
  Sliders,
  Database,
  Building2,
  CheckCircle2,
  Plus,
  AlertTriangle,
  Lock,
  Sparkles,
  Server,
  Zap,
  Globe
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { PRESET_ROLES, STAFF_MODULES } from '../../utils/staffPermissionsConfig'
import { AX_StaffPermissionsModal } from './AX_StaffPermissionsModal'
import { AX_EmployeeModal } from './AX_EmployeeModal'

export function AX_StaffManager({ defaultTab = 'staff' }) {
  const {
    systemUsers = [],
    maxUsers = 15,
    setMaxUsers,
    deleteSystemUser,
    toggleSystemUserStatus,
    warehouses = [],
    maxWarehouses = 10,
    setMaxWarehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    bookings = [],
    importedDates = {},
    wipeAllData,
    openConfirmModal,
    profile,
    lang,
    t
  } = useAXStore()

  const isRtl = lang === 'ar'

  const isMaster =
    profile?.is_master === true ||
    profile?.role === 'Super Admin' ||
    profile?.email === 'axsonid@gmail.com' ||
    profile?.email === 'axonid@gmail.com'

  const [activeMainTab, setActiveMainTab] = useState(defaultTab) // 'staff' | 'control'

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState(null)

  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [userForPermissions, setUserForPermissions] = useState(null)

  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false)
  const [whName, setWhName] = useState('')
  const [whCode, setWhCode] = useState('')
  const [whLocation, setWhLocation] = useState('')
  const [whCapacity, setWhCapacity] = useState('100')
  const [whManager, setWhManager] = useState('')
  const [whPhone, setWhPhone] = useState('')

  const visibleStaff = useMemo(() => {
    return systemUsers.filter(
      (u) =>
        !u.is_master &&
        u.role !== 'Super Admin' &&
        u.email !== 'axsonid@gmail.com' &&
        u.email !== 'axonid@gmail.com'
    )
  }, [systemUsers])

  const filteredStaff = useMemo(() => {
    return visibleStaff.filter((emp) => {
      if (roleFilter !== 'ALL' && emp.role !== roleFilter) return false
      if (statusFilter !== 'ALL' && emp.status !== statusFilter) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      return (
        (emp.name || '').toLowerCase().includes(q) ||
        (emp.email || '').toLowerCase().includes(q) ||
        (emp.phone || '').includes(q) ||
        (emp.code || '').toLowerCase().includes(q) ||
        (emp.branch || '').toLowerCase().includes(q)
      )
    })
  }, [visibleStaff, roleFilter, statusFilter, searchQuery])

  const activeCount = visibleStaff.filter((e) => e.status === 'active').length
  const sellersCount = visibleStaff.filter((e) => e.role === 'Seller').length
  const isQuotaFull = visibleStaff.length >= maxUsers

  const handleOpenAddEmployee = () => {
    soundManager.playClick()
    setUserToEdit(null)
    setIsEmployeeModalOpen(true)
  }

  const handleOpenEditEmployee = (emp) => {
    soundManager.playClick()
    setUserToEdit(emp)
    setIsEmployeeModalOpen(true)
  }

  const handleOpenPermissions = (emp) => {
    soundManager.playClick()
    setUserForPermissions(emp)
    setIsPermissionsModalOpen(true)
  }

  const handleDeleteEmployee = (emp) => {
    openConfirmModal({
      title: isRtl ? 'حذف حساب الموظف' : 'Delete Employee',
      message: isRtl
        ? `هل أنت متأكد من حذف حساب الموظف (${emp.name}) نهائياً من المنظومة؟`
        : `Are you sure you want to delete (${emp.name})?`,
      confirmText: isRtl ? 'نعم، حذف الحساب' : 'Delete',
      cancelText: t('cancel'),
      type: 'danger',
      onConfirm: () => {
        soundManager.playTrash()
        deleteSystemUser(emp.id)
      }
    })
  }

  const handleToggleStatus = (emp) => {
    soundManager.playClick()
    toggleSystemUserStatus(emp.id)
  }

  const handleWipeDatabase = () => {
    openConfirmModal({
      title: t('wipe_confirm_title'),
      message: t('wipe_confirm_msg'),
      confirmText: t('wipe_confirm_btn'),
      cancelText: t('cancel'),
      type: 'danger',
      onConfirm: () => {
        soundManager.playTrash()
        wipeAllData()
      }
    })
  }

  const handleCreateWarehouse = (e) => {
    e.preventDefault()
    if (!whName.trim()) return

    soundManager.playSuccess()
    addWarehouse({
      name: whName.trim(),
      code: whCode.trim() || 'MAR-' + Math.floor(10 + Math.random() * 90),
      location: whLocation.trim() || 'الغردقة',
      capacity: Number(whCapacity) || 100,
      manager: whManager.trim() || 'مسؤول التشغيل',
      phone: whPhone.trim() || '',
      status: 'active'
    })

    setWhName('')
    setWhCode('')
    setWhLocation('')
    setWhCapacity('100')
    setWhManager('')
    setWhPhone('')
    setIsAddWhModalOpen(false)
  }

  const handleDeleteWarehouse = (wh) => {
    openConfirmModal({
      title: isRtl ? 'حذف الفرع / نقطة الانطلاق' : 'Delete Branch',
      message: isRtl
        ? `هل تريد حذف (${wh.name})؟ هذا الإجراء لا يمكن التراجع عنه.`
        : `Are you sure you want to delete (${wh.name})?`,
      confirmText: isRtl ? 'نعم، حذف' : 'Delete',
      cancelText: t('cancel'),
      type: 'danger',
      onConfirm: () => {
        soundManager.playTrash()
        deleteWarehouse(wh.id)
      }
    })
  }

  return (
    <div className="w-full space-y-4 pb-20 lg:pb-6 animate-fadeIn">
      {/* Main Tab Switcher (Visible to Master only) */}
      {isMaster && (
        <div className="bg-white p-2 rounded-3xl border border-slate-200/90 shadow-soft flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                soundManager.playClick()
                setActiveMainTab('staff')
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${
                activeMainTab === 'staff'
                  ? 'bg-[#0a2540] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-sky-300" />
              <span>{isRtl ? 'سجل الموظفين والصلاحيات' : 'Staff Directory & Permissions'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
                {visibleStaff.length}
              </span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick()
                setActiveMainTab('control')
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${
                activeMainTab === 'control'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-900" />
              <span>{isRtl ? 'غرفة تحكم المنظومة والتراخيص' : 'Master Control Room'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-900/15 font-mono font-black">
                👑
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/60 text-[11px] font-black text-amber-800">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isRtl ? 'صلاحية المالك السيادية' : 'Owner Super Authority'}</span>
          </div>
        </div>
      )}

      {/* ================= TAB 1: STAFF & PERMISSIONS ================= */}
      {activeMainTab === 'staff' && (
        <div className="space-y-4">
          {/* Bento Stats Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full">
            <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isRtl ? 'إجمالي فريق العمل' : 'Total Staff'}
                </span>
                <div className="flex items-baseline gap-1 mt-1 whitespace-nowrap">
                  <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                    {visibleStaff.length}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isRtl ? 'موظف' : 'staff'}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 border border-sky-100">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isRtl ? 'حسابات نشطة' : 'Active Accounts'}
                </span>
                <div className="flex items-baseline gap-1 mt-1 whitespace-nowrap">
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
                    {activeCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isRtl ? 'نشط' : 'active'}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isRtl ? 'مناديب المبيعات' : 'Sellers'}
                </span>
                <div className="flex items-baseline gap-1 mt-1 whitespace-nowrap">
                  <span className="text-xl sm:text-2xl font-black font-mono text-indigo-700">
                    {sellersCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isRtl ? 'مندوب' : 'sellers'}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-soft flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">
                  {isRtl ? 'استهلاك التراخيص' : 'Quota Usage'}
                </span>
                <div className="flex items-baseline gap-1 mt-1 whitespace-nowrap">
                  <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                    {visibleStaff.length}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    / {maxUsers}
                  </span>
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                  isQuotaFull
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <Sliders className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar & Action Header */}
          <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isRtl
                      ? 'بحث بالاسم، الإيميل، الهاتف، الكود...'
                      : 'Search name, email, phone, code...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pe-4 ps-10 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-2.5 pointer-events-none" />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="ALL">{isRtl ? 'كافة الأدوار' : 'All Roles'}</option>
                {Object.keys(PRESET_ROLES).map((key) => (
                  <option key={key} value={key}>
                    {isRtl ? PRESET_ROLES[key].title : PRESET_ROLES[key].titleEn}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="ALL">{isRtl ? 'كافة الحالات' : 'All Status'}</option>
                <option value="active">{isRtl ? 'نشط فقط' : 'Active Only'}</option>
                <option value="inactive">{isRtl ? 'معطل فقط' : 'Inactive Only'}</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddEmployee}
              disabled={isQuotaFull}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex-shrink-0 ${
                isQuotaFull
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#0a2540] hover:bg-[#133e66] text-white shadow-sky-950/20'
              }`}
            >
              <UserPlus className="w-4 h-4 text-sky-300" />
              <span>{isRtl ? 'إضافة موظف جديد' : 'Add Employee'}</span>
            </button>
          </div>

          {/* Desktop Table: Single-line row geometry */}
          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-black h-11">
                    <th className="px-4 text-start">{isRtl ? 'الموظف والكود' : 'Staff'}</th>
                    <th className="px-4 text-start">{isRtl ? 'التواصل' : 'Contact'}</th>
                    <th className="px-4 text-start">{isRtl ? 'الدور الوظيفي' : 'Role'}</th>
                    <th className="px-4 text-start">{isRtl ? 'الفرع / الموقع' : 'Branch'}</th>
                    <th className="px-4 text-start">{isRtl ? 'صلاحيات الشاشات' : 'Permissions'}</th>
                    <th className="px-4 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        {isRtl ? 'لا يوجد موظفين مطابقين للبحث' : 'No staff found'}
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((emp) => {
                      const roleConfig = PRESET_ROLES[emp.role] || PRESET_ROLES['Staff']
                      const isActive = emp.status === 'active'
                      const grantedCount = Object.values(emp.permissions || {}).filter(Boolean).length

                      return (
                        <tr
                          key={emp.id}
                          className="hover:bg-sky-50/30 transition-colors h-12"
                        >
                          <td className="px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-900 text-sky-300 flex items-center justify-center font-black text-xs flex-shrink-0">
                                {emp.name?.charAt(0) || 'U'}
                              </div>
                              <div className="min-w-0">
                                <span className="font-black text-slate-900 truncate block">
                                  {emp.name}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-sky-700 block">
                                  {emp.code || 'EMP'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4">
                            <div className="space-y-0.5">
                              <span className="font-mono text-[11px] text-slate-700 block">
                                {emp.email}
                              </span>
                              {emp.phone && (
                                <span className="font-mono text-[10px] text-slate-400 block">
                                  {emp.phone}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${roleConfig.color}`}
                            >
                              <span>{isRtl ? roleConfig.title : roleConfig.titleEn}</span>
                            </span>
                          </td>

                          <td className="px-4">
                            <span className="text-[11px] text-slate-600 truncate block max-w-[150px]">
                              {emp.branch || 'كافة الفروع'}
                            </span>
                          </td>

                          <td className="px-4">
                            <button
                              onClick={() => handleOpenPermissions(emp)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-black transition-all active:scale-95"
                              title={isRtl ? 'تعديل الصلاحيات' : 'Edit Permissions'}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                              <span>
                                {isRtl
                                  ? `${grantedCount} موديولات`
                                  : `${grantedCount} modules`}
                              </span>
                            </button>
                          </td>

                          <td className="px-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(emp)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-500 border border-slate-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                }`}
                              />
                              <span>{isActive ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'موقوف' : 'Inactive')}</span>
                            </button>
                          </td>

                          <td className="px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenPermissions(emp)}
                                title={isRtl ? 'تعديل الصلاحيات' : 'Permissions'}
                                className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-full transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditEmployee(emp)}
                                title={isRtl ? 'تعديل البيانات' : 'Edit'}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp)}
                                title={isRtl ? 'حذف الحساب' : 'Delete'}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
            {filteredStaff.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs font-bold">
                {isRtl ? 'لا يوجد موظفين مطابقين للبحث' : 'No staff found'}
              </div>
            ) : (
              filteredStaff.map((emp) => {
                const roleConfig = PRESET_ROLES[emp.role] || PRESET_ROLES['Staff']
                const isActive = emp.status === 'active'
                const grantedCount = Object.values(emp.permissions || {}).filter(Boolean).length

                return (
                  <div
                    key={emp.id}
                    className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-soft space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-sky-300 flex items-center justify-center font-black text-sm flex-shrink-0">
                          {emp.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {emp.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-sky-700">
                            {emp.code || 'EMP'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {isActive ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'موقوف' : 'Inactive')}
                      </button>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">{isRtl ? 'الدور:' : 'Role:'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${roleConfig.color}`}>
                          {isRtl ? roleConfig.title : roleConfig.titleEn}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">{isRtl ? 'الفرع:' : 'Branch:'}</span>
                        <span className="font-bold text-slate-700 truncate max-w-[170px]">
                          {emp.branch}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">{isRtl ? 'الإيميل:' : 'Email:'}</span>
                        <span className="font-mono text-slate-600 text-[10px]">{emp.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleOpenPermissions(emp)}
                        className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-[11px] font-black transition-all flex items-center justify-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                        <span>{isRtl ? `الصلاحيات (${grantedCount})` : `Permissions (${grantedCount})`}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditEmployee(emp)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all"
                        title={isRtl ? 'تعديل البيانات' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteEmployee(emp)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full transition-all"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: OWNER MASTER CONTROL ROOM ================= */}
      {isMaster && activeMainTab === 'control' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Master Sentinel Ribbon */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#031322] via-[#082038] to-[#0a2540] text-white p-5 border border-amber-500/30 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>AXONID MASTER CONTROL ROOM</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {isRtl ? 'إدارة التراخيص والتصفير الشامل' : 'License & Database Governance'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isRtl ? 'غرفة تحكم المنظومة والتراخيص' : 'Master System & License Room'}
                </h2>
                <p className="text-xs text-slate-300 font-bold">
                  {isRtl
                    ? 'تعديل سعة المستخدمين، عدد المخازن والفروع المسموحة، وتصفير قاعدة البيانات لبدء شيت جديد'
                    : 'Manage user quota, marina locations, and reset database'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleWipeDatabase}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full text-xs font-black shadow-lg shadow-rose-950/30 transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4 text-rose-200" />
                  <span>{isRtl ? 'تصفير ومسح كافة البيانات' : 'Wipe All Data'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Master Quota Adjustments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      {isRtl ? 'الحد الأقصى للمستخدمين المرخصين' : 'Max Allowed Users'}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {isRtl ? `المستخدم حالياً: ${visibleStaff.length}` : `Current: ${visibleStaff.length}`}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-black text-xl text-sky-800">{maxUsers}</span>
              </div>

              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={maxUsers}
                onChange={(e) => setMaxUsers(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>5</span>
                <span>25</span>
                <span>50 {isRtl ? 'مستخدم' : 'users'}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      {isRtl ? 'الحد الأقصى لنقاط الانطلاق والمخازن' : 'Max Allowed Marina / Hubs'}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {isRtl ? `المستخدم حالياً: ${warehouses.length}` : `Current: ${warehouses.length}`}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-black text-xl text-amber-800">{maxWarehouses}</span>
              </div>

              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={maxWarehouses}
                onChange={(e) => setMaxWarehouses(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>2</span>
                <span>15</span>
                <span>30 {isRtl ? 'مارينا/مخزن' : 'hubs'}</span>
              </div>
            </div>
          </div>

          {/* Warehouses / Marina Hubs Management */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-sky-700" />
                <h3 className="text-sm font-black text-slate-900">
                  {isRtl ? 'نقاط الانطلاق والمخازن المسجلة' : 'Marina Hubs & Branches'}
                </h3>
                <span className="text-xs font-mono font-bold text-slate-400">
                  ({warehouses.length} / {maxWarehouses})
                </span>
              </div>

              <button
                onClick={() => {
                  soundManager.playClick()
                  setIsAddWhModalOpen(true)
                }}
                disabled={warehouses.length >= maxWarehouses}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all ${
                  warehouses.length >= maxWarehouses
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#0a2540] hover:bg-[#133e66] text-white shadow-sm'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-sky-300" />
                <span>{isRtl ? 'إضافة فرع / مارينا' : 'Add Marina / Branch'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {warehouses.map((wh) => (
                <div
                  key={wh.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {wh.name}
                      </span>
                      <span className="text-[10px] font-mono font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                        {wh.code}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">
                      {wh.location} • {isRtl ? `السعة: ${wh.capacity} فرد` : `Capacity: ${wh.capacity}`}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteWarehouse(wh)}
                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-full transition-colors flex-shrink-0"
                    title={isRtl ? 'حذف الفرع' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Database Governance Block */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-600" />
              <span>{isRtl ? 'تصفير الحجوزات وبدء شيت جديد' : 'Wipe Data & Reset'}</span>
            </h3>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-rose-900">
                  {isRtl ? 'مسح وتصفير كافة البيانات لبدء تجربة جديدة' : 'Wipe all current bookings'}
                </h4>
                <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                  {isRtl
                    ? `يمسح كافة الحجوزات الحالية (${bookings.length} حجز) والمصاريف وسجلات الاستيراد السابقة، ويترك المنظومة نظيفة 100%.`
                    : `Permanently deletes all ${bookings.length} bookings to start fresh with a new Excel sheet.`}
                </p>
              </div>

              <button
                onClick={handleWipeDatabase}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex-shrink-0"
              >
                {isRtl ? 'تصفير كافة البيانات الآن' : 'Wipe All Data Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Edit Modal */}
      <AX_StaffPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false)
          setUserForPermissions(null)
        }}
        user={userForPermissions}
      />

      {/* Employee Add/Edit Info Modal */}
      <AX_EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false)
          setUserToEdit(null)
        }}
        userToEdit={userToEdit}
      />

      {/* New Marina / Branch Modal */}
      {isAddWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <h3 className="text-sm font-black text-slate-900 mb-3">
              {isRtl ? 'إضافة فرع / مارينا جديد' : 'Add New Branch / Marina'}
            </h3>
            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-start">
              <input
                type="text"
                required
                value={whName}
                onChange={(e) => setWhName(e.target.value)}
                placeholder={isRtl ? 'اسم المارينا أو نقطة الانطلاق' : 'Marina name'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800"
              />
              <input
                type="text"
                value={whLocation}
                onChange={(e) => setWhLocation(e.target.value)}
                placeholder={isRtl ? 'الموقع الجغرافي (مثال: الجونة / مارينا)' : 'Location'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800"
              />
              <input
                type="number"
                value={whCapacity}
                onChange={(e) => setWhCapacity(e.target.value)}
                placeholder={isRtl ? 'السعة الاستيعابية (فرد)' : 'Capacity'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800"
              />
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0a2540] text-white rounded-full text-xs font-black"
                >
                  {isRtl ? 'حفظ الفرع' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddWhModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
