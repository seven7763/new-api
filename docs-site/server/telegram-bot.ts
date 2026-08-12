/**
 * Telegram docs assistant — long-poll a group and answer with the same
 * docs-RAG + LLM stack as the web floating assistant.
 *
 * Env (see .env.example):
 *   DOCS_ASSISTANT_KEY=sk-...          # required (LLM)
 *   DOCS_TG_BOT_TOKEN=123:ABC...       # required
 *   DOCS_TG_CHAT_ID=-1003921202085     # required (supergroup id)
 *   DOCS_TG_REQUIRE_MENTION=1          # optional, default 1 in groups
 *   DOCS_TG_DOCS_BASE=https://daoxe.com/docs
 *   DOCS_ASSISTANT_BASE / MODEL / BRAND as for the web proxy
 *
 * Run:
 *   bun run assistant:tg
 *   # or: bun server/telegram-bot.ts
 */
import { answerWithDocs, assistantServerConfig, type ContextHit } from './chat-handler'
import { detectLang, searchDocs, type Lang } from './doc-search'

// Load .env.local / .env if present (Bun auto-loads .env; we also try .env.local)
async function loadDotEnv() {
  const { dirname, join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  for (const name of ['.env.local', '.env']) {
    try {
      const f = Bun.file(join(root, name))
      if (!(await f.exists())) continue
      const text = await f.text()
      for (const line of text.split(/\r?\n/)) {
        const t = line.trim()
        if (!t || t.startsWith('#')) continue
        const eq = t.indexOf('=')
        if (eq <= 0) continue
        const k = t.slice(0, eq).trim()
        let v = t.slice(eq + 1).trim()
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1)
        }
        if (process.env[k] == null || process.env[k] === '') {
          process.env[k] = v
        }
      }
    } catch {
      /* ignore */
    }
  }
}

await loadDotEnv()

function env(name: string, fallback = ''): string {
  const v = process.env[name]
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}

const TOKEN = env('DOCS_TG_BOT_TOKEN')
// Comma-separated group/supergroup ids. Private DMs to the bot are always allowed.
const CHAT_IDS = env('DOCS_TG_CHAT_ID')
  .split(/[,\s]+/)
  .map((s) => s.trim())
  .filter(Boolean)
const DOCS_BASE = env('DOCS_TG_DOCS_BASE', 'https://daoxe.com/docs').replace(/\/$/, '')
const REQUIRE_MENTION = !['0', 'false', 'no'].includes(
  env('DOCS_TG_REQUIRE_MENTION', '1').toLowerCase()
)
const COOLDOWN_MS = Math.max(0, Number(env('DOCS_TG_COOLDOWN_MS', '4000')) || 4000)
const MAX_REPLY = 3500
const ALLOW_PRIVATE = !['0', 'false', 'no'].includes(
  env('DOCS_TG_ALLOW_PRIVATE', '1').toLowerCase()
)
// Cap simultaneous LLM calls: a busy group must not fan out into unbounded
// upstream spend, and each answer already costs seconds of wall time.
const MAX_CONCURRENT = Math.max(1, Number(env('DOCS_TG_MAX_CONCURRENT', '4')) || 4)

if (!TOKEN) {
  console.error('[tg-bot] missing DOCS_TG_BOT_TOKEN')
  process.exit(1)
}
if (!CHAT_IDS.length) {
  console.error('[tg-bot] missing DOCS_TG_CHAT_ID')
  process.exit(1)
}
if (!assistantServerConfig().enabled) {
  console.error('[tg-bot] missing DOCS_ASSISTANT_KEY')
  process.exit(1)
}

const API = `https://api.telegram.org/bot${TOKEN}`

/**
 * Telegram embeds the bot token in the request path, so any error string that
 * quotes a URL leaks it. Scrub the token and API-key shapes before logging.
 */
function redact(text: string): string {
  return text
    .split(TOKEN)
    .join('[redacted-token]')
    .replace(/\bsk-[A-Za-z0-9_-]{8,}/g, 'sk-[redacted]')
}

