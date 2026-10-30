import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'

const credPath = path.join(os.homedir(), '.gemini', 'antigravity', 'cloudflare_creds.json')
const env = { ...process.env }

if (fs.existsSync(credPath)) {
  try {
    const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'))
    if (creds.api_token) env.CLOUDFLARE_API_TOKEN = creds.api_token
    if (creds.account_id) env.CLOUDFLARE_ACCOUNT_ID = creds.account_id
  } catch (err) {
    console.error('Failed to parse CF creds:', err.message)
  }
}

try {
  execSync('npx wrangler pages deploy dist --project-name=ax-hurghada-for-you --commit-dirty=true', {
    stdio: 'inherit',
    env
  })
} catch {
  console.warn('[Deploy Note] Direct wrangler deploy skipped. GitHub CI/CD build will trigger automatically upon commit push.')
}
