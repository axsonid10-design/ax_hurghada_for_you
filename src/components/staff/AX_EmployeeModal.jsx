import React, { useState, useEffect } from 'react'
import {
  X,
  UserPlus,
  UserCheck,
  Building,
  Phone,
  Mail,
  Shield,
  KeyRound
} from 'lucide-react'
import { PRESET_ROLES } from '../../utils/staffPermissionsConfig'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AX_EmployeeModal({ isOpen, onClose, userToEdit = null }) {
  if (!isOpen) return null

  const { addSystemUser, updateSystemUser, warehouses = [], lang } = useAXStore()
  const isRtl = lang === 'ar'
  const isEdit = Boolean(userToEdit)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [role, setRole] = useState('Seller')
  const [branch, setBranch] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '')
      setEmail(userToEdit.email || '')
      setPhone(userToEdit.phone || '')
      setCode(userToEdit.code || '')
      setRole(userToEdit.role || 'Seller')
      setBranch(userToEdit.branch || warehouses[0]?.name || '')
      setPassword('')
    } else {
      setName('')
      setEmail('')
      setPhone('')
      setCode('EMP-' + Math.floor(10 + Math.random() * 90))
      setRole('Seller')
      setBranch(warehouses[0]?.name || 'مارينا الغردقة الرئيسي (Main Marina)')
      setPassword('')
    }
  }, [userToEdit, warehouses])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    soundManager.playSuccess()

    const roleConfig = PRESET_ROLES[role] || PRESET_ROLES['Seller']

    if (isEdit) {
      updateSystemUser(userToEdit.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        code: code.trim(),
        role,
        branch
      })
    } else {
      addSystemUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        code: code.trim(),
        role,
        branch,
        permissions: { ...roleConfig.permissions },
        status: 'active',
        is_master: false
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp my-8">
        <button
          onClick={() => {
            soundManager.playClick()
            onClose()
          }}
          className="absolute top-4 start-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 border border-sky-100">
            {isEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {isEdit
                ? isRtl ? 'تعديل بيانات الموظف' : 'Edit Employee'
                : isRtl ? 'إضافة موظف جديد للمنظومة' : 'Add New Employee'}
            </h3>
            <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
              {isRtl ? 'تحديد الفرع والمسمى الوظيفي وبيانات التواصل' : 'Set branch, role and contact info'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-start">
          <div className="space-y-1">
            <label className="block text-xs font-black text-slate-700">
              {isRtl ? 'الاسم الكامل' : 'Full Name'} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isRtl ? 'مثال: أحمد عبد الله / Laure Martin' : 'e.g. John Doe'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
                {isRtl ? 'البريد الإلكتروني' : 'Email Address'} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@hurghada.com"
                dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
                {isRtl ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
                {isRtl ? 'كود الموظف' : 'Staff Code'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="EMP-01"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-black text-sky-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
                {isRtl ? 'المسمى الوظيفي' : 'Role'}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
              >
                {Object.keys(PRESET_ROLES).map((key) => (
                  <option key={key} value={key}>
                    {isRtl ? PRESET_ROLES[key].title : PRESET_ROLES[key].titleEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-slate-700">
              {isRtl ? 'الفرع / نقطة الانطلاق' : 'Branch / Marina'}
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.name}>
                  {wh.name}
                </option>
              ))}
              <option value="كافة الفروع">{isRtl ? 'كافة الفروع' : 'All Branches'}</option>
            </select>
          </div>

          {!isEdit && (
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
                {isRtl ? 'كلمة المرور الابتدائية' : 'Initial Password'}
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123456"
                dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
              <span className="text-[10px] text-slate-400 font-bold block">
                {isRtl
                  ? 'يتم تفعيل الحساب فوراً دون الحاجة لتأكيد الإيميل.'
                  : 'Account is activated immediately without email verification.'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              {isEdit ? <UserCheck className="w-4 h-4 text-sky-400" /> : <UserPlus className="w-4 h-4 text-sky-400" />}
              <span>{isEdit ? (isRtl ? 'تحديث البيانات' : 'Update') : (isRtl ? 'إضافة الموظف' : 'Add Employee')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
