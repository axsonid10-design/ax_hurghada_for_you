import https from 'https'

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID

export async function bindPagesDomain({ projectName = 'ax-hurghada-for-you', domain = 'hurghada.axsonid.com' }) {
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
    console.warn('[CF_LINKER] يرجى تعيين CLOUDFLARE_API_TOKEN و CLOUDFLARE_ACCOUNT_ID في بيئة التشغيل.')
    return false
  }

  const payload = JSON.stringify({ name: domain })
  const options = {
    hostname: 'api.cloudflare.com',
    port: 443,
    path: `/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}/domains`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.success) {
            console.log(`[CF_LINKER] تم ربط الدومين بنجاح: https://${domain}`)
            resolve(true)
          } else {
            console.error('[CF_LINKER] استجابة الربط:', parsed.errors || parsed.messages)
            resolve(false)
          }
        } catch (e) {
          console.error('[CF_LINKER] خطأ:', e.message)
          resolve(false)
        }
      })
    })

    req.on('error', (e) => {
      console.error('[CF_LINKER] خطأ اتصال:', e.message)
      resolve(false)
    })

    req.write(payload)
    req.end()
  })
}

if (process.argv[1]?.endsWith('ax_cloudflare_bind_domain.js')) {
  bindPagesDomain({ projectName: 'ax-hurghada-for-you', domain: 'hurghada.axsonid.com' })
}
