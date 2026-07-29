import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import {
  Bot,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  SendHorizontal,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react'
import { findNavByPath } from '@/config'
import { useI18n } from '@/i18n'
import { navTitle } from '@/i18n-nav'
import { highlightCode } from '@/lib/highlight'
import {
  buildClientPayload,
  probeAssistantEnabled,
  splitAssistantText,
  streamAssistantReply,
  type AssistantRefs,
  type ChatMessage,
} from '@/lib/docs-assistant'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type UiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  refs?: AssistantRefs
  error?: boolean
  streaming?: boolean
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function AssistantCodeBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    highlightCode(code, lang).then(
      (out) => { if (alive) setHtml(out) },
      () => { if (alive) setHtml(null) }
    )
    return () => { alive = false }
  }, [code, lang])

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-white/10 bg-[#1e2228]">
      <div className="flex items-center justify-between border-b border-white/8 bg-white/4 px-3 py-1.5">
        <span className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">{lang}</span>
        <button
          type="button"
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-white/10 hover:text-white transition"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            } catch { /* ignore */ }
          }}
        >
          {copied ? <Check className="size-3 text-emerald-300" /> : <Copy className="size-3" />}
        </button>
      </div>
      {html ? (
        <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-[1.7]" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-[1.7] text-slate-200">{code}</pre>
      )}
    </div>
  )
}

function AssistantBody({
  text,
  onNavigate,
}: {
  text: string
  onNavigate?: () => void
}) {
  const parts = splitAssistantText(text)
  return (
    <div className="docs-assistant-md whitespace-pre-wrap break-words">
      {parts.map((p, i) => {
        if (p.type === 'codeblock') {
          return (
            <AssistantCodeBlock key={i} code={p.value} lang={p.lang} />
          )
        }
        if (p.type === 'code') {
          return (
            <code key={i} className="docs-assistant-code">
              {p.value}
            </code>
          )
        }
        if (p.type === 'path') {
          return (
            <Link
              key={i}
              to={p.value}
              onClick={onNavigate}
              className="docs-assistant-path"
            >
              {p.value}
            </Link>
          )
        }
        return <span key={i}>{p.value}</span>
      })}
    </div>
  )
}

const SUGGEST_KEYS = [
  'assistant.suggest.quickstart',
  'assistant.suggest.baseurl',
  'assistant.suggest.keys',
  'assistant.suggest.errors',
] as const

function autosize(el: HTMLTextAreaElement | null, maxPx = 96) {
  if (!el) return
  el.style.height = '0px'
  el.style.height = `${Math.min(el.scrollHeight, maxPx)}px`
}

