import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJsonPath = path.resolve(__dirname, '../package.json')
const envPath = path.resolve(__dirname, '../.env')

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const version = packageJson.version

let supabaseUrl = process.env.VITE_SUPABASE_URL
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if ((!supabaseUrl || !supabaseAnonKey) && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.replace('VITE_SUPABASE_URL=', '').trim().replace(/^["']|["']$/g, '')
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.replace('VITE_SUPABASE_ANON_KEY=', '').trim().replace(/^["']|["']$/g, '')
    }
  })
}

if (!supabaseUrl || !supabaseAnonKey) {
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function broadcastRelease() {
  console.log(`[AX_H4U] Broadcasting version release v${version}...`)
  const title = `🚀 تحديث جديد لمنظومة غردقة (v${version})`
  const body = 'تم إطلاق تحديث جديد للرحلات وتعديل الحجوزات. اضغط للتحديث فوراً.'
  const link = `/?_v=${Date.now()}`

  try {
    await supabase.from('ax_notifications').insert({
      title,
      message: body,
      link,
      type: 'system',
      is_read: false,
      meta: {
        version,
        broadcast: true,
        timestamp: Date.now()
      }
    })

    const { data: pushData } = await supabase.functions.invoke('ax-web-push', {
      body: {
        title,
        body,
        link,
        tag: `ax-release-${version}`,
        icon: '/pwa-192x192.png',
        badge: '/apple-touch-icon.png'
      }
    })
    console.log('[AX_H4U] Web Push broadcast delivered:', pushData || 'ok')
  } catch (err) {
    console.warn('[AX_H4U] Broadcast warning:', err.message)
  }
}

broadcastRelease()
