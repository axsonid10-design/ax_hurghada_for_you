export function tafqeetArabic(amount, currency = 'EGP') {
  const num = Math.round(Number(amount) || 0)
  if (num === 0) return 'صفر'

  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر']
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة']

  function convertGroup(n) {
    let res = ''
    const h = Math.floor(n / 100)
    const rem = n % 100
    if (h > 0) {
      res += hundreds[h]
    }
    if (rem > 0) {
      if (res) res += ' و'
      if (rem < 20) {
        res += ones[rem]
      } else {
        const o = rem % 10
        const t = Math.floor(rem / 10)
        if (o > 0) {
          res += ones[o] + ' و' + tens[t]
        } else {
          res += tens[t]
        }
      }
    }
    return res
  }

  let words = ''
  const thousands = Math.floor((num % 1000000) / 1000)
  const remUnits = num % 1000
  const millions = Math.floor(num / 1000000)

  if (millions > 0) {
    if (millions === 1) words += 'مليون'
    else if (millions === 2) words += 'مليونان'
    else if (millions >= 3 && millions <= 10) words += convertGroup(millions) + ' ملايين'
    else words += convertGroup(millions) + ' مليون'
  }

  if (thousands > 0) {
    if (words) words += ' و'
    if (thousands === 1) words += 'ألف'
    else if (thousands === 2) words += 'ألفان'
    else if (thousands >= 3 && thousands <= 10) words += convertGroup(thousands) + ' آلاف'
    else words += convertGroup(thousands) + ' ألف'
  }

  if (remUnits > 0) {
    if (words) words += ' و'
    words += convertGroup(remUnits)
  }

  let currName = 'جنيه مصري'
  if (currency === 'EUR') currName = 'يورو أوروبي'
  else if (currency === 'USD') currName = 'دولار أمريكي'
  else if (currency === 'GBP') currName = 'جنيه إسترليني'

  return `فقط وقدره ${words} ${currName} لا غير`
}

export function numberToWordsEnglish(amount, currency = 'EGP') {
  const num = Math.round(Number(amount) || 0)
  if (num === 0) return 'Zero'

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function inWords(n) {
    if (n < 20) return a[n]
    const digit = n % 10
    return b[Math.floor(n / 10)] + (digit ? '-' + a[digit] : '')
  }

  function convertGroup(n) {
    let str = ''
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    if (n > 0) {
      str += inWords(n)
    }
    return str.trim()
  }

  let result = ''
  const millions = Math.floor(num / 1000000)
  const thousands = Math.floor((num % 1000000) / 1000)
  const remainder = num % 1000

  if (millions) result += convertGroup(millions) + ' Million '
  if (thousands) result += convertGroup(thousands) + ' Thousand '
  if (remainder) result += convertGroup(remainder)

  let currName = 'Egyptian Pounds'
  if (currency === 'EUR') currName = 'Euros'
  else if (currency === 'USD') currName = 'US Dollars'
  else if (currency === 'GBP') currName = 'British Pounds'

  return `Only ${result.trim()} ${currName}`
}
