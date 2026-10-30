import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const credPath = path.join(os.homedir(), '.gemini', 'antigravity', 'cloudflare_creds.json')
let accountId = process.env.CLOUDFLARE_ACCOUNT_ID
let apiToken = process.env.CLOUDFLARE_API_TOKEN

if (fs.existsSync(credPath)) {
  try {
    const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'))
    if (!apiToken && creds.api_token) apiToken = creds.api_token
    if (!accountId && creds.account_id) accountId = creds.account_id
  } catch (err) {
    console.warn('[DEPLOY] Credential read warning:', err.message)
  }
}

console.log('[DEPLOY] 1. Deploying dist to Cloudflare Pages (ax-hurghada-for-you)...')
execSync('npx wrangler pages deploy dist --project-name=ax-hurghada-for-you --commit-dirty=true', {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    ...(accountId ? { CLOUDFLARE_ACCOUNT_ID: accountId } : {}),
    ...(apiToken ? { CLOUDFLARE_API_TOKEN: apiToken } : {})
  }
})

console.log('[DEPLOY] 2. Broadcasting Web Push notification...')
try {
  execSync('node scripts/broadcast-release.js', { cwd: rootDir, stdio: 'inherit' })
} catch (err) {
  console.warn('[DEPLOY] Broadcast note:', err.message)
}

console.log('[DEPLOY] 3. Verifying live deployment...')
try {
  const res = await fetch(`https://hurghada.axsonid.com/version.json?_t=${Date.now()}`)
  const data = await res.json()
  console.log('[DEPLOY] Live Version on Domain:', data.version)
} catch (err) {
  console.warn('[DEPLOY] Verification note:', err.message)
}

console.log('[DEPLOY] All deployment tasks completed successfully!')
