import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Languages,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserRound,
  Wallet,
  X,
} from 'lucide-react'
import {
  absSite,
  docsHref,
  findNavByPath,
  flatNav,
  LANG_META,
  nav,
  siteConfig,
  type NavGroup,
} from '@/config'
import { useShell } from './ShellContext'
import { LANGS, rememberLang, useI18n } from '@/i18n'
import { navTitle } from '@/i18n-nav'
import { DocsSearch, DocsSearchTrigger } from '@/components/DocsSearch'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { simpleMarkdownToHtml } from '@/lib/markdown'
import { sanitizeHtml } from '@/lib/sanitize-html'

function parseBool(raw: unknown, fallback: boolean) {
  if (typeof raw === 'boolean') return raw
  if (typeof raw === 'number') {
    if (raw === 1) return true
    if (raw === 0) return false
    return fallback
  }
  if (typeof raw === 'string') {
    const n = raw.trim().toLowerCase()
    if (n === 'true' || n === '1') return true
    if (n === 'false' || n === '0') return false
  }
  return fallback
}

function parseAccess(raw: unknown, fallback: { enabled: boolean; requireAuth: boolean }) {
  if (raw == null) return { ...fallback }
  if (typeof raw === 'boolean' || typeof raw === 'number' || typeof raw === 'string') {
    return { enabled: parseBool(raw, fallback.enabled), requireAuth: fallback.requireAuth }
  }
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    return {
      enabled: parseBool(o.enabled, fallback.enabled),
      requireAuth: parseBool(o.requireAuth, fallback.requireAuth),
    }
  }
  return { ...fallback }
}

function parseHeaderNavModules(raw: unknown) {
  const result = {
    home: true,
    console: true,
    pricing: { enabled: true, requireAuth: false },
    rankings: { enabled: true, requireAuth: false },
    docs: true,
    about: true,
  }
  if (raw == null || raw === '') return result
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return result
    }
  }
  if (!parsed || typeof parsed !== 'object') return result
  const o = parsed as Record<string, unknown>
  if ('home' in o) result.home = parseBool(o.home, true)
  if ('console' in o) result.console = parseBool(o.console, true)
  if ('docs' in o) result.docs = parseBool(o.docs, true)
  if ('about' in o) result.about = parseBool(o.about, true)
  if ('pricing' in o) result.pricing = parseAccess(o.pricing, result.pricing)
  if ('rankings' in o) result.rankings = parseAccess(o.rankings, result.rankings)
  return result
}

function shellNavTitle(title: string, t: (k: string) => string) {
  const map: Record<string, string> = {
    主页: t('nav.home'),
    控制台: t('nav.console'),
    模型广场: t('nav.pricing'),
    排行榜: t('nav.rankings'),
    文档: t('nav.docs'),
    关于: t('nav.about'),
  }
  return map[title] || title
}

function discStyle(name: string) {

  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return `hsl(${h % 360} ${54 + (h % 8)}% ${52 + ((h >> 4) % 8)}%)`
}