export function DocsAssistant() {
  const { t, lang } = useI18n()
  const location = useLocation()
  const item = findNavByPath(location.pathname)
  const pageTitle = item ? navTitle(item.id, lang, item.title) : t('crumb.docs')
  const pagePath = item?.path || location.pathname

  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    let alive = true
    probeAssistantEnabled().then((ok) => {
      if (alive) setEnabled(ok)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true })
      autosize(inputRef.current)
    }, 50)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!open || !listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open, busy])

  // Escape + body scroll lock while open (any viewport — panel is modal-ish)
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    // Only lock scroll on narrow viewports so desktop page doesn't jump
    const narrow = window.matchMedia('(max-width: 639.98px)').matches
    if (narrow) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
    }
  }, [open, busy])

  const historyForApi = useMemo<ChatMessage[]>(
    () =>
      messages
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content })),
    [messages]
  )

  if (!enabled) return null

  async function send(questionRaw?: string) {
    const question = (questionRaw ?? input).trim()
    if (!question || busy) return

    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = ''
    }
    const userMsg: UiMessage = { id: uid(), role: 'user', content: question }
    const assistantId = uid()
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ])
    setBusy(true)

    const ac = new AbortController()
    abortRef.current = ac

    try {
      const { body, refs } = await buildClientPayload({
        lang,
        pageTitle,
        pagePath,
        history: historyForApi,
        question,
      })

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, refs } : m))
      )

      let assembled = ''
      await streamAssistantReply(body, {
        signal: ac.signal,
        onDelta: (chunk) => {
          assembled += chunk
          const snapshot = assembled
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: snapshot, streaming: true } : m
            )
          )
        },
      })

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: assembled.trim() || t('assistant.empty'),
                streaming: false,
              }
            : m
        )
      )
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: m.content.trim() || t('assistant.stopped'),
                  streaming: false,
                }
              : m
          )
        )
      } else {
        const msg = err instanceof Error ? err.message : String(err)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: t('assistant.error').replace('{msg}', msg),
                  error: true,
                  streaming: false,
                }
              : m
          )
        )
      }
    } finally {
      abortRef.current = null
      setBusy(false)
    }
  }

  function stop() {
    abortRef.current?.abort()
  }

  function clear() {
    if (busy) stop()
    setMessages([])
    setInput('')
    if (inputRef.current) inputRef.current.style.height = ''
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void send()
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  return createPortal(
    <div className="docs-assistant" data-open={open ? 'true' : 'false'}>
      {open && (
        <>
          <button
            type="button"
            className="docs-assistant-backdrop"
            aria-label={t('assistant.close')}
            tabIndex={-1}
            onClick={() => !busy && setOpen(false)}
          />

          <div
            className="docs-assistant-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t('assistant.title')}
          >
            <div className="docs-assistant-handle" aria-hidden>
              <span />
            </div>

            <header className="docs-assistant-header">
              <div className="docs-assistant-avatar" aria-hidden>
                <Sparkles className="size-4" />
              </div>
              <div className="docs-assistant-heading">
                <div className="docs-assistant-title">{t('assistant.title')}</div>
                <div className="docs-assistant-subtitle">{t('assistant.subtitle')}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={clear}
                disabled={!messages.length && !input}
                aria-label={t('assistant.clear')}
                className="text-muted-foreground"
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => !busy && setOpen(false)}
                aria-label={t('assistant.close')}
                className="text-muted-foreground"
              >
                <X className="size-4" />
              </Button>
            </header>

            <div ref={listRef} className="docs-assistant-list">
              {messages.length === 0 && (
                <div className="docs-assistant-empty">
                  <div className="docs-assistant-welcome">
                    <p>{t('assistant.welcome')}</p>
                    <p className="docs-assistant-page">
                      {t('assistant.page').replace('{page}', pageTitle)}
                    </p>
                  </div>
                  <div className="docs-assistant-suggests">
                    {SUGGEST_KEYS.map((key) => (
                      <button
                        key={key}
                        type="button"
                        className="docs-assistant-chip"
                        onClick={() => void send(t(key))}
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'docs-assistant-row',
                    m.role === 'user' ? 'is-user' : 'is-assistant'
                  )}
                >
                  {m.role === 'assistant' && (
                    <div className="docs-assistant-bot" aria-hidden>
                      <Bot className="size-3.5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'docs-assistant-bubble',
                      m.role === 'user' && 'is-user',
                      m.error && 'is-error'
                    )}
                  >
                    {m.role === 'assistant' ? (
                      m.content ? (
                        <AssistantBody
                          text={m.content}
                          onNavigate={() => setOpen(false)}
                        />
                      ) : (
                        <span className="docs-assistant-thinking">
                          <Loader2 className="size-3.5 animate-spin" />
                          {t('assistant.thinking')}
                        </span>
                      )
                    ) : (
                      <div className="docs-assistant-md whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    )}
                    {m.refs && m.refs.length > 0 && !m.streaming && !m.error && (
                      <div className="docs-assistant-refs">
                        <span className="docs-assistant-refs-label">
                          {t('assistant.sources')}
                        </span>
                        {m.refs.slice(0, 4).map((r) => (
                          <Link
                            key={r.id}
                            to={r.path}
                            onClick={() => setOpen(false)}
                            className="docs-assistant-ref"
                            title={r.title}
                          >
                            {r.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form className="docs-assistant-composer" onSubmit={onSubmit}>
              <div className="docs-assistant-input-wrap">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    autosize(e.currentTarget)
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={t('assistant.placeholder')}
                  disabled={busy}
                  enterKeyHint="send"
                  className="docs-assistant-input"
                />
                {busy ? (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    onClick={stop}
                    aria-label={t('assistant.stop')}
                    className="docs-assistant-send"
                  >
                    <Square className="size-3.5 fill-current" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon-sm"
                    disabled={!input.trim()}
                    aria-label={t('assistant.send')}
                    className="docs-assistant-send"
                  >
                    <SendHorizontal className="size-4" />
                  </Button>
                )}
              </div>
              <p className="docs-assistant-disclaimer">{t('assistant.disclaimer')}</p>
            </form>
          </div>
        </>
      )}

      <button
        type="button"
        className="docs-assistant-fab"
        data-open={open ? 'true' : 'false'}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('assistant.close') : t('assistant.open')}
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        {!open && <span className="docs-assistant-fab-dot" aria-hidden />}
      </button>
    </div>,
    document.body
  )
}
