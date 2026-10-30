import { supabase } from './supabaseClient'
import { useAXStore } from '../store/useAXStore'
import { addOfflineAction, getOfflineActions, removeOfflineAction } from './offlineQueue'
import { AX_alertTelegram } from '../utils/AX_TelegramAlert'

export {
  cloudSaveTrip,
  cloudDeleteTrip,
  cloudSaveExecutor,
  cloudDeleteExecutor,
  cloudSaveBooking,
  cloudDeleteBooking,
  cloudSaveExpense,
  cloudDeleteExpense,
  cloudSaveSettings,
  cloudWipeAll
} from './cloudDataServices'

let realtimeChannel = null

export async function fetchCloudData() {
  try {
    const [tripsRes, execsRes, bookingsRes, expensesRes, batchesRes, settingsRes] = await Promise.all([
      supabase.from('ax_h4u_trips').select('*').order('created_at', { ascending: true }),
      supabase.from('ax_h4u_executors').select('*').order('created_at', { ascending: true }),
      supabase.from('ax_h4u_bookings').select('*').order('date', { ascending: false }),
      supabase.from('ax_h4u_expenses').select('*').order('date', { ascending: false }),
      supabase.from('ax_h4u_batches').select('*').order('date', { ascending: false }),
      supabase.from('ax_h4u_settings').select('*')
    ])

    const updates = {}

    if (tripsRes.data && Array.isArray(tripsRes.data)) {
      updates.tripDefinitions = tripsRes.data.map((t) => ({
        ...t,
        adult_cost: Number(t.adult_cost) || 0,
        adult_sell: Number(t.adult_sell) || 0,
        child_cost_percent: Number(t.child_cost_percent) || 0,
        child_sell_percent: Number(t.child_sell_percent) || 0,
        child_cost_fixed: Number(t.child_cost_fixed) || 0,
        child_sell_fixed: Number(t.child_sell_fixed) || 0
      }))
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(updates.tripDefinitions))
      }
    }

    if (execsRes.data && Array.isArray(execsRes.data)) {
      updates.executors = execsRes.data.map((e) => ({
        ...e,
        cost_price: Number(e.cost_price) || 0,
        total_paid: Number(e.total_paid) || 0
      }))
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_executors', JSON.stringify(updates.executors))
      }
    }

    if (bookingsRes.data && Array.isArray(bookingsRes.data)) {
      updates.bookings = bookingsRes.data.map((b) => ({
        ...b,
        is_edited: Boolean(b.time && b.time.includes('EDITED')),
        rest_eur: Number(b.rest_eur) || 0,
        rest_egp: Number(b.rest_egp) || 0,
        rest_usd: Number(b.rest_usd) || 0,
        rest_gbp: Number(b.rest_gbp) || 0,
        cost_eur: Number(b.cost_eur) || 0,
        sell_eur: Number(b.sell_eur) || 0,
        profit_eur: Number(b.profit_eur) || 0,
        collected_eur: Number(b.collected_eur) || 0
      }))
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_bookings', JSON.stringify(updates.bookings))
      }
    }

    if (expensesRes.data && Array.isArray(expensesRes.data)) {
      updates.expenses = expensesRes.data.map((ex) => ({
        ...ex,
        amount: Number(ex.amount) || 0
      }))
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_expenses', JSON.stringify(updates.expenses))
      }
    }

    if (batchesRes.data && Array.isArray(batchesRes.data)) {
      const datesObj = {}
      batchesRes.data.forEach((b) => {
        datesObj[b.date] = {
          filename: b.filename,
          importedAt: b.imported_at,
          count: b.total_bookings
        }
      })
      updates.importedDates = datesObj
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ax_h4u_imported_dates', JSON.stringify(datesObj))
      }
    }

    if (settingsRes.data && Array.isArray(settingsRes.data)) {
      settingsRes.data.forEach((s) => {
        if (s.key === 'trip_categories' && Array.isArray(s.value)) {
          updates.tripCategories = s.value
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ax_h4u_trip_categories', JSON.stringify(s.value))
          }
        }
        if (s.key === 'executor_categories' && Array.isArray(s.value)) {
          updates.executorCategories = s.value
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ax_h4u_executor_categories', JSON.stringify(s.value))
          }
        }
        if (s.key === 'staff_invites' && Array.isArray(s.value)) {
          updates.staffInvites = s.value
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ax_h4u_staff_invites', JSON.stringify(s.value))
          }
        }
        if (s.key === 'system_users' && Array.isArray(s.value) && s.value.length > 0) {
          updates.systemUsers = s.value
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ax_h4u_system_users', JSON.stringify(s.value))
          }
        }
      })
    }

    useAXStore.setState(updates)
    if (typeof useAXStore.getState().reconcileUnpricedTrips === 'function') {
      useAXStore.getState().reconcileUnpricedTrips()
    }
  } catch (err) {
    console.error('fetchCloudData error:', err)
  }
}

