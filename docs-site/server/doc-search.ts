/**
 * Server-side docs search over the prebuilt search-index JSON.
 * Chinese-aware tokenization + synonym expansion so support questions
 * actually hit the right pages (the whitespace-only AND matcher does not).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export type Lang = 'zh' | 'en' | 'ru' | 'vi'

export type StoredDoc = {
  id: string
  path: string
  groupId: string
  title: string
  groupTitle: string
  titleEn: string
  groupTitleEn: string
  text: string
}

export type SearchHit = {
  id: string
  path: string
  title: string
  groupTitle: string
  /** Short UI snippet */
  snippet: string
  /** Longer body for LLM context */
  excerpt: string
  score: number
}

type SearchDoc = StoredDoc & { hay: string }

function env(name: string, fallback = ''): string {
  const v = process.env[name]
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}

function resolveIndexDir(): string {
  const fromEnv = env('DOCS_SEARCH_INDEX_DIR')
  if (fromEnv && existsSync(fromEnv)) return fromEnv

  const here = dirname(fileURLToPath(import.meta.url))
  const root = join(here, '..')
  const candidates = [
    join(root, 'public', 'search-index'),
    join(root, 'dist', 'search-index'),
    '/var/www/daoxe-docs/search-index',
  ]
  for (const c of candidates) {
    if (existsSync(join(c, 'zh.json'))) return c
  }
  return candidates[0]
}

function computeHay(d: StoredDoc): string {
  return `${d.id} ${d.path} ${d.title} ${d.groupTitle} ${d.titleEn} ${d.groupTitleEn} ${d.text}`.toLowerCase()
}

const cache = new Map<Lang, SearchDoc[]>()

export function loadSearchIndex(lang: Lang = 'zh'): SearchDoc[] {
  const cached = cache.get(lang)
  if (cached) return cached

  const dir = resolveIndexDir()
  const file = join(dir, `${lang}.json`)
  const fallback = join(dir, 'zh.json')
  const path = existsSync(file) ? file : fallback
  if (!existsSync(path)) {
    throw new Error(`search_index_missing:${path}`)
  }
  const raw = JSON.parse(readFileSync(path, 'utf8')) as StoredDoc[]
  const docs = raw.map((d) => ({ ...d, hay: computeHay(d) }))
  cache.set(lang, docs)
  return docs
}

export function reloadSearchIndexes() {
  cache.clear()
}

/** Product synonyms — expand user phrasing to doc vocabulary. */
const SYNONYMS: Record<string, string[]> = {
  // keys
  key: ['密钥', 'api key', 'apikey', 'token', 'sk-', '令牌', 'keys'],
  'api key': ['密钥', 'apikey', 'token', 'sk-', '令牌', 'keys', '创建密钥'],
  apikey: ['密钥', 'api key', 'token', 'sk-', 'keys'],
  密钥: ['key', 'api key', 'apikey', 'token', 'sk-', '令牌', 'keys', '创建'],
  令牌: ['token', '密钥', 'key', 'keys'],
  token: ['令牌', '密钥', 'key', 'keys'],
  sk: ['密钥', 'key', 'token', 'sk-'],
  // base url / routing
  'base url': ['线路', 'base-url', 'endpoint', 'baseurl', 'api.daoxe.com', '主机'],
  baseurl: ['线路', 'base url', 'base-url', 'endpoint'],
  线路: ['base url', 'base-url', 'endpoint', 'baseurl', 'api.daoxe.com'],
  endpoint: ['线路', 'base url', 'base-url'],
  地址: ['base url', '线路', 'endpoint', 'url'],
  // billing
  充值: ['topup', '钱包', '余额', 'billing', 'wallet'],
  余额: ['quota', '钱包', '充值', 'billing'],
  计费: ['billing', '定价', 'pricing', '倍率'],
  定价: ['pricing', '计费', 'billing'],
  // models
  模型: ['model', 'models', '推荐模型'],
  model: ['模型', 'models'],
  分组: ['group', '令牌分组'],
  // errors
  '401': ['鉴权', 'invalid token', 'unauthorized', 'bearer'],
  '403': ['无权', '余额不足', 'forbidden'],
  '429': ['限流', 'rate limit'],
  报错: ['错误', 'error', 'errors'],
  错误: ['error', 'errors', '报错'],
  // clients
  claude: ['claude code', 'anthropic', 'messages'],
  cursor: ['cursor'],
  codex: ['codex'],
  // actions
  怎么: [],
  如何: [],
  什么: [],
  哪里: [],
  怎样: [],
  配置: ['设置', '接入', '填'],
  接入: ['配置', '客户端'],
  获取: ['创建', '申请', '生成'],
  创建: ['生成', '新建', 'keys'],
  使用: ['用法', '调用'],
}

