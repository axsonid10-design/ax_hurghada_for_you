import { SEED_BOOKINGS, SEED_TRIP_NAMES } from './seedData'

export const INITIAL_EXECUTORS = [
  {
    id: 'exec_marina',
    name: 'يخوت مارينا البحر الأحمر',
    phone: '01001234567',
    category: 'رحلات بحرية وجزر',
    notes: 'تنفيذ رحلات هولا هولا، أورانج باي، والجزيرة البيضاء',
    total_paid: 1200
  },
  {
    id: 'exec_safari',
    name: 'مؤسسة صحراء الغردقة للسفاري',
    phone: '01229876543',
    category: 'سفاري ومغامرات',
    notes: 'سوبر سفاري، بيتش باجي، عشاء بدوي',
    total_paid: 600
  },
  {
    id: 'exec_diving',
    name: 'أكاديمية دولفين للغوص والرياضات البحرية',
    phone: '01115554321',
    category: 'غوص ودولفين هاوس',
    notes: 'غوص سكوبا، غواصة بحرية، باراشوت',
    total_paid: 450
  },
  {
    id: 'exec_transfers',
    name: 'ليموزين وانتقالات الغردقة السياحية',
    phone: '01099887766',
    category: 'نقل وخدمات خاصة',
    notes: 'انتقالات المطار، ركوب الخيل، سبا',
    total_paid: 300
  }
]

export function inferTripCategory(name = '') {
  const lower = (name || '').toLowerCase()
  if (lower.includes('safari') || lower.includes('سفاري') || lower.includes('باجي') || lower.includes('buggy') || lower.includes('quad') || lower.includes('صحراء')) return 'safari'
  if (lower.includes('island') || lower.includes('جزيرة') || lower.includes('orange') || lower.includes('paradise') || lower.includes('eden') || lower.includes('hula') || lower.includes('bianca') || lower.includes('white') || lower.includes('mahmya')) return 'islands'
  if (lower.includes('diving') || lower.includes('غوص') || lower.includes('dolphin') || lower.includes('دلافين') || lower.includes('submarine') || lower.includes('غواصة') || lower.includes('parasail') || lower.includes('باراشوت') || lower.includes('aqua') || lower.includes('أكوا') || lower.includes('snk') || lower.includes('سنوركل')) return 'aqua'
  if (lower.includes('pickup') || lower.includes('تحصيل') || lower.includes('transfer') || lower.includes('انتقال') || lower.includes('مطار') || lower.includes('airport') || lower.includes('horse') || lower.includes('خيل') || lower.includes('spa') || lower.includes('سبا') || lower.includes('city tour') || lower.includes('جولة')) return 'transfers'
  return 'sea'
}