type TgUser = {
  id: number
  is_bot?: boolean
  first_name?: string
  username?: string
}

type TgChat = {
  id: number
  type: string
  title?: string
  username?: string
}

type TgMessage = {
  message_id: number
  date: number
  chat: TgChat
  from?: TgUser
  text?: string
  caption?: string
  reply_to_message?: TgMessage
  entities?: { type: string; offset: number; length: number }[]
  caption_entities?: { type: string; offset: number; length: number }[]
}

type TgUpdate = {
  update_id: number
  message?: TgMessage
  edited_message?: TgMessage
}

type Me = { id: number; username?: string; first_name?: string }

let me: Me | null = null
let offset = 0
const recentUserAt = new Map<number, number>() // userId -> last answered
const inflight = new Set<string>() // chatId:msgId
let active = 0 // in-flight upstream answers

/**
 * Drop cooldown entries that can no longer block anyone. Without this the map
 * keeps one entry per user seen since boot, which never stops growing in a
 * process meant to run for weeks.
 */
function pruneCooldowns(now: number) {
  if (recentUserAt.size < 1000) return
  for (const [id, at] of recentUserAt) {
    if (now - at > COOLDOWN_MS) recentUserAt.delete(id)
  }
}

async function tg<T>(
  method: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = (await res.json()) as {
    ok: boolean
    description?: string
    result?: T
  }
  if (!data.ok) {
    throw new Error(data.description || `tg_${method}_failed`)
  }
  return data.result as T
}

function allowedChat(msg: TgMessage): boolean {
  const id = String(msg.chat.id)
  if (msg.chat.type === 'private') return ALLOW_PRIVATE
  return CHAT_IDS.includes(id)
}

function stripMentions(text: string, botUsername?: string): string {
  let out = text
  if (botUsername) {
    const escaped = botUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out.replace(new RegExp(`@${escaped}\\b`, 'gi'), ' ')
  }
  // drop bare /ask style commands prefix
  out = out.replace(/^\/(?:ask|help|start|docs)(?:@\w+)?\s*/i, '')
  return out.replace(/\s+/g, ' ').trim()
}

function messageMentionsBot(msg: TgMessage, botUsername?: string): boolean {
  if (!botUsername) return false
  const entities = msg.entities || msg.caption_entities || []
  const text = msg.text || msg.caption || ''
  for (const e of entities) {
    if (e.type !== 'mention' && e.type !== 'text_mention') continue
    const slice = text.slice(e.offset, e.offset + e.length)
    if (slice.toLowerCase() === `@${botUsername.toLowerCase()}`) return true
  }
  // also: reply to bot
  if (msg.reply_to_message?.from?.id && me && msg.reply_to_message.from.id === me.id) {
    return true
  }
  // command /ask@bot
  if (msg.text && /^\/(?:ask|help|start|docs)(?:@\w+)?/i.test(msg.text)) {
    const m = msg.text.match(/^\/(?:ask|help|start|docs)(?:@(\w+))?/i)
    if (!m?.[1] || m[1].toLowerCase() === botUsername.toLowerCase()) return true
  }
  return text.toLowerCase().includes(`@${botUsername.toLowerCase()}`)
}

function isQuestionLike(text: string): boolean {
  if (text.length < 2) return false
  if (/[?？]/.test(text)) return true
  // common support intents
  if (
    /(怎么|如何|为何|为什么|什么|哪|能否|可以|报错|失败|401|403|429|timeout|error|base\s*url|api\s*key|密钥|模型|充值|余额|webhook|curl)/i.test(
      text
    )
  ) {
    return true
  }
  // short greeting-only → no
  if (/^(hi|hello|hey|你好|您好|在吗|在么|早上好|晚安)[.!！。]*$/i.test(text)) {
    return false
  }
  return text.length >= 8
}

