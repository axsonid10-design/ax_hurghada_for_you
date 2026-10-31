import ExcelJS from 'exceljs'

export async function exportExecutorLedgerToExcel({
  executor,
  exBookings = [],
  aggregatedRows = [],
  totalCostDue = 0,
  totalPaid = 0,
  remainingBalance = 0,
  periodFilter = 'all',
  customFrom = '',
  customTo = '',
  lang = 'ar'
}) {
  const isRtl = lang === 'ar'
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'HURGHADA FOR YOU'
  workbook.created = new Date()

  const periodLabel =
    periodFilter === 'all'
      ? (isRtl ? 'كافة الفترات' : 'All Time')
      : periodFilter === 'today'
      ? (isRtl ? 'اليوم' : 'Today')
      : periodFilter === 'month'
      ? (isRtl ? 'الشهر الحالي' : 'Current Month')
      : `${customFrom || ''} → ${customTo || ''}`

  const sheet = workbook.addWorksheet(isRtl ? 'كشف حساب المنفذ' : 'Executor Statement', {
    views: [{ rightToLeft: isRtl }]
  })

  sheet.columns = [
    { width: 12 },
    { width: 14 },
    { width: 22 },
    { width: 22 },
    { width: 24 },
    { width: 12 },
    { width: 16 },
    { width: 18 }
  ]

  sheet.addRow([isRtl ? 'غردقة فور يو للسياحة والرحلات — كشف حساب ومطالبة توريد' : 'HURGHADA FOR YOU TOURISM — EXECUTOR INVOICE & STATEMENT'])
  sheet.mergeCells('A1:H1')
  const titleRow = sheet.getRow(1)
  titleRow.height = 30
  titleRow.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' }
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0A2540' }
  }

  sheet.addRow([])

  sheet.addRow([
    isRtl ? 'المورد / المنفذ:' : 'Supplier / Partner:',
    executor.name || '',
    '',
    isRtl ? 'رقم المطالبة:' : 'Invoice Code:',
    `#INV-EX-${(executor.id || '').toUpperCase()}`,
    '',
    isRtl ? 'تاريخ الاستخراج:' : 'Issue Date:',
    new Date().toISOString().split('T')[0]
  ])
  sheet.addRow([
    isRtl ? 'القسم / النشاط:' : 'Category:',
    executor.category || '',
    '',
    isRtl ? 'الفترة الزمنية:' : 'Period:',
    periodLabel,
    '',
    isRtl ? 'العملة المعتمدة:' : 'Currency:',
    'EUR (€)'
  ])
  sheet.addRow([
    isRtl ? 'رقم الهاتف:' : 'Phone:',
    executor.phone || '—',
    '',
    isRtl ? 'إجمالي الحركات:' : 'Total Bookings:',
    `${exBookings.length}`,
    '',
    isRtl ? 'حالة المطالبة:' : 'Status:',
    remainingBalance > 0 ? (isRtl ? 'مستحق السداد' : 'Due') : (isRtl ? 'مسدد بالكامل' : 'Settled')
  ])

  for (let r = 3; r <= 5; r++) {
    const row = sheet.getRow(r)
    row.font = { name: 'Arial', size: 10, bold: true }
    row.alignment = { vertical: 'middle' }
  }

  sheet.addRow([])

  sheet.addRow([
    isRtl ? 'التاريخ' : 'Date',
    isRtl ? 'نوع الرحلة' : 'Trip Type',
    isRtl ? 'طريقة الحساب' : 'Pricing Mode',
    isRtl ? 'الكمية' : 'Quantity',
    isRtl ? 'تكلفة الوحدة (€)' : 'Unit Cost (€)',
    isRtl ? 'الإجمالي المستحق (€)' : 'Total Due (€)'
  ])
  sheet.mergeCells(`A${sheet.rowCount}:A${sheet.rowCount}`)
  const aggHeader = sheet.getRow(sheet.rowCount)
  aggHeader.height = 24
  aggHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
  aggHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0284C7' }
  }
  aggHeader.alignment = { vertical: 'middle', horizontal: 'center' }

  aggregatedRows.forEach((row) => {
    sheet.addRow([
      row.date,
      row.trip_name,
      row.is_pax ? (isRtl ? 'بالأفراد' : 'Per PAX') : (isRtl ? 'بالرحلة' : 'Per Trip'),
      row.quantity,
      Number(row.unit_cost) || 0,
      Number(row.total_cost) || 0
    ])
  })

  sheet.addRow([])

  sheet.addRow([
    '#SR',
    isRtl ? 'التاريخ' : 'Date',
    isRtl ? 'النزيل' : 'Guest Name',
    isRtl ? 'الفندق (الغرفة)' : 'Hotel (Room)',
    isRtl ? 'نوع الرحلة' : 'Trip',
    isRtl ? 'بالغين' : 'Adult',
    isRtl ? 'أطفال' : 'Child',
    isRtl ? 'التكلفة (€)' : 'Cost (€)'
  ])
  const itemHeader = sheet.getRow(sheet.rowCount)
  itemHeader.height = 24
  itemHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
  itemHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0A2540' }
  }
  itemHeader.alignment = { vertical: 'middle', horizontal: 'center' }

  exBookings.forEach((b) => {
    sheet.addRow([
      b.sr,
      b.date || '',
      b.guest_name || '',
      `${b.hotel || ''} (${b.room || ''})`,
      b.trip_type || b.trip || '',
      Number(b.adult) || 0,
      Number(b.child) || 0,
      Number(b.cost_eur) || 0
    ])
  })

  sheet.addRow([])

  sheet.addRow([
    isRtl ? 'إجمالي تكلفة الرحلات المستحقة:' : 'Total Accrued Cost:',
    totalCostDue,
    'EUR'
  ])
  sheet.addRow([
    isRtl ? 'إجمالي المدفوعات المسددة للمنفذ:' : 'Total Payments Settled:',
    totalPaid,
    'EUR'
  ])
  sheet.addRow([
    isRtl ? 'صافي الرصيد المتبقي للمنفذ:' : 'Net Remaining Balance Due:',
    remainingBalance,
    'EUR'
  ])

  for (let r = sheet.rowCount - 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r)
    row.font = { name: 'Arial', size: 11, bold: true }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeName = (executor.name || 'executor').replace(/\s+/g, '_')
  const dateStr = new Date().toISOString().split('T')[0]
  a.href = url
  a.download = `Hurghada4U_Statement_${safeName}_${dateStr}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportPerformanceReportToExcel({
  filteredBookings = [],
  tripsMatrix = [],
  executors = [],
  filteredExpenses = [],
  dateFrom = '',
  dateTo = '',
  lang = 'ar'
}) {
  const isRtl = lang === 'ar'
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'HURGHADA FOR YOU'
  workbook.created = new Date()

  // Sheet 1: 360° Bookings Detailed Ledger
  const sheet1 = workbook.addWorksheet(isRtl ? 'كشف الحساب التفصيلي 360°' : '360 Bookings Ledger', {
    views: [{ rightToLeft: isRtl }]
  })
  sheet1.columns = [
    { width: 10 },
    { width: 14 },
    { width: 22 },
    { width: 24 },
    { width: 24 },
    { width: 10 },
    { width: 10 },
    { width: 16 },
    { width: 18 },
    { width: 14 },
    { width: 14 },
    { width: 14 }
  ]

  sheet1.addRow([
    '#SR',
    isRtl ? 'التاريخ' : 'Date',
    isRtl ? 'اسم النزيل' : 'Guest Name',
    isRtl ? 'الفندق (الغرفة)' : 'Hotel (Room)',
    isRtl ? 'نوع الرحلة' : 'Trip Type',
    isRtl ? 'بالغين' : 'Adult',
    isRtl ? 'أطفال' : 'Child',
    isRtl ? 'المندوب' : 'Seller',
    isRtl ? 'المنفذ' : 'Executor',
    isRtl ? 'سعر البيع (€)' : 'Sell (€)',
    isRtl ? 'التكلفة (€)' : 'Cost (€)',
    isRtl ? 'صافي الربح (€)' : 'Profit (€)'
  ])
  const h1 = sheet1.getRow(1)
  h1.height = 26
  h1.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
  h1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A2540' } }
  h1.alignment = { vertical: 'middle', horizontal: 'center' }

  filteredBookings.forEach((b) => {
    sheet1.addRow([
      b.sr,
      b.date || '',
      b.guest_name || '',
      `${b.hotel || ''} (${b.room || ''})`,
      b.trip_type || b.trip || '',
      Number(b.adult) || 0,
      Number(b.child) || 0,
      b.seller || '',
      b.executor_id || '',
      Number(b.sell_eur) || 0,
      Number(b.cost_eur) || 0,
      Number(b.profit_eur) || 0
    ])
  })

  // Sheet 2: Trips Profitability Matrix
  const sheet2 = workbook.addWorksheet(isRtl ? 'مصفوفة أرباح الرحلات' : 'Trips Matrix', {
    views: [{ rightToLeft: isRtl }]
  })
  sheet2.columns = [
    { width: 26 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 14 }
  ]
  sheet2.addRow([
    isRtl ? 'نوع الرحلة' : 'Trip Type',
    isRtl ? 'عدد الحجوزات' : 'Bookings Count',
    isRtl ? 'عدد الأفراد (PAX)' : 'Total PAX',
    isRtl ? 'إجمالي المبيعات (€)' : 'Total Sales (€)',
    isRtl ? 'إجمالي التكلفة (€)' : 'Total Cost (€)',
    isRtl ? 'صافي الربح (€)' : 'Net Profit (€)',
    isRtl ? 'هامش الربح' : 'Margin %'
  ])
  const h2 = sheet2.getRow(1)
  h2.height = 26
  h2.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
  h2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }
  h2.alignment = { vertical: 'middle', horizontal: 'center' }

  tripsMatrix.forEach((t) => {
    const margin = t.sales > 0 ? Math.round((t.profit / t.sales) * 100) : 0
    sheet2.addRow([
      t.name,
      t.bookingsCount,
      t.pax,
      t.sales,
      t.cost,
      t.profit,
      `${margin}%`
    ])
  })

  // Sheet 3: Suppliers & Executors Ledger
  const sheet3 = workbook.addWorksheet(isRtl ? 'أرصدة المنفذين' : 'Suppliers Ledger', {
    views: [{ rightToLeft: isRtl }]
  })
  sheet3.columns = [
    { width: 24 },
    { width: 18 },
    { width: 18 },
    { width: 20 },
    { width: 20 },
    { width: 20 }
  ]
  sheet3.addRow([
    isRtl ? 'المنفذ / المورد' : 'Supplier Name',
    isRtl ? 'القسم' : 'Category',
    isRtl ? 'الحجوزات المنفذة' : 'Bookings Executed',
    isRtl ? 'التكلفة المستحقة (€)' : 'Accrued Cost (€)',
    isRtl ? 'المسدد (€)' : 'Settled (€)',
    isRtl ? 'المتبقي له (€)' : 'Balance Due (€)'
  ])
  const h3 = sheet3.getRow(1)
  h3.height = 26
  h3.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
  h3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A2540' } }
  h3.alignment = { vertical: 'middle', horizontal: 'center' }

  executors.forEach((ex) => {
    const exBookings = filteredBookings.filter((b) => b.executor_id === ex.id)
    const costDue = exBookings.reduce((sum, b) => sum + (Number(b.cost_eur) || 0), 0)
    const paid = ex.total_paid || 0
    sheet3.addRow([
      ex.name,
      ex.category || '',
      exBookings.length,
      costDue,
      paid,
      Math.max(0, costDue - paid)
    ])
  })

  // Sheet 4: Expenses Log
  const sheet4 = workbook.addWorksheet(isRtl ? 'المصاريف التشغيلية' : 'Expenses Log', {
    views: [{ rightToLeft: isRtl }]
  })
  sheet4.columns = [
    { width: 14 },
    { width: 26 },
    { width: 20 },
    { width: 16 },
    { width: 12 },
    { width: 30 }
  ]
  sheet4.addRow([
    isRtl ? 'التاريخ' : 'Date',
    isRtl ? 'بند المصروف' : 'Expense Title',
    isRtl ? 'التصنيف' : 'Category',
    isRtl ? 'المبلغ' : 'Amount',
    isRtl ? 'العملة' : 'Currency',
    isRtl ? 'ملاحظات' : 'Notes'
  ])
  const h4 = sheet4.getRow(1)
  h4.height = 26
  h4.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
  h4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE11D48' } }
  h4.alignment = { vertical: 'middle', horizontal: 'center' }

  filteredExpenses.forEach((exp) => {
    sheet4.addRow([
      exp.date || '',
      exp.title || '',
      exp.category || '',
      Number(exp.amount) || 0,
      exp.currency || 'EUR',
      exp.notes || ''
    ])
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Hurghada4U_Financial_Report_${dateFrom}_to_${dateTo}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}