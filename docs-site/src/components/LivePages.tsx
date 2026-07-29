import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Bell,
  Calendar,
  Inbox,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
} from 'lucide-react'
import { apiUrl } from '@/config'
import { pickLang, useI18n } from '@/i18n'
import { useShell } from '@/shell/ShellContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Callout, Page } from '@/components/DocUI'

type Announcement = {
  id?: number
  content?: string
  extra?: string
  publishDate?: string
  type?: string
}

function formatDate(iso?: string, lang?: string) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString(lang === 'zh' ? 'zh-CN' : lang === 'ru' ? 'ru-RU' : lang === 'vi' ? 'vi-VN' : 'en-US')
  } catch {
    return iso
  }
}

/** Simple markdown-ish: paragraphs + **bold** + `code` + links */
function renderSoftMarkdown(src: string) {
  const blocks = src.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return blocks.map((block, bi) => {
    const lines = block.split('\n')
    const nodes: ReactNode[] = []
    lines.forEach((line, li) => {
      if (li) nodes.push(<br key={`br-${bi}-${li}`} />)
      // inline code / bold / links
      const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s)]+)/g)
      parts.forEach((p, pi) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          nodes.push(
            <strong key={`${bi}-${li}-${pi}`} className="font-semibold">
              {p.slice(2, -2)}
            </strong>
          )
        } else if (p.startsWith('`') && p.endsWith('`')) {
          nodes.push(
            <code key={`${bi}-${li}-${pi}`} className="bg-muted rounded px-1 py-0.5 font-mono text-[0.85em]">
              {p.slice(1, -1)}
            </code>
          )
        } else if (/^https?:\/\//.test(p)) {
          nodes.push(
            <a key={`${bi}-${li}-${pi}`} href={p} target="_blank" rel="noopener noreferrer">
              {p}
            </a>
          )
        } else if (p.startsWith('# ')) {
          nodes.push(
            <span key={`${bi}-${li}-${pi}`} className="text-base font-bold">
              {p.slice(2)}
            </span>
          )
        } else {
          nodes.push(<span key={`${bi}-${li}-${pi}`}>{p}</span>)
        }
      })
    })
    return (
      <p key={bi} className="mb-3 text-[0.92rem] leading-relaxed last:mb-0">
        {nodes}
      </p>
    )
  })
}

/** Intentional empty state — used when live notice/faq lists return no data. */
function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="border-border/70 text-muted-foreground flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed px-6 py-10 text-center">
      <span className="bg-muted text-muted-foreground/80 flex size-10 items-center justify-center rounded-full">
        {icon}
      </span>
      <span className="text-sm">{text}</span>
    </div>
  )
}

