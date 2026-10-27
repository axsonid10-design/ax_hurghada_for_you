import React, { useState } from 'react'
import { Lock, Mail, Eye, EyeOff, ShieldCheck, LogIn, AlertCircle, KeyRound, Sparkles } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'

export function AX_LoginScreen() {
  const setProfile = useAXStore((state) => state.setProfile)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e) => {
    e?.preventDefault()
    setError('')

    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()

    if (!cleanUser || !cleanPass) {
      soundManager.playAlert()
      setError('يرجى إدخال اسم المستخدم وكلمة المرور')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      // 1. Master Admin Authentication
      if (
        (cleanUser === 'axsonid@gmail.com' || cleanUser === 'axonid@gmail.com' || cleanUser === 'admin') &&
        (cleanPass === 'Hma332003#' || cleanPass === 'admin123')
      ) {
        const user = {
          id: 'usr_master_axonid',
          name: 'AXONID Master Admin',
          email: 'axsonid@gmail.com',
          role: 'Super Admin',
          is_master: true
        }
        completeLogin(user)
        return
      }

      // 2. Operations Director Authentication
      if (
        (cleanUser === 'director@hurghada.com' || cleanUser === 'director' || cleanUser === 'ops') &&
        (cleanPass === 'Hma332003#' || cleanPass === '123456' || cleanPass === 'admin123')
      ) {
        const user = {
          id: 'usr_ops_director',
          name: 'مدير العمليات السياحية',
          email: 'director@hurghada.com',
          role: 'Operations Director'
        }
        completeLogin(user)
        return
      }

      // 3. Fallback for any valid admin entry with Hma332003#
      if (cleanPass === 'Hma332003#' || cleanPass === 'admin123') {
        const user = {
          id: 'usr_' + Date.now(),
          name: username.trim(),
          email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@hurghada.com`,
          role: 'Operations Director'
        }
        completeLogin(user)
        return
      }

      soundManager.playAlert()
      setError('بيانات تسجيل الدخول غير صحيحة')
      setIsLoading(false)
    }, 400)
  }

  const completeLogin = (user) => {
    soundManager.playSuccess()
    if (rememberMe) {
      localStorage.setItem('ax_h4u_auth_user', JSON.stringify(user))
    } else {
      sessionStorage.setItem('ax_h4u_auth_user', JSON.stringify(user))
    }
    setProfile(user)
    setIsLoading(false)
  }

  const fillCredentials = (user, pass) => {
    soundManager.playClick()
    setUsername(user)
    setPassword(pass)
    setError('')
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0a2540]">
      {/* Background Watermark & Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0e3b66_0%,_#0a2540_70%)] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Main Fortress Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center relative animate-fadeIn">
          {/* Circular Brand Logo Badge */}
          <div className="w-20 h-20 rounded-full border-4 border-[#38bdf8]/40 shadow-xl bg-[#0a2540] mx-auto mb-4 overflow-hidden flex items-center justify-center">
            <img
              src="/logo-circle.png"
              alt="غردقة فور يو"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <h1 className="text-xl font-black text-[#0a2540] tracking-wide mb-1">
            غردقة فور يو
          </h1>
          <div className="text-xs font-bold text-slate-500 mb-6 font-mono">
            HURGHADA FOR YOU • PORTAL
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 justify-center animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                البريد الإلكتروني / اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@hurghada.com"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-10 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-10 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute left-3 top-2.5 rounded-full"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0284c7] focus:ring-[#0284c7]"
                />
                <span>تذكر تسجيل الدخول</span>
              </label>
              <span className="text-[11px] font-bold text-[#0284c7]">
                بوابة آمنة ومحمية
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>جاري التحقق...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#38bdf8]" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
            <div className="text-[11px] font-bold text-slate-400">
              حسابات الدخول السريع المعتمدة:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@hurghada.com', 'Hma332003#')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[10px] font-black transition-colors"
              >
                مدير العمليات
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('axsonid@gmail.com', 'Hma332003#')}
                className="px-3 py-1 bg-[#0284c7]/10 hover:bg-[#0284c7]/20 text-[#0284c7] rounded-full text-[10px] font-black transition-colors"
              >
                AXONID Master
              </button>
            </div>
          </div>
        </div>

        {/* AXONID Official Signature Capsule */}
        <div className="text-center">
          <a
            href="https://axsonid.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold transition-all border border-white/10"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Created & Protected by AXONID</span>
          </a>
        </div>
      </div>
    </div>
  )
}
