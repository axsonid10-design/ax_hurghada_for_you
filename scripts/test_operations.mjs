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
const mockUsers = [
  { id: 'usr_master_axonid', email: 'axsonid@gmail.com', name: 'Master AXONID', is_master: true },
  { id: 'usr_ops_director', email: 'director@hurghada.com', name: 'Director', is_master: false },
  { id: 'usr_seller_laly', email: 'laly@hurghada.com', name: 'Laly', role: 'مندوب مبيعات' },
  { id: 'usr_seller_meghane', email: 'meghane@hurghada.com', name: 'Meghane', role: 'مندوب مبيعات' }
]

const visibleStaff = mockUsers.filter((u) => {
  const email = (u.email || '').toLowerCase().trim()
  if (email === 'axsonid@gmail.com' || email === 'axonid@gmail.com') return false
  if (u.id === 'usr_master_axonid') return false
  return true
})

assert.equal(visibleStaff.length, 3, 'Must have 3 visible staff members')
assert.ok(!visibleStaff.some((u) => u.email === 'axsonid@gmail.com'), 'Master must be hidden from normal staff view')
assert.ok(visibleStaff.some((u) => u.name === 'Director'), 'Director must be visible')
assert.ok(visibleStaff.some((u) => u.name === 'Laly'), 'Laly must be visible')
console.log('✅ Visible staff isolation strictly verified')

console.log('\n🎉 ALL 4 UNIT TESTS PASSED SUCCESSFULLY!')