export function LiveNoticesPage() {
  const { t, lang } = useI18n()
  const { noticeHtml, status, markNoticeSeen, refreshStatus } = useShell()
  const [loading, setLoading] = useState(false)
  const [systemNotice, setSystemNotice] = useState(noticeHtml)
  const [error, setError] = useState('')

  const announcements = (status as { announcements?: Announcement[] } | null)?.announcements || []
  const enabled =
    (status as { announcements_enabled?: boolean } | null)?.announcements_enabled !== false

  const refresh = () => {
    setLoading(true)
    setError('')
    Promise.all([
      fetch(apiUrl('/api/notice'), { headers: { Accept: 'application/json' } }).then((r) =>
        r.ok ? r.json() : null
      ),
      refreshStatus(),
    ])
      .then(([noticeJson]) => {
        if (noticeJson && typeof noticeJson.data === 'string') {
          setSystemNotice(noticeJson.data)
          markNoticeSeen()
        }
      })
      .catch((e: Error) => setError(e.message || 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setSystemNotice(noticeHtml)
  }, [noticeHtml])

  useEffect(() => {
    // ensure latest notice on page enter
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sorted = useMemo(() => {
    return [...announcements].sort((a, b) => {
      const ta = a.publishDate ? Date.parse(a.publishDate) : 0
      const tb = b.publishDate ? Date.parse(b.publishDate) : 0
      return tb - ta
    })
  }, [announcements])

  return (
    <Page title={t('live.notice.title')} lead={t('live.notice.lead')}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Bell className="size-3" /> API
        </Badge>
        <code className="text-muted-foreground text-xs">GET /api/notice · GET /api/status</code>
        <Button type="button" size="sm" variant="outline" onClick={refresh} disabled={loading}>
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          {t('common.refresh')}
        </Button>
      </div>

      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 flex gap-2 rounded-xl border px-3 py-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
        </div>
      ) : null}

      <h2>{t('live.notice.system')}</h2>
      <div className="border-border bg-card mb-6 rounded-xl border p-4 shadow-sm">
        {systemNotice?.trim() ? (
          <div className="prose-sm max-w-none">{renderSoftMarkdown(systemNotice)}</div>
        ) : (
          <p className="text-muted-foreground m-0 text-sm">{t('live.notice.empty')}</p>
        )}
      </div>

      <h2>{t('live.notice.list')}</h2>
      {!enabled ? (
        <Callout title={t('live.notice.disabled')}>{t('live.notice.disabled')}</Callout>
      ) : null}
      <div className="space-y-3">
        {sorted.map((a) => (
          <article
            key={a.id ?? `${a.publishDate}-${a.content?.slice(0, 12)}`}
            className="border-border bg-card rounded-xl border p-4 shadow-sm"
          >
            <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-2 text-xs">
              <Megaphone className="size-3.5" />
              <Badge variant="outline">{a.type || 'default'}</Badge>
              {a.publishDate ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {formatDate(a.publishDate, lang)}
                </span>
              ) : null}
              {a.id != null ? <span>#{a.id}</span> : null}
            </div>
            <div className="text-[0.92rem] leading-relaxed whitespace-pre-wrap">
              {a.content || '—'}
            </div>
            {a.extra ? (
              <div className="text-muted-foreground mt-2 text-xs whitespace-pre-wrap">{a.extra}</div>
            ) : null}
          </article>
        ))}
        {!sorted.length && (
          <EmptyState icon={<Inbox className="size-5" />} text={t('live.notice.empty')} />
        )}
      </div>
    </Page>
  )
}

type FaqItem = { question?: string; answer?: string }

export function LiveFaqPage() {
  const { t, lang } = useI18n()
  const tx = pickLang(lang, {
    zh: { items: '条', deepLinks: '快捷入口', contact: '联系客服' },
    en: { items: 'items', deepLinks: 'Deep links', contact: 'Contact' },
    ru: { items: 'шт.', deepLinks: 'Быстрые ссылки', contact: 'Контакты' },
    vi: { items: 'mục', deepLinks: 'Liên kết nhanh', contact: 'Liên hệ' },
  })
  const { status } = useShell()
  const [q, setQ] = useState('')
  const faq = ((status as { faq?: FaqItem[] } | null)?.faq || []) as FaqItem[]
  const enabled = (status as { faq_enabled?: boolean } | null)?.faq_enabled !== false

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return faq
    return faq.filter(
      (f) =>
        (f.question || '').toLowerCase().includes(qq) ||
        (f.answer || '').toLowerCase().includes(qq)
    )
  }, [faq, q])

  return (
    <Page title={t('live.faq.title')} lead={t('live.faq.lead')}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">API</Badge>
        <code className="text-muted-foreground text-xs">status.faq · /api/status</code>
        <span className="text-muted-foreground text-xs">
          {faq.length} {tx.items} · {enabled ? t('common.on') : t('common.off')}
        </span>
      </div>

      {!enabled ? <Callout warn title={t('live.faq.disabled')}>{t('live.faq.disabled')}</Callout> : null}

      <div className="border-border bg-card focus-within:ring-ring/40 mb-4 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2">
        <Search className="text-muted-foreground size-4 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('live.faq.search')}
          className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((f, i) => (
          <details
            key={`${f.question}-${i}`}
            className="border-border bg-card group rounded-xl border p-4 shadow-sm open:shadow-md"
            open={i === 0 && !q}
          >
            <summary className="cursor-pointer list-none text-[0.95rem] font-semibold">
              <span className="text-primary mr-2 text-xs font-bold">Q{i + 1}</span>
              {f.question || '—'}
            </summary>
            <div className="text-foreground/90 mt-3 whitespace-pre-wrap text-[0.92rem] leading-relaxed">
              {f.answer || '—'}
            </div>
          </details>
        ))}
        {!filtered.length && (
          <EmptyState icon={<Inbox className="size-5" />} text={t('live.faq.empty')} />
        )}
      </div>

      <Callout title={tx.deepLinks}>
        <Link to="/start/quickstart">{t('toc.quickstart')}</Link> ·{' '}
        <Link to="/guide/multi-protocol">{t('toc.protocol')}</Link> ·{' '}
        <Link to="/guide/errors">{t('toc.errors')}</Link> · <Link to="/support/contact">{tx.contact}</Link>
      </Callout>
    </Page>
  )
}


type ApiInfo = {
  id?: number
  route?: string
  url?: string
  description?: string
  color?: string
}