const STOP = new Set(
  [
    '的',
    '了',
    '吗',
    '呢',
    '吧',
    '啊',
    '呀',
    '么',
    '嘛',
    '是',
    '在',
    '和',
    '与',
    '或',
    '及',
    '等',
    '被',
    '把',
    '对',
    '从',
    '向',
    '给',
    '让',
    '用',
    '到',
    '为',
    '以',
    '而',
    '就',
    '都',
    '也',
    '还',
    '很',
    '更',
    '最',
    '请',
    '帮',
    '一下',
    '这个',
    '那个',
    '什么',
    '怎么',
    '如何',
    '怎样',
    '哪里',
    '哪些',
    '多少',
    '可否',
    '能否',
    '可以',
    '需要',
    '想',
    '问',
    '一下',
    '一下',
    'the',
    'a',
    'an',
    'is',
    'are',
    'was',
    'were',
    'be',
    'to',
    'of',
    'in',
    'on',
    'for',
    'and',
    'or',
    'with',
    'how',
    'what',
    'where',
    'when',
    'why',
    'which',
    'do',
    'does',
    'did',
    'can',
    'could',
    'should',
    'would',
    'i',
    'me',
    'my',
    'we',
    'you',
    'your',
    'it',
    'this',
    'that',
    'please',
    'help',
    'tell',
    'about',
  ].map((s) => s.toLowerCase())
)

/**
 * Tokenize for mixed zh/en support queries.
 * - Latin words kept as whole tokens
 * - CJK: unigrams + bigrams (after stripping stopwords)
 * - Multi-word English phrases from synonym keys if present in query
 */
export function tokenizeQuery(query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const tokens = new Set<string>()

  // phrase synonyms first (longer keys first)
  const phraseKeys = Object.keys(SYNONYMS).sort((a, b) => b.length - a.length)
  let rest = q
  for (const key of phraseKeys) {
    if (key.length < 2) continue
    if (rest.includes(key)) {
      tokens.add(key)
      for (const syn of SYNONYMS[key] || []) {
        if (syn) tokens.add(syn.toLowerCase())
      }
      rest = rest.split(key).join(' ')
    }
  }

  // latin / numbers / sk- style
  for (const m of q.match(/[a-z][a-z0-9._+-]{1,}|sk-[a-z0-9]+|\d{3}/gi) || []) {
    const t = m.toLowerCase()
    if (!STOP.has(t) && t.length >= 2) tokens.add(t)
    for (const syn of SYNONYMS[t] || []) if (syn) tokens.add(syn.toLowerCase())
  }

  // CJK runs → unigrams + bigrams
  for (const run of q.match(/[一-鿿]{1,}/g) || []) {
    const chars = [...run].filter((c) => !STOP.has(c))
    for (const c of chars) {
      if (!STOP.has(c)) tokens.add(c)
      for (const syn of SYNONYMS[c] || []) if (syn) tokens.add(syn.toLowerCase())
    }
    for (let i = 0; i < chars.length - 1; i++) {
      const bi = chars[i] + chars[i + 1]
      if (!STOP.has(bi)) tokens.add(bi)
      for (const syn of SYNONYMS[bi] || []) if (syn) tokens.add(syn.toLowerCase())
    }
    // whole run if short phrase (2-6 chars)
    if (run.length >= 2 && run.length <= 8 && !STOP.has(run)) {
      tokens.add(run)
      for (const syn of SYNONYMS[run] || []) if (syn) tokens.add(syn.toLowerCase())
    }
  }

  // drop ultra-short pure latin noise except known codes
  return [...tokens].filter((t) => {
    if (!t || STOP.has(t)) return false
    if (/^\d{3}$/.test(t)) return true
    if (/^sk-/.test(t)) return true
    if (/^[一-鿿]$/.test(t)) return true // keep CJK unigrams
    return t.length >= 2
  })
}