export function initRealtimeSync() {
  fetchCloudData()

  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }

  realtimeChannel = supabase
    .channel('h4u_realtime_stream')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ax_h4u_trips' },
      (payload) => {
        const current = useAXStore.getState().tripDefinitions || []
        if (payload.eventType === 'INSERT') {
          const trip = payload.new
          if (!current.some((t) => t.id === trip.id)) {
            const next = [...current, trip]
            useAXStore.setState({ tripDefinitions: next })
            localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(next))
          }
        } else if (payload.eventType === 'UPDATE') {
          const trip = payload.new
          const next = current.map((t) => (t.id === trip.id ? { ...t, ...trip } : t))
          useAXStore.setState({ tripDefinitions: next })
          localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(next))
        } else if (payload.eventType === 'DELETE') {
          const next = current.filter((t) => t.id !== payload.old.id)
          useAXStore.setState({ tripDefinitions: next })
          localStorage.setItem('ax_h4u_trip_definitions', JSON.stringify(next))
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ax_h4u_executors' },
      (payload) => {
        const current = useAXStore.getState().executors || []
        if (payload.eventType === 'INSERT') {
          const ex = payload.new
          if (!current.some((e) => e.id === ex.id)) {
            const next = [...current, ex]
            useAXStore.setState({ executors: next })
            localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
          }
        } else if (payload.eventType === 'UPDATE') {
          const ex = payload.new
          const next = current.map((e) => (e.id === ex.id ? { ...e, ...ex } : e))
          useAXStore.setState({ executors: next })
          localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
        } else if (payload.eventType === 'DELETE') {
          const next = current.filter((e) => e.id !== payload.old.id)
          useAXStore.setState({ executors: next })
          localStorage.setItem('ax_h4u_executors', JSON.stringify(next))
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ax_h4u_bookings' },
      (payload) => {
        const current = useAXStore.getState().bookings || []
        if (payload.eventType === 'INSERT') {
          const b = payload.new
          if (!current.some((x) => x.id === b.id || x.sr === b.sr)) {
            const next = [b, ...current]
            useAXStore.setState({ bookings: next })
            localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
          }
        } else if (payload.eventType === 'UPDATE') {
          const b = payload.new
          const isEdited = Boolean(b.time && b.time.includes('EDITED'))
          const formatted = { ...b, is_edited: isEdited }
          const next = current.map((x) => (x.id === b.id || x.sr === b.sr ? { ...x, ...formatted } : x))
          useAXStore.setState({ bookings: next })
          localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
        } else if (payload.eventType === 'DELETE') {
          const next = current.filter((x) => x.id !== payload.old?.id && x.sr !== payload.old?.sr)
          useAXStore.setState({ bookings: next })
          localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ax_h4u_expenses' },
      (payload) => {
        const current = useAXStore.getState().expenses || []
        if (payload.eventType === 'INSERT') {
          const ex = payload.new
          if (!current.some((x) => x.id === ex.id)) {
            const next = [ex, ...current]
            useAXStore.setState({ expenses: next })
            localStorage.setItem('ax_h4u_expenses', JSON.stringify(next))
          }
        } else if (payload.eventType === 'UPDATE') {
          const ex = payload.new
          const next = current.map((x) => (x.id === ex.id ? { ...x, ...ex } : x))
          useAXStore.setState({ expenses: next })
          localStorage.setItem('ax_h4u_expenses', JSON.stringify(next))
        } else if (payload.eventType === 'DELETE') {
          const next = current.filter((x) => x.id !== payload.old?.id)
          useAXStore.setState({ expenses: next })
          localStorage.setItem('ax_h4u_expenses', JSON.stringify(next))
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ax_h4u_settings' },
      (payload) => {
        if (payload.new?.key === 'trip_categories' && Array.isArray(payload.new?.value)) {
          useAXStore.setState({ tripCategories: payload.new.value })
          localStorage.setItem('ax_h4u_trip_categories', JSON.stringify(payload.new.value))
        }
        if (payload.new?.key === 'executor_categories' && Array.isArray(payload.new?.value)) {
          useAXStore.setState({ executorCategories: payload.new.value })
          localStorage.setItem('ax_h4u_executor_categories', JSON.stringify(payload.new.value))
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ax_h4u_batches' },
      () => {
        fetchCloudData()
      }
    )
    .subscribe((status) => {
      useAXStore.setState({ isOnline: status === 'SUBSCRIBED' })
    })

  const handleOnline = async () => {
    useAXStore.setState({ isOnline: true })
    await resumeOfflineSync()
  }

  const handleOffline = () => {
    useAXStore.setState({ isOnline: false })
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }

  return () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
}

export async function cloudSaveBatch(date, filename, bookings, overwrite = false) {
  const store = useAXStore.getState()
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  if (!isOnline) {
    await addOfflineAction({
      type: 'SAVE_BATCH',
      date,
      filename,
      bookings,
      overwrite
    })
    store.setSyncStatus({
      isSyncing: false,
      pendingCount: bookings.length,
      message: `أوفلاين: تم حفظ ${bookings.length} حجز محلياً بانتظار عودة الاتصال`
    })
    return
  }

  try {
    store.setSyncStatus({
      isSyncing: true,
      progress: 5,
      pendingCount: bookings.length,
      message: `جاري تحضير مزامنة الدفعة (${bookings.length} حجز)...`
    })

    if (overwrite) {
      await supabase.from('ax_h4u_bookings').delete().eq('date', date)
    }

    const payloadBatch = {
      date,
      filename,
      total_bookings: bookings.length,
      total_pax: bookings.reduce((sum, b) => sum + (Number(b.adult) || 0) + (Number(b.child) || 0), 0),
      total_sales_eur: bookings.reduce((sum, b) => sum + (Number(b.sell_eur) || 0), 0),
      total_cost_eur: bookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0),
      imported_at: new Date().toISOString()
    }
    await supabase.from('ax_h4u_batches').upsert(payloadBatch)

    const rows = bookings.map((b) => ({
      id: b.id || `bk_${b.sr}_${date}`,
      sr: String(b.sr),
      date,
      time: b.time || '',
      seller: b.seller || '',
      channel: b.channel || '',
      trip_type: b.trip_type || '',
      trip_id: b.trip_id || null,
      hotel: b.hotel || '',
      guest_name: b.guest_name || '',
      room: String(b.room || ''),
      adult: Number(b.adult) || 0,
      child: Number(b.child) || 0,
      infant: Number(b.infant) || 0,
      ps_snk: b.ps_snk || '',
      rest_eur: Number(b.rest_eur) || 0,
      rest_egp: Number(b.rest_egp) || 0,
      rest_usd: Number(b.rest_usd) || 0,
      rest_gbp: Number(b.rest_gbp) || 0,
      cost_eur: Number(b.cost_eur) || 0,
      sell_eur: Number(b.sell_eur) || 0,
      profit_eur: Number(b.profit_eur) || 0,
      collected_eur: Number(b.collected_eur) || 0,
      executor_id: b.executor_id || 'exec_marina',
      status: b.status || 'pending'
    }))

    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50)
      await supabase.from('ax_h4u_bookings').upsert(chunk)

      const percent = Math.min(95, Math.round(((i + chunk.length) / rows.length) * 100))
      store.setSyncStatus({
        isSyncing: true,
        progress: percent,
        pendingCount: rows.length - (i + chunk.length),
        message: `جاري مزامنة الدفعة مع السحابة (${i + chunk.length} من ${rows.length})...`
      })

      if (i + 50 < rows.length) {
        await new Promise((r) => setTimeout(r, 60))
      }
    }

    store.setSyncStatus({
      isSyncing: false,
      progress: 100,
      pendingCount: 0,
      message: `تمت المزامنة السحابية بنجاح (${rows.length} حجز)`
    })

    setTimeout(() => {
      useAXStore.getState().setSyncStatus({ message: '' })
    }, 3000)
  } catch (e) {
    console.error('cloudSaveBatch error:', e)
    AX_alertTelegram('SUPABASE_BATCH_SYNC_ERROR', e)
    store.setSyncStatus({
      isSyncing: false,
      message: 'تعذر الاتصال بالسحابة - تم تأمين البيانات محلياً'
    })
  }
}

export async function resumeOfflineSync() {
  try {
    const actions = await getOfflineActions()
    if (!actions || actions.length === 0) return

    for (const act of actions) {
      if (act.type === 'SAVE_BATCH') {
        await cloudSaveBatch(act.date, act.filename, act.bookings, act.overwrite)
        await removeOfflineAction(act.id)
      }
    }
  } catch (e) {
    console.error('resumeOfflineSync error:', e)
  }
}
