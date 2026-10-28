export const INITIAL_EXECUTORS = []
export const INITIAL_EXPENSES = []

export const DEFAULT_TRIP_CATEGORIES = [
  { id: 'islands', label: 'جزر ويخوت بحرية' },
  { id: 'safari', label: 'سفاري ومغامرات صحراوية' },
  { id: 'aqua', label: 'غوص ودولفين هاوس وأكوا' },
  { id: 'sea', label: 'رحلات بحرية خاصة' },
  { id: 'transfers', label: 'انتقالات وخدمات سياحية' }
]

export const DEFAULT_EXECUTOR_CATEGORIES = [
  'رحلات بحرية وجزر',
  'سفاري ومغامرات',
  'غوص ودولفين هاوس',
  'نقل وخدمات خاصة'
]

export function inferTripCategory(name = '') {
  const lower = (name || '').toLowerCase()
  if (lower.includes('safari') || lower.includes('سفاري') || lower.includes('باجي') || lower.includes('buggy') || lower.includes('quad') || lower.includes('صحراء')) return 'safari'
  if (lower.includes('island') || lower.includes('جزيرة') || lower.includes('orange') || lower.includes('paradise') || lower.includes('eden') || lower.includes('hula') || lower.includes('bianca') || lower.includes('white') || lower.includes('mahmya')) return 'islands'
  if (lower.includes('diving') || lower.includes('غوص') || lower.includes('dolphin') || lower.includes('دلافين') || lower.includes('submarine') || lower.includes('غواصة') || lower.includes('parasail') || lower.includes('باراشوت') || lower.includes('aqua') || lower.includes('أكوا') || lower.includes('snk') || lower.includes('سنوركل')) return 'aqua'
  if (lower.includes('pickup') || lower.includes('تحصيل') || lower.includes('transfer') || lower.includes('انتقال') || lower.includes('مطار') || lower.includes('airport') || lower.includes('horse') || lower.includes('خيل') || lower.includes('spa') || lower.includes('سبا') || lower.includes('city tour') || lower.includes('جولة')) return 'transfers'
  return 'sea'
}

export const INITIAL_TRIP_DEFINITIONS = []

export function computeBookingFinancials(booking, tripDefs = [], executors = []) {
  const cleanTripType = (booking.trip_type || '').toLowerCase().trim().replace(/\s+/g, ' ')
  
  let tripDef = tripDefs.find((td) => {
    const sName = (td.sheet_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
    const dName = (td.display_name || '').toLowerCase().trim().replace(/\s+/g, ' ')
    return sName === cleanTripType || dName === cleanTripType
  })

  const assignedExecutorId = booking.executor_id || tripDef?.executor_id
  const executor = executors.find((ex) => ex.id === assignedExecutorId)

  if (cleanTripType.includes('cash pickup') || cleanTripType.includes('تحصيل')) {
    const cashAmount = booking.rest_eur || 0
    return {
      cost_eur: 0,
      sell_eur: cashAmount,
      profit_eur: 0,
      collected_eur: cashAmount,
      executor_id: assignedExecutorId || 'exec_transfers',
      pricing_type: 'trip',
      currency: 'EUR'
    }
  }

  if (!tripDef) {
    const sellPrice = booking.rest_eur || 0
    const exCost = executor && Number(executor.cost_price) > 0 ? Number(executor.cost_price) : 0
    return {
      cost_eur: exCost,
      sell_eur: sellPrice,
      profit_eur: Math.max(0, sellPrice - exCost),
      collected_eur: 0,
      executor_id: assignedExecutorId || 'exec_marina',
      pricing_type: executor?.pricing_type || 'pax',
      currency: 'EUR'
    }
  }

  let totalCost = 0
  let totalSell = 0

  const hasExecutorCost = executor && Number(executor.cost_price) > 0

  if (hasExecutorCost) {
    if (executor.pricing_type === 'trip') {
      totalCost = Number(executor.cost_price)
    } else {
      totalCost = ((booking.adult || 0) + (booking.child || 0)) * Number(executor.cost_price)
    }
  } else if (tripDef.pricing_type === 'trip') {
    totalCost = Number(tripDef.adult_cost) || 0
  } else {
    const adultCost = (booking.adult || 0) * (Number(tripDef.adult_cost) || 0)
    let childCostUnit = 0
    if (tripDef.child_pricing_mode === 'percent') {
      childCostUnit = (Number(tripDef.adult_cost) || 0) * ((Number(tripDef.child_cost_percent) || 0) / 100)
    } else {
      childCostUnit = Number(tripDef.child_cost_fixed) || 0
    }
    const childCost = (booking.child || 0) * childCostUnit
    totalCost = adultCost + childCost
  }

  if (tripDef.pricing_type === 'trip') {
    totalSell = Number(tripDef.adult_sell) || 0
  } else {
    const adultSell = (booking.adult || 0) * (Number(tripDef.adult_sell) || 0)
    let childSellUnit = 0
    if (tripDef.child_pricing_mode === 'percent') {
      childSellUnit = (Number(tripDef.adult_sell) || 0) * ((Number(tripDef.child_sell_percent) || 0) / 100)
    } else {
      childSellUnit = Number(tripDef.child_sell_fixed) || 0
    }
    const childSell = (booking.child || 0) * childSellUnit
    totalSell = adultSell + childSell
  }

  const restEur = booking.rest_eur || 0
  const collectedEur = Math.max(0, totalSell - restEur)
  const profitEur = totalSell - totalCost

  return {
    cost_eur: totalCost,
    sell_eur: totalSell,
    profit_eur: profitEur,
    collected_eur: collectedEur,
    executor_id: assignedExecutorId || tripDef.executor_id || 'exec_marina',
    pricing_type: tripDef.pricing_type,
    currency: tripDef.currency || 'EUR'
  }
}

export function buildInitialBookings() {
  return []
}
