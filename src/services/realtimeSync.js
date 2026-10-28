import { supabase } from './supabaseClient'
import { useAXStore } from '../store/useAXStore'

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
      })
    }

    useAXStore.setState(updates)
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
          if (!current.some((x) => x.id === b.id || (x.sr === b.sr && x.date === b.date))) {
            const next = [b, ...current]
            useAXStore.setState({ bookings: next })
            localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
          }
        } else if (payload.eventType === 'UPDATE') {
          const b = payload.new
          const next = current.map((x) => (x.id === b.id || (x.sr === b.sr && x.date === b.date) ? { ...x, ...b } : x))
          useAXStore.setState({ bookings: next })
          localStorage.setItem('ax_h4u_bookings', JSON.stringify(next))
        } else if (payload.eventType === 'DELETE') {
          const next = current.filter((x) => x.id !== payload.old.id && x.sr !== payload.old.sr)
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
          const exp = payload.new
          if (!current.some((x) => x.id === exp.id)) {
            const next = [exp, ...current]
            useAXStore.setState({ expenses: next })
            localStorage.setItem('ax_h4u_expenses', JSON.stringify(next))
          }
        } else if (payload.eventType === 'DELETE') {
          const next = current.filter((x) => x.id !== payload.old.id)
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

  return () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
    }
  }
}

// Background Cloud Persistence Helpers
export async function cloudSaveTrip(trip) {
  try {
    const payload = {
      id: trip.id,
      sheet_name: trip.sheet_name,
      display_name: trip.display_name,
      category: trip.category || 'sea',
      pricing_type: trip.pricing_type || 'pax',
      currency: trip.currency || 'EUR',
      adult_cost: Number(trip.adult_cost) || 0,
      adult_sell: Number(trip.adult_sell) || 0,
      child_pricing_mode: trip.child_pricing_mode || 'percent',
      child_cost_percent: Number(trip.child_cost_percent) || 0,
      child_sell_percent: Number(trip.child_sell_percent) || 0,
      child_cost_fixed: Number(trip.child_cost_fixed) || 0,
      child_sell_fixed: Number(trip.child_sell_fixed) || 0,
      executor_id: trip.executor_id || 'exec_marina'
    }
    await supabase.from('ax_h4u_trips').upsert(payload)
  } catch (e) {
    console.error('cloudSaveTrip error:', e)
  }
}

export async function cloudDeleteTrip(id) {
  try {
    await supabase.from('ax_h4u_trips').delete().eq('id', id)
  } catch (e) {
    console.error('cloudDeleteTrip error:', e)
  }
}

export async function cloudSaveExecutor(ex) {
  try {
    const payload = {
      id: ex.id,
      name: ex.name,
      phone: ex.phone || '',
      category: ex.category || 'رحلات بحرية وجزر',
      cost_price: Number(ex.cost_price) || 0,
      pricing_type: ex.pricing_type || 'pax',
      currency: ex.currency || 'EUR',
      notes: ex.notes || '',
      total_paid: Number(ex.total_paid) || 0
    }
    await supabase.from('ax_h4u_executors').upsert(payload)
  } catch (e) {
    console.error('cloudSaveExecutor error:', e)
  }
}

export async function cloudDeleteExecutor(id) {
  try {
    await supabase.from('ax_h4u_executors').delete().eq('id', id)
  } catch (e) {
    console.error('cloudDeleteExecutor error:', e)
  }
}

export async function cloudSaveBooking(booking) {
  try {
    const payload = {
      id: booking.id || `bk_${booking.sr}_${booking.date}`,
      sr: String(booking.sr),
      date: booking.date,
      time: booking.time || '',
      seller: booking.seller || '',
      channel: booking.channel || '',
      trip_type: booking.trip_type || '',
      trip_id: booking.trip_id || null,
      hotel: booking.hotel || '',
      guest_name: booking.guest_name || '',
      room: String(booking.room || ''),
      adult: Number(booking.adult) || 0,
      child: Number(booking.child) || 0,
      infant: Number(booking.infant) || 0,
      ps_snk: booking.ps_snk || '',
      rest_eur: Number(booking.rest_eur) || 0,
      rest_egp: Number(booking.rest_egp) || 0,
      rest_usd: Number(booking.rest_usd) || 0,
      rest_gbp: Number(booking.rest_gbp) || 0,
      cost_eur: Number(booking.cost_eur) || 0,
      sell_eur: Number(booking.sell_eur) || 0,
      profit_eur: Number(booking.profit_eur) || 0,
      collected_eur: Number(booking.collected_eur) || 0,
      executor_id: booking.executor_id || 'exec_marina',
      status: booking.status || 'pending'
    }
    await supabase.from('ax_h4u_bookings').upsert(payload)
  } catch (e) {
    console.error('cloudSaveBooking error:', e)
  }
}

export async function cloudDeleteBooking(srOrId) {
  try {
    await supabase.from('ax_h4u_bookings').delete().or(`id.eq.${srOrId},sr.eq.${srOrId}`)
  } catch (e) {
    console.error('cloudDeleteBooking error:', e)
  }
}

export async function cloudSaveBatch(date, filename, bookings, overwrite = false) {
  try {
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

    // Insert bookings in chunks of 50
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
    }
  } catch (e) {
    console.error('cloudSaveBatch error:', e)
  }
}

export async function cloudSaveExpense(expense) {
  try {
    const payload = {
      id: expense.id,
      title: expense.title,
      category: expense.category,
      amount: Number(expense.amount) || 0,
      currency: expense.currency || 'EUR',
      date: expense.date,
      notes: expense.notes || ''
    }
    await supabase.from('ax_h4u_expenses').upsert(payload)
  } catch (e) {
    console.error('cloudSaveExpense error:', e)
  }
}

export async function cloudDeleteExpense(id) {
  try {
    await supabase.from('ax_h4u_expenses').delete().eq('id', id)
  } catch (e) {
    console.error('cloudDeleteExpense error:', e)
  }
}

export async function cloudSaveSettings(key, value) {
  try {
    await supabase.from('ax_h4u_settings').upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    })
  } catch (e) {
    console.error('cloudSaveSettings error:', e)
  }
}

export async function cloudWipeAll() {
  try {
    await Promise.all([
      supabase.from('ax_h4u_bookings').delete().neq('id', '_none_'),
      supabase.from('ax_h4u_expenses').delete().neq('id', '_none_'),
      supabase.from('ax_h4u_batches').delete().neq('date', '1970-01-01')
    ])
  } catch (e) {
    console.error('cloudWipeAll error:', e)
  }
}
