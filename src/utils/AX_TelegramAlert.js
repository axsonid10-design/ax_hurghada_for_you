import { supabase } from '../services/supabaseClient'

const AX_ADMIN_CHAT_ID = '837246270'
const TELEGRAM_BOT_TOKEN = '8959762689:AAFxDRv1Q7h7UDAy8tirQTqCf3ar5t9QpyI'

let lastSentHash = ''
let lastSentTime = 0

export async function AX_alertTelegram(label, errorObj, context = {}) {
  try {
    const time = new Date().toLocaleTimeString('ar-EG', { hour12: true })
    const page = typeof window !== 'undefined' ? window.location.pathname + window.location.search : 'Unknown'
    const systemName = typeof document !== 'undefined' ? document.title : 'غردقة فور يو'

    let errStr = ''
    if (errorObj instanceof Error) {
      errStr = (errorObj.stack || errorObj.message || String(errorObj)).substring(0, 1000)
    } else if (typeof errorObj === 'object') {
      errStr = JSON.stringify(errorObj, null, 2).substring(0, 1000)
    } else {
      errStr = String(errorObj || 'Unknown').substring(0, 1000)
    }

    const currentHash = `${label}_${errStr.slice(0, 50)}`
    const now = Date.now()
    if (currentHash === lastSentHash && now - lastSentTime < 30000) {
      return
    }
    lastSentHash = currentHash
    lastSentTime = now

    let userStr = 'مستخدم غير مسجل'
    let userEmail = 'anonymous'
    try {
      const rawUser = localStorage.getItem('ax_h4u_auth_user')
      if (rawUser) {
        const u = JSON.parse(rawUser)
        userStr = `${u.name || 'بدون اسم'} (${u.role || 'موظف'})`
        userEmail = u.email || 'no-email'
      }
    } catch {}

    const text = `🚨 *خطأ بالنظام* [${systemName}]\n` +
      `👤 *المستخدم:* ${userStr}\n` +
      `⏰ *الوقت:* ${time}\n` +
      `📍 *الصفحة:* ${page}\n` +
      `🔴 *التصنيف:* ${label}\n\n` +
      `\`\`\`\n${errStr}\n\`\`\``

    // 1. Send Instant Telegram Alert
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: AX_ADMIN_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    }).catch(() => {})

    // 2. Log to Supabase ax_system_errors table
    const errorRecord = {
      user_name: userStr,
      user_email: userEmail,
      page,
      error_label: label,
      error_details: errStr,
      created_at: new Date().toISOString()
    }
    supabase.from('ax_system_errors').insert([errorRecord]).catch(() => {})
  } catch (err) {
    console.error('[AX_TELEGRAM_WATCHDOG] Failed to report error:', err)
  }
}

export async function AX_purgeSystemErrors() {
  try {
    await supabase.from('ax_system_errors').delete().neq('id', 0)
    return true
  } catch (e) {
    console.error('Failed to purge errors:', e)
    return false
  }
}
