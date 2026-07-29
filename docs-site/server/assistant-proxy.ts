/**
 * Optional production sidecar: holds DOCS_ASSISTANT_KEY and proxies chat.
 * nginx (or any reverse proxy) should forward /docs-api/assistant/* here.
 *
 *   DOCS_ASSISTANT_KEY=sk-... bun server/assistant-proxy.ts
 */
import { handleAssistantChat, handleAssistantHealth } from './chat-handler'

const port = Number(process.env.DOCS_ASSISTANT_PORT || 8788)

const host = process.env.DOCS_ASSISTANT_HOST || '127.0.0.1'

const server = Bun.serve({
  port,
  hostname: host, // default loopback — never expose bare to the public internet
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname.replace(/\/+$/, '') || '/'

    // Docs Q&A only. No tool/agent/exec endpoints exist on this process.
    if (
      path === '/docs-api/assistant/health' ||
      path === '/health' ||
      path === '/chat/health'
    ) {
      return handleAssistantHealth()
    }

    if (
      path === '/docs-api/assistant/chat' ||
      path === '/chat' ||
      path === '/docs-api/assistant/chat/'
    ) {
      return handleAssistantChat(req)
    }

    return new Response('docs assistant proxy (chat only; no tools)', { status: 404 })
  },
})

console.log(
  `[docs-assistant] listening on http://${host}:${server.port} (chat-only, no tools/exec)`
)
