/**
 * Vite plugin: same-origin assistant proxy so the API key never ships to the browser.
 * Kept loosely typed so the browser tsconfig does not need a full Node graph.
 */
import type { Plugin } from 'vite'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error — resolved via Vite's node resolution at runtime
import { handleAssistantChat, handleAssistantHealth } from '../server/chat-handler.ts'

const CHAT_PATH = '/docs-api/assistant/chat'
const HEALTH_PATH = '/docs-api/assistant/health'

type NodeReq = {
  url?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  on: (ev: string, cb: (...args: unknown[]) => void) => void
  destroy: () => void
}

type NodeRes = {
  statusCode: number
  setHeader: (k: string, v: string) => void
  write: (chunk: Uint8Array | string) => void
  end: (chunk?: string) => void
  destroy: (err?: Error) => void
}

function readBody(req: NodeReq): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    let size = 0
    req.on('data', (c: unknown) => {
      const buf = c as Uint8Array
      size += buf.byteLength
      if (size > 64_000) {
        reject(new Error('payload_too_large'))
        req.destroy()
        return
      }
      chunks.push(buf)
    })
    req.on('end', () => {
      const total = chunks.reduce((n, x) => n + x.byteLength, 0)
      const out = new Uint8Array(total)
      let off = 0
      for (const c of chunks) {
        out.set(c, off)
        off += c.byteLength
      }
      resolve(out)
    })
    req.on('error', (err: unknown) => reject(err instanceof Error ? err : new Error(String(err))))
  })
}

async function nodeToWebRequest(req: NodeReq, body?: Uint8Array): Promise<Request> {
  const host = (req.headers.host as string) || '127.0.0.1'
  const url = `http://${host}${req.url || '/'}`
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (v == null) continue
    if (Array.isArray(v)) headers.set(k, v.join(', '))
    else headers.set(k, String(v))
  }
  headers.delete('authorization')
  const method = req.method || 'GET'
  if (method === 'GET' || method === 'HEAD') {
    return new Request(url, { method, headers })
  }
  return new Request(url, {
    method,
    headers,
    body: body ?? (await readBody(req)),
  })
}

async function writeWebResponse(web: Response, res: NodeRes) {
  res.statusCode = web.status
  web.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'transfer-encoding') return
    res.setHeader(key, value)
  })
  if (!web.body) {
    res.end()
    return
  }
  const reader = web.body.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
    res.end()
  } catch (err) {
    try {
      res.destroy(err as Error)
    } catch {
      /* ignore */
    }
  }
}

function attach(middlewares: { use: (fn: (req: NodeReq, res: NodeRes, next: () => void) => void) => void }) {
  middlewares.use(async (req, res, next) => {
    const raw = req.url || ''
    const path = raw.split('?')[0]
    if (path !== CHAT_PATH && path !== HEALTH_PATH) {
      next()
      return
    }
    try {
      if (path === HEALTH_PATH) {
        await writeWebResponse(handleAssistantHealth(), res)
        return
      }
      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        res.end()
        return
      }
      const body = req.method === 'POST' ? await readBody(req) : undefined
      const webReq = await nodeToWebRequest(req, body)
      const webRes = await handleAssistantChat(webReq)
      await writeWebResponse(webRes, res)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'proxy_error'
      const status = msg === 'payload_too_large' ? 413 : 500
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: { message: msg } }))
    }
  })
}

export function docsAssistantProxyPlugin(): Plugin {
  return {
    name: 'docs-assistant-proxy',
    configureServer(server) {
      attach(server.middlewares as never)
    },
    configurePreviewServer(server) {
      attach(server.middlewares as never)
    },
  }
}
