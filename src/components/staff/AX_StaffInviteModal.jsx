import React, { useState } from 'react'
import {
  X,
  Link,
  Copy,
  Check,
  Share2,
  Building2,
  Sparkles,
  UserPlus,
  ShieldCheck,
  Phone,
  Mail,
  User
} from 'lucide-react'
import { STAFF_MODULES, PRESET_ROLES } from '../../utils/staffPermissionsConfig'
import { soundManager } from '../../utils/soundEffects'
import { useAXStore } from '../../store/useAXStore'

export function AX_StaffInviteModal({ isOpen, onClose, branches = [] }) {
  if (!isOpen) return null

  const { addSystemUser, lang } = useAXStore()
  const isRtl = lang === 'ar'

  const [mode, setMode] = useState('invite') // 'invite' | 'direct'
  const [roleTitle, setRoleTitle] = useState('مندوب مبيعات')
  const [assignedBranch, setAssignedBranch] = useState(branches[0]?.name || 'مارينا الغردقة الرئيسي (Main Marina)')
  const [permissions, setPermissions] = useState(() => ({
    ...PRESET_ROLES['Seller'].permissions
  }))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [generatedLink, setGeneratedLink] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const applyPreset = (key) => {
    soundManager.playClick()
    const preset = PRESET_ROLES[key]
    if (preset) {
      setRoleTitle(preset.title)
      setPermissions({ ...preset.permissions })
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
    const url = `${window.location.origin}/?invite=${token}&role=${encodeURIComponent(roleTitle)}`
    setGeneratedLink(url)
  }

  const handleDirectAdd = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    soundManager.playSuccess()

    let mappedRole = 'Seller'
    if (roleTitle.includes('مدير')) mappedRole = 'Operations Director'
    else if (roleTitle.includes('محاسب')) mappedRole = 'Accountant'
    else if (roleTitle.includes('منسق')) mappedRole = 'Coordinator'

    addSystemUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      code: 'EMP-' + Math.floor(10 + Math.random() * 90),
      role: mappedRole,
      role_title: roleTitle.trim(),
      branch: assignedBranch,
      permissions,
      status: 'active',
      is_master: false
    })

    onClose()
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
    const msg = `أهلاً بك! تفضل رابط الانضمام لفريق غردقة فور يو بصلاحية (${roleTitle}):\n${generatedLink}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0a2540]/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 shadow-2xl relative animate-scaleUp my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {isRtl ? 'إضافة موظف جديد وتحديد الصلاحيات' : 'Add Employee & Set Permissions'}
              </h3>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                {isRtl ? 'نمط جزيرة العرب و H&A: رابط دعوة فوري أو تسجيل بيانات مباشر' : 'Instant invite link or direct registration'}
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

        {/* Tab switch: Invite link vs Direct registration */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              setMode('invite')
            }}
            className={`px-4 py-2 text-xs font-black rounded-t-2xl border-b-2 transition-all flex items-center gap-1.5 ${
              mode === 'invite'
                ? 'border-sky-600 text-sky-800 bg-sky-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>{isRtl ? 'رابط دعوة عبر واتساب' : 'Invite Link (WhatsApp)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick()
              setMode('direct')
            }}
            className={`px-4 py-2 text-xs font-black rounded-t-2xl border-b-2 transition-all flex items-center gap-1.5 ${
              mode === 'direct'
                ? 'border-sky-600 text-sky-800 bg-sky-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إضافة بيانات الموظف مباشرة' : 'Direct Add with Password'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-start">
          {generatedLink && mode === 'invite' ? (
            <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200 text-center space-y-4 animate-scaleUp">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>

              <div>
                <h4 className="text-base font-black text-emerald-900">
                  {isRtl ? 'تم توليد رابط الدعوة بنجاح!' : 'Invite Link Generated!'}
                </h4>
                <p className="text-xs font-bold text-emerald-700 mt-1">
                  {isRtl
                    ? `أرسل الرابط للموظف ليكمل تعيين كلمة المرور ويبدأ العمل بصلاحية (${roleTitle})`
                    : `Send link to staff to start as (${roleTitle})`}
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
            <div className="space-y-4">
              {/* Direct inputs if in direct mode */}
              {mode === 'direct' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 block">
                      {isRtl ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isRtl ? 'أحمد كمال / Laure Martin' : 'Staff Name'}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 block">
                      {isRtl ? 'البريد الإلكتروني' : 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staff@hurghada.com"
                      dir="ltr"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 block">
                      {isRtl ? 'كلمة المرور' : 'Password'} *
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="123456"
                      dir="ltr"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Role & Branch Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 block">
                    {isRtl ? 'المسمى الوظيفي:' : 'Role Title:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="مندوب مبيعات / كاشير..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 block">
                    {isRtl ? 'الفرع / نقطة الانطلاق:' : 'Assigned Branch:'}
                  </label>
                  <select
                    value={assignedBranch}
                    onChange={(e) => setAssignedBranch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                    <option value="كافة الفروع">{isRtl ? 'كافة الفروع (وصول شامل)' : 'All Branches'}</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-1">
                  <span className="text-[11px] font-black text-slate-500 block mb-1.5">
                    {isRtl ? 'نماذج أدوار سريعة بضغطة زر (Presets):' : 'Quick Role Presets:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'Seller', label: 'مندوب مبيعات' },
                      { key: 'Accountant', label: 'محاسب خزينة' },
                      { key: 'Coordinator', label: 'منسق منفذين' },
                      { key: 'Operations Director', label: 'مدير عمليات' },
                      { key: 'Staff', label: 'موظف تشغيل' }
                    ].map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => applyPreset(p.key)}
                        className="px-3 py-1 rounded-full text-xs font-black bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 transition-all active:scale-95 shadow-2xs"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Granular Permissions Matrix */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-700 block">
                  {isRtl ? 'مصفوفة صلاحيات الشاشات الممنوحة:' : 'Granted Permissions Matrix:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {STAFF_MODULES.map((mod) => {
                    const Icon = mod.icon
                    const isGranted = Boolean(permissions[mod.id])

                    return (
                      <div
                        key={mod.id}
                        onClick={() => togglePermission(mod.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isGranted
                            ? 'bg-sky-50/70 border-sky-300 shadow-xs'
                            : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isGranted ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-900 block truncate">
                              {isRtl ? mod.label : mod.labelEn}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {isGranted ? (isRtl ? 'مفعل' : 'Enabled') : (isRtl ? 'معطل' : 'Disabled')}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${
                            isGranted
                              ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
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
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {(!generatedLink || mode === 'direct') && (
          <div className="flex items-center gap-2 p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            {mode === 'invite' ? (
              <button
                type="button"
                onClick={handleGenerateInvite}
                className="flex-1 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Link className="w-4 h-4 text-sky-400" />
                <span>{isRtl ? 'توليد رابط الدعوة والواتساب' : 'Generate Invite Link'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDirectAdd}
                className="flex-1 py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4 text-sky-400" />
                <span>{isRtl ? 'إضافة الموظف فوراً' : 'Add Employee Now'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