export function LiveRoutesBlock() {
  const { t, lang } = useI18n()
  const tx = pickLang(lang, {
    zh: { routes: 'API 路由', disabled: 'api_info 在 status 中已禁用。', empty: 'status 未返回 api_info——回退到 config 中的内置线路。' },
    en: { routes: 'API routes', disabled: 'api_info is disabled in status.', empty: 'No api_info from status — fallback to static bases in config.' },
    ru: { routes: 'Маршруты API', disabled: 'api_info отключён в status.', empty: 'status не вернул api_info — откат к встроенным маршрутам из config.' },
    vi: { routes: 'Tuyến API', disabled: 'api_info bị tắt trong status.', empty: 'status không trả về api_info — quay lại tuyến tích hợp trong config.' },
  })
  const { status } = useShell()
  const list = ((status as { api_info?: ApiInfo[] } | null)?.api_info || []) as ApiInfo[]
  const enabled = (status as { api_info_enabled?: boolean } | null)?.api_info_enabled !== false
  const [copied, setCopied] = useState('')

  if (!enabled) {
    return (
      <Callout warn title={tx.routes}>
        {tx.disabled}
      </Callout>
    )
  }
  if (!list.length) {
    return (
      <Callout title={tx.routes}>
        {tx.empty}
      </Callout>
    )
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Badge variant="secondary">API</Badge>
        <code>status.api_info</code>
        <span>· live</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-1">
        {list.map((item) => {
          const root = (item.url || '').replace(/\/$/, '')
          const openai = root ? `${root}/v1` : ''
          return (
            <div
              key={item.id ?? item.route}
              className="border-border bg-card flex flex-col gap-2 rounded-xl border p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.route || 'route'}</Badge>
                  <span className="text-muted-foreground text-xs">{item.description}</span>
                </div>
                <div className="font-mono text-[12.5px] break-all">
                  <div>
                    <span className="text-muted-foreground">root </span>
                    {root}
                  </div>
                  <div>
                    <span className="text-muted-foreground">openai </span>
                    {openai}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(openai || root)
                    setCopied(String(item.id))
                    setTimeout(() => setCopied(''), 1000)
                  }}
                >
                  {copied === String(item.id) ? t('common.copied') : t('common.copy') + ' /v1'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LiveAppsBlock() {
  const { t } = useI18n()
  const { status } = useShell()
  const chats = ((status as { chats?: Array<Record<string, string>> } | null)?.chats ||
    []) as Array<Record<string, string>>
  if (!chats.length) {
    return <p className="text-muted-foreground text-sm">{t('live.apps.empty')}</p>
  }
  return (
    <div className="mb-5">
      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
        <Badge variant="secondary">API</Badge>
        <code>status.chats</code>
      </div>
      <ul className="space-y-1.5 text-sm">
        {chats.map((c, i) => {
          const name = Object.keys(c)[0]
          const val = name ? c[name] : ''
          return (
            <li key={`${name}-${i}`} className="border-border bg-card rounded-lg border px-3 py-2">
              <span className="font-semibold">{name}</span>
              <span className="text-muted-foreground ml-2 font-mono text-xs break-all">{val}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

type EndpointMap = Record<string, { path?: string; method?: string }>

export function LiveEndpointsBlock() {
  const { t, lang } = useI18n()
  const tx = pickLang(lang, {
    zh: { pricingApi: '定价接口', type: '类型', method: '方法', path: '路径', group: '分组', ratio: '倍率', notes: '说明' },
    en: { pricingApi: 'Pricing API', type: 'Type', method: 'Method', path: 'Path', group: 'Group', ratio: 'Ratio', notes: 'Notes' },
    ru: { pricingApi: 'API цен', type: 'Тип', method: 'Метод', path: 'Путь', group: 'Группа', ratio: 'Коэффициент', notes: 'Примечания' },
    vi: { pricingApi: 'API giá', type: 'Loại', method: 'Phương thức', path: 'Đường dẫn', group: 'Nhóm', ratio: 'Hệ số', notes: 'Ghi chú' },
  })
  const [eps, setEps] = useState<EndpointMap>({})
  const [groups, setGroups] = useState<Record<string, string>>({})
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(apiUrl('/api/pricing'), { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        setEps((json?.supported_endpoint || {}) as EndpointMap)
        setGroups((json?.usable_group || {}) as Record<string, string>)
        setRatios((json?.group_ratio || {}) as Record<string, number>)
      })
      .catch((e: Error) => setErr(e.message || 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> {t('live.sync')}
      </p>
    )
  }
  if (err) {
    return (
      <Callout warn title={tx.pricingApi}>
        {err}
      </Callout>
    )
  }

  return (
    <div className="mb-5 space-y-5">
      <div>
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
          <Badge variant="secondary">API</Badge>
          <code>pricing.supported_endpoint</code>
        </div>
        <table>
          <thead>
            <tr>
              <th>{tx.type}</th>
              <th>{tx.method}</th>
              <th>{tx.path}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(eps).map(([k, v]) => (
              <tr key={k}>
                <td>
                  <code>{k}</code>
                </td>
                <td>{v?.method || '—'}</td>
                <td>
                  <code>{v?.path || '—'}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
          <Badge variant="secondary">API</Badge>
          <code>pricing.usable_group / group_ratio</code>
        </div>
        <table>
          <thead>
            <tr>
              <th>{tx.group}</th>
              <th>{tx.ratio}</th>
              <th>{tx.notes}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([g, note]) => (
              <tr key={g}>
                <td>
                  <code>{g}</code>
                </td>
                <td>{ratios[g] ?? '—'}</td>
                <td className="text-muted-foreground text-sm">{note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function LiveContactBlock() {
  const { t, lang } = useI18n()
  const tx = pickLang(lang, {
    zh: { email: '邮箱：', site: '站点：' },
    en: { email: 'Email: ', site: 'Site: ' },
    ru: { email: 'Эл. почта: ', site: 'Сайт: ' },
    vi: { email: 'Email: ', site: 'Trang: ' },
  })
  const { status } = useShell()
  const s = status as {
    footer_html?: string
    telegram_bot_name?: string
    telegram_oauth?: boolean
    github_oauth?: boolean
    system_name?: string
    server_address?: string
    version?: string
  } | null

  const footer = s?.footer_html || ''
  // extract emails and telegram from footer
  const emails = Array.from(footer.matchAll(/mailto:([^"'\s>]+)/g)).map((m) => m[1])
  const tglinks = Array.from(footer.matchAll(/https:\/\/t\.me\/([A-Za-z0-9_]+)/g)).map((m) => m[1])
  const email = emails[0] || 'cabesalberto36216@gmail.com'
  const tg = tglinks[0] || s?.telegram_bot_name?.replace(/_bot$/, '') || 'daoxe_ai'

  return (
    <div className="mb-5 space-y-3">
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">API</Badge>
        <code>status.footer_html / telegram_bot_name</code>
        {s?.version ? <span>· {s.version}</span> : null}
      </div>
      <ul className="space-y-2 text-sm">
        <li>
          Telegram：
          <a href={`https://t.me/${tg}`} target="_blank" rel="noopener noreferrer">
            @{tg}
          </a>
        </li>
        <li>
          {tx.email}
          <a href={`mailto:${email}`}>{email}</a>
        </li>
        {s?.server_address ? (
          <li>
            {tx.site}
            <a href={s.server_address} target="_blank" rel="noopener noreferrer">
              {s.server_address}
            </a>
          </li>
        ) : null}
      </ul>
      {footer ? (
        <details className="border-border bg-card rounded-xl border p-3 text-xs">
          <summary className="cursor-pointer font-semibold">{t('live.footerRaw')}</summary>
          <div className="mt-2" dangerouslySetInnerHTML={{ __html: footer }} />
        </details>
      ) : null}
    </div>
  )
}

export function LiveAuthOptionsBlock() {
  const { t, lang } = useI18n()
  const tx = pickLang(lang, {
    zh: { pw: '密码登录', pwReg: '密码注册', reg: '注册总开关', terms: '用户协议页', privacy: '隐私政策页', switches: 'status.* 登录相关开关', capability: '能力', state: '状态' },
    en: { pw: 'Password sign-in', pwReg: 'Password sign-up', reg: 'Registration', terms: 'Terms page', privacy: 'Privacy page', switches: 'status.* auth switches', capability: 'Capability', state: 'State' },
    ru: { pw: 'Вход по паролю', pwReg: 'Регистрация по паролю', reg: 'Регистрация', terms: 'Страница условий', privacy: 'Страница конфиденциальности', switches: 'status.* переключатели входа', capability: 'Возможность', state: 'Состояние' },
    vi: { pw: 'Đăng nhập mật khẩu', pwReg: 'Đăng ký mật khẩu', reg: 'Đăng ký', terms: 'Trang điều khoản', privacy: 'Trang quyền riêng tư', switches: 'status.* công tắc đăng nhập', capability: 'Khả năng', state: 'Trạng thái' },
  })
  const { status } = useShell()
  const s = status as Record<string, unknown> | null
  if (!s) return null
  const rows: { label: string; on: boolean }[] = [
    { label: tx.pw, on: !!s.password_login_enabled },
    { label: tx.pwReg, on: !!s.password_register_enabled },
    { label: tx.reg, on: !!s.register_enabled },
    { label: 'GitHub OAuth', on: !!s.github_oauth },
    { label: 'Telegram OAuth', on: !!s.telegram_oauth },
    { label: 'Passkey', on: !!s.passkey_login },
    { label: 'Turnstile', on: !!s.turnstile_check },
    { label: tx.terms, on: !!s.user_agreement_enabled },
    { label: tx.privacy, on: !!s.privacy_policy_enabled },
  ]
  return (
    <div className="mb-5">
      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
        <Badge variant="secondary">API</Badge>
        <code>{tx.switches}</code>
      </div>
      <table>
        <thead>
          <tr>
            <th>{tx.capability}</th>
            <th>{tx.state}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td>{r.on ? t('common.on') : t('common.off')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
