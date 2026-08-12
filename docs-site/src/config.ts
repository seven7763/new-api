import type { Lang } from './i18n-nav'

/** Site config — edit freely. No new-api source changes required. */
export const siteConfig = {
  brand: 'DaoXE',
  tagline: 'AI API 网关文档',
  apiBase: 'https://daoxe.com',
  siteUrl: 'https://daoxe.com',
  /** Path the docs bundle is mounted at. Must match `base` in vite.config.ts. */
  docsPath: '/docs',
  description:
    'DaoXE 文档 — OpenAI / Anthropic / Gemini 兼容的 AI API 网关。快速开始、客户端接入、API 参考、计费说明与常见问题。',
  /** Suffix for per-page descriptions; the full one is too long once a page title is prepended. */
  descriptionShort: 'OpenAI / Anthropic / Gemini 兼容的 AI API 网关文档。',
  logo: 'https://pub-c7d601dad0a34aa5a4c2120181c189f9.r2.dev/logo.png',
  support: {
    telegram: 'https://t.me/daoxe_ai',
    telegramLabel: '@daoxe_ai',
    email: 'cabesalberto36216@gmail.com',
  },
  bases: [
    {
      id: 'gia',
      name: '全球优化',
      url: 'https://api.daoxe.com',
      openai: 'https://api.daoxe.com/v1',
      note: '推荐 · 全球线路',
    },
    {
      id: 'default',
      name: '默认',
      url: 'https://daoxe.com',
      openai: 'https://daoxe.com/v1',
      note: '与官网同源',
    },
    {
      id: 'jp',
      name: '直连',
      url: 'https://jp.daoxe.com',
      openai: 'https://jp.daoxe.com/v1',
      note: '长任务 / 超时场景',
    },
  ],
  /**
   * Floating docs assistant. The browser only talks to same-origin
   * `/docs-api/assistant/*`; the real key lives in `DOCS_ASSISTANT_KEY`
   * on the Vite middleware (dev) or Bun sidecar (prod) — never in the bundle.
   */
  assistant: {
    enabled: true,
    /** Documented defaults for the server proxy (not used by the browser). */
    baseUrl: 'https://jp.daoxe.com/v1',
    model: 'llama-3.1-8b',
  },
} as const

export type NavItem = {
  id: string
  title: string
  path: string
}

export type NavGroup = {
  id: string
  title: string
  items: NavItem[]
}