export const INITIAL_TRIP_DEFINITIONS = [
  {
    id: 'hula_hula',
    sheet_name: 'Hula Hula',
    display_name: 'جزيرة هولا هولا (Hula Hula Island)',
    category: 'islands',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 35,
    adult_sell: 65,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 17.5,
    child_sell_fixed: 32.5,
    executor_id: 'exec_marina'
  },
  {
    id: 'hula_hula_white',
    sheet_name: 'Hula Hula island + White island',
    display_name: 'هولا هولا + الجزيرة البيضاء',
    category: 'islands',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 40,
    adult_sell: 75,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 20,
    child_sell_fixed: 37.5,
    executor_id: 'exec_marina'
  },
  {
    id: 'orange_bay_white',
    sheet_name: 'Orange bay + White island',
    display_name: 'أورانج باي + الجزيرة البيضاء',
    category: 'islands',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 35,
    adult_sell: 70,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 17.5,
    child_sell_fixed: 35,
    executor_id: 'exec_marina'
  },
  {
    id: 'orange_bay',
    sheet_name: 'Orange Bay',
    display_name: 'جزيرة أورانج باي (Orange Bay)',
    category: 'islands',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 30,
    adult_sell: 60,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 15,
    child_sell_fixed: 30,
    executor_id: 'exec_marina'
  },
  {
    id: 'super_safari',
    sheet_name: 'Super Safari',
    display_name: 'سوبر سفاري بالبيتش باجي وعشاء بدوي',
    category: 'safari',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 25,
    adult_sell: 50,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 12.5,
    child_sell_fixed: 25,
    executor_id: 'exec_safari'
  },
  {
    id: 'safari_combined',
    sheet_name: 'Safari Combined',
    display_name: 'سفاري كومبايند (دراجات + باجي)',
    category: 'safari',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 30,
    adult_sell: 55,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 15,
    child_sell_fixed: 27.5,
    executor_id: 'exec_safari'
  },
  {
    id: 'dolphin_house',
    sheet_name: 'Dolphin House',
    display_name: 'بيت الدلافين سنوركلينج (Dolphin House)',
    category: 'aqua',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 25,
    adult_sell: 45,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 12.5,
    child_sell_fixed: 22.5,
    executor_id: 'exec_diving'
  },
  {
    id: 'scuba_diving',
    sheet_name: 'Scuba diving day',
    display_name: 'يوم غوص كامل للمحترفين والمبتدئين',
    category: 'aqua',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 40,
    adult_sell: 80,
    child_pricing_mode: 'fixed',
    child_cost_percent: 100,
    child_sell_percent: 100,
    child_cost_fixed: 40,
    child_sell_fixed: 80,
    executor_id: 'exec_diving'
  },
  {
    id: 'semi_submarine',
    sheet_name: 'Semi-submarine',
    display_name: 'الغواصة الزجاجية شبه الغاطسة',
    category: 'aqua',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 20,
    adult_sell: 40,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 10,
    child_sell_fixed: 20,
    executor_id: 'exec_diving'
  },
  {
    id: 'parasailing',
    sheet_name: 'Parasailing',
    display_name: 'باراشوت مائي مفرد ومزدوج',
    category: 'aqua',
    pricing_type: 'trip',
    currency: 'EUR',
    adult_cost: 20,
    adult_sell: 45,
    child_pricing_mode: 'percent',
    child_cost_percent: 100,
    child_sell_percent: 100,
    child_cost_fixed: 20,
    child_sell_fixed: 45,
    executor_id: 'exec_diving'
  },
  {
    id: 'paradise_day',
    sheet_name: 'Paradise Day',
    display_name: 'يوم جزيرة باراديس الفاخر',
    category: 'islands',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 35,
    adult_sell: 65,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 17.5,
    child_sell_fixed: 32.5,
    executor_id: 'exec_marina'
  },
  {
    id: 'eden_day',
    sheet_name: 'Eden Day',
    display_name: 'يوم جزيرة إيدن أيلاند',
    category: 'islands',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 35,
    adult_sell: 70,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 17.5,
    child_sell_fixed: 35,
    executor_id: 'exec_marina'
  },
  {
    id: 'bianca_island',
    sheet_name: 'Bianca Island',
    display_name: 'جزيرة بيانكا بيتش VIP',
    category: 'islands',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 45,
    adult_sell: 90,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    child_cost_fixed: 22.5,
    child_sell_fixed: 45,
    executor_id: 'exec_marina'
  },
  {
    id: 'private_catamaran',
    sheet_name: 'Private Catamaran',
    display_name: 'كاتاماران خاص VIP بالرحلة',
    category: 'sea',
    pricing_type: 'trip',
    currency: 'EUR',
    adult_cost: 250,
    adult_sell: 450,
    child_pricing_mode: 'percent',
    child_cost_percent: 0,
    child_sell_percent: 0,
    child_cost_fixed: 0,
    child_sell_fixed: 0,
    executor_id: 'exec_marina'
  },
  {
    id: 'horse_riding',
    sheet_name: 'horse riding 2-hour afternoon',
    display_name: 'ركوب الخيل على الشاطئ والصحراء (ساعتين)',
    category: 'transfers',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 25,
    adult_sell: 50,
    child_pricing_mode: 'percent',
    child_cost_percent: 75,
    child_sell_percent: 75,
    child_cost_fixed: 18.75,
    child_sell_fixed: 37.5,
    executor_id: 'exec_transfers'
  },
  {
    id: 'spa',
    sheet_name: 'Spa',
    display_name: 'جلسة سبا ومساج وحمام تركي',
    category: 'transfers',
    pricing_type: 'pax',
    currency: 'EUR',
    adult_cost: 30,
    adult_sell: 65,
    child_pricing_mode: 'percent',
    child_cost_percent: 0,
    child_sell_percent: 0,
    child_cost_fixed: 0,
    child_sell_fixed: 0,
    executor_id: 'exec_transfers'
  },
  {
    id: 'transfer_from_airport',
    sheet_name: 'Transfer from airport',
    display_name: 'استقبال من مطار الغردقة للفندق',
    category: 'transfers',
    pricing_type: 'trip',
    currency: 'EUR',
    adult_cost: 15,
    adult_sell: 30,
    child_pricing_mode: 'percent',
    child_cost_percent: 0,
    child_sell_percent: 0,
    child_cost_fixed: 0,
    child_sell_fixed: 0,
    executor_id: 'exec_transfers'
  },
  {
    id: 'transfer_to_airport',
    sheet_name: 'Transfer to airport',
    display_name: 'توصيل من الفندق لمطار الغردقة',
    category: 'transfers',
    pricing_type: 'trip',
    currency: 'EUR',
    adult_cost: 15,
    adult_sell: 30,
    child_pricing_mode: 'percent',
    child_cost_percent: 0,
    child_sell_percent: 0,
    child_cost_fixed: 0,
    child_sell_fixed: 0,
    executor_id: 'exec_transfers'
  },
  {
    id: 'cash_pickup',
    sheet_name: 'Cash Pickup',
    display_name: 'تحصيل نقدي من الفنادق (Cash Pickup)',
    category: 'transfers',
    pricing_type: 'trip',
    currency: 'EUR',
    adult_cost: 0,
    adult_sell: 0,
    child_pricing_mode: 'percent',
    child_cost_percent: 0,
    child_sell_percent: 0,
    child_cost_fixed: 0,
    child_sell_fixed: 0,
    executor_id: 'exec_transfers'
  }
]

