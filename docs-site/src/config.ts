/** Site config — edit freely. No new-api source changes required. */
export const siteConfig = {
  brand: 'DaoXE',
  tagline: 'AI API 网关文档',
  apiBase: 'https://daoxe.com',
  siteUrl: 'https://daoxe.com',
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
 * Resolve a static asset that lives in `public/` (images, search index) against
 * the deployment base. Under `/docs/` a root-absolute `/images/x.png` must load
 * from `/docs/images/x.png`; at the site root it stays `/images/x.png`. Absolute
 * URLs and data URIs pass through untouched. Note: backend API calls use
 * `apiUrl` (absolute host), NOT this — they must never gain the /docs prefix.
 */
export function asset(path: string) {
  if (!path || /^(https?:|data:|\/\/)/i.test(path)) return path
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return path.startsWith('/') ? base + path : path
}
