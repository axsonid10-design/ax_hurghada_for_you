// Real-time Forex Exchange Rates Engine with Offline Fallback

const CACHE_KEY = 'ax_h4u_exchange_rates'
const CACHE_TIMESTAMP_KEY = 'ax_h4u_rates_timestamp'
const ONE_HOUR = 60 * 60 * 1000

// Fallback rates if offline or API fails
export const DEFAULT_RATES = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.84,
  EGP: 53.25
}

class ExchangeRatesManager {
  constructor() {
    this.rates = { ...DEFAULT_RATES }
    this.lastUpdated = null
    this.loadFromCache()
  }

  loadFromCache() {
    if (typeof window === 'undefined') return
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      if (cached) {
        this.rates = { ...DEFAULT_RATES, ...JSON.parse(cached) }
        this.lastUpdated = ts ? new Date(parseInt(ts, 10)) : null
      }
    } catch (e) {
      console.warn('Failed to load exchange rates from cache', e)
    }
  }

  async fetchLiveRates() {
    if (typeof window === 'undefined') return this.rates

    // Check if cache is still fresh (< 1 hour)
    const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    if (ts && Date.now() - parseInt(ts, 10) < ONE_HOUR && this.rates.EGP > 10) {
      return this.rates
    }

    try {
      // Free open-access live FX API based on EUR
      const res = await fetch('https://open.er-api.com/v6/latest/EUR')
      if (res.ok) {
        const data = await res.json()
        if (data && data.rates) {
          this.rates = {
            EUR: 1,
            USD: data.rates.USD || 1.08,
            GBP: data.rates.GBP || 0.84,
            EGP: data.rates.EGP || 53.25
          }
          this.lastUpdated = new Date()
          localStorage.setItem(CACHE_KEY, JSON.stringify(this.rates))
          localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()))
        }
      }
    } catch (err) {
      console.warn('Using fallback exchange rates due to network/API error', err)
    }

    return this.rates
  }

  // Convert amount from one currency to another
  convert(amount = 0, from = 'EUR', to = 'EGP') {
    const num = Number(amount) || 0
    if (num === 0) return 0
    const f = from.toUpperCase()
    const t = to.toUpperCase()
    if (f === t) return num

    // Base currency is EUR:
    // EUR -> Target = amount * rates[Target]
    // Any -> EUR = amount / rates[Source]
    const rateSource = this.rates[f] || 1
    const rateTarget = this.rates[t] || 1

    const inEur = f === 'EUR' ? num : num / rateSource
    const result = t === 'EUR' ? inEur : inEur * rateTarget

    return Math.round(result * 100) / 100
  }

  getRates() {
    return this.rates
  }
}

export const exchangeRates = new ExchangeRatesManager()