function truncate(s: string, max = MAX_REPLY): string {
  if (s.length <= max) return s
  return `${s.slice(0, max - 20).trimEnd()}\n…(已截断)`
}

function formatReply(text: string, hits: ContextHit[], lang: Lang): string {
  let body = text.trim()
  // light cleanup: collapse 3+ newlines
  body = body.replace(/\n{3,}/g, '\n\n')
  body = truncate(body)

  if (hits.length) {
    const label =
      lang === 'en'
        ? 'Docs'
        : lang === 'ru'
          ? 'Документы'
          : lang === 'vi'
            ? 'Tài liệu'
            : '相关文档'
    const links = hits
      .slice(0, 3)
      .map((h) => {
        const path = h.path.startsWith('/') ? h.path : `/${h.path}`
        const url = `${DOCS_BASE}${path === '/' ? '' : path}`
        return `• ${h.title} — ${url}`
      })
      .join('\n')
    body = `${body}\n\n${label}:\n${links}`
  }
  return truncate(body, MAX_REPLY)
}

async function sendChatAction(chatId: number | string, action = 'typing') {
  try {
    await tg('sendChatAction', { chat_id: chatId, action })
  } catch {
    /* ignore */
  }
}

async function replyTo(
  chatId: number | string,
  text: string,
  replyToMessageId?: number
) {
  await tg('sendMessage', {
    chat_id: chatId,
    text,
    reply_to_message_id: replyToMessageId,
    disable_web_page_preview: true,
  })
}

async function handleMessage(msg: TgMessage) {
  const raw = (msg.text || msg.caption || '').trim()
  const userId = msg.from?.id || 0
  const preview = raw.slice(0, 80).replace(/\s+/g, ' ')
  console.log(
    `[tg-bot] msg chat=${msg.chat.id} type=${msg.chat.type} user=${userId} bot=${Boolean(msg.from?.is_bot)} text="${preview}"`
  )

  // Ignore our own outbound messages only.
  // Do NOT drop all bots: anonymous group admins arrive as GroupAnonymousBot (1087968824).
  if (me && msg.from?.id === me.id) {
    console.log('[tg-bot] skip: self')
    return
  }
  if (!allowedChat(msg)) {
    console.log(
      `[tg-bot] skip: chat_not_allowed want=[${CHAT_IDS.join(',')}] private=${ALLOW_PRIVATE}`
    )
    return
  }
  if (!raw) {
    console.log('[tg-bot] skip: empty')
    return
  }

  // private chats with the bot: always answer; groups: mention/command unless disabled
  const isPrivate = msg.chat.type === 'private'
  if (!isPrivate && REQUIRE_MENTION && !messageMentionsBot(msg, me?.username)) {
    console.log('[tg-bot] skip: mention_required')
    return
  }

  const question = stripMentions(raw, me?.username)
  // /start /help /ask with no body → usage
  if (!question || /^\/(?:start|help|ask)(?:@\w+)?$/i.test(raw)) {
    const uname = me?.username ? me.username : 'bot'
    await replyTo(
      msg.chat.id,
      [
        `我是 DaoXE 文档助手（只答文档问题，不会执行任何命令/工具）。`,
        isPrivate
          ? `直接发送问题即可，例如：Base URL 怎么填？`
          : `在本群里 @${uname} 提问，或发送 /ask 你的问题。`,
        `例如：/ask Base URL 怎么填？`,
        `文档：${DOCS_BASE}`,
      ].join('\n'),
      msg.message_id
    )
    console.log(`[tg-bot] help chat=${msg.chat.id} user=${userId}`)
    return
  }

  // private: answer any non-trivial text; groups: question-like or /ask
  if (!isPrivate && !isQuestionLike(question) && !/^\/ask/i.test(raw)) {
    console.log('[tg-bot] skip: not_question_like')
    return
  }
  if (isPrivate && question.length < 2) {
    console.log('[tg-bot] skip: too_short')
    return
  }

  const now = Date.now()
  const last = recentUserAt.get(userId) || 0
  if (now - last < COOLDOWN_MS) {
    console.log('[tg-bot] skip: cooldown')
    return
  }
  pruneCooldowns(now)
  recentUserAt.set(userId, now)

  const key = `${msg.chat.id}:${msg.message_id}`
  if (inflight.has(key)) return
  if (active >= MAX_CONCURRENT) {
    console.log(`[tg-bot] skip: busy active=${active}`)
    return
  }
  inflight.add(key)
  active++

  try {
    await sendChatAction(msg.chat.id)
    const lang = detectLang(question)
    const hits = searchDocs(question, lang, 5)
    const context: ContextHit[] = hits.map((h) => ({
      title: h.title,
      path: h.path,
      snippet: h.excerpt || h.snippet,
    }))

    const typing = setInterval(() => {
      void sendChatAction(msg.chat.id)
    }, 4000)

    let answerText: string
    try {
      const { text } = await answerWithDocs({
        question,
        lang,
        context,
        channel: 'telegram',
        maxTokens: 700,
        pageTitle: isPrivate ? 'Telegram private chat' : 'Telegram support group',
        pagePath: '',
      })
      answerText = text
    } finally {
      clearInterval(typing)
    }

    const out = formatReply(answerText, context, lang)
    await replyTo(msg.chat.id, out, msg.message_id)
    console.log(
      `[tg-bot] ok chat=${msg.chat.id} user=${userId} q="${question.slice(0, 60)}" hits=${hits.length}`
    )
  } catch (err) {
    const msgErr = err instanceof Error ? err.message : String(err)
    console.error(`[tg-bot] error: ${redact(msgErr)}`)
    // Upstream error bodies can carry internal hosts, request ids or key
    // fragments. Keep the detail in the server log, not in a public group.
    try {
      await replyTo(
        msg.chat.id,
        `暂时无法回答，请稍后再试，或直接看文档：${DOCS_BASE}`,
        msg.message_id
      )
    } catch {
      /* ignore */
    }
  } finally {
    inflight.delete(key)
    active--
  }
}

