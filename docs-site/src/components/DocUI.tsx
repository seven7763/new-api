import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  ImageIcon,
  Info,
  PencilLine,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { highlightCode } from '@/lib/highlight'
import { asset, siteConfig } from '@/config'
import { pickLang, useI18n } from '@/i18n'
import { useShell } from '@/shell/ShellContext'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

export function Callout({
  title,
  children,
  warn,
}: {
  title?: string
  children: ReactNode
  warn?: boolean
}) {
  return (
    <div
      className={cn(
        'mb-4.5 relative flex gap-3 overflow-hidden rounded-xl border py-3 pr-4 pl-4.5 text-[0.875rem] shadow-xs',
        warn
          ? 'border-amber-500/30 bg-amber-500/8 text-amber-950 dark:bg-amber-400/8 dark:text-amber-50'
          : 'border-primary/20 bg-primary/6 text-foreground'
      )}
    >
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-1',
          warn ? 'bg-amber-500/70' : 'bg-primary/70'
        )}
      />
      <div
        className={cn(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md',
          warn ? 'bg-amber-500/15' : 'bg-primary/12'
        )}
      >
        {warn ? (
          <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-300" />
        ) : (
          <Info className="text-primary size-3.5" />
        )}
      </div>
      <div className="min-w-0 pt-0.5">
        {title ? (
          <div className="mb-1 text-xs font-bold tracking-wide">{title}</div>
        ) : null}
        <div className="text-foreground/90 leading-relaxed [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_code]:text-[0.85em]">
          {children}
        </div>
      </div>
    </div>
  )
}

export function Todo({ children }: { children: ReactNode }) {
  return (
    <div className="border-fuchsia-400/50 bg-fuchsia-500/8 mb-4.5 rounded-xl border border-dashed px-3.5 py-3 text-[0.875rem]">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">
        <PencilLine className="size-3.5" />
        待你改
      </div>
      <div className="text-foreground/80">{children}</div>
    </div>
  )
}

/** Guide screenshot: click / keyboard to open lightbox with zoom. */
export function Shot({
  src,
  alt,
  caption,
}: {
  src: string
  alt: string
  caption?: string
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [broken, setBroken] = useState(false)
  // Resolve against the deployment base so screenshots load under /docs too.
  const resolvedSrc = asset(src)

  const close = useCallback(() => {
    setOpen(false)
    setZoom(1)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))
      if (e.key === '-' || e.key === '_') setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
      if (e.key === '0') setZoom(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <>
      <figure className="border-border bg-card group mb-5 overflow-hidden rounded-xl border shadow-sm">
        <button
          type="button"
          onClick={() => !broken && setOpen(true)}
          aria-disabled={broken || undefined}
          className={cn(
            'bg-muted/50 relative block w-full border-0 p-0 text-left',
            broken ? 'cursor-default' : 'cursor-zoom-in'
          )}
          aria-label={`Enlarge: ${alt}`}
        >
          {broken ? (
            <div className="bg-muted/40 flex min-h-44 flex-col items-center justify-center gap-2.5 px-6 py-10 text-center">
              <span className="border-border bg-background text-muted-foreground/80 flex size-12 items-center justify-center rounded-xl border border-dashed">
                <ImageIcon className="size-5" />
              </span>
              <span className="text-muted-foreground max-w-xs text-xs font-medium leading-relaxed">
                {t('shot.broken')}
              </span>
            </div>
          ) : (
            <>
              <img
                src={resolvedSrc}
                alt={alt}
                loading="lazy"
                onError={() => setBroken(true)}
                className="mx-auto max-h-[min(52vh,480px)] w-full object-contain object-top transition group-hover:brightness-[0.97]"
              />
              <span className="bg-background/90 text-foreground pointer-events-none absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
                <ZoomIn className="size-3.5" /> {t('shot.zoom')}
              </span>
            </>
          )}
        </button>
        <figcaption className="text-muted-foreground flex items-start gap-2 border-t border-border px-3 py-2 text-xs leading-relaxed">
          <ImageIcon className="mt-0.5 size-3.5 shrink-0 opacity-70" />
          <span>
            {caption || alt}
            {!broken ? (
              <span className="text-muted-foreground/80"> · {t('shot.hint')}</span>
            ) : null}
          </span>
        </figcaption>
      </figure>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) close()
          else setOpen(true)
        }}
      >
        <DialogContent
          className="border-border/40 bg-background/95 flex h-[min(96vh,900px)] w-[min(96vw,1200px)] max-w-none flex-col gap-0 overflow-hidden p-0 shadow-2xl"
          aria-describedby={undefined}
        >
          <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-2 pr-12">
            <DialogTitle className="truncate text-sm font-semibold">{alt}</DialogTitle>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={t('shot.zoomOut')}
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              >
                <ZoomOut className="size-4" />
              </Button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground min-w-12 rounded-md px-1 text-xs tabular-nums"
                onClick={() => setZoom(1)}
                title={t('shot.reset')}
              >
                {Math.round(zoom * 100)}%
              </button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={t('shot.zoomInBtn')}
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={t('shot.original')}
                asChild
              >
                <a href={resolvedSrc} target="_blank" rel="noopener noreferrer">
                  <Download className="size-4" />
                </a>
              </Button>
            </div>
          </div>
          <div
            className="bg-muted/30 flex min-h-0 flex-1 cursor-grab items-center justify-center overflow-auto p-3 active:cursor-grabbing"
            onDoubleClick={() => setZoom((z) => (z === 1 ? 1.75 : 1))}
          >
            <img
              src={resolvedSrc}
              alt={alt}
              draggable={false}
              className="max-w-none select-none rounded-md shadow-lg transition-transform duration-150"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                maxHeight: zoom === 1 ? '100%' : 'none',
                maxWidth: zoom === 1 ? '100%' : 'none',
                width: zoom === 1 ? 'auto' : undefined,
              }}
            />
          </div>
          {caption ? (
            <div className="text-muted-foreground border-border border-t px-3 py-2 text-xs">
              {caption}
              <span className="opacity-70"> · {t('shot.lightboxHint')}</span>
            </div>
          ) : (
            <div className="text-muted-foreground border-border border-t px-3 py-2 text-xs opacity-70">
              {t('shot.lightboxHint')}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="steps-list">
      {items.map((item, i) => (
        <li key={i} className="text-[0.92rem]">
          <span className="bg-primary/10 text-primary ring-primary/25 ring-offset-background z-[1] mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ring-offset-2 backdrop-blur">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-1 leading-relaxed">{item}</div>
        </li>
      ))}
    </ol>
  )
}

