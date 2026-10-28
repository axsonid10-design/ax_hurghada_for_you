import React, { useState } from 'react'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Compass,
  Anchor
} from 'lucide-react'
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#031322] select-none font-tajawal">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/15 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px] animate-pulse" />
        <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[130px]" />

        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center">
          <Compass className="w-[800px] h-[800px] text-white animate-spin" style={{ animationDuration: '180s' }} />
        </div>

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-4">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-400/20 relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-400 to-amber-400" />

          <div className="text-center space-y-2 mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full border-2 border-sky-400/60 shadow-xl bg-[#0a2540] mx-auto overflow-hidden flex items-center justify-center ring-4 ring-sky-500/15">
                <img
                  src="/logo-circle.png"
                  alt="غردقة فور يو"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 text-amber-400 border border-amber-400/50 shadow-sm">
                <Anchor className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                غردقة فور يو
              </h1>
              <p className="text-[11px] font-mono font-bold text-sky-700 tracking-wider uppercase mt-0.5">
                HURGHADA FOR YOU
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 justify-center animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
                اسم المستخدم / البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@hurghada.com"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
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
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <span>تذكر تسجيل الدخول</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#0a2540] via-[#0e3a63] to-[#0284c7] hover:from-[#061626] hover:to-[#0369a1] text-white rounded-full text-xs font-black shadow-lg shadow-sky-950/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>جاري الدخول...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-sky-300" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-center">
            <a
              href="https://axsonid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-50 hover:bg-white text-slate-500 hover:text-sky-600 border border-slate-200/80 hover:border-sky-400 transition-all font-mono font-black text-[11px] group cursor-pointer shadow-xs"
              title="Created by AXONID"
            >
              <span className="font-sans font-bold text-slate-400 group-hover:text-slate-600">Created by</span>
              <span className="text-[#0a2540] font-black tracking-wide group-hover:text-sky-600">AXONID</span>
            </a>
          </div>
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