function makeSnippet(doc: SearchDoc, tokens: string[], max = 220) {
  const lower = doc.text.toLowerCase()
  let pos = -1
  for (const tk of tokens) {
    if (tk.length < 2 && !/[一-鿿]/.test(tk)) continue
    const p = lower.indexOf(tk)
    if (p >= 0 && (pos < 0 || p < pos)) pos = p
  }
  if (pos < 0) return doc.text.slice(0, max)
  let start = Math.max(0, pos - 50)
  const end = Math.min(doc.text.length, pos + max - 50)
  if (start > 0) {
    const sp = doc.text.indexOf(' ', start)
    if (sp >= 0 && sp < pos) start = sp + 1
  }
  return `${start > 0 ? '…' : ''}${doc.text.slice(start, end)}${end < doc.text.length ? '…' : ''}`
}

function countOccurrences(hay: string, needle: string) {
  if (!needle) return 0
  let n = 0
  let i = hay.indexOf(needle)
  while (i >= 0 && n < 30) {
    n++
    i = hay.indexOf(needle, i + Math.max(needle.length, 1))
  }
  return n
}

/**
 * Soft retrieval: score by matched tokens (OR), boost title/id hits.
 * Does NOT require every token to match (AND) — that broke Chinese questions.
 */
export function searchDocs(
  query: string,
  lang: Lang = 'zh',
  limit = 6
): SearchHit[] {
  const docs = loadSearchIndex(lang)
  const q = query.trim()
  if (!q) return []

  const tokens = tokenizeQuery(q)
  if (!tokens.length) {
    // fallback: raw lowercased query as one token
    tokens.push(q.toLowerCase())
  }

  // Prefer substantive tokens for ranking weight
  const weight = (tk: string) => {
    if (/^(key|api key|密钥|令牌|token|base url|线路|充值|模型|401|403|429|claude|cursor)$/i.test(tk))
      return 4
    if (tk.length >= 4) return 2.5
    if (/[一-鿿]{2,}/.test(tk)) return 2.2
    if (/[一-鿿]/.test(tk)) return 0.6
    if (tk.length <= 2) return 0.8
    return 1.4
  }

  const scored = docs
    .map((d) => {
      let score = 0
      let matched = 0
      const titleHay = `${d.title} ${d.titleEn} ${d.id} ${d.path}`.toLowerCase()
      for (const tk of tokens) {
        let tokenScore = 0
        if (titleHay.includes(tk)) tokenScore += 8 * weight(tk)
        if (
          d.groupTitle.toLowerCase().includes(tk) ||
          d.groupTitleEn.toLowerCase().includes(tk)
        ) {
          tokenScore += 2 * weight(tk)
        }
        if (d.id === tk || d.path.includes(tk)) tokenScore += 10
        const bodyHits = countOccurrences(d.hay, tk)
        if (bodyHits > 0) tokenScore += (1 + Math.min(bodyHits, 10) * 0.35) * weight(tk)
        if (tokenScore > 0) {
          matched++
          score += tokenScore
        }
      }
      // need at least one real match; boost multi-token agreement
      if (matched === 0) score = 0
      else score *= 1 + Math.min(matched, 6) * 0.08
      return { d, score, matched }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.d.path.localeCompare(b.d.path))
    .slice(0, limit)

  return scored.map(({ d, score }) => ({
    id: d.id,
    path: d.path,
    title: d.title,
    groupTitle: d.groupTitle,
    snippet: makeSnippet(d, tokens, 220),
    excerpt: d.text.slice(0, 1600),
    score,
  }))
}

/** Detect reply language from the question (very rough). */
export function detectLang(text: string): Lang {
  if (/[а-яА-ЯёЁ]/.test(text)) return 'ru'
  if (/[ăâđêôơưĂÂĐÊÔƠƯàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/.test(text)) return 'vi'
  if (/[一-鿿]/.test(text)) return 'zh'
  if (/[a-zA-Z]{3,}/.test(text) && !/[一-鿿]/.test(text)) return 'en'
  return 'zh'
}

/** Always-on server RAG context for the LLM. */
export function retrieveContextForQuestion(
  question: string,
  lang: Lang = 'zh',
  limit = 5
): { title: string; path: string; snippet: string }[] {
  return searchDocs(question, lang, limit).map((h) => ({
    title: h.title,
    path: h.path,
    // Prefer long excerpt so the model actually has facts
    snippet: h.excerpt || h.snippet,
  }))
}
