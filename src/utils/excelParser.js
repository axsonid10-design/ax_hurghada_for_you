import ExcelJS from 'exceljs'

export async function parseExcelDailySituation(fileBuffer) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(fileBuffer)

  const worksheet = workbook.getWorksheet('Daily Situation') || workbook.worksheets[0]
  if (!worksheet) {
    throw new Error('لم يتم العثور على شيت Daily Situation في ملف الإكسيل.')
  }

  const bookings = []
  const tripTypesSet = new Set()
  let batchDate = null

  for (let i = 1; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i).values
    if (!row) continue

    const srRaw = row[1]
    if (srRaw && /^\d{5,8}$/.test(String(srRaw).trim())) {
      const sr = String(srRaw).trim()
      const rawDate = String(row[2] || '').split(' - ')[0].trim()

      let normalizedDate = ''
      if (rawDate) {
        const parts = rawDate.split('/')
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0')
          const day = parts[1].padStart(2, '0')
          const year = parts[2]
          normalizedDate = `${year}-${month}-${day}`
          if (!batchDate) batchDate = normalizedDate
        } else {
          normalizedDate = rawDate
          if (!batchDate) batchDate = normalizedDate
        }
      }

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
        date: normalizedDate || batchDate || new Date().toISOString().split('T')[0],
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