export function CodeBlock({
  code,
  lang = 'bash',
}: {
  code: string
  lang?: string
}) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    if (lang === 'text' || lang === 'txt') {
      setHtml(null)
      return
    }
    let alive = true
    highlightCode(code, lang).then(
      (out) => {
        if (alive) setHtml(out)
      },
      () => {
        if (alive) setHtml(null)
      }
    )
    return () => {
      alive = false
    }
  }, [code, lang])

  return (
    <div className="code-block mb-4.5 overflow-hidden rounded-xl border border-black/60 bg-[#22272e] shadow-lg shadow-black/15 dark:border-white/10">
      <div className="flex items-center justify-between border-b border-white/8 bg-white/4 px-3.5 py-2">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="font-mono text-[11px] tracking-wider text-slate-400 uppercase">
            {lang}
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 px-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code)
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            } catch {
              /* ignore */
            }
          }}
        >
          {copied ? <Check className="size-3.5 text-emerald-300" /> : <Copy className="size-3.5" />}
          {copied ? t('common.copied') : t('common.copy')}
        </Button>
      </div>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="m-0 overflow-x-auto p-4 font-mono text-[12.75px] leading-[1.7] text-slate-100">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

type LiveBase = { id: string; name: string; url: string; openai: string; note?: string }

/**
 * Route pills — prefers live `status.api_info` from the backend /api/status,
 * falls back to the static list in siteConfig when the API is unreachable.
 */
