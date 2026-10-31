import ExcelJS from 'exceljs'

export async function parseExcelDailySituation(fileBuffer, filename = '') {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(fileBuffer)

  const worksheet = workbook.getWorksheet('Daily Situation') || workbook.worksheets[0]
  if (!worksheet) {
    throw new Error('لم يتم العثور على شيت Daily Situation في ملف الإكسيل.')
  }

  const bookings = []
  const tripTypesSet = new Set()
  let batchDate = null

  // 1. Try extracting canonical date from filename (e.g. 10-28-2026, 2026-10-28, 28-10-2026)
  if (filename) {
    const fnMatchIso = filename.match(/(202\d)[-_](\d{1,2})[-_](\d{1,2})/)
    if (fnMatchIso) {
      batchDate = `${fnMatchIso[1]}-${fnMatchIso[2].padStart(2, '0')}-${fnMatchIso[3].padStart(2, '0')}`
    } else {
      const fnMatchUs = filename.match(/(\d{1,2})[-_](\d{1,2})[-_](202\d)/)
      if (fnMatchUs) {
        let p1 = parseInt(fnMatchUs[1], 10)
        let p2 = parseInt(fnMatchUs[2], 10)
        let year = fnMatchUs[3]
        let month = p1
        let day = p2
        if (p1 > 12 && p2 <= 12) {
          day = p1
          month = p2
        }
        batchDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
    }
  }

  for (let i = 1; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i).values
    if (!row) continue

    const srRaw = row[1]
    if (srRaw && /^\d{5,8}$/.test(String(srRaw).trim())) {
      const sr = String(srRaw).trim()
      const rawDate = String(row[2] || '').split(' - ')[0].trim()

      let normalizedDate = ''
      if (rawDate) {
        const parts = rawDate.split(/[\/\-\.]/)
        if (parts.length === 3) {
          let p1 = parseInt(parts[0], 10)
          let p2 = parseInt(parts[1], 10)
          let rawYear = parts[2].trim()
          let year = rawYear.length === 2 ? `20${rawYear}` : rawYear

          // Anti-future / anti-typo clamp: year should match batch year or 2026
          const numYear = parseInt(year, 10)
          if (isNaN(numYear) || numYear > 2030 || numYear < 2020) {
            year = batchDate ? batchDate.split('-')[0] : '2026'
          }

          let month = p1
          let day = p2
          if (p1 > 12 && p2 <= 12) {
            day = p1
            month = p2
          }

          normalizedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          if (!batchDate) batchDate = normalizedDate
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
          normalizedDate = rawDate
          if (!batchDate) batchDate = normalizedDate
        } else {
          normalizedDate = batchDate || new Date().toISOString().split('T')[0]
        }
      }

      const effectiveDate = normalizedDate || batchDate || new Date().toISOString().split('T')[0]

      const seller = String(row[3] || '').trim()
      const channel = String(row[4] || '').trim()
      const tripType = String(row[5] || '').trim()
      const hotel = String(row[6] || '').trim()
      const guestName = String(row[7] || '').trim()
      const room = String(row[8] || '').trim()
      const adult = parseInt(row[9] || 0, 10) || 0
      const child = parseInt(row[10] || 0, 10) || 0
      const inf = parseInt(row[11] || 0, 10) || 0
      const psSnk = String(row[12] || '').trim()
      const restEur = parseFloat(row[13] || 0) || 0
      const restEgp = parseFloat(row[14] || 0) || 0
      const restUsd = parseFloat(row[15] || 0) || 0
      const restGbp = parseFloat(row[16] || 0) || 0

      if (tripType) {
        tripTypesSet.add(tripType)
      }

      bookings.push({
        sr,
        date: effectiveDate,
        seller,
        channel,
        trip_type: tripType,
        hotel,
        guest_name: guestName,
        room,
        adult,
        child,
        infant: inf,
        ps_snk: psSnk,
        rest_eur: restEur,
        rest_egp: restEgp,
        rest_usd: restUsd,
        rest_gbp: restGbp,
        status: restEur === 0 && restEgp === 0 && restUsd === 0 && restGbp === 0 ? 'paid' : 'pending'
      })
    }
  }

  return {
    date: batchDate || new Date().toISOString().split('T')[0],
    bookings,
    tripTypes: Array.from(tripTypesSet),
    totalRows: bookings.length
  }
}
