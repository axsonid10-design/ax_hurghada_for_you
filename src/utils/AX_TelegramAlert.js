import { supabase } from '../services/supabaseClient'
import { pushManager } from './pushManager'

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

    let fullStack = errStr
    if (context?.componentStack) {
      fullStack += `\nComponent Stack:\n${String(context.componentStack).substring(0, 500)}`
    }

    const currentHash = `${label}_${errStr.slice(0, 50)}`
    const now = Date.now()
    if (currentHash === lastSentHash && now - lastSentTime < 25000) {
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

    const text = `🚨 خطأ بالنظام [${systemName}]\n` +
      `👤 المستخدم: ${userStr}\n` +
      `⏰ الوقت: ${time}\n` +
      `📍 الصفحة: ${page}\n` +
      `🔴 التصنيف: ${label}\n\n` +
      `${fullStack}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: AX_ADMIN_CHAT_ID,
        text
      }),
      signal: controller.signal
    }).catch(() => {}).finally(() => clearTimeout(timeoutId))

    pushManager.sendNotification(
      `🚨 خطأ في النظام: ${label}`,
      `${userStr} • ${page}\n${errStr.slice(0, 120)}`,
      { tag: 'system-error-alert' }
    ).catch(() => {})

    const errorRecord = {
      error_message: `[${label}] [${userStr}] ${errStr.slice(0, 250)}`,
      stack_trace: fullStack,
      source: `${systemName} | ${userEmail} | ${page}`
    }
    supabase.from('ax_system_errors').insert([errorRecord]).catch(() => {})
  } catch (err) {
    console.error('[AX_WATCHDOG] Failed to report error:', err)
  }
}

export async function AX_purgeSystemErrors() {
  try {
    await supabase.from('ax_system_errors').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    return true
  } catch (e) {
    console.error('Failed to purge errors:', e)
    return false
  }
}