export function computeBookingFinancials(booking, tripDefs) {
  const tripDef = tripDefs.find(
    (td) => td.sheet_name.toLowerCase().trim() === (booking.trip_type || '').toLowerCase().trim()
  )

  if (!tripDef || tripDef.sheet_name === 'Cash Pickup') {
    const sellPrice = booking.rest_eur || 0
    return {
      cost_eur: 0,
      sell_eur: sellPrice,
      profit_eur: sellPrice,
      collected_eur: 0,
      executor_id: tripDef?.executor_id || 'exec_transfers',
      pricing_type: tripDef?.pricing_type || 'trip',
      currency: 'EUR'
    }
  }

  let totalCost = 0
  let totalSell = 0

  if (tripDef.pricing_type === 'trip') {
    totalCost = tripDef.adult_cost
    totalSell = tripDef.adult_sell
  } else {
    // Per Pax
    const adultCost = (booking.adult || 0) * tripDef.adult_cost
    const adultSell = (booking.adult || 0) * tripDef.adult_sell

    let childCostUnit = 0
    let childSellUnit = 0

    if (tripDef.child_pricing_mode === 'percent') {
      childCostUnit = tripDef.adult_cost * ((tripDef.child_cost_percent || 0) / 100)
      childSellUnit = tripDef.adult_sell * ((tripDef.child_sell_percent || 0) / 100)
    } else {
      childCostUnit = tripDef.child_cost_fixed || 0
      childSellUnit = tripDef.child_sell_fixed || 0
    }

    const childCost = (booking.child || 0) * childCostUnit
    const childSell = (booking.child || 0) * childSellUnit

    totalCost = adultCost + childCost
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
    executor_id: tripDef.executor_id,
    pricing_type: tripDef.pricing_type,
    currency: tripDef.currency || 'EUR'
  }
}

export function buildInitialBookings() {
  return SEED_BOOKINGS.map((b) => {
    const fin = computeBookingFinancials(b, INITIAL_TRIP_DEFINITIONS)
    return {
      ...b,
      ...fin,
      status: (b.rest_eur === 0 && b.rest_egp === 0 && b.rest_usd === 0 && b.rest_gbp === 0) ? 'paid' : 'pending'
    }
  })
}
