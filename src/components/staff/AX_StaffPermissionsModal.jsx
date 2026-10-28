import React, { useState, useEffect } from 'react'
import {
  X,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import { STAFF_MODULES, AVAILABLE_ROLES } from '../../utils/staffPermissionsConfig'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AX_StaffPermissionsModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null

  const { updateSystemUser, lang } = useAXStore()
  const isRtl = lang === 'ar'

  const [permissions, setPermissions] = useState(user.permissions || {})
  const [role, setRole] = useState(user.role || 'مندوب مبيعات')
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setPermissions(user.permissions || {})
      setRole(user.role || 'مندوب مبيعات')
      setSavedSuccess(false)
    }
  }, [user])

  const applyRole = (selectedRole) => {
    soundManager.playClick()
    setRole(selectedRole)
    if (AVAILABLE_ROLES[selectedRole]) {
      setPermissions({ ...AVAILABLE_ROLES[selectedRole].permissions })
    }
  }

  const togglePermission = (modId) => {
    soundManager.playClick()
    setPermissions((prev) => ({
      ...prev,
      [modId]: !prev[modId]
    }))
  }

  const handleSave = (e) => {
    e?.preventDefault()
    soundManager.playSuccess()

    updateSystemUser(user.id, {
      role,
      permissions
    })

    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp my-8 max-h-[90vh] flex flex-col text-start">
        <button
          onClick={() => {
            soundManager.playClick()
            onClose()
          }}
          className="absolute top-4 start-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0 border border-sky-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {isRtl ? `تعديل صلاحيات: ${user.name}` : `Edit Permissions: ${user.name}`}
            </h3>
            <span className="text-xs text-slate-500 font-bold block mt-0.5">
              {user.email} • {user.code}
            </span>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-3 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isRtl ? 'تم حفظ الصلاحيات بنجاح' : 'Permissions saved successfully'}</span>
          </div>
        )}

        <div className="overflow-y-auto space-y-4 py-4 flex-1 pe-1">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">
              {isRtl ? 'الدور الوظيفي:' : 'Role:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(AVAILABLE_ROLES).map((key) => {
                const isSelected = role === key
                const r = AVAILABLE_ROLES[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyRole(key)}
                    className={`py-2 px-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-[#0a2540] text-white border-[#0a2540] font-black shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    {isRtl ? r.title : r.titleEn}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-black text-slate-700 block mb-2">
              {isRtl ? 'مصفوفة صلاحيات الشاشات والموديولات:' : 'Module Access Matrix:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STAFF_MODULES.map((mod) => {
                const Icon = mod.icon
                const isGranted = Boolean(permissions[mod.id])
                return (
                  <div
                    key={mod.id}
                    onClick={() => togglePermission(mod.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isGranted
                        ? 'bg-sky-50/70 border-sky-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isGranted ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {isRtl ? mod.label : mod.labelEn}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold truncate mt-0.5">
                          {mod.description}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${
                        isGranted
                          ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isGranted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-black text-slate-700 block mb-2">
              {isRtl ? 'صلاحيات إضافية حساسة:' : 'Sensitive Actions:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                onClick={() => togglePermission('can_edit_prices')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  permissions.can_edit_prices
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    {isRtl ? 'تعديل أسعار البيع والتكلفة' : 'Edit Sell & Cost Prices'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {isRtl ? 'السماح بتعديل تسعير الأصناف والرحلات' : 'Allow changing trip rates'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(permissions.can_edit_prices)}
                  readOnly
                  className="w-4 h-4 rounded text-amber-600"
                />
              </label>

              <label
                onClick={() => togglePermission('can_delete_bookings')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  permissions.can_delete_bookings
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    {isRtl ? 'حذف الحجوزات نهائياً' : 'Permanent Booking Deletion'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {isRtl ? 'صلاحية حذف أي حجز من المنظومة' : 'Allow deleting bookings'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(permissions.can_delete_bookings)}
                  readOnly
                  className="w-4 h-4 rounded text-rose-600"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>{isRtl ? 'حفظ وتطبيق الصلاحيات' : 'Save & Apply Permissions'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
