import React, { useState, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Sliders,
  Zap,
  Link as LinkIcon,
  Copy,
  Check,
  Share2,
  Clock
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { AVAILABLE_ROLES } from '../../utils/staffPermissionsConfig'
import { AX_StaffPermissionsModal } from './AX_StaffPermissionsModal'
import { AX_StaffInviteModal } from './AX_StaffInviteModal'
import { AX_MasterControlModal } from '../admin/AX_MasterControlModal'

export function AX_StaffManager() {
  const {
    systemUsers = [],
    staffInvites = [],
    deleteStaffInvite,
    maxUsers = 15,
    deleteSystemUser,
    toggleSystemUserStatus,
    openConfirmModal,
    wipeAllData,
    profile,
    lang,
    t
  } = useAXStore()

  const isRtl = lang === 'ar'

  // Rule 2610 #10: Strict Master Control Isolation exclusively for AXONID Email / Master Identity
  const isMaster =
    profile?.email?.toLowerCase() === 'axsonid@gmail.com' ||
    profile?.email?.toLowerCase() === 'axonid@gmail.com' ||
    (profile?.is_master === true && (profile?.email?.toLowerCase()?.includes('axsonid') || profile?.email?.toLowerCase()?.includes('axonid')))

  const handleWipeAllData = () => {
    soundManager.playClick()
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

  const [subTab, setSubTab] = useState('staff')
  const [copiedToken, setCopiedToken] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [selectedUserForPerms, setSelectedUserForPerms] = useState(null)
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false)

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
        (emp.code || '').toLowerCase().includes(q)
      )
    })
  }, [visibleStaff, roleFilter, statusFilter, searchQuery])

  const activeCount = visibleStaff.filter((e) => e.status === 'active').length
  const sellersCount = visibleStaff.filter((e) => e.role === 'مندوب مبيعات' || e.role === 'Seller').length
  const isQuotaFull = visibleStaff.length >= maxUsers

  const handleOpenPermissions = (emp) => {
    soundManager.playClick()
    setSelectedUserForPerms(emp)
    setIsPermissionsModalOpen(true)
  }

  const handleDeleteEmployee = (emp) => {
    openConfirmModal({
      title: isRtl ? 'حذف حساب الموظف' : 'Delete Staff Account',
      message: isRtl
        ? `هل أنت متأكد من حذف حساب (${emp.name}) نهائياً؟`
        : `Are you sure you want to delete (${emp.name})?`,
      confirmText: isRtl ? 'حذف' : 'Delete',
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

  const handleCopyInvite = async (token, url) => {
    soundManager.playClick()
    const fullUrl = url || `${window.location.origin}/?invite=${token}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = fullUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    }
  }

  const handleShareWhatsApp = (invite) => {
    soundManager.playClick()
    const fullUrl = invite.url || `${window.location.origin}/?invite=${invite.token}&role=${encodeURIComponent(invite.role)}`
    const msg = `أهلاً بك! تفضل رابط الانضمام لمنظومة غردقة فور يو بصلاحية (${invite.role}):\n${fullUrl}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleDeleteInvite = (invite) => {
    openConfirmModal({
      title: isRtl ? 'إلغاء رابط الدعوة' : 'Revoke Invite Link',
      message: isRtl
        ? `هل تريد إلغاء رابط الدعوة (${invite.role}) وحذفه؟`
        : `Do you want to revoke this invite (${invite.role})?`,
      confirmText: isRtl ? 'إلغاء الدعوة' : 'Revoke',
      cancelText: t('cancel'),
      type: 'danger',
      onConfirm: () => {
        soundManager.playTrash()
        deleteStaffInvite(invite.token)
      }
    })
  }

  return (
    <div className="w-full space-y-4 pb-20 lg:pb-6 animate-fadeIn text-start">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0a2540] text-sky-300 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {isRtl ? 'الموظفين والصلاحيات' : 'Staff & Permissions'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-slate-500">
                {isRtl ? 'سجل فريق العمل، وضبط الصلاحيات التفصيلية' : 'Team members and granular module access'}
              </span>
              <span className="text-slate-300">•</span>
              <span
                className={`font-mono text-[11px] font-black px-2 py-0.5 rounded-full border ${
                  isQuotaFull
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
              >
                {visibleStaff.length} / {maxUsers} {isRtl ? 'مستخدمين' : 'users'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleWipeAllData}
            title={t('wipe_confirm_title')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span>{isRtl ? 'تصفير ومسح كافة البيانات' : 'Wipe All Data'}</span>
          </button>

          {isMaster && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick()
                setIsMasterModalOpen(true)
              }}
              title={isRtl ? 'غرفة تحكم المنظومة' : 'Master Control Room'}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>{isRtl ? 'غرفة التحكم' : 'Control Room'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              setIsInviteModalOpen(true)
            }}
            disabled={isQuotaFull}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black shadow-md transition-all active:scale-95 ${
              isQuotaFull
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#0a2540] hover:bg-[#133e66] text-white shadow-sky-950/20'
            }`}
          >
            <UserPlus className="w-4 h-4 text-sky-300" />
            <span>{isRtl ? 'إضافة موظف' : 'Add Staff'}</span>
          </button>
        </div>
      </div>

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
              {isRtl ? 'حسابات نشطة' : 'Active Staff'}
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

      {/* 2 Main Tabs: الموظفين المعتمدين | روابط الدعوة المعلقة */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200/90 w-fit">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick()
            setSubTab('staff')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${
            subTab === 'staff'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isRtl ? 'الموظفين المعتمدين' : 'Active Staff'}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              subTab === 'staff' ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
            }`}
          >
            {visibleStaff.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick()
            setSubTab('invites')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${
            subTab === 'invites'
              ? 'bg-[#0a2540] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>{isRtl ? 'روابط الدعوة المعلقة' : 'Pending Invites'}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              subTab === 'invites' ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
            }`}
          >
            {staffInvites.length}
          </span>
        </button>
      </div>

      {subTab === 'staff' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200/90 shadow-soft flex flex-wrap items-center gap-2">
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
              {Object.keys(AVAILABLE_ROLES).map((key) => (
                <option key={key} value={key}>
                  {isRtl ? AVAILABLE_ROLES[key].title : AVAILABLE_ROLES[key].titleEn}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="ALL">{isRtl ? 'كافة الحالات' : 'All Status'}</option>
              <option value="active">{isRtl ? 'نشط فقط' : 'Active'}</option>
              <option value="inactive">{isRtl ? 'معطل فقط' : 'Inactive'}</option>
            </select>
          </div>

          {/* Desktop Table: Single-line row geometry */}
          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-black h-11">
                    <th className="px-4 text-start">{isRtl ? 'الموظف والكود' : 'Staff'}</th>
                    <th className="px-4 text-start">{isRtl ? 'بيانات التواصل' : 'Contact'}</th>
                    <th className="px-4 text-start">{isRtl ? 'الدور الوظيفي' : 'Role'}</th>
                    <th className="px-4 text-start">{isRtl ? 'صلاحيات الشاشات' : 'Permissions'}</th>
                    <th className="px-4 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {isRtl ? 'لا يوجد موظفين مسجلين حالياً' : 'No staff found'}
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((emp) => {
                      const roleConfig = AVAILABLE_ROLES[emp.role] || AVAILABLE_ROLES['مندوب مبيعات']
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
                            <button
                              type="button"
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
                              type="button"
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
                                type="button"
                                onClick={() => handleOpenPermissions(emp)}
                                title={isRtl ? 'تعديل الصلاحيات' : 'Permissions'}
                                className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-full transition-colors"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
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
                {isRtl ? 'لا يوجد موظفين مسجلين حالياً' : 'No staff found'}
              </div>
            ) : (
              filteredStaff.map((emp) => {
                const roleConfig = AVAILABLE_ROLES[emp.role] || AVAILABLE_ROLES['مندوب مبيعات']
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
                        type="button"
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
                        <span className="text-slate-400 font-bold">{isRtl ? 'الإيميل:' : 'Email:'}</span>
                        <span className="font-mono text-slate-600 text-[10px]">{emp.email}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-bold">{isRtl ? 'الهاتف:' : 'Phone:'}</span>
                          <span className="font-mono text-slate-600 text-[10px]">{emp.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenPermissions(emp)}
                        className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-[11px] font-black transition-all flex items-center justify-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                        <span>{isRtl ? `الصلاحيات (${grantedCount})` : `Permissions (${grantedCount})`}</span>
                      </button>

                      <button
                        type="button"
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
        </>
      ) : (
        /* Pending Invites View (Rule 14 & Rule 16) */
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-black h-11">
                    <th className="px-4 text-start">{isRtl ? 'الدور المسند' : 'Role'}</th>
                    <th className="px-4 text-start">{isRtl ? 'رابط الدعوة' : 'Invite Link'}</th>
                    <th className="px-4 text-start">{isRtl ? 'تاريخ الإنشاء والصلاحية' : 'Created & Validity'}</th>
                    <th className="px-4 text-center">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                  {staffInvites.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <LinkIcon className="w-8 h-8 text-slate-300" />
                          <span>{isRtl ? 'لا توجد روابط دعوة معلقة حالياً' : 'No pending invites'}</span>
                          <button
                            type="button"
                            onClick={() => {
                              soundManager.playClick()
                              setIsInviteModalOpen(true)
                            }}
                            className="mt-2 px-4 py-2 bg-[#0a2540] text-white rounded-full text-xs font-black shadow-sm"
                          >
                            {isRtl ? 'توليد رابط دعوة جديد' : 'Generate New Invite'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    staffInvites.map((inv) => {
                      const roleConfig = AVAILABLE_ROLES[inv.role] || AVAILABLE_ROLES['مندوب مبيعات']
                      const fullUrl = inv.url || `${window.location.origin}/?invite=${inv.token}&role=${encodeURIComponent(inv.role)}`
                      const isCopied = copiedToken === inv.token

                      return (
                        <tr key={inv.token} className="hover:bg-sky-50/30 transition-colors h-12">
                          <td className="px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${roleConfig.color}`}>
                              <span>{isRtl ? roleConfig.title : roleConfig.titleEn}</span>
                            </span>
                          </td>

                          <td className="px-4 max-w-xs truncate">
                            <span className="font-mono text-[11px] text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                              {inv.token}
                            </span>
                          </td>

                          <td className="px-4">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-EG') : 'اليوم'}</span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                                {isRtl ? 'صالح 7 أيام' : '7 days'}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300">
                              {isRtl ? 'بانتظار التسجيل' : 'Pending'}
                            </span>
                          </td>

                          <td className="px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleCopyInvite(inv.token, fullUrl)}
                                title={isRtl ? 'نسخ الرابط' : 'Copy'}
                                className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-full transition-colors flex items-center gap-1"
                              >
                                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleShareWhatsApp(inv)}
                                title={isRtl ? 'مشاركة واتساب' : 'WhatsApp'}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteInvite(inv)}
                                title={isRtl ? 'إلغاء الدعوة' : 'Revoke'}
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

          {/* Mobile Bento Cards for Invites */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
            {staffInvites.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs font-bold space-y-2">
                <LinkIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p>{isRtl ? 'لا توجد روابط دعوة معلقة حالياً' : 'No pending invites'}</p>
              </div>
            ) : (
              staffInvites.map((inv) => {
                const roleConfig = AVAILABLE_ROLES[inv.role] || AVAILABLE_ROLES['مندوب مبيعات']
                const fullUrl = inv.url || `${window.location.origin}/?invite=${inv.token}&role=${encodeURIComponent(inv.role)}`
                const isCopied = copiedToken === inv.token

                return (
                  <div
                    key={inv.token}
                    className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-soft space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${roleConfig.color}`}>
                        {isRtl ? roleConfig.title : roleConfig.titleEn}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300">
                        {isRtl ? 'معلق' : 'Pending'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-[10px] text-sky-800 break-all">
                      {inv.token}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-EG') : 'اليوم'}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {isRtl ? 'صالح 7 أيام' : '7 days'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyInvite(inv.token, fullUrl)}
                        className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-[11px] font-black transition-all flex items-center justify-center gap-1"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الرابط' : 'Copy')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(inv)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full transition-all"
                        title={isRtl ? 'مشاركة واتساب' : 'WhatsApp'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteInvite(inv)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full transition-all"
                        title={isRtl ? 'إلغاء' : 'Revoke'}
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

      {/* Staff Invite Modal */}
      <AX_StaffInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Permissions Edit Modal */}
      <AX_StaffPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false)
          setSelectedUserForPerms(null)
        }}
        user={selectedUserForPerms}
      />

      {/* Master Control Room Modal (Exclusive to AXONID / Master) */}
      <AX_MasterControlModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
      />
    </div>
  )
}