/** Sidebar tree — content lives in src/content/*.tsx keyed by id */
export const nav: NavGroup[] = [
  {
    id: 'start',
    title: '开始使用',
    items: [
      { id: 'welcome', title: '欢迎', path: '/' },
      { id: 'quickstart', title: '快速开始', path: '/start/quickstart' },
      { id: 'compliance', title: '账号与合规', path: '/start/compliance' },
      { id: 'console', title: '控制台导览', path: '/start/console' },
    ],
  },
  {
    id: 'guide',
    title: '接入指南',
    items: [
      { id: 'register', title: '注册登录', path: '/guide/register' },
      { id: 'topup', title: '充值与套餐', path: '/guide/topup' },
      { id: 'keys', title: '创建 API 密钥', path: '/guide/keys' },
      { id: 'base-url', title: '线路与 Base URL', path: '/guide/base-url' },
      { id: 'models', title: '模型与分组', path: '/guide/models' },
      { id: 'recommended-models', title: '推荐模型表', path: '/guide/recommended-models' },
      { id: 'clients', title: '客户端接入总览', path: '/guide/clients' },
      { id: 'deepchat', title: 'DeepChat（官方内置）', path: '/guide/deepchat' },
      { id: 'claude-code', title: 'Claude Code', path: '/guide/claude-code' },
      { id: 'cc-switch', title: 'CC Switch 图形配置', path: '/guide/cc-switch' },
      { id: 'codex', title: 'Codex CLI', path: '/guide/codex' },
      { id: 'gemini-cli', title: 'Gemini CLI', path: '/guide/gemini-cli' },
      { id: 'cline', title: 'Cline', path: '/guide/cline' },
      { id: 'cursor', title: 'Cursor', path: '/guide/cursor' },
      { id: 'opencode', title: 'OpenCode', path: '/guide/opencode' },
      { id: 'openclaw', title: 'OpenClaw', path: '/guide/openclaw' },
      { id: 'cherry-studio', title: 'Cherry Studio', path: '/guide/cherry-studio' },
      { id: 'chatbox', title: 'ChatBox', path: '/guide/chatbox' },
      { id: 'lobe-chat', title: 'Lobe Chat', path: '/guide/lobe-chat' },
      { id: 'nextchat', title: 'NextChat', path: '/guide/nextchat' },
      { id: 'open-webui', title: 'Open WebUI', path: '/guide/open-webui' },
      { id: 'immersive-translate', title: '沉浸式翻译', path: '/guide/immersive-translate' },
      { id: 'apps', title: '图形客户端与其他', path: '/guide/apps' },
      { id: 'sdk', title: '官方 SDK 示例', path: '/guide/sdk' },
      { id: 'multi-protocol', title: '双协议接入清单', path: '/guide/multi-protocol' },
      { id: 'verify', title: 'curl 验证', path: '/guide/verify' },
      { id: 'errors', title: '常见报错', path: '/guide/errors' },
    ],
  },
  {
    id: 'api',
    title: 'API 参考',
    items: [
      { id: 'auth', title: '鉴权与请求头', path: '/api/auth' },
      { id: 'routing', title: '线路 · 流式 · 超时', path: '/api/routing' },
      { id: 'openai-chat', title: 'OpenAI · Chat', path: '/api/openai-chat' },
      { id: 'openai-responses', title: 'OpenAI · Responses', path: '/api/openai-responses' },
      { id: 'openai-embeddings', title: 'OpenAI · Embeddings', path: '/api/openai-embeddings' },
      { id: 'claude', title: 'Anthropic · Messages', path: '/api/claude' },
      { id: 'gemini', title: 'Gemini 兼容', path: '/api/gemini' },
      { id: 'api-models', title: '模型列表', path: '/api/models' },
      { id: 'api-errors', title: '错误码', path: '/api/errors' },
      { id: 'rate-limit', title: '限流与重试', path: '/api/rate-limit' },
    ],
  },
  {
    id: 'billing',
    title: '计费与用量',
    items: [
      { id: 'billing-rules', title: '计费规则', path: '/billing/rules' },
      { id: 'billing-logs', title: '余额与日志', path: '/billing/logs' },
      { id: 'billing-pricing', title: '价格与分组', path: '/billing/pricing' },
      { id: 'topup-issues', title: '充值对账', path: '/billing/topup-issues' },
    ],
  },
  {
    id: 'features',
    title: '功能说明',
    items: [
      { id: 'wallet', title: '钱包与订单', path: '/features/wallet' },
      { id: 'feat-keys', title: '密钥管理', path: '/features/keys' },
      { id: 'feat-pricing', title: '模型广场 / 定价', path: '/features/pricing' },
      { id: 'invite', title: '邀请返佣', path: '/features/invite' },
      { id: 'notice', title: '公告与通知', path: '/features/notice' },
    ],
  },
  {
    id: 'support',
    title: '帮助与支持',
    items: [
      { id: 'faq', title: 'FAQ', path: '/support/faq' },
      { id: 'contact', title: '联系客服', path: '/support/contact' },
      { id: 'network', title: '网络与访问', path: '/support/network' },
    ],
  },
  {
    id: 'legal',
    title: '合规与协议',
    items: [
      { id: 'terms', title: '用户协议', path: '/legal/terms' },
      { id: 'privacy', title: '隐私政策', path: '/legal/privacy' },
      { id: 'abuse', title: '滥用举报', path: '/legal/abuse' },
    ],
  },
  {
    id: 'changelog',
    title: '更新与附录',
    items: [
      { id: 'changelog', title: '更新日志', path: '/changelog' },
      { id: 'glossary', title: '术语表', path: '/changelog/glossary' },
      { id: 'install', title: '环境安装附录', path: '/changelog/install' },
    ],
  },
]

export function flatNav() {
  return nav.flatMap((g) =>
    g.items.map((it) => ({
      ...it,
      groupId: g.id,
      groupTitle: g.title,
    }))
  )
}

/**
 * Landing page of a sidebar section. Groups are not routes of their own, so
 * the breadcrumb entry for a section resolves to its first page.
 */
export function groupEntryPath(groupId: string) {
  return nav.find((g) => g.id === groupId)?.items[0]?.path ?? '/'
}

export function findNavByPath(pathname: string) {
  const clean = pathname.replace(/\/$/, '') || '/'
  return flatNav().find((it) => it.path === clean) ?? null
}

export function absSite(path: string) {
  const base = siteConfig.siteUrl.replace(/\/$/, '')
  if (!path) return base + '/'
  if (/^https?:/i.test(path)) return path
  return base + (path.startsWith('/') ? path : '/' + path)
}

export function apiUrl(path: string) {
  return siteConfig.apiBase.replace(/\/$/, '') + path
}

/**
 * Where the bundle is mounted, without the trailing slash (`/docs` in prod, ''
 * at the site root). Comes from Vite's `base`; the prerender script sets the
 * same value through `BASE_URL` so build-time and browser URLs agree.
 */
export const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')

/** Languages that get their own URL space. */
export const ROUTE_LANGS = ['zh', 'en', 'ru', 'vi'] as const satisfies readonly Lang[]

/**
 * The default language keeps the historical prefix-free URLs
 * (`/docs/guide/keys`). Those are the ones search engines already indexed and
 * external pages already link to, so giving them a `/zh/` prefix would put 59
 * live URLs behind a redirect for no ranking gain. The other three languages —
 * which had no URLs of their own at all — live under `/docs/<lang>/…`.
 */
export const DEFAULT_LANG: Lang = 'zh'

