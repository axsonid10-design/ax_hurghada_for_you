import React, { useState } from 'react'
import { X, Plus, Edit2, Trash2, Check, Tag, Sparkles } from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'

export function ManageCategoriesModal({ isOpen, mode = 'trip', onClose }) {
  const {
    tripCategories,
    executorCategories,
    addTripCategory,
    updateTripCategory,
    deleteTripCategory,
    addExecutorCategory,
    updateExecutorCategory,
    deleteExecutorCategory
  } = useAXStore()

  const [newCatName, setNewCatName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingValue, setEditingValue] = useState('')

  if (!isOpen) return null

  const isTrip = mode === 'trip'
  const title = isTrip ? 'إدارة وتعديل أقسام الرحلات' : 'إدارة وتعديل تصنيفات الأنشطة'

  const handleAdd = (e) => {
    e.preventDefault()
    const clean = newCatName.trim()
    if (!clean) return

    soundManager.playSuccess()
    if (isTrip) {
      const id = 'cat_' + Date.now()
      addTripCategory({ id, label: clean })
    } else {
      addExecutorCategory(clean)
    }
    setNewCatName('')
  }

  const startEdit = (id, currentVal) => {
    soundManager.playClick()
    setEditingId(id)
    setEditingValue(currentVal)
  }

  const saveEdit = (id) => {
    const clean = editingValue.trim()
    if (!clean) return

    soundManager.playSuccess()
    if (isTrip) {
      updateTripCategory(id, clean)
    } else {
      updateExecutorCategory(id, clean)
    }
    setEditingId(null)
    setEditingValue('')
  }

  const handleDelete = (id) => {
    soundManager.playAlert()
    if (isTrip) {
      deleteTripCategory(id)
    } else {
      deleteExecutorCategory(id)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 bg-[#0a2540]/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-scaleUp max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-50 text-[#0284c7] flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-[#0a2540]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex items-center gap-2 mb-4 flex-shrink-0">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder={isTrip ? 'اسم القسم الجديد (مثال: ألعاب مائية)...' : 'اسم تصنيف النشاط الجديد...'}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95 flex items-center gap-1 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {isTrip ? (
            tripCategories.map((cat) => {
              const isEditing = editingId === cat.id
              return (
                <div
                  key={cat.id}
                  className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 bg-white border border-[#0284c7] rounded-full px-3 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(cat.id)}
                        className="p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(cat.id, cat.label)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-full hover:bg-white transition-colors"
                          title="تعديل المسمى"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-white transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          ) : (
            executorCategories.map((name) => {
              const isEditing = editingId === name
              return (
                <div
                  key={name}
                  className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 bg-white border border-[#0284c7] rounded-full px-3 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(name)}
                        className="p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {name}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(name, name)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-full hover:bg-white transition-colors"
                          title="تعديل المسمى"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-white transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
