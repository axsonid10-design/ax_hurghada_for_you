import React from 'react'
import {
  X,
  ShieldCheck,
  Users,
  Database,
  Trash2
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'

export function AX_MasterControlModal({ isOpen, onClose }) {
  const profile = useAXStore((state) => state.profile)
  const isMaster =
    profile?.email?.toLowerCase() === 'axsonid@gmail.com' ||
    profile?.email?.toLowerCase() === 'axonid@gmail.com' ||
    (profile?.is_master === true && (profile?.email?.toLowerCase()?.includes('axsonid') || profile?.email?.toLowerCase()?.includes('axonid')))

  if (!isOpen || !isMaster) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp my-6 flex flex-col text-start space-y-4">
        <button
          onClick={() => {
            soundManager.playClick()
            onClose()
          }}
          className="absolute top-4 start-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {isRtl ? 'غرفة تحكم المنظومة' : 'Master Control Room'}
            </h3>
            <span className="text-xs text-slate-500 font-bold block mt-0.5">
              {isRtl ? 'التحكم في سعة المستخدمين وتصفير قاعدة البيانات' : 'User quotas & database reset'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Max Users Quota */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-700" />
                {isRtl ? 'الحد الأقصى للمستخدمين المرخصين' : 'Max Users Quota'}
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
              <span>50 {isRtl ? 'مستخدم' : 'users'}</span>
            </div>
          </div>

          {/* Wipe Database */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-rose-600" />
                <span>{isRtl ? 'تصفير الحجوزات والمصاريف' : 'Wipe All Bookings & Expenses'}</span>
              </h4>
              <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                {isRtl
                  ? `يمسح كافة الحجوزات الحالية (${bookings.length} حجز) وسجلات الاستيراد السابقة لبدء شيت جديد.`
                  : `Deletes all current ${bookings.length} bookings to start fresh with a new Excel sheet.`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleWipeDatabase}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black transition-all active:scale-95 flex-shrink-0"
            >
              {isRtl ? 'تصفير البيانات الآن' : 'Wipe Data Now'}
            </button>
          </div>
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
