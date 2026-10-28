import { supabase } from './supabaseClient'

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
