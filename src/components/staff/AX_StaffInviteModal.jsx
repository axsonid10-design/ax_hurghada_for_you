import React, { useState } from 'react'
import {
  X,
  Link,
  Copy,
  Check,
  Share2,
  ShieldCheck
} from 'lucide-react'
import { STAFF_MODULES, AVAILABLE_ROLES } from '../../utils/staffPermissionsConfig'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AX_StaffInviteModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const { lang } = useAXStore()
  const isRtl = lang === 'ar'

  const [role, setRole] = useState('مندوب مبيعات')
  const [permissions, setPermissions] = useState(() => ({
    ...AVAILABLE_ROLES['مندوب مبيعات'].permissions
  }))

  const [generatedLink, setGeneratedLink] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const handleRoleChange = (selectedRole) => {
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

  const handleGenerateInvite = (e) => {
    e.preventDefault()
    soundManager.playSuccess()

    const token = `inv_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`
    const url = `${window.location.origin}/?invite=${token}&role=${encodeURIComponent(role)}`

    const newInvite = {
      token,
      role,
      permissions,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    try {
      const raw = localStorage.getItem('ax_h4u_staff_invites')
      const existing = raw ? JSON.parse(raw) : []
      localStorage.setItem('ax_h4u_staff_invites', JSON.stringify([newInvite, ...existing]))
    } catch {
    }

    setGeneratedLink(url)
  }

  const handleCopy = async () => {
    if (!generatedLink) return
    soundManager.playClick()
    try {
      await navigator.clipboard.writeText(generatedLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = generatedLink
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleShareWhatsApp = () => {
    if (!generatedLink) return
    soundManager.playClick()
    const msg = `أهلاً بك! تفضل رابط الانضمام لفريق غردقة فور يو بصلاحية (${role}):\n${generatedLink}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 shadow-2xl relative animate-scaleUp my-4 text-start">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shadow-xs">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {isRtl ? 'توليد رابط دعوة موظف جديد' : 'Generate Staff Invite Link'}
              </h3>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                {isRtl ? 'اختر الدور وحدد الصلاحيات لتوليد رابط انضمام فوري' : 'Select role and permissions to create invite'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {generatedLink ? (
            <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200 text-center space-y-4 animate-scaleUp">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>

              <div>
                <h4 className="text-base font-black text-emerald-900">
                  {isRtl ? 'تم توليد رابط الدعوة بنجاح!' : 'Invite Link Ready!'}
                </h4>
                <p className="text-xs font-bold text-emerald-700 mt-1">
                  {isRtl
                    ? `أرسل الرابط للموظف ليسجل اسمه وبياناته وكلمة مروره بصلاحية (${role})`
                    : `Staff can now register their credentials with (${role}) role`}
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-2xl border border-emerald-300 flex items-center gap-2 max-w-xl mx-auto shadow-xs">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  dir="ltr"
                  className="flex-1 bg-transparent text-xs font-mono font-bold text-slate-800 focus:outline-none px-2"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isRtl ? 'مشاركة عبر واتساب' : 'Share on WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGeneratedLink('')
                    onClose()
                  }}
                  className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  {isRtl ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerateInvite} className="space-y-4">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-black text-slate-800 block">
                  {isRtl ? 'الدور الوظيفي المطلوب:' : 'Assigned Role:'}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.keys(AVAILABLE_ROLES).map((key) => {
                    const r = AVAILABLE_ROLES[key]
                    const isSelected = role === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleRoleChange(key)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-sm font-black'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <span className="text-xs block">{isRtl ? r.title : r.titleEn}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black text-slate-800 block">
                  {isRtl ? 'مصفوفة صلاحيات الشاشات الممنوحة للموظف:' : 'Granted Module Permissions:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STAFF_MODULES.map((mod) => {
                    const Icon = mod.icon
                    const isGranted = Boolean(permissions[mod.id])

                    return (
                      <div
                        key={mod.id}
                        onClick={() => togglePermission(mod.id)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isGranted
                            ? 'bg-sky-50/70 border-sky-300 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isGranted ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-black text-slate-900 truncate">
                            {isRtl ? mod.label : mod.labelEn}
                          </span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${
                            isGranted
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isGranted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Link className="w-4 h-4 text-sky-400" />
                  <span>{isRtl ? 'توليد رابط الدعوة الآن' : 'Generate Invite Link'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