export function useLiveBases(): { bases: LiveBase[]; live: boolean } {
  const { status } = useShell()
  const apiInfo = (status as {
    api_info?: Array<{ id?: number; route?: string; url?: string; description?: string }>
  } | null)?.api_info
  const enabled = (status as { api_info_enabled?: boolean } | null)?.api_info_enabled !== false

  if (enabled && Array.isArray(apiInfo) && apiInfo.length) {
    const bases = apiInfo
      .filter((i) => i.url)
      .map((i) => {
        const root = (i.url || '').replace(/\/$/, '')
        return {
          id: String(i.id ?? i.route ?? root),
          name: i.route || root.replace(/^https?:\/\//, ''),
          url: root,
          openai: `${root}/v1`,
          note: i.description,
        }
      })
    if (bases.length) return { bases, live: true }
  }
  return { bases: siteConfig.bases.map((b) => ({ ...b })), live: false }
}

export function BasePills({ openai = true }: { openai?: boolean }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState<string | null>(null)
  const { bases } = useLiveBases()
  return (
    <div className="mb-4.5 flex flex-wrap gap-2">
      {bases.map((b) => {
        const text = openai ? b.openai : b.url
        const isCopied = copied === b.id
        return (
          <button
            key={b.id}
            type="button"
            title={`${t('common.copy')} ${text}`}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text)
                setCopied(b.id)
                setTimeout(() => setCopied(null), 1200)
              } catch {
                /* ignore */
              }
            }}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 font-mono text-[12.5px] transition',
              'border-border bg-card text-foreground shadow-sm hover:border-primary hover:bg-accent'
            )}
          >
            <Badge variant={isCopied ? 'success' : 'secondary'} className="font-sans">
              {isCopied ? t('common.copied') : b.name}
            </Badge>
            <span className="max-w-[min(70vw,280px)] truncate sm:max-w-none">{text}</span>
            <Copy className="text-muted-foreground size-3.5 shrink-0 opacity-60" />
          </button>
        )
      })}
    </div>
  )
}

