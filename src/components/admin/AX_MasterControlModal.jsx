import React, { useState } from 'react'
import {
  X,
  ShieldCheck,
  Building2,
  Users,
  Database,
  Trash2,
  Plus
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'

export function AX_MasterControlModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const {
    maxUsers = 15,
    setMaxUsers,
    warehouses = [],
    maxWarehouses = 10,
    setMaxWarehouses,
    addWarehouse,
    deleteWarehouse,
    bookings = [],
    wipeAllData,
    openConfirmModal,
    lang,
    t
  } = useAXStore()

  const isRtl = lang === 'ar'

  const [isAddWhOpen, setIsAddWhOpen] = useState(false)
  const [whName, setWhName] = useState('')
  const [whLocation, setWhLocation] = useState('')
  const [whCapacity, setWhCapacity] = useState('100')

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

  const handleCreateWarehouse = (e) => {
    e.preventDefault()
    if (!whName.trim()) return

    soundManager.playSuccess()
    addWarehouse({
      name: whName.trim(),
      code: 'MAR-' + Math.floor(10 + Math.random() * 90),
      location: whLocation.trim() || 'الغردقة',
      capacity: Number(whCapacity) || 100,
      manager: 'مسؤول التشغيل',
      status: 'active'
    })

    setWhName('')
    setWhLocation('')
    setWhCapacity('100')
    setIsAddWhOpen(false)
  }

  const handleDeleteWh = (wh) => {
    openConfirmModal({
      title: isRtl ? 'حذف الفرع' : 'Delete Branch',
      message: isRtl
        ? `هل تريد حذف (${wh.name})؟`
        : `Delete (${wh.name})?`,
      confirmText: isRtl ? 'حذف' : 'Delete',
      cancelText: t('cancel'),
      type: 'danger',
      onConfirm: () => {
        soundManager.playTrash()
        deleteWarehouse(wh.id)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a2540]/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp my-6 max-h-[90vh] flex flex-col text-start">
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
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              {isRtl ? 'غرفة تحكم التراخيص والمنظومة' : 'Master System & License Room'}
            </h3>
            <span className="text-xs text-slate-500 font-bold block mt-0.5">
              {isRtl ? 'إدارة محددات السعة، الفروع، وتصفير قاعدة البيانات' : 'Quota limits, branches & data wipe'}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto space-y-4 py-4 flex-1 pe-1">
          {/* Quotas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-700" />
                  {isRtl ? 'الحد الأقصى للمستخدمين' : 'Max Users Quota'}
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

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  {isRtl ? 'الحد الأقصى للفروع/المخازن' : 'Max Branches Quota'}
                </span>
                <span className="font-mono font-black text-lg text-amber-800">{maxWarehouses}</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={maxWarehouses}
                onChange={(e) => setMaxWarehouses(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                <span>2</span>
                <span>15</span>
                <span>30 {isRtl ? 'فرع' : 'branches'}</span>
              </div>
            </div>
          </div>

          {/* Branches / Marina */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">
                {isRtl ? `نقاط الانطلاق والمخازن (${warehouses.length}/${maxWarehouses}):` : `Branches (${warehouses.length}/${maxWarehouses}):`}
              </span>
              <button
                type="button"
                onClick={() => setIsAddWhOpen(!isAddWhOpen)}
                disabled={warehouses.length >= maxWarehouses}
                className="px-3 py-1 rounded-full text-xs font-black bg-[#0a2540] text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إضافة فرع' : 'Add Branch'}</span>
              </button>
            </div>

            {isAddWhOpen && (
              <form onSubmit={handleCreateWarehouse} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-fadeIn">
                <input
                  type="text"
                  required
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  placeholder={isRtl ? 'اسم الفرع / المارينا' : 'Branch Name'}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={whLocation}
                    onChange={(e) => setWhLocation(e.target.value)}
                    placeholder={isRtl ? 'الموقع' : 'Location'}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                  />
                  <input
                    type="number"
                    value={whCapacity}
                    onChange={(e) => setWhCapacity(e.target.value)}
                    placeholder={isRtl ? 'السعة' : 'Capacity'}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0a2540] text-white rounded-full text-xs font-black"
                  >
                    {isRtl ? 'حفظ' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddWhOpen(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-xs font-bold"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {warehouses.map((wh) => (
                <div
                  key={wh.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-900 truncate block">
                      {wh.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      {wh.code} • {isRtl ? `السعة: ${wh.capacity}` : `Capacity: ${wh.capacity}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWh(wh)}
                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Wipe Database */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-rose-600" />
                <span>{isRtl ? 'تصفير كافة الحجوزات والمصاريف' : 'Wipe All Bookings & Expenses'}</span>
              </h4>
              <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                {isRtl
                  ? `يمسح كافة الحجوزات الحالية (${bookings.length} حجز) والمصاريف لبدء شيت جديد.`
                  : `Deletes all current ${bookings.length} bookings to start fresh.`}
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

        <div className="pt-3 border-t border-slate-100 flex justify-end">
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
