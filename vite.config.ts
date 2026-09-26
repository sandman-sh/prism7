import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const qwenApiKey = env.QWEN_API_KEY || ''
  const qwenBaseUrl = env.QWEN_BASE_URL || 'https://hackathon.bitgetops.com'

  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

  const proxyConfig = {
    '/api/qwen': {
      target: qwenBaseUrl,
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/api\/qwen/, '/v1'),
      configure: (proxy: any) => {
        proxy.on('proxyReq', (proxyReq: any) => {
          // Always securely inject the server-side environment secret; client never handles or transmits keys
          if (qwenApiKey) {
            proxyReq.setHeader('Authorization', `Bearer ${qwenApiKey}`)
          }
        })
      },
    },
    '/api/stock': {
      target: 'https://query1.finance.yahoo.com',
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/api\/stock/, '/v8/finance/chart'),
      configure: (proxy: any) => {
        proxy.on('proxyReq', (proxyReq: any) => {
          proxyReq.setHeader('User-Agent', USER_AGENT)
          proxyReq.setHeader('Accept', 'application/json, text/plain, */*')
        })
      },
    },
    '/api/news': {
      target: 'https://query1.finance.yahoo.com',
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/api\/news/, '/v1/finance/search'),
      configure: (proxy: any) => {
        proxy.on('proxyReq', (proxyReq: any) => {
          proxyReq.setHeader('User-Agent', USER_AGENT)
          proxyReq.setHeader('Accept', 'application/json, text/plain, */*')
        })
      },
    },
    '/api/sec': {
      target: 'https://data.sec.gov',
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/api\/sec/, ''),
      configure: (proxy: any) => {
        proxy.on('proxyReq', (proxyReq: any) => {
          proxyReq.setHeader('User-Agent', 'PRISM7Desk contact@prism7.finance')
          proxyReq.setHeader('Accept', 'application/json')
        })
      },
    },
    '/api/sec-doc': {
      target: 'https://www.sec.gov',
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/api\/sec-doc/, ''),
      configure: (proxy: any) => {
        proxy.on('proxyReq', (proxyReq: any) => {
          proxyReq.setHeader('User-Agent', 'PRISM7Desk contact@prism7.finance')
          proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,text/plain,*/*')
        })
      },
    },
    '/api/bitget': {
      target: 'https://api.bitget.com',
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/api\/bitget/, ''),
    },
  }

  return {
    plugins: [
      tailwindcss(),
      react(),
      {
        name: 'api-status-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/qwen/status') {
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  configured: Boolean(qwenApiKey),
                  model: env.QWEN_MODEL || 'qwen3.8-max',
                })
              )
              return
            }
            next()
          })
        },
      },
    ],
    server: {
      proxy: proxyConfig,
    },
    preview: {
      proxy: proxyConfig,
    },
  }
})