export function Card({
  to,
  href,
  title,
  desc,
  icon,
}: {
  to?: string
  href?: string
  title: string
  desc: string
  icon?: ReactNode
}) {
  const inner = (
    <UiCard className="group/card hover:border-primary/40 relative h-full overflow-hidden border-border/70 transition-all duration-250 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
      <span className="from-primary/5 via-primary/2 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-250 group-hover/card:opacity-100" />
      <CardHeader className="p-5 pb-1.5">
        {icon ? (
          <span className="bg-primary/10 text-primary mb-2 flex size-9 items-center justify-center rounded-xl shadow-sm [&_svg]:size-4.5">
            {icon}
          </span>
        ) : null}
        <CardTitle className="flex items-center gap-1.5 text-[0.92rem]">
          <span className="group-hover/card:text-primary transition-colors duration-200">{title}</span>
          {href ? (
            <ExternalLink className="text-muted-foreground size-3.5" />
          ) : (
            <ArrowUpRight className="text-muted-foreground size-3.5 -translate-x-0.5 translate-y-0.5 opacity-0 transition-all duration-200 group-hover/card:translate-x-0 group-hover/card:translate-y-0 group-hover/card:opacity-100" />
          )}
        </CardTitle>
        <CardDescription className="text-[12.5px] leading-relaxed">{desc}</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-2" />
    </UiCard>
  )
  if (to) {
    return (
      <Link to={to} className="block no-underline">
        {inner}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block no-underline">
      {inner}
    </a>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}

export function Page({
  title,
  lead,
  children,
}: {
  title: string
  lead?: string
  children: ReactNode
}) {
  return (
    <>
      <h1>{title}</h1>
      {lead ? <p className="lead">{lead}</p> : null}
      {children}
    </>
  )
}

/** Landing hero for the docs home page. */
export function Hero({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow?: string
  title: string
  lead: string
  actions?: ReactNode
}) {
  return (
    <div className="relative mb-10 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-card p-8 shadow-md sm:p-10">
      {/* Background decorative elements */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(color-mix(in_oklab,var(--color-primary)_12%,transparent)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(32rem_16rem_at_75%_-15%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/8 blur-3xl sm:size-64"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-8 bottom-0 size-48 rounded-full bg-accent/40 blur-3xl"
      />
      <div className="relative">
        {eyebrow ? (
          <Badge className="mb-4 gap-1.5 px-3 py-1.5 text-xs font-medium shadow-sm">
            <span className="bg-primary size-1.5 animate-pulse rounded-full" />
            {eyebrow}
          </Badge>
        ) : null}
        <h1 className="!mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{title}</h1>
        <p className="lead !mb-0 max-w-[38rem]">{lead}</p>
        {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  )
}

export function Placeholder({
  title,
  group,
}: {
  title: string
  group: string
}) {
  const { lang } = useI18n()
  const c = pickLang(lang, {
    zh: {
      lead: `本章属于「${group}」。正文待补充 — 在 src/content 中编辑。`,
      todo: '建议结构：概述 → 步骤/参数表 → 示例代码 → 相关链接。',
      overview: '概述',
      body: '在此写清用户场景与前置条件。',
      example: '示例',
      code: '# 在此放配置或 curl 示例',
    },
    en: {
      lead: `This chapter belongs to “${group}”. Body pending — edit it under src/content.`,
      todo: 'Suggested structure: overview → steps / parameter table → sample code → related links.',
      overview: 'Overview',
      body: 'Describe the user scenario and prerequisites here.',
      example: 'Example',
      code: '# put config or curl samples here',
    },
    ru: {
      lead: `Этот раздел относится к «${group}». Текст в разработке — редактируйте в src/content.`,
      todo: 'Рекомендуемая структура: обзор → шаги / таблица параметров → пример кода → ссылки.',
      overview: 'Обзор',
      body: 'Опишите здесь сценарий пользователя и предварительные условия.',
      example: 'Пример',
      code: '# разместите здесь конфиг или пример curl',
    },
    vi: {
      lead: `Chương này thuộc “${group}”. Nội dung đang bổ sung — chỉnh sửa trong src/content.`,
      todo: 'Cấu trúc gợi ý: tổng quan → các bước / bảng tham số → mã ví dụ → liên kết liên quan.',
      overview: 'Tổng quan',
      body: 'Mô tả tình huống người dùng và điều kiện tiên quyết ở đây.',
      example: 'Ví dụ',
      code: '# đặt cấu hình hoặc ví dụ curl ở đây',
    },
  })
  return (
    <Page title={title} lead={c.lead}>
      <Todo>{c.todo}</Todo>
      <h2>{c.overview}</h2>
      <p>{c.body}</p>
      <h2>{c.example}</h2>
      <CodeBlock code={c.code} lang="text" />
    </Page>
  )
}

export function Related({ items }: { items: { to: string; label: string }[] }) {
  const { t } = useI18n()
  return (
    <>
      <h2>{t('client.related')}</h2>
      <ul>
        {items.map((it) => (
          <li key={it.to}>
            <Link to={it.to}>{it.label}</Link>
          </li>
        ))}
      </ul>
    </>
  )
}

/** Shared: protocol base URL cheat sheet — host follows live api_info when available */
export function ProtocolCheatSheet() {
  const { t, lang } = useI18n()
  const { bases, live } = useLiveBases()
  const primary = bases[0]
  const h = pickLang(lang, {
    zh: { proto: '协议', base: 'Base 怎么填', path: '典型路径' },
    en: { proto: 'Protocol', base: 'Base URL to use', path: 'Typical path' },
    ru: { proto: 'Протокол', base: 'Какой Base URL указывать', path: 'Типичный путь' },
    vi: { proto: 'Giao thức', base: 'Base URL cần điền', path: 'Đường dẫn điển hình' },
  })
  const rootNote = pickLang(lang, {
    zh: '（站点根；其他线路同理换主机）',
    en: ' (site root; swap the host for other routes)',
    ru: ' (корень сайта; для других маршрутов замените хост)',
    vi: ' (gốc site; đổi host cho các tuyến khác)',
  })
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>{h.proto}</th>
            <th>{h.base}</th>
            <th>{h.path}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>OpenAI Chat</td>
            <td>
              <code>{primary.openai}</code>
            </td>
            <td>
              <code>/v1/chat/completions</code>
            </td>
          </tr>
          <tr>
            <td>OpenAI Responses</td>
            <td>
              <code>{primary.openai}</code>
            </td>
            <td>
              <code>/v1/responses</code>
            </td>
          </tr>
          <tr>
            <td>Anthropic Messages</td>
            <td>
              <code>{primary.url}</code>
              {rootNote}
            </td>
            <td>
              <code>/v1/messages</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-muted-foreground -mt-2 mb-4 text-xs">
        {live ? t('proto.hostLive') : t('proto.hostFallback')}
      </p>
    </>
  )
}

/** Shared: get a real model id first */
export function ModelIdNote() {
  const { lang } = useI18n()
  return pickLang(lang, {
    zh: (
      <Callout title="模型 ID">
        请使用账号可见的 ID：
        <Link to="/guide/recommended-models">推荐模型表</Link>（定价接口）或{' '}
        <code>GET /v1/models</code>。不要抄文档/博客里的示例名。
      </Callout>
    ),
    en: (
      <Callout title="Model ID">
        Use IDs visible to your account: the{' '}
        <Link to="/guide/recommended-models">recommended models table</Link> (pricing API) or{' '}
        <code>GET /v1/models</code>. Don't copy sample names from docs/blogs.
      </Callout>
    ),
    ru: (
      <Callout title="ID модели">
        Используйте ID, доступные вашему аккаунту:{' '}
        <Link to="/guide/recommended-models">каталог моделей</Link> (API цен) или{' '}
        <code>GET /v1/models</code>. Не копируйте примеры имён из документации или блогов.
      </Callout>
    ),
    vi: (
      <Callout title="ID mô hình">
        Dùng ID mà tài khoản của bạn thấy được:{' '}
        <Link to="/guide/recommended-models">bảng mô hình</Link> (API giá) hoặc{' '}
        <code>GET /v1/models</code>. Đừng chép tên ví dụ từ tài liệu hay blog.
      </Callout>
    ),
  })
}

/** Shared: minimal OpenAI chat curl — host follows live api_info */
export function CurlChatExample({
  model,
}: {
  model?: string
}) {
  const { lang } = useI18n()
  const m =
    model ??
    pickLang(lang, {
      zh: '从 /v1/models 复制',
      en: 'copy from /v1/models',
      ru: 'скопируйте из /v1/models',
      vi: 'sao chép từ /v1/models',
    })
  const { bases } = useLiveBases()
  return (
    <CodeBlock
      code={`curl ${bases[0].openai}/chat/completions \\
  -H "Authorization: Bearer sk-xxxx" \\
  -H "Content-Type: application/json" \\
  -N \\
  -d '{
    "model": "${m}",
    "messages": [{"role":"user","content":"ping"}],
    "max_tokens": 64
  }'`}
    />
  )
}

/** Shared: minimal Anthropic messages curl — host follows live api_info */
export function CurlMessagesExample({
  model,
}: {
  model?: string
}) {
  const { lang } = useI18n()
  const m =
    model ??
    pickLang(lang, {
      zh: '从 /v1/models 复制',
      en: 'copy from /v1/models',
      ru: 'скопируйте из /v1/models',
      vi: 'sao chép từ /v1/models',
    })
  const { bases } = useLiveBases()
  return (
    <CodeBlock
      code={`curl ${bases[0].url}/v1/messages \\
  -H "x-api-key: sk-xxxx" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${m}",
    "max_tokens": 64,
    "messages": [{"role":"user","content":"ping"}]
  }'`}
    />
  )
}

/** Shared: list models curl — host follows live api_info */
export function CurlModelsExample() {
  const { bases } = useLiveBases()
  return (
    <CodeBlock
      code={`curl ${bases[0].openai}/models \\
  -H "Authorization: Bearer sk-xxxx"`}
    />
  )
}

/** Shared: openai auth headers */
export function OpenAIAuthHeaders() {
  return (
    <CodeBlock lang="http" code={`Authorization: Bearer sk-xxxx\nContent-Type: application/json`} />
  )
}

/** Shared: anthropic auth headers */
export function AnthropicAuthHeaders() {
  return (
    <CodeBlock
      lang="http"
      code={`x-api-key: sk-xxxx
anthropic-version: 2023-06-01
Content-Type: application/json`}
    />
  )
}

export function PrerequisiteKey() {
  const { lang } = useI18n()
  return pickLang(lang, {
    zh: (
      <Callout title="前置">
        已登录并充值 · 已创建密钥并选对分组（
        <Link to="/guide/keys">创建密钥</Link>）· 模型 ID 来自{' '}
        <Link to="/guide/recommended-models">推荐模型表</Link> 或 <code>/v1/models</code>
      </Callout>
    ),
    en: (
      <Callout title="Prerequisites">
        Signed in with balance · key created in the right group (
        <Link to="/guide/keys">create a key</Link>) · model IDs from the{' '}
        <Link to="/guide/recommended-models">models table</Link> or <code>/v1/models</code>
      </Callout>
    ),
    ru: (
      <Callout title="Предварительно">
        Вход выполнен, баланс пополнен · ключ создан в нужной группе (
        <Link to="/guide/keys">создать ключ</Link>) · ID моделей из{' '}
        <Link to="/guide/recommended-models">каталога моделей</Link> или <code>/v1/models</code>
      </Callout>
    ),
    vi: (
      <Callout title="Điều kiện trước">
        Đã đăng nhập và nạp tiền · đã tạo key đúng nhóm (
        <Link to="/guide/keys">tạo key</Link>) · ID mô hình lấy từ{' '}
        <Link to="/guide/recommended-models">bảng mô hình</Link> hoặc <code>/v1/models</code>
      </Callout>
    ),
  })
}
