import https from 'https'
import fs from 'fs'
import path from 'path'
import os from 'os'

function loadCreds() {
  const credPath = path.join(os.homedir(), '.gemini', 'antigravity', 'cloudflare_creds.json')
  if (fs.existsSync(credPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(credPath, 'utf-8'))
      if (!process.env.CLOUDFLARE_API_TOKEN && data.api_token) {
        process.env.CLOUDFLARE_API_TOKEN = data.api_token
      }
      if (!process.env.CLOUDFLARE_ACCOUNT_ID && data.account_id) {
        process.env.CLOUDFLARE_ACCOUNT_ID = data.account_id
      }
      if (!process.env.CLOUDFLARE_ZONE_ID && data.zone_id) {
        process.env.CLOUDFLARE_ZONE_ID = data.zone_id
      }
    } catch {}
  }
}

loadCreds()

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID
const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || '0dd86559ec5e4085d682d08892f5fe83'

function cfRequest({ endpoint, method = 'GET', body = null }) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null
    const headers = {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    }
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload)
    }

    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method,
      headers,
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          resolve({ success: false, error: e.message })
        }
      })
    })

    req.on('error', (e) => resolve({ success: false, error: e.message }))
    if (payload) req.write(payload)
    req.end()
  })
}

export async function bindPagesDomain({ projectName = 'ax-hurghada-for-you-9f7', domain = 'hurghada.axsonid.com' }) {
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
    console.error('[CF_LINKER] Missing Cloudflare credentials.')
    return false
  }

  const pagesRes = await cfRequest({
    endpoint: `/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}/domains`,
    method: 'POST',
    body: { name: domain },
  })

  if (pagesRes.success || (pagesRes.errors && pagesRes.errors.some((e) => e.code === 8000009))) {
    console.log(`[CF_LINKER] Pages domain mapped: ${domain}`)
  }

  const subdomainName = domain.includes('.axsonid.com')
    ? domain.replace('.axsonid.com', '')
    : domain

  const listRes = await cfRequest({
    endpoint: `/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${encodeURIComponent(domain)}`,
    method: 'GET',
  })

  let dnsRes
  if (listRes.success && listRes.result && listRes.result.length > 0) {
    const existing = listRes.result[0]
    dnsRes = await cfRequest({
      endpoint: `/client/v4/zones/${CF_ZONE_ID}/dns_records/${existing.id}`,
      method: 'PUT',
      body: {
        type: 'CNAME',
        name: subdomainName,
        content: `${projectName}.pages.dev`,
        ttl: 1,
        proxied: true,
      },
    })
  } else {
    dnsRes = await cfRequest({
      endpoint: `/client/v4/zones/${CF_ZONE_ID}/dns_records`,
      method: 'POST',
      body: {
        type: 'CNAME',
        name: subdomainName,
        content: `${projectName}.pages.dev`,
        ttl: 1,
        proxied: true,
      },
    })
  }

  if (dnsRes.success) {
    console.log(`[CF_LINKER] DNS CNAME auto-created successfully: ${domain} -> ${projectName}.pages.dev (Proxied)`)
    return true
  }
  return false
}

if (process.argv[1]?.endsWith('ax_cloudflare_bind_domain.js')) {
  bindPagesDomain({})
}
