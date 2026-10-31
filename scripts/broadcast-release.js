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
  const title = `🚀 تحديث جديد لمنظومة غردقة فور يو (v${version})`
  const body = 'تم إطلاق تحديث تشغيلي جديد وتحديث الإشعارات. اضغط للتحديث فوراً.'
  const link = `/?_v=${Date.now()}`

  try {
    const { data: pushData, error } = await supabase.functions.invoke('ax-web-push', {
      body: {
        project_slug: 'hurghada-for-you',
        title,
        body,
        link,
        tag: `ax-hurghada-release-${version}`,
        icon: 'https://hurghada.axsonid.com/pwa-192x192.png',
        badge: 'https://hurghada.axsonid.com/favicon-32x32.png'
      }
    })
    if (error) {
      console.warn('[AX_H4U] Push broadcast notice:', error.message)
    } else {
      console.log('[AX_H4U] Push broadcast status:', JSON.stringify(pushData))
    }
  } catch (err) {
    console.warn('[AX_H4U] Broadcast warning:', err.message)
  }
}

broadcastRelease()
