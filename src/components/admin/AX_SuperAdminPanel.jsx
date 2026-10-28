import React, { useState } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  Database,
  Sliders,
  Plus,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Phone,
  KeyRound
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'

export function AX_SuperAdminPanel() {
  const {
    profile,
    warehouses = [],
    maxWarehouses = 10,
    setMaxWarehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    systemUsers = [],
    maxUsers = 15,
    setMaxUsers,
    addSystemUser,
    updateSystemUser,
    deleteSystemUser,
    bookings = [],
    expenses = [],
    importedDates = {},
    wipeAllData,
    openConfirmModal,
    t
  } = useAXStore()

  const [activeSubTab, setActiveSubTab] = useState('warehouses') // 'warehouses' | 'users' | 'database' | 'limits'

  // New Warehouse Modal State
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false)
  const [whName, setWhName] = useState('')
  const [whCode, setWhCode] = useState('')
  const [whLocation, setWhLocation] = useState('')
  const [whCapacity, setWhCapacity] = useState('100')
  const [whManager, setWhManager] = useState('')
  const [whPhone, setWhPhone] = useState('')

  // New User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [usrName, setUsrName] = useState('')
  const [usrEmail, setUsrEmail] = useState('')
  const [usrPassword, setUsrPassword] = useState('')
  const [usrRole, setUsrRole] = useState('Operations Director')
  const [usrBranch, setUsrBranch] = useState('مارينا الغردقة الرئيسي')

  // Super Admin Fortress Security Guard
  const isMasterAuthorized = profile?.is_master || profile?.role === 'Super Admin' || profile?.email === 'axsonid@gmail.com'

  if (!isMasterAuthorized) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-slate-800">
          منطقة تحكم المالك محظورة
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          هذه الصفحة مخصصة حصرياً للمالك ومسؤول النظام الأعلى، ولا يمكن الوصول إليها من حسابات المستخدمين العادية.
        </p>
      </div>
    )
  }

  const handleCreateWarehouse = (e) => {
    e.preventDefault()
    if (!whName.trim()) return

    if (warehouses.length >= maxWarehouses) {
      soundManager.playAlert()
      alert(`وصلت للحد الأقصى المسموح للمخازن (${maxWarehouses}). يرجى زيادة الحد أولاً.`)
      return
    }

    soundManager.playSuccess()
    addWarehouse({
      name: whName.trim(),
      code: whCode.trim() || `WH-0${warehouses.length + 1}`,
      location: whLocation.trim() || 'الغردقة',
      capacity: Number(whCapacity) || 100,
      manager: whManager.trim() || 'مشرف العمليات',
      phone: whPhone.trim() || '—',
      status: 'active'
    })

    setWhName('')
    setWhCode('')
    setWhLocation('')
    setWhManager('')
    setWhPhone('')
    setIsAddWhModalOpen(false)
  }

  const handleCreateUser = (e) => {
    e.preventDefault()
    if (!usrName.trim() || !usrEmail.trim()) return

    if (systemUsers.length >= maxUsers) {
      soundManager.playAlert()
      alert(`وصلت للحد الأقصى المسموح للمستخدمين (${maxUsers}). يرجى زيادة الحد أولاً.`)
      return
    }

    soundManager.playSuccess()
    addSystemUser({
      name: usrName.trim(),
      email: usrEmail.trim().toLowerCase(),
      role: usrRole,
      branch: usrBranch,
      status: 'active',
      is_master: false
    })

    setUsrName('')
    setUsrEmail('')
    setUsrPassword('')
    setIsAddUserModalOpen(false)
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

  return (
    <div className="w-full space-y-4">
      {/* Master Top Ribbon */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041322] via-[#082038] to-[#0a2540] text-white p-5 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>OWNER MASTER CONTROL ROOM</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                صلاحية مطلقة للمالك فقط
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              غرفة تحكم المالك والمنظومة
            </h1>
            <p className="text-xs text-slate-300 font-bold">
              التحكم في سعة المخازن، عدد المستخدمين المرخصين، إدارة الفروع، وتصفير قاعدة البيانات
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleWipeDatabase}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full text-xs font-black shadow-lg shadow-rose-950/30 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4 text-rose-200" />
              <span>تصفير ومسح كافة البيانات</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs font-bold">
          {[
            { id: 'warehouses', label: `المخازن والفروع (${warehouses.length}/${maxWarehouses})`, icon: Building2 },
            { id: 'users', label: `فريق العمل والمستخدمين (${systemUsers.length}/${maxUsers})`, icon: Users },
            { id: 'database', label: `إدارة قاعدة البيانات (${bookings.length} حجز)`, icon: Database },
            { id: 'limits', label: 'محددات وتراخيص النظام', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick()
                  setActiveSubTab(tab.id)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  active
                    ? 'bg-amber-500 text-[#0a2540] font-black shadow-md shadow-amber-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 1. Warehouses & Stores Management Tab */}
      {activeSubTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                إدارة المخازن ونقاط التشغيل والأسطول
              </h2>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                يمكنك زيادة الحد الأقصى للمخازن المسموحة وإضافة فروع ومخازن جديدة
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <span className="text-xs font-bold text-slate-600">الحد الأقصى للمخازن:</span>
                <input
                  type="number"
                  min={warehouses.length}
                  max={50}
                  value={maxWarehouses}
                  onChange={(e) => setMaxWarehouses(e.target.value)}
                  className="w-14 px-2 py-0.5 bg-white border border-slate-300 rounded-full text-xs font-black font-mono text-center"
                />
              </div>

              <button
                onClick={() => {
                  soundManager.playClick()
                  setIsAddWhModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span>إضافة مخزن جديد</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full">
                    {wh.code}
                  </span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    نشط
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {wh.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-bold mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{wh.location}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>المسئول:</span>
                    <strong className="text-slate-900">{wh.manager}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>الهاتف:</span>
                    <strong className="font-mono text-slate-900">{wh.phone}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>السعة التشغيلية:</span>
                    <strong className="font-mono text-sky-700">{wh.capacity} فرد / مركبة</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => {
                      soundManager.playTrash()
                      deleteWarehouse(wh.id)
                    }}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف المخزن"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. System Users Management Tab */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                إدارة المستخدمين والصلاحيات
              </h2>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                التحكم في حسابات الموظفين، مدراء العمليات، المحاسبين، ومندوبي المبيعات
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <span className="text-xs font-bold text-slate-600">الحد الأقصى للمستخدمين:</span>
                <input
                  type="number"
                  min={systemUsers.length}
                  max={100}
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(e.target.value)}
                  className="w-14 px-2 py-0.5 bg-white border border-slate-300 rounded-full text-xs font-black font-mono text-center"
                />
              </div>

              <button
                onClick={() => {
                  soundManager.playClick()
                  setIsAddUserModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span>إضافة مستخدم جديد</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-4">اسم المستخدم</th>
                    <th className="py-3 px-4">البريد الإلكتروني</th>
                    <th className="py-3 px-4">الرتبة / الصلاحية</th>
                    <th className="py-3 px-4">المخزن / الفرع</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {systemUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.is_master && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.2 rounded-full font-bold">
                            المالك 👑
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-bold">{u.branch}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          نشط
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {!u.is_master ? (
                          <button
                            onClick={() => {
                              soundManager.playTrash()
                              deleteSystemUser(u.id)
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">محمي</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Database Wipe & Excel Pipeline Tab */}
      {activeSubTab === 'database' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
            <div>
              <h2 className="text-sm font-black text-slate-900">
                إدارة وتصفير قاعدة البيانات
              </h2>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                متابعة حالة التخزين المحلي، تصفير الحجوزات، والتحضير لرفع شيت إكسيل جديد
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-500">الحجوزات الحالية</span>
                <div className="text-2xl font-black font-mono text-[#0a2540]">
                  {bookings.length}
                </div>
                <span className="text-[10px] text-slate-400 font-bold">حجز مسجل</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-500">المصاريف المسجلة</span>
                <div className="text-2xl font-black font-mono text-rose-600">
                  {expenses.length}
                </div>
                <span className="text-[10px] text-slate-400 font-bold">سند صرف</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-500">ملفات الإكسيل المرفوعة</span>
                <div className="text-2xl font-black font-mono text-emerald-600">
                  {Object.keys(importedDates).length}
                </div>
                <span className="text-[10px] text-slate-400 font-bold">شيت يومية</span>
              </div>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-rose-900">
                  مسح وتصفير كافة البيانات لبدء تجربة جديدة
                </h4>
                <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                  يمسح كافة الحجوزات والمصاريف وسجلات الاستيراد السابقة، ويترك النظام نظيفاً 100% لاستقبال ملف الإكسيل الجديد.
                </p>
              </div>

              <button
                onClick={handleWipeDatabase}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex-shrink-0"
              >
                تصفير كافة البيانات الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. System Master Limits & License */}
      {activeSubTab === 'limits' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
          <h2 className="text-sm font-black text-slate-900">
            محددات المنظومة وتراخيص التشغيل
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-500">معرف المنشأة (Branch Tenancy):</span>
              <div className="font-black text-slate-900 font-mono">hurghada_marine_main_01</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-500">المنفذ المحلي الحصري (Dedicated Port):</span>
              <div className="font-black text-emerald-600 font-mono">http://localhost:8030 (strictPort: true)</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-500">محرك تحويل العملات اللحظي (FX Rates API):</span>
              <div className="font-black text-sky-700 font-mono">متصل ومفعل (open.er-api.com)</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-500">تحديث الـ PWA الفوري (Auto-Update Notifier):</span>
              <div className="font-black text-emerald-600 font-mono">Quad-Lock PWA v1.0.8</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Warehouse Modal */}
      {isAddWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>إضافة مخزن / نقطة تشغيل جديدة</span>
              </h3>
              <button
                onClick={() => setIsAddWhModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المخزن / الفرع</label>
                <input
                  type="text"
                  required
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  placeholder="مثال: مارينا الجونة الجديد، نقطة انطلاق سفاري الغردقة"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">كود المخزن</label>
                  <input
                    type="text"
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                    placeholder="WH-05"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">السعة التشغيلية</label>
                  <input
                    type="number"
                    value={whCapacity}
                    onChange={(e) => setWhCapacity(e.target.value)}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الموقع الجغرافي</label>
                <input
                  type="text"
                  value={whLocation}
                  onChange={(e) => setWhLocation(e.target.value)}
                  placeholder="مارينا الغردقة، الجونة، مكادي باي"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المسئول</label>
                  <input
                    type="text"
                    value={whManager}
                    onChange={(e) => setWhManager(e.target.value)}
                    placeholder="اسم مدير الفرع"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={whPhone}
                    onChange={(e) => setWhPhone(e.target.value)}
                    placeholder="01001234567"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWhModalOpen(false)}
                  className="px-4 py-2 rounded-full font-bold text-slate-500 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full font-black text-white bg-[#0a2540] hover:bg-[#133e66] shadow-md transition-all active:scale-95"
                >
                  حفظ المخزن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>إضافة مستخدم جديد للنظام</span>
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={usrName}
                  onChange={(e) => setUsrName(e.target.value)}
                  placeholder="اسم الموظف أو المشرف"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">البريد الإلكتروني / اسم الدخول</label>
                <input
                  type="email"
                  required
                  value={usrEmail}
                  onChange={(e) => setUsrEmail(e.target.value)}
                  placeholder="employee@hurghada.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">كلمة المرور المؤقتة</label>
                <input
                  type="password"
                  required
                  value={usrPassword}
                  onChange={(e) => setUsrPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الرتبة والصلاحية</label>
                  <select
                    value={usrRole}
                    onChange={(e) => setUsrRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-bold"
                  >
                    <option value="Operations Director">مدير عمليات</option>
                    <option value="Accountant">محاسب خزينة</option>
                    <option value="Seller">مندوب مبيعات</option>
                    <option value="Supervisor">مشرف رحلات</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الفرع المخصص</label>
                  <select
                    value={usrBranch}
                    onChange={(e) => setUsrBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-bold"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-full font-bold text-slate-500 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full font-black text-white bg-[#0a2540] hover:bg-[#133e66] shadow-md transition-all active:scale-95"
                >
                  حفظ المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
