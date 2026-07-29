import { siteConfig } from '@/config'
import { loadSearchIndex, searchDocs, type SearchHit } from '@/lib/search'
import type { Lang } from '@/i18n'

export type ChatRole = 'system' | 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

export type AssistantRefs = SearchHit[]

export type StreamHandlers = {
  onDelta: (text: string) => void
  signal?: AbortSignal
}

/** Same-origin proxy paths — key stays on the server (Vite middleware or sidecar). */
const PROXY_CHAT = '/docs-api/assistant/chat'
const PROXY_HEALTH = '/docs-api/assistant/health'

let enabledCache: boolean | null = null
let enabledPromise: Promise<boolean> | null = null

function proxyUrl(path: string): string {
  // In production the SPA is under /docs/; the proxy is mounted at site root
  // (/docs-api/...). Use an absolute path so fetch never becomes /docs/docs-api/...
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Whether the docs assistant backend is configured.
 * Checks GET /docs-api/assistant/health (server holds the key).
 * Falls back to siteConfig.assistant.enabled if the health probe fails in a way
 * that still might work (e.g. first offline paint) — UI will error on send.
 */
export async function probeAssistantEnabled(): Promise<boolean> {
  if (enabledCache != null) return enabledCache
  if (enabledPromise) return enabledPromise
  if (!(siteConfig.assistant.enabled as boolean)) {
    enabledCache = false
    return false
  }
  enabledPromise = fetch(proxyUrl(PROXY_HEALTH), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
    .then(async (r) => {
      if (!r.ok) {
        enabledCache = false
        return false
      }
      try {
        const j = (await r.json()) as { ok?: boolean }
        enabledCache = Boolean(j.ok)
      } catch {
        enabledCache = false
      }
      return enabledCache
    })
    .catch(() => {
      enabledCache = false
      return false
    })
    .finally(() => {
      enabledPromise = null
    })
  return enabledPromise
}

/** Sync snapshot after a probe (or false before first probe). */
export function isAssistantEnabledSync() {
  return enabledCache === true
}

export function invalidateAssistantEnabled() {
  enabledCache = null
}

/** Retrieve top doc hits for a question (uses the same search index as ⌘K). */
export async function retrieveDocContext(
  question: string,
  lang: Lang,
  limit = 5
): Promise<SearchHit[]> {
  const docs = await loadSearchIndex(lang)
  return searchDocs(docs, question, lang).slice(0, limit)
}

export async function buildClientPayload(opts: {
  lang: Lang
  pageTitle: string
  pagePath: string
  history: ChatMessage[]
  question: string
}): Promise<{
  body: {
    lang: Lang
    pageTitle: string
    pagePath: string
    question: string
    history: ChatMessage[]
    context: { title: string; path: string; snippet: string }[]
  }
  refs: SearchHit[]
}> {
  const refs = await retrieveDocContext(opts.question, opts.lang)
  const history = opts.history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-6)
  return {
    refs,
    body: {
      lang: opts.lang,
      pageTitle: opts.pageTitle,
      pagePath: opts.pagePath,
      question: opts.question,
      history,
      context: refs.map((h) => ({
        title: h.title,
        path: h.path,
        snippet: h.snippet,
      })),
    },
  }
}

function extractErrorMessage(status: number, raw: string): string {
  try {
    const j = JSON.parse(raw) as {
      error?: { message?: string } | string
      message?: string
    }
    if (typeof j.error === 'string' && j.error) return j.error
    if (j.error && typeof j.error === 'object' && j.error.message) return j.error.message
    if (j.message) return j.message
  } catch {
    /* ignore */
  }
  if (raw && raw.length < 240) return raw
  return `HTTP ${status}`
}

/**
 * Stream a reply through the same-origin proxy. Never attaches an API key.
 */
export async function streamAssistantReply(
  payload: {
    lang: Lang
    pageTitle: string
    pagePath: string
    question: string
    history: ChatMessage[]
    context: { title: string; path: string; snippet: string }[]
  },
  handlers: StreamHandlers
): Promise<string> {
  const res = await fetch(proxyUrl(PROXY_CHAT), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/json',
    },
    body: JSON.stringify(payload),
    signal: handlers.signal,
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(extractErrorMessage(res.status, errText))
  }

  const ctype = res.headers.get('content-type') || ''
  if (!res.body || ctype.includes('application/json')) {
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const text = data.choices?.[0]?.message?.content?.trim() || ''
    if (text) handlers.onDelta(text)
    return text
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (!data || data === '[DONE]') continue
      try {
        const json = JSON.parse(data) as {
          choices?: {
            delta?: { content?: string }
            message?: { content?: string }
          }[]
        }
        const delta =
          json.choices?.[0]?.delta?.content ??
          json.choices?.[0]?.message?.content ??
          ''
        if (delta) {
          full += delta
          handlers.onDelta(delta)
        }
      } catch {
        /* skip malformed chunk */
      }
    }
  }

  return full
}

/** Very small markdown → React-safe nodes (code, links to doc paths). */
export function splitAssistantText(text: string): Array<
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'codeblock'; value: string; lang: string }
  | { type: 'path'; value: string }
> {
  const out: Array<
    | { type: 'text'; value: string }
    | { type: 'code'; value: string }
    | { type: 'codeblock'; value: string; lang: string }
    | { type: 'path'; value: string }
  > = []

  // First pass: extract fenced code blocks (```lang\n...\n```)
  const fencedRe = /```(\w*)\n([\s\S]*?)```/g
  const segments: Array<{ type: 'raw'; value: string } | { type: 'codeblock'; value: string; lang: string }> = []
  let lastIdx = 0
  let fm: RegExpExecArray | null
  while ((fm = fencedRe.exec(text))) {
    if (fm.index > lastIdx) segments.push({ type: 'raw', value: text.slice(lastIdx, fm.index) })
    segments.push({ type: 'codeblock', value: fm[2].replace(/\n$/, ''), lang: fm[1] || 'text' })
    lastIdx = fm.index + fm[0].length
  }
  if (lastIdx < text.length) segments.push({ type: 'raw', value: text.slice(lastIdx) })

  // Second pass: parse inline code and paths within raw segments
  const inlineRe =
    /(`[^`]+`|\/(?:start|guide|api|billing|features|support|legal|changelog)(?:\/[\w.-]+)*)/g
  for (const seg of segments) {
    if (seg.type === 'codeblock') {
      out.push(seg)
      continue
    }
    let last = 0
    let m: RegExpExecArray | null
    inlineRe.lastIndex = 0
    while ((m = inlineRe.exec(seg.value))) {
      if (m.index > last) out.push({ type: 'text', value: seg.value.slice(last, m.index) })
      const token = m[0]
      if (token.startsWith('`')) {
        out.push({ type: 'code', value: token.slice(1, -1) })
      } else {
        out.push({ type: 'path', value: token })
      }
      last = m.index + token.length
    }
    if (last < seg.value.length) out.push({ type: 'text', value: seg.value.slice(last) })
  }
  return out
}
