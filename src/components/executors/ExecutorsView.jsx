import React, { useState } from 'react'
import {
  Truck,
  Plus,
  Search,
  Euro,
  Phone,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  X
} from 'lucide-react'
import { useAXStore } from '../../store/useAXStore'
import { soundManager } from '../../utils/soundEffects'
import { QuickAddExecutorModal } from './QuickAddExecutorModal'

export function ExecutorsView() {
  const { executors, bookings, recordExecutorPayment } = useAXStore()
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, executor: null, amount: '' })

  const filtered = executors.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.category.toLowerCase().includes(search.toLowerCase())
  )

  const handlePay = (e) => {
    e.preventDefault()
    const amt = parseFloat(paymentModal.amount)
    if (!amt || amt <= 0 || !paymentModal.executor) return

    soundManager.playSuccess()
    recordExecutorPayment(paymentModal.executor.id, amt)
    setPaymentModal({ isOpen: false, executor: null, amount: '' })
  }

  return (
    <div className="w-full space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h2 className="text-base font-black text-[#0a2540]">
            المنفذين وموردي الرحلات (Executors & Suppliers)
          </h2>
          <div className="text-xs font-bold text-slate-500">
            متابعة مستحقات المراكب واليخوت وشركات السفاري والغوص
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في المنفذين..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pr-9 pl-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <button
            onClick={() => {
              soundManager.playClick()
              setIsAddOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-md transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>منفذ جديد</span>
          </button>
        </div>
      </div>

      {/* Executors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((ex) => {
          const exBookings = bookings.filter((b) => b.executor_id === ex.id)
          const totalCostDue = exBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
          const totalPaid = ex.total_paid || 0
          const remainingBalance = Math.max(0, totalCostDue - totalPaid)
          const totalPax = exBookings.reduce((sum, b) => sum + (Number(b.adult) || 0) + (Number(b.child) || 0), 0)

          return (
            <div
              key={ex.id}
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center font-black">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#0a2540]">{ex.name}</h3>
                      <div className="text-[11px] font-bold text-slate-400">{ex.category}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {exBookings.length} رحلة
                  </span>
                </div>

                <div className="pt-2 space-y-2 text-xs">
                  {ex.phone && (
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                      <Phone className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span className="font-mono">{ex.phone}</span>
                    </div>
                  )}

                  {/* Financial Balances Card */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-sans text-slate-500">إجمالي التكلفة المستحقة:</span>
                      <span className="font-black text-[#0a2540]">€{totalCostDue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-sans text-slate-500">المسدد للمنفذ:</span>
                      <span className="font-bold text-emerald-600">€{totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                      <span className="font-sans font-bold text-slate-700">المتبقي له:</span>
                      <span className="font-black text-rose-600 text-sm">€{remainingBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                  {totalPax} فرد تم خدمتهم
                </span>
                <button
                  onClick={() => {
                    soundManager.playClick()
                    setPaymentModal({ isOpen: true, executor: ex, amount: '' })
                  }}
                  className="flex items-center gap-1 px-4 py-1.5 bg-[#0a2540] hover:bg-[#133e66] text-white rounded-full text-xs font-black shadow-sm transition-all active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>تسجيل دفعة</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Record Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a2540]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-black text-[#0a2540]">
                تسجيل دفعة إلى: {paymentModal.executor?.name}
              </h4>
              <button
                onClick={() => setPaymentModal({ isOpen: false, executor: null, amount: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">المبلغ المسدد باليورو (€)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={paymentModal.amount}
                  onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                  placeholder="مثال: 500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2 font-mono text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد صرف الدفعة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModal({ isOpen: false, executor: null, amount: '' })}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-full font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QuickAddExecutorModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  )
}
