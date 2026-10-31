import React, { useState, useEffect } from 'react'
import {
  X,
  ShieldCheck,
  Users,
  Database,
  Trash2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Bell
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { pushManager } from '../../utils/pushManager'
import { supabase } from '../../services/supabaseClient'

export function AX_MasterControlModal({ isOpen, onClose }) {
  const profile = useAXStore((state) => state.profile)
  const isMaster =
    profile?.email?.toLowerCase() === 'axsonid@gmail.com' ||
    profile?.email?.toLowerCase() === 'axonid@gmail.com'

  const {
    maxUsers = 15,
    setMaxUsers,
    bookings = [],
    wipeAllData,
    openConfirmModal,
    lang,
    t
  } = useAXStore()

  const isRtl = lang === 'ar'
  const [activeTab, setActiveTab] = useState('errors')
  const [errorsList, setErrorsList] = useState([])
  const [isLoadingErrors, setIsLoadingErrors] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [pushTestSent, setPushTestSent] = useState(false)

  const fetchErrors = async () => {
    setIsLoadingErrors(true)
    try {
      const { data } = await supabase
        .from('ax_system_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)
      setErrorsList(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingErrors(false)
    }
  }

  useEffect(() => {
    if (isOpen && isMaster && activeTab === 'errors') {
      fetchErrors()
    }
  }, [isOpen, isMaster, activeTab])

  if (!isOpen || !isMaster) return null

  const handleCopyError = (err) => {
    soundManager.playClick()
    const content = `🚨 [AXONID SYSTEM ERROR REPORT]
📍 System: ${err.source || 'غردقة فور يو'}
⏰ Time: ${err.created_at}
🔴 Message: ${err.error_message}

\`\`\`
${err.stack_trace || 'No stack trace'}
\`\`\``

    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(err.id)
      setTimeout(() => setCopiedId(null), 2500)
    })
  }

  const handleDeleteError = async (id) => {
    soundManager.playTrash()
    await supabase.from('ax_system_errors').delete().eq('id', id)
    setErrorsList((prev) => prev.filter((e) => e.id !== id))
  }

  const handlePurgeAllErrors = async () => {
    openConfirmModal({
      title: isRtl ? 'تطهير سجل الأخطاء' : 'Purge All Errors',
      message: isRtl ? 'هل تريد حذف كافة الأخطاء المسجلة نهائياً؟' : 'Delete all captured errors?',
      confirmText: isRtl ? 'تطهير الكل' : 'Purge All',
      type: 'danger',
      onConfirm: async () => {
        soundManager.playTrash()
        await supabase.from('ax_system_errors').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        setErrorsList([])
      }
    })
  }

  const handleSendTestPush = async () => {
    soundManager.playClick()
    setPushTestSent(true)
    await pushManager.sendTestNotification(profile?.id, profile?.role)
    setTimeout(() => setPushTestSent(false), 3000)
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
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp my-6 flex flex-col text-start space-y-4 max-h-[92vh]">
        <button
          onClick={() => {
            soundManager.playClick()
            onClose()
          }}
          className="absolute top-4 start-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 pe-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {isRtl ? 'غرفة التحكم العليا - AXONID' : 'AXONID Master Control'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-black border border-amber-200">
                  v{import.meta.env.VITE_APP_VERSION || '4.5.7'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                  {profile.email}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-bold block mt-0.5">
                {isRtl ? 'مراقبة أخطاء النظام الحية وإدارة الصلاحيات وقاعدة البيانات' : 'Live error monitoring & system controls'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => {
              soundManager.playClick()
              setActiveTab('errors')
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'errors'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>رادار أخطاء النظام ({errorsList.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick()
              setActiveTab('settings')
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>إدارة الحصص والبيانات</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pe-1">
          {activeTab === 'errors' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800">الأخطاء المرصودة لحظياً</span>
                  <button
                    onClick={fetchErrors}
                    disabled={isLoadingErrors}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingErrors ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendTestPush}
                    disabled={pushTestSent}
                    className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Bell className="w-3 h-3 text-sky-600" />
                    <span>{pushTestSent ? 'تم الإرسال!' : 'اختبار إشعار Push'}</span>
                  </button>

                  {errorsList.length > 0 && (
                    <button
                      onClick={handlePurgeAllErrors}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>تطهير الكل</span>
                    </button>
                  )}
                </div>
              </div>

              {errorsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-black text-slate-800">المنظومة خالية من أي أخطاء</h4>
                  <p className="text-xs text-slate-500 font-bold">لم يُسجل أي خطأ برمجي في جدول ax_system_errors.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {errorsList.map((err) => (
                    <div
                      key={err.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2 text-start"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-mono text-slate-500 block">
                            {new Date(err.created_at).toLocaleString('ar-EG')}
                          </span>
                          <h5 className="text-xs font-black text-rose-900 mt-0.5 break-words">
                            {err.error_message}
                          </h5>
                          {err.source && (
                            <span className="text-[10px] text-slate-600 font-bold block mt-0.5">
                              {err.source}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleCopyError(err)}
                            title="نسخ تفاصيل الخطأ لإرسالها للأيجنت"
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            {copiedId === err.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px]">نسخ للأيجنت</span>
                          </button>

                          <button
                            onClick={() => handleDeleteError(err.id)}
                            title="حذف هذا الخطأ"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {err.stack_trace && (
                        <pre className="text-[10px] font-mono p-2 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto max-h-28 leading-relaxed">
                          {err.stack_trace}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-700" />
                    <span>الحد الأقصى للمستخدمين المرخصين</span>
                  </span>
                  <span className="font-mono font-black text-lg text-sky-800">{maxUsers}</span>
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
                  <span>50 مستخدم</span>
                </div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-rose-600" />
                    <span>تصفير الحجوزات والمصاريف</span>
                  </h4>
                  <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                    يمسح كافة الحجوزات الحالية ({bookings.length} حجز) وسجلات الاستيراد السابقة لبدء شيت جديد.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleWipeDatabase}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0"
                >
                  تصفير البيانات الآن
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