/** Per-language document metadata. One source for the app and the SEO scripts. */
export const LANG_META: Record<Lang, { html: string; hreflang: string; ogLocale: string }> = {
  zh: { html: 'zh-CN', hreflang: 'zh', ogLocale: 'zh_CN' },
  en: { html: 'en', hreflang: 'en', ogLocale: 'en_US' },
  ru: { html: 'ru', hreflang: 'ru', ogLocale: 'ru_RU' },
  vi: { html: 'vi', hreflang: 'vi', ogLocale: 'vi_VN' },
}

/** URL segment for a language — empty for the default one. */
export function langPrefix(lang: Lang) {
  return lang === DEFAULT_LANG ? '' : `/${lang}`
}

function normalizeRoute(path: string) {
  if (!path || path === '/') return ''
  return (path.startsWith('/') ? path : `/${path}`).replace(/\/$/, '')
}

/**
 * Split a browser pathname into the docs language and the in-app route.
 * `prefixed` reports whether the URL carried an explicit language segment, so
 * callers can normalize `/docs/zh/x` (a valid spelling nobody should link to)
 * back onto the canonical `/docs/x`.
 *
 * The pathname is normalized the way the server already normalized it before
 * picking a file: `%2F` decodes to a separator, repeated slashes collapse
 * (nginx `merge_slashes`, on by default) and a trailing `index.html` names the
 * directory it lives in. Without that, nginx answers
 * `/docs/en/guide/keys/index.html` and `/docs//en/guide/keys` with the right
 * prerendered page while this function reports a route that does not exist —
 * main.tsx then sees a data-ssr mismatch, throws the correct article away and
 * client-renders the welcome page over it. Only these three spellings are
 * folded, and case-sensitively: they are exactly the ones nginx resolves to the
 * same file, and normalizing anything it would not (`/INDEX.HTML`) would swap
 * the mismatch for a wrong-page render.
 */
export function splitLangPath(pathname: string): { lang: Lang; path: string; prefixed: boolean } {
  let rest = pathname
    .replace(/%2f/gi, '/')
    .replace(/\/{2,}/g, '/')
    .replace(/\/index\.html$/, '/')
  if (basePath && rest.startsWith(basePath)) rest = rest.slice(basePath.length)
  if (!rest.startsWith('/')) rest = `/${rest}`
  const [, head, ...tail] = rest.split('/')
  const match = ROUTE_LANGS.find((l) => l === head)
  if (!match) return { lang: DEFAULT_LANG, path: normalizeRoute(rest) || '/', prefixed: false }
  return { lang: match, path: normalizeRoute(`/${tail.join('/')}`) || '/', prefixed: true }
}

/** Router basename for a language: `/docs` for zh, `/docs/en` for English. */
export function routerBasename(lang: Lang) {
  return `${basePath}${langPrefix(lang)}` || '/'
}

/**
 * Root-relative href of a docs route in a given language, for plain anchors
 * (the language switcher and the suggestion banner). React Router `<Link to>`
 * must NOT use this — the router's basename already carries the prefix.
 */
export function docsHref(path: string, lang: Lang = DEFAULT_LANG) {
  const route = normalizeRoute(path)
  const head = `${basePath}${langPrefix(lang)}`
  return route ? `${head}${route}` : `${head}/`
}

/**
 * Absolute public URL of a docs route (`/guide/keys` →
 * `https://daoxe.com/docs/guide/keys`, or `…/docs/en/guide/keys`). Used for
 * canonical links, hreflang, Open Graph URLs and the sitemap, all of which must
 * agree on one spelling per page and language.
 */
export function docsUrl(path: string, lang: Lang = DEFAULT_LANG) {
  const origin = siteConfig.siteUrl.replace(/\/$/, '')
  const mount = siteConfig.docsPath.replace(/\/$/, '')
  const head = `${origin}${mount}${langPrefix(lang)}`
  const route = normalizeRoute(path)
  // The bare mount point 301s to the trailing-slash form (see deploy/*.conf),
  // so the index must advertise the post-redirect spelling.
  return route ? `${head}${route}` : `${head}/`
}

/**
 * hreflang set for one docs route: every language variant plus `x-default`.
 * Search engines only honour hreflang when the declaration is reciprocal, so
 * this single helper feeds the rendered <link> tags, the prerendered HTML and
 * the sitemap — they cannot drift apart.
 */
export function langAlternates(path: string) {
  const list = ROUTE_LANGS.map((lang) => ({
    hreflang: LANG_META[lang].hreflang,
    href: docsUrl(path, lang),
  }))
  list.push({ hreflang: 'x-default', href: docsUrl(path, DEFAULT_LANG) })
  return list
}

/**
 * Resolve a static asset that lives in `public/` (images, search index) against
 * the deployment base. Under `/docs/` a root-absolute `/images/x.png` must load
 * from `/docs/images/x.png`; at the site root it stays `/images/x.png`. Absolute
 * URLs and data URIs pass through untouched. Note: backend API calls use
 * `apiUrl` (absolute host), NOT this — they must never gain the /docs prefix.
 * Language prefixes are deliberately absent: assets are shared by all four.
 */
export function asset(path: string) {
  if (!path || /^(https?:|data:|\/\/)/i.test(path)) return path
  return path.startsWith('/') ? basePath + path : path
}
