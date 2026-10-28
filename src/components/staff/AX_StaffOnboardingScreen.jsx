import React, { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  LogIn,
  ArrowRight
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { AVAILABLE_ROLES, STAFF_MODULES } from '../../utils/staffPermissionsConfig'
import { soundManager } from '../../utils/soundEffects'

export function AX_StaffOnboardingScreen({ inviteToken, onComplete }) {
  const { addSystemUser, setProfile } = useAXStore()

  const [inviteData, setInviteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!inviteToken) {
      setErrorStatus('رابط الدعوة غير صالح أو مفقود')
      setLoading(false)
      return
    }

    try {
      const rawInvites = localStorage.getItem('ax_h4u_staff_invites')
      const storedInvites = rawInvites ? JSON.parse(rawInvites) : []
      const found = storedInvites.find((i) => i.token === inviteToken)

      if (found) {
        if (found.status === 'claimed') {
          setErrorStatus('تم استخدام رابط الدعوة هذا من قبل بالفعل')
        } else {
          setInviteData(found)
        }
      } else {
        const urlParams = new URLSearchParams(window.location.search)
        const roleFromUrl = urlParams.get('role') || 'مندوب مبيعات'
        const roleConfig = AVAILABLE_ROLES[roleFromUrl] || AVAILABLE_ROLES['مندوب مبيعات']

        setInviteData({
          token: inviteToken,
          role: roleFromUrl,
          permissions: { ...roleConfig.permissions },
          status: 'pending'
        })
      }
    } catch {
      setErrorStatus('حدث خطأ أثناء قراءة بيانات الدعوة')
    } finally {
      setLoading(false)
    }
  }, [inviteToken])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setSubmitError('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (password !== confirmPassword) {
      setSubmitError('كلمة المرور وتأكيد كلمة المرور غير متطابقين')
      return
    }

    if (password.length < 5) {
      setSubmitError('كلمة المرور يجب أن تكون 5 أحرف أو أرقام على الأقل')
      return
    }

    setIsSubmitting(true)
    soundManager.playSuccess()

    const cleanEmail = email.trim().toLowerCase()
    const assignedRole = inviteData?.role || 'مندوب مبيعات'
    const assignedPerms = inviteData?.permissions || AVAILABLE_ROLES[assignedRole]?.permissions || {}

    const newUserId = 'usr_' + Date.now()
    const newUser = {
      id: newUserId,
      name: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      code: assignedRole === 'مدير عام' ? 'MGR-' + Math.floor(10 + Math.random() * 90) : 'SEL-' + Math.floor(10 + Math.random() * 90),
      role: assignedRole,
      permissions: assignedPerms,
      status: 'active',
      is_master: false
    }

    addSystemUser(newUser)

    try {
      const rawInvites = localStorage.getItem('ax_h4u_staff_invites')
      const storedInvites = rawInvites ? JSON.parse(rawInvites) : []
      const updated = storedInvites.map((i) =>
        i.token === inviteToken ? { ...i, status: 'claimed', claimedBy: cleanEmail } : i
      )
      localStorage.setItem('ax_h4u_staff_invites', JSON.stringify(updated))
    } catch {
    }

    localStorage.setItem('ax_h4u_auth_user', JSON.stringify(newUser))
    setProfile(newUser)

    window.history.replaceState({}, '', '/')

    if (onComplete) {
      onComplete(newUser)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#041322] text-white">
        <span className="text-sm font-bold text-slate-300">جاري فحص رابط الدعوة...</span>
      </div>
    )
  }

  if (errorStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#041322]">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">{errorStatus}</h3>
          <p className="text-xs text-slate-500 font-bold">
            يرجى طلب رابط دعوة جديد من الإدارة أو تسجيل الدخول إذا كان لديك حساب بالفعل.
          </p>
          <button
            type="button"
            onClick={() => {
              window.history.replaceState({}, '', '/')
              window.location.reload()
            }}
            className="w-full py-2.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black"
          >
            الذهاب لتسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  const roleInfo = AVAILABLE_ROLES[inviteData?.role] || AVAILABLE_ROLES['مندوب مبيعات']

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#031322] select-none font-tajawal">
      <div className="w-full max-w-lg relative z-10 space-y-4">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-400/20 relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-400 to-amber-400" />

          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-sky-400/60 shadow-xl bg-[#0a2540] mx-auto overflow-hidden flex items-center justify-center ring-4 ring-sky-500/15">
              <img
                src="/logo-circle.png"
                alt="غردقة فور يو"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                غردقة فور يو
              </h1>
              <p className="text-[11px] font-mono font-bold text-sky-700 tracking-wider uppercase mt-0.5">
                HURGHADA FOR YOU
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black border bg-sky-50 text-sky-800 border-sky-200">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>دعوة انضمام بصلاحية: {roleInfo.title}</span>
            </div>
          </div>

          {submitError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
                الاسم الكامل *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله / Laure Martin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hurghada.com"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
                رقم الهاتف للتواصل *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-8 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute left-2 top-2.5 rounded-full"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-8 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-[#0a2540] via-[#0e3a63] to-[#0284c7] hover:from-[#061626] hover:to-[#0369a1] text-white rounded-full text-xs font-black shadow-lg shadow-sky-950/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <span>جاري إنشاء الحساب...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-sky-300" />
                  <span>تأكيد البيانات والدخول للمنظومة</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <span className="text-[11px] font-bold text-slate-400">
            HURGHADA FOR YOU © 2026
          </span>
        </div>
      </div>
    </div>
  )
}