export function PublicHeader() {
  const { t, lang } = useI18n()
  const location = useLocation()
  const {
    brand,
    logo,
    theme,
    setTheme,
    status,
    user,
    noticeHtml,
    noticeUnread,
    markNoticeSeen,
    signOut,
  } = useShell()
  const [scrolled, setScrolled] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [confirmOut, setConfirmOut] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const modules = useMemo(
    () => parseHeaderNavModules(status?.HeaderNavModules),
    [status?.HeaderNavModules]
  )

  const links = useMemo(() => {
    const list: { title: string; href: string; external?: boolean; active?: boolean }[] = []
    if (modules.home !== false) list.push({ title: '主页', href: absSite('/'), external: true })
    if (modules.console !== false)
      list.push({ title: '控制台', href: absSite('/dashboard'), external: true })
    if (modules.pricing.enabled)
      list.push({ title: '模型广场', href: absSite('/pricing'), external: true })
    if (modules.rankings.enabled)
      list.push({ title: '排行榜', href: absSite('/rankings'), external: true })
    if (modules.docs !== false) list.push({ title: '文档', href: '/', active: true })
    if (modules.about !== false)
      list.push({ title: '关于', href: absSite('/about'), external: true })
    return list
  }, [modules])

  const logged = !!user
  const displayName = user?.display_name || user?.username || ''
  const avatarName = user?.username || displayName
  const letter = avatarName.trim().charAt(0).toUpperCase() || '?'

  return (
    <TooltipProvider delayDuration={300}>
      <header className={cn('site-header', scrolled && 'scrolled')} id="site-header">
        <div className="header-shell">
          <nav className="header-nav" aria-label={t('nav.docs')}>
            <a className="group flex shrink-0 items-center gap-2.5 no-underline" href={absSite('/')}>
              <span className="flex size-7 items-center justify-center overflow-hidden rounded-lg transition group-hover:scale-105">
                <img src={logo} alt={brand} className="size-full object-contain" />
              </span>
              <span className="text-foreground text-sm font-semibold tracking-tight">{brand}</span>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {t('nav.docs')}
              </Badge>
            </a>

            <div className="hidden items-center gap-0.5 sm:flex">
              {links.map((l) =>
                l.external ? (
                  <a
                    key={shellNavTitle(l.title, t)}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[13px] font-medium no-underline transition-colors',
                      l.active
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    style={l.active ? { boxShadow: 'inset 0 -2px 0 0 currentColor' } : undefined}
                  >
                    {shellNavTitle(l.title, t)}
                  </a>
                ) : (
                  <Link
                    key={shellNavTitle(l.title, t)}
                    to={l.href}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[13px] font-medium no-underline transition-colors',
                      l.active
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    style={l.active ? { boxShadow: 'inset 0 -2px 0 0 currentColor' } : undefined}
                  >
                    {shellNavTitle(l.title, t)}
                  </Link>
                )
              )}

              <Separator orientation="vertical" className="mx-2 h-4" />

              <DocsSearch />

              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={t('nav.theme')}>
                        <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t('nav.theme')}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuLabel>{t('nav.theme')}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="size-4" /> {t('nav.theme.light')}
                    {theme === 'light' ? <Check className="ml-auto size-4" /> : null}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="size-4" /> {t('nav.theme.dark')}
                    {theme === 'dark' ? <Check className="ml-auto size-4" /> : null}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="size-4" /> {t('nav.theme.system')}
                    {theme === 'system' ? <Check className="ml-auto size-4" /> : null}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>


              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={t('nav.lang')}>
                        <Languages className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t('nav.lang')}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>{t('nav.lang')}</DropdownMenuLabel>
                  {/* Real links, not state toggles: each language is its own URL,
                      so crawlers can follow them and the target page arrives
                      prerendered in that language. */}
                  {LANGS.map((l) => (
                    <DropdownMenuItem key={l.id} asChild>
                      <a
                        href={docsHref(location.pathname, l.id)}
                        hrefLang={LANG_META[l.id].hreflang}
                        lang={LANG_META[l.id].html}
                        className="no-underline"
                        onClick={() => rememberLang(l.id)}
                      >
                        {l.native}
                        {lang === l.id ? <Check className="ml-auto size-4" /> : null}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="relative"
                    aria-label={t('nav.notice')}
                    onClick={() => {
                      setNoticeOpen(true)
                      markNoticeSeen()
                    }}
                  >
                    <Bell className="size-4" />
                    {noticeUnread ? (
                      <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-background" />
                    ) : null}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('nav.notice')}</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="mx-1 h-4" />

              {!logged ? (
                <Button size="sm" asChild>
                  <a href={absSite('/sign-in')} className="no-underline">
                    {t('nav.signin')}
                  </a>
                </Button>
              ) : (
                <DropdownMenu
                  onOpenChange={(open) => {
                    if (!open) setConfirmOut(false)
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="ml-1 flex size-8 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      style={{ background: discStyle(avatarName) }}
                      title={displayName}
                      aria-label={displayName}
                    >
                      {letter}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 px-2 py-2">
                      <div
                        className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ background: discStyle(avatarName) }}
                      >
                        {letter}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{displayName}</div>
                        <div className="text-muted-foreground truncate text-xs">
                          {user?.role === 100
                            ? t('nav.role.super')
                            : user?.role === 10
                              ? t('nav.role.admin')
                              : t('nav.role.user')}
                          {user?.group ? ` · ${user.group}` : ''}
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href={absSite('/profile')} className="no-underline">
                        <UserRound className="size-4" /> {t('nav.profile')}
                        <ExternalLink className="text-muted-foreground ml-auto size-3.5" />
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={absSite('/wallet')} className="no-underline">
                        <Wallet className="size-4" /> {t('nav.wallet')}
                        <ExternalLink className="text-muted-foreground ml-auto size-3.5" />
                      </a>
                    </DropdownMenuItem>
                    {user?.role === 100 ? (
                      <DropdownMenuItem asChild>
                        <a
                          href={absSite('/system-settings/site/system-info')}
                          className="no-underline"
                        >
                          <Settings className="size-4" /> {t('nav.settings')}
                        </a>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      destructive
                      onSelect={(e) => {
                        e.preventDefault()
                        if (!confirmOut) {
                          setConfirmOut(true)
                          setTimeout(() => setConfirmOut(false), 3000)
                        } else {
                          signOut()
                        }
                      }}
                    >
                      <LogOut className="size-4" />
                      {confirmOut ? t('nav.signoutConfirm') : t('nav.signout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:hidden">
              <DocsSearchTrigger />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t('nav.menu')}
                onClick={() => window.dispatchEvent(new CustomEvent('dx-docs-toggle-sidebar'))}
              >
                <Menu className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t('nav.theme')}
                onClick={() =>
                  setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')
                }
              >
                <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              </Button>
              <Button size="sm" asChild>
                <a
                  href={logged ? absSite('/dashboard') : absSite('/sign-in')}
                  className="no-underline"
                >
                  {logged ? t('nav.console') : t('nav.signin')}
                </a>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden p-0">
          <DialogHeader>
            <DialogTitle>{t('nav.notice')}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] px-5 pb-5">
            <div
              className="prose prose-sm dark:prose-invert text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_p]:mb-2.5 [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{
                __html:
                  sanitizeHtml(simpleMarkdownToHtml(noticeHtml)) ||
                  `<p class="text-muted-foreground">${t('nav.noticeEmpty')}</p>`,
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

const SIDEBAR_SCROLL_KEY = 'dx_docs_sidebar_scroll_v1'
const SIDEBAR_OPEN_KEY = 'dx_docs_sidebar_open_v1'

function loadOpenMap(): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(SIDEBAR_OPEN_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    return o && typeof o === 'object' ? o : null
  } catch {
    return null
  }
}

export function DocsSidebar() {
  const { lang, t } = useI18n()
  const location = useLocation()
  const current = findNavByPath(location.pathname)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Remembered collapse state decides which groups render expanded, so it is
  // adopted after mount instead of during the first render — the prerendered
  // HTML cannot know it, and disagreeing about it would fail hydration.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const stored = loadOpenMap()
    if (stored) setOpenMap(stored)
  }, [])

  useEffect(() => {
    const onToggle = () => setMobileOpen((v) => !v)
    window.addEventListener('dx-docs-toggle-sidebar', onToggle)
    return () => window.removeEventListener('dx-docs-toggle-sidebar', onToggle)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    try {
      const y = parseInt(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || '0', 10) || 0
      el.scrollTop = y
    } catch {
      /* ignore */
    }
  }, [location.pathname])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let timer: number | undefined
    const onScroll = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        try {
          sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop || 0))
        } catch {
          /* ignore */
        }
      }, 80)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const isGroupOpen = (g: NavGroup, index: number) => {
    const hasActive = g.items.some((it) => {
      if (it.path === '/') return location.pathname === '/' || location.pathname === ''
      return location.pathname === it.path || location.pathname.replace(/\/$/, '') === it.path
    })
    if (hasActive) return true
    if (Object.prototype.hasOwnProperty.call(openMap, g.id)) return !!openMap[g.id]
    return index === 0
  }

  const toggleGroup = (id: string, willOpen: boolean) => {
    setOpenMap((prev) => {
      const next = { ...prev, [id]: willOpen }
      try {
        localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const sidebarInner = (
    <div className="flex h-full flex-col">
      <div className="text-muted-foreground px-3 pt-3 pb-2 text-[11px] font-semibold tracking-wider uppercase">
        {t('sidebar.catalog')}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 pb-8">
        {nav.map((g, gi) => {
          const open = isGroupOpen(g, gi)
          return (
            <Collapsible
              key={g.id}
              open={open}
              onOpenChange={(v) => toggleGroup(g.id, v)}
              className="mb-1.5"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left text-[11px] font-bold tracking-wider uppercase transition"
                >
                  <span>{navTitle(g.id, lang, g.title)}</span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 shrink-0 opacity-60 transition-transform duration-200',
                      open ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="data-[state=closed]:animate-none">
                <div className="mb-2.5 flex flex-col gap-0.5 pl-1">
                  {g.items.map((it) => {
                    const isActive =
                      it.path === '/'
                        ? location.pathname === '/' || location.pathname === ''
                        : location.pathname === it.path ||
                          location.pathname.replace(/\/$/, '') === it.path
                    return (
                      <Link
                        key={it.id}
                        to={it.path}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => {
                          const el = scrollRef.current
                          if (el) {
                            try {
                              sessionStorage.setItem(
                                SIDEBAR_SCROLL_KEY,
                                String(el.scrollTop || 0)
                              )
                            } catch {
                              /* ignore */
                            }
                          }
                        }}
                        className={cn(
                          'relative rounded-lg px-3 py-1.5 text-[13px] font-medium no-underline transition-colors duration-150',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold before:bg-primary before:absolute before:inset-y-[7px] before:left-0 before:w-[3px] before:rounded-full'
                            : 'text-sidebar-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {navTitle(it.id, lang, it.title)}
                      </Link>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* mobile drawer backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={cn(
          'border-sidebar-border bg-sidebar sticky top-16 z-40 h-[calc(100vh-4rem)] w-[272px] shrink-0 border-r',
          'max-lg:fixed max-lg:top-16 max-lg:left-0 max-lg:z-45 max-lg:w-[min(86vw,300px)] max-lg:shadow-xl max-lg:transition-transform',
          mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-[105%]'
        )}
        aria-label={t('sidebar.catalog')}
      >
        {sidebarInner}
      </aside>
    </>
  )
}

export function DocsFooter() {
  const { brand, logo } = useShell()
  const { t } = useI18n()

  const footerLink = 'text-muted-foreground hover:text-foreground text-[13px] no-underline transition-colors'
  return (
    <footer className="border-border bg-sidebar/60 border-t">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-10 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center overflow-hidden rounded-lg">
                <img src={logo} alt={brand} className="size-full object-contain" />
              </span>
              <span className="text-foreground text-base font-bold tracking-tight">{brand}</span>
            </div>
            <p className="text-muted-foreground mt-3 text-[13px] leading-relaxed">
              {t('footer.tagline')}
            </p>
            <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
              {t('footer.region')}
            </p>
          </div>
          <div>
            <div className="text-foreground mb-3 text-[13px] font-semibold">{t('crumb.docs')}</div>
            <div className="flex flex-col gap-2">
              <Link to="/start/quickstart" className={footerLink}>
                {t('toc.quickstart')}
              </Link>
              <Link to="/guide/recommended-models" className={footerLink}>
                {t('toc.models')}
              </Link>
              <Link to="/guide/multi-protocol" className={footerLink}>
                {t('toc.protocol')}
              </Link>
              <Link to="/guide/errors" className={footerLink}>
                {t('toc.errors')}
              </Link>
            </div>
          </div>
          <div>
            <div className="text-foreground mb-3 text-[13px] font-semibold">{brand}</div>
            <div className="flex flex-col gap-2">
              <a href={absSite('/sign-in')} target="_blank" rel="noopener noreferrer" className={footerLink}>
                {t('footer.signin')}
              </a>
              <a href={absSite('/sign-up')} target="_blank" rel="noopener noreferrer" className={footerLink}>
                {t('footer.signup')}
              </a>
              <a href={absSite('/pricing')} target="_blank" rel="noopener noreferrer" className={footerLink}>
                {t('nav.pricing')}
              </a>
              <a href={absSite('/dashboard')} target="_blank" rel="noopener noreferrer" className={footerLink}>
                {t('nav.console')}
              </a>
            </div>
          </div>
          <div>
            <div className="text-foreground mb-3 text-[13px] font-semibold">{t('footer.support')}</div>
            <div className="flex flex-col gap-2">
              <a href={siteConfig.support.telegram} target="_blank" rel="noopener noreferrer" className={footerLink}>
                Telegram {siteConfig.support.telegramLabel}
              </a>
              <a href={`mailto:${siteConfig.support.email}`} className={footerLink}>
                {siteConfig.support.email}
              </a>
              <a href={absSite('/user-agreement')} target="_blank" rel="noopener noreferrer" className={footerLink}>
                {t('footer.terms')}
              </a>
              <a href={absSite('/privacy-policy')} target="_blank" rel="noopener noreferrer" className={footerLink}>
                {t('footer.privacy')}
              </a>
            </div>
          </div>
        </div>
        <div className="border-border/70 text-muted-foreground mt-9 flex flex-col items-start justify-between gap-2 border-t pt-5 text-xs sm:flex-row sm:items-center">
          {/* Prerendered at build time; a page viewed after New Year would
              otherwise disagree with the static HTML during hydration. */}
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} {brand} · {t('footer.docs')}
          </span>
          <span className="text-muted-foreground/70">
            {t('crumb.docs')} · {siteConfig.siteUrl.replace(/^https?:\/\//, '')}
          </span>
        </div>
      </div>
    </footer>
  )
}

export function BreadcrumbBar() {
  const location = useLocation()
  const item = findNavByPath(location.pathname)
  const { lang, t } = useI18n()
  // Hide breadcrumb on homepage — the Hero is self-explanatory
  const isHome = location.pathname === '/' || location.pathname === '' || location.pathname === '/index.html'
  if (isHome) return null
  return (
    <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-1.5 text-xs">
      <Link to="/" className="text-muted-foreground hover:text-foreground no-underline">
        {t('crumb.docs')}
      </Link>
      {item ? (
        <>
          <ChevronRight className="size-3 opacity-50" />
          <span>{navTitle(item.groupId, lang, item.groupTitle)}</span>
          <ChevronRight className="size-3 opacity-50" />
          <span className="text-foreground font-medium">{navTitle(item.id, lang, item.title)}</span>
        </>
      ) : null}
    </div>
  )
}

export function PagerBar() {
  const location = useLocation()
  const { lang, t } = useI18n()
  const list = flatNav()
  const item = findNavByPath(location.pathname)
  // No pager on a URL that is not a page: falling back to the index put a
  // "next: quickstart" card under the not-found notice, as if the visitor were
  // reading the first page of the docs.
  const idx = item ? list.findIndex((it) => it.path === item.path) : -1
  if (idx < 0) return null
  const prev = list[idx - 1]
  const next = list[idx + 1]
  return (
    <div className="border-border mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          to={prev.path}
          className="hover:border-primary/40 group rounded-xl border border-border bg-card p-4 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="text-muted-foreground mb-1.5 flex items-center gap-1 text-[11px] font-medium tracking-wide uppercase">
            <ChevronLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {t('pager.prev')} · {navTitle(prev.groupId, lang, prev.groupTitle)}
          </div>
          <div className="text-foreground group-hover:text-primary text-sm font-semibold transition-colors">
            {navTitle(prev.id, lang, prev.title)}
          </div>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to={next.path}
          className="hover:border-primary/40 group rounded-xl border border-border bg-card p-4 text-right no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="text-muted-foreground mb-1.5 flex items-center justify-end gap-1 text-[11px] font-medium tracking-wide uppercase">
            {t('pager.next')} · {navTitle(next.groupId, lang, next.groupTitle)}
            <ChevronRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
          <div className="text-foreground group-hover:text-primary text-sm font-semibold transition-colors">
            {navTitle(next.id, lang, next.title)}
          </div>
        </Link>
      ) : null}
    </div>
  )
}

// re-export for App convenience
export { X }