async function pollLoop() {
  me = await tg<Me>('getMe')
  console.log(
    `[tg-bot] online as @${me.username || me.id} · groups=[${CHAT_IDS.join(',')}] · private=${ALLOW_PRIVATE ? 'on' : 'off'} · mention=${REQUIRE_MENTION ? 'required' : 'any'} · model=${assistantServerConfig().model}`
  )

  // drop pending updates on start so we don't flood-reply history
  try {
    const pending = await tg<TgUpdate[]>('getUpdates', {
      offset: -1,
      timeout: 0,
    })
    if (pending.length) {
      offset = pending[pending.length - 1].update_id + 1
    }
  } catch {
    /* ignore */
  }

  for (;;) {
    try {
      const updates = await tg<TgUpdate[]>('getUpdates', {
        offset,
        timeout: 30,
        // include private + group messages; no webhook
        allowed_updates: ['message', 'edited_message'],
      })
      if (updates.length) {
        console.log(`[tg-bot] poll got ${updates.length} update(s)`)
      }
      for (const u of updates) {
        offset = u.update_id + 1
        const msg = u.message || u.edited_message
        if (msg) {
          // fire-and-forget so one slow LLM doesn't block the poll
          void handleMessage(msg).catch((err) => {
            console.error(
              `[tg-bot] handle crash: ${redact(err instanceof Error ? err.message : String(err))}`
            )
          })
        }
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err)
      console.error(`[tg-bot] poll error: ${redact(m)}`)
      await Bun.sleep(2000)
    }
  }
}

// A rejected promise anywhere else must not take the long-poll loop down.
process.on('unhandledRejection', (reason) => {
  console.error(
    `[tg-bot] unhandled rejection: ${redact(reason instanceof Error ? reason.message : String(reason))}`
  )
})

pollLoop().catch((err) => {
  console.error(redact(err instanceof Error ? err.message : String(err)))
  process.exit(1)
})
