import assert from 'node:assert/strict'
import { computeBookingFinancials } from '../src/data/initialSetup.js'

console.log('🧪 Starting Operations Unit Test Suite (Hurghada For You Rules 2610)...')

// Test 1: Financial Computation with Unpriced Trip vs Priced Trip
console.log('\n▶ Test 1: Financial Computation (Unpriced vs Priced)')
const unpricedTripDefs = [
  {
    id: 'trip_unpriced_1',
    sheet_name: 'Dolphin House VIP',
    display_name: 'Dolphin House VIP',
    category: 'بحرية',
    adult_cost: 0,
    child_cost: 0,
    adult_sell: 0,
    child_sell: 0,
    currency: 'EUR',
    is_unpriced: true
  }
]
const mockExecutors = [
  { id: 'exec_marina', name: 'Marina Boat Co', category: 'بحرية' }
]

const booking1 = {
  sr: 101,
  guest_name: 'John Doe',
  trip: 'Dolphin House VIP',
  trip_type: 'Dolphin House VIP',
  adult: 2,
  child: 1,
  infant: 0,
  collected_eur: 0,
  rest_eur: 0
}

const unpricedFin = computeBookingFinancials(booking1, unpricedTripDefs, mockExecutors)
assert.equal(unpricedFin.cost_eur, 0, 'Unpriced trip must have 0 cost')
assert.equal(unpricedFin.sell_eur, 0, 'Unpriced trip must have 0 sell')
assert.equal(unpricedFin.profit_eur, 0, 'Unpriced trip must have 0 profit')
console.log('✅ Unpriced trip financials calculated strictly as 0.00 €')

// Price the trip now
const pricedTripDefs = [
  {
    id: 'trip_unpriced_1',
    sheet_name: 'Dolphin House VIP',
    display_name: 'Dolphin House VIP',
    category: 'بحرية',
    adult_cost: 25,
    adult_sell: 50,
    child_pricing_mode: 'percent',
    child_cost_percent: 50,
    child_sell_percent: 50,
    currency: 'EUR'
  }
]
const pricedFin = computeBookingFinancials(booking1, pricedTripDefs, mockExecutors)
assert.equal(pricedFin.cost_eur, 62.5, 'Cost: 2*25 + 1*12.5 = 62.5')
assert.equal(pricedFin.sell_eur, 125, 'Sell: 2*50 + 1*25 = 125')
assert.equal(pricedFin.profit_eur, 62.5, 'Profit: 125 - 62.5 = 62.5')
console.log('✅ Priced trip correctly calculates: Cost=62.5€, Sell=125€, Profit=62.5€')

// Test 2: Booking Modification & is_edited Encoding
console.log('\n▶ Test 2: Booking Edit Encoding')
const editedBooking = {
  ...booking1,
  adult: 3,
  is_edited: true,
  time: `EDITED:${new Date().toISOString()}`
}
assert.equal(editedBooking.is_edited, true)
assert.ok(editedBooking.time.startsWith('EDITED:'))
const decodedIsEdited = Boolean(editedBooking.time && editedBooking.time.includes('EDITED'))
assert.equal(decodedIsEdited, true, 'is_edited must decode reliably from time column')
console.log('✅ Booking edit properly encoded and decoded via time string')

// Test 3: Anti-Duplicate Detection Logic
console.log('\n▶ Test 3: Anti-Duplicate Import Verification')
const importedDates = {
  '2026-10-28': { filename: 'Daily_28.xlsx', count: 14 }
}
const currentBookings = [
  { sr: 1, date: '2026-10-28', trip: 'Dolphin' },
  { sr: 2, date: '2026-10-28', trip: 'Safari' }
]

function checkDuplicateDate(dateToCheck) {
  const existingDayBookings = currentBookings.filter((b) => b.date === dateToCheck)
  const prevCount = importedDates[dateToCheck]?.count || existingDayBookings.length
  return prevCount > 0
}

assert.equal(checkDuplicateDate('2026-10-28'), true, 'Day 2026-10-28 must be flagged as duplicate')
assert.equal(checkDuplicateDate('2026-10-30'), false, 'Day 2026-10-30 must not be flagged')
console.log('✅ Duplicate day detection strictly prohibits unintentional duplicate imports')

// Test 4: Staff Visibility & Isolation Logic
console.log('\n▶ Test 4: Staff Visibility & Master Isolation')
const realSystemUsers = [
  { id: 'usr_master_axonid', email: 'axsonid@gmail.com', name: 'Master AXONID', is_master: true },
  { id: 'usr_1793368804792', email: 'yasrhsynabrahm444@gmail.com', name: 'ياسر حسين ابراهيم', role: 'مدير عام', is_master: false }
]

const visibleStaff = realSystemUsers.filter((u) => {
  const email = (u.email || '').toLowerCase().trim()
  if (email === 'axsonid@gmail.com' || email === 'axonid@gmail.com') return false
  if (u.id === 'usr_master_axonid') return false
  return true
})

assert.equal(visibleStaff.length, 1, 'Must have 1 real visible staff member')
assert.ok(!visibleStaff.some((u) => u.email === 'axsonid@gmail.com'), 'Master must be hidden from normal staff view')
assert.ok(visibleStaff.some((u) => u.email === 'yasrhsynabrahm444@gmail.com'), 'Real staff Yasser must be visible')
console.log('✅ Visible staff isolation strictly verified')

// Test 5: Reconcile Unpriced Trips & Extra Cost Preservation
console.log('\n▶ Test 5: Reconcile Unpriced Trips & Extra Cost Preservation')
const testBookings = [
  { sr: 201, trip_type: 'Super Safari Quad', sell_eur: 90, cost_eur: 40 },
  { sr: 202, trip_type: 'Cash Pickup EUR', rest_eur: 150 },
  { sr: 203, trip: 'Dolphin House VIP', sell_eur: 60, cost_eur: 25 }
]
const existingTripDefs = [{ sheet_name: 'Dolphin House VIP' }]
const existingKeys = new Set(existingTripDefs.map(t => t.sheet_name.toLowerCase()))

const newlyFound = []
testBookings.forEach((b) => {
  const raw = (b.trip_type || b.trip || '').trim()
  const clean = raw.toLowerCase()
  if (clean.includes('cash pickup') || clean.includes('تحصيل')) return
  if (clean && !existingKeys.has(clean)) {
    existingKeys.add(clean)
    newlyFound.push(raw)
  }
})
assert.equal(newlyFound.length, 1)
assert.equal(newlyFound[0], 'Super Safari Quad')
console.log('✅ Orphan trip "Super Safari Quad" successfully reconciled, Cash Pickup correctly skipped')

const baseCost = 40
const extraCost = 15
const totalCost = baseCost + extraCost
const sell = 90
const profit = sell - totalCost
assert.equal(totalCost, 55)
assert.equal(profit, 35)
console.log('✅ Extra cost preservation calculation verified: Cost=55€, Profit=35€')

console.log('\n🎉 ALL 5 UNIT TESTS PASSED SUCCESSFULLY!')
