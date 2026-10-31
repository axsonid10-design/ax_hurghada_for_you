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
  console.log(`[AX_H4U] Version release v${version} local check...`)
  // Push broadcast disabled until Hurghada is migrated to its own dedicated Supabase project
  console.log('[AX_H4U] Push broadcast skipped to avoid cross-project contamination with protein-food.')
}

broadcastRelease()
